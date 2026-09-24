import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createDecipheriv, timingSafeEqual } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { createHelocApplicationPdf, PdfApplicationError } from '../netlify/functions/lib/heloc-application-pdf.mjs';

// Entirely synthetic fixtures, including an intentionally invalid SSN. The
// PDF renderer is not the application's eligibility or SSN validation layer.
const PASSWORD = 'Synthetic-Only-PDF-Password-2026';
const applicant = (changes = {}) => ({ full_name: 'Sample Applicant', dob: '1990-01-02', ssn: '000-00-0000', address: '123 Example Street', unit: 'Unit 1', city: 'Example City', state: 'GA', zip: '00000', w2_income: '120000.50', ...changes });
const application = (changes = {}) => ({ application_type: 'single', applicants: [applicant()], subject_property: {address:'987 Investment Road',unit:'Unit 2',city:'Atlanta',state:'GA',zip:'30301'}, reference: 'HL-SYNTHETIC-000001', received_at: '2026-09-22T17:00:00.000Z', ...changes });
const hexEntry = (pdf, key) => {
  const match = pdf.toString('latin1').match(new RegExp(`/${key} <([a-f0-9]+)>`));
  assert.ok(match, `Expected encryption entry ${key}`);
  return Buffer.from(match[1], 'hex');
};
const sha256 = (...parts) => createHash('sha256').update(Buffer.concat(parts)).digest();

// Independently verify the PDF revision 5 user-password authentication and
// unwrap the actual file key using Node crypto, without trusting PDFKit.
function openKey(pdf, password) {
  const user = hexEntry(pdf, 'U');
  assert.equal(user.length, 48);
  const encoded = Buffer.from(password, 'utf8');
  const digest = sha256(encoded, user.subarray(32, 40));
  if (!timingSafeEqual(digest, user.subarray(0, 32))) return null;
  const key = sha256(encoded, user.subarray(40, 48));
  const decipher = createDecipheriv('aes-256-cbc', key, Buffer.alloc(16));
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(hexEntry(pdf, 'UE')), decipher.final()]);
}

function decryptStringObject(pdf, key, property) {
  const text = pdf.toString('latin1');
  const ref = text.match(new RegExp(`/${property} (\\d+) 0 R`));
  assert.ok(ref);
  const object = text.match(new RegExp(`(?:^|\\n)${ref[1]} 0 obj\\s*\\(([\\s\\S]*?)\\)\\s*endobj`));
  assert.ok(object);
  // PDFKit emits encrypted metadata as binary literal strings, with the PDF
  // syntax characters escaped. Decode that syntax before AES decryption.
  const unescaped = [];
  for (let i = 0; i < object[1].length; i++) {
    let character = object[1][i];
    if (character === '\\') {
      character = object[1][++i];
      character = ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' })[character] || character;
    }
    unescaped.push(character.charCodeAt(0));
  }
  const bytes = Buffer.from(unescaped);
  const decipher = createDecipheriv('aes-256-cbc', key, bytes.subarray(0, 16));
  return Buffer.concat([decipher.update(bytes.subarray(16)), decipher.final()]).toString('utf8');
}

test('application PDFs require the correct password and use AES-256 content encryption', async () => {
  const pdf = await createHelocApplicationPdf(application(), PASSWORD);
  assert.ok(Buffer.isBuffer(pdf));
  assert.ok(pdf.length > 1000 && pdf.length < 1024 * 1024);
  const bytes = pdf.toString('latin1');
  assert.match(bytes, /^%PDF-1\.7/);
  assert.match(bytes, /\/Filter \/Standard\s+\/V 5\s+\/Length 256/);
  assert.match(bytes, /\/CFM \/AESV3/);
  assert.match(bytes, /\/R 5\s/);
  assert.match(bytes, /\/Encrypt \d+ 0 R/);
  assert.equal(openKey(pdf, ''), null);
  assert.equal(openKey(pdf, 'Incorrect-Synthetic-Password-2026'), null);
  const fileKey = openKey(pdf, PASSWORD);
  assert.equal(fileKey.length, 32);
  assert.equal(decryptStringObject(pdf, fileKey, 'Title'), 'Stonehaven HELOC application');
  assert.equal(decryptStringObject(pdf, fileKey, 'Author'), 'Stonehaven Lending');
  const streamStart = pdf.indexOf(Buffer.from('\nstream\n'));
  assert.ok(streamStart > 0);
  const lengths = [...pdf.subarray(0, streamStart).toString('latin1').matchAll(/\/Length (\d+)/g)];
  const streamLength = Number(lengths.at(-1)[1]);
  const encryptedStream = pdf.subarray(streamStart + 8, streamStart + 8 + streamLength);
  const streamCipher = createDecipheriv('aes-256-cbc', fileKey, encryptedStream.subarray(0, 16));
  const pageCommands = inflateSync(Buffer.concat([streamCipher.update(encryptedStream.subarray(16)), streamCipher.final()])).toString('latin1');
  assert.match(pageCommands, /\bBT\b/);
  assert.match(pageCommands, /\bTJ\b/);
  for (const value of ['Sample Applicant', '000-00-0000', '1990-01-02', '123 Example Street', PASSWORD]) assert.ok(!bytes.includes(value), 'Sensitive data must not occur as plaintext in the output');
});

test('each document gets independent encryption salts and a random owner password', async () => {
  const first = await createHelocApplicationPdf(application(), PASSWORD);
  const second = await createHelocApplicationPdf(application(), PASSWORD);
  assert.notDeepEqual(hexEntry(first, 'O'), hexEntry(second, 'O'));
  assert.notDeepEqual(hexEntry(first, 'U'), hexEntry(second, 'U'));
  assert.notDeepEqual(openKey(first, PASSWORD), openKey(second, PASSWORD));
});

test('single and joint applications produce one page per applicant plus a subject property page', async () => {
  for (const count of [1, 2]) {
    const pdf = await createHelocApplicationPdf(application({ application_type: count === 2 ? 'joint' : 'single', applicants: Array.from({ length: count }, () => applicant()) }), PASSWORD);
    assert.equal([...pdf.toString('latin1').matchAll(/\/Type \/Page\s/g)].length, count + 1);
  }
});

test('maximum supported field lengths remain bounded on one page', async () => {
  const longest = applicant({ full_name: 'W'.repeat(120), address: 'W'.repeat(180), unit: 'W'.repeat(80), city: 'W'.repeat(100), w2_income: '99999999999.99' });
  const pdf = await createHelocApplicationPdf(application({ applicants: [longest] }), PASSWORD);
  assert.equal([...pdf.toString('latin1').matchAll(/\/Type \/Page\s/g)].length, 2);
  assert.ok(pdf.length < 1024 * 1024);
});

test('embedded font supports international names and rejects missing glyphs without altering a name', async () => {
  const pdf = await createHelocApplicationPdf(application({ applicants: [applicant({ full_name: 'Zoë García Élodie Łukasz Αλέξανδρος Марія' })] }), PASSWORD);
  assert.match(pdf.toString('latin1'), /\/FontFile2/);
  await assert.rejects(createHelocApplicationPdf(application({ applicants: [applicant({ full_name: 'Sample 李' })] }), PASSWORD), error => {
    assert.ok(error instanceof PdfApplicationError);
    assert.equal(error.code, 'PDF_UNSUPPORTED_CHARACTER');
    assert.equal(error.field, 'full_name');
    assert.equal(error.applicantIndex, 0);
    assert.ok(!error.message.includes('李'));
    return true;
  });
});

test('weak-length, whitespace and overlong passwords fail closed', async () => {
  for (const password of ['', undefined, 'short', 'A'.repeat(23), 'A'.repeat(121), ' '.repeat(24), 'é'.repeat(24), 'A'.repeat(25) + '\n']) {
    await assert.rejects(createHelocApplicationPdf(application(), password), error => error.code === 'PDF_PASSWORD_INVALID');
  }
});

test('renderer rejects invalid shape, excess applicants, oversized fields and control characters', async () => {
  for (const input of [null, application({ application_type: 'other' }), application({ applicants: [] }), application({ applicants: [applicant(), applicant()] }), application({ application_type: 'joint', applicants: [applicant()] }), application({ reference: '../not-a-reference' }), application({ received_at: 'not-a-date' }), application({ applicants: [applicant({ full_name: 'X'.repeat(121) })] }), application({ applicants: [applicant({ full_name: 'Sample\nApplicant' })] }), application({ applicants: [applicant({ city: 'City\u202e' })] }), application({ applicants: [applicant({ dob: '1990-02-30' })] }), application({ applicants: [applicant({ w2_income: 'Infinity' })] })]) {
    await assert.rejects(createHelocApplicationPdf(input, PASSWORD), error => error.code === 'PDF_INPUT_INVALID');
  }
});

test('the renderer has no plaintext-file output or logging path', () => {
  const source = readFileSync(new URL('../netlify/functions/lib/heloc-application-pdf.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /writeFile|createWriteStream|console\.(?:log|error|warn|debug)|fetch\(/);
});

const python = [process.env.PDF_TEST_PYTHON, 'python3', '/Users/c/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3'].filter(Boolean).find(command => spawnSync(command, ['-c', 'import pypdf; from cryptography.hazmat.primitives.ciphers import Cipher'], { stdio: 'ignore', timeout: 5000 }).status === 0);

test('independent PDF reader decrypts all fields for both applicants and refuses a wrong password', { skip: !python && 'Optional pypdf plus cryptography not installed; Node AES authentication tests still run.' }, async () => {
  const first = applicant({ full_name: 'Zoë García', city: 'São Paulo' });
  const second = applicant({ full_name: 'Sample Coapplicant', dob: '1989-12-31', address: '987 Another Example Road', unit: '', city: 'Example Town', state: 'FL', zip: '00000-0000', w2_income: '0' });
  const pdf = await createHelocApplicationPdf(application({ application_type: 'joint', applicants: [first, second] }), PASSWORD);
  const script = `
import base64, io, json, sys
from pypdf import PdfReader
payload = json.load(sys.stdin)
data = base64.b64decode(payload['pdf'])
wrong = PdfReader(io.BytesIO(data))
wrong_rejected = wrong.decrypt('Wrong-Synthetic-Password') == 0
reader = PdfReader(io.BytesIO(data))
encrypted = reader.is_encrypted
correct = reader.decrypt(payload['password']) != 0
texts = [p.extract_text() for p in reader.pages]
matched = all(all(value in texts[i] for value in values) for i, values in enumerate(payload['expected']))
metadata = reader.metadata
static_metadata = metadata['/Title'] == 'Stonehaven HELOC application' and metadata['/Author'] == 'Stonehaven Lending'
print(json.dumps({'encrypted': encrypted, 'wrong_rejected': wrong_rejected, 'correct': correct, 'pages': len(texts), 'fields_match': matched, 'static_metadata': static_metadata}))
`;
  const result = spawnSync(python, ['-c', script], { input: JSON.stringify({ pdf: pdf.toString('base64'), password: PASSWORD, expected: [['Zoë García', '01/02/1990', '000-00-0000', '123 Example Street', 'Unit 1', 'São Paulo, GA 00000', '$120,000.50'], ['Sample Coapplicant', '12/31/1989', '000-00-0000', '987 Another Example Road', 'Example Town, FL 00000-0000', '$0.00'], ['987 Investment Road','Unit 2','Atlanta, GA 30301']] }), encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024 });
  assert.equal(result.status, 0, 'Independent PDF reader must finish successfully');
  assert.deepEqual(JSON.parse(result.stdout), { encrypted: true, wrong_rejected: true, correct: true, pages: 3, fields_match: true, static_metadata: true });
});

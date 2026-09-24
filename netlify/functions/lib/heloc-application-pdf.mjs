import { validateSubjectProperty } from '../../../js/heloc-application-validation.mjs';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PDFDocument } from 'pdfkit';

const MAX_PDF_BYTES = 1024 * 1024;
const FONT_FILE = new URL('./fonts/NotoSans.ttf', import.meta.url);
const LIMITS = { full_name: 120, address: 180, unit: 80, city: 100 };
let fontPromise;

// No input values belong in errors: callers may safely return the field identifier.
export class PdfApplicationError extends Error {
  constructor(code, field, applicantIndex) {
    super('The protected application document could not be prepared.');
    this.name = 'PdfApplicationError';
    this.code = code;
    if (field !== undefined) this.field = field;
    if (applicantIndex !== undefined) this.applicantIndex = applicantIndex;
  }
}

function reject(field, applicantIndex, code = 'PDF_INPUT_INVALID') {
  throw new PdfApplicationError(code, field, applicantIndex);
}

async function fontBytes() {
  // Netlify's bundler relocates this module. included_files preserves the second
  // path in the deployed function; the URL works in the unbundled source tree.
  fontPromise ||= readFile(FONT_FILE).catch(() => readFile(resolve('netlify/functions/lib/fonts/NotoSans.ttf')));
  return fontPromise;
}

function textValue(input, key, limit, index, optional = false) {
  const value = Object.hasOwn(input, key) ? input[key] : optional ? '' : undefined;
  if (typeof value !== 'string' || value.length > limit || /[\p{Cc}\p{Cf}]/u.test(value)) reject(key, index);
  const normalized = value.trim().normalize('NFC');
  if (!normalized && !optional) reject(key, index);
  return normalized;
}

function validatedInput(input) {
  if (!input || typeof input !== 'object' || !['single', 'joint'].includes(input.application_type)) reject('application_type');
  const expected = input.application_type === 'joint' ? 2 : 1;
  if (!Array.isArray(input.applicants) || input.applicants.length !== expected) reject('applicants');
  if (typeof input.reference !== 'string' || !/^[A-Za-z0-9_-]{8,80}$/.test(input.reference)) reject('reference');
  if (typeof input.received_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(input.received_at) || Number.isNaN(Date.parse(input.received_at))) reject('received_at');
  if (!input.subject_property || Object.keys(validateSubjectProperty(input.subject_property)).length) reject('subject_property');
  const subject_property = Object.fromEntries(['address','unit','city','state','zip'].map(key => [key, textValue(input.subject_property, key, {address:180,unit:80,city:100,state:2,zip:10}[key], undefined, key === 'unit')]));
  const applicants = input.applicants.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) reject('applicants', index);
    const result = Object.fromEntries(Object.entries(LIMITS).map(([key, limit]) => [key, textValue(entry, key, limit, index, key === 'unit')]));
    result.dob = textValue(entry, 'dob', 10, index);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(result.dob)) reject('dob', index);
    const birthDate = new Date(`${result.dob}T12:00:00Z`);
    if (Number.isNaN(birthDate.getTime()) || birthDate.toISOString().slice(0, 10) !== result.dob) reject('dob', index);
    result.ssn = textValue(entry, 'ssn', 11, index);
    if (!/^(?:\d{9}|\d{3}-\d{2}-\d{4})$/.test(result.ssn)) reject('ssn', index);
    result.state = textValue(entry, 'state', 2, index);
    if (!/^[A-Z]{2}$/.test(result.state)) reject('state', index);
    result.zip = textValue(entry, 'zip', 10, index);
    if (!/^\d{5}(?:-\d{4})?$/.test(result.zip)) reject('zip', index);
    result.w2_income = textValue(entry, 'w2_income', 24, index);
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(result.w2_income)) reject('w2_income', index);
    const income = Number(result.w2_income.replaceAll(',', ''));
    if (!Number.isSafeInteger(Math.round(income * 100)) || income > 99999999999.99) reject('w2_income', index);
    return result;
  });
  return { application_type: input.application_type, applicants, subject_property, reference: input.reference, received_at: input.received_at };
}

function assertFontSupport(doc, applicants) {
  // This is the fontkit object held by the pinned PDFKit EmbeddedFont class.
  // Fail closed if an upgrade changes this API rather than substituting glyphs.
  const font = doc._font?.font;
  if (typeof font?.hasGlyphForCodePoint !== 'function') throw new PdfApplicationError('PDF_FONT_UNAVAILABLE');
  for (const [index, applicant] of applicants.entries()) {
    for (const field of Object.keys(LIMITS)) {
      for (const character of applicant[field]) {
        if (!font.hasGlyphForCodePoint(character.codePointAt(0))) reject(field, index, 'PDF_UNSUPPORTED_CHARACTER');
      }
    }
  }
}

function field(doc, label, value, x, y, width) {
  doc.fontSize(8.5).fillColor('#536575').text(label, x, y, { width, lineBreak: false });
  doc.fontSize(11.5).fillColor('#102D43');
  const options = { width, lineGap: 2.5 };
  const height = doc.heightOfString(value, options);
  doc.text(value, x, y + 17, options);
  return y + 17 + height + 14;
}

function drawApplicant(doc, applicant, index, application) {
  doc.addPage();
  const left = 48;
  const width = 516;
  doc.rect(0, 0, 612, 9).fill('#B18A43');
  doc.fontSize(20).fillColor('#102D43').text('STONEHAVEN', left, 43, { width });
  doc.fontSize(9).fillColor('#806020').text('L E N D I N G', left, 73, { width });
  doc.fontSize(22).fillColor('#102D43').text('HELOC application details', left, 103, { width });
  doc.fontSize(9).fillColor('#536575').text(`Reference: ${application.reference}`, left, 145, { width });
  const timestamp = new Date(application.received_at).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  doc.text(`Received: ${timestamp}`, left, 163, { width });
  doc.roundedRect(left, 190, width, 32, 4).fill('#F2EFE8');
  doc.fontSize(10.5).fillColor('#102D43').text(`${application.application_type === 'joint' ? 'Joint' : 'Single'} application | Applicant ${index + 1} of ${application.applicants.length}`, left + 12, 199, { width: width - 24 });

  let y = field(doc, 'Full legal name', applicant.full_name, left, 239, width);
  const birthday = `${applicant.dob.slice(5, 7)}/${applicant.dob.slice(8, 10)}/${applicant.dob.slice(0, 4)}`;
  const ssn = applicant.ssn.replaceAll('-', '').replace(/^(\d{3})(\d{2})(\d{4})$/, '$1-$2-$3');
  const birthEnd = field(doc, 'Date of birth (MM/DD/YYYY)', birthday, left, y, 240);
  const ssnEnd = field(doc, 'Social Security number', ssn, left + 276, y, 240);
  y = Math.max(birthEnd, ssnEnd);
  y = field(doc, 'Current street address', applicant.address, left, y, width);
  if (applicant.unit) y = field(doc, 'Apartment / unit', applicant.unit, left, y, width);
  y = field(doc, 'City / state / ZIP code', `${applicant.city}, ${applicant.state} ${applicant.zip}`, left, y, width);
  const income = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(Number(applicant.w2_income.replaceAll(',', '')));
  y = field(doc, 'Annual income - W2/Self-employment before taxes (USD)', income, left, y, width);
  if (y > 688) throw new PdfApplicationError('PDF_LAYOUT_OVERFLOW');

  doc.moveTo(left, 704).lineTo(left + width, 704).lineWidth(0.5).strokeColor('#D6DDE2').stroke();
  doc.fontSize(8).fillColor('#536575').text('Confidential borrower information. Share only through an approved protected channel.', left, 716, { width, lineGap: 2 });
  doc.text('Borrower-supplied details. This document is not a credit authorization or loan approval.', left, 731, { width, lineGap: 2 });
  doc.text(`Stonehaven Lending | Page ${index + 1} of ${application.applicants.length + 1}`, left, 751, { width, align: 'right', lineBreak: false });
}

/**
 * Produces only an AES-256 encrypted PDF Buffer, never a plaintext file.
 * The password is an independently provisioned server secret, not a borrower
 * identifier. PDF permission flags are viewer hints, not a security boundary.
 */
export async function createHelocApplicationPdf(input, password) {
  // PDF 1.7 extension 3 truncates passwords at 127 UTF-8 bytes. ASCII bounds
  // deliberately exclude that truncation and PDF password normalization cases.
  if (typeof password !== 'string' || !/^[\x21-\x7e]{24,120}$/.test(password)) throw new PdfApplicationError('PDF_PASSWORD_INVALID');
  const application = validatedInput(input);
  const font = await fontBytes();
  return new Promise((resolveBuffer, rejectBuffer) => {
    let doc;
    const chunks = [];
    let total = 0;
    let failed = false;
    const fail = error => {
      if (failed) return;
      failed = true;
      chunks.length = 0;
      rejectBuffer(error instanceof PdfApplicationError ? error : new PdfApplicationError('PDF_GENERATION_FAILED'));
      if (doc && !doc.destroyed) doc.destroy();
    };
    try {
      doc = new PDFDocument({
        font: null,
        autoFirstPage: false,
        size: 'LETTER',
        margins: { top: 42, right: 48, bottom: 28, left: 48 },
        pdfVersion: '1.7ext3',
        userPassword: password,
        ownerPassword: randomBytes(48).toString('base64url'),
        permissions: { printing: 'highResolution', copying: false, modifying: false, annotating: false, fillingForms: false, contentAccessibility: true, documentAssembly: false },
        compress: true,
        info: { Title: 'Stonehaven HELOC application', Author: 'Stonehaven Lending', Subject: 'Confidential borrower information', Creator: 'Stonehaven Lending', Keywords: '' },
      });
      doc.on('error', fail);
      doc.on('data', chunk => {
        if (failed) return;
        total += chunk.length;
        if (total > MAX_PDF_BYTES) return fail(new PdfApplicationError('PDF_SIZE_EXCEEDED'));
        chunks.push(chunk);
      });
      doc.on('end', () => {
        if (failed) return;
        resolveBuffer(Buffer.concat(chunks, total));
        chunks.length = 0;
      });
      doc.registerFont('Application', font).font('Application');
      assertFontSupport(doc, application.applicants);
      for (const [index, applicant] of application.applicants.entries()) drawApplicant(doc, applicant, index, application);
      const property=application.subject_property;
      assertFontSupport(doc, [{...property,full_name:'Subject property'}]);
      doc.addPage();
      doc.rect(0,0,612,9).fill('#B18A43');
      doc.fontSize(20).fillColor('#102D43').text('STONEHAVEN',48,43,{width:516});
      doc.fontSize(22).text('HELOC subject property',48,103,{width:516});
      doc.fontSize(9).fillColor('#536575').text(`Reference: ${application.reference}`,48,145,{width:516});
      doc.text('Property securing the requested HELOC. May differ from the current home address.',48,175,{width:516});
      let y=field(doc,'Subject property street address',property.address,48,239,516);
      if(property.unit)y=field(doc,'Apartment / unit',property.unit,48,y,516);
      y=field(doc,'City / state / ZIP code',`${property.city}, ${property.state} ${property.zip}`,48,y,516);
      if(y>688)throw new PdfApplicationError('PDF_LAYOUT_OVERFLOW');
      doc.fontSize(8).fillColor('#536575').text('Confidential borrower information. Share only through an approved protected channel.',48,716,{width:516});
      doc.text(`Stonehaven Lending | Page ${application.applicants.length+1} of ${application.applicants.length+1}`,48,751,{width:516,align:'right',lineBreak:false});
      doc.end();
    } catch (error) {
      fail(error);
    }
  });
}

// Local draft validation only. Production must repeat validation server-side.
export const states = [['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming']];
export function realDate(value, today = new Date().toISOString().slice(0,10)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || value < '1900-01-01' || value > today) return false;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value;
}
export function validSsn(value) {
  if (!/^(?:\d{9}|\d{3}-\d{2}-\d{4})$/.test(value || '')) return false;
  const n = value.replaceAll('-', '');
  return !/^(000|666|9)/.test(n) && n.slice(3,5) !== '00' && n.slice(5) !== '0000';
}
export function validateApplicant(a, today) {
  const errors = {};
  const safeText = value => typeof value === 'string' && !/[\p{Cc}\p{Cf}]/u.test(value);
  if (!safeText(a.full_name) || !/\p{L}/u.test(a.full_name) || a.full_name.trim().length > 120) errors.full_name = 'Enter the applicant’s full legal name.';
  if (!realDate(a.dob, today)) errors.dob = 'Enter a valid date of birth that is not in the future.';
  if (!validSsn(a.ssn)) errors.ssn = 'Enter a valid 9-digit Social Security number.';
  if (!safeText(a.address) || !/[\p{L}\p{N}]/u.test(a.address) || a.address.trim().length < 3 || a.address.length > 180) errors.address = 'Enter the applicant’s current street address.';
  if (a.unit && (!safeText(a.unit) || a.unit.length > 80)) errors.unit = 'Check the apartment or unit.';
  if (!safeText(a.city) || !/\p{L}/u.test(a.city) || a.city.length > 100) errors.city = 'Enter the city.';
  if (!states.some(([code])=>code===a.state)) errors.state = 'Choose a state.';
  if (!/^\d{5}(?:-\d{4})?$/.test(a.zip || '')) errors.zip = 'Enter a 5-digit ZIP code or ZIP+4.';
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(a.w2_income || '') || !Number.isSafeInteger(Math.round(Number(a.w2_income.replaceAll(',',''))*100))) errors.w2_income = 'Enter annual W-2 income before taxes. Enter 0 if none.';
  return errors;
}
export function maskSsn(value) { return '•••-••-' + value.replaceAll('-','').slice(-4); }

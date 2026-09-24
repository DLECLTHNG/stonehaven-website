import {states, validateApplicant, maskSsn, validateSubjectProperty} from './heloc-application-validation.mjs';

const form = document.querySelector('#application-form');
const outerFields = document.querySelector('#application-fields');
const review = document.querySelector('#review');
const summary = document.querySelector('#error-summary');
const keys = ['full_name','dob','ssn','address','unit','city','state','zip','w2_income'];
const labels = {full_name:'Full legal name',dob:'Date of birth',ssn:'Social Security number',address:'Street address',unit:'Apartment or unit',city:'City',state:'State',zip:'ZIP code',w2_income:'Annual income – W2/Self-employment before taxes'};
const addressKeys = ['address','unit','city','state','zip'];
const endpoint = '/api/heloc-application';
let ready = false, sending = false, pending = null;

function field(prefix, key, options = {}) {
  const id = `${prefix}-${key}`;
  const hint = options.hint ? `<p class="field-hint" id="${id}-hint">${options.hint}</p>` : '';
  const described = `${id}-error${hint ? ` ${id}-hint` : ''}`;
  const required = key === 'unit' ? '' : ' required';
  let control;
  if (key === 'state') {
    control = `<select id="${id}" name="${id}" aria-describedby="${described}" required><option value="">Select state</option>${states.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select>`;
  } else {
    const type = key === 'dob' ? 'date' : key === 'ssn' ? 'password' : 'text';
    const mode = key === 'ssn' || key === 'zip' ? ' inputmode="numeric"' : key === 'w2_income' ? ' inputmode="decimal"' : '';
    const max = {full_name:120,ssn:11,address:180,unit:80,city:100,zip:10,w2_income:18}[key];
    const attrs = key === 'dob' ? ' min="1900-01-01"' : '';
    const input = `<input id="${id}" name="${id}" type="${type}"${mode}${max ? ` maxlength="${max}"` : ''}${attrs}${required} autocomplete="off" spellcheck="false" aria-describedby="${described}">`;
    control = key === 'ssn' ? `<div class="password-control">${input}<button type="button" data-show="${id}" aria-controls="${id}" aria-label="Show applicant ${prefix==='primary'?'1':'2'} Social Security number" aria-pressed="false">Show</button></div>` : key === 'w2_income' ? `<div class="income-control"><span aria-hidden="true">$</span>${input}</div>` : input;
  }
  return `<div class="field${options.wide ? ' wide' : ''}"${addressKeys.includes(key) ? ' data-address-field' : ''}><label for="${id}">${labels[key]}${key==='unit'?' <span class="optional">(optional)</span>':''}</label>${control}${hint}<p id="${id}-error" class="field-error"></p></div>`;
}

function applicantCard(prefix, number) {
  return `<section class="card" id="${prefix}-card" aria-labelledby="${prefix}-heading"${prefix==='joint'?' hidden':''}><div class="section-top"><span class="section-number">0${number+1}</span><div><h2 id="${prefix}-heading">Applicant ${number}</h2><p>${number===1?'Start with your legal name and personal details.':'Add the second applicant’s own details.'}</p></div></div><fieldset class="field-grid" id="${prefix}-fields"${prefix==='joint'?' disabled':''}><legend class="sr-only">Applicant ${number} information</legend>${field(prefix,'full_name',{wide:true})}${field(prefix,'dob')}${field(prefix,'ssn',{hint:'9 digits. Hidden while you type.'})}<h3 class="group-heading">Current home address</h3>${prefix==='joint'?'<label class="same-address wide"><input type="checkbox" id="same-address">Same current address as applicant 1</label>':''}${field(prefix,'address',{wide:true})}${field(prefix,'unit',{wide:true})}${field(prefix,'city')}${field(prefix,'state')}${field(prefix,'zip')}<h3 class="group-heading">Annual income</h3>${field(prefix,'w2_income',{wide:true,hint:'Include W2 wages and self-employment income before taxes, not take-home pay. Enter 0 if none.'})}</fieldset></section>`;
}
document.querySelector('#applicant-fields').innerHTML = applicantCard('primary',1)+applicantCard('joint',2);
document.querySelector('#subject-property-fields').innerHTML = `<section class="card" aria-labelledby="subject-heading"><div class="section-top"><div><h2 id="subject-heading">Subject property</h2><p>Enter the property you want to use for this HELOC. It may differ from your current home address.</p></div></div><fieldset class="field-grid"><legend class="sr-only">Subject property address</legend><label class="same-address wide"><input type="checkbox" id="subject-same-address">Same as applicant 1’s current home address</label>${addressKeys.map(key=>field('subject',key,{wide:key==='address'||key==='unit'})).join('')}</fieldset></section>`;
const jointFields = document.querySelector('#joint-fields');
const sameAddress = document.querySelector('#same-address');
const subjectSameAddress = document.querySelector('#subject-same-address');
const get = (prefix,key) => document.getElementById(`${prefix}-${key}`);
const isJoint = () => form.elements.application_type.value === 'joint';

function hideSsn(prefix) {
  get(prefix,'ssn').type = 'password';
  const button = document.querySelector(`[data-show="${prefix}-ssn"]`);
  button.textContent = 'Show';
  button.setAttribute('aria-pressed','false');
  button.setAttribute('aria-label',`Show applicant ${prefix==='primary'?'1':'2'} Social Security number`);
}
function clearErrors() {
  summary.replaceChildren(); summary.hidden = true;
  document.querySelectorAll('.field-error').forEach(node=>{node.textContent='';});
  form.querySelectorAll('[aria-invalid]').forEach(node=>node.removeAttribute('aria-invalid'));
}
function updateAddress() {
  jointFields.querySelectorAll('[data-address-field]').forEach(wrapper=>{
    const input=wrapper.querySelector('input,select');
    wrapper.hidden=sameAddress.checked;
    input.disabled=sameAddress.checked;
    if (sameAddress.checked) input.value='';
  });
}
function syncSubjectAddress() {
  if (subjectSameAddress.checked) addressKeys.forEach(key=>{get('subject',key).value=get('primary',key).value;});
}
subjectSameAddress.addEventListener('change',()=>{syncSubjectAddress();clearErrors();});
addressKeys.forEach(key=>{
  for(const event of ['input','change']) {
    get('primary',key).addEventListener(event,syncSubjectAddress);
    get('subject',key).addEventListener(event,()=>{subjectSameAddress.checked=false;});
  }
});
function updateType() {
  const joint = isJoint();
  document.querySelector('#joint-card').hidden = !joint;
  jointFields.disabled = !joint;
  if (!joint) {
    keys.forEach(key=>{get('joint',key).value='';});
    sameAddress.checked=false; updateAddress(); hideSsn('joint');
  }
  clearErrors();
}
function applicant(prefix) {
  const values=Object.fromEntries(keys.map(key=>[key,get(prefix,key).value.trim()]));
  if (prefix==='joint' && sameAddress.checked) addressKeys.forEach(key=>{values[key]=get('primary',key).value.trim();});
  return values;
}
function showReview(applicants) {
  const subject_property=Object.fromEntries(addressKeys.map(key=>[key,get('subject',key).value.trim()]));
  const data={application_type:isJoint()?'joint':'single',applicants,subject_property};
  if (!pending || JSON.stringify(data)!==JSON.stringify({application_type:pending.application_type,applicants:pending.applicants,subject_property:pending.subject_property})) pending={request_id:crypto.randomUUID(),...data};
  const content=document.querySelector('#review-details'); content.replaceChildren();
  const type=document.createElement('p'); type.textContent=isJoint()?'Joint application · Two applicants':'Individual application · One applicant';content.append(type);
  applicants.forEach((person,index)=>{
    const heading=document.createElement('h3');heading.textContent=`Applicant ${index+1}`;content.append(heading);
    const list=document.createElement('dl');
    const [year,month,day]=person.dob.split('-');
    const rows=[['Full legal name',person.full_name],['Date of birth',`${month}/${day}/${year}`],['Social Security number',maskSsn(person.ssn)],['Current home address',[person.address,person.unit,`${person.city}, ${person.state} ${person.zip}`].filter(Boolean).join('\n')],['Annual income – W2/Self-employment',new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2}).format(Number(person.w2_income.replaceAll(',',''))) + ' before taxes']];
    rows.forEach(([label,value])=>{const row=document.createElement('div'),term=document.createElement('dt'),description=document.createElement('dd');term.textContent=label;description.textContent=value;row.append(term,description);list.append(row);});
    content.append(list);
  });
  const propertyHeading=document.createElement('h3');propertyHeading.textContent='Subject property';
  const propertyAddress=document.createElement('p');propertyAddress.textContent=[subject_property.address,subject_property.unit,`${subject_property.city}, ${subject_property.state} ${subject_property.zip}`].filter(Boolean).join(', ');
  content.append(propertyHeading,propertyAddress);
  hideSsn('primary');hideSsn('joint');
  form.hidden=true; review.hidden=false;
  document.querySelector('#step-details').removeAttribute('aria-current');document.querySelector('#step-review').setAttribute('aria-current','step');
  document.querySelector('#review-heading').focus();
}
form.addEventListener('submit',event=>{
  event.preventDefault();
  if (!ready || sending) return;
  syncSubjectAddress();
  clearErrors(); hideSsn('primary'); hideSsn('joint');
  const prefixes=isJoint()?['primary','joint']:['primary'];
  const applicants=prefixes.map(applicant);
  prefixes.forEach((prefix,index)=>{
    Object.entries(validateApplicant(applicants[index])).forEach(([key,error])=>{
      // A shared invalid address is already reported under the primary applicant.
      if (prefix==='joint' && sameAddress.checked && addressKeys.includes(key)) return;
      get(prefix,key).setAttribute('aria-invalid','true');document.querySelector(`#${prefix}-${key}-error`).textContent=error;
      const link=document.createElement('a');link.href=`#${prefix}-${key}`;link.textContent=`Applicant ${index+1}: ${error}`;
      link.addEventListener('click',e=>{e.preventDefault();get(prefix,key).focus();});summary.append(link);
    });
  });
  const property=Object.fromEntries(addressKeys.map(key=>[key,get('subject',key).value.trim()]));
  Object.entries(validateSubjectProperty(property)).forEach(([key,error])=>{
    get('subject',key).setAttribute('aria-invalid','true');document.querySelector(`#subject-${key}-error`).textContent=error;
    const link=document.createElement('a');link.href=`#subject-${key}`;link.textContent=`Subject property: ${error}`;
    link.addEventListener('click',e=>{e.preventDefault();get('subject',key).focus();});summary.append(link);
  });
  if (summary.childElementCount) {summary.hidden=false;summary.focus();return;}
  showReview(applicants);
});
form.querySelectorAll('[name="application_type"]').forEach(radio=>radio.addEventListener('change',updateType));
sameAddress.addEventListener('change',()=>{updateAddress();clearErrors();});
document.querySelectorAll('[data-show]').forEach(button=>button.addEventListener('click',()=>{
  const input=document.getElementById(button.dataset.show),show=input.type==='password';input.type=show?'text':'password';button.textContent=show?'Hide':'Show';button.setAttribute('aria-pressed',String(show));button.setAttribute('aria-label',`${show?'Hide':'Show'} applicant ${input.id.startsWith('primary')?'1':'2'} Social Security number`);
}));
document.querySelector('#edit-details').addEventListener('click',()=>{review.hidden=true;document.querySelector('#review-details').replaceChildren();form.hidden=false;document.querySelector('#step-review').removeAttribute('aria-current');document.querySelector('#step-details').setAttribute('aria-current','step');get('primary','full_name').focus();});
function reset() {
  pending=null;
  document.querySelector('#confirmation').hidden=true;
  document.querySelector('#receipt').textContent='';
  document.querySelector('.steps').hidden=false;
  form.reset();addressKeys.forEach(key=>{get('subject',key).value='';});keys.forEach(key=>{get('primary',key).value='';get('joint',key).value='';});
  review.hidden=true;document.querySelector('#review-details').replaceChildren();form.hidden=false;
  document.querySelector('#step-review').removeAttribute('aria-current');document.querySelector('#step-details').setAttribute('aria-current','step');
  hideSsn('primary');hideSsn('joint');updateType();
}
window.addEventListener('pagehide',reset);
window.addEventListener('pageshow',event=>{if(event.persisted)reset();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){hideSsn('primary');hideSsn('joint');}});
get('primary','dob').max=get('joint','dob').max=new Date().toISOString().slice(0,10);
reset();
const sendButton=document.querySelector('#send-application');
const editButton=document.querySelector('#edit-details');
const status=document.querySelector('#delivery-status');
sendButton.addEventListener('click',async()=>{
  if (!ready || sending || !pending) return;
  sending=true; sendButton.disabled=true;editButton.disabled=true;
  sendButton.textContent='Submitting…';status.hidden=true;
  try {
    const response=await fetch(endpoint,{method:'POST',credentials:'omit',cache:'no-store',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify(pending),signal:AbortSignal.timeout(25000)});
    const data=await response.json();
    if (!response.ok || data.ok!==true || typeof data.reference!=='string') {
      let message='We could not confirm delivery. Keep this page open and try again, or contact your advisor. Do not email your personal details.';
      if(response.status===400 || response.status===422)message='Please edit your details and check each applicant’s information. Contact your advisor if a name or address uses characters this form cannot process.';
      if(response.status===409)message='Please contact your advisor before trying again. Delivery needs to be checked for this reference.';
      if(response.status===429)message='Please wait a minute before trying again.';
      const failure=new Error('Application delivery failed');failure.userMessage=message;throw failure;
    }
    reset();form.hidden=true;review.hidden=true;
    document.querySelector('#confirmation').hidden=false;
    document.querySelector('#receipt').textContent=data.reference;
    document.querySelector('.steps').hidden=true;
    document.querySelector('#confirmation-heading').focus();
  } catch(error) {
    status.textContent=(error.userMessage || 'We could not confirm delivery. Keep this page open and try again, or contact your advisor. Do not email your personal details.')+(pending?` Reference: ${pending.request_id}`:'');
    status.hidden=false;status.focus();
  } finally {sending=false;sendButton.disabled=!ready;editButton.disabled=false;sendButton.textContent='Submit application';}
});
// No tracking, generic Netlify forms, browser persistence, or sensitive URLs.
// Enable collection only when the isolated server-side delivery is configured.
try {
  const response=await fetch(endpoint,{credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)});
  const data=await response.json();ready=response.ok && data.ready===true && !!crypto.randomUUID;
} catch {ready=false;}
outerFields.disabled=!ready;sendButton.disabled=!ready;
document.querySelector('#unavailable').hidden=ready;
if(!ready)document.querySelector('#unavailable').textContent='This application form is temporarily unavailable. Please contact your Stonehaven advisor. Do not send your Social Security number by email or text.';

const DEFAULTS = __DEFAULTS__;
const MAX_UPLOAD_BYTES = 500 * 1024;
const form = document.querySelector('#signatureForm');
const preview = document.querySelector('#preview');
const htmlOutput = document.querySelector('#htmlOutput');
const status = document.querySelector('#status');
const schoolLogoUpload = document.querySelector('#schoolLogo');
let schoolLogoDataUrl = '';

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
}
function lines(value, max) { return String(value || '').split(/\r?\n/).map(v => v.trim()).filter(Boolean).slice(0, max); }
function mailto(email) { const safe = escapeHtml(email); return safe ? `<a href="mailto:${safe}" style="color:#005387;text-decoration:none;">${safe}</a>` : ''; }
function website(url) { const safe = escapeHtml(url); return safe ? `<a href="${safe}" style="color:#005387;text-decoration:none;">${safe.replace(/^https?:\/\//, '')}</a>` : ''; }
function textRow(content, options = {}) {
  const weight = options.weight || 'normal';
  const size = options.size || '13px';
  return content ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:${size};line-height:18px;color:#1f2937;font-weight:${weight};">${content}</div>` : '';
}
function spacerRow() {
  return '<div style="font-size:6px;line-height:6px;height:6px;mso-line-height-rule:exactly;">&nbsp;</div>';
}

function resolveLogoPath(path) {
  if (!path) return '';
  try {
    return new URL(path, window.location.origin + '/').href;
  } catch (_) {
    return path;
  }
}
function buildSignature() {
  const data = new FormData(form);
  const address = lines(data.get('schoolAddress'), 4).map(escapeHtml);
  const contactRows = [
    textRow(data.get('schoolTelephone') ? `t: ${escapeHtml(data.get('schoolTelephone'))}` : ''),
    textRow(data.get('workEmail') ? `e: ${mailto(data.get('workEmail'))}` : ''),
    textRow(data.get('schoolWebsite') ? `w: ${website(data.get('schoolWebsite'))}` : '')
  ].filter(Boolean);
  const parts = [
    textRow(escapeHtml(data.get('displayName')), {weight: '700', size: '15px'}),
    textRow(escapeHtml(data.get('jobTitle1')), {weight: '700'}),
    textRow(escapeHtml(data.get('jobTitle2')), {weight: '700'}),
    address.length ? spacerRow() : '',
    ...address.map(line => textRow(line)),
    address.length && contactRows.length ? spacerRow() : '',
    ...contactRows
  ].join('');
  const schoolLogoSrc = schoolLogoDataUrl || DEFAULTS.schoolLogoPath;
  const logo = schoolLogoSrc ? `<img src="${escapeHtml(schoolLogoSrc)}" alt="" role="presentation" width="110" style="display:block;border:0;outline:none;text-decoration:none;max-width:110px;height:auto;margin:0 auto 10px;">` : '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td style="padding:0 18px 0 0;vertical-align:top;">${parts}</td><td style="border-left:2px solid #c8d2dc;width:1px;font-size:0;line-height:0;">&nbsp;</td><td style="padding:0 0 0 18px;vertical-align:middle;text-align:center;">${logo}</td></tr></table>`;
}
function render() { const html = buildSignature(); preview.innerHTML = html; htmlOutput.value = html; }
function setDefaults() {
  form.schoolAddress.value = DEFAULTS.schoolAddress.join('\n');
  form.schoolTelephone.value = DEFAULTS.schoolTelephone;
  form.schoolWebsite.value = DEFAULTS.schoolWebsite;
}
function handleLogoUpload(input, setDataUrl) {
  status.textContent = '';
  setDataUrl('');
  const file = input.files[0];
  if (!file) return render();
  if (!['image/jpeg','image/png'].includes(file.type) || file.size > MAX_UPLOAD_BYTES) {
    input.value = '';
    status.innerHTML = '<span class="error">Please choose one JPG or PNG image up to 500KB.</span>';
    return render();
  }
  const reader = new FileReader();
  reader.onload = event => { setDataUrl(event.target.result); render(); };
  reader.readAsDataURL(file);
}
schoolLogoUpload.addEventListener('change', () => handleLogoUpload(schoolLogoUpload, value => { schoolLogoDataUrl = value; }));
form.addEventListener('input', render);
document.querySelector('#copySignature').addEventListener('click', async () => {
  const html = buildSignature();
  try {
    await navigator.clipboard.write([new ClipboardItem({'text/html': new Blob([html], {type:'text/html'}), 'text/plain': new Blob([preview.innerText], {type:'text/plain'})})]);
    status.textContent = 'Signature copied. Paste it into Outlook signature settings.';
  } catch (_) {
    htmlOutput.select(); document.execCommand('copy'); status.textContent = 'HTML copied. If Outlook needs rich formatting, copy from the preview instead.';
  }
});
document.querySelector('#resetDefaults').addEventListener('click', () => { setDefaults(); render(); });
setDefaults(); render();

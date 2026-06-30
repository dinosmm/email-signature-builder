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
function absoluteWebsiteUrl(url) {
  const value = String(url || '').trim();
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
function website(url) {
  const href = absoluteWebsiteUrl(url);
  const safeHref = escapeHtml(href);
  const safeDisplay = escapeHtml(href.replace(/^https?:\/\//i, ''));
  return safeHref ? `<a href="${safeHref}" style="color:#005387;text-decoration:none;">${safeDisplay}</a>` : '';
}
function resolveAssetUrl(path) {
  try {
    return new URL(path, document.baseURI).href;
  } catch (_) {
    return path;
  }
}
function textRow(content, weight='normal') { return content ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#1f2937;font-weight:${weight};">${content}</div>` : ''; }
function buildSignature() {
  const data = new FormData(form);
  const address = lines(data.get('schoolAddress'), 4).map(escapeHtml);
  const parts = [
    textRow(escapeHtml(data.get('displayName')), '700'),
    textRow(escapeHtml(data.get('jobTitle1'))),
    textRow(escapeHtml(data.get('jobTitle2'))),
    ...address.map(line => textRow(line)),
    textRow(escapeHtml(data.get('schoolTelephone'))),
    textRow(mailto(data.get('workEmail'))),
    textRow(website(data.get('schoolWebsite')))
  ].join('');
  const logoSrc = schoolLogoDataUrl || resolveAssetUrl(DEFAULTS.schoolLogoPath || 'assets/school-logo.png');
  const logo = `<img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(DEFAULTS.schoolLogoAlt)}" width="100" style="display:block;border:0;outline:none;text-decoration:none;max-width:100px;height:auto;margin:0 auto;">`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td style="padding:0 18px 0 0;vertical-align:top;">${parts}</td><td style="border-left:2px solid #c8d2dc;width:1px;font-size:0;line-height:0;">&nbsp;</td><td style="padding:0 0 0 18px;vertical-align:middle;text-align:center;">${logo}</td></tr></table>`;
}
function render() { const html = buildSignature(); preview.innerHTML = html; htmlOutput.value = html; }
function setDefaults() {
  form.schoolAddress.value = DEFAULTS.schoolAddress.join('\n');
  form.schoolTelephone.value = DEFAULTS.schoolTelephone;
  form.schoolWebsite.value = DEFAULTS.schoolWebsite;
}
function resetToDefaults() {
  form.reset();
  schoolLogoDataUrl = '';
  schoolLogoUpload.value = '';
  status.textContent = '';
  setDefaults();
  render();
}
schoolLogoUpload.addEventListener('change', () => {
  status.textContent = '';
  schoolLogoDataUrl = '';
  const file = schoolLogoUpload.files[0];
  if (!file) return render();
  if (!['image/jpeg','image/png'].includes(file.type) || file.size > MAX_UPLOAD_BYTES) {
    schoolLogoUpload.value = '';
    status.innerHTML = '<span class="error">Please choose one JPG or PNG image up to 500KB.</span>';
    return render();
  }
  const reader = new FileReader();
  reader.onload = event => { schoolLogoDataUrl = event.target.result; render(); };
  reader.readAsDataURL(file);
});
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
document.querySelector('#resetDefaults').addEventListener('click', resetToDefaults);
setDefaults(); render();

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const appSource = fs.readFileSync('public/app.js', 'utf8');
const sandbox = {
  window: { SIGNATURE_DEFAULTS: { schoolAddress: [], schoolTelephone: '', schoolWebsite: '', schoolLogoPath: 'assets/school-logo.png' } },
  document: {
    baseURI: 'https://signature.example/index.html',
    querySelector(selector) {
      if (selector === '#signatureForm') return { addEventListener() {}, reset() {}, schoolAddress: {}, schoolTelephone: {}, schoolWebsite: {} };
      if (selector === '#schoolLogo') return { addEventListener() {}, value: '', files: [] };
      if (selector === '#copySignature' || selector === '#resetDefaults') return { addEventListener() {} };
      return { innerHTML: '', value: '', textContent: '' };
    }
  },
  navigator: { clipboard: { write() {} } },
  ClipboardItem: function ClipboardItem() {},
  Blob: function Blob() {},
  FormData: function FormData() { return { get() { return ''; } }; },
  FileReader: function FileReader() {}
};
vm.createContext(sandbox);
vm.runInContext(appSource, sandbox);

assert.strictEqual(sandbox.absoluteWebsiteUrl('www.example-school.org'), 'https://www.example-school.org');
assert.strictEqual(sandbox.absoluteWebsiteUrl('https://www.example-school.org'), 'https://www.example-school.org');
assert.strictEqual(sandbox.absoluteWebsiteUrl('HTTP://www.example-school.org'), 'HTTP://www.example-school.org');
assert.strictEqual(
  sandbox.website('www.example-school.org'),
  '<a href="https://www.example-school.org" style="color:#005387;text-decoration:none;">www.example-school.org</a>'
);
assert.strictEqual(
  sandbox.website('https://www.example-school.org'),
  '<a href="https://www.example-school.org" style="color:#005387;text-decoration:none;">www.example-school.org</a>'
);
console.log('website-url tests passed');

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

for (const language of ['', 'es/']) {
  test(`${language || 'en/'}program calculator boots after its deferred dependency`, () => {
    const html = readFileSync(`${language}dscr-program-calculator.html`, 'utf8');
    assert.match(html, /<script src="[^"\s]*dscr-programs\.js[^"\s]*" defer><\/script>/);
    const ready = [], nodes = {};
    function element(value = '') {
      return {
        value, style: {}, handlers: {}, textContent: '', innerHTML: '',
        classList: { toggle() {}, add() {} },
        addEventListener(name, handler) { this.handlers[name] = handler; },
        querySelectorAll() { return []; },
        appendChild(option) { if (!this.value) this.value = String(option.value); }
      };
    }
    for (const match of html.matchAll(/<[a-z][^>]*\bid="([^"]+)"[^>]*>/g)) {
      nodes[match[1]] = element(match[0].match(/\bvalue="([^"]*)"/)?.[1]);
    }
    for (const match of html.matchAll(/<select[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)) {
      nodes[match[1]].value = match[2].match(/<option[^>]*value="([^"]*)"/)?.[1] || '';
    }
    const document = {
      getElementById: id => nodes[id] || null,
      querySelectorAll: () => [],
      createElement: () => element(),
      addEventListener(name, handler) { if (name === 'DOMContentLoaded') ready.push(handler); }
    };
    const window = {};
    const context = vm.createContext({ document, window, sessionStorage: { setItem() {} } });
    // Run every inline script with strict missing-node lookup. A copied analyzer
    // script used to throw because its controls do not exist on this page.
    for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) vm.runInContext(match[1], context);
    assert.equal(nodes['pc-units'].innerHTML, '', 'setup waits until deferred bundles have loaded');
    window.SH_DSCRP = require('../js/dscr-programs.js');
    context.SH_DSCRP = window.SH_DSCRP;
    ready.forEach(handler => handler());
    assert.match(nodes['pc-units'].innerHTML, /data-f="market"/);
    assert.equal(nodes['p-r-pay'].textContent, '$2,360');
    assert.equal(nodes['p-r-ltv'].textContent, '75.0%');
    assert.equal(nodes['p-count'].value, '1');
  });
}

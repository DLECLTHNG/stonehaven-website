import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const loader = readFileSync('js/home-vendors.js', 'utf8');
const pixel = readFileSync('js/chatgpt-pixel.js', 'utf8');
function fixture() {
  const scripts = [], events = new Map(), frames = [];
  const document = { readyState: 'interactive', hidden: false,
    body: { getAttribute: () => null }, createElement: () => ({}),
    head: { appendChild: script => scripts.push(script) } };
  const window = { addEventListener: (event, cb) => events.set(event, cb),
    removeEventListener: event => events.delete(event), requestAnimationFrame: cb => frames.push(cb) };
  const context = { window, document, navigator: {}, Promise, Set,
    setTimeout: cb => { const timer = setTimeout(cb, 1000); timer.unref(); return timer; } };
  vm.runInNewContext(loader, context);
  return { scripts, events, frames, window, context };
}
test('homepage vendor downloads follow load and a paint without losing queued events', () => {
  const f = fixture();
  vm.runInNewContext(pixel, f.context);
  assert.equal(f.scripts.length, 0);
  assert.equal(f.window.oaiq.q[1][1], 'page_viewed');
  f.events.get('load')();
  f.frames.shift()();
  assert.equal(f.scripts.length, 0);
  f.frames.shift()();
  assert.equal(f.scripts.length, 1);
  assert.equal(f.scripts[0].fetchPriority, 'low');
  assert.equal(f.window.oaiq.q[0][0], 'init');
  assert.equal(f.window.oaiq.q[1][1], 'page_viewed');
});
test('an early accepted conversion flushes the SDK and preserves one conversion', async () => {
  const f = fixture();
  vm.runInNewContext(pixel, f.context);
  const pending = f.window.shChatGPTLead('accepted-early');
  assert.equal(f.scripts.length, 1);
  assert.equal(f.window.oaiq.q[2][1], 'lead_created');
  f.scripts[0].onload(); await pending;
  await f.window.shChatGPTLead('accepted-early');
  assert.equal(f.window.oaiq.q.length, 3);
  f.events.get('load')(); f.frames.shift()(); f.frames.shift()();
  assert.equal(f.scripts.length, 1);
});
test('interaction flushes once and subsequently registered vendors load normally', () => {
  const f = fixture();
  const first = { src: '/one.js' }, second = { src: '/two.js' };
  f.window.shLoadMarketingScript(first);
  f.events.get('pointerdown')();
  f.window.shLoadMarketingScript(second);
  f.window.shFlushMarketingScripts();
  assert.deepEqual(f.scripts, [first, second]);
  assert.equal(f.events.has('pointerdown'), false);
});

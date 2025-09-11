import assert from 'node:assert';
import fs from 'node:fs';
import vm from 'node:vm';

// Minimal DOM stub with classList support
class ClassList {
  constructor() { this.set = new Set(); }
  toggle(cls, on) { on ? this.set.add(cls) : this.set.delete(cls); }
  contains(cls) { return this.set.has(cls); }
}
const document = { documentElement: { classList: new ClassList() } };

// Extract applyUiPrefs from app.js
const src = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const match = src.match(/function applyUiPrefs\(\)\{[\s\S]*?\n\}/);
if (!match) throw new Error('applyUiPrefs not found');
const context = { document, state: { ui: { dark: false, reduceMotion: false, highContrast: false } } };
vm.runInNewContext(match[0], context);

// When all preferences enabled, corresponding classes should exist
context.state.ui = { dark: true, reduceMotion: true, highContrast: true };
context.applyUiPrefs();
assert.ok(document.documentElement.classList.contains('dark'));
assert.ok(document.documentElement.classList.contains('hc'));
assert.ok(document.documentElement.classList.contains('reduce'));

// Disabling preferences removes classes
context.state.ui = { dark: false, reduceMotion: false, highContrast: false };
context.applyUiPrefs();
assert.ok(!document.documentElement.classList.contains('dark'));
assert.ok(!document.documentElement.classList.contains('hc'));
assert.ok(!document.documentElement.classList.contains('reduce'));

console.log('applyUiPrefs tests passed');


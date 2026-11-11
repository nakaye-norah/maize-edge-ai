/* MaizeScan decision logic. Pure functions only, so they can be unit-tested in Node.
 *
 * The model output is ONE vector of length 1 + K:
 *   output[0]      = leaf-check score (probability that the image is a maize leaf)
 *   output[1..K]   = disease probabilities, in the order of config.classes
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MaizeLogic = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function argmax(a) {
    let best = 0;
    for (let i = 1; i < a.length; i++) if (a[i] > a[best]) best = i;
    return best;
  }

  /** Turn a (possibly smoothed) model output into a UI decision. */
  function decide(output, cfg) {
    const K = cfg.classes.length;
    if (!output || output.length < 1 + K) return { state: 'error', reason: 'bad_output' };
    for (let i = 0; i < 1 + K; i++) {
      if (!Number.isFinite(output[i])) return { state: 'error', reason: 'nan_output' };
    }
    const gate = output[0];
    const probs = Array.prototype.slice.call(output, 1, 1 + K);
    const idx = argmax(probs);
    const base = { gate, probs, idx, label: cfg.classes[idx], conf: probs[idx] };

    if (gate < cfg.gate_threshold) return Object.assign({ state: 'not_maize' }, base);
    if (base.conf < cfg.min_disease_confidence) return Object.assign({ state: 'uncertain' }, base);
    return Object.assign({ state: 'maize' }, base);
  }

  /** Average the last N model outputs so the display does not flicker. */
  class Smoother {
    constructor(n) { this.n = Math.max(1, n | 0); this.buf = []; }
    push(output) {
      this.buf.push(Array.from(output));
      if (this.buf.length > this.n) this.buf.shift();
    }
    mean() {
      if (!this.buf.length) return null;
      const len = this.buf[0].length, m = new Array(len).fill(0);
      for (const o of this.buf) for (let i = 0; i < len; i++) m[i] += o[i];
      return m.map(v => v / this.buf.length);
    }
    reset() { this.buf = []; }
  }

  return { argmax, decide, Smoother };
});

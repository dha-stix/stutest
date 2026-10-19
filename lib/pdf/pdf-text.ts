/*
 * jsPDF's built-in Helvetica only covers the WinAnsi character set. Anything outside it
 * (arrows, maths symbols, Greek letters, subscripts) would print as garbage, so it is
 * rewritten into readable ASCII before drawing.
 */

const REPLACEMENTS: Record<string, string> = {
  "→": "->", "←": "<-", "↔": "<->", "⇒": "=>", "⇐": "<=", "⇔": "<=>", "↑": "^", "↓": "v",
  "≤": "<=", "≥": ">=", "≠": "!=", "≈": "~", "≡": "==", "∝": "proportional to", "∞": "infinity",
  "√": "sqrt", "∑": "sum", "∏": "product", "∫": "integral", "∂": "d", "∆": "Delta", "∇": "nabla",
  "∈": "in", "∉": "not in", "∩": "intersect", "∪": "union", "⊂": "subset of", "∅": "empty set",
  "∀": "for all", "∃": "there exists", "∴": "therefore", "·": "·", "−": "-", "‐": "-", "‑": "-",
  "′": "'", "″": "\"", "✓": "(yes)", "✔": "(yes)", "✗": "(no)", "✘": "(no)", "★": "*", "☆": "*",
  "α": "alpha", "β": "beta", "γ": "gamma", "δ": "delta", "ε": "epsilon", "ζ": "zeta", "η": "eta",
  "θ": "theta", "ι": "iota", "κ": "kappa", "λ": "lambda", "μ": "mu", "ν": "nu", "ξ": "xi", "π": "pi",
  "ρ": "rho", "σ": "sigma", "ς": "sigma", "τ": "tau", "υ": "upsilon", "φ": "phi", "χ": "chi",
  "ψ": "psi", "ω": "omega", "Γ": "Gamma", "Δ": "Delta", "Θ": "Theta", "Λ": "Lambda", "Π": "Pi",
  "Σ": "Sigma", "Φ": "Phi", "Ψ": "Psi", "Ω": "Omega",
  "Ł": "L", "ł": "l", "Đ": "D", "đ": "d", "ı": "i", "Ħ": "H", "ħ": "h",
};

const SUBSCRIPTS = "₀₁₂₃₄₅₆₇₈₉";
const SUPERSCRIPTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

/** Characters 0x80–0x9F in WinAnsi that Helvetica can draw. */
const WIN_ANSI_EXTRAS = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ");

export function pdfSafe(text: string): string {
  let out = "";
  for (const ch of text.normalize("NFC")) {
    const code = ch.codePointAt(0)!;
    if (REPLACEMENTS[ch] !== undefined) {
      const rep = REPLACEMENTS[ch];
      // Word replacements (alpha, Delta…) need spaces so "Δψ" reads "Delta psi", not "Deltapsi".
      const isWord = /^[A-Za-z]{2,}/.test(rep);
      out += (isWord && /[A-Za-z0-9]$/.test(out) ? " " : "") + rep + (isWord ? "\u0000" : "");
    }
    else if (SUBSCRIPTS.includes(ch)) out += SUBSCRIPTS.indexOf(ch);
    else if (SUPERSCRIPTS.includes(ch) && ch !== "²" && ch !== "³" && ch !== "¹") out += `^${SUPERSCRIPTS.indexOf(ch)}`;
    else if (ch === "\u00a0" || ch === "\u2009" || ch === "\u202f") out += " ";
    else if (/[\u200b-\u200d\ufeff]/.test(ch)) continue;
    else if (code <= 0xff || WIN_ANSI_EXTRAS.has(ch)) out += ch;
    else {
      // Accented letters outside Latin-1 (e.g. ő, ł): drop the accent; anything else becomes "?".
      const base = ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      out += base.length === 1 && base.codePointAt(0)! <= 0xff ? base : "?";
    }
  }
  // \u0000 marks the end of a word replacement: add a space only if a letter follows.
  return out.replace(/\u0000(?=[A-Za-z0-9])/g, " ").replace(/\u0000/g, "").replace(/[ \t]+/g, " ").trim();
}

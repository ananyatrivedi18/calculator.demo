/**
 * script.js — EngCalc Pro Frontend Logic
 * Covers: Basic Calc · Scientific Calc · Unit Converter · Equation Solver · History
 * Uses: Fetch API to backend, localStorage fallback for history
 */

"use strict";

/* ════════════════════════════════════════════════════════════════
   0.  UTILITY HELPERS
   ════════════════════════════════════════════════════════════════ */

/** Show a brief toast notification */
function showToast(msg, duration = 2200) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.remove("show"), duration);
}

/** Copy text to clipboard, then show toast */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  } catch {
    showToast("Copy failed — try manually");
  }
}

/* ════════════════════════════════════════════════════════════════
   1.  THEME TOGGLE
   ════════════════════════════════════════════════════════════════ */

const THEME_KEY = "engcalc_theme";
const themeToggleBtn = document.getElementById("themeToggle");
const themeIcon       = themeToggleBtn.querySelector(".theme-icon");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☀" : "☾";
  localStorage.setItem(THEME_KEY, theme);
}

// Load saved theme (default: dark)
applyTheme(localStorage.getItem(THEME_KEY) || "dark");

themeToggleBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

/* ════════════════════════════════════════════════════════════════
   2.  TAB NAVIGATION
   ════════════════════════════════════════════════════════════════ */

const tabBtns   = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

function switchTab(targetId) {
  tabBtns.forEach(btn => {
    const active = btn.dataset.tab === targetId;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active);
  });

  tabPanels.forEach(panel => {
    const show = panel.id === `tab-${targetId}`;
    panel.hidden = !show;
    if (show) panel.classList.add("active");
    else       panel.classList.remove("active");
  });

  // Refresh history when that tab is activated
  if (targetId === "history") loadHistory();
}

tabBtns.forEach(btn =>
  btn.addEventListener("click", () => switchTab(btn.dataset.tab))
);

/* ════════════════════════════════════════════════════════════════
   3.  BASIC CALCULATOR
   ════════════════════════════════════════════════════════════════ */

const basicDisplay    = document.getElementById("basicDisplay");
const basicExpression = document.getElementById("basicExpression");
const copyBasicBtn    = document.getElementById("copyBasic");

// State
let basicState = {
  current:    "0",      // number being entered
  expression: "",       // the full expression string shown above display
  operator:   null,     // pending operator
  prev:       null,     // previous operand
  justCalced: false,    // whether last action was "="
};

/** Evaluate expression: replace display symbols with JS operators */
function evalBasicExpression(exprStr) {
  // Replace typographic operators with JS equivalents
  const safe = exprStr
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/−/g, "-");

  // Safety: only allow numbers, operators, dots, and parentheses
  if (!/^[\d+\-*/.()\s]+$/.test(safe)) return "Error";

  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${safe})`)();
    if (!isFinite(result)) return "Error";
    // Round to 12 sig figures to avoid floating point drift
    return parseFloat(result.toPrecision(12)).toString();
  } catch {
    return "Error";
  }
}

function updateBasicDisplay() {
  basicDisplay.textContent = basicState.current;
  basicExpression.textContent = basicState.expression;
  basicDisplay.classList.remove("error");
  if (basicState.current === "Error") basicDisplay.classList.add("error");
}

function basicDigit(d) {
  if (basicState.justCalced) {
    basicState.expression = "";
    basicState.justCalced = false;
  }
  if (basicState.current === "0" && d !== ".") {
    basicState.current = d;
  } else if (basicState.current.length >= 16) {
    return; // max input length
  } else {
    basicState.current += d;
  }
  updateBasicDisplay();
}

function basicDecimal() {
  if (basicState.justCalced) { basicState.current = "0"; basicState.justCalced = false; }
  if (!basicState.current.includes(".")) basicState.current += ".";
  updateBasicDisplay();
}

function basicOperator(op) {
  if (basicState.current === "Error") return;
  basicState.justCalced = false;

  // If there's a pending expression, evaluate it first
  if (basicState.expression !== "" && !basicState.justCalced) {
    const prev = basicState.expression + basicState.current;
    const r = evalBasicExpression(prev);
    basicState.expression = r + " " + op + " ";
    basicState.current = r;
  } else {
    basicState.expression = basicState.current + " " + op + " ";
  }
  basicState.prev = basicState.current;
  basicState.current = "0";
  updateBasicDisplay();
}

function basicEquals() {
  if (basicState.expression === "") return;
  const full = basicState.expression + basicState.current;
  const result = evalBasicExpression(full);

  // Save to history
  saveToHistory(full + " =", result, "basic");

  basicExpression.textContent = full + " =";
  basicState.current    = result;
  basicState.expression = "";
  basicState.justCalced = true;

  // Animate the display
  basicDisplay.classList.add("pop");
  setTimeout(() => basicDisplay.classList.remove("pop"), 200);

  updateBasicDisplay();
}

function basicClear() {
  basicState = { current: "0", expression: "", operator: null, prev: null, justCalced: false };
  updateBasicDisplay();
}

function basicBackspace() {
  if (basicState.justCalced) { basicClear(); return; }
  if (basicState.current.length <= 1 || basicState.current === "Error") {
    basicState.current = "0";
  } else {
    basicState.current = basicState.current.slice(0, -1);
  }
  updateBasicDisplay();
}

// Button click listeners
document.getElementById("tab-basic").addEventListener("click", e => {
  const btn = e.target.closest(".key");
  if (!btn) return;
  const { action, value } = btn.dataset;

  if (action === "digit")    basicDigit(value);
  if (action === "decimal")  basicDecimal();
  if (action === "operator") basicOperator(value);
  if (action === "equals")   basicEquals();
  if (action === "clear")    basicClear();
  if (action === "backspace") basicBackspace();
});

copyBasicBtn.addEventListener("click", () => copyToClipboard(basicState.current));

// Keyboard support (only active on basic/sci tabs)
document.addEventListener("keydown", e => {
  const activeTab = document.querySelector(".tab-btn.active")?.dataset.tab;
  if (activeTab !== "basic") return;

  if (e.key >= "0" && e.key <= "9") basicDigit(e.key);
  if (e.key === ".") basicDecimal();
  if (e.key === "+" ) basicOperator("+");
  if (e.key === "-" ) basicOperator("−");
  if (e.key === "*" ) basicOperator("×");
  if (e.key === "/" ) { e.preventDefault(); basicOperator("÷"); }
  if (e.key === "Enter" || e.key === "=") basicEquals();
  if (e.key === "Backspace") basicBackspace();
  if (e.key === "Escape") basicClear();
});

/* ════════════════════════════════════════════════════════════════
   4.  SCIENTIFIC CALCULATOR
   ════════════════════════════════════════════════════════════════ */

const sciDisplay    = document.getElementById("sciDisplay");
const sciExpression = document.getElementById("sciExpression");
const copySciBtn    = document.getElementById("copySci");

let sciState = {
  current: "0",
  expression: "",
  mode: "deg",     // "deg" or "rad"
  justCalced: false,
};

document.getElementById("degBtn").addEventListener("click", () => {
  sciState.mode = "deg";
  document.getElementById("degBtn").classList.add("active");
  document.getElementById("radBtn").classList.remove("active");
});

document.getElementById("radBtn").addEventListener("click", () => {
  sciState.mode = "rad";
  document.getElementById("radBtn").classList.add("active");
  document.getElementById("degBtn").classList.remove("active");
});

function toRad(deg) { return deg * (Math.PI / 180); }

function updateSciDisplay() {
  sciDisplay.textContent = sciState.current;
  sciExpression.textContent = sciState.expression;
  sciDisplay.classList.toggle("error", sciState.current === "Error");
}

function sciDigit(d) {
  if (sciState.justCalced) { sciState.expression = ""; sciState.justCalced = false; }
  if (sciState.current === "0" && d !== ".") sciState.current = d;
  else if (sciState.current.length < 16)     sciState.current += d;
  updateSciDisplay();
}

function sciDecimalFn() {
  if (sciState.justCalced) { sciState.current = "0"; sciState.justCalced = false; }
  if (!sciState.current.includes(".")) sciState.current += ".";
  updateSciDisplay();
}

function sciOperator(op) {
  if (sciState.current === "Error") return;
  sciState.justCalced = false;
  if (sciState.expression !== "") {
    const r = evalBasicExpression(sciState.expression + sciState.current);
    sciState.expression = r + " " + op + " ";
    sciState.current = r;
  } else {
    sciState.expression = sciState.current + " " + op + " ";
    sciState.current = "0";
  }
  updateSciDisplay();
}

function sciEquals() {
  if (sciState.expression === "") return;
  const full = sciState.expression + sciState.current;
  const result = evalBasicExpression(full);
  saveToHistory(full + " =", result, "scientific");
  sciExpression.textContent = full + " =";
  sciState.current = result;
  sciState.expression = "";
  sciState.justCalced = true;
  sciDisplay.classList.add("pop");
  setTimeout(() => sciDisplay.classList.remove("pop"), 200);
  updateSciDisplay();
}

function sciClear() {
  sciState = { current: "0", expression: "", mode: sciState.mode, justCalced: false };
  updateSciDisplay();
}

function sciBackspace() {
  if (sciState.justCalced) { sciClear(); return; }
  sciState.current = sciState.current.length <= 1 ? "0" : sciState.current.slice(0, -1);
  updateSciDisplay();
}

/** Apply a named scientific function to the current display value */
function applySciFn(fn) {
  const val = parseFloat(sciState.current);
  if (isNaN(val)) { sciState.current = "Error"; updateSciDisplay(); return; }

  let result;
  const label = sciState.mode === "deg" ? "°" : " rad";

  try {
    switch (fn) {
      case "sin":  result = Math.sin(sciState.mode === "deg" ? toRad(val) : val); break;
      case "cos":  result = Math.cos(sciState.mode === "deg" ? toRad(val) : val); break;
      case "tan":  result = Math.tan(sciState.mode === "deg" ? toRad(val) : val); break;
      case "log":  result = Math.log10(val); break;
      case "ln":   result = Math.log(val);   break;
      case "sqrt": result = Math.sqrt(val);  break;
      case "pow":
        // Ask user for exponent (simple prompt for now)
        const exp = parseFloat(prompt("Enter exponent:", "2"));
        if (isNaN(exp)) return;
        result = Math.pow(val, exp);
        break;
      case "fact":
        if (val < 0 || !Number.isInteger(val)) { sciState.current = "Error"; updateSciDisplay(); return; }
        result = factorial(val);
        break;
      case "pi":
        sciState.current = String(Math.PI);
        sciState.expression = "π =";
        updateSciDisplay();
        return;
      case "e":
        sciState.current = String(Math.E);
        sciState.expression = "e =";
        updateSciDisplay();
        return;
      default: return;
    }

    if (!isFinite(result)) { sciState.current = "Error"; updateSciDisplay(); return; }

    const expr = `${fn}(${val}${fn === "sin" || fn === "cos" || fn === "tan" ? label : ""})`;
    const rounded = parseFloat(result.toPrecision(12)).toString();
    saveToHistory(expr, rounded, "scientific");
    sciState.expression = expr + " =";
    sciState.current = rounded;
    sciState.justCalced = true;
  } catch {
    sciState.current = "Error";
  }
  updateSciDisplay();
}

/** Integer factorial */
function factorial(n) {
  if (n > 20) return Infinity; // overflow guard
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// Scientific tab click handler
document.getElementById("tab-scientific").addEventListener("click", e => {
  const btn = e.target.closest(".key, button");
  if (!btn) return;

  if (btn.dataset.sci)       applySciFn(btn.dataset.sci);
  if (btn.dataset.sciDigit)  sciDigit(btn.dataset.sciDigit);
  if (btn.dataset.sciOp)     sciOperator(btn.dataset.sciOp);
  if (btn.dataset.sciDecimal !== undefined) sciDecimalFn();

  const a = btn.dataset.sciAction;
  if (a === "clear")    sciClear();
  if (a === "backspace") sciBackspace();
  if (a === "equals")   sciEquals();
});

copySciBtn.addEventListener("click", () => copyToClipboard(sciState.current));

/* ════════════════════════════════════════════════════════════════
   5.  UNIT CONVERTER
   ════════════════════════════════════════════════════════════════ */

/**
 * Conversion definitions.
 * Strategy: all values convert TO a "base" unit, then FROM base to target.
 * toBase(v): convert v → base unit
 * fromBase(v): convert base unit → target
 * Temperature is a special case (offset, not ratio).
 */
const UNITS = {
  length: {
    base: "meter",
    units: [
      { label: "Meter (m)",        key: "meter",      toBase: v => v,         fromBase: v => v },
      { label: "Centimeter (cm)",  key: "centimeter", toBase: v => v / 100,   fromBase: v => v * 100 },
      { label: "Kilometer (km)",   key: "kilometer",  toBase: v => v * 1000,  fromBase: v => v / 1000 },
      { label: "Inch (in)",        key: "inch",       toBase: v => v * 0.0254,fromBase: v => v / 0.0254 },
      { label: "Foot (ft)",        key: "foot",       toBase: v => v * 0.3048,fromBase: v => v / 0.3048 },
      { label: "Mile (mi)",        key: "mile",       toBase: v => v * 1609.34,fromBase: v => v / 1609.34 },
    ]
  },
  mass: {
    base: "kilogram",
    units: [
      { label: "Kilogram (kg)",    key: "kilogram", toBase: v => v,          fromBase: v => v },
      { label: "Gram (g)",         key: "gram",     toBase: v => v / 1000,   fromBase: v => v * 1000 },
      { label: "Milligram (mg)",   key: "milligram",toBase: v => v / 1e6,    fromBase: v => v * 1e6 },
      { label: "Pound (lb)",       key: "pound",    toBase: v => v * 0.453592,fromBase: v => v / 0.453592 },
      { label: "Ounce (oz)",       key: "ounce",    toBase: v => v * 0.0283495,fromBase: v => v / 0.0283495 },
    ]
  },
  temperature: {
    base: "celsius",
    units: [
      { label: "Celsius (°C)",     key: "celsius",    toBase: v => v,              fromBase: v => v },
      { label: "Fahrenheit (°F)",  key: "fahrenheit", toBase: v => (v - 32) * 5/9, fromBase: v => v * 9/5 + 32 },
      { label: "Kelvin (K)",       key: "kelvin",     toBase: v => v - 273.15,     fromBase: v => v + 273.15 },
    ]
  },
  pressure: {
    base: "pascal",
    units: [
      { label: "Pascal (Pa)",      key: "pascal",    toBase: v => v,          fromBase: v => v },
      { label: "Kilopascal (kPa)", key: "kilopascal",toBase: v => v * 1000,   fromBase: v => v / 1000 },
      { label: "Bar",              key: "bar",        toBase: v => v * 1e5,    fromBase: v => v / 1e5 },
      { label: "Atmosphere (atm)", key: "atm",        toBase: v => v * 101325, fromBase: v => v / 101325 },
      { label: "PSI",              key: "psi",        toBase: v => v * 6894.76,fromBase: v => v / 6894.76 },
    ]
  },
  energy: {
    base: "joule",
    units: [
      { label: "Joule (J)",        key: "joule",     toBase: v => v,          fromBase: v => v },
      { label: "Kilojoule (kJ)",   key: "kilojoule", toBase: v => v * 1000,   fromBase: v => v / 1000 },
      { label: "Calorie (cal)",    key: "calorie",   toBase: v => v * 4.184,  fromBase: v => v / 4.184 },
      { label: "Kilocalorie (kcal)",key:"kilocalorie",toBase: v => v * 4184,  fromBase: v => v / 4184 },
      { label: "BTU",              key: "btu",        toBase: v => v * 1055.06,fromBase: v => v / 1055.06 },
      { label: "Watt·hour (Wh)",   key: "watthour",  toBase: v => v * 3600,   fromBase: v => v / 3600 },
    ]
  },
  power: {
    base: "watt",
    units: [
      { label: "Watt (W)",         key: "watt",      toBase: v => v,          fromBase: v => v },
      { label: "Kilowatt (kW)",    key: "kilowatt",  toBase: v => v * 1000,   fromBase: v => v / 1000 },
      { label: "Megawatt (MW)",    key: "megawatt",  toBase: v => v * 1e6,    fromBase: v => v / 1e6 },
      { label: "Horsepower (hp)",  key: "horsepower",toBase: v => v * 745.7,  fromBase: v => v / 745.7 },
    ]
  }
};

const convCategoryEl = document.getElementById("convCategory");
const convFromValEl  = document.getElementById("convFromVal");
const convToValEl    = document.getElementById("convToVal");
const convFromUnitEl = document.getElementById("convFromUnit");
const convToUnitEl   = document.getElementById("convToUnit");
const convFormulaEl  = document.getElementById("convFormula");

/** Populate the From/To select dropdowns for a given category */
function populateConvUnits(category) {
  const { units } = UNITS[category];
  [convFromUnitEl, convToUnitEl].forEach((sel, idx) => {
    sel.innerHTML = "";
    units.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.key;
      opt.textContent = u.label;
      sel.appendChild(opt);
    });
    // Default: from=first, to=second
    sel.selectedIndex = idx === 0 ? 0 : 1;
  });
  runConversion();
}

/** Perform the conversion calculation */
function runConversion() {
  const category = convCategoryEl.value;
  const { units } = UNITS[category];
  const fromKey = convFromUnitEl.value;
  const toKey   = convToUnitEl.value;
  const rawVal  = parseFloat(convFromValEl.value);

  if (isNaN(rawVal)) { convToValEl.value = ""; convFormulaEl.textContent = ""; return; }

  const fromUnit = units.find(u => u.key === fromKey);
  const toUnit   = units.find(u => u.key === toKey);
  if (!fromUnit || !toUnit) return;

  // Convert: input → base → target
  const baseVal  = fromUnit.toBase(rawVal);
  const result   = toUnit.fromBase(baseVal);
  const rounded  = parseFloat(result.toPrecision(10));

  convToValEl.value = rounded;
  convFormulaEl.textContent = `${rawVal} ${fromUnit.label} = ${rounded} ${toUnit.label}`;
}

// Listeners
convCategoryEl.addEventListener("change", () => populateConvUnits(convCategoryEl.value));
convFromValEl.addEventListener("input",   runConversion);
convFromUnitEl.addEventListener("change", runConversion);
convToUnitEl.addEventListener("change",   runConversion);

document.getElementById("copyConv").addEventListener("click", () => {
  if (convToValEl.value) copyToClipboard(`${convFromValEl.value} → ${convToValEl.value}`);
});

// Init with default category
populateConvUnits(convCategoryEl.value);

/* ════════════════════════════════════════════════════════════════
   6.  EQUATION SOLVER
   ════════════════════════════════════════════════════════════════ */

const linearBtn   = document.getElementById("linearBtn");
const quadBtn     = document.getElementById("quadBtn");
const linearInputs = document.getElementById("linearInputs");
const quadInputs  = document.getElementById("quadInputs");
const solveBtn    = document.getElementById("solveBtn");
const solverResult = document.getElementById("solverResult");
const stepsList   = document.getElementById("stepsList");
const finalAnswer = document.getElementById("finalAnswer");
const linearPreview = document.getElementById("linearPreview");
const quadPreview   = document.getElementById("quadPreview");

let equationType = "linear";

// Toggle between linear and quadratic
linearBtn.addEventListener("click", () => {
  equationType = "linear";
  linearBtn.classList.add("active");
  quadBtn.classList.remove("active");
  linearInputs.hidden = false;
  quadInputs.hidden = true;
  solverResult.hidden = true;
});

quadBtn.addEventListener("click", () => {
  equationType = "quadratic";
  quadBtn.classList.add("active");
  linearBtn.classList.remove("active");
  quadInputs.hidden = false;
  linearInputs.hidden = true;
  solverResult.hidden = true;
});

// Live equation preview for linear
["linA","linB","linC"].forEach(id =>
  document.getElementById(id).addEventListener("input", updateLinearPreview)
);

function updateLinearPreview() {
  const a = document.getElementById("linA").value || "a";
  const b = document.getElementById("linB").value || "b";
  const c = document.getElementById("linC").value || "c";
  const bSign = parseFloat(b) < 0 ? "−" : "+";
  const bAbs  = isNaN(parseFloat(b)) ? b : Math.abs(parseFloat(b));
  linearPreview.textContent = `Equation: ${a}x ${bSign} ${bAbs} = ${c}`;
}

// Live equation preview for quadratic
["quadA","quadB","quadC"].forEach(id =>
  document.getElementById(id).addEventListener("input", updateQuadPreview)
);

function updateQuadPreview() {
  const a = document.getElementById("quadA").value || "a";
  const b = document.getElementById("quadB").value || "b";
  const c = document.getElementById("quadC").value || "c";
  const bSign = parseFloat(b) < 0 ? "−" : "+";
  const bAbs  = isNaN(parseFloat(b)) ? b : Math.abs(parseFloat(b));
  const cSign = parseFloat(c) < 0 ? "−" : "+";
  const cAbs  = isNaN(parseFloat(c)) ? c : Math.abs(parseFloat(c));
  quadPreview.textContent = `Equation: ${a}x² ${bSign} ${bAbs}x ${cSign} ${cAbs} = 0`;
}

/** Render solution steps into the UI */
function renderSteps(steps, answer) {
  stepsList.innerHTML = "";
  steps.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s;
    stepsList.appendChild(li);
  });
  finalAnswer.textContent = answer;
  solverResult.hidden = false;
  solverResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/** Solve linear equation: ax + b = c  →  x = (c - b) / a */
function solveLinear() {
  const a = parseFloat(document.getElementById("linA").value);
  const b = parseFloat(document.getElementById("linB").value);
  const c = parseFloat(document.getElementById("linC").value);

  if ([a, b, c].some(isNaN)) {
    showToast("Please enter valid numbers for a, b, and c");
    return;
  }

  const steps = [];
  steps.push(`Start with: ${a}x + ${b} = ${c}`);
  steps.push(`Subtract ${b} from both sides: ${a}x = ${c} − ${b}`);
  steps.push(`Simplify right side: ${a}x = ${c - b}`);

  if (a === 0) {
    if (b === c) {
      renderSteps(steps, "Infinite solutions (0 = 0, always true)");
    } else {
      renderSteps(steps, "No solution (0 = " + (c - b) + ", contradiction)");
    }
    return;
  }

  steps.push(`Divide both sides by ${a}: x = ${c - b} ÷ ${a}`);
  const x = (c - b) / a;
  const xRounded = parseFloat(x.toPrecision(10));
  steps.push(`Verify: ${a} × ${xRounded} + ${b} = ${parseFloat((a * xRounded + b).toPrecision(10))}`);

  saveToHistory(`${a}x + ${b} = ${c}`, `x = ${xRounded}`, "solver");
  renderSteps(steps, `x = ${xRounded}`);
}

/** Solve quadratic: ax² + bx + c = 0  →  quadratic formula */
function solveQuadratic() {
  const a = parseFloat(document.getElementById("quadA").value);
  const b = parseFloat(document.getElementById("quadB").value);
  const c = parseFloat(document.getElementById("quadC").value);

  if ([a, b, c].some(isNaN)) {
    showToast("Please enter valid numbers for a, b, and c");
    return;
  }

  if (a === 0) {
    showToast("Coefficient a cannot be 0 for a quadratic equation");
    return;
  }

  const steps = [];
  steps.push(`Equation: ${a}x² + ${b}x + ${c} = 0`);
  steps.push(`Apply the Quadratic Formula: x = (−b ± √(b² − 4ac)) / 2a`);
  steps.push(`Plug in: a = ${a},  b = ${b},  c = ${c}`);

  const disc = b * b - 4 * a * c;
  steps.push(`Calculate the discriminant: Δ = b² − 4ac = ${b}² − 4(${a})(${c}) = ${disc}`);

  let answer;
  if (disc > 0) {
    steps.push(`Δ > 0: Two distinct real roots`);
    const sqrtDisc = Math.sqrt(disc);
    const x1 = (-b + sqrtDisc) / (2 * a);
    const x2 = (-b - sqrtDisc) / (2 * a);
    steps.push(`x₁ = (−${b} + √${disc}) / (2 × ${a}) = ${parseFloat(x1.toPrecision(10))}`);
    steps.push(`x₂ = (−${b} − √${disc}) / (2 × ${a}) = ${parseFloat(x2.toPrecision(10))}`);
    answer = `x₁ = ${parseFloat(x1.toPrecision(8))},   x₂ = ${parseFloat(x2.toPrecision(8))}`;
    saveToHistory(`${a}x² + ${b}x + ${c} = 0`, answer, "solver");
  } else if (disc === 0) {
    steps.push(`Δ = 0: One repeated real root (double root)`);
    const x = -b / (2 * a);
    steps.push(`x = −b / 2a = −${b} / ${2 * a} = ${parseFloat(x.toPrecision(10))}`);
    answer = `x = ${parseFloat(x.toPrecision(8))} (double root)`;
    saveToHistory(`${a}x² + ${b}x + ${c} = 0`, answer, "solver");
  } else {
    steps.push(`Δ < 0: No real roots (complex conjugate pair)`);
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-disc) / (2 * a);
    steps.push(`Real part: ${parseFloat(realPart.toPrecision(8))}`);
    steps.push(`Imaginary part: ±${parseFloat(imagPart.toPrecision(8))}i`);
    answer = `x = ${parseFloat(realPart.toPrecision(6))} ± ${parseFloat(imagPart.toPrecision(6))}i`;
    saveToHistory(`${a}x² + ${b}x + ${c} = 0`, answer, "solver");
  }

  renderSteps(steps, answer);
}

solveBtn.addEventListener("click", () => {
  if (equationType === "linear") solveLinear();
  else solveQuadratic();
});

// Initialize previews
updateLinearPreview();
updateQuadPreview();

/* ════════════════════════════════════════════════════════════════
   7.  HISTORY (API + localStorage fallback)
   ════════════════════════════════════════════════════════════════ */

const HISTORY_LS_KEY = "engcalc_history";
const API_BASE = "/api";

/** Fetch history from backend; fall back to localStorage on failure */
async function loadHistory() {
  let entries = [];
  try {
    const res  = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    entries = data.history || [];
    // Also sync to localStorage as backup
    localStorage.setItem(HISTORY_LS_KEY, JSON.stringify(entries));
  } catch {
    // Use localStorage fallback
    const raw = localStorage.getItem(HISTORY_LS_KEY);
    entries = raw ? JSON.parse(raw) : [];
    entries = entries.slice().reverse(); // newest first
  }
  renderHistoryList(entries);
}

/** Save a calculation to backend and localStorage */
async function saveToHistory(expression, result, mode) {
  const entry = { expression, result, mode, timestamp: new Date().toISOString() };

  // Optimistic update to localStorage
  try {
    const raw = localStorage.getItem(HISTORY_LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ ...entry, id: Date.now() });
    if (arr.length > 200) arr.splice(0, arr.length - 200);
    localStorage.setItem(HISTORY_LS_KEY, JSON.stringify(arr));
  } catch { /* ignore storage errors */ }

  // Send to backend (best-effort)
  try {
    await fetch(`${API_BASE}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  } catch { /* server offline — that's ok, localStorage is the fallback */ }
}

/** Delete a single history entry */
async function deleteHistoryEntry(id) {
  // Remove from localStorage
  try {
    const raw = localStorage.getItem(HISTORY_LS_KEY);
    let arr = raw ? JSON.parse(raw) : [];
    arr = arr.filter(e => String(e.id) !== String(id));
    localStorage.setItem(HISTORY_LS_KEY, JSON.stringify(arr));
  } catch {}

  // Also try backend
  try {
    await fetch(`${API_BASE}/history/${id}`, { method: "DELETE" });
  } catch {}

  loadHistory();
}

/** Render the history list to DOM */
function renderHistoryList(entries) {
  const list  = document.getElementById("historyList");
  const empty = document.getElementById("historyEmpty");

  list.innerHTML = "";

  if (!entries || entries.length === 0) {
    empty.hidden = false;
    list.hidden = true;
    return;
  }

  empty.hidden = true;
  list.hidden  = false;

  entries.forEach(entry => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <div class="history-item-content">
        <div class="history-expr">${escapeHtml(entry.expression)}</div>
        <div class="history-result">= ${escapeHtml(entry.result)}</div>
        <div class="history-meta">${formatTimestamp(entry.timestamp)}</div>
      </div>
      <span class="history-mode-badge">${escapeHtml(entry.mode || "calc")}</span>
      <button class="history-delete-btn" data-id="${entry.id}" title="Delete this entry">✕</button>
    `;
    list.appendChild(li);
  });

  // Delete button listeners
  list.querySelectorAll(".history-delete-btn").forEach(btn =>
    btn.addEventListener("click", () => deleteHistoryEntry(btn.dataset.id))
  );
}

/** Format ISO timestamp to human-readable */
function formatTimestamp(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch { return ""; }
}

/** Simple HTML escape to prevent XSS */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Clear all history
document.getElementById("clearHistoryBtn").addEventListener("click", async () => {
  if (!confirm("Clear all calculation history?")) return;

  localStorage.removeItem(HISTORY_LS_KEY);
  try {
    await fetch(`${API_BASE}/history`, { method: "DELETE" });
  } catch {}

  loadHistory();
  showToast("History cleared");
});

// Export history as CSV
document.getElementById("exportCsvBtn").addEventListener("click", () => {
  try {
    const raw = localStorage.getItem(HISTORY_LS_KEY);
    const entries = raw ? JSON.parse(raw) : [];
    if (entries.length === 0) { showToast("No history to export"); return; }

    const header = "ID,Expression,Result,Mode,Timestamp\n";
    const rows   = entries.map(e =>
      `${e.id},"${String(e.expression).replace(/"/g, '""')}","${String(e.result).replace(/"/g, '""')}","${e.mode}","${e.timestamp}"`
    ).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `engcalc-history-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported!");
  } catch {
    showToast("Export failed");
  }
});

/* ════════════════════════════════════════════════════════════════
   8.  ABOUT MODAL
   ════════════════════════════════════════════════════════════════ */

const aboutModal   = document.getElementById("aboutModal");
const aboutBtn     = document.getElementById("aboutBtn");
const closeAboutBtn= document.getElementById("closeAbout");

aboutBtn.addEventListener("click", () => { aboutModal.hidden = false; });
closeAboutBtn.addEventListener("click", () => { aboutModal.hidden = true; });
aboutModal.addEventListener("click", e => {
  if (e.target === aboutModal) aboutModal.hidden = true;
});

// Close modal on Escape key
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !aboutModal.hidden) aboutModal.hidden = true;
});

/* ════════════════════════════════════════════════════════════════
   9.  INIT
   ════════════════════════════════════════════════════════════════ */

// Initialize displays
updateBasicDisplay();
updateSciDisplay();

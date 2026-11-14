/*
 * data.js
 * All the numbers you might want to tweak: machine presets, materials,
 * and the derating factors. No logic lives here.
 *
 * Every file shares one global object called CNC instead of using imports,
 * so the page works when opened straight from disk or hosted on GitHub Pages.
 */

window.CNC = window.CNC || {};

CNC.data = {};

/* ---------- Unit conversion ---------- */

CNC.data.MM_PER_INCH = 25.4;
CNC.data.MM3_PER_IN3 = 16387.064;
CNC.data.KW_PER_HP = 0.7457;

/* ---------- Machine presets ----------
   maxFeed:  top feed rate the machine can do, in mm/min (estimates, check your own)
   rigidity: 1.0 is a ShopBot PRSalpha, higher is stiffer
   spindleKw: spindle power in kW
   maxRpm:   optional, top spindle speed. Leave it out if the machine
             covers the whole RPM slider. */

CNC.data.MACHINES = {
  alpha:  { name: "ShopBot PRSalpha 3.2 HP / 2.4 kW", maxFeed: 15000, rigidity: 1.0,  spindleKw: 2.4 },
  std:    { name: "ShopBot PRSstandard",              maxFeed: 12000, rigidity: 0.9,  spindleKw: 2.2 },
  heavy:  { name: "Heavy Commercial 5 HP",            maxFeed: 20000, rigidity: 1.15, spindleKw: 3.7 },
  hobby:  { name: "Rigid Hobby Router",               maxFeed: 5000,  rigidity: 0.6,  spindleKw: 1.1 },

  /* Carvey: 300 W spindle that tops out at 12,000 RPM.
     maxFeed is a guess. Check the real value in gSender ($110 and $111, in mm/min). */
  carvey: { name: "Inventables Carvey 300 W",         maxFeed: 2500,  rigidity: 0.5,  spindleKw: 0.3, maxRpm: 12000 }
};

/* ---------- Materials ----------
   chipLoad:  chip load per tooth for a 12.7 mm (1/2 inch) bit, in mm
   cuttingEnergy: specific cutting energy Kc in N/mm2, used for cutting force
   hpPerCubicInch: spindle HP needed per in3/min removed */

CNC.data.MATERIALS = {
  baltic:  { name: "Baltic Birch Plywood",       chipLoad: 0.36, cuttingEnergy: 22,  hpPerCubicInch: 0.20 },
  soft:    { name: "Construction / Soft Plywood", chipLoad: 0.36, cuttingEnergy: 16,  hpPerCubicInch: 0.16 },
  mdf:     { name: "MDF",                         chipLoad: 0.33, cuttingEnergy: 20,  hpPerCubicInch: 0.20 },
  hard:    { name: "Hard Maple / Oak",            chipLoad: 0.30, cuttingEnergy: 38,  hpPerCubicInch: 0.25 },
  pine:    { name: "Softwood (Pine / Cedar)",     chipLoad: 0.38, cuttingEnergy: 15,  hpPerCubicInch: 0.15 },
  plastic: { name: "HDPE / Acrylic",              chipLoad: 0.25, cuttingEnergy: 25,  hpPerCubicInch: 0.22 },
  alu:     { name: "Aluminum 6061",               chipLoad: 0.10, cuttingEnergy: 700, hpPerCubicInch: 1.0 }
};

/* ---------- Tortoise (1) to Hare (5) slider ----------
   chipLoadFactor multiplies the target chip load.
   maxDeflection is the most the tool is allowed to bend, in mm. */

CNC.data.AGGRESSIVENESS = {
  1: { label: "1 Conservative", chipLoadFactor: 0.6,  maxDeflection: 0.025 },
  2: { label: "2 Gentle",       chipLoadFactor: 0.8,  maxDeflection: 0.025 },
  3: { label: "3 Balanced",     chipLoadFactor: 1.0,  maxDeflection: 0.04 },
  4: { label: "4 Firm",         chipLoadFactor: 1.15, maxDeflection: 0.06 },
  5: { label: "5 Aggressive",   chipLoadFactor: 1.3,  maxDeflection: 0.06 }
};

/* ---------- Derating factors and other tuning values ---------- */

CNC.data.TUNING = {
  referenceDiameter: 12.7,       // mm, the bit size the chip load table is based on

  smallToolDiameter: 3.2,        // mm, at or under this the chip load is cut hard
  smallToolFactor: 0.75,
  mediumToolDiameter: 6.35,      // mm, at or under this the chip load is cut a bit
  mediumToolFactor: 0.85,

  hssChipLoadFactor: 0.8,        // HSS bits get less chip load than carbide

  maxChipThinning: 2.0,          // cap on the radial chip thinning multiplier

  deepCutDeratePerDiameter: 0.825, // each extra bit diameter of depth multiplies chip load by this
  deepCutMinFactor: 0.3,           // never derate below this

  downcutDeratePastOneDiameter: 0.9,  // downcut, depth over 1x diameter
  downcutDeratePastTwoDiameters: 0.8, // downcut, depth over 2x diameter

  compressionUpcutFraction: 0.5, // guess: upcut section at the tip is half the bit diameter
  compressionUpcutMin: 3,        // mm, minimum guess for that upcut section
  compressionMinChipLoad: 0.08,  // mm per tooth, below this compression bits rub

  rubChipLoad: 0.05,             // mm per tooth, below this any bit rubs instead of cutting

  carbideModulus: 600000,        // MPa, Young's modulus for solid carbide
  hssModulus: 210000,            // MPa, Young's modulus for HSS
  coreFraction: 0.8,             // effective core diameter as a share of bit diameter

  powerWarnPercent: 80           // warn when spindle load passes this percent
};

/* ---------- Starting values for the inputs ---------- */

CNC.data.DEFAULT_STATE = {
  units: "mm",
  machine: "alpha",
  material: "baltic",
  diameter: 6,
  flutes: 2,
  toolMaterial: "carbide",
  bitType: "up",
  stickout: 25,
  depthOfCut: 6,
  stepover: 3,
  stepoverMode: "distance",   // "distance" or "percent"
  stepoverPercent: 50,
  rpm: 14000,
  aggressiveness: 3,
  plungePercent: 50,
  autoLimit: true
};

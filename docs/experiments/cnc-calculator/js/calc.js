/*
 * calc.js
 * The speeds and feeds math. Works in millimeters only and knows nothing
 * about the page. Give it the state, get back a result object.
 *
 * Call it like:  const result = CNC.calculate(state);
 */

(function () {
  const data = CNC.data;
  const T = data.TUNING;

  /* Start with the chip load for a 12.7 mm bit and scale it to this bit size. */
  function baseChipLoad(material, diameter) {
    return material.chipLoad * (diameter / T.referenceDiameter);
  }

  /* Small bits snap easily, so they get less chip load. */
  function smallToolFactor(diameter) {
    if (diameter <= T.smallToolDiameter) return T.smallToolFactor;
    if (diameter <= T.mediumToolDiameter) return T.mediumToolFactor;
    return 1;
  }

  /* Radial chip thinning. With a light stepover the chips get thinner than
     the feed suggests, so we feed faster to make up for it.
     Only applies below 50% stepover. At 50% or more it is exactly 1. */
  function radialChipThinning(stepover, diameter) {
    if (stepover >= 0.5 * diameter) return 1;
    const x = 1 - (2 * stepover) / diameter;
    return Math.min(T.maxChipThinning, 1 / Math.sqrt(1 - x * x));
  }

  /* Deep cuts pack chips and stress the bit. Past 1x diameter of depth,
     every extra diameter of depth takes about 17.5% off the chip load. */
  function deepCutFactor(depthOfCut, diameter) {
    if (depthOfCut <= diameter) return 1;
    const extraDiameters = (depthOfCut - diameter) / diameter;
    return Math.max(T.deepCutMinFactor, Math.pow(T.deepCutDeratePerDiameter, extraDiameters));
  }

  /* Downcut bits push chips into the slot, so deep cuts get slowed down. */
  function downcutFactor(bitType, depthOfCut, diameter) {
    if (bitType !== "down") return 1;
    if (depthOfCut > 2 * diameter) return T.downcutDeratePastTwoDiameters;
    if (depthOfCut > diameter) return T.downcutDeratePastOneDiameter;
    return 1;
  }

  /* Rough length of the upcut section at the tip of a compression bit, in mm.
     This varies between brands, so it is only a guess. */
  function compressionUpcutLength(diameter) {
    return Math.max(T.compressionUpcutMin, T.compressionUpcutFraction * diameter);
  }

  CNC.calculate = function (state) {
    const machine = data.MACHINES[state.machine];
    const material = data.MATERIALS[state.material];
    const aggressiveness = data.AGGRESSIVENESS[state.aggressiveness];

    const diameter = state.diameter;
    const flutes = Number(state.flutes);
    const rpm = state.rpm;
    const depthOfCut = state.depthOfCut;
    const stickout = state.stickout;
    const stepover = Math.min(state.stepover, diameter);

    /* ----- Chip load ----- */

    const baseChip = baseChipLoad(material, diameter);
    const smallFactor = smallToolFactor(diameter);
    const toolMaterialFactor = state.toolMaterial === "hss" ? T.hssChipLoadFactor : 1;
    const machineFactor = 0.8 + 0.2 * machine.rigidity;
    const thinning = radialChipThinning(stepover, diameter);
    const depthFactor = deepCutFactor(depthOfCut, diameter);
    const bitTypeFactor = downcutFactor(state.bitType, depthOfCut, diameter);

    const targetChipLoad =
      baseChip * smallFactor * toolMaterialFactor * machineFactor *
      aggressiveness.chipLoadFactor * depthFactor * thinning * bitTypeFactor;

    /* ----- Feed rate ----- */

    let feed = targetChipLoad * flutes * rpm;
    let cappedByMachine = false;
    let cappedByDeflection = false;

    if (feed > machine.maxFeed) {
      feed = machine.maxFeed;
      cappedByMachine = true;
    }

    /* ----- Cutting force and tool deflection -----
       Force comes from how much material we remove per second and how much
       energy the material needs. Deflection treats the bit as a cantilever beam. */

    const modulus = state.toolMaterial === "hss" ? T.hssModulus : T.carbideModulus;
    const coreDiameter = T.coreFraction * diameter;
    const momentOfInertia = (Math.PI * Math.pow(coreDiameter, 4)) / 64;
    const surfaceSpeed = (Math.PI * diameter * rpm) / 60; // mm/s at the bit edge

    function cuttingForce(feedMmPerMin) {
      const removalPerSecond = (depthOfCut * stepover * feedMmPerMin) / 60; // mm3/s
      return (material.cuttingEnergy * removalPerSecond) / surfaceSpeed;     // N
    }

    function deflectionFor(feedMmPerMin) {
      const force = cuttingForce(feedMmPerMin);
      return (force * Math.pow(stickout, 3)) / (3 * modulus * momentOfInertia) / machine.rigidity;
    }

    const deflectionLimit = aggressiveness.maxDeflection;
    let deflection = deflectionFor(feed);

    if (state.autoLimit && deflection > deflectionLimit) {
      feed *= deflectionLimit / deflection;
      deflection = deflectionLimit;
      cappedByDeflection = true;
    }

    /* ----- Final numbers ----- */

    const chipLoad = feed / (flutes * rpm);
    const mrr = depthOfCut * stepover * feed; // mm3/min
    const powerKw = material.hpPerCubicInch * (mrr / data.MM3_PER_IN3) * data.KW_PER_HP;
    const spindleLoad = (powerKw / machine.spindleKw) * 100;

    return {
      machine, material,
      stepover,

      // chip load breakdown
      baseChip, smallFactor, toolMaterialFactor, machineFactor,
      aggressivenessFactor: aggressiveness.chipLoadFactor,
      thinning, depthFactor, bitTypeFactor,
      targetChipLoad,

      // main outputs
      feed, chipLoad, mrr, powerKw, spindleLoad,
      deflection, deflectionLimit,
      force: cuttingForce(feed),
      surfaceSpeed,

      // what limited the feed
      cappedByMachine, cappedByDeflection,

      // compression bit helper
      compressionUpcutLength: compressionUpcutLength(diameter)
    };
  };
})();

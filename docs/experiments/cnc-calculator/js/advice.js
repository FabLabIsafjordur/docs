/*
 * advice.js
 * Decides which status badges and machinist advice notes to show.
 * Returns plain data, ui.js does the drawing.
 *
 * To add a new warning, push another entry in badgesFor() or adviceFor().
 */

(function () {
  const T = CNC.data.TUNING;
  const fmt = CNC.format;

  /* Small colored pills under the readouts.
     Each one is { kind: "ok" | "warn" | "bad" | "info", text: "..." } */
  function badgesFor(state, r) {
    const badges = [];
    const units = state.units;

    if (r.cappedByDeflection) {
      badges.push({ kind: "warn", text: "Feed capped by tool deflection (limit " + fmt.length(r.deflectionLimit, units, 4) + ")" });
    } else {
      badges.push({ kind: "ok", text: "Deflection inside safe zone" });
    }

    if (r.cappedByMachine) {
      badges.push({ kind: "warn", text: "Feed capped by machine maximum" });
    }
    if (r.thinning > 1.001) {
      badges.push({ kind: "info", text: "Chip thinning boost " + r.thinning.toFixed(2) + "x" });
    }
    if (r.depthFactor < 1) {
      badges.push({ kind: "warn", text: "Deep cut derate " + r.depthFactor.toFixed(2) + "x" });
    }
    if (state.bitType === "down" && r.bitTypeFactor < 1) {
      badges.push({ kind: "warn", text: "Downcut deep slot derate " + r.bitTypeFactor.toFixed(2) + "x" });
    }
    if (state.bitType === "comp" && state.depthOfCut <= r.compressionUpcutLength) {
      badges.push({ kind: "bad", text: "Too shallow for compression bit" });
    }
    if (r.spindleLoad > T.powerWarnPercent) {
      badges.push({
        kind: r.spindleLoad > 100 ? "bad" : "warn",
        text: "Needs " + r.powerKw.toFixed(2) + " kW of " + r.machine.spindleKw + " kW spindle"
      });
    }
    if (!state.autoLimit && r.deflection > r.deflectionLimit) {
      badges.push({ kind: "bad", text: "Deflection over limit, auto-limit is off" });
    }
    return badges;
  }

  /* Longer notes in the Machinist Advice box. Returns a list of strings. */
  function adviceFor(state, r) {
    const notes = [];
    const units = state.units;
    const diameter = state.diameter;
    const depth = state.depthOfCut;

    if (r.machine.maxRpm && state.rpm > r.machine.maxRpm) {
      notes.push("This machine's spindle tops out at " + r.machine.maxRpm.toLocaleString() + " RPM. Set the RPM slider to " + r.machine.maxRpm.toLocaleString() + " so the feed rate matches what the machine really does.");
    }

    if (r.chipLoad < T.rubChipLoad) {
      notes.push("Chip load is under 0.05 mm per tooth. The bit will rub instead of cut, which makes heat and dull edges. Raise the feed, lower the RPM, drop a flute, or take a wider stepover.");
    }

    if (r.cappedByDeflection && r.feed < r.targetChipLoad * Number(state.flutes) * state.rpm * 0.8) {
      notes.push("Deflection is holding the feed down. A larger bit, a shorter stickout or a lighter cut will let you go faster.");
    }

    if (state.stickout > depth * 3 && state.stickout > 4 * diameter) {
      notes.push("Stickout is long compared to the cut. Pull the bit up in the collet to gain stiffness.");
    }

    if (depth > state.stickout) {
      notes.push("Depth of cut is greater than the stickout, which is not possible. Reduce DOC or lower the bit.");
    }

    if (depth > diameter * 2) {
      notes.push("Deep cut. Consider two or more passes so chips can clear and the bit stays cool.");
    }

    /* Bit type notes */
    if (state.bitType === "down" && depth > diameter) {
      notes.push("Downcut bits push chips down into the slot, so deep cuts can pack up and heat the bit. The feed was reduced a little. Take shallower passes if you see burning or hear the sound change.");
    }
    if (state.bitType === "up" && depth >= diameter * 0.5 && state.material !== "alu") {
      notes.push("Upcut bits pull chips out well but can tear the top face and lift thin or loosely held sheets. Check your hold down, or use a downcut or compression bit if the top edge matters.");
    }
    if (state.bitType === "comp" && depth <= r.compressionUpcutLength) {
      notes.push("Your depth of cut is about the same as the upcut section at the tip, roughly " + fmt.length(r.compressionUpcutLength, units) + " on this size. The bit will cut like a plain upcut and you lose the clean top edge. Go deeper than that, for example through the full sheet thickness.");
    } else if (state.bitType === "comp" && r.chipLoad < T.compressionMinChipLoad) {
      notes.push("Compression bits rub badly when chip load is low. Try to keep it above 0.08 mm per tooth by raising the feed or lowering RPM.");
    }

    if (r.spindleLoad > T.powerWarnPercent) {
      notes.push("Spindle power is near its limit. Reduce DOC or stepover, or pick a lighter setting on the slider.");
    }

    /* Material notes */
    if (state.material === "alu") {
      notes.push("Aluminum on a wood router needs a single flute O-flute bit, light cuts, mist or air blast, and a very rigid hold down. Start slower than this number.");
    }
    if (state.material === "plastic") {
      notes.push("Plastics melt if chips stay in the cut. Use a single flute O-flute bit and keep the feed up so heat leaves with the chip.");
    }

    if (state.rpm > 18000 && diameter > 12) {
      notes.push("High RPM with a large bit is hard on the spindle bearings and bit. Many routers prefer 12,000 to 16,000 for big diameters.");
    }

    if (notes.length === 0) {
      notes.push("Settings look reasonable. Test on scrap and listen. A steady crisp sound means chip load is about right.");
    }
    return notes;
  }

  CNC.advice = { badgesFor, adviceFor };
})();

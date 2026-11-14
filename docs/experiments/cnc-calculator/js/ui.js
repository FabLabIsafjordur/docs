/*
 * ui.js
 * Everything that touches the page: filling the dropdowns, reading the
 * inputs into the state object, and showing the results.
 *
 * The state object always holds millimeters. Only the text on screen
 * and the input boxes switch to inches.
 */

(function () {
  const data = CNC.data;
  const fmt = CNC.format;

  const state = Object.assign({}, data.DEFAULT_STATE);

  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /* ---------- Setting up the inputs ---------- */

  function fillDropdowns() {
    for (const key in data.MACHINES) $("machine").add(new Option(data.MACHINES[key].name, key));
    for (const key in data.MATERIALS) $("material").add(new Option(data.MATERIALS[key].name, key));
  }

  /* Slider limits in mm. Steps are nice round numbers in either unit. */
  function sliderLimits() {
    const inches = state.units === "in";
    const step = (inchStep, mmStep) => (inches ? inchStep * data.MM_PER_INCH : mmStep);
    return {
      stickout:   { min: 10,   max: 80,                      step: step(0.125,  1)    },
      depthOfCut: { min: 0.5,  max: 40,                      step: step(0.0625, 0.5)  },
      stepover:   { min: 0.25, max: Math.max(state.diameter, 1), step: step(0.0625, 0.25) }
    };
  }

  function applySliderRanges() {
    const limits = sliderLimits();
    const scale = fmt.lengthScale(state.units);
    const digits = state.units === "in" ? 4 : 2;

    for (const id of ["stickout", "depthOfCut", "stepover"]) {
      const slider = $(id);
      if (id === "stepover" && state.stepoverMode === "percent") {
        slider.min = 1;
        slider.max = 100;
        slider.step = 1;
        continue;
      }
      slider.min = (limits[id].min * scale).toFixed(digits);
      slider.max = (limits[id].max * scale).toFixed(digits);
      slider.step = (limits[id].step * scale).toFixed(digits);
    }
  }

  /* Push the state into the input boxes and sliders. */
  function syncInputsFromState() {
    const scale = fmt.lengthScale(state.units);
    applySliderRanges();

    $("diameter").value = +(state.diameter * scale).toFixed(state.units === "in" ? 4 : 2);
    $("stickout").value = state.stickout * scale;
    $("depthOfCut").value = state.depthOfCut * scale;
    $("stepover").value = state.stepoverMode === "percent" ? state.stepoverPercent : state.stepover * scale;
    $("rpm").value = state.rpm;
    $("aggressiveness").value = state.aggressiveness;
    $("plunge").value = state.plungePercent;

    document.querySelectorAll(".unit-name").forEach((el) => { el.textContent = fmt.unitName(state.units); });
  }

  /* ---------- Showing the results ---------- */

  function setReadout(id, number, unit) {
    $(id).innerHTML = number + ' <span class="unit">' + unit + "</span>";
  }

  function renderReadouts(r) {
    const units = state.units;
    const inches = units === "in";

    setReadout("outFeed", fmt.feedNumber(r.feed, units), fmt.feedUnit(units));
    setReadout("outPlunge", fmt.feedNumber((r.feed * state.plungePercent) / 100, units), fmt.feedUnit(units));
    setReadout("outChipLoad",
      inches ? (r.chipLoad / data.MM_PER_INCH).toFixed(4) : r.chipLoad.toFixed(3),
      inches ? "in/tooth" : "mm/tooth");
    setReadout("outMrr",
      inches ? (r.mrr / data.MM3_PER_IN3).toFixed(2) : (r.mrr / 1000).toFixed(1),
      inches ? "in³/min" : "cm³/min");
    setReadout("outLoad", r.spindleLoad.toFixed(0), "%");
    setReadout("outDeflection",
      inches ? (r.deflection / data.MM_PER_INCH).toFixed(4) : r.deflection.toFixed(3),
      fmt.unitName(units));

    // spindle load bar: green, yellow past the warning level, red past 100%
    const loadColor = r.spindleLoad > 100 ? "var(--bad)" : r.spindleLoad > data.TUNING.powerWarnPercent ? "var(--warn)" : "var(--good)";
    $("loadBar").style.width = Math.min(100, r.spindleLoad) + "%";
    $("loadBar").style.background = loadColor;

    // deflection bar: the white mark in the middle is the safe limit
    const deflectionColor =
      r.deflection > r.deflectionLimit * 1.5 ? "var(--bad)" :
      r.deflection > r.deflectionLimit * 1.001 ? "var(--warn)" : "var(--good)";
    $("deflectionBar").style.width = Math.min(100, (r.deflection / (2 * r.deflectionLimit)) * 100) + "%";
    $("deflectionBar").style.background = deflectionColor;
  }

  function renderSliderLabels(r) {
    const units = state.units;
    $("stickoutValue").textContent = fmt.length(state.stickout, units, units === "in" ? 2 : 0);
    $("depthValue").textContent = fmt.length(state.depthOfCut, units);
    $("stepoverValue").textContent = fmt.length(r.stepover, units) + " (" + ((r.stepover / state.diameter) * 100).toFixed(0) + "%)";
    $("rpmValue").textContent = state.rpm.toLocaleString();
    $("aggressivenessValue").textContent = data.AGGRESSIVENESS[state.aggressiveness].label;
    $("plungeValue").textContent = state.plungePercent + "%";
  }

  function renderBadges(r) {
    $("badges").innerHTML = CNC.advice.badgesFor(state, r)
      .map((badge) => '<span class="badge ' + badge.kind + '">' + badge.text + "</span>")
      .join("");
  }

  function renderDetailTable(r) {
    const units = state.units;
    const rows = [
      ["Base chip load at 12.7 mm", r.baseChip.toFixed(3) + " mm (scaled to this bit)"],
      ["Small tool derate", r.smallFactor.toFixed(2) + "x"],
      ["Tool material", r.toolMaterialFactor.toFixed(2) + "x"],
      ["Machine rigidity", r.machineFactor.toFixed(2) + "x"],
      ["Aggressiveness", r.aggressivenessFactor.toFixed(2) + "x"],
      ["Radial chip thinning", r.thinning.toFixed(2) + "x"],
      ["DOC derate", r.depthFactor.toFixed(2) + "x"],
      ["Bit type derate", r.bitTypeFactor.toFixed(2) + "x"],
      ["Target chip before caps", r.targetChipLoad.toFixed(3) + " mm"],
      ["Surface speed", ((r.surfaceSpeed * 60) / 1000).toFixed(0) + " m/min"],
      ["Cutting force", r.force.toFixed(1) + " N"],
      ["Power needed", r.powerKw.toFixed(2) + " kW"],
      ["Machine max feed", fmt.feedNumber(r.machine.maxFeed, units) + " " + fmt.feedUnit(units)]
    ];
    $("detailTable").innerHTML = rows
      .map((row) => "<tr><td>" + row[0] + "</td><td>" + row[1] + "</td></tr>")
      .join("");
  }

  function renderAdvice(r) {
    $("adviceList").innerHTML = CNC.advice.adviceFor(state, r)
      .map((note) => "<li>" + note + "</li>")
      .join("");
  }

  /* Recalculate and redraw everything. Runs after every change. */
  function render() {
    const result = CNC.calculate(state);
    renderSliderLabels(result);
    renderReadouts(result);
    renderBadges(result);
    renderDetailTable(result);
    renderAdvice(result);
    CNC.drawDiagram($("diagram"), state, result);
  }

  /* ---------- Reacting to input ---------- */

  function setActiveButton(containerId, activeButton) {
    document.querySelectorAll("#" + containerId + " button").forEach((button) => {
      button.classList.toggle("on", button === activeButton);
    });
  }

  function bindEvents() {
    // dropdowns
    $("machine").onchange = (e) => { state.machine = e.target.value; render(); };
    $("material").onchange = (e) => { state.material = e.target.value; render(); };
    $("flutes").onchange = (e) => { state.flutes = Number(e.target.value); render(); };
    $("toolMaterial").onchange = (e) => { state.toolMaterial = e.target.value; render(); };
    $("bitType").onchange = (e) => { state.bitType = e.target.value; render(); };

    // tool diameter: changing it also changes what the stepover means
    $("diameter").oninput = (e) => {
      const typed = parseFloat(e.target.value);
      if (!(typed > 0)) return;
      state.diameter = clamp(typed / fmt.lengthScale(state.units), 0.5, 40);
      if (state.stepoverMode === "percent") {
        state.stepover = (state.stepoverPercent / 100) * state.diameter;
      } else {
        state.stepover = Math.min(state.stepover, state.diameter);
      }
      applySliderRanges();
      $("stepover").value = state.stepoverMode === "percent" ? state.stepoverPercent : state.stepover * fmt.lengthScale(state.units);
      render();
    };

    // length sliders
    $("stickout").oninput = (e) => { state.stickout = Number(e.target.value) / fmt.lengthScale(state.units); render(); };
    $("depthOfCut").oninput = (e) => { state.depthOfCut = Number(e.target.value) / fmt.lengthScale(state.units); render(); };
    $("stepover").oninput = (e) => {
      const value = Number(e.target.value);
      if (state.stepoverMode === "percent") {
        state.stepoverPercent = value;
        state.stepover = (value / 100) * state.diameter;
      } else {
        state.stepover = Math.min(value / fmt.lengthScale(state.units), state.diameter);
      }
      render();
    };

    // other sliders
    $("rpm").oninput = (e) => { state.rpm = Number(e.target.value); render(); };
    $("aggressiveness").oninput = (e) => { state.aggressiveness = Number(e.target.value); render(); };
    $("plunge").oninput = (e) => { state.plungePercent = Number(e.target.value); render(); };
    $("autoLimit").onchange = (e) => { state.autoLimit = e.target.checked; render(); };

    // metric / imperial
    document.querySelectorAll("#unitToggle button").forEach((button) => {
      button.onclick = () => {
        state.units = button.dataset.units;
        setActiveButton("unitToggle", button);
        syncInputsFromState();
        render();
      };
    });

    // stepover as distance or percent of diameter
    document.querySelectorAll("#stepoverToggle button").forEach((button) => {
      button.onclick = () => {
        state.stepoverMode = button.dataset.mode;
        if (state.stepoverMode === "percent") {
          state.stepoverPercent = clamp(Math.round((state.stepover / state.diameter) * 100), 1, 100);
        }
        setActiveButton("stepoverToggle", button);
        syncInputsFromState();
        render();
      };
    });
  }

  CNC.ui = {
    init() {
      fillDropdowns();
      bindEvents();
      syncInputsFromState();
      render();
    }
  };
})();

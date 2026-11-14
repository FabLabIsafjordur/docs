/*
 * diagram.js
 * Draws the cross-section SVG: a side view (stock, bit, stickout, DOC)
 * and a top view (bit position and stepover).
 *
 * Call it like:  CNC.drawDiagram(svgElement, state, result);
 */

(function () {
  const fmt = CNC.format;

  const COLORS = {
    stock: "#6b4a2b",
    stockEdge: "#c9a06a",
    shank: "#9aa7b8",
    flutes: "#f59e0b",
    collet: "#3b4656",
    colletText: "#cbd5e1",
    dimension: "#8b97a8",
    highlight: "#ffffff"
  };

  /* Vertical dimension line with end ticks. */
  function verticalDimension(x, y1, y2, color, width) {
    return (
      '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" stroke="' + color + '" stroke-width="' + width + '"/>' +
      '<line x1="' + (x - 4) + '" y1="' + y1 + '" x2="' + (x + 4) + '" y2="' + y1 + '" stroke="' + color + '"/>' +
      '<line x1="' + (x - 4) + '" y1="' + y2 + '" x2="' + (x + 4) + '" y2="' + y2 + '" stroke="' + color + '"/>'
    );
  }

  /* Horizontal dimension line with end ticks. */
  function horizontalDimension(y, x1, x2, color, width) {
    return (
      '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="' + color + '" stroke-width="' + width + '"/>' +
      '<line x1="' + x1 + '" y1="' + (y - 4) + '" x2="' + x1 + '" y2="' + (y + 4) + '" stroke="' + color + '"/>' +
      '<line x1="' + x2 + '" y1="' + (y - 4) + '" x2="' + x2 + '" y2="' + (y + 4) + '" stroke="' + color + '"/>'
    );
  }

  function text(x, y, content, color, anchor, extra) {
    return '<text x="' + x + '" y="' + y + '" fill="' + color + '" font-size="11" text-anchor="' + anchor + '"' + (extra || "") + ">" + content + "</text>";
  }

  /* Left half of the drawing: the bit sticking out of the collet into the stock. */
  function sideView(state) {
    const diameter = state.diameter;
    const stickout = state.stickout;
    const depth = Math.min(state.depthOfCut, stickout);
    const units = state.units;

    const scale = Math.min(4, 190 / stickout);
    const centerX = 110;
    const colletBottom = 40;
    const tipY = colletBottom + stickout * scale;
    const stockTopY = tipY - depth * scale;
    const bitWidth = diameter * scale;

    let g = "";

    // stock
    g += '<rect x="20" y="' + stockTopY + '" width="180" height="' + (tipY - stockTopY + 30) + '" fill="' + COLORS.stock + '" opacity=".75"/>';
    g += '<rect x="20" y="' + stockTopY + '" width="180" height="2" fill="' + COLORS.stockEdge + '"/>';

    // bit: shank in grey, the part buried in the stock in orange
    g += '<rect x="' + (centerX - bitWidth / 2) + '" y="' + colletBottom + '" width="' + bitWidth + '" height="' + (tipY - colletBottom) + '" fill="' + COLORS.shank + '" rx="2"/>';
    g += '<rect x="' + (centerX - bitWidth / 2) + '" y="' + stockTopY + '" width="' + bitWidth + '" height="' + (tipY - stockTopY) + '" fill="' + COLORS.flutes + '" rx="2"/>';

    // collet
    const colletWidth = Math.max(bitWidth + 16, 50);
    g += '<rect x="' + (centerX - colletWidth / 2) + '" y="' + (colletBottom - 26) + '" width="' + colletWidth + '" height="26" fill="' + COLORS.collet + '" rx="3"/>';
    g += text(centerX, colletBottom - 9, "collet", COLORS.colletText, "middle");

    // stickout dimension on the left
    const stickoutX = 34;
    const stickoutMidY = colletBottom + (tipY - colletBottom) / 2;
    g += verticalDimension(stickoutX, colletBottom, tipY, COLORS.dimension, 1);
    g += text(stickoutX + 6, stickoutMidY, "stickout " + fmt.length(stickout, units, units === "in" ? 2 : 0), COLORS.dimension, "middle",
      ' transform="rotate(-90 ' + (stickoutX + 6) + " " + stickoutMidY + ')" dy="-4"');

    // depth of cut dimension on the right
    const docX = 188;
    g += verticalDimension(docX, stockTopY, tipY, COLORS.highlight, 1.5);
    g += text(docX - 6, tipY + 22, "DOC " + fmt.length(state.depthOfCut, units), COLORS.highlight, "end");

    g += text(110, 292, "Side view", COLORS.dimension, "middle");
    return g;
  }

  /* Right half of the drawing: looking down at the bit and its stepover. */
  function topView(state, result) {
    const diameter = state.diameter;
    const stepover = result.stepover;
    const units = state.units;

    const scale = Math.min(5, 130 / (diameter + stepover));
    const centerX = 300;
    const centerY = 110;
    const radius = (diameter * scale) / 2;
    const offset = stepover * scale;
    const firstPassX = centerX - offset / 2;
    const nextPassX = centerX + offset / 2;

    let g = "";

    // next pass (dashed) and current pass (filled)
    g += '<circle cx="' + nextPassX + '" cy="' + centerY + '" r="' + radius + '" fill="none" stroke="' + COLORS.dimension + '" stroke-dasharray="4 3"/>';
    g += '<circle cx="' + firstPassX + '" cy="' + centerY + '" r="' + radius + '" fill="' + COLORS.flutes + '" fill-opacity=".35" stroke="' + COLORS.flutes + '"/>';

    // stepover dimension under the circles
    const dimY = centerY + radius + 22;
    g += horizontalDimension(dimY, firstPassX, nextPassX, COLORS.highlight, 1.5);
    g += text(centerX, dimY + 16, "WOC " + fmt.length(stepover, units) + " (" + ((stepover / diameter) * 100).toFixed(0) + "%)", COLORS.highlight, "middle");

    // diameter label above
    g += text(centerX, centerY - radius - 10, "&#216; " + fmt.length(diameter, units), COLORS.flutes, "middle");

    g += text(centerX, 292, "Top view", COLORS.dimension, "middle");
    return g;
  }

  CNC.drawDiagram = function (svgElement, state, result) {
    svgElement.innerHTML = sideView(state) + topView(state, result);
  };
})();

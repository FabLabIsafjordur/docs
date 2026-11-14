/*
 * format.js
 * Turns millimeter values into text in the unit the person picked.
 * Everything inside the calculator stays in mm, only the display converts.
 */

(function () {
  const MM_PER_INCH = CNC.data.MM_PER_INCH;

  CNC.format = {
    /* Multiply a mm value by this to show it in the chosen unit. */
    lengthScale(units) {
      return units === "in" ? 1 / MM_PER_INCH : 1;
    },

    unitName(units) {
      return units === "in" ? "in" : "mm";
    },

    /* "6.00 mm" or "0.236 in" */
    length(mm, units, digits) {
      const d = digits != null ? digits : (units === "in" ? 3 : 2);
      return (mm * this.lengthScale(units)).toFixed(d) + " " + this.unitName(units);
    },

    /* Feed rates: whole mm/min, or inches/min with one decimal. */
    feedNumber(mmPerMin, units) {
      return units === "in" ? (mmPerMin / MM_PER_INCH).toFixed(1) : String(Math.round(mmPerMin));
    },

    feedUnit(units) {
      return units === "in" ? "in/min" : "mm/min";
    }
  };
})();

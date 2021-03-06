const SVG = require("../svg");

const primitives = [
  "line",
  "circle",
  "ellipse",
  "rect",
  "polygon",
  "polyline",
  "bezier",
  "text",
  "wedge",
  "arc",
  "parabola",
  "regularPolygon",
  "arrow",
];

const groupLevel = ["group"];

const rootLevel = [
  "defs",
  "style",
  // "clipPath", // conflict, clipPath is a constructor AND an assigner
  // "mask",
];

test("svg and group", () => {
  const svg = SVG();
  primitives.forEach(p => expect(typeof svg[p]).toBe("function"));
  groupLevel.forEach(g => expect(typeof svg[g]).toBe("function"));
  rootLevel.forEach(r => expect(typeof svg[r]).toBe("function"));

  const group = SVG.group();
  primitives.forEach(p => expect(typeof group[p]).toBe("function"));
  groupLevel.forEach(g => expect(typeof group[g]).toBe("function"));
  rootLevel.forEach(r => expect(typeof group[r]).not.toBe("function"));

  const defs = SVG.defs();
  primitives.forEach(p => expect(typeof defs[p]).toBe("function"));
  groupLevel.forEach(g => expect(typeof defs[g]).toBe("function"));
  rootLevel.forEach(r => expect(typeof defs[r]).not.toBe("function"));
});

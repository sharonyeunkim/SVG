/**
 * SVG in Javascript (c) Robby Kraft
 */

import {
  line,
  circle,
  ellipse,
  rect,
  polygon,
  polyline,
  bezier,
  text,
  wedge,
  arc,
} from "./primitives";

import {
  regularPolygon,
} from "./polygons";

import {
  straightArrow,
  arcArrow,
} from "./arrows";

import {
  attachClassMethods,
  attachViewBoxMethods,
  attachAppendableMethods,
} from "./methods";

import {
  document,
} from "../window";

const svgNS = "http://www.w3.org/2000/svg";

const drawMethods = {
  line,
  circle,
  ellipse,
  rect,
  polygon,
  polyline,
  bezier,
  text,
  wedge,
  arc,
  straightArrow,
  arcArrow,
  regularPolygon,
};

export const setupSVG = function (svgImage) {
  attachClassMethods(svgImage);
  attachViewBoxMethods(svgImage);
  attachAppendableMethods(svgImage, drawMethods);
};

export const svg = function () {
  const svgImage = document.createElementNS(svgNS, "svg");
  svgImage.setAttribute("version", "1.1");
  svgImage.setAttribute("xmlns", svgNS);
  setupSVG(svgImage);
  return svgImage;
};

export const group = function () {
  const g = document.createElementNS(svgNS, "g");
  attachClassMethods(g);
  attachAppendableMethods(g, drawMethods);
  return g;
};

export const style = function () {
  const s = document.createElementNS(svgNS, "style");
  s.setAttribute("type", "text/css");
  return s;
};

// circular involvement, this is required after definition
drawMethods.group = group;

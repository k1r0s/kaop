var Class = require("./src/Class");
var annotations = require("./src/annotations");

if (typeof module === "object") {
  module.exports = {
    Class: Class,
    annotations: annotations
  };
} else {
  window.Class = Class;
  window.annotations = annotations;
}

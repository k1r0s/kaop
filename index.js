var Class = require("./src/Class");
var annotations = require("./src/annotations");

if (typeof module !== "undefined") {
  window.Class = Class;
  window.annotations = annotations;
} else {
  module.exports = {
    Class: Class,
    annotations: annotations
  };
}

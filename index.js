var Class = require("./src/Class");
var annotations = require("./src/annotations");

if (window) {
  window.Class = Class;
  window.annotations = annotations;
} else {
  module.exports = {
    Class: Class,
    annotations: annotations
  };
}

var Class = require("./src/Class");
var annotations = require("./src/annotations");

if (typeof window === "object") {
  window.Class = Class;
  window.annotations = annotations;
} else {
  module.exports = {
    Class: Class,
    annotations: annotations
  };
}

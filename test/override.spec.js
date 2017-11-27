var type = require('../');
var override = require('../override');

var CustomList = type.inherits(Array, {
  total: 0,
  push: [override.apply, function() {
    this.sum();
  }],
  pop: [override.implement, function(parent) {
    parent();
    this.sum();
  }],
  unshift: [override.apply, function() {
    this.sum();
  }],
  shift: [override.implement, function(parent) {
    parent();
    this.sum();
  }],
  sum: function() {
    this.total = this.reduce((a, b) => a + b);
  }
});

var list1, list2;

describe("advice specs", () => {
  beforeEach(() => {
    list1 =  new Array;
    list2 =  new CustomList;
  });

  it("should be able to call custom actions without messing proto behavior", () => {
    list2.push(3, 4);
    list1.push(3, 4);
    expect(list1[1]).toEqual(list2[1]);
    list2.pop();
    list1.pop();
    expect(list1[1]).toEqual(list2[1]);
  });

  it("extended type should be able keep original behavior featuring new things", () => {
    list2.push(3, 4);
    list2.unshift(9);
    list2.push(5, 4, 7, 7);
    expect(list2.total).toEqual(39);
    list2.pop();
    list2.shift();
    list2.push(3);
    list2.push(9);
    expect(list2.total).toEqual(35);
  });
});

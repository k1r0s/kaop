var type = require('../');
var override = require('../override');

var CustomList = type.inherits(Array, {
  push: [override.apply, function(){
  }],
  pop: [override.apply, function(){
  }],
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
})

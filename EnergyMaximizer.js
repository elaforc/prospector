const { Position } = require('./hlt/positionals');

let MapConverter = class {
  convertMap(gameMap) {
    let mapArray = [];
    for (let i = 0; i < gameMap.width; i++) {
      let row = []
      for (let j = 0; j < gameMap.height; j++) {
        row.push(gameMap.get(new Position(i,j)).haliteAmount);
      }
      mapArray.push(row);
    }
    return mapArray;
  }
}

let Point = class {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
}

let BackPointer = class {
  constructor(energy, prevXPosition, currentXPosition) {
    this.energy = energy;
    this.current = currentXPosition;
    this.xPointer = prevXPosition;
  }
}

let EnergyMaximizer = class {
  constructor(map) {
    this.energies = map;
  }
}

module.exports = {
    EnergyMaximizer,
    MapConverter
};

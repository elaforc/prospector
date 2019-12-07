const { Position } = require('./hlt/positionals');
const logging = require('./hlt/logging');

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

  toString() {
    return `[${this.x},${this.y}]`;
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

  findMaximumBackpointer(data) {
    let current = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i].energy > current.energy) {
        current = data[i];
      }
    }
    return current;
  }

  //this method finds the max seam and also "removes"
  //the max seam by 0ing out the elements
  //this allows the method to be called multiple times to find
  //a list of max seams without finding the same one over and
  //over
  getMaximumSeam(seams) {
    let backTrace = [];
    let bottomRow = seams[seams.length - 1];
    let node = this.findMaximumBackpointer(bottomRow);
    backTrace.push(new Point(node.current, seams.length - 1));
    this.energies[node.current,seams.length - 1] = 0;
    for (let y = seams.length - 2; y >= 0; y--){
      node = seams[y][node.xPointer];
      backTrace.push(new Point(node.current, y));
      this.energies[node.current][y] = 0;
    }
    return backTrace.reverse();
  }

  computeMaximumSeam() {
    let seamEnergies = [];
    let previousSeam = [];
    for(let i = 0; i < this.energies[0].length; i++) {
      previousSeam.push(new BackPointer(this.energies[0][i], null, i));
    }
    seamEnergies.push(previousSeam);

    for (let i = 1; i < this.energies.length; i++) {
      let energiesRow = this.energies[i];

      let seamEnergiesRow = [];
      for (let j = 0; j < seamEnergies[i-1].length; j++) {
        const left = Math.max(j - 1, 0);
        const right = Math.min(j + 1, seamEnergies[i-1].length - 1);
        const maxParent = this.findMaximumBackpointer(seamEnergies[i-1].slice(left, right + 1));
        const maxSeamEnergy = new BackPointer(energiesRow[j] + seamEnergies[i-1][maxParent.current].energy, 
                                                          maxParent.current, j);
        seamEnergiesRow.push(maxSeamEnergy);
      }

      seamEnergies.push(seamEnergiesRow);
    }

    return this.getMaximumSeam(seamEnergies);
  }

}

module.exports = {
    EnergyMaximizer,
    MapConverter
};

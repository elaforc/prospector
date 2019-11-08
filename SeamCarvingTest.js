let SeamCarvingBackPointer = class {
  constructor(energy, pointer, current) {
    this.energy = energy;
    this.current = current;
    this.xPointer = pointer;
  }
}

let SeamCarving = class {
  constructor(arr) {
    this.energies = arr;
  }

  findMinimumParent(data) {
    let current = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i].energy < current.energy) {
        current = data[i];
      }
    }
    return current;
  }

  computeMinimumSeam() {
    let seamEnergies = [];
    let previousSeam = [];
    for(let i = 0; i < this.energies[0].length; i++) {
      previousSeam.push(new SeamCarvingBackPointer(this.energies[0][i], null, i));
    }
    seamEnergies.push(previousSeam);

    for (let i = 1; i < this.energies.length; i++) {
      let energiesRow = this.energies[i];

      let seamEnergiesRow = [];
      for (let j = 0; j < energiesRow.length; j++) {
        const left = Math.max(j - 1, 0);
        const right = Math.min(j + 1, energiesRow.length - 1);
        const minParent = this.findMinimumParent(seamEnergies[i-1].slice(left, right + 1));
        const minSeamEnergy = new SeamCarvingBackPointer(energiesRow[j] + seamEnergies[i-1][minParent.current].energy, 
                                                          minParent.current, j);
        seamEnergiesRow.push(minSeamEnergy);
      }

      seamEnergies.push(seamEnergiesRow);
    }

    return seamEnergies;
  }

  computeMinimumSeamEnergy() {
    let previousSeam = this.energies[0];
    for (let i = 1; i < this.energies.length; i++) {
      let energiesRow = this.energies[i];

      let seamEnergiesRow = [];
      for (let j = 0; j < energiesRow.length; j++) {
        const left = Math.max(j - 1, 0);
        const right = Math.min(j + 1, energiesRow.length - 1);
        const minSeamEnergy = energiesRow[j] + Math.min(...previousSeam.slice(left, right + 1));
        seamEnergiesRow.push(minSeamEnergy);
      }

      previousSeam = seamEnergiesRow;
    }

    return Math.min(...previousSeam);
  }
};

const arr = [
  [9, 9, 0, 9, 9],
  [9, 1, 9, 5, 9],
  [9, 1, 9, 9, 0],
  [9, 1, 9, 0, 9]
];

const seamCarving = new SeamCarving(arr);
console.log(seamCarving.computeMinimumSeam());


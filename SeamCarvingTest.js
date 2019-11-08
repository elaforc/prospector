let SeamCarving = class {
  constructor(arr) {
    this.energies = arr;
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
console.log(seamCarving.computeMinimumSeamEnergy());


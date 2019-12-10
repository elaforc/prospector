const { EnergyMaximizer, MapConverter } = require('../EnergyMaximizer');

const maxArr = [
  [1, 1, 9, 7, 1],
  [1, 9, 1, 5, 8],
  [1, 1, 9, 10, 9],
  [1, 10, 1, 1, 1]
];

const energyMaximizer = new EnergyMaximizer(maxArr);
let seams = [];

for (let i = 0; i < 3; i++) {
  let seam = energyMaximizer.computeMaximumSeam();
  console.log(seam);
  console.log(energyMaximizer.energies);
  seams.push(seam);
}

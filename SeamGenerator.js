const hlt = require('./hlt');
const constants = require('./constants');
const { EnergyMaximizer, MapConverter } = require('./EnergyMaximizer');

let SeamGenerator = class {
  generateTopSeams(gameMap, player, seams) {
    const converter = new MapConverter();
    let energies = converter.convertMap(gameMap);

    const energyMaximizer = new EnergyMaximizer(energies);
    
    for (let i = 0; i < constants.NUMBER_OF_SEAMS; i++) {
      seams.push(energyMaximizer.computeMaximumSeam());
    }
  }
}

module.exports = {
  SeamGenerator
};
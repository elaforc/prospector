const hlt = require('./hlt');
const constants = require('./constants');
const { Miner, MapConverter } = require('./Miner');

let SeamGenerator = class {
  generateTopSeams(gameMap, player, seams) {
    const converter = new MapConverter();
    let energies = converter.convertMap(gameMap);

    const miner = new Miner(energies);
    
    for (let i = 0; i < constants.NUMBER_OF_SEAMS; i++) {
      seams.push(miner.computeMaximumSeam());
    }
  }
}

module.exports = {
  SeamGenerator
};
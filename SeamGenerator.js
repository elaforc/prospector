const hlt = require('./hlt');
const constants = require('./constants');
const { EnergyMaximizer, MapConverter } = require('./EnergyMaximizer');

let SeamGenerator = class {
  generateTopSeams(gameMap, player, seams) {
    const converter = new MapConverter();
    let energies = converter.convertMap(gameMap);

    //note only do SEARCH_AREA on each size because of what is a reasonable
    //space for the ships to try and get too in time, but this maybe worth
    //expanding as a tuning mechanism.
    const energyMaximizer = new EnergyMaximizer(energies.map(
                              i => i.slice(Math.max(player.shipyard.position.x - constants.SEARCH_AREA, 0), 
                                           Math.min(player.shipyard.position.x + constants.SEARCH_AREA, gameMap.height))));
    
    for (let i = 0; i < constants.NUMBER_OF_SEAMS; i++) {
      seams.push(energyMaximizer.computeMaximumSeam());
    }
  }
}

module.exports = {
  SeamGenerator
};
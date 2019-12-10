const hlt = require('./hlt');
const constants = require('./constants');

let DropOffCreator = class {
  shouldCreateDropOff(game, player) {
    return game.turnNumber > constants.START_DROPOFF_TURN &&
           game.turnNumber < (constants.STOP_BUILDING_TURN / 100) * hlt.constants.MAX_TURNS &&
           player.haliteAmount >= hlt.constants.DROPOFF_COST &&
           player.getShips().length > 0 &&
           player.getDropoffs().length < constants.MAXIMUM_NUM_DROPOFFS
  }

  makeDropOff(gameMap, player) {
    let distance = 0;
    let dropOffId = -1;
    let ships = player.getShips();
    let dropOffs = player.getDropoffs();
    dropOffs.push(player.shipyard);

    for (let i = 0; i < ships.length; i++) {
      for (let j = 0; j < dropOffs.length; j++) {
        let entityOne = ships[i];
        let entityTwo = dropOffs[j];
        let current = gameMap.calculateDistance(entityOne.position, entityTwo.position);
        if (current > distance) {
          dropOffId = ships[i].id;
          distance = gameMap.calculateDistance(entityOne.position, entityTwo.position);
        }
      }
    }

    return {dropOffId: dropOffId, command: player.getShip(dropOffId).makeDropoff()};
  }
}

module.exports = {
  DropOffCreator
};
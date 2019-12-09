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
    for (const ship of player.getShips()) {
      if (gameMap.calculateDistance(player.shipyard.position, ship.position) > distance) {
        dropOffId = ship.id;
        distance = gameMap.calculateDistance(player.shipyard.position, ship.position);
      }
    }

    return {dropOffId: dropOffId, command: player.getShip(dropOffId).makeDropoff()};
  }
}

module.exports = {
  DropOffCreator
};
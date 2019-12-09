const hlt = require('./hlt');
const constants = require('./constants');

let ShipCreator = class {
  shouldCreateShip(game, player, gameMap) {
    return game.turnNumber < (constants.STOP_BUILDING_TURN / 100) * hlt.constants.MAX_TURNS &&
           player.haliteAmount >= hlt.constants.SHIP_COST &&
           player.getShips().length < constants.NUMBER_OF_SHIPS &&
           !gameMap.get(player.shipyard).isOccupied;
  }

  makeShip(player) {
    return player.shipyard.spawn()
  }
}

module.exports = {
  ShipCreator
};
const hlt = require('./hlt');
const constants = require('./constants');

let Retreater = class {
  shouldReturnToBase(ship, dropOffId, game) {
    return (ship.id !== dropOffId &&
           ship.haliteAmount > hlt.constants.MAX_HALITE * (constants.RETREAT_PERCENTAGE / 100)) ||
           (ship.id !== dropOffId &&
            game.turnNumber > 0.90 * hlt.constants.MAX_TURNS &&
            ship.haliteAmount > hlt.constants.MAX_HALITE * (constants.RETREAT_PERCENTAGE / 200)) ||
           (ship.id !== dropOffId &&
            game.turnNumber > 0.95 * hlt.constants.MAX_TURNS);
  }

  retreat(gameMap, player, ship) {
    let shipyardDistance = gameMap.calculateDistance(player.shipyard.position, ship.position);
    let dropOffDistance = 100000;

    if (player.getDropoffs().length > 0) {
      dropOffDistance = gameMap.calculateDistance(player.getDropoffs()[0].position, ship.position);
    }

    const destination = shipyardDistance < dropOffDistance ? player.shipyard.position : 
                                                             player.getDropoffs()[0].position;
    const safeMove = gameMap.naiveNavigate(ship, destination);
    return ship.move(safeMove);
  }
}

module.exports = {
  Retreater
};
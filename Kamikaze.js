const hlt = require('./hlt');
const { Position } = require('./hlt/positionals');

let Kamikaze = class {
  shouldDestroyItself(game, ship) {
    return game.turnNumber > 0.95 * hlt.constants.MAX_TURNS &&
            ship.halite < 10;
  }

  //since there is no destroy method just try and move out of the way
  destroy(ship, gameMap) {
    let direction = Direction.getAllCardinals()[Math.floor(4 * Math.random())];
    destination = ship.position.directionalOffset(direction);
    safeMove = gameMap.naiveNavigate(ship, destination);
    return ship.move(safeMove);
  }
}

module.exports = {
  Kamikaze
};
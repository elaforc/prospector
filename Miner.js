const { Position, Direction } = require('./hlt/positionals');
const { GameMap } = require('./hlt/gameMap');
const hlt = require('./hlt');
const constants = require('./constants');

let Miner = class {
  shouldMoveToAnotherLocation(ship, dropOffId, gameMap) {
    return ship.id !== dropOffId && 
           gameMap.get(ship.position).haliteAmount < hlt.constants.MAX_HALITE * (constants.GET_MOVING_PERCENTAGE / 100);
  }

  //this function is used to find the closest **VIABLE**
  //game map position within the seam to the 
  //given ship (source)
  findClosestSafeMove(source, seam, gameMap){
    let distance = 1000;
    let pointer = 0;
    for (let i = 0; i < seam.length; i++) {
      let currentDistance = Math.abs(source.x - seam[i].x) + Math.abs(source.y - seam[i].y); //basic cartesian distance function
      let seamPosition = new Position(seam[i].x, seam[i].y);
      if (currentDistance == 0) {continue;} //if the same position, do nothing
      else if (gameMap.get(seamPosition).haliteAmount < 100) {continue;} //if the position has a small amount of halite
      else if (!gameMap.get(seamPosition).isEmpty) { continue; } //collision detection
      else if (currentDistance < distance) {
        distance = currentDistance;
        pointer = i;
      }
      else {
        continue; //if the position is farther away than the best current pointer
      }
    }
    return pointer;
  }

  navigate(gameMap, ship, seams) {
    const source = ship.position;
    const seamIndex = Math.floor(Math.random() * constants.NUMBER_OF_SEAMS);

    let destination = this.findClosestSafeMove(source, seams[seamIndex], gameMap);
    let [yDir, xDir] = GameMap._getTargetDirection(source, seams[seamIndex][destination]);

    let safeMove;
    if (yDir === null && xDir === null) { safeMove = Direction.Still; }
    else if (yDir === null) { safeMove = xDir; }
    else if (xDir === null) { safeMove = yDir; }
    else { Math.floor(Math.random() * 2) === 0 ? safeMove = yDir : safeMove = xDir; }
    let targetPos = ship.position.directionalOffset(safeMove);
    if (!gameMap.get(targetPos).isOccupied) {
      gameMap.get(targetPos).markUnsafe(ship);
      return ship.move(safeMove);
    }
    else { //if target is occupied, just go a random way
      let direction = Direction.getAllCardinals()[Math.floor(4 * Math.random())];
      destination = ship.position.directionalOffset(direction);
      safeMove = gameMap.naiveNavigate(ship, destination);
      return ship.move(safeMove);
    }
  }
}

module.exports = {
  Miner
};
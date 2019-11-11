const hlt = require('./hlt');
const { Position, Direction } = require('./hlt/positionals');
const { GameMap } = require('./hlt/gameMap');
const { EnergyMaximizer, MapConverter } = require('./EnergyMaximizer');
const logging = require('./hlt/logging');

function findClosestSafeMove(source, seam, gameMap){
  let distance = 1000;
  let pointer = 0;
  for (let i = 0; i < seam.length; i++) {
    let currentDistance = Math.abs(source.x - seam[i].x) + Math.abs(source.y - seam[i].y);
    let seamPosition = new Position(seam[i].x, seam[i].y);
    if (currentDistance == 0) {continue;}
    else if (gameMap.get(seamPosition).haliteAmount < 50) {continue;}
    else if (!gameMap.get(seamPosition).isEmpty) { continue; }
    else if (currentDistance < distance) {
      distance = currentDistance;
      pointer = i;
    }
    else {
      continue;
    }
  }
  return pointer;
}

const game = new hlt.Game();
game.initialize().then(async () => {
    // At this point "game" variable is populated with initial map data.
    // This is a good place to do computationally expensive start-up pre-processing.
    // As soon as you call "ready" function below, the 2 second per turn timer will start.
    await game.ready('SeamCarvingBot');

    logging.info(`My Player ID is ${game.myId}.`);

    while (true) {
        await game.updateFrame();

        const { gameMap, me } = game;
        const converter = new MapConverter();
        let energies = converter.convertMap(gameMap);
        const shipYardXPosition = me.shipyard.position.x;
        const energyMaximizer = new EnergyMaximizer(energies.map(
                                      i => i.slice(shipYardXPosition - 5, shipYardXPosition + 5)));
        let seam = energyMaximizer.computeMaximumSeam();

        const commandQueue = [];

        for (const ship of me.getShips()) {
          if (ship.haliteAmount > hlt.constants.MAX_HALITE / 4) {
            const destination = me.shipyard.position;
            const safeMove = gameMap.naiveNavigate(ship, destination);
            commandQueue.push(ship.move(safeMove));
          }
          else if (gameMap.get(ship.position).haliteAmount < hlt.constants.MAX_HALITE / 10) {
            const source = ship.position;
            const destination = findClosestSafeMove(source, seam, gameMap);
            let [yDir, xDir] = GameMap._getTargetDirection(source, seam[destination]);
            let safeMove;
            if (yDir === null && xDir === null) { safeMove = Direction.Still; }
            else if (yDir === null) { safeMove = xDir; }
            else if (xDir === null) { safeMove = yDir; }
            else { safeMove = yDir; } //probably want to randomize xDir vs yDir to create some entropy or use the one that is safe
            const targetPos = ship.position.directionalOffset(safeMove);
            if (!gameMap.get(targetPos).isOccupied) {
                gameMap.get(targetPos).markUnsafe(ship);
                commandQueue.push(ship.move(safeMove));
            }
          }
        }

        if (me.haliteAmount >= hlt.constants.SHIP_COST &&
            !gameMap.get(me.shipyard).isOccupied) {
            commandQueue.push(me.shipyard.spawn());
        }

        await game.endTurn(commandQueue);
    }
});

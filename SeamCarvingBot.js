const hlt = require('./hlt');
const { Position, Direction } = require('./hlt/positionals');
const { GameMap } = require('./hlt/gameMap');
const { EnergyMaximizer, MapConverter } = require('./EnergyMaximizer');
const logging = require('./hlt/logging');
const constants = require('./constants');

//this function is used to find the closest **VIABLE**
//game map position within the seam to the 
//given ship (source)
function findClosestSafeMove(source, seam, gameMap){
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

const game = new hlt.Game();

game.initialize().then(async () => {
    // At this point "game" variable is populated with initial map data.
    // This is a good place to do computationally expensive start-up pre-processing.
    // As soon as you call "ready" function below, the 2 second per turn timer will start.
    await game.ready('TeamEric');

    logging.info(`My Player ID is ${game.myId}.`);

    while (true) {
        await game.updateFrame();

        const { gameMap, me } = game;
        const converter = new MapConverter();
        let energies = converter.convertMap(gameMap);
        const shipYardXPosition = me.shipyard.position.x;
        //note only do SEARCH_AREA on each size because of what is a reasonable
        //space for the ships to try and get too in time, but this maybe worth
        //expanding as a tuning mechanism.
        const energyMaximizer = new EnergyMaximizer(energies.map(
                                      i => i.slice(Math.max(shipYardXPosition - constants.SEARCH_AREA, 0), 
                                                   Math.min(shipYardXPosition + constants.SEARCH_AREA, gameMap.height))));
        //find X energy laden seams
        //need more than 1 to create some
        //entropy and get out of local maximums
        let seams = [];
        for (let i = 0; i < constants.NUMBER_OF_SEAMS; i++) {
          seams.push(energyMaximizer.computeMaximumSeam());
        } 

        const commandQueue = [];
        let dropOffId = -1;

        //create a dropoff under the right conditions
        //assumes only one dropoff is made at the moment
        if (game.turnNumber > constants.START_DROPOFF_TURN &&
            game.turnNumber < (constants.STOP_BUILDING_TURN / 100) * hlt.constants.MAX_TURNS &&
            me.haliteAmount >= hlt.constants.DROPOFF_COST &&
            me.getShips().length > 0 &&
            me.getDropoffs().length < constants.MAXIMUM_NUM_DROPOFFS) {
              let distance = 0;
              for (const ship of me.getShips()) {
                if (gameMap.calculateDistance(me.shipyard.position, ship.position) > distance) {
                  dropOffId = ship.id;
                  distance = gameMap.calculateDistance(me.shipyard.position, ship.position);
                }
              }
              commandQueue.push(me.getShip(dropOffId).makeDropoff());
        }

        for (const ship of me.getShips()) {
          // if ship is getting close to full
          // go back to shipyard to drop off halite
          if (ship.id !== dropOffId && ship.haliteAmount > hlt.constants.MAX_HALITE * (constants.RETREAT_PERCENTAGE / 100)) {
            let shipyardDistance = gameMap.calculateDistance(me.shipyard.position, ship.position);
            let dropOffDistance = 100000;
            if (me.getDropoffs().length > 0) {
              dropOffDistance = gameMap.calculateDistance(me.getDropoffs()[0].position, ship.position);
            }
            const destination = shipyardDistance < dropOffDistance ? me.shipyard.position : me.getDropoffs()[0].position;
            const safeMove = gameMap.naiveNavigate(ship, destination);
            commandQueue.push(ship.move(safeMove));
          }

          // if the ships current position has less than
          // X halite should go looking elsewhere for more
          else if (ship.id !== dropOffId && gameMap.get(ship.position).haliteAmount < hlt.constants.MAX_HALITE * (constants.GET_MOVING_PERCENTAGE / 100)) {
            const source = ship.position;
            const seamIndex = Math.floor(Math.random() * constants.NUMBER_OF_SEAMS);
            const entropy = Math.floor(Math.random() * constants.ENTROPY);

            // added a periodic randomness to get out of local maximums
            if (entropy == 0) {
              const destination = me.shipyard.position;
              const safeMove = gameMap.naiveNavigate(ship, destination);
              commandQueue.push(ship.move(safeMove));
            }

            //find the best next position on the most maximized
            //energy seam
            else {
              let destination = findClosestSafeMove(source, seams[seamIndex], gameMap);
              let [yDir, xDir] = GameMap._getTargetDirection(source, seams[seamIndex][destination]);

              let safeMove;
              if (yDir === null && xDir === null) { safeMove = Direction.Still; }
              else if (yDir === null) { safeMove = xDir; }
              else if (xDir === null) { safeMove = yDir; }
              else { Math.floor(Math.random() * 2) === 0 ? safeMove = yDir : safeMove = xDir; }
              let targetPos = ship.position.directionalOffset(safeMove);
              if (!gameMap.get(targetPos).isOccupied) {
                gameMap.get(targetPos).markUnsafe(ship);
                commandQueue.push(ship.move(safeMove));
              }
              else { //if target is occupied, just go a random way
                let direction = Direction.getAllCardinals()[Math.floor(4 * Math.random())];
                destination = ship.position.directionalOffset(direction);
                safeMove = gameMap.naiveNavigate(ship, destination);
                commandQueue.push(ship.move(safeMove));
              }
            }
          }

          // there is an implicit else here that says
          // if it isn't time to go back and the ships 
          // current position has enough halite then just
          // hang around collecting halite
        }

        //this is an important tuning mechanism
        //stop spending halite if we are approaching
        //the end of the game or if we don't have enough
        //halite to make one. Also adding a parameter to see if making
        //less ships helps (so can make dropoff)
        if (game.turnNumber < (constants.STOP_BUILDING_TURN / 100) * hlt.constants.MAX_TURNS &&
            me.haliteAmount >= hlt.constants.SHIP_COST &&
            me.getShips().length < constants.NUMBER_OF_SHIPS &&
            !gameMap.get(me.shipyard).isOccupied) {
            commandQueue.push(me.shipyard.spawn());
        }

        await game.endTurn(commandQueue);
    }
});

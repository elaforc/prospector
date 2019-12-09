const { DropOffCreator } = require('./DropOffCreator');
const { SeamGenerator } = require('./SeamGenerator');
const { Retreater } = require('./Retreater');
const { Miner } = require('./Miner');
const { ShipCreator } = require('./ShipCreator');

const hlt = require('./hlt');
const logging = require('./hlt/logging');
const constants = require('./constants');

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
        const commandQueue = [];
        const dropOffCreator = new DropOffCreator();
        const shipCreator = new ShipCreator();
        const seamGenerator = new SeamGenerator();
        const retreater = new Retreater();
        const miner = new Miner();
        let seams = [];
        let dropOffId = -1;

        //find X energy laden seams
        //need more than 1 to create some
        //entropy and get out of local maximums
        seamGenerator.generateTopSeams(gameMap, me, seams);

        //create a dropoff under the right conditions
        //assumes only one dropoff is made at the moment
        if (dropOffCreator.shouldCreateDropOff(game, me)) {
          let obj = dropOffCreator.makeDropOff(gameMap, me)
          dropOffId = obj.dropOffId;
          commandQueue.push(obj.command);
        }

        for (const ship of me.getShips()) {
          // if ship is getting close to full
          // go back to shipyard to drop off halite
          if (retreater.shouldReturnToBase(ship, dropOffId)) {
            commandQueue.push(retreater.retreat(gameMap, me, ship));
          }

          // if the ships current position has less than
          // X halite should go looking elsewhere for more
          else if (miner.shouldMoveToAnotherLocation(ship, dropOffId, gameMap)) {
            const entropy = Math.floor(Math.random() * constants.ENTROPY);

            // added a periodic randomness to get out of local maximums
            if (entropy == 0) {
              const destination = me.shipyard.position;
              const safeMove = gameMap.naiveNavigate(ship, destination);
              commandQueue.push(ship.move(safeMove));
            }

            //find the best next position on the most maximized energy seam
            else {
              commandQueue.push(miner.navigate(gameMap, ship, seams));
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
        if (shipCreator.shouldCreateShip(game, me, gameMap)) {
            commandQueue.push(shipCreator.makeShip(me));
        }

        await game.endTurn(commandQueue);
    }
});

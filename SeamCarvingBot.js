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
        let dropOffId = -1; //used to ensure ship doesn't get two commands

        //find muliple energy laden seams within the game map
        //need more than 1 to create entropy and get out of local maximums
        seamGenerator.generateTopSeams(gameMap, me, seams);

        //assumes only one dropoff is made at the moment
        if (dropOffCreator.shouldCreateDropOff(game, me)) {
          let obj = dropOffCreator.makeDropOff(gameMap, me)
          dropOffId = obj.dropOffId;
          commandQueue.push(obj.command);
        }

        //every game turn we should tell every ship what to do
        for (const ship of me.getShips()) {

          // if ship is getting close to full capacity
          // retreat to nearest drop off location
          if (retreater.shouldReturnToBase(ship, dropOffId)) {
            commandQueue.push(retreater.retreat(gameMap, me, ship));
          }

          // if the ships current game position has too little halite
          // should go to the nearest maximum seam location
          else if (miner.shouldMoveToAnotherLocation(ship, dropOffId, gameMap)) {
            const entropy = Math.floor(Math.random() * constants.ENTROPY);

            // added periodic randomness to get out of local maximums
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

          // there is an implicit else here that says if it isn't time to go 
          // back and the ships current position has enough halite then just
          // stay still collecting halite
        }

        // this is an important turning mechanism. We should not just create 
        // ships just because we have enough halite to do so
        if (shipCreator.shouldCreateShip(game, me, gameMap)) {
            commandQueue.push(shipCreator.makeShip(me));
        }

        await game.endTurn(commandQueue);
    }
});

module.exports = {
    /**
     * Number of seams to select from when choosing a path
     * The larger the number, the more random the possibilities
     */
    NUMBER_OF_SEAMS: 5,
    /**
     * The size of grid to seach for maximum seams
     * The larger the size, the farther away from the
     * shipyard a ship must go to find energy
     */
    SEARCH_AREA: 8,
    /**
     * What percentage of the game to stop building
     * entities. After this percentage is hit the 
     * game will just focus on collecting halite with
     * the entities it has.
     */
    STOP_BUILDING_TURN: 75,
    /**
     * The turn number to start considering
     * building a dropoff. If built too soon the dropoff
     * will likely be really close to the shipyard
     */
    START_DROPOFF_TURN: 20,
    /**
     * Maximum number of dropoffs to build
     */
    MAXIMUM_NUM_DROPOFFS: 1,
    /**
     * What percentage of maximum capacity should a ship
     * go back to drop off halite
     */
    RETREAT_PERCENTAGE: 80,
    /**
     * What percentage of halite remaining should a ship
     * decide to move on to another cell in the map
     */
    GET_MOVING_PERCENTAGE: 10,
    /**
     * What percentage of the time should a ship choose
     * a random direction instead of trying to follow the 
     * seam. This is important otherwise every ship is trying
     * to do the same thing.
     */
    ENTROPY: 5,
    /**
     * Number of ships to build before focusing on gathering
     * halite
     */
    NUMBER_OF_SHIPS: 7
};

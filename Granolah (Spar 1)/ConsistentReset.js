// Auther : Carlo794
var resetHandler;

// TIMER IDS
var CHECK_RESET = 99

function init(event) {
    npcResetHandler = new resetHandler(event.npc);
}

function timer(event) {
    switch(event.id) {
        case CHECK_RESET:
            npcResetHandler.checkReset();
            break;
    }
}

function tick(event)
{
    npcResetHandler.compareTarget();
}

// Reset Handler class -----------------------------------------

function resetHandler(npc) 
{
    this.resetCheckDelay = 60;
    this.npc = npc;
    this.world = npc.getWorld();
    this.npcUID = npc.getUniqueID();
    this.checkWorldData();
}

resetHandler.prototype.checkWorldData = function()
{
    // Assign npc reset data to world on init
    if (this.world.getTempData(this.npcUID + "RUN_RESET_CHECK") || !this.world.hasTempData(this.npcUID + "RUN_RESET_CHECK")){
        this.npc.timers.forceStart(99, this.resetCheckDelay, false);
    } else {
        this.world.setTempData(this.npcUID + "RUN_RESET_CHECK", true);
    }
}

resetHandler.prototype.checkReset = function()
{
    var players = this.npc.getSurroundingEntities(this.npc.getAggroRange(), 1);
    for(var i in players) {
        var key = this.npcUID + players[i].getUniqueID();
        var playerFlag = players[i].hasTempData(key);
        var worldFlag = this.world.hasTempData(key);

        if(!worldFlag && !playerFlag) {
            // !set && !set (new join - reset npc, set player+world flags, skip next init)
            this.world.setTempData(this.npcUID + "RUN_RESET_CHECK", false);
            this.world.setTempData(key, true);
            players[i].setTempData(key, true);
            this.npc.getTimers().clear();
            this.npc.reset();
        } else if (worldFlag && !playerFlag) { 
            // set && !set (crash/relog, dont reset, set player flag, dont skip next init)
            this.world.setTempData(this.npcUID + "RUN_RESET_CHECK", true);
            players[i].setTempData(key, true);
        } else if (worldFlag && playerFlag) { 
            // set && set (player willingly left, reset fight, skip next init)
            this.world.setTempData(this.npcUID + "RUN_RESET_CHECK", false);
            this.npc.getTimers().clear();
            this.npc.reset();
        }
    }
}

resetHandler.prototype.compareTarget = function()
{
    var target = this.npc.getAttackTarget();
    if(this.previousTarget && !target && this.previousTarget.getHealth() == 0) {
        var nextTarget = this.findPlayer() // Are there any other players to attack?
        var worldFlag = (nextTarget) ? this.world.getTempData(this.npcUID+nextTarget.getUniqueID()) : null // Does the world think the player should be here?
        if(nextTarget && worldFlag) {
            nextTarget.setTempData(this.npcUID+nextTarget.getUniqueID(), true) // To be 100% sure that the world+npc thinks the player should be here
        } else {
            this.world.removeTempData(this.npc.getUniqueID() + this.previousTarget.getUniqueID()) // clear world's reference to the player that died (player already loses reference on death anyways)
            this.world.setTempData(this.npcUID + "RUN_RESET_CHECK", true)
            this.npc.timers.clear()
            this.npc.reset()
        }
    }
    this.previousTarget = this.npc.getAttackTarget();
}

/** Helper function to return the first vulernable non fusion spectator player found in range
 * @returns {IPlayer}
 */
resetHandler.prototype.findPlayer = function()
{
    var players = this.npc.getSurroundingEntities(this.npc.getAggroRange(), 1)
    for (var i in players) {
        if (!players[i].getDBCPlayer().isDBCFusionSpectator() && players[i].getMode() != 1) {
            return players[i]
        }
    }
    return null
}

// -----------------------------------------------------------------------------
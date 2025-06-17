//ZS Scripting Library! Functions used by a TON of npcs!
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Riken/Mighty/Noxie

//our object storing every single function
var libraryObject = {
    debugMessage: sendDebugMessage,
    startGlobalTimer: startGlobalTimer,
    checkReset: checkReset,
    animationHandler: animationHandler,
    dbcDisplayHandler: dbcDisplayHandler
}

// TIMERS
var dbcDisplayHandler_UPDATE_FORM = 301;
var dbcDisplayHandler_DISABLE_AURA = 302;

//gets the world with id 0, sagaworld
var world = API.getIWorld(0);
world.setTempData("library", libraryObject);

// Save timers to temp data
function init(event) { world.setTempData("libTimers", event.npc.timers); }

// Timers pull object and compare to server time
function timer(event) {
    var id = event.id;
    // Get object array for specific timer and cycle through array
    var objectArray = world.getTempData("" + id + API.getServerTime());
    for(var i in objectArray) {
        var object = objectArray[i];

        // ADD TIMER FUNCTIONALITY
        switch(event.id) {
            case(dbcDisplayHandler_UPDATE_FORM):
                // Handle updating quick transform
                if(!object instanceof dbcDisplayHandler) continue;
                object.qtUpdateForm();
                break;

            case(dbcDisplayHandler_DISABLE_AURA):
                // Handle ending quick transform
                if(!object instanceof dbcDisplayHandler) continue;
                objectArray[i].toggleAura(false);
                break;
        }
    }
    world.removeTempData("" + id + API.getServerTime());
}


// GLOBAL FUNCTIONS --------------------------------------------------------------------------------------------------

/** Starts a timer on the global script npc
 * @param {int} timerId - Id of the timer to start
 * @param {int} duration - Duration of the timer in ticks 
 * @param {Boolean} timerRepeats - If timer repeats
 * @param {Object} object - Class object required by timer
 */
function startGlobalTimer(timerId, duration, timerRepeats, object)
{
    var world = API.getIWorld(0);
    var timers = world.getTempData("libTimers");

    // Calculates end time of timer
    var dataId =  timerId + "" + (API.getServerTime() + duration + 1);

    // If this timer is already being used push the new object into the same array
    if(world.hasTempData(dataId)) world.setTempData(dataId, world.getTempData(dataId).push(object));
    // If the timer doesn't exist create a new array containing only the one object
    else world.setTempData(dataId, new Array(object));
    timers.forceStart(timerId, duration, timerRepeats);
}

/** Sends a message to a player
 * @param {IPlayer} playerName 
 * @param {String} text 
 */
function sendDebugMessage(playerName, text) {
    API.getPlayer(playerName).sendMessage(text);
}

/** Checks if npc target is dead
 * @param {ICustomNpc} npc 
 * @returns {Boolean} If npc is reset
 */
function checkReset(npc){
    var temptarget = npc.getTempData("npctarget");
    var target = npc.getAttackTarget();
    var doReset = Boolean(
        temptarget != null && 
        target == null && 
        temptarget.getHealth() == 0
    );
    if(doReset) {
        npc.getTimers().clear();
        npc.reset();
    }
    npc.setTempData("npctarget", npc.getAttackTarget());
    return doReset;
}

/** Checks if npc target and no other players nearby are alive
 * @param {ICustomNpc} npc 
 * @returns {Boolean} If npc is reset
 */
function checkResetParty(npc)
{
    var temptarget = npc.getTempData("npctarget");
    var target = npc.getAttackTarget();
    var doReset = Boolean(
        temptarget != null && 
        target == null && temptarget.getHealth() == 0 && 
        npc.world.getClosestVulnerablePlayer(npc.getPosition(), 50.0) == null
    );
    if (doReset) {
        npc.getTimers().clear();
        npc.reset();
    }
    npc.setTempData("npctarget", npc.getAttackTarget());
    return doReset;
}

/** Returns if entity is a player
 * @param {IEntity} entity 
 * @returns {Boolean}
 */
function isPlayer(entity) {
  return entity && entity.getType() == 1;
}

/**
 * Checks if the given player is valid.
 *
 * A player is considered valid if:
 * - The player object is not null.
 * - The player's type is 1.
 * - The player has a non-null DBCPlayer instance.
 * - The player's mode is 0.
 * - The player is not a DBC Fusion Spectator.
 *
 * @param {IPlayer} player - The player to validate.
 * @returns {boolean} True if the player is valid, otherwise false.
 */
function isValidPlayer(player) {
    return (player && player.getType() == 1 && player.getDBCPlayer() && player.getMode() == 0 && !player.getDBCPlayer().isDBCFusionSpectator());
}

// GLOBAL CLASSES ------------------------------------------------------------------------------------------------

// Animation Handler class --------------------------------------------------------------------------

/**
 * @constructor
 * @param {IEntity} entity - Entity managed by animation handler
 */
function animationHandler(entity)
{
    if(!entity || (entity.getType() != 1 && entity.getType() != 2)) return;
    this.entity = entity;
    this.entityAnimData = entity.getAnimationData();
}

/** Set entity animation
 * @param {IAnimation / String} animation - IAnimation object or String name of animation
 */
animationHandler.prototype.setAnimation = function(animation) 
{
    if(!animation) return;
    if(typeof animation == "string") animation = API.getAnimations().get(animation);
    this.entityAnimData.setEnabled(true);
    this.entityAnimData.setAnimation(animation);
    this.entityAnimData.updateClient();
}

/** Removes animation, setting player back to their default animation
 */
animationHandler.prototype.removeAnimation = function()
{
    this.entityAnimData.setEnabled(false);
    this.entityAnimData.setAnimation(null);
    this.entityAnimData.updateClient();
}

animationHandler.prototype.getAnimData = function() { return this.entityAnimData; }

// ---------------------------------------------------------------------------

// Npc form handler class --------------------------------------------------------------------------

/**
 * @constructor
 * @param {ICustomNpc} npc - Npc to manage dbcDisplay of 
 * @param {Boolean} enabled - If aura enabled by default
 */
function dbcDisplayHandler(npc, enabled)
{
    if(!npc) return;
    this.transformConfig();
    this.npc = npc;
    this.npcDisplay = DBCAPI.getDBCDisplay(npc);
    this.npcDisplay.setEnabled(enabled);
    this.npc.updateClient();
}

/** Config for quick transformation
 */
dbcDisplayHandler.prototype.transformConfig = function()
{
    this.updateFormDelay = 10; // Number of ticks from starting aura to updating form
    this.disableAuraDelay = 20; // Number of ticks from starting aura to disabling aura (generally around 10 after updating form looks good)
    this.ascendSound = "npcdbc:transformationSounds.GodAscend";
} 

/** Transforms npc using default slow transformation
 * @param {IForm} form 
 */
dbcDisplayHandler.prototype.slowTransform = function(form)
{
    if(!form) return;
    this.npcDisplay.setEnabled(true);
    this.npcDisplay.transform(form);
    this.npc.updateClient();
}

/** Performs a quick transformation similar to player double tapping transformation button
 * @param {IForm} form 
 * @param {Boolean} disableAura - If aura is disabled after transforming 
 */
dbcDisplayHandler.prototype.quickTransform = function(form, disableAura)
{
    if(!form) return;
    // Enable aura
    this.npcDisplay.toggleAura(true);
    this.npc.updateClient();
    this.tempForm = form;
    
    // Start timers
    var lib = API.getIWorld(0).getTempData("library");
    lib.startGlobalTimer(301, this.updateFormDelay, false, this);
    if(disableAura) lib.startGlobalTimer(302, this.disableAuraDelay, false, this);
}

/** Timer function for quickTransform to update npc's form
 */
dbcDisplayHandler.prototype.qtUpdateForm = function()
{
    this.setForm(this.tempForm);
    this.npc.playSound(this.ascendSound, 0.3, 1);
}

/**
 * @param {IForm} form - IForm to set npc to
 */
dbcDisplayHandler.prototype.setForm = function(form)
{
    if(!form) return;
    this.npcDisplay.setForm(form);
    this.npc.updateClient();
}

/** Sets npc aur
 * @param {IAura} aura
 * @param {Boolean} active - If aura is active once applied
 */
dbcDisplayHandler.prototype.setAura = function(aura, active)
{
    if(!aura) return;
    this.npcDisplay.setAura(aura);
    this.npcDisplay.toggleAura(active);
    this.npc.updateClient();
}

/** Changes visibility of aura
 * @param {Boolean} enabled - Aura visibility
 */
dbcDisplayHandler.prototype.toggleAura = function(enabled)
{
    this.npcDisplay.toggleAura(enabled);
    this.npc.updateClient();
}

/** Disables dbcDisplay
 */
dbcDisplayHandler.prototype.disable = function()
{
    this.npcDisplay.setEnabled(false);
    this.npc.updateClient();
}

/** Enables dbcDisplay
 */
dbcDisplayHandler.prototype.enable = function()
{
    this.npcDisplay.setEnabled(true);
    this.npc.updateClient();
}

dbcDisplayHandler.prototype.getNpcDisplay = function() { return this.npcDisplay; }

// ---------------------------------------------------------------------------
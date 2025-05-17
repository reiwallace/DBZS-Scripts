// Piccolo.js
// Author: Noxie

// CHANGE THESE
var ARENA_CENTRE = [-257, 56, -842];
var BASE_MOVEMENT_SPEED = 5;

// CONFIG
var MULTI_FORM_CD = 240; // Cooldown of multiform attack in ticks
var TELEGRAPH_DURATION = 20; // Duration of telegraph for multiform attack

var BEAM_CHARGE = 200; // Time player has to hit the correct clone in ticks
var BEAM_DAMAGE = 1; // Damage of fail beam
var BEAM_COLOUR = 8; // Colour of fail beam
var BEAM_SPEED = 0; // Colour of fail beam

var STUN_DURATION = 80; // Duration ofstun in ticks

var TELEGRAPH_LINE = "&a&lPiccolo begins charging a powerful attack";
var CLONE_NAME = "Piccolo(Multi-Form)"; // Server clone name
var SPECIAL_BEAM_ANIMATION = "PiccoloBeam"; // Name of special beam cannon animation

var RESET_TIME = 600; // Number of ticks without player activity before reseting

// DON'T CHANGE
var chargingAttack;
var stunned;
var multiForms;
var npcAnimHandler;

// TIMERS  
var RESET = 0;
var MULTI_FORM = 1;
var FIRE_BEAM = 2;
var STUN = 3;
var MULTI_FORM_TELEGRAPH = 4;

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(RESET): // Reset npc
            reset(npc);
            break;

        case(MULTI_FORM): // Starts telegraph for multiform attack
            npc.timers.foceStart(MULTI_FORM_TELEGRAPH, TELEGRAPH_DURATION, false);
            if(npc.getAttackTarget() == null) return;
            npc.getAttackTarget().sendMessage(TELEGRAPH_LINE); 
            break;

        case(MULTI_FORM_TELEGRAPH): // End of telegraph
            multiFormAttack(npc, ARENA_CENTRE);
            break;

        case(FIRE_BEAM): // Fire beam at the end of timer
            endAttack();
            npc.setSpeed(BASE_MOVEMENT_SPEED);
            kiAttack(npc, BEAM_DAMAGE, BEAM_COLOUR, BEAM_SPEED);
            break;

        case(STUN): // Stun for duration of timer
            npc.setSpeed(BASE_MOVEMENT_SPEED);
            stunned = false;
            break;
    }
}

function init(event)
{ 
    var npc = event.npc;
    npc.timers.clear();

    // Reset variables
    chargingAttack = false;
    stunned = false;
    npc.setSpeed(BASE_MOVEMENT_SPEED);
    npcAnimHandler = new animationHandler(npc);

    // Check for leftover clones on init
    var cloneScan = npc.getSurroundingEntities(100, 0);
    for(var i in cloneScan) {
        if(cloneScan[i] == null || cloneScan[i].getName() != CLONE_NAME) continue;
        cloneScan[i].despawn();
    }
}

function interact(event)
{
    startTimers(event.npc.timers);
}

function meleeAttack(event)
{ 
    // Begin reset timer on swing
    var npc = event.npc;
    npc.timers.forceStart(RESET, RESET_TIME, false);
    startTimers(npc.timers);
    if(stunned) event.setCancelled(true);
}

function damaged(event)
{ 
    // Begin reset timer on damaged
    var npc = event.npc;
    npc.timers.forceStart(RESET, RESET_TIME, false);
    startTimers(event.npc.timers);

    // Despawn clones and start stun when hit during attack
    if(!chargingAttack) return;
    endAttack();
    stunned = true;
    npc.timers.stop(FIRE_BEAM);
    npc.timers.forceStart(STUN, STUN_DURATION, false);
}

function killed(event)
{ // Reset if killed
    npc.timers.clear();
}

function kills(event)
{ // Reset if killing a player and no other players around
    var npc = event.npc;
    var playerCheck = npc.getSurroundingEntities(npc.getAggroRange(), 1);
    if(playerCheck.length < 1) reset;
}

/** Resets npc's timers and temp data
 * @param {ICustomNpc} npc - Npc to reset
 */
function reset(npc)
{
    npc.timers.clear();
    npc.reset();
}

function startTimers(timers)
{
    if(!timers.has(MULTI_FORM)) { 
        // Start timers if not active
        timers.forceStart(MULTI_FORM, MULTI_FORM_CD, false);
    }
}

function multiFormAttack(npc, arenaCentre)
{  
    // Defines targets and clone positions
    target = npc.getAttackTarget();
    multiForms = new Array();
    var piccoloPos = Math.floor(Math.random() * (7 - 0 + 1));
    var xRel = [-6, -4, 0, 4, 6, 4, 0, -4];
    var zRel = [0, -4, -6, -4, 0, 4, 6, 4];

    // Spawn clones in relative spots
    for(i = 0; i < 8; i++) { 
        if(i == piccoloPos) continue;
        spawnMultiForm(npc.world, xRel[i] + arenaCentre[0], arenaCentre[1], zRel[i] + arenaCentre[2]);
    } 
    
    // Teleport Piccolo to his position
    npc.setX(xRel[piccoloPos] + arenaCentre[0]); 
    npc.setY(arenaCentre[1]);
    npc.setZ(zRel[piccoloPos] + arenaCentre[2]);
    
    // Start telegraph
    npc.timers.forceStart(FIRE_BEAM, BEAM_CHARGE, false);
    npc.setSpeed(0);
    npcAnimHandler.setAnimation(SPECIAL_BEAM_ANIMATION);
    npc.
    chargingAttack = true;
}

/** Spawns a multiclone form then push
 * @param {IWorld} world - World to spawn npc in
 * @param {Double} relx - X position to spawn clone at
 * @param {Double} rely - Y position to spawn clone at
 * @param {Double} relz - Z position to spawn clone at
 */
function spawnMultiForm(world, relx, rely, relz)
{ 
    // Spawns clone then pushes to array
    var clone = world.spawnClone(relx, rely, relz, 1, CLONE_NAME, false);
    var cloneAnimHandler = new animationHandler(clone);
    cloneAnimHandler.setAnimation(SPECIAL_BEAM_ANIMATION);
    if(clone != null) multiForms.push(clone);
}

/** Despawns all clones spawned piccolo's last attack 
 */
function endAttack()
{
    chargingAttack = false;
    npcAnimHandler.removeAnimation();
    for(var i in multiForms) {
        if(multiForms[i] == null) continue;
        multiForms[i].despawn();
    }
}

/** Fires a dbc ki attack from the npc wth a set damage and speed
 * @param {ICustomNpc} npc - Npc shooting the ki
 * @param {int} damage - Damage of the ki
 * @param {int} speed - Speed of the ki
 * @param {int} color - Color of the ki
 */
function kiAttack(npc, damage, color, speed)
{
    npc.executeCommand("/dbcspawnki 4 " + speed + " " + damage + " 0 " + color + " 10 1 100 " + npc.x + " " + npc.y + " " + npc.z + "");
}

// Animation Handler class --------------------------------------------------------------------------

/**
 * @constructor
 * @param {IEntity} entity - Entity managed by animation handler
 */
function animationHandler(entity)
{
    this.entity = entity;
    this.entityAnimData = entity.getAnimationData();
}

/** Set entity animation
 * @param {String} animationName - Animation name as appears in game
 */
animationHandler.prototype.setAnimation = function(animationName) 
{
    this.entityAnimData.setEnabled(true);
    this.entityAnimData.setAnimation(API.getAnimations().get(animationName));
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

// ---------------------------------------------------------------------------
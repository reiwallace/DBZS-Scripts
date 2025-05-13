// Piccolo.js
// Author: Noxie

// CHANGE THESE
var ARENA_CENTRE = [0, 0, 0];

// CONFIG
var BEAM_CHARGE = 200; // Time player has to hit the correct clone in ticks

// DON'T CHANGE
var chargingAttack = false;
var multiForms;

function init(event)
{ // Check clones on spawn
    var npc = event.npc;
    var cloneScan = npc.getSurroundingEntities(100, 0);
    npc.timers.clear();
    for(var i in cloneScan) {
        if(i == null || i.getName() != CLONE_NAME) continue;
        i.despawn();
    }
}

function meleeAttack(event)
{ // Begin reset timer on swing
    event.npc.timers.forceStart(RESET, resetTime, false);
    startTimers(event.npc.timers);
}

function damaged(event)
{ // Begin reset timer on damaged
    event.npc.timers.forceStart(RESET, resetTime, false);
    startTimers(event.npc.timers);
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
    if(!timers.has(MULTI_FORM)) { // Start timers if not active
        timers.start(MULTI_FORM, 0, false);
    }
}


function multiFormAttack(npc, arenaCentre)
{  
    target = npc.getAttackTarget();
    multiForms = new Array();
    var piccoloPos = Math.floor(Math.random() * (7 - 0 + 1));
    var xRel = [-6, -4, 0, 4, 6, 4, 0, -4];
    var zRel = [0, -4, -6, -4, 0, 4, 6, 4];

    // Spawn clones in relative spots
    for(i = 0; i < 8; i++) { 
        if(i == piccoloPos) continue;
        spawnMultiForm(npc, xRel[i] + arenaCentre[0], arenaCentre[1], zRel[i] + arenaCentre[2]);
    } 
    
    // Teleport Piccolo to his position
    npc.setX(xRel[piccoloPos] + arenaCentre[0]); 
    npc.setY(arenaCentre[1]);
    npc.setZ(zRel[piccoloPos] + arenaCentre[2]);
    
    // Start telegraph
    npc.timers.forceStart(FIRE_BEAM, BEAM_CHARGE, false);
    chargingAttack = true;
}

function spawnMultiForm(world, relx, relz, rely)
{ // Spawn afterimages and bombs (thx trent)
    var clone = world.spawnClone(relx, rely, relz, 1, CLONE_NAME);
    if(clone == null) return;
    clone.setMaxHealth(1);
    clone.setMeleeStrength(0);
    clone.setSpeed(0);
    multiForms.push(clone);
}

function despawnClones(npc)
{
    for(var i in multiForms) {
        if(i == null) continue;
        i.despawn();
    }
}

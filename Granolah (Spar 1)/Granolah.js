// Granolah.js
// AUTHOR: Noxie, Delka, XO, 

var target;


function target(event)
{ // Set target and begin reset timer on target
    var npc = event.npc;
    target = event.getTarget();
    if(!npc.timers.has(KI_BLAST_TELEGRAPH)) { // Start timers if not active
        npc.timers.forceStart(KI_BLAST_TELEGRAPH, kiBlastCooldown, true); // Start ability timer
        npc.timers.forceStart(BEGIN_ASSIST, assistAbilityCooldown, true);
    }
}

function meleeAttack(event)
{ // Begin reset timer on swing
    event.npc.timers.forceStart(RESET, resetTime, false);
}

function damaged(event)
{ // Begin reset timer on damaged
    event.npc.timers.forceStart(RESET, resetTime, false);
}

function killed(event)
{ // Reset if killed
    reset(event.npc);
}

function kills(event)
{ // Reset if killing a player and no other players around
    var npc = event.npc;
    var playerCheck = npc.getSurroundingEntities(50, 1);
    if(playerCheck.length < 1) reset;
}

/** Resets npc's timers and temp data
 * @param {ICustomNpc} npc - Npc to reset
 */
function reset(npc)
{
    npc.timers.clear();
}
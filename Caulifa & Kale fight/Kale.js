// Kale.js
// AUTHOR: Noxie

// Changeables
var cauliflaName = "Caulifla"; // Name of accompanying kale npc

var telegraphTimer = 20; // Timer between announcing attacks and actually using them

var kiBlastVoiceline = "I got this!"; // Line said by kale before shooting her ki blast
var kiBlastCooldown = 200; // Cooldown of ki blast ability
var kiBlastDamage = 1; // Damage of ki blast
var kiBlastSpeed = 2; // Speed of ki blast
var kiBlastColor = 6; // Color of ki blast - 6 = green

var assistAbilityCooldown = 600; // Cooldown of assist ability

var CAULIFLA;
var TARGET;

// Timers
var KI_BLAST_TELEGRAPH = 0;
var KI_BLAST = 1;
var ASSIST_ATTACK = 2;

function init(event)
{
    var npc = event.npc;
    var search = npc.getSurroundingEntities(40,2); // Search for kale
    for(i = 0; i < search.length; i++) {
        if(search[i].getName() == cauliflaName) {
            CAULIFLA = search[i];
            break;
        }
    }
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(KI_BLAST_TELEGRAPH):
            if(!npc.getTempData("Attacking")) {
                npc.say(kiBlastVoiceline);
                npc.timers.forceStart(KI_BLAST, telegraphTimer, false);
            }
            break;
        case(KI_BLAST):
            kiAttack(npc, kiBlastDamage, kiBlastSpeed, kiBlastColor);
            break;
        case(ASSIST_ATTACK):
                
            break;
    }
}

function meleeAttack(event)
{ // Set target and begin reset timer on swing
    var npc = event.npc;
    TARGET = npc.getAttackTarget();
    DBC_TARGET = TARGET.getDBCPlayer();
    npc.timers.forceStart(10, npc.getTempData("Reset Time"), false); // Reset if doesn't melee a target for set time
    if(!npc.timers.has(KI_BLAST_TELEGRAPH)) { // Start timers if not active
        npc.timers.forceStart(KI_BLAST_TELEGRAPH, abilityInterval, true); // Start ability timer
        npc.timers.forceStart(ASSIST_ATTACK, assistAbilityCooldown, true);
    }
}

/** Fires a dbc ki attack from the npc wth a set damage and speed
 * @param {ICustomNpc} npc - Npc shooting the ki
 * @param {int} damage - Damage of the ki
 * @param {int} speed - Speed of the ki
 * @param {int} color - Color of the ki
 */
function kiAttack(npc, damage, speed, color)
{
    npc.executeCommand("/dbcspawnki 1 " + speed + " " + damage + " 0 " + color + " 10 1 100 " + npc.x + " " + npc.y + " " + npc.z + "");
}
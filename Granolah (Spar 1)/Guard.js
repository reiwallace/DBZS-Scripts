var ARENA_SIZE = 20;
var GUARD_SIZE = 10;
var npcGuard;

function init(event)
{ // Initialise guard object
    var npc = event.npc;
    npcGuard = new guard(npc, GUARD_SIZE, ARENA_SIZE);
}

function damaged(event)
{ // Damage guard if not empty
    if(npcGuard.isGuardBarEmpty()) return;
    event.setDamage(0);
    npcGuard.damageGuard(1);
}

// Guard Class ---------------------------------------------------------

/** A guard bar that takes damage and performs a block animation
 * @constructor
 * @param {ICustomNpc} npc - Npc assigning guard to
 * @param {int} initialGuardSize - Initial health of the guard
 * @param {int} arenaSize - Size of arena for player scanning
 */
function guard(npc, initialGuardSize, arenaSize)
{
    this.npc = npc;
    this.arenaSize = arenaSize;
    this.npcAnimData = npc.getAnimationData(); 
    this.guard_level = initialGuardSize;
}

/** Set guard bar level
 * @param {int} value - Value to set guard to 
 */
guard.prototype.setGuardBar = function(value)
{
    this.guard_level = value;
    
    // Update player on guard status
    var message = "";
    if (this.guard_level > 0) message = "GUARD LEVEL: " + guard_level;
    else message = "GUARD BROKEN";
    var entities = npc.getSurroundingEntities(ARENA_SIZE, 1);
    for (var i in entities) {
        entities[i].sendMessage(message);
    }
}

/** Damage guard by value and perform a block animation
 * @param {int} value - Damage to do to guard 
 */
guard.prototype.damageGuard = function(value)
{
    // Perform blocking animation
    npc_anim.setAnimation(API.getAnimations().get("DBCBlock"));
    npc_anim.setEnabled(true);
    npc_anim.updateClient();
    this.setGuardBar(this.guard_level - value);
}

/** Checks if guard level is less than or equal to 0
 * @returns {Boolean} 
 */
guard.prototype.isGuardBarEmpty = function()
{
    return this.guard_level <= 0;
}

// Guard Class ---------------------------------------------------------
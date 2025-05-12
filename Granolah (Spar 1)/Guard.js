var GUARD_SIZE = 10; // Size of guard
var GUARD_IFRAMES = 10; // Ticks between guard hits
var npcGuard;

function init(event)
{ // Initialise guard object
    var npc = event.npc;
    npcGuard = new guard(npc, GUARD_SIZE, npc.getAggroRange(), GUARD_IFRAMES);
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
 * @param {int} scanRange - Range to scan players to message
 */
function guard(npc, initialGuardSize, scanRange, iFrames)
{
    this.npc = npc;
    this.time = this.npc.world.getTime();
    this.iFrames = iFrames;
    this.scanRange = scanRange;
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
    if (this.guard_level > 0) message = "GUARD LEVEL: " + this.guard_level;
    else message = "GUARD BROKEN";
    var entities = this.npc.getSurroundingEntities(this.scanRange, 1);
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
    var newTime = this.npc.world.getTime();
    if(newTime - this.time < this.iFrames) return;
    this.npcAnimData.setAnimation(API.getAnimations().get("DBCBlock"));
    this.npcAnimData.setEnabled(true);
    this.npcAnimData.updateClient();
    this.time = this.npc.world.getTime();
    this.setGuardBar(this.guard_level - value);
}

/** Checks if guard level is less than or equal to 0
 * @returns {Boolean} 
 */
guard.prototype.isGuardBarEmpty = function()
{
    return this.guard_level <= 0;
}

// ---------------------------------------------------------
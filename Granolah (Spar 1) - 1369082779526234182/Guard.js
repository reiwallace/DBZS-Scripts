// Guard Class ---------------------------------------------------------

guard.prototype.guardConfig = function()
{
    // GUARD CONFIG
    this.GUARD_SIZE = 25; // Size of guard
    this.GUARD_IFRAMES = 10; // Min ticks between guard hits

    this.GUARD_BREAK_MESSAGE = "&lGuard Broken!";
}

/** A guard bar that takes damage and performs a block animation
 * @constructor
 * @param {ICustomNpc} npc - Npc assigning guard to
 * @param {animationHandler} npcAnimationHandler - Animation handler for guard npc
 * @param {int} scanRange - Range to scan for players 
 * @param {qteHandler} qte - Quick time event to perform on guard break  
 */
function guard(npc, npcAnimationHandler, scanRange, qte, guardBreakPoints)
{
    this.guardConfig();
    this.npc = npc;
    this.npcAnimationHandler = npcAnimationHandler;
    this.time = this.npc.world.getTime();
    this.scanRange = scanRange;
    this.guardLevel = this.GUARD_SIZE;
    this.qte = qte;
    this.guardDisplay = new progressBar(this.GUARD_SIZE, this.GUARD_SIZE, guardBreakPoints);
}

/** Set guard bar level
 * @param {int} value - Value to set guard to 
 */
guard.prototype.setGuardBar = function(value)
{
    this.guardLevel = value;
    this.guardDisplay.setBar(value);
    
    // Update player on guard status
    if (this.guardLevel > 0) return;
    this.qte.newQTE(target, new animationHandler(target));

    var entities = this.npc.getSurroundingEntities(this.scanRange, 1);
    for (var i in entities) {
        entities[i].sendMessage(this.GUARD_BREAK_MESSAGE);
    }
}

/** Damage guard by value and perform a block animation
 * @param {int} value - Damage to do to guard 
 */
guard.prototype.damageGuard = function(value)
{
    // Perform blocking animation
    var newTime = this.npc.world.getTime();
    if(newTime - this.time < this.GUARD_IFRAMES) return;
    this.npcAnimationHandler.setAnimation("DBCBlock");
    this.time = this.npc.world.getTime();
    this.setGuardBar(this.guardLevel - value);
}

/** Checks if guard level is less than or equal to 0
 * @returns {Boolean} 
 */
guard.prototype.isGuardBarEmpty = function()
{
    return this.guardLevel <= 0;
}

guard.prototype.getInitialGuard = function() { return this.GUARD_SIZE; }
guard.prototype.getGuardLevel = function() { return this.guardLevel; }
guard.prototype.getGuardDisplay = function() { return this.guardDisplay; }

// ---------------------------------------------------------
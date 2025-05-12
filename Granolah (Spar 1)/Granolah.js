// Granolah.js
// AUTHOR: Noxie, Delka, XO

// CHANGE THESE
var ARENA_CENTRE = [-258, 56, -843]; // Point to backstep to if the npc would collide with a wall

// BACKSTEP CONFIG
var BACKSTEP_COOLDOWN = 200; // Cooldown of backstep in ticks
var BACKSTEP_SPEED = 3; // Speed of backstep motion
var BACKSTEP_HEIGHT = 0.4; // Height of backstep motion
var BACKSHOT_DURATION = 20; // Amount of time to perform all backshots
var BACKSHOT_COUNT = 5; // Number of backshots to perform after backstepping
var BACKSHOT_PROJECTILE = "customnpcs:npcBlackBullet"; // Item to use for backshot projectile
var BACKSHOT_PROJECTILE_VARIATION = 0; // Variation of item leave at 0 unless using a variation item
var BACKSHOT_PROJECTILE_SIZE = 1; // Size of backshot projectile
var BACKSHOT_ACCURACY = 100; // Accuracy of backshots
var BACKSHOT_SOUND = "customnpcs:gun.pistol.shot"; // Sound played when performing backshots
var recoil1Name = "GranolahBarrage"; // Recoil animation names to pull them from the API
var recoil2Name = "GranolahBarrageLeft";
var recoil3Name = "GranolahBarrageRight";

// GUARD CONFIG
var GUARD_SIZE = 10; // Size of guard
var GUARD_DAMAGE = 1; // Damage to guard per hit

// BOSS CONFIG
var RESET_TIME = 600; // Number of ticks since player activity to reset


// Attack checks
var performingStanceChange = false;
var performingQTE = false;
var performingBackshots = false;

var npcGuard;
var npcAnimHandler;
var target;
var recoil = null;
var count = 0;

// Timers
var BACKSTEP = 0;
var BACKSHOTS = 1;
var RESET = 2;

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(RESET):
            reset(npc);
            break;

        case(BACKSTEP):
            // Perform backstep and start backshots timer
            if(performingQTE) return;
            backstep(npc, target, BACKSTEP_SPEED, BACKSTEP_HEIGHT, ARENA_CENTRE);
            recoil = null;
            count = 0;
            npc.timers.forceStart(BACKSHOTS, BACKSHOT_DURATION/BACKSHOT_COUNT, true);
            break;

        case(BACKSHOTS):
            // Shoot at the player and perform recoil animation
            if(performingQTE) {
                // Stop firing to perform quick time event
                npc.timers.stop(BACKSHOTS);
                return;
            }

            // Cycle through recoil animations
            if(recoil == null) { 
                npcAnimHandler.setAnimation(recoil1Name);
                recoil = true;
            } else {
                recoilAnimation = recoil ? npcAnimHandler.setAnimation(recoil2Name) : npcAnimHandler.setAnimation(recoil3Name);
                recoil = !recoil;
            } 
            
            // Shoot projectile at player
            if(target == null) return;
            npc.playSound(BACKSHOT_SOUND, 1, 1);
            var item = API.createItem(BACKSHOT_PROJECTILE, BACKSHOT_PROJECTILE_VARIATION, BACKSHOT_PROJECTILE_SIZE);
            npc.shootItem(target, item, BACKSHOT_ACCURACY);

            // Timer break
            count++;
            if(count <= BACKSHOT_COUNT) return;
            npcAnimHandler.removeAnimation;
            npc.timers.stop(BACKSHOTS);
            break;
    }
}

function init(event)
{
    var npc = event.npc;
    npc.timers.clear();
    npcGuard = new guard(npc, GUARD_SIZE, npc.getAggroRange());
    npcAnimHandler = new animationHandler(npc);
    npcAnimHandler.removeAnimation();
}

function target(event)
{ // Set target and begin reset timer on target
    var npc = event.npc;
    target = event.getTarget();
    if(!npc.timers.has(BACKSTEP)) { // Start timers if not active
        npc.timers.forceStart(BACKSTEP, BACKSTEP_COOLDOWN, true); // Start ability timer
    }
}

function meleeAttack(event)
{ // Begin reset timer on swing
    event.npc.timers.forceStart(RESET, RESET_TIME, false);
}

function damaged(event)
{ 
    // Begin reset timer on damaged
    event.npc.timers.forceStart(RESET, RESET_TIME, false);

    // Damage Guard if not empty
    if(npcGuard.isGuardBarEmpty()) return;
    event.setDamage(0);
    npcGuard.damageGuard(GUARD_DAMAGE);
}

function killed(event)
{ // Reset if killed
    reset(event.npc);
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
    npc.reset();
    npc.timers.clear();
}

/** Performs a backstep away from the target, backstepping to the center if the motion would result in collision with a wall
 * @param {ICustomNpc} npc - Npc performing backstep
 * @param {IEntity} target - Target to backstep away from
 * @param {Double} speed - Speed of backstep
 * @param {Double} height - Height to add to backstep
 * @param {Double[]} arenaCenter - Array for coordinates of arena center 
 */
function backstep(npc, target, speed, height, arenaCenter)
{
    if(target == null) return;
    var targetLookVector = target.getLookVector();
    // Boolean variable to check if the npc would hit a block from a backstep
    var wallCheck = npc.world.rayCastBlock(
        [npc.x, npc.y, npc.z], 
        [targetLookVector.XD, 0, targetLookVector.ZD], 
        speed * 6, true, false, false
    );
    if(wallCheck != null) { // Raycast to check if block in path
        // Backstep to middle
        var angle = getDirection(npc, arenaCenter[0], arenaCenter[2]);
        var x = -Math.cos(angle) * speed; 
        var z = -Math.sin(angle) * speed;
    } else { 
        // Backstep away from player
        var angle = getDirection(npc, target.getX(), target.getZ());
        var x = Math.cos(angle) * speed; 
        var z = Math.sin(angle) * speed;
    }
    npc.setMotion(x, height, z);
}

/** Gets a direction from an npc to another position
 * @param {ICustomNpc} npc - Npc to get direction from
 * @param {int} x - X position
 * @param {int} z - Z position
 * @returns {Double}
 */
function getDirection(npc, x, z)
{
    return Math.atan2(npc.getZ()-z, npc.getX()-x)
}

// Guard Class ---------------------------------------------------------

/** A guard bar that takes damage and performs a block animation
 * @constructor
 * @param {ICustomNpc} npc - Npc assigning guard to
 * @param {int} initialGuardSize - Initial health of the guard
 * @param {int} scanRange - Range to scan players to message
 */
function guard(npc, initialGuardSize, scanRange)
{
    this.npc = npc;
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
    this.npcAnimData.setAnimation(API.getAnimations().get("DBCBlock"));
    this.npcAnimData.setEnabled(true);
    this.npcAnimData.updateClient();
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
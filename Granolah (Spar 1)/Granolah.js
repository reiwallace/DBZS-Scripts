// Granolah.js
// AUTHOR: Noxie, Delka, XO

// CHANGE THESE
var ARENA_CENTRE = [-258, 56, -843]; // Point to backstep to if the npc would collide with a wall

// BACKSTEP CONFIG
var BACKSTEP_COOLDOWN = 200; // Cooldown of backstep in ticks
var BACKSTEP_SPEED = 3; // Speed of backstep motion
var BACKSTEP_HEIGHT = 0.4; // Height of backstep motion
var BACKSHOT_DURATION = 20; // Amount of time to perform all backshots
var BACKSHOT_COUNT = 4; // Number of backshots to perform after backstepping
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
var GUARD_IFRAMES = 10; // Min ticks between guard hits

// BOSS CONFIG
var RESET_TIME = 600; // Number of ticks since player activity to reset
var NPC_SPEED = 5; // Default move speed of boss

// ATTACK CHECKS
var performingStanceChange = false;
var performingBackshots = false;

// DON'T EDIT
var npcGuard;
var npcAnimHandler;
var playerAnimHandler;
var qte;
var target;
var recoil = null;
var count = 0;

// TIMERS
var BACKSTEP = 0;
var BACKSHOTS = 1;
var RESET = 2;
var QTE_TIMER = 3;

// QTE CONFIG
qteHandler.prototype.qteConfig = function()
{
    this.QTE_LENGTH = 30; // Time for player to click the qte

    // BUTTON CONFIG
    this.BUTTON_COLOUR = 0x705C7D; // Decimal colour of buttom
    this.BUTTON_WIDTH = 50; // Because we cant change the height of the button
    this.BUTTON_SCALE = 1; // Height of button in pixels
    this.RANDOM_SCALE = true;
    this.RANDOM_RANGE = [0.2, 3];
    this.BUTTON_TEXT = "Click!"; // Text on button

    // ANIMATIONS
    this.NPC_WINDUP_ANIMATION = "DBCBlock"; 
    this.PLAYER_WINDUP_ANIMATION = "DBCBlock";
    this.NPC_SUCCESS_ANIMATION = "DBCBlock";
    this.NPC_FAILED_ANIMATION = "DBCBlock";
    this.PLAYER_FAILED_ANIMATION = "DBCBlock";
    this.PLAYER_SUCCESS_ANIMATION = "DBCBlock";

    // QTE MESSAGES
    this.FAILED_MESSAGE = "&cFailed!"; // Text displayed on failing qte
    this.SUCCESS_MESSAGE = "&aSuccess!"; // Text displayed on passing qte

    // ENTITY ROTATIONS
    this.NPC_ROTATION = 90; // Direction npc facing when teleported to middle of arena
    this.PLAYER_ROTATION = 270; // Direction player facing when teleported to middle of arena

    this.GUI_ID = 72;
    this.BUTTON_ID = 72;
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(RESET):
            reset(npc);
            break;

        case(BACKSTEP):
            // Perform backstep and start backshots timer
            if(qte.isPerformingQTE()) return;
            backstep(npc, target, BACKSTEP_SPEED, BACKSTEP_HEIGHT, ARENA_CENTRE);
            recoil = null;
            count = 0;
            npc.timers.forceStart(BACKSHOTS, BACKSHOT_DURATION/BACKSHOT_COUNT, true);
            break;

        case(BACKSHOTS):
            // Shoot at the player and perform recoil animation
            if(qte.isPerformingQTE()) {
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
            npcAnimHandler.removeAnimation();
            npc.timers.stop(BACKSHOTS);
            break;

        case QTE_TIMER:
            // Fail quicktime event on expiry
            if(qte != null) qte.failQTE();
            break;
    }
}

function init(event)
{
    var npc = event.npc;
    npc.timers.clear();
    npc.setSpeed(NPC_SPEED);
    
    // Initalise ability handlers
    npcAnimHandler = new animationHandler(npc);
    npcAnimHandler.removeAnimation();
    qte = new qteHandler(npc, npcAnimHandler, ARENA_CENTRE, QTE_TIMER, NPC_SPEED);
    npcGuard = new guard(npc, npcAnimHandler, GUARD_SIZE, npc.getAggroRange(), GUARD_IFRAMES, qte);
}

function target(event)
{ // Set target and begin reset timer on target
    target = event.getTarget();
    startTimers(event.npc);
}

function meleeAttack(event)
{ // Begin reset timer on swing
    event.npc.timers.forceStart(RESET, RESET_TIME, false);
    startTimers(event.npc);
    if(qte != null && qte.isPerformingQTE()) event.setCancelled(true);
}

function damaged(event)
{ 
    // Begin reset timer on damaged
    event.npc.timers.forceStart(RESET, RESET_TIME, false);
    startTimers(event.npc);
    // Damage Guard if not empty
    if(npcGuard.isGuardBarEmpty()) return;
    event.setDamage(0);
    npcGuard.damageGuard(GUARD_DAMAGE);
}

function killed(event)
{ // Reset if killed
    var npc = event.npc;
    var player = event.player;
    if (player != null && player.getType() == 1) {
        player.closeGui();
        npc.timers.clear();
    }
    reset(npc);
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

/** Starts unstarted mechanic timers
 * @param {ICustomNpc} npc - Npc to start timers on
 */
function startTimers(npc)
{
    if(!npc.timers.has(BACKSTEP)) { // Start timers if not active
        npc.timers.forceStart(BACKSTEP, BACKSTEP_COOLDOWN, true); // Start ability timer
    }
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
function guard(npc, npcAnimationHandler, initialGuardSize, scanRange, iFrames, qte)
{
    this.npc = npc;
    this.npcAnimationHandler = npcAnimationHandler;
    this.time = this.npc.world.getTime();
    this.iFrames = iFrames;
    this.scanRange = scanRange;
    this.guard_level = initialGuardSize;
    this.qte = qte;
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
    else {
        message = "GUARD BROKEN";

        this.qte.newQTE(target, new animationHandler(target));
    } 
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
    this.npcAnimationHandler.setAnimation("DBCBlock");
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

// qteHandler class ---------------------------------------------------------------------

/** Performs a quick time event
 * @param {ICustomNpc} npc - Npc performing qte
 * @param {animationHandler} npcAnimationHandler  - Npc's animation handler
 * @param {Double[]} arenaCenter - Center 
 * @param {int} qteTimer - Timer id for qte
 * @param {int} npcSpeed - Initial speed of npc
 */
function qteHandler(npc, npcAnimationHandler, arenaCenter, qteTimer, npcSpeed)
{
    // Don't accept null npcs
    if(npc == null || npcAnimationHandler == null) return;

    // Set up class variables
    this.qteConfig();
    this.arenaCenter = arenaCenter;
    this.qteTimer = qteTimer;
    this.npcSpeed = npcSpeed;
    this.gui = API.createCustomGui(this.GUI_ID, 0, 0, false);
    this.npc = npc;
    this.npcAnimationHandler = npcAnimationHandler;
}

/** Perform a quick time event on a player
 * @param {IPlayer} player - Player performing qte
 * @param {animationHandler} playerAnimationHandler - Player's animation handler
 */
qteHandler.prototype.newQTE = function(player, playerAnimationHandler)
{
    // Set player
    this.playerAnimationHandler = playerAnimationHandler;
    this.player = player;

    // Get random position for button
    var x = Math.floor(Math.random() * 401) - 200;
    var y = Math.floor(Math.random() * 401) - 200;
    var button = this.gui.addButton(this.BUTTON_ID, this.BUTTON_TEXT, x, y, this.BUTTON_WIDTH, 20);
    if(this.RANDOM_SCALE) button.setScale(Math.random() * (this.RANDOM_RANGE[1] - this.RANDOM_RANGE[0]) + this.RANDOM_RANGE[0]);
    else button.setScale(this.BUTTON_SCALE);
    button.setColor(this.BUTTON_COLOUR);
    this.player.showCustomGui(this.gui);

    // Set up fail timer and temp data
    this.npc.timers.forceStart(this.qteTimer, this.QTE_LENGTH, false);
    this.player.setTempData("qteNpc", this.npc);
    this.player.setTempData("qteHandler", this);
    this.player.setTempData("animationHandler", this.playerAnimationHandler);

    // Set player & npc position and rotation
    this.npc.setPosition(this.arenaCenter[0] + 1, this.arenaCenter[1], this.arenaCenter[2]);
    this.player.setPosition(this.arenaCenter[0] - 1, this.arenaCenter[1], this.arenaCenter[2]);
    this.npc.setRotation(this.NPC_ROTATION);
    this.player.setRotation(this.PLAYER_ROTATION);
    this.npc.setSpeed(0);

    // Start windup animations
    this.npcAnimationHandler.setAnimation(this.NPC_WINDUP_ANIMATION);
    this.playerAnimationHandler.setAnimation(this.PLAYER_WINDUP_ANIMATION);
}

/** Performs player and npc fail animations and closes gui
*/
qteHandler.prototype.failQTE = function()
{
    // Npc succeeds
    this.npcAnimationHandler.setAnimation(this.NPC_FAILED_ANIMATION);
    this.npc.setSpeed(this.npcSpeed);

    // Player fails
    this.playerAnimationHandler.setAnimation(this.PLAYER_FAILED_ANIMATION);
    this.player.sendMessage(this.FAILED_MESSAGE);
    this.player.closeGui();

    this.performingQTE = false;
}

/** Performs player and npc success animations and closes gui
 */
qteHandler.prototype.passQTE = function()
{
    // Npc fails
    this.npc.timers.stop(this.qteTimer);
    this.npcAnimationHandler.setAnimation(this.NPC_SUCCESS_ANIMATION);
    this.npc.setSpeed(this.npcSpeed);

    // Player succeeds
    this.playerAnimationHandler.setAnimation(this.PLAYER_SUCCESS_ANIMATION);
    this.player.sendMessage(this.SUCCESS_MESSAGE);
    this.player.closeGui();
    this.performingQTE = false;
}

/** Return if qte is active
 * @returns {Boolean}
 */
qteHandler.prototype.isPerformingQTE = function()
{
    return this.performingQTE;
}

/** Return gui button id
 * @returns {int}
 */
qteHandler.prototype.getButtonId = function()
{
    return this.BUTTON_ID;
}

// ----------------------------------------------------------------------------------------------------

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
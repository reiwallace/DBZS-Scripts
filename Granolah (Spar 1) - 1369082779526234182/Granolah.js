// Granolah.js
// AUTHOR: Noxie, Delka, XO, Ike

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

// STANCE CHANGE CONFIG
var GUARD_BREAKPOINTS = [0.25, 0.5, 0.75]; // Points to perform a stance change
var STANCE_CHANGE_PARTICLE = "cloud"; // IParticle or particle string to dispaly on stance change
var STANCE_CHANGE_BOOL = false; // if particle is a iParticle object or a string identifier(true for iParticle, false for string identifier)
var STANCE_CHANGE_PARTICLE_COUNT = 100; // Number of particles generated on stance change
var STANCE_CHANGE_PARTICLE_RADIUS = 3; // Radius to spawn particles around the npc
var STANCE_CHANGE_SOUND = "minecraft:ambient.weather.thunder"; // Sound to play to player on stance change
var STANCE_CHANGE_MESSAGE = "&6Granolah shifts his stance!"

// BOSS CONFIG
var RESET_TIME = 600; // Number of ticks since player activity to reset
var NPC_SPEED = 5; // Default move speed of boss
var GUARD_DAMAGE = 1; // Damage to guard per hit

// ATTACK CHECKS
var performingStanceChange = false;
var performingBackshots = false;

// TIMERS
var BACKSTEP = 0;
var BACKSHOTS = 1;
var RESET = 2;
var QTE_TIMER = 3;

// GUARD CONFIG
guard.prototype.guardConfig = function()
{
    // GUARD CONFIG
    this.GUARD_SIZE = 25; // Size of guard
    this.GUARD_IFRAMES = 10; // Min ticks between guard hits

    this.GUARD_BREAK_MESSAGE = "&2&lGranolah's guard falls!";
}

// GUARD BAR CONFIG
progressBar.prototype.config = function() {
    // COMPONENT IDS
    this.OVERLAY_ID = 200;
    this.BORDER_ID = 1;
    this.BAR_ID = 2;
    this.TICK_INITIAL_ID = 3;
    this.TEXT_ID = 50;
    this.SHADOW_ID = 51;
    
    // POSITIONING
    this.x = 480;
    this.y = 30;

    // COLOUR CONFIG
    this.BORDER_COLOUR = 1; // Border colour - takes a decimal colour (https://www.mathsisfun.com/hexadecimal-decimal-colors.html)
    this.BAR_COLOUR = 13466141; // Bar colour - takes a decimal colour (https://www.mathsisfun.com/hexadecimal-decimal-colors.html)
    this.BAR_WIDTH = 250; // Width of bar in pixels
    this.BAR_HEIGHT = 7; // Height of bar in whatever the game feels like

    // TICK CONFIG
    this.TICK_COLOUR = 0; // Tick colour - takes a decimal colour (https://www.mathsisfun.com/hexadecimal-decimal-colors.html)
    this.TICK_THICKNESS = 1;

    // TEXT CONFIG
    this.TEXT = "Guard Level: "; // Text displayed for the bar
    this.TEXT_POSITION = -1; // Set to -1 to position above bar +1 for below
    this.TEXT_COLOUR = 16777215; // Text colour
    this.TEXT_SIZE = 1;
    this.SHADOW_COLOUR = 0; // Colour of shadow behind text
}

// QTE CONFIG
qteHandler.prototype.qteConfig = function()
{
    this.QTE_LENGTH = 30; // Time for player to click the qte
    this.QTE_PASS_DAMAGE = 0.33; // Percent damage to do to npc when passing qte
    this.QTE_FAIL_DAMAGE = 0.33; // Percent damage to do to player when passing qte

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

// DON'T EDIT
var npcGuard;
var breakPoints = new Array();
var npcAnimHandler;
var playerAnimHandler;
var qte;
var target;
var targets = [];
var recoil = null;
var count = 0;

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
    for(var i = 0; i < targets.length; i++) {
        if(targets[i]) npcGuard.getGuardDisplay().removeBar(targets[i]);
    }
    targets = new Array();
    npc.setSpeed(NPC_SPEED);

    // Initalise guard breakpoints
    for(var i in GUARD_BREAKPOINTS) breakPoints.push(false);

    // Initalise ability handlers
    npcAnimHandler = new animationHandler(npc);
    npcAnimHandler.removeAnimation();
    qte = new qteHandler(npc, npcAnimHandler, ARENA_CENTRE, QTE_TIMER, NPC_SPEED);
    npcGuard = new guard(npc, npcAnimHandler, npc.getAggroRange(), qte, GUARD_BREAKPOINTS);
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
    var npc = event.npc;
    var player = event.source;

    // Begin reset timer on damaged
    npc.timers.forceStart(RESET, RESET_TIME, false);
    startTimers(npc);

    // Damage Guard if not empty
    if(npcGuard.isGuardBarEmpty()) return;
    event.setDamage(0);
    npcGuard.damageGuard(GUARD_DAMAGE);
    if(isValidPlayer(player)) {
        npcGuard.getGuardDisplay().displayBar(player);
        targets.push(player);
    }

    // Trigger stance change if guard brought below breakpoints
    var guardPercent = npcGuard.getGuardLevel() / npcGuard.getInitialGuard();
    for(var i = 0; i < GUARD_BREAKPOINTS.length; i++) {
        if(guardPercent < GUARD_BREAKPOINTS[i] && !breakPoints[i]) {
            breakPoints[i] = !breakPoints[i];
            stanceChange(npc, GUARD_BREAKPOINTS[i]);
            return;
        }
    }
}

function killed(event)
{ // Reset if killed
    var npc = event.npc;
    var player = event.player;
    for(var i = 0; i < targets.length; i++) {
        if(!targets[i]) return;
        npcGuard.getGuardDisplay().removeBar(targets[i]);
        targets[i].closeGui();
    }
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
    if(wallCheck != null) { // If block is in path
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

/** Changing npc stats and performs a visual animation
 * @param {ICustomNpc} npc - Npc performing the stance change
 * @param {Double} breakPoint - Breakpoint hit
 */
function stanceChange(npc, breakPoint)
{
    stanceChangeVisuals(
        npc, 
        STANCE_CHANGE_PARTICLE, 
        STANCE_CHANGE_BOOL, 
        STANCE_CHANGE_PARTICLE_COUNT,
        STANCE_CHANGE_PARTICLE_RADIUS,
        STANCE_CHANGE_SOUND,
        target 
    );
    if(target) target.sendMessage(STANCE_CHANGE_MESSAGE);

    // STAT CHANGES - Add more if more breakpoints are added
    switch(breakPoint) { // Switch breakpoint % e.g - breakPoint = 0.25, matches case GUARD_BREAKPOINTS[3]
        case(GUARD_BREAKPOINTS[0]):

            break;

        case(GUARD_BREAKPOINTS[1]):

            break;

        case(GUARD_BREAKPOINTS[2]):

            break;
    }
}

/**
 * Handles the visual and audio effects for an NPC's stance change.
 *
 * @param {Object} npc - The NPC entity object, containing position and world information.
 * @param {Object} particle - The particle could be both a iParticle object or a particle identifier string(example: "snowshovel").
 * @param {boolean} iParticleBoolean - Determines if the particle is a iParticle object or a string identifier(true for iParticle, false for string identifier).
 * @param {number} particlesCount - The number of particles to generate.
 * @param {number} particleRadius - The radius within which to spawn particles around the NPC.
 * @param {string|null} sound - The identifier for the sound to play, or null if no sound. (example: "minecraft:ambient.weather.thunder")
 * @param {Object|null} player - The player entity to associate with the sound, or null if not applicable.
 */
function stanceChangeVisuals(npc, particle, iParticleBoolean, particlesCount, particleRadius, sound, player)
{
    var randomPoints = generateRandomPoints(npc.x, npc.y, npc.z, particleRadius, particlesCount)
    if (iParticleBoolean) {
        for (var i = 0; i < randomPoints.length; i++) {
            var point = randomPoints[i]
            particle.setPosition(point.x, point.y, point.z)
            particle.spawn(npc.world)
        }
    }
    else {
        for (var i = 0; i < randomPoints.length; i++) {
            var point = randomPoints[i]
            npc.world.spawnParticle(particle, point.x, point.y, point.z, Math.random(), Math.random(), Math.random(), 0.1, 1);
        }
    }

    if (sound == null || player == null) return;
    var soundPlayed = API.createSound(sound)
    soundPlayed.setEntity(player)
    API.playSound(1, soundPlayed)
    
}

/**
 * Generates an array of random points within a given radius around a central position.
 *
 * @param {number} x - The x-coordinate of the center point.
 * @param {number} y - The y-coordinate of the center point.
 * @param {number} z - The z-coordinate of the center point.
 * @param {number} radius - The radius within which to generate points.
 * @param {number} count - The number of random points to generate.
 * @returns {Array<{x: number, y: number, z: number}>} An array of point objects with x, y, and z properties.
 */
function generateRandomPoints(cx, cy, cz, radius, count)
{
    var points = []
    for (var i = 0; i < count; i++) {
        var theta = Math.random() * 2 * Math.PI
        var phi = Math.acos(2 * Math.random() - 1)
        var r = Math.random() * radius

        var x = cx + r * Math.sin(phi) * Math.cos(theta)
        var y = cy + r * Math.sin(phi) * Math.sin(theta)
        var z = cz + r * Math.cos(phi)

        points.push({ x: x, y: y, z: z })
    }
    return points
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
function isValidPlayer(player)
{
    return (player && player.getType() == 1 && player.getDBCPlayer() && player.getMode() == 0 && !player.getDBCPlayer().isDBCFusionSpectator())
}

// Guard Class ---------------------------------------------------------

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
    var dbcPlayer = this.player.getDBCPlayer();
    dbcPlayer.setBody(dbcPlayer.getBody() - dbcPlayer.getMaxBody() * this.QTE_PASS_DAMAGE)
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
    this.npc.setHealth(this.npc.getHealth() - this.npc.getMaxHealth() * this.QTE_PASS_DAMAGE)

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

/** progressBar constructor
 * @param {Int} maxValue - Max value of bar
 * @param {Int} initialValue - Initial value of bar
 * @param {Double[]} breakPoints - An ARRAY of decimal values to place ticks at 
 * @returns 
 */
function progressBar(maxValue, initialValue, breakPoints) 
{
    if(maxValue == null || initialValue == null || !breakPoints.constructor === Array) return;
    this.config();
    this.maxValue = maxValue;
    this.breakPoints = breakPoints;
    this.setBar(initialValue);
}

/** Creates the bar and sets it to a given value
 * @param {Int} value - Value to set bar to 
 */
progressBar.prototype.setBar = function(value)
{
    // Create overlay
    var barOverlay =  // Create overlay with id
    this.barOverlay = API.createCustomOverlay(this.OVERLAY_ID);;

    // Build bar border
    var border = barOverlay.addLine(this.BORDER_ID, this.x - this.BAR_WIDTH/2, this.y, this.x + this.BAR_WIDTH/2, this.y);
    border.setThickness(this.BAR_HEIGHT);
    border.setColor(this.BORDER_COLOUR);

    // Build bar itself
    var barX1 = this.x - this.BAR_WIDTH/2 + 1;
    var barX2 = barX1 + (this.BAR_WIDTH - 2) * value / this.maxValue;
    var bar = barOverlay.addLine(this.BAR_ID, barX1, this.y - 1, barX2, this.y - 1);
    bar.setThickness(this.BAR_HEIGHT - 2);
    bar.setColor(this.BAR_COLOUR);

    // Add ticks
    for(var i = 0; i < this.breakPoints.length; i++) {
        var tick = barOverlay.addLine(this.TICK_INITIAL_ID + i, barX1 + (this.BAR_WIDTH * this.breakPoints[i]), this.y - 1, barX1 + (this.BAR_WIDTH * this.breakPoints[i]), this.y - this.BAR_HEIGHT + 1);
        tick.setColor(this.TICK_COLOUR);
        tick.setThickness(this.TICK_THICKNESS);
    }

    // Add bar text
    var text = this.TEXT + value;
    var lx = this.x - Math.floor((text.length) * 2.5) * this.TEXT_SIZE; // Calculate centre position
    var ly = this.y - Math.floor(this.TEXT_SIZE * 6.5) + 12 * this.TEXT_POSITION;
    var shadowLabel = barOverlay.addLabel(this.TEXT_ID, text, lx, ly, 0, 0, this.SHADOW_COLOUR); // Add label in the middle of the screen with the given color
    shadowLabel.setScale(this.TEXT_SIZE);
    var textLabel = barOverlay.addLabel(this.SHADOW_ID, text, lx - 1, ly - 1, 0, 0, this.TEXT_COLOUR); // Add label in the middle of the screen with the given color
    textLabel.setScale(this.TEXT_SIZE); 
}

/** Adds bar to a player's UI
 * @param {IPlayer} player - Player to display bar to
 */
progressBar.prototype.displayBar = function(player)
{
    if(!player) return;
    player.showCustomOverlay(this.barOverlay);
    this.barOverlay.update(player);
}

/** Removes bar from a player's UI
 * @param {IPlayer} player - Player to remove bar from
 */
progressBar.prototype.removeBar = function(player)
{
    if(player) player.closeOverlay(this.OVERLAY_ID); 
}
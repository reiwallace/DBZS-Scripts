// Broly.js
// AUTHOR: Noxie

// CONFIG
var rageStatMultiplier = 2; // Multiplier to stats during rage mode
var passiveRageGeneration = 0.05; // Percent of rage bar to generate per rage tick
var rageTickSpeed = 10; // Number of game ticks between each rage tick
var rageModeDrainMultiplier = 5; // Multiplier to all negative rage generation while in rage mode e.g. punch that would generate 10% rage now drains 40%
var rageToHealth = 0.25; // Percent of health to fill a rage bar - e.g. it would take doing 25% of bosses hp to fill rage purely from damage

var rageParticle = "plug:textures/items/artifacts/infinity_catalyst.png"; // Item texture to use for rage particles
var rageAuraId = 4; // Set to appropriate ID for dbc aura
var rageParticleColours = [35328, 51712, 60416, 65280]; // Randomised colours to use for rage particle
var rageParticleRadius = 0.8; // Radius to spawn rage particles around npc
var rageParticleAge = 10; // Rage particle age in ticks
var rageParticleFrequency = 0; // How often rage particles are spawned
var rageParticleScale = { minX: 8, minY: 8, maxX: 12, maxY: 12 }; //    

var rageBlastItem = API.createItem("plug:energyBlock", 4, 1); // Item to use for rage ki blast - Item ID, Type, Count(ignore)
var rageKiBlastCd = 1; // CD of rage ki attack in ticks

var weakenedDuration = 100; // Duration of weakened state in ticks
var weakenedDamagedAmp = 0.2; // Percent damage increase while broly is weakened

var rageStartVoiceline = "&4&lRAAARGH!";
var rageEndVoiceline = "&2Impossible!";
var highRageVoiceline = "&aMy power is rising... It's overflowing!";

var regularKiBlast = DBCAPI.createKiAttack(
    1, // Type
    0, // Speed
    1, // Damage
    false, 6, 0, true, 100 // Effect, colour, density, sound, charge
);
var regKiBlastCd = 100; // CD of regular ki blast in ticks

// EDIT WITH NPC BASE STATS
function setDefaultStats(npc, multi) {
    // Follow template npc.setStat(AMOUNT * multi)
    npc.setMeleeStrength(1 * multi);
}

// RAGE BAR CONFIG
progressBar.prototype.config = function() {
    // COMPONENT IDS
    this.OVERLAY_ID = 199;
    this.BORDER_ID = 1;
    this.BAR_ID = 2;
    this.TICK_INITIAL_ID = 3;
    this.TEXT_ID = 50;
    this.SHADOW_ID = 51;
    
    // POSITIONING
    this.x = 480;
    this.y = 25;

    // COLOUR CONFIG
    this.BORDER_COLOUR = 1; // Border colour - takes a decimal colour (https://www.mathsisfun.com/hexadecimal-decimal-colors.html)
    this.BAR_COLOUR = 33792; // Bar colour - takes a decimal colour (https://www.mathsisfun.com/hexadecimal-decimal-colors.html)
    this.BAR_WIDTH = 250; // Width of bar in pixels
    this.BAR_HEIGHT = 7; // Height of bar in whatever the game feels like

    // TICK CONFIG
    this.TICK_COLOUR = 0; // Tick colour - takes a decimal colour (https://www.mathsisfun.com/hexadecimal-decimal-colors.html)
    this.TICK_THICKNESS = 1;

    // TEXT CONFIG
    this.TEXT = "Rage"; // Text displayed for the bar
    this.TEXT_POSITION = -1; // Set to -1 to position above bar +1 for below
    this.TEXT_COLOUR = 65280; // Text colour
    this.TEXT_SIZE = 1;
    this.SHADOW_COLOUR = 0; // Colour of shadow behind text
}

// TIMERS
var RAGE_PASSIVE = 0;
var WEAKENED = 50;
var KI_BLAST = 1;
var RAGE_KI = 2;
var RAGE_PARTICLES = 3;
var KI_BLAST_TELEGRAPH;

// DO NOT EDIT
var rageMode = false;
var rage;
var target = null;
var voiceFlag = true;
var previousHp;

function init(event)
{
    var npc = event.npc;
    var dbcDisplay = DBCAPI.getDBCDisplay(npc);
    dbcDisplay.setEnabled(true);
    dbcDisplay.toggleAura(false);
    npc.updateClient();
    rageMode = false;
    rage = new progressBar(npc.getMaxHealth() * rageToHealth, 0, [0]);
    previousHp = npc.getMaxHealth();
    reset(npc);
}

function reset(npc)
{
    var nearby = npc.getSurroundingEntities(npc.getAggroRange(), 1);
    for(var i = 0; i < nearby.length; i++) {
        if(!nearby[i] || !rage) continue;
        rage.removeBar(nearby[i]);
    }
    if(target) rage.removeBar(target);
    npc.timers.clear();
    setDefaultStats(npc, 1);
    voiceFlag = true;
    rageMode = false;
    rage.setBar(0);
}

function timer(event)
{
    var npc = event.npc;
    var timers = npc.timers;
    switch(event.id) {
        case(RAGE_PASSIVE):
            // Generate rage each rage tick
            updateRage(npc, rage.maxValue * passiveRageGeneration);
            break;

        case(KI_BLAST_TELEGRAPH):
            // Telegraphs ki blast before shooting
            npc.say(kiBlastTelegraph);
            npc.timers.forceStart(KI_BLAST, kiBlastDelay, false);
            break;

        case(KI_BLAST):
            // Shoot a ki blast if not in rage mode or 
            if(rageMode || timers.has(WEAKENED)) return;
            DBCAPI.fireKiAttack(npc, regularKiBlast);
            break;

        case(RAGE_KI):
            // Shoots random ki, cancels timer if not in rage mode
            if(!rageMode) {
                npc.timers.stop(RAGE_KI);
                return;
            }
            // Two for good luck
            shootKi(npc, npc.getAttackTarget());
            break;

        case(RAGE_PARTICLES):
            // Spawns particles around npc, cancels timer if not in rage mode
            if(!rageMode) {
                npc.timers.stop(RAGE_KI);
                return;
            }
            rageParticles(npc);
            break;
    }
}

// Start timers on player interaction
function target(event)
{
    var npc = event.npc;
    target = npc.getAttackTarget();
    startTimers(npc.timers);
    rage.displayBar(npc.getAttackTarget());
}

function damaged(event)
{
    var npc = event.npc;
    var timers = npc.timers;
    target = npc.getAttackTarget();
    startTimers(timers);

    var damage = previousHp - npc.getHealth();
    previousHp = npc.getHealth();
    updateRage(npc, damage);

    if(!timers.has(WEAKENED)) return;
    event.setDamage(damage * weakenedDamagedAmp);
    previousHp = npc.getHealth();
}

function meleeSwing(event)
{
    startTimers(event.npc.timers);
}
// -----

/** Updates rage value dynamically depending on rage state
 * @param {ICustomNpc} npc - Angry npc
 * @param {Double} value - Amount to increase/decrease rage by
 */
function updateRage(npc, value)
{
    var timers = npc.timers;
    // Don't change rage if in weakened state
    if(timers.has(WEAKENED)) return;

    // Update rage depending on rage state
    var updatedValue = rageMode ? -value * rageModeDrainMultiplier : value;
    rage.setBar(rage.progress + updatedValue);
    rage.displayBar(npc.getAttackTarget());

    // Enter weakened state upon reaching 0 rage
    if(rageMode && rage.progress <= 0) {
        timers.forceStart(WEAKENED, weakenedDuration, false);
        setDefaultStats(npc, 1)
        npc.say(rageEndVoiceline);
        rageMode = false;
        voiceFlag = true;
    } 
    // Enter rage mode upon reaching max rage
    else if(!rageMode && rage.progress >= rage.maxValue) {
        rageMode = true;
        // Set up aura
        var dbcDisplay = DBCAPI.getDBCDisplay(npc);
        dbcDisplay.setAura(rageAuraId);
        dbcDisplay.toggleAura(true);

        // Start timers and set stats
        npc.say(rageStartVoiceline);
        timers.forceStart(RAGE_KI, rageKiBlastCd, true);
        timers.forceStart(RAGE_PARTICLES, rageParticleFrequency, true);
        setDefaultStats(npc, rageStatMultiplier);
    } else if(rage.progress >= rage.maxValue * 0.8 && voiceFlag) {
        npc.say(highRageVoiceline);
        voiceFlag = false;
    }

}

/** Spawns particles in a random position around the npc
 * @param {ICustomNpc} npc 
 */
function rageParticles(npc)
{
    // Particle setup
    var particle = API.createParticle(rageParticle);
    particle.setMaxAge(rageParticleAge);
    particle.setScale(
        getRandom(rageParticleScale.minX, rageParticleScale.maxX, true),
        getRandom(rageParticleScale.minY, rageParticleScale.maxY, true), 0, 0
    );
    particle.setAlpha(1, 0, 0.5, 6);
    particle.setSize(16, 16);
    particle.setAnim(1, true, 0, 6);
    particle.setHEXColor(rageParticleColours[getRandom(0, rageParticleColours.length, true)], 5242624, 0, 1);
    // Give particle a slow rise
    particle.setMotion(0, 0.02, 0, 0);

    // Spawn particle at a random position around npc
    particle.setPosition(npc.x + getRandom(-rageParticleRadius, rageParticleRadius, false), npc.y + getRandom(-0.2, 2.4, false), npc.z + getRandom(-rageParticleRadius, rageParticleRadius, false));
    particle.spawn(npc.world);
}

/** Shoots a projectile "Ki" attack in a random direction
 * @param {ICustomNpc} npc - Npc shooting the attack
 * @param {IEntity} target - Target to shoot at
 */
function shootKi(npc, target)
{
    // Shoots the item and finds it with an entity scan
    if(!target) return;
    npc.shootItem(target, rageBlastItem, 100);
    var projectileScan = npc.getSurroundingEntities(1);
    var ki = null;
    for(var i = 0; i < projectileScan.length; i++) {
        if(projectileScan[i] && projectileScan[i].getType() == 7) {
        ki = projectileScan[i];
        break;
        }
    }
    if(!ki) return;
    
    // Calculates a random position around the npc to shoot in
    var randomPos = {
        x: (npc.x + getRandom(-3, 3, true)) - npc.x , 
        y: (npc.y + getRandom(0, 3, true)) - npc.y,
        z: (npc.z + getRandom(-3, 3, true)) - npc.z
    };

    // Shoots the projectile in a direction calculated from random pos - MATH CREDIT TO IKES OLD HOMING KI SCRIPT
    var length = Math.sqrt(Math.pow(randomPos.x, 2) + Math.pow(randomPos.y, 2) + Math.pow(randomPos.z, 2)) //we calculate the length of the direction
    var direction = [(randomPos.x / length), (randomPos.y / length), (randomPos.z / length)] //and then we normalize it and store it in the direction variable
    ki.setPosition(npc.x, npc.y + 1, npc.z);
    ki.setMotion(direction[0], direction[1], direction[2]);
}

/** Returns a random number between two values
* @param {int} min - the minimum number to generate a value from
* @param {int} max - the minimum number to generate a value from 
* @param {Boolean} getInt - Only returns integer values if true
*/
function getRandom(min, max, getInt)
{  
    if(getInt) return Math.floor(Math.random() * (max - min + 1)) + min;
    else return Math.random() * (max - min + 1) + min;
}

/** Starts timers if not present
 * @param {ITimers} timers - Npc's timers 
 */
function startTimers(timers)
{
    if(timers.has(RAGE_PASSIVE)) return;
    timers.forceStart(RAGE_PASSIVE, rageTickSpeed, true);
    timers.forceStart(KI_BLAST_TELEGRAPH, regKiBlastCd, true);
}

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
    this.progress = initialValue;
    this.setBar(initialValue);
}

/** Creates the bar and sets it to a given value
 * @param {Int} value - Value to set bar to 
 */
progressBar.prototype.setBar = function(value)
{
    if(value < 0) value = 0;
    else if(value > this.maxValue) value = this.maxValue;
    this.progress = value;
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
    var lx = this.x - Math.floor((this.TEXT.length) * 2.5) * this.TEXT_SIZE; // Calculate centre position
    var ly = this.y - Math.floor(this.TEXT_SIZE * 6.5) + 12 * this.TEXT_POSITION;
    var shadowLabel = barOverlay.addLabel(this.TEXT_ID, this.TEXT, lx, ly, 0, 0, this.SHADOW_COLOUR); // Add label in the middle of the screen with the given color
    shadowLabel.setScale(this.TEXT_SIZE);
    var textLabel = barOverlay.addLabel(this.SHADOW_ID, this.TEXT, lx - 1, ly - 1, 0, 0, this.TEXT_COLOUR); // Add label in the middle of the screen with the given color
    textLabel.setScale(this.TEXT_SIZE); 
}

/** Adds bar to a player's UI
 * @param {IPlayer} player - Player to display bar to
 */
progressBar.prototype.displayBar = function(player)
{
    if(!(player && player.getType() == 1 && player.getDBCPlayer() && player.getMode() == 0 && !player.getDBCPlayer().isDBCFusionSpectator())) return;
    player.showCustomOverlay(this.barOverlay);
    this.barOverlay.update(player);
}

/** Removes bar from a player's UI
 * @param {IPlayer} player - Player to remove bar from
 */
progressBar.prototype.removeBar = function(player)
{
    if(player && player.getType() == 1) player.closeOverlay(this.OVERLAY_ID); 
}
// Broly.js
// AUTHOR: Noxie

// CONFIG
var RAGE_STAT_MULTIPLIER = 2; // Multiplier to stats during rage mode
var PASSIVE_RAGE_INCREASE = 0.05; // Percent increase to rage per rage tick
var PASSIVE_RAGE_DECREASE = 0.2; // Percent decrease to rage per rage tick
var RAGE_TICK_SPEED = 20; // Number of game ticks between each rage tick

var WEAKENED_DURATION = 100; // Duration of weakened state in ticks
var WEAKENED_DAMAGE_AMP = 1.2; // Percent damage increase while broly is weakened

// EDIT WITH NPC BASE STATS
function setDefaultStats(npc, multi) {

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

// DO NOT EDIT
var rageMode = false;
var rage;
var target;
var maxRage = 1000;

function init(event)
{
    var npc = event.npc;
    rage = new progressBar(maxRage, 0, [0]);
    reset(npc);
}

function reset(npc)
{
    var nearby = npc.getSurroundingEntities(npc.getAggroRange(), 1);
    for(var i = 0; i < nearby.length; i++) {
        if(!nearby[i] || !rage) continue;
        rage.removeBar(nearby[i]);
    }
    npc.timers.clear();
    setDefaultStats(npc, 1);
    rageMode = false;
    rage.setBar(0);
}

function timer(event)
{
    var npc = event.npc;
    var timers = npc.timers;
    switch(event.id) {
        case(RAGE_PASSIVE):
            var passive = rageMode ? PASSIVE_RAGE_DECREASE : PASSIVE_RAGE_INCREASE;
            updateRage(npc, rage.maxValue * passive)
            
            break;
    }
}

// Start timers on player interaction
function target(event)
{
    startTimers(event.npc.timers);
}

function damaged(event)
{
    var timers = event.npc.timers;
    startTimers(timers);

    if(!timers.has(WEAKENED)) return;
    event.setDamage(event.getDamage() * WEAKENED_DAMAGE_AMP);
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
    var updatedValue = rageMode ? -value : value;
    rage.setBar(rage.progress + updatedValue);
    rage.displayBar(npc.getAttackTarget());

    // Enter weakened state upon reaching 0 rage
    if(rageMode && rage.progress <= 0) {
        timers.forceStart(WEAKENED, WEAKENED_DURATION, false);
        setDefaultStats(npc, 1)
        rageMode = false;
    } 
    // Enter rage mode upon reaching max rage
    else if(!rageMode && rage.progress >= rage.maxValue) {
        rageMode = true;
        setDefaultStats(npc, RAGE_STAT_MULTIPLIER);
    }

}

/** Starts timers if not present
 * @param {ITimers} timers - Npc's timers 
 */
function startTimers(timers)
{
    if(timers.has(RAGE_PASSIVE)) return;
    timers.forceStart(RAGE_PASSIVE, RAGE_TICK_SPEED, true);
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
    if(player) player.closeOverlay(this.OVERLAY_ID); 
}
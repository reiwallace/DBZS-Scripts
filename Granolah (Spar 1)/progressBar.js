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
    this.BAR_COLOUR = 16777215; // Bar colour - takes a decimal colour (https://www.mathsisfun.com/hexadecimal-decimal-colors.html)
    this.BAR_WIDTH = 300; // Width of bar in pixels
    this.BAR_HEIGHT = 7; // Height of bar in whatever the game feels like

    // TICK CONFIG
    this.TICK_COLOUR = 0; // Tick colour - takes a decimal colour (https://www.mathsisfun.com/hexadecimal-decimal-colors.html)
    this.TICK_THICKNESS = 1;

    // TEXT CONFIG
    this.TEXT = "Progress: "; // Text displayed for the bar
    this.TEXT_POSITION = -1; // Set to -1 to position above bar +1 for below
    this.TEXT_COLOUR = 16777215; // Text colour
    this.TEXT_SIZE = 1;
    this.SHADOW_COLOUR = 0; // Colour of shadow behind text
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
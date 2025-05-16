// CHANGE THESE
var ARENA_CENTRE = [-257, 56, -842];

// CONFIG
var NPC_SPEED = 5;

// DON'T EDIT
var npcAnimHandler;
var quickTimeEvent;

// TIMERS
var QTE_TIMER = 2;

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

function init(event)
{
    var npc = event.npc;
    npc.timers.clear();
    npcAnimHandler = new animationHandler(npc);
    quickTimeEvent = new qteHandler(npc, npcAnimHandler, ARENA_CENTRE, QTE_TIMER, NPC_SPEED);
    npc.setSpeed(NPC_SPEED);
}

function damaged(event)
{
    var npc = event.npc;
    var player = event.getSource();
    if(npc.isAlive() && player != null && player.getMode() != 1 && player.getType() == 1 && !npc.timers.has(QTE_TIMER)) {
        var playerAnimHandler = new animationHandler(player);
        quickTimeEvent.newQTE(player, playerAnimHandler);
    }
}

function meleeAttack(event)
{
    // Cancel melee if performing qte
    if(quickTimeEvent != null && quickTimeEvent.isPerformingQTE()) event.setCancelled(true);
}

function killed(event)
{
    var npc = event.npc;
    var player = event.player;
    if (player != null && player.getType() == 1) {
        player.closeGui();
        npc.timers.clear();
    }
}

function timer(event)
{
    switch (event.id) {
        case QTE_TIMER:
            if(quickTimeEvent != null) quickTimeEvent.failQTE();
            break;
    }
}

/** qteHandler class ---------------------------------------------------------------------
 */

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
    this.npc.setSpeed(this.NPC_SPEED);

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
    this.npc.setSpeed(this.NPC_SPEED);

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
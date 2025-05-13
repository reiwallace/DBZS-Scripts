var gui = API.createCustomGui(GUI_ID, 0, 0, false);

var arenaCenter = [555, 2, 151];
var npcRotation = 90; // Direction npc facing when teleported to middle of arena
var playerRotation = 270; // Direction player facing when teleported to middle of arena

var npcSpeed = 5;

var failedMessage = "&cFailed!";

var npcWindupAnimation = "ParryStance";
var playerWindupAnimation = "ParryStance";
var qteSuccessAnimation = "GuardBreak";
var qteFailedAnimation = "BigBangAttack";
var playerFailedAnimation = "GuardBreak";

var qteTime = 30; // Time for player to click the qte

var GUI_ID = 72;
var BUTTON_ID = 72;

var QTE_CHECK = 1;
var QTE_TIMER = 2;

function init(e) {
    e.npc.setSpeed(npcSpeed);
}
function damaged(e) {
    var npc = e.npc;
    var player = e.getSource();

    if (npc.isAlive() && player != null && player.getMode() != 1 && player.getType() == 1) {
        quickTimeEvent(npc, player);
    }
}
function meleeAttack(e) {
    var npc = e.npc;
    var ti = npc.getTimers();
    if (ti.has(QTE_TIMER)) {
        e.setCancelled(true);
    }
}
function killed(e) {
    var npc = e.npc;
    var player = e.getSource();
    var ti = npc.getTimers();
    if (player != null && player.getType() == 1) {
        player.closeGui();
        ti.clear();
    }
}
function timer(e) {
    var npc = e.npc;
    var player = npc.getWorld().getClosestVulnerablePlayer(npc.getPosition(), 50.0);

    switch (e.id) {
        case QTE_CHECK:
            var countered = npc.getTempData("countered");
            if (countered == 1 && npc.isAlive()) {
                successQTE(npc, qteSuccessAnimation);
            }
            break;

        case QTE_TIMER:
            if (player != null && npc.isAlive()) {
                failQTE(npc, player, qteFailedAnimation, playerFailedAnimation);
            }
            break;
    }
}

/**
 * @param {ICustomNpc} npc - npc to trigger the QTE
 * @param {IPlayer} player - player who gets the QTE button
 */
function quickTimeEvent(npc, player) {
    var ti = npc.getTimers();
    if (player != null) {
        var x = Math.floor(Math.random() * 401) - 200
        var y = Math.floor(Math.random() * 401) - 200
        var button = gui.addButton(BUTTON_ID, "CLICK!", x, y, 70, 20);
        button.setColor(0x705C7D)
        player.showCustomGui(gui)
        ti.forceStart(QTE_CHECK, 0, true);
        ti.forceStart(QTE_TIMER, qteTime, false);
        npc.setPosition(arenaCenter[0] + 1, arenaCenter[1], arenaCenter[2]);
        player.setPosition(arenaCenter[0] - 1, arenaCenter[1], arenaCenter[2]);
        npc.setRotation(npcRotation);
        player.setRotation(playerRotation);
        npc.setSpeed(0);
        doAnimation(npc, npcWindupAnimation);
        doAnimation(player, playerWindupAnimation);
    }
}

/**
 * @param {IEntity} entity - Entity who plays the animation
 * @param {string} name - Name of the animation
 */
function doAnimation(entity, name) { // Executes animations
    var anim = API.getAnimations().get(name);
    var animData = entity.getAnimationData();
    animData.setEnabled(true);
    animData.setAnimation(anim);
    animData.updateClient();
}

/**
 * @param {ICustomNpc} npc - npc that plays animation and change speed 
 * @param {IPlayer} player - player who recieve message, play animation and gets the GUI closed
 * @param {string} npcAnimation - Name of the npc animation
 * @param {string} playerAnimation - Name of the player animation
 */
function failQTE(npc, player, npcAnimation, playerAnimation) {
    doAnimation(npc, npcAnimation);
    doAnimation(player, playerAnimation);
    player.sendMessage("&cFailed!");
    player.closeGui();
    npc.setSpeed(npcSpeed);
}

/**
 * @param {ICustomNpc} npc - npc who plays animation, change speed and change itself tempdata
 * @param {string} npcAnimation - Name of the animation
 */
function successQTE(npc, npcAnimation) {
    var ti = npc.getTimers();
    ti.stop(QTE_TIMER);
    doAnimation(npc, npcAnimation);
    npc.setSpeed(npcSpeed);
    npc.setTempData("countered", 0);
}
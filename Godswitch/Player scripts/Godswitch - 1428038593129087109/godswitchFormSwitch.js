// godswitchFormSwitch.js
// AUTHOR: Noxie, Max
// Purpose: Alternate player between God and Blue when in godswitch forms
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'DEPRECATED' ON THE GITHUB AND MOVE TO DEPRECATED FOLDER

var gsConfig = {
    ssgForm : DBCAPI.getForm("SAI-SSG (GS)"),
    ssroseForm : DBCAPI.getForm("SAI-Rose (GS)"),
    ssgssForm : DBCAPI.getForm("SAI-SSB (GS)"),
    switchInterval : 20, // in ticks
    drainModifier : 0.02, 
    initialDrain : 5
}

/** Alternates player's forms between god and blue
 * @param {IAction} action 
 */
function godswitch(action)
{
    var actionManager = action.getManager();
    var playerData = action.getData("playerData");
    if(!lib.isPlayer(playerData.player) || !playerData.dbc || !playerData.currentForm || playerData.dbc.getCurrentForm() != playerData.currentForm) {
        action.markDone();
        return;
    } 
    var nextForm = playerData.currentForm == gsConfig.ssgForm ? (playerData.dbc.isDivine() ? gsConfig.ssroseForm : gsConfig.ssgssForm) : gsConfig.ssgForm;
    playerData.dbc.setCustomForm(nextForm, true);
    playerData.currentForm = nextForm;
    if(nextForm == gsConfig.ssgForm) playerData.player.timers.forceStart(godHeal.timer, godHeal.interval, false);
    else playerData.player.timers.stop(godHeal.timer);
    actionManager.scheduleParallel("gs" + playerData.player.getName(), 5, gsConfig.switchInterval, godswitch).setData("playerData", playerData);
    action.markDone();
}

function tick(event)
{
    var actionManager = API.getActionManager();
    var player = event.player;
    var dbc = player ? player.getDBCPlayer() : null;
    if(!lib.isPlayer(player) || !dbc) return;
    // Start action manager
    if((dbc.getCurrentForm() == gsConfig.ssgForm || dbc.getCurrentForm() == gsConfig.ssgssForm || dbc.getCurrentForm() == gsConfig.ssroseForm) && 
        !actionManager.hasAny("gs" + player.getName()) && 
        !dbc.isChargingKi()) {
        var playerData = {
            player: player,
            dbc: dbc,
            currentForm: dbc.getCurrentForm()
        }
        actionManager.scheduleParallel("gs" + playerData.player.getName(), 5, gsConfig.switchInterval, godswitch).setData("playerData", playerData);
        actionManager.start();
    } 
    // Flash blue
    if((dbc.getCurrentForm() == gsConfig.ssgForm || dbc.getCurrentForm() == gsConfig.ssgssForm || dbc.getCurrentForm() == gsConfig.ssroseForm) && 
        actionManager.hasAny("gs" + player.getName()) && dbc.isChargingKi()) {
        actionManager.cancelAny("gs" + player.getName());
        if(dbc.getCurrentForm() == gsConfig.ssgForm) {
            player.timers.stop(godHeal.timer);
            if(dbc.isDivine()) dbc.setCustomForm(gsConfig.ssroseForm, true);
            else dbc.setCustomForm(gsConfig.ssgssForm, true);
        }
    }
}

function attack(event)
{
    var dbc = event.getPlayer().getDBCPlayer();
    if(!dbc || (dbc.getCurrentForm() != gsConfig.ssgssForm && dbc.getCurrentForm() != gsConfig.ssroseForm)) return;
    var masteryPercent = dbc.getCustomMastery(gsConfig.ssgForm) / gsConfig.ssgForm.getMastery().getMaxLevel();
    dbc.setKi(dbc.getKi() -  dbc.getMaxKi() * gsConfig.drainModifier * (gsConfig.initialDrain - (gsConfig.initialDrain - 1) * masteryPercent)) // currentKi -  (MaxKi * drainModifier * masteryModifier)
}
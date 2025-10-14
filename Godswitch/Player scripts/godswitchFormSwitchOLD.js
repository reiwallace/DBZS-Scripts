// godswitchFormSwtich.js 
// Author: Max, Noxie


//***PARAMETERS***
var ssgFormName = "SSG(GodSwitch)"; // change these to the correct names for the forms NOT THE MENU NAMES
var ssgssFormName ="SSB(GodSwitch)";// change these to the correct names for the forms NOT THE MENU NAMES
var ssgForm = DBCAPI.getForm(ssgFormName);
var ssgssForm = DBCAPI.getForm(ssgssFormName);

var gsConfig = {
    switchInterval : 20, // in ticks
    timerId : 420,
    drainModifier : 0.02, 
    initialDrain : 5
}

function godswitch(player)
{
    function god(action) {}
    function blue(action) {
        var actionManager = action.getActionManager();


        actionManager.scheduleParallel()
    }
    
    var actionManager = API.getActionManager();
    var dbc = player ? player.getDBCPlayer() : null;
    if (!lib.isPlayer(player) || !dbc || dbc.getCurrentForm() != ssgForm) return;

    actionManager.scheduleParallel(gsConfig.switchInterval, blue).addData("godFunc", god);
}

/** This function goes inside the melee attack event and is responsible for activating godswitch
 * @param event 
 * @returns 
 */
function godSwitchOn(event){
    var player = event.player;
    var dbc = player ? player.getDBCPlayer() : null;
    if (!lib.isPlayer(player) || !dbc || dbc.getCurrentForm() != ssgForm || player.timers.has(godswitch.timerId)) return;
    
    dbc.giveCustomForm(ssgssForm);
    dbc.setCustomMastery(ssgssForm, dbc.getCustomMastery(ssgForm));
    dbc.setCustomForm(ssgssForm);
    player.timers.forceStart(godswitch.timerId, godswitch.switchInterval, false);
}

/** This function goes inside the player melee attack event to account for drain due to mastery
 * @param event 
 * @returns 
 */
function godSwitchDrain(event){
    var player = event.player;
    var dbc = player ? player.getDBCPlayer() : null;
    if (!lib.isPlayer(player) || !dbc || dbc.getCurrentForm() != ssgssForm) return;

    var masteryPercent = dbc.getCustomMastery(ssgForm, false) / ssgForm.getMastery().getMaxLevel();
    var drain = dbc.getKi() - dbc.getMaxKi() * godswitch.drainModifier * (godswitch.initialDrain - (godswitch.initialDrain - 1) * masteryPercent); // currentKi -  (MaxKi * drainModifier * masteryModifier)
    dbc.setKi(drain);
}


/** This function goes inside of the Tick event to check for ki charge
 * @param event 
 */
function godSwitchKiCharge(event){
    var player = event.player;
    var dbc = player ? player.getDBCPlayer() : null;
    if(!player.timers.has(godswitch.timerId) && player.getDBCPlayer().getCurrentForm() == ssgssForm && !player.getDBCPlayer().isChargingKi()){
    //check if they don't have the godswitch timer, if they are in ssgss and they arent charging ki
    var dbc = event.getPlayer().getDBCPlayer();
    dbc.setCustomForm(ssgForm);
    dbc.removeCustomForm(ssgssForm);
    return;
    }

    if(player.getDBCPlayer().getCurrentForm() == ssgForm && player.getDBCPlayer().isChargingKi()){
        
        //if player is in ssg and is charging ki
        var dbc = event.getPlayer().getDBCPlayer();
        dbc.giveCustomForm(ssgssForm);
        dbc.setCustomForm(ssgssForm);
        return;
    }
    return;
}

/**
 * This function goes inside the timer event and is in charge of turning of godswitch
 * @param event 
 */
function godSwitchOff(event){
    if(event.id != godSwitchTimerId) return;

    var dbc = event.getPlayer().getDBCPlayer();
    dbc.setCustomForm(ssgForm);
    dbc.removeCustomForm(ssgssForm);
    dbc.setCustomMastery(ssgssForm,0.0);
}

//** CALLING OF EVENTS**
function tick(event){
    godSwitchKiCharge(event);
}

function timer(event){
    godSwitchOff(event);
}

function attack(event){
    godSwitchOn(event);
    godSwitchDrain(event);
}
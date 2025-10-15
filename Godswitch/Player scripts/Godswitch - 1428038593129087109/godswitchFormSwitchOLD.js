//godSwitch Script by Max


//***PARAMETERS***
var ssgFormName = "SSG(GodSwitch)" // change these to the correct names for the forms NOT THE MENU NAMES
var ssgssFormName ="SSB(GodSwitch)"// change these to the correct names for the forms NOT THE MENU NAMES
var godSwitchTimerDuration = 20 // delay in ticks that the effect 
var godSwitchTimerId = 420 // change this to any timer ID that is not being used in player scripts yet
var ssgForm = DBCAPI.getForm(ssgFormName)
var ssgssForm = DBCAPI.getForm(ssgssFormName)
var godSwitchDrainModifier = 0.02 // drain per hit as a percent at max mastery 
var godSwitchDrainMax = 5 // how much drain is multiplied by when unmastered
//***PARAMETERS***


/**
 * This function goes inside the melee attack event and is responsible for activating godswitch
 * @param event 
 * @returns 
 */
function godSwitchOn(event){
    var player = event.getPlayer()
    if (!player.timers.has(godSwitchTimerId)){
        var dbc = player.getDBCPlayer()
        if(dbc.getCurrentForm() != ssgForm){
            return
        }
        
        dbc.giveCustomForm(ssgssForm)
        dbc.setCustomMastery(ssgssForm,dbc.getCustomMastery(ssgForm))
        dbc.setCustomForm(ssgssForm)
        player.timers.forceStart(godSwitchTimerId,godSwitchTimerDuration,false)
        return
    } 
}

/**
 * This function goes inside the player melee attack event to account for drain due to mastery
 * @param event 
 * @returns 
 */
function godSwitchDrain(event){
    var dbc = event.getPlayer().getDBCPlayer()
    if(dbc.getCurrentForm() != ssgssForm){
        return
    }
    var masteryPercent = dbc.getCustomMastery(ssgForm,false) / ssgForm.getMastery().getMaxLevel()

    var drain = dbc.getKi() -  dbc.getMaxKi() * godSwitchDrainModifier * (godSwitchDrainMax - (godSwitchDrainMax - 1) * masteryPercent) // currentKi -  (MaxKi * drainModifier * masteryModifier)
    dbc.setKi(drain)
    return
    
}


/**
 *  This function goes inside of the Tick event to check for ki charge
 * @param event 
 */
function godSwitchKiCharge(event){
    var player = event.getPlayer()
    if(!player.timers.has(godSwitchTimerId) && player.getDBCPlayer().getCurrentForm() == ssgssForm && !player.getDBCPlayer().isChargingKi()){
    //check if they don't have the godswitch timer, if they are in ssgss and they arent charging ki
    var dbc = event.getPlayer().getDBCPlayer()
    dbc.setCustomForm(ssgForm)
    dbc.removeCustomForm(ssgssForm)
    return
    }

    if(player.getDBCPlayer().getCurrentForm() == ssgForm && player.getDBCPlayer().isChargingKi()){
        
        //if player is in ssg and is charging ki
        var dbc = event.getPlayer().getDBCPlayer()
        dbc.giveCustomForm(ssgssForm)
        dbc.setCustomForm(ssgssForm)
        return
    }

    return


}

/**
 * This function goes inside the timer event and is in charge of turning of godswitch
 * @param event 
 */
function godSwitchOff(event){
var id = event.getId()

    if(id != godSwitchTimerId){
        return
    }
    var dbc = event.getPlayer().getDBCPlayer()
    dbc.setCustomForm(ssgForm)
    dbc.removeCustomForm(ssgssForm)
    dbc.setCustomMastery(ssgssForm,0.0)
    
}

//** CALLING OF EVENTS**z`

function tick(event){
    godSwitchKiCharge(event)
}

function timer(event){
    godSwitchOff(event)
}

function attack(event){
    godSwitchOn(event)
    godSwitchDrain(event)
}
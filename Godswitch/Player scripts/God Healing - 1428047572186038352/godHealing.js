// godswitchHeal.js
// Purpose: This script applies a godHeal to the player when they enter SSG and maintains it only in SSG.
// Author: Ranger_Halt, Noxie.

// CONFIG
var godHeal = {
    amount : 0.0075, //expected as a percentage of the player's health. 0.01 would be 1% of their max HP, 0.5 would be 50% of their health.
    interval : 5, // Duration between healing ticks.
    fusionBoost : 2.0, //expected as a multiplier, 1.5 would be 50%, 2 is double healing.
    subZeroFail : 0.5, //expected as a percentage, 0.4 is a 40% chance. 0.25% would be a 25% chance.
    timer : 67
}
API.addGlobalObject("godHeal", godHeal);
var ssgForms = [
    7,
    9,
    10,
    156
];

function dbcFormChange(event) {

    var formInto = event.getFormAfterID();
    var formFrom = event.getFormBeforeID();
    var player = event.player;
    var timers = player.timers;

    if (formInto == null || formFrom == null) return; //cursory null check in case

    //If the player enters SSG, start the healing timer.
    //The player should not need the timer started if it's already ongoing, it will self maintain.
    if (ssgForms.indexOf(formInto) != -1 && !player.getTimers().has(godHeal.timer)) timers.start(godHeal.timer, godHeal.interval, false);

    //If the player leaves SSG, stop the healing timer
    if (ssgForms.indexOf(formFrom) != -1) timers.stop(godHeal.timer);
}

// Healing Function
function timer(event) {
    var player = event.player;
    var dbc = player ? player.getDBCPlayer() : null;
    if(event.id != 67 || 
        !lib.isPlayer(player) || 
        !dbc
    ) return;
    try {
        if(ssgForms.indexOf(dbc.getCurrentForm().getID()) == -1) return;
    } catch(e) {
        if(dbc.getCurrentDBCFormName() != "SSGod") return;
    }

    //player stats, relating to HP
    var maxHP = dbc.getMaxHP();
    var currHP = dbc.getBody();
    var healPer = maxHP * godHeal.amount;
    player.timers.forceStart(godHeal.timer, godHeal.interval, false); //forcefully restart the timer to continue the healing

    if(currHP <= 0 && Math.random() < godHeal.subZeroFail) return; //If the player is currently dying, make a chance for the godHeal to cancel out so they're not invincible

    //Calculate the player's new HP
    var finalBody = currHP + (dbc.getJRMCSE().contains("Z") ? healPer * godHeal.fusionBoost : healPer);
    dbc.setBody(finalBody > maxHP ? maxHP : finalBody);
}
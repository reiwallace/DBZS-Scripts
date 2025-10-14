// godswitchHeal.js
// Purpose: This script applies a heal to the player when they enter SSG and maintains it only in SSG.
// Author: Ranger_Halt, Noxie.

// CONFIG
var heal = {
    amount : 0.015, //expected as a percentage of the player's health. 0.01 would be 1% of their max HP, 0.5 would be 50% of their health.
    interval : 10, // Duration between healing ticks.
    fusionBoost : 2.0, //expected as a multiplier, 1.5 would be 50%, 2 is double healing.
    subZeroFail : 0.5 //expected as a percentage, 0.4 is a 40% chance. 0.25% would be a 25% chance.
}
var ssgForms = [
    7,
    9
];

// TIMERS
var HEALING_TIMER = 67;

function dbcFormChange(event) {

    var formInto = event.getFormAfterID();
    var formFrom = event.getFormBeforeID();
    var player = event.player;
    var timers = player.timers;

    if (formInto == null || formFrom == null) return; //cursory null check in case

    //If the player enters SSG, start the healing timer.
    //The player should not need the timer started if it's already ongoing, it will self maintain.
    if (ssgForms.indexOf(formInto) != -1 && !player.getTimers().has(HEALING_TIMER)) timers.start(HEALING_TIMER, heal.interval, false);

    //If the player leaves SSG, stop the healing timer
    if (ssgForms.indexOf(formFrom) != -1) timers.stop(HEALING_TIMER);
}

// Healing Function
function timer(event) {
    var player = event.player;
    var dbc = player ? player.getDBCPlayer() : null;
    if(event.id != 67 || 
        !lib.isPlayer(player) || 
        !dbc || 
        typeof dbc.getCurrentForm() == "number" ? ssgForms.indexOf(dbc.getCurrentForm()) == -1 : ssgForms.indexOf(dbc.getCurrentForm().getID()) == -1
    ) return;

    //player stats, relating to HP
    var maxHP = dbc.getMaxHP();
    var currHP = dbc.getBody();
    var healPer = maxHP * heal.amount;
    player.timers.forceStart(HEALING_TIMER, heal.interval, false); //forcefully restart the timer to continue the healing

    if(currHP <= 0 && Math.random() < heal.subZeroFail) return; //If the player is currently dying, make a chance for the heal to cancel out so they're not invincible

    //Calculate the player's new HP
    var finalBody = currHP + (dbc.getJRMCSE().contains("Z") ? healPer * heal.fusionBoost : healPer);
    dbc.setBody(finalBody > maxHP ? maxHP : finalBody);
}
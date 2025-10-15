var healing = .015; //expected as a percentage of the player's health. 0.01 would be 1% of their max HP, 0.5 would be 50% of their health.
var fusionBoost = 2.0; //expected as a multiplier, 1.5 would be 50%, 2 is double healing.
var subZeroFail = 0.4; //expected as a percentage, 0.4 is a 40% chance. 0.25% would be a 25% chance.


/*
Purpose: This script applies a heal to the player when they enter SSG and maintains it only in SSG.
Author: Ranger_Halt.
*/

function dbcFormChange(event) {

    var formInto = event.getFormAfterID();
    var formFrom = event.getFormBeforeID();
    var player = event.player;

    if (formInto == null || formFrom == null) return; //cursory null check in case

    if (player.getName() != "Ranger_Halt") return; //testing line

    //If the player enters SSG, start the healing timer.
    //The player should not need the timer started if it's already ongoing, it will self maintain.
    if (formInto == 9 && !player.getTimers().has(67)) {
        player.getTimers().start(67, 10, false);
    }

    //If the player leaves SSG, stop the healing timer
    if (formFrom == 9) {
        player.getTimers().stop(67);
    }
}

var willHeal = true; //will determine if it heals, something will set this to false

function timer(event) {

    var id = event.getId();
    if (event.id == 67) {//healing function

        //player details
        var player = event.player;
        if (player == null) return;
        var dbc = player.getDBCPlayer();
        if (dbc == null) return;

        //player stats, relating to HP
        var maxHP = dbc.getMaxHP();
        var currHP = dbc.getBody();
        var healPer = maxHP * healing;

        //If the player is currently dying, make a chance for the heal to cancel out so they're not invincible
        if (currHP <= 0) {
            var rand = Math.random() * 99 + 1; //1-100;
            if (rand <= 100 * subZeroFail) willHeal = false;
        }

        //If the player is in fusion, boost the healing to account for it.
        if (dbc.getJRMCSE().contains("Z")) {
            healPer *= fusionBoost;
            maxHP = maxHP * 2
        }

        //Calculate the player's new HP
        var finalBody = currHP + healPer;

        //prevent the DBC health from going over the max
        if (finalBody > maxHP) {
            finalBody = maxHP;
        }

        //Update the player's HP if nothing turned off the heal
        if (willHeal) dbc.setBody(finalBody);
        //player.sendMessage("healing " + currHP + " before " + finalBody + " after"); //testing print

        //Readd the timer if the player is still in SSG, additional check in case the player managed to leave ssg without trigger above.
        //If the player is not in SSG it should just turn off the healing. In the worst case, a player gets 1 heal tick outside of SSG.
        if (dbc.getForm() == 9) {
            player.getTimers().forceStart(67, 10, false); //forcefully restart the timer to continue the healing
        }
    }
}
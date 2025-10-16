// beerus_planet_lap_mastery.js - This code handles custom forms for the quest running around the planet. 
// For clarity sake and convience, it will also handle non-custom forms and absorb those.
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Ranger, Noxie

var reward = 15; // the amount of mastery to be rewarded
var gsBlueForms = [DBCAPI.getForm("SAI-Rose (GS)"), DBCAPI.getForm("SAI-SSB (GS)")]
var gsGodForm = DBCAPI.getForm("SAI-SSG (GS)");

function questTurnIn(event){
    if(event.getQuest().getId() != 1038) return;
    var player = event.player;
    var dbc = player ? player.getDBCPlayer() : null;
    if(!lib.isPlayer(player) || !dbc) return;

    //This will add the mastery to the player regardless of what form they're in. Including Kaioken. Permanently future proofed.
    if(dbc.isInCustomForm()){
        if(gsBlueForms.indexOf(dbc.getCurrentForm()) >= 0) dbc.addCustomMastery(gsGodForm, reward);
        else dbc.addCustomMastery(dbc.getCurrentForm(), reward);
        if(dbc.getJRMCSE().contains("K"))
            API.executeCommand(player.getWorld(), "jrmcformmastery " + player.getName() + " add current " + reward);
    }
    else{
        API.executeCommand(player.getWorld(), "jrmcformmastery " + player.getName() + " add current " + reward);
    }
}
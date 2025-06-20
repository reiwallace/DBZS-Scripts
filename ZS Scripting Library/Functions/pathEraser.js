/** Checks if player has valid quest ID then nukes all path forms
 * @param {IPlayer} player 
 */
function pathEraser(player) 
{
    var validQuestIds = [7, 8, 9];

    if(!lib.isPlayer(player)) return;
    // Check if any valid quest ids are present, return if not
    for(var i = 0; i < validQuestIds.length + 1; i++) {
        if(i == validQuestIds.length) return;
        if(player.hasActiveQuest(validQuestIds[i])) {
            player.finishQuest(validQuestIds[i]);
            player.stopQuest(validQuestIds[i]);
            break;
        }
    }
    // Cycles through player forms on each path and removes any found
    var dbcPlayer = player.getDBCPlayer();
    var playerForms = dbcPlayer.getCustomForms();
    // Check each player form for path compatability
    for(var i in playerForms) {
        if(!playerForms[i]) continue;
        var form = playerForms[i].getName();
        for(var p in paths) {
            if(paths[p].indexOf(form) < 0) continue;
            dbcPlayer.removeCustomForm(form);
        }
    }
}
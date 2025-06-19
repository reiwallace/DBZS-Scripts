var paths = {
    path1: [],
    path2: [],
    path3: [],
};

function isPathLocked(player, pathName)
{
    if(!player) return;
    var playerForms = player.getDBCPlayer().getCustomForms();
    // Check each player form for path compatability
    for(var i in playerForms) {
        if(!playerForms[i]) continue;
        var form = playerForms[i].getName();
        if(pathName == "SSJ1PATH" && paths.SSJFORMS.indexOf(form) < 0) {
            displayFormWarning(player, form);
            return true;
        }
        for(var p in paths) {
            if(p == pathName || p == "SSJFORMS") continue;
            if(paths[p].indexOf(form) >= 0) {
                displayFormWarning(player, form);
                return true;
            }
        }
    }
    return false;
}

function displayFormWarning(player, form, path) 
{
    var GUI = API.createCustomGui(134, 255, 200, false);
    GUI.setBackgroundTexture("jinryuumodscore:gui/training1gui.png");
    var shadow = GUI.addLabel(1, "Cannot access path " + path + " due to conflict with form " + form, 26, 31, 105, 100);
    shadow.setColor(0);
    shadow.setScale(1.4);
    var label = GUI.addLabel(2, "Cannot access path " + path + " due to conflict with form " + form, 25, 30, 105, 100);
    label.setColor(16711680);
    label.setScale(1.4);
    GUI.addButton(3, "Ok", 77, 110, 100, 20);
    player.showCustomGui(GUI);
}

function customGuiButton(event) {
    if(event.getGui().getID() == 134) event.player.closeGui();
}

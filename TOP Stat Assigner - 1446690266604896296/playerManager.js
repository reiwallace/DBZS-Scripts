function login(event) {
    event.player.timers.forceStart(146, 100, true);
}

function init(event) {
    event.player.timers.forceStart(146, 100, true);
}

function timer(event) {
    var player = event.player
    if(event.id != 146 || player.getDimension() != 1) return;
    if(player.y < 80) lib.kill(player);
    if(player.getDBCPlayer().getSkillLevel("InstantTransmission")) 
        API.executeCommand(API.getIWorld(0), "/dbcskill take InstantTransmission " + player.getName());
}
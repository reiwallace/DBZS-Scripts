var coords = [[7057, 57, 719], [6947, 90, 628], [6991, 209, 577], [7112, 89, 515], [7267, 85, 692]];
var moveTime;

function init(event) {
    var npc = event.npc;
    var dbc = new lib.dbcDisplayHandler(npc, true);
    dbc.setAura(216, true);
    dbc.npcDisplay.setHairType("");
    npc.timers.forceStart(0, 0, true);
    var serverTime = API.getServerTime();
    if(!API.getIWorld(0).hasTempData("rift2Despawn") || API.getIWorld(0).getTempData("rift2Despawn") < serverTime) {
        var rand = coords[lib.getRandom(0, coords.length - 1, true)];
        npc.setPosition(rand[0], rand[1], rand[2]);
    }
}

function tick(event) {
    var npc = event.npc;
    var serverTime = API.getServerTime();
    if(!npc.timers.has(5)) API.getIWorld(0).removeTempData("rift2Player");
    if(!API.getIWorld(0).hasTempData("rift2Despawn") || API.getIWorld(0).getTempData("rift2Despawn") < serverTime) {
        API.getIWorld(0).setTempData("rift2Despawn", serverTime + 36000);
        var rand = coords[lib.getRandom(0, coords.length - 1, true)];
        npc.setPosition(rand[0], rand[1], rand[2]);
    }
}

function timer(event) {
    var npc = event.npc;
    switch(event.id) {
        case 0:
            var x = npc.x - 0.5;
            var y = npc.y + 0.5;
            var z = npc.z - 0.5;
            for(var i = 0; i < 5; i++) {
                API.getIWorld(0).spawnParticle("portal", x+Math.random() * 2 - 0.5, y+ Math.random() + 0.5, z+Math.random() * 2 - 0.5, 0, 0.1, 0, 0, 1);
            }   
            API.getIWorld(0).spawnParticle("spell", x+Math.random(), y+ Math.random(), z+Math.random(), 0, 0.1, 0, 0, 1); 
        break;
    }
}

function collide(event) {
    var npc = event.npc;
    var player = event.getEntity();
    var serverTime = API.getServerTime();
    npc.timers.forceStart(5, 40, false);
    if(!lib.isPlayer(player) || npc.timers.has(12)) return;
    event.npc.timers.forceStart(12, 60, false);
    if(!findHaruna(player)) {
        player.sendMessage("It would be dangerous to enter without Haruna.");
        return;
    }
    if(API.getIWorld(0).hasTempData("riftCooldown") && API.getIWorld(0).getTempData("riftCooldown") > serverTime) {
        player.sendMessage("The rift is still recharging.");
        return;
    }
    player.sendMessage("This strange rift leaves you feeling incredibly sleepy..");
    player.addPotionEffect(9, 10, 100, true);
    API.getIWorld(0).setTempData("rift2Player", player.getName());
}

function findHaruna(player) {
    var playerInv = player.getInventory();
    if(!playerInv) return;
    for(var item in playerInv) {
        var item = playerInv[item];
        if(item && item.getTag("isDeathScythe") == 1 && item.getTag("3258") == 1) return item;
    }
}


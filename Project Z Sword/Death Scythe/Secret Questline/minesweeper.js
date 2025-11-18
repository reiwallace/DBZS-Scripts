var tiles = [];

var CHECK_TILES = 1;
var EXPLODE = 2;
var CONTINUE = 3;

function init(event) { // Find all tiles
    var npc = event.npc;
    tiles = [];
    npc.setTempData("gameInactive", true);
    npc.setTempData("bombCount", 0);
    npc.setTempData("hiddenTiles", 81);
    var tileScan = npc.getSurroundingEntities(20, 2);
    for(i = 0; i < tileScan.length - 1; i++) {
        if(!tileScan || tileScan[i].getName() != "tile") continue;
        tiles.push(tileScan[i]);
        tileScan[i].setTempData("isMine", false);
        tileScan[i].reset();
    }
    createMines(npc, tiles);
    npc.setTempData("gameInactive", false);
    npc.timers.forceStart(CHECK_TILES, 20, false);
}

function createMines(npc, tiles) {
    for(var i = 1; i < 10; i++) {
        var mineIndex = lib.getRandom(0, tiles.length - 1, true);
        var mine = tiles[mineIndex];
        while(mine.getTempData("isMine")) {
            var mineIndex = lib.getRandom(0, tiles.length - 1, true);
            mine = tiles[mineIndex];
        }
        mine.setTempData("isMine", true);
        npc.setTempData("bombCount", npc.getTempData("bombCount") + 1);
        npc.setTempData("hiddenTiles", npc.getTempData("hiddenTiles") - 1);
    }
}

function timer(event) {
    var npc = event.npc;
    var world = npc.world;
    
    switch(event.id) {
        case CHECK_TILES:
            if(npc.getTempData("gameInactive")) return;
            if(npc.getTempData("hiddenTiles") > 0) {
                npc.timers.forceStart(CHECK_TILES, 20, false);
                return;
            }
            npc.timers.forceStart(CONTINUE, 40, false);
            var firstPlayer = world.getClosestPlayer(npc.getPosition(), 22);
            var secondPlayer = world.getClosestPlayer(8438, 88, -3126, 22);
            if(lib.isPlayer(firstPlayer) && lib.isPlayer(secondPlayer) && firstPlayer != secondPlayer) {
                firstPlayer.sendMessage("Win.");
                secondPlayer.sendMessage("Win.");
            }
            npc.setTempData("gameInactive", true);
        break;

        case EXPLODE:
            if(npc.getTempData("gameInactive")) return;
            var firstPlayer = world.getClosestPlayer(npc.getPosition(), 22);
            var secondPlayer = world.getClosestPlayer(8438, 88, -3126, 22);
            if(lib.isPlayer(firstPlayer) && lib.isPlayer(secondPlayer) && firstPlayer != secondPlayer) {
                firstPlayer.sendMessage("Boom.");
                secondPlayer.sendMessage("Boom.");
                npc.executeCommand("spawn " + firstPlayer.getName());
                npc.executeCommand("spawn " + secondPlayer.getName());
                npc.executeCommand("jrmcse set KO 10 " + firstPlayer.getName());
                npc.executeCommand("jrmcse set KO 10 " + secondPlayer.getName());
                world.explode(firstPlayer.getPosition(), 1, false, false);
                world.explode(secondPlayer.getPosition(), 1, false, false);
            }
            npc.setTempData("gameInactive", true);
            npc.reset();
        break;

        case CONTINUE:
            var firstPlayer = world.getClosestPlayer(npc.getPosition(), 22);
            var secondPlayer = world.getClosestPlayer(8438, 88, -3126, 22);
            if(lib.isPlayer(firstPlayer) && lib.isPlayer(secondPlayer) && firstPlayer != secondPlayer) {
                var random = lib.getRandom(1, 2, true);
                if(random == 1) {
                    firstPlayer.setPosition(8439.5, 103, -3130)
                    secondPlayer.setPosition(8449, 100, -3230);
                } else {
                    secondPlayer.setPosition(8439.5, 103, -3130)
                    firstPlayer.setPosition(8449, 100, -3230);
                }
            }
            npc.reset();
        break;
    }
}




var tileSkins = [
    "https://zsstorage.xyz/AprilFools2025/minesweeperREVEALED.png",
    "https://zsstorage.xyz/AprilFools2025/minesweeper1.png",
    "https://zsstorage.xyz/AprilFools2025/minesweeper2.png",
    "https://zsstorage.xyz/AprilFools2025/minesweeper3.png",
    "https://zsstorage.xyz/AprilFools2025/minesweeper4.png",
    "https://zsstorage.xyz/AprilFools2025/minesweeper5.png",
    "https://zsstorage.xyz/AprilFools2025/minesweeper6.png",
    "https://zsstorage.xyz/AprilFools2025/minesweeper7.png",
    "https://zsstorage.xyz/AprilFools2025/minesweeper8.png",
    "https://zsstorage.xyz/AprilFools2025/minesweeperFLAG.png",
    "https://zsstorage.xyz/AprilFools2025/minesweeperBLANK.png",
    "https://zsstorage.xyz/AprilFools2025/minesweeperMINE.png"
];

var master;
var linkedTile;
var flagged = false;

var REVEAL = 1;
var RESET = 2;

function init(event) { 
    var npc = event.npc;
    if(npc.world.getBlock(npc.getPosition().down()) && npc.world.getBlock(npc.getPosition().down()).getName() == "armourersWorkshop:block.colourableGlowing") npc.setPosition(npc.getPosition().down());
    npc.setRotation(0);
    npc.setDialog(0, 12879);
    npc.setTempData("revealed", false);
    npc.setSkinUrl(tileSkins[10]);
    flagged = false;

    // Set up linked tile
    var linkedTile = findLinkedTile(npc);
    if(!linkedTile) {
        npc.timers.forceStart(RESET, 20, false);
        return;
    }
    linkedTile.setSkinUrl(tileSkins[10]);
    linkedTile.setRotation(0);
}

function reveal(npc) {
    var master = findMaster(npc);
    var linkedTile = findLinkedTile(npc);
    if(!linkedTile || !master) {
        npc.timers.forceStart(RESET, 20, false);
        return;
    }
    if(npc.getTempData("isMine")) {
        master.timers.forceStart(2, 0, false);
        npc.setTempData("revealed", true);
        linkedTile.setSkinUrl(tileSkins[11]);
        return;
    } 
    master.setTempData("hiddenTiles", master.getTempData("hiddenTiles") - 1)
    master.timers.forceStart(1, 0, false);

    npc.setTempData("revealed", true);
    linkedTile.setSkinUrl(tileSkins[10]);
    var nearbyTiles = npc.getSurroundingEntities(1, 2);
    var nearbyMines = 0;
    for(var tile in nearbyTiles) {
        tile = nearbyTiles[tile];
        if(tile && tile.getName() == "tile" && tile.getTempData("isMine")) nearbyMines++;
    }
    linkedTile.setSkinUrl(tileSkins[nearbyMines]);
    if(nearbyMines > 0) return;
        
    for(var tile in nearbyTiles) {
        tile = nearbyTiles[tile];
        if(tile && tile.getName() == "tile" && !tile.getTempData("revealed")) tile.timers.forceStart(REVEAL, 0, false);
    }
}

function dialog(event) {
    var master = findMaster(event.npc);
    if(event.npc.getTempData("revealed") || master.getTempData("gameInactive")) event.setCancelled(true);
}

function dialogClose(event) { // Dialog options
    var npc = event.npc;
    if(event.getOptionId() == 1 && !flagged) {
        reveal(npc);
    } else if(event.getOptionId() == 2 && !flagged) {
        linkedTile.setSkinUrl(tileSkins[9]);
        npc.setDialog(0, 12880);
        flagged = true;
    } else if(event.getOptionId() == 1 && flagged) {
        linkedTile.setSkinUrl(tileSkins[10]);
        npc.setDialog(0, 12879);
        flagged = false;
    }
}

function timer(event) {
    var npc = event.npc;
    if(event.id == REVEAL) {
        reveal(npc);
    } else if(event.id == RESET) {
        npc.reset();
    }
}

function findMaster(npc) {
    var search = npc.getSurroundingEntities(20, 2); 
    for(i = 0; i < search.length; i++) {
        if(!search[i] || search[i].getName() != "Game Master") continue;
        return search[i];
    }
}

function findLinkedTile(npc) {
    var linkedTile;
    var linkedTileSearch = npc.world.getEntitiesNear(npc.x + -8, npc.y + 3, npc.z + 101, 1);
    for(var tile in linkedTileSearch) {
        tile = linkedTileSearch[tile];
        if(tile && tile.getType() == 2 && tile.getName() == "tile") linkedTile = tile;
    }
    if(!linkedTile) {
        var linkedTileSearch = npc.world.getEntitiesNear(npc.x + -8, npc.y + 2, npc.z + 101, 1);
        for(var tile in linkedTileSearch) {
            tile = linkedTileSearch[tile];
            if(tile && tile.getType() == 2 && tile.getName() == "tile") linkedTile = tile;
        }
    }
    if(!linkedTile) {
        var linkedTileSearch = npc.world.getEntitiesNear(npc.x + -8, npc.y + 4, npc.z + 101, 1);
        for(var tile in linkedTileSearch) {
            tile = linkedTileSearch[tile];
            if(tile && tile.getType() == 2 && tile.getName() == "tile") linkedTile = tile;
        }
    }
    return linkedTile;
}
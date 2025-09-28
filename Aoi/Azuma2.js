var slashPart = API.createParticle("customnpcs:textures/items/npcWaterElement.png");
slashPart.setSize(16, 16);
slashPart.setAnim(2, true, 1, 200);
slashPart.setScale(3, 3, 0, 0);


var age = 20

// function azuma(npc)
// {
//     var maxZ = 3.5;
//     var npcX = npc.getX();
//     var npcY = npc.getY();
//     var npcZ = npc.getZ();
//     for(var z = 0; z <= maxZ; z += 0.1) {
//         var x = -(Math.pow((z - 1.5), 2)) / 3 + 2
//         var fz = z/2-1.3
//         var y = Math.pow(fz, 3) + Math.pow(fz, 2) + fz*1.8;
//         var density = x;
//         for(var i = 0; i < density; i++) {
//             npc.world.spawnParticle("flame", npcX + x + i/10, npcY + y + 3, npcZ + (z/1.3 - maxZ/2.6), 0, 0, 0, 0, 1);
//         }
//     }
// }

var z;
var maxZ = 3.5;

function interact(event) {
    var npc = event.npc;
    npc.timers.forceStart(0, 0, true);
    z = maxZ;
    ticks = 0
}

function timer(event) {
    var npc = event.npc;
    for(var i = 0; i < 10; i++) {
        z -= 0.1;
        if(z < 0) {
            npc.timers.clear();
            return;
        }
        
        azuma(npc, z);
    }
    ticks += 1
}

function azuma(npc, z)
{
    var npcX = npc.getX();
    var npcY = npc.getY();
    var npcZ = npc.getZ();
    var x = -(Math.pow((z - 1.7), 2)) / 3 + 2
    var fz = z/2.5-1.2
    var y = Math.pow(fz, 3) + Math.pow(fz, 2) + fz*1.8;
    var density = Math.pow(x,2)*2;
    for(var i = 0; i < density; i++) {
        slashPart.setMaxAge(age +10 - ticks);
        slashPart.setAlpha(1, 0, 2, age - ticks);
        slashPart.setPosition(npcX + x + i/20 + lib.getRandom(-0.0, 0.0), npcY + y + 2 + lib.getRandom(-0.0, 0.0), npcZ + (z/1.3 - maxZ/2.6)) + lib.getRandom(-0.0, 0.0);
        slashPart.spawn(npc.world);
    }
}
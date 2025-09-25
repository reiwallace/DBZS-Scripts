var azumaTexture = "https://i.imgur.com/PxBxo39.png";

var slashPart = API.createParticle(azumaTexture);
slashPart.setSize(16, 16);
slashPart.setMaxAge(40);

var particlePositions = [
    [0.5, 2, 0],
    [1, 1, 0]
    [0.5, 0, 0]
]

function azuma(npc, target, delay)
{
    var npcX = npc.getX();
    var npcY = npc.getY();
    var npcZ = npc.getZ();
    for(var y = 0; y <= 2; y += 0.1) {
        var x = ((y - 2) ** 2) / 3 + 1
        npc.spawnParticle("FLAME", npcX + x, npcY + y, npcZ, 0, 0, 0, 0, 1);
    }
}
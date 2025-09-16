var azumaTexture = "https://i.imgur.com/PxBxo39.png";

var slashPart = API.createParticle(azumaTexture);
slashPart.setSize(16, 16);
slashPart.setMaxAge(40);

function Azuma(npc, target, delay)
{
    slashPart.spawn(npc.world);
}
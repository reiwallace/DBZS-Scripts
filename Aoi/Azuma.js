var azuma = {
    particle: API.createParticle("https://i.ibb.co/sJb5y22R/image.png"),
    particleAge: 20,
    MAX_Z: 3.5
};
azuma.particle.setSize(16, 16);
azuma.particle.setAnim(2, true, 1, 200);
azuma.particle.setScale(3, 3, 0, 0);

var z;
var ticks;

function interact(event) {
    var npc = event.npc;
    npc.timers.forceStart(0, 0, true);
    z = maxZ;
    ticks = 0;
}

function timer(event) {
    var npc = event.npc;
    var timers = npc.timers;
    switch(event.id) {
        case AZUMA_SLASH:
            for(var i = 0; i < 10; i++) {
                z -= 0.1;
                if(z < azuma.MAX_Z) {
                    timers.stop(AZUMA_SLASH);
                    return;
                }
                var 
                azuma(npc, z);
            }
            ticks += 1;
            break;
    }

}

function azuma(npc, z, doDamage, progressTicks)
{
    var x = -(Math.pow((z - 1.7), 2)) / 3 + 1.5
    var y = z - 0.5;
    slashPart.setMaxAge(age + 10 - ticks);
    slashPart.setAlpha(1, 0, 2, age - progressTicks);
    slashPart.setPosition(npc.x + x, npc.y + y, npc.z + z - 2);
    slashPart.spawn(npc.world);

    if(!doDamage) return;
    var toDamage = npc.world.getEntitiesNear()

}
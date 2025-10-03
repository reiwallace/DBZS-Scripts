function telegraphParticle(npc, particlePath, duration, timerNo, finishTimer) {
    function createParticle(npc, x, y, z) { // Particle creation
        var particle = API.createParticle(particlePath);
        particle.setSize(16, 16);
        particle.setMaxAge(20);
        particle.setAlpha(0, 1, 0.15, 0);
        particle.setPosition(x, y, z);
        particle.setScale(1, 1, 0, 1);
        particle.spawn(npc.getWorld());
    }

    var dx = -Math.sin(angle*Math.PI/180) * 0.5; // Rotational positioning math
    var dz = Math.cos(angle*Math.PI/180) * 0.5;
    createParticle(npc, npc.x+dx, npc.y + heightIncrement, npc.z+dz);
    createParticle(npc, npc.x+-dx, npc.y + heightIncrement, npc.z+-dz);
    heightIncrement += 2/duration; // Increase height and angle for next particle
    angle += 360/duration;

    if(!npc.timers.has(finishTimer)) { // Stop rotation if telegraph done
        npc.timers.stop(timerNo);
    }
}

function telegraphParticle(npc, particlePath, duration, timerNo, finishTimer) {
    function createParticle(npc, x, y, z) { // Particle creation
        var particle = API.createParticle(particlePath);
        particle.setSize(16, 16);
        particle.setMaxAge(40);
        particle.setAlpha(1, 0, 0.2, 15);
        particle.setPosition(x, y, z);
        particle.setScale(4, 4, 0, 4);
        particle.spawn(npc.getWorld());
    }

    var dx = -Math.sin(angle*Math.PI/180) * 5; // Rotational positioning math
    var dz = Math.cos(angle*Math.PI/180) * 5;
    createParticle(npc, npc.x+dx, npc.y + 0.5, npc.z+dz);
    createParticle(npc, npc.x+-dx, npc.y + 0.5, npc.z+-dz);
    angle += 360/duration;

    if(!npc.timers.has(finishTimer)) { // Stop rotation if telegraph done
        npc.timers.stop(timerNo);
    }

}
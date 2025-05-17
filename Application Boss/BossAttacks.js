var angle = 0;
var r = 0;
var count = 0;
var target;
var toHit = new Array();
var projectileCount = 5;
var partDam = 5000;
var vomitDam = 1000;
var active = false;
var hitsDone = 0;

function damaged(event) {
    target = event.getSource();
} 

function meleeSwing(event) {
    hitsDone++;
    if(hitsDone == 10) {
        event.npc.timers.forceStart(3, 1, false);
        hitsDone = 0;
    }
}

function timer(event) { // Randomise and execute abilities
    var id = event.id;
    if(id == 3) { // Select ability
        var ability = getRandomInt(1, 3);
        switch(ability) {
        case 1:
            angle = 0;
            event.npc.timers.forceStart(4,4,true);
            event.npc.say("&4&lThe " + event.npc.getName() + " begins to &4&lspin up its beams!");
            break;
        case 2:
            event.npc.say("&6&lYou feel a great surge of power &6&lcoming from the elemental!");
            frontalCone(event, "reddust", false);
            break;
        case 3:
            event.npc.say("&c&l" + event.npc.getName() + " begins to channel &c&lancient energy!");
            event.npc.timers.forceStart(6,40,false);
        }
        
    } else if(id == 4) { // Spinning fire beams
        beams(event);
    } else if(id == 5) { // Frontal cone w damage
        frontalCone(event, "flame", true);
    } else if(id == 6) { // Timer before projectile vomit
        event.npc.timers.forceStart(7,1,true);
    } else if(id == 7) { // Projectile vomit
        projectileVomit(event);
    }
    
}

function getRandomInt(min, max) {  // Get a random number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function beams(event) {
    var x = event.npc.x;
    var z = event.npc.z;
    var dx = -Math.sin(angle*Math.PI/180);
    var dz = Math.cos(angle*Math.PI/180);
    toHit.length = 0;
    for(i = 4; i < 20; i++) { // Spawn beams and gets targets
        // Ground beams
        event.npc.world.spawnParticle("flame", x+(dx*i/2), 63.5, z+(dz*i/2), 0, 0, 0, 0, 0); 
        toHit.push(event.npc.world.getClosestPlayer(x+(dx*i/2), 63.5, z+(dz*i/2), 1));
        // Above beams
        event.npc.world.spawnParticle("flame", x+(-dx*i/2), 66, z+(-dz*i/2), 0, 0, 0, 0, 0);
        toHit.push(event.npc.world.getClosestPlayer(x+(-dx*i/2), 66, z+(-dz*i/2), 1));
    }
    for(i = 0; i < toHit.length; i++){ // Damage players
        if(toHit[i] != null) { toHit[i].hurt(1000); }
    } 
    angle += 8;
    if(angle > 360) { // Stop beams after one loop
        event.npc.timers.stop(4);
    }
}
    
function frontalCone(event, particle, damage) { // Function to run the frontal cone attack.
    if(!damage) { r = event.npc.getRotation(); }
    var x = event.npc.x;
    var z = event.npc.z;
    
    for(i = -30; i < 30; i += 10) { // For loop to calcuate cone shape
        var dx = -Math.sin(r+i*Math.PI/180);
        var dz = Math.cos(r+i*Math.PI/180);
        for(n = 4; n < 20; n++) { // For loop to create particle cone
            event.npc.world.spawnParticle(particle, x+(dx*n/2), 63.5, z+(dz*n/2), 0, 0, 0, 0, 0); 
            if(damage) {
                hit = event.npc.world.getClosestPlayer(x+(dx*n/2), 63.5, z+(dz*n/2), 1);
                if (hit != null) { hit.hurt(1000); }
            }
        }
    }
    if(!damage) { event.npc.timers.forceStart(5,40,false); }
}

function projectileVomit(event) {
    var projectile = API.createItem("minecraft:fire_charge", 0, 1);
    if(target != null) {
        event.npc.shootItem(target, projectile, 100);
    }
    count++;
    if(count > 30) {
        count = 0;
        event.npc.timers.stop(7);
    }
}



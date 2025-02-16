// Change these
var poseNames = ["pose1", "pose2", "pose3", "pose4", "pose5"]; // Pose names - can add as many as needed
var silhouetteName = "Silhouette"; // Name of silhouette npcs
var numberOfWins = 5; // Number of wins needed
var roundLength = 200; // Round length in ticks (please use a number that plays nice with seconds)
var roundBreak = 20; // Time between rounds
var passText = "&a&lI am glad that this time you did not come &a&lunprepared."; // Text on player passing a round
var failText = "&c&lWhat a fool you are."; // Text on player failing a round
var winText = "&l&6This is the end. The bitter, bitter end."; // Text on player winning the game
var questID = 0; // Id of quest to be completed
var failDamage = 1; // Damage for failing round

var wins = 0;
var currentRound = 0;
var timerNpc;
var countDown;
var silhouettes = new Array();
var fireworkIncrement = 0;

function init(e) {
    var npc = e.npc;
    var search = npc.getSurroundingEntities(20,2); // Find nearby npcs
    silhouettes = new Array();
    for(i = 0; i < search.length; i++) { // yes this game sucks (cant splice entity arrays for some reason)
        if(search[i].getName() == silhouetteName) {
            silhouettes.push(search[i]);
        } else if(search[i].getName() == "Countdown") {
            timerNpc = search[i];
        }
    }
    resetAll(npc);
}

function timer(e) {
    var npc = e.npc;
    var id = e.id;
    if(id == 0) { // Start round
        currentRound++;
        npc.say("&lRound " + currentRound);
        decidePoses(npc);
        npc.timers.forceStart(1, roundLength - 1, false); // Start fail timer
        timerNpc.setHealth(timerNpc.getMaxHealth());
        countDown = roundLength*0.015;
        npc.timers.forceStart(2, 19, true); // Start round countdown
    } else if(id == 1) { // Fail round
        endRound(npc, true, failText);
        punishPlayer(npc);
    } else if(id == 2) { // Round timer
        var timerTick = timerNpc.getMaxHealth() / (roundLength / 20); // Calculate a tick of the timer's health
        var currentTimer = timerNpc.getHealth();
        timerNpc.setShowBossBar(1);
        timerNpc.setHealth(currentTimer - timerTick); // Lower timer's health by 1 tick
        if(npc.timers.has(1) && npc.timers.ticks(1) < roundLength*0.3) {
            npc.say("" + countDown); // Chat countdown
            countDown--;
        }
    } else if(id == 3) { // Pass round
        wins++; // Increment wins
        if(wins == 5) { // If player has enough wins
            endRound(npc, false, winText);
            endGame(npc);
        } else { // If win condition not met
            endRound(npc, true, passText);
        }
    } else if(id == 4) { // Selected Wrong npc
        endRound(npc, true, failText);
        punishPlayer(npc);
    } else if(id == 5) { // Fireworks!!
        spawnFirework(npc, npc.x + getRandomInt(-5, 5), npc.y + getRandomInt(0, 7), npc.z + getRandomInt(-5, 5));
        fireworkIncrement++;
        if(fireworkIncrement > 10) {
            npc.timers.stop(5);
        }
    } else if(id == 10) { // Reset if player leaves the area
        var playerCheck = npc.getSurroundingEntities(50, 1);
        if(playerCheck.length == 0) {
            resetAll(npc);
        }
    }
}

function decidePoses(npc) { // Decide the correct pose and hand out incorrect poses
    var poses = getPoses();
    var correctPose = poses[getRandomInt(0, poses.length - 1)];
    var correctNpc = getRandomInt(0, silhouettes.length - 1);
    poses.splice(poses.indexOf(correctPose), 1);
    setNpcPose(npc, correctPose, true);
    for(i = 0; i < silhouettes.length; i++) { // Set silhouette poses
        if(i == correctNpc) { // Correct npc
            setNpcPose(silhouettes[i], correctPose, true); 
        } else { // Incorrect npcs
            var randomPose = getRandomInt(0, poses.length - 1);
            setNpcPose(silhouettes[i], poses[randomPose], false);
            poses.splice(randomPose, 1);
        }
    }
}

function getPoses() { // Get animations defined by name
    var poses = new Array();
    for(i = 0; i < poseNames.length; i++) { // Initialise animations
        poses.push(API.getAnimations().get(poseNames[i]));
    }
    return poses;
}

function setNpcPose(targetNpc, Pose, isRightPose) { // Set an npc's pose and whether that pose is correct
    var animData = targetNpc.getAnimationData();
    animData.setEnabled(true);
    animData.setAnimation(Pose);
    animData.updateClient();
    targetNpc.setTempData("isRightPose", isRightPose);
}

function endRound(npc, doNext, outcomeText) { // End round stopping timers and reseting poses
    npc.say(outcomeText);
    npc.timers.stop(1);
    npc.timers.stop(2);
    timerNpc.setShowBossBar(0); // Disable countdown bossbar
    resetPoses(npc);
    if(doNext) {
        npc.timers.forceStart(0, roundBreak, false); // Short break between rounds
    }
}

function punishPlayer(npc) { // Punish the player for failing a round
    var toPunish = npc.getSurroundingEntities(50, 1);
    for(i = 0; i < toPunish.length; i++) { // Punish players
        if(toPunish[i] != null) {
            npc.world.thunderStrike(toPunish[i].getPosition()); // Lightning strike the player
            toPunish[i].hurt(failDamage);
        }
    } 
}

function endGame(npc) { // End the game, complete quest and reset npcs
    var players = npc.getSurroundingEntities(50, 1);
    for(i = 0; i < players.length; i++) {
        if(players[i] != null) { // Finish player quest
            npc.executeCommand("/kamkeel quest finish " + players[i].getName() + " " + questID);
        }
    }
    fireworkIncrement = 0;
    npc.timers.forceStart(5, 8, true);
}

function newGame(npc) { // Start new game
    wins = 0;
    currentRound = 0;
    npc.timers.forceStart(0, roundBreak, false);
    npc.timers.forceStart(10, 20, true);
}

function resetPoses(npc) { // Reset npc to standing pose
    function resetNPC(targetNpc) { // Reset specific npc
        var animData = targetNpc.getAnimationData();
        animData.setEnabled(false);
        animData.updateClient();
        targetNpc.removeTempData("isRightPose");
    }
    for(i = 0; i < silhouettes.length; i++) {
        resetNPC(silhouettes[i]);
    }
    resetNPC(npc);
}

function resetAll(npc) { // Reset game
    npc.timers.clear(); // remove all timers
    timerNpc.setShowBossBar(0);
    resetPoses(npc);
}

function spawnFirework(npc, x, y, z) { // Spawn firework particles at coordinates
    var sounds = ["minecraft:fireworks.largeBlast", "minecraft:fireworks.largeBlast_far", "minecraft:fireworks.blast_far", "minecraft:fireworks.blast"];
    npc.world.spawnParticle("fireworksSpark", x, y, z, 0, 0, 0, 0.5, 40);
    npc.world.spawnParticle("spell", x, y, z, 0, 0, 0, 1, 40);
    npc.playSound(sounds[getRandomInt(0, sounds.length - 1)], 100, 1); // Play firework sound from list
}

function getRandomInt(min, max) {  // Get a random number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Change these
var poseNames = ["pose1", "pose2", "pose3", "pose4", "pose5"]; // Pose names - can add as many as needed
var silhouetteName = "Silhouette"; // Name of silhouette npcs
var numberOfWins = 5; // Number of wins needed
var roundLength = 200; // Round length in ticks (please use a number that plays nice with seconds)
var roundBreak = 40; // Time between rounds
var passText = "I am glad that this time you did not come unprepared."; // Text on player passing a round
var failText = "What a fool you are."; // Text on player failing a round
var winText = "This is the end. The bitter, bitter end."; // Text on player winning the game
var questID = 0; // Id of quest to be completed
var failDamage = 1; // Damage for failing round

var wins = 0;
var currentRound = 0;
var timerNpc;
var countDown;
var silhouettes = new Array();

function init(e) {
    var npc = e.npc;
    var thisGameSucks = npc.getSurroundingEntities(20,2); // Find nearby npcs
    for(i = 0; i < thisGameSucks.length; i++) { // yes this game sucks (cant splice entity arrays for some reason)
        if(thisGameSucks[i].getName() == silhouetteName) {
            silhouettes.push(thisGameSucks[i]);
        } else if(thisGameSucks[i].getName() == "Countdown") {
            timerNpc = thisGameSucks[i];
        }
    }
    reset(npc);
}

function timer(e) {
    var npc = e.npc;
    var id = e.id;
    if(id == 0) { // Start round
        currentRound++;
        npc.say("Round " + currentRound);
        decidePoses(npc);
        npc.timers.forceStart(1, roundLength - 1, false); // Start fail timer
        timerNpc.setHealth(timerNpc.getMaxHealth());
        timerNpc.setShowBossBar(1);
        countDown = roundLength/40;
        npc.timers.forceStart(2, 19, true); // Start round countdown
    } else if(id == 1) { // Fail round
        failRound(npc);
    } else if(id == 2) { // Round timer
        var timerTick = timerNpc.getMaxHealth() / (roundLength / 20); // Calculate a tick of the timer's health
        var currentTimer = timerNpc.getHealth();
        timerNpc.setHealth(currentTimer - timerTick); // Lower timer's health by 1 tick
        if(npc.timers.has(1) && npc.timers.ticks(1) < roundLength/2) {
            npc.say("&l" + countDown); // Chat countdown
            countDown--;
        }
    } else if(id == 3) { // Pass round
        npc.timers.stop(1);
        npc.timers.stop(2);
        timerNpc.setShowBossBar(0);
        resetNPCs(npc);
        npc.say(passText);
        wins++; // Increment wins
        if(wins == 5) { // If player has enough wins
            endGame();
        } else {
            npc.timers.forceStart(0, roundBreak, false)
        }
    } else if(id == 4) { // Selected Wrong npc
        npc.timers.stop(1);
        npc.timers.stop(2);

        failRound(npc);
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
    poses = new Array();
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

function failRound(npc) { // Fail round and punish player
    npc.say(failText);
    timerNpc.setShowBossBar(0);
    var toPunish = npc.getSurroundingEntities(50, 1);
    for(i = 0; i < toPunish.length; i++) { // Punish players
        if(toPunish[i] != null) {
            //npc.world.thunderStrike(toPunish[i].getPosition());
            toPunish[i].hurt(failDamage);
        }
    } 
    resetNPCs(npc);
    npc.timers.forceStart(0, roundBreak, false); // Short break between rounds
}

function endGame(npc) { // End the game, complete quest and reset npcs
    npc.say(winText);
    var players = npc.getSurroundingEntities(50, 1);
    for(i = 0; i < players.length; i++) {
        if(players[i] != null) {
            npc.executeCommand("/kamkeel quest finish " + players[i].getName() + " " + questID);
        }
    }

}

function newGame(npc) { // Start new game
    wins = 0;
    currentRound = 0;
    npc.timers.forceStart(0, roundBreak, false);
}

function resetNPCs(npc) { // Reset npc to standing pose
    function resetNPC(targetNpc) {
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

function reset(npc) { // Reset game
    npc.timers.clear(); // remove all timers
    timerNpc.setShowBossBar(0);
    resetNPCs(npc);
}

function getRandomInt(min, max) {  // Get a random number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
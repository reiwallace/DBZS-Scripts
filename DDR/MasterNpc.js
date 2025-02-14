// Change these
var poseNames = ["pose1", "pose2", "pose3", "pose4", "pose5"]; // Pose names - can add as many as needed
var silhouetteName = "Silhouette"; // Name of silhouette npcs

var silhouettes;

function init(e) {
    var npc = e.npc;
    silhouettes = npc.getSurroundingEntities(20,2); // Find nearby npcs
    for(i = 0; i < silhouettes.length; i++) { // Remove npcs that aren't silhouettes
        if(silhouettes[i].getName() != silhouetteName && silhouettes[i] != null) {
            silhouettes.splice(i, 1);
        }
    }
}

function timer(e) {
    var npc = e.npc;
    var id = e.id;
}

function decidePoses(npc) { // Decide the correct pose and hand out incorrect poses
    var poses = getPoses();
    var correctPose = poses[getRandomInt(0, poses.length - 1)];
    var correctNpc = getRandomInt(0, silhouettes - 1);
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

function resetNPC(targetNpc) { // Reset npc to standing pose
    var animData = targetNpc.getAnimationData();
    animData.setEnabled(false);
    targetNpc.removeTempData("isRightPose");
}

function getRandomInt(min, max) {  // Get a random number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
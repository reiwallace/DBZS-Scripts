

var silhouettes = new Array();
var poses = new Array();
var poseNames = ["pose1", "pose2", "pose3", "pose4", "pose5"];

function init(e) {
    var npc = e.npc;
    for(i = 0; i < poseNames.length; i++) {
        poses.push(API.getAnimations().get(poseNames[i]));
    }
    silhouettes = npc.getSurroundingEntities(20,2); // Find nearby npcs
    for(i = 0; i < silhouettes.length; i++) { // Remove npcs that aren't silhouettes
        if(silhouettes[i].getName() != "Silhouette" && silhouettes[i] != null) {
            silhouettes.splice(i, 1);
        }
    }
}

function decidePoses(npc) {
    var correctPose = getRandomInt(0, poses.length);
}

function setNpcPose(targetNpc, Pose, isRightPose) {
    var animData = targetNpc.getAnimationData();
    animData.setEnabled(true);
    animData.setAnimation(Pose);
    animData.updateClient();
    targetNpc.setTempData("isRightPose", isRightPose);
}

function getRandomInt(min, max) {  // Get a random number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
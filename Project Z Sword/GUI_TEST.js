// GUI CONFIG
var SKILL_WINDOW_ID = 301
var skillWindowBgTexture = "https://i.imgur.com/cMYMjV6.png";
var skillWindowHeight = 176;
var skillWindowWidth = 256;
var skillIconWidth = 16;
var skillIconHeight = 16;
var skillPosInitialX = 19;
var skillPosInitialY = 12.6;
var skillIconSpacingX = 30.4;
var skillIconSpacingY = 30.4;
var activeLabelPosX = 182;
var activeLabelPosY = 5;
var activeLabelColour = 1111111;
var passiveLabelPosX = 177;
var passiveLabelPosY = 96.8;
var passiveLabelColour = 11111111;
var selectedPosX = [163.2, 213.3, 163.2, 213.3];
var selectedPosY = [26.3, 26.3, 118, 118]

var skills = [
    blankSkill = {
        icon : "https://i.imgur.com/PwfyR0q.png"
    },

    lockedSkill = {
        icon : "https://i.imgur.com/PwfyR0q.png"
    },

    senzuEat = {
        icon : "https://i.imgur.com/PwfyR0q.png",
        hoverText : "Eat a senzu!"
    },

    skill2 = {
        icon : "https://i.imgur.com/PwfyR0q.png",
        hoverText : "TEST"
    }
]

function interact(event) {
    displaySkillMenu(event.player);
}

/** WIP
 * @param {IPlayer} player 
 */
function displaySkillMenu(player)
{
    var skillWindow = API.createCustomGui(SKILL_WINDOW_ID, skillWindowWidth, skillWindowHeight, false);
    var skillWindowBg = skillWindow.addTexturedRect(0, skillWindowBgTexture, 0, 0, skillWindowWidth, skillWindowHeight);

    var skillPosX = skillPosInitialX;
    var skillPosY = skillPosInitialY;
    var idIndex = 1;
    var skillIcons = [];
    for(var skill in skills) {
        var button = skillWindow.addTexturedButton(idIndex, "", skillPosX, skillPosY, skillIconWidth, skillIconHeight, skills[skill].icon);
        if(skills[skill].hoverText) button.setHoverText(skills[skill].hoverText);
        skillIcons.push(button);
        
        // Handle Icon spacing
        skillPosX += skillIconSpacingX;
        if(skillPosX >= skillPosInitialX + skillIconSpacingX * 4) {
            skillPosX = skillPosInitialX;
            skillPosY += skillIconSpacingY;
        }
        idIndex++;
    }

    var selectedSkills = []; // NYI 
    var selectedIcons = [];
    for(var i = 0; i < 4; i++) {
        if(!selectedSkills[i]) selectedSkills[i] = 0;
        var button = skillWindow.addTexturedButton(idIndex, "", selectedPosX[i], selectedPosY[i], skillIconWidth, skillIconHeight, skills[selectedSkills[i]].icon);
        selectedIcons.push(button);
        idIndex++;
    }

    // Add selection labels
    var activeLabel = skillWindow.addLabel(idIndex, "Active", activeLabelPosX, activeLabelPosY, 0, 0, activeLabelColour);
    idIndex++;
    var passiveLabel = skillWindow.addLabel(idIndex, "Passive", passiveLabelPosX, passiveLabelPosY, 0, 0, passiveLabelColour);
    idIndex++;

    player.showCustomGui(skillWindow);
}

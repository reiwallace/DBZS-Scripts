// CONFIG
// GUI CONFIG
var SKILL_WINDOW_ID = 301
var skillWindowBgTexture = "https://i.imgur.com/QXDqrp1.png";
var skillWindowHeight = 167;
var skillWindowWidth = 240;

var skillIconWidth = 24;
var skillIconHeight = 24;
var skillPosInitialX = 17;
var skillPosInitialY = 18.6;
var skillIconSpacingX = 30.4;
var skillIconSpacingY = 30.4;

var selectedPosX = [153, 200, 153, 200];
var selectedPosY = [33, 33, 112, 112];

var tabWidth = 12;
var tabHeight = 44;
var tabPosY = 10;
var tabSpacing = 7;
var tabTexture = "https://i.imgur.com/nZC2LMY.png";

var skills = {
    blankSkill : {
        skillId : 1,
        icon : "https://i.imgur.com/ZDZFUFN.png"
    },

    lockedSkill : {
        skillId : 2,
        icon : "https://i.imgur.com/ZDZFUFN.png"
    },

    senzuEat : {
        skillId : 3,
        icon : "https://i.imgur.com/ZDZFUFN.png",
        hoverText : "Eat a senzu!"
    },

    skill2 : {
        skillId : 4,
        icon : "https://i.imgur.com/ZDZFUFN.png",
        hoverText : "TEST"
    }
}

function interact(event) {
    displaySkillMenu(event.player);
}

/** WIP
 * @param {IPlayer} player 
 */
function displaySkillMenu(player)
{
    var skillWindow = API.createCustomGui(SKILL_WINDOW_ID, skillWindowWidth + tabWidth, skillWindowHeight, false);
    var skillWindowBg = skillWindow.addTexturedRect(0, skillWindowBgTexture, 0, 0, skillWindowWidth, skillWindowHeight);

    var skillPosX = skillPosInitialX;
    var skillPosY = skillPosInitialY;
    var skillIcons = [];
    // Button ids 1-skills_length
    for(var skill in skills) {
        var button = skillWindow.addTexturedButton(skills[skill].skillId, "", skillPosX, skillPosY, skillIconWidth, skillIconHeight, skills[skill].icon);
        if(skills[skill].hoverText) button.setHoverText(skills[skill].hoverText);
        skillIcons.push(button);
        
        // Handle Icon spacing
        skillPosX += skillIconSpacingX;
        if(skillPosX >= skillPosInitialX + skillIconSpacingX * 4) {
            skillPosX = skillPosInitialX;
            skillPosY += skillIconSpacingY;
        }
    }

    var idIndex = 50;
    var selectedSkills = getSelectedSkills(player);
    var selectedIcons = [];
    // Button ids 50-54
    for(var i = 0; i < 4; i++) {
        if(!selectedSkills[i]) selectedSkills[i] = "blankSkill";
        var button = skillWindow.addTexturedButton(idIndex, "", selectedPosX[i], selectedPosY[i], skillIconWidth, skillIconHeight, skills[selectedSkills[i]].icon);
        selectedIcons.push(button);
        idIndex++;
    }

    // Tabs
    var heavyTab = skillWindow.addTexturedButton(56, "", skillWindowWidth, tabPosY, tabWidth, tabHeight, tabTexture);
    var keybindTab = skillWindow.addTexturedButton(57, "", skillWindowWidth, tabPosY + tabHeight + tabSpacing, tabWidth, tabHeight, tabTexture);

    player.showCustomGui(skillWindow);
}

/** Gets weapon skills from player data
 * @param {IPlayer} player 
 * @returns all available skills for player's current progression
 */
function getSelectedSkills(player) 
{
    var selected = [];
    selected.push(player.getStoredData("zSwordActive1"));
    selected.push(player.getStoredData("zSwordActive2"));
    selected.push(player.getStoredData("zSwordPassive1"));
    selected.push(player.getStoredData("zSwordPassive2"));
    return selected;
}

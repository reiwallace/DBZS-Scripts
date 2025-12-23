/**
 * @file playerSetup.js
 * @description Sets up a DBC character on a new slot
 * @author Noxiiie
 */

var statBuilds = {
    base : [50000, 50000, 50000, 50000, 10, 35000]
}

/** Player Setup Format
 * race: 0 = Human, 1 = Saiyan, 2 = Half-Saiyan, 3 = Arcosian, 4 = Namekian, 5 = Majin
 * class: 0 = Martial Artist, 1 = Spiritualist, 2 = Warrior
 * form: COMMAND IF DBC (Leave PLAYER in place of player name), Form name if custom
 * stats: Accepts an array with 6 values
 * spawnPosition: Accepts an array with 3 values
 */
var playerSetups = 
{
    "JOHN" : {
        race: 1,
        class: 0,
        form: "jrmcracialskill set 10 PLAYER",
        formIsCustom: false,
        stats: statBuilds.base,
        spawnPosition: [-278, 56, -794]
    },
    "BOBA" : {
        race: 4,
        class: 2,
        form: "[NPC] SSB",
        formIsCustom: true,
        stats: statBuilds.base,
        spawnPosition: [-278, 56, -794]
    },
    "POPE" : {
        race: 1,
        class: 2,
        form: "dbcskill givelvl GodForm 2 PLAYER",
        formIsCustom: false,
        stats: statBuilds.base,
        spawnPosition: [-278, 56, -794]
    },
    "Noxiiie" : {
        race: 3,
        class: 2,
        form: "dbcskill givelvl UltraInstinct 10 PLAYER",
        formIsCustom: false,
        stats: statBuilds.base,
        spawnPosition: [-278, 56, -794]
    }
}

// Dimension ID
var dimID = 0;

/** SKILLS:
 * OC: Potential Unlock
 */
var skills = "OC9,EN9,MD9,KS9,DS9,DF9,FZ9,KK9,KB9,KF9,KI9,KP9,JP9";

/** EFFECTS:
 *  L: Legendary
 */
var effects = "L";

var SPCSkills = ['androidmodifications', 'bigbangattack', 'burningattack', 'calmmind', 'candybeam', 'deathbeam', 'destructodisk', 'finalexplosion', 'finalflash', 'flameofhope', 'galickgun', 'kamehameha', 'maxpower', 'mouthblast', 'noegozone', 'overflowingpower', 'powerofego', 'primalpower', 'saiyanbeyondgod', 'specialbeamcannon', 'superregeneration', 'superspiritbomb', 'ultimateevolution', 'spiritcannon', 'auramanipulation'];

var finishedSlotName = "ZS Tourney Slot";

function updatePlayers(activatingPlayer) {
    if(!lib.isPlayer(activatingPlayer)) return;
    for(var player in playerSetups) {
        var playerTData = playerSetups[player];
        var playerName = player;
        var player = API.getPlayer(player);
        if(!lib.isPlayer(player) || !playerTData) {
            activatingPlayer.sendMessage("Could not find " + playerName + ".");
            continue;
        }

        var profileData = lib.getProfileData(player);
        var currentSlot = profileData.getSlots()[profileData.getCurrentSlotId()];
        if(currentSlot.getName() == finishedSlotName) {
            activatingPlayer.sendMessage(playerName + " is already in a tournament slot.");
            continue;
        }
        if(lib.getDbcLevel(player) > 2) {
            activatingPlayer.sendMessage(playerName + " is not on a fresh slot.");
            continue;
        }

        try {
            var dbcPlayer = player.getDBCPlayer();
            dbcPlayer.setRace(playerTData.race);
            dbcPlayer.setDBCClass(playerTData.class);
            dbcPlayer.modifyAllAttributes(playerTData.stats, true);
            dbcPlayer.setSkills(skills);
            dbcPlayer.setJRMCSE(effects);
            API.executeCommand(API.getIWorld(0), "/jrmcse set Pain 0.1 " + playerName);
            API.executeCommand(API.getIWorld(0), "jrmcracialskill set 1 PLAYER".replace("PLAYER", playerName));

            if(playerTData.formIsCustom) {
                dbcPlayer.giveCustomForm(playerTData.form);
                dbcPlayer.setCustomMastery(DBCAPI.getForm(playerTData.form), 1000);
            } else {
                if(playerTData.form.indexOf("GodForm") != -1) {
                    API.executeCommand(API.getIWorld(0), "jrmcracialskill set 10 PLAYER".replace("PLAYER", playerName));
                }
                API.executeCommand(API.getIWorld(0), playerTData.form.replace("PLAYER", playerName));
                API.executeCommand(API.getIWorld(0), "/jrmcformmastery " + playerName + " set all 1000");
            }
        } catch (error) {
            activatingPlayer.sendMessage("Error editing DBC data for " + playerName);
            activatingPlayer.sendMessage(error)
            continue;
        }

        try {
            SPCApi.getPlayer(player).setUnlockedSpiritControl(true);
            for(var skill in SPCSkills) {
                skill = SPCSkills[skill];
                API.executeCommand(API.getIWorld(0), "spc unlock " + skill + " " + playerName);
            }
        } catch (error) {
            activatingPlayer.sendMessage("Error editing SPC data for " + playerName);
            //continue;
        }

        currentSlot.setName(finishedSlotName);
        player.setPosition(playerTData.spawnPosition[0], playerTData.spawnPosition[1], playerTData.spawnPosition[2], dimID);
        activatingPlayer.sendMessage("Finished Slot setup for " + playerName + ".");
    }
}

function interact(event)
{
    updatePlayers(event.player);
}
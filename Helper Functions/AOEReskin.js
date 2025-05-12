/** Reskins all npcs in a given range
 * @param {ICustomNpc} npc - Npc to scan from
 * @param {int} range - Range of scan in blocks
 * @param {String} name - Name of npc's to change - changes all npcs named this in range
 * @param {String} skinUrl - Skin URL to set npcs to e.g. https://www.minecraftskins.com/uploads/skins/2025/04/12/rick-astley-23187222.png?v825
 */
function aoeReskin(npc, range, name, skinUrl)
{
    var nearbyNpcs = npc.getSurroundingEntities(range, 2);
    for(i = 0; i < nearbyNpcs.length; i++) {
        // Check if null and name match
        var nameCheck = (
            nearbyNpcs[i] == null ||
            nearbyNpcs[i].getName() != name 
        );
        // Yeet iteration if it doesn't meet the requirements
        if(nameCheck) continue;
        // Set skin otherwise
        nearbyNpcs[i].setSkinUrl(skinUrl);
    }
}
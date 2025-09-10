/** Gets a player's current slot id
 * @param {IPlayer} playerName
 * @returns Int
 */
function getActiveSlotId(player)
{
    return API.getProfileHandler().getProfile(player).getCurrentSlotId();
}
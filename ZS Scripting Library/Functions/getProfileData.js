/** Gets player profile containing slot data
 * @param {IPlayer} player
 * @returns IProfile
 */
function getProfileData(player)
{
    return API.getProfileHandler().getProfile(player);
}
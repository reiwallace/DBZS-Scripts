// EDIT WITH NPC BASE STATS
function setDefaultStats(npc, multi) {

}

function init(event)
{
    var npc = event.npc;
}

function reset(npc)
{
    npc.timers.clear();
    setDefaultStats(npc, 1);
}
const { users } = require("../connect")

const GetLivePoolByLoc = async function(Loc)
{
  console.log(`Get-live-agents-by-id. Id: ${Loc}`)
  const lon     = parseFloat(Loc[0])
  const lat     = parseFloat(Loc[1])
  /* 1) Filter UserID, UserName & SocketID 
     2) No of Agents : <= 10 [Limit]
     3) Nearest free / near-to-free agents
     4) Live
     5) Within 5km radius
     6) User Type: Agent                */
  const agentLimit      = 10
        , maxDist       = 5000
        , geometry      = { $geometry: { type: "Point", coordinates: [lon, lat] }, $maxDistance: maxDist }
        , projections   = { _id: 1, firstname: 1, SockID: 1 }
        , query         = { location: { $near: geometry }, IsLive : true, Mode: 'Agent' }
  const agents = await users.find(query, projections)
                            .limit(agentLimit)
                            .toArray()
  if (!agents.length)
  {
    console.log(`no-agents-found. _id: ${Loc}`)
    return
  }
  console.log(`agents-found. agents: ${agents}`)
  return agents
}

module.exports =
{
    GetLivePoolByLoc: GetLivePoolByLoc
}
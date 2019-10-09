const io = require('../index')

  const example = {
    id: '4ba08ad6480cff9a1bd68afd860bce7b503c473849710d16bf8684f36347cb8ed0c599f40fd8c7eabb9e04247ce6c9accc13523b26b25ccb8e733ba4b6a3d839',
    type: 'Geth',
    name: 'validator-mel-app01-10',
    isMining: true,
    peers: 14,
    lastBlockNumber: 931304,
    lastBlockTransactions: 0,
    lastRecievedBlock: 1570508902294,
    totalDifficulty: '931305',
    timestamp: 1570508902308
  }

class Nodes {

  constructor() {
    this.nodeList = {}
    this.init()
  }

  init() {
    this.listen()
    this.pingClients()
    this.emitNodes()
  }

  emitNodes() {
    setInterval(()=>{
      io.emit('nodeList', this.nodeList)
    },1000)
  }

  pingClients() {
    const self = this
    setInterval(()=>{
      Object.keys(this.nodeList).forEach( id => {
        self.nodeList[id].upTimeRequests++
      });
      io.emit('checkAlive')
    },5000)
  }

  calculateUptime(upTimeRequests, upTimeReplies) {
    if(upTimeRequests === 0) return '100'
    const uptime = ((upTimeReplies/upTimeRequests)*100).toFixed(2)
    return uptime === '100.00' ? '100' : uptime;
  }

  listen() {
    const self = this

    io.on('connect', (socket) => {
      console.log('[+] User connected')

      socket.on('isAlive', (id) => {
        if(self.nodeList[id]) {
          self.nodeList[id].upTimeReplies++
          self.nodeList[id].lastSeen = Date.now()
        }
      })

      socket.on('nodeStats', (data) => {
        if(self.nodeList[data.id]) {
          const ping = Date.now() - data.timestamp;
          const node = self.nodeList[data.id]
          node.id                     = data.id
          node.type                   = data.type
          node.name                   = data.name
          node.isMining               = data.isMining
          node.peers                  = data.peers
          node.lastBlockNumber        = data.lastBlockNumber
          node.lastBlockTransactions  = data.lastBlockTransactions
          node.lastRecievedBlock      = data.lastRecievedBlock
          node.totalDifficulty        = data.totalDifficulty
          node.propagationTime        = data.propagationTime
          node.ping                   = ping
          node.ip                     = data.ip
          node.geo                    = data.geo
          node.upTime                 = self.calculateUptime(self.nodeList[data.id].upTimeRequests, self.nodeList[data.id].upTimeReplies)
          node.lastSeen               = Date.now()
          console.log(self.nodeList[data.id])
        } else {
          console.log('[+] Registering new node:', data.name)
          const ping = Date.now() - data.timestamp;
          self.nodeList[data.id] = {
            id: data.id,
            type: data.type,
            name: data.name,
            isMining: data.isMining,
            peers: data.peers,
            lastBlockNumber: data.lastBlockNumber,
            lastBlockTransactions: data.lastBlockTransactions,
            lastRecievedBlock: data.lastRecievedBlock,
            totalDifficulty: data.totalDifficulty,
            propagationTime: data.propagationTime,
            ping: ping,
            ip: data.ip,
            geo: data.geo,
            upTimeRequests: 0,
            upTimeReplies: 0,
            upTime: 100,
            lastSeen: Date.now(),
          }
        }
      })
    })
  }

}

module.exports = Nodes

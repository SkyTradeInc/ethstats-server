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
      console.log(socket.request.socket.remoteAddress)
      socket.on('disconnct', () => {
        console.log('disconnctytyy')
      })

      socket.on('isAlive', (id) => {
        if(self.nodeList[id]) {
          self.nodeList[id].upTimeReplies++
          self.nodeList[id].lastSeen = Date.now()
        }
      })

      socket.on('nodeStats', (data) => {
        if(self.nodeList[data.id]) {
          const ping = Date.now() - data.timestamp;
          self.nodeList[data.id].id = data.id
          self.nodeList[data.id].type = data.type
          self.nodeList[data.id].name = data.name
          self.nodeList[data.id].isMining = data.isMining
          self.nodeList[data.id].peers = data.peers
          self.nodeList[data.id].lastBlockNumber = data.lastBlockNumber
          self.nodeList[data.id].lastBlockTransactions = data.lastBlockTransactions
          self.nodeList[data.id].lastRecievedBlock = data.lastRecievedBlock
          self.nodeList[data.id].totalDifficulty = data.totalDifficulty
          self.nodeList[data.id].propagationTime = data.propagationTime
          self.nodeList[data.id].ping = ping
          self.nodeList[data.id].upTime = self.calculateUptime(self.nodeList[data.id].upTimeRequests, self.nodeList[data.id].upTimeReplies)
          self.nodeList[data.id].lastSeen = Date.now()
          //console.log(self.nodeList[data.id])
        } else {
          console.log('[+] Registering new node: ', data.name)
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
            upTimeRequests: 0,
            upTimeReplies: 0,
            upTime: 100,
            lastSeen: Date.now(),
          }
        }
      })
    })
  }

  checkConnectionList() {

  }





}

module.exports = Nodes

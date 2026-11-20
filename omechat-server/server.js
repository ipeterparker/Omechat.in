// Omechat matching + signaling server (Socket.IO). Run: npm install && node server.js
const http = require('http')
const { Server } = require('socket.io')

const PORT = process.env.PORT || 3001
const ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('omechat server ok')
})
const io = new Server(server, { cors: { origin: ORIGINS }, maxHttpBufferSize: 200 * 1024 })

const queue = [] // sockets waiting for a stranger
const blocked = new Map() // socket.id -> Set of socket ids it reported

const clean = (p = {}) => ({
  name: String(p.name || 'Anonymous').slice(0, 24),
  google: !!p.google,
  photo: typeof p.photo === 'string' && p.photo.length < 150000 ? p.photo : undefined,
  age: Number.isFinite(p.age) ? p.age : undefined,
  gender: p.gender === 'Male' || p.gender === 'Female' ? p.gender : undefined,
  country: typeof p.country === 'string' ? p.country.slice(0, 2).toUpperCase() : null,
})

function removeFromQueue(s) {
  const i = queue.indexOf(s)
  if (i >= 0) queue.splice(i, 1)
}

function leavePeer(s, reason) {
  const peer = s.data.peer
  if (!peer) return
  s.data.peer = null
  if (peer.data.peer === s) {
    peer.data.peer = null
    peer.emit('peer-left', { reason })
  }
}

function compatible(a, b) {
  if (a.data.mode !== b.data.mode) return false
  if (blocked.get(a.id)?.has(b.id) || blocked.get(b.id)?.has(a.id)) return false
  const same = a.data.sameCountry || b.data.sameCountry
  if (same) {
    const ca = a.data.profile.country
    const cb = b.data.profile.country
    if (!ca || !cb || ca !== cb) return false
  }
  return true
}

function tryMatch(s) {
  const idx = queue.findIndex((o) => o !== s && compatible(s, o))
  if (idx < 0) return
  const other = queue.splice(idx, 1)[0]
  removeFromQueue(s)
  s.data.peer = other
  other.data.peer = s
  other.emit('matched', { peer: s.data.profile, initiator: true })
  s.emit('matched', { peer: other.data.profile, initiator: false })
}

io.on('connection', (socket) => {
  socket.data = { peer: null, mode: 'text', sameCountry: false, profile: clean() }
  io.emit('online', { count: io.engine.clientsCount })

  socket.on('join', (d = {}) => {
    leavePeer(socket, 'left')
    removeFromQueue(socket)
    socket.data.mode = d.mode === 'video' ? 'video' : 'text'
    socket.data.sameCountry = !!d.sameCountry
    socket.data.profile = clean(d.profile)
    queue.push(socket)
    tryMatch(socket)
  })

  socket.on('skip', () => leavePeer(socket, 'left'))
  socket.on('stop', () => {
    removeFromQueue(socket)
    leavePeer(socket, 'left')
  })

  socket.on('message', (d = {}) => {
    const peer = socket.data.peer
    if (peer && typeof d.text === 'string') peer.emit('message', { text: d.text.slice(0, 500) })
  })
  socket.on('typing', (on) => socket.data.peer?.emit('typing', !!on))
  socket.on('signal', (m) => socket.data.peer?.emit('signal', m))

  // Friend requests: only between two Google users
  socket.on('friend-request', () => {
    const peer = socket.data.peer
    if (peer && peer.data.profile.google && socket.data.profile.google) {
      peer.emit('friend-request', { fromId: socket.id, from: socket.data.profile })
    }
  })
  socket.on('friend-response', (d = {}) => {
    const target = io.sockets.sockets.get(d.to)
    if (target && socket.data.profile.google) target.emit('friend-response', { accept: !!d.accept, from: socket.data.profile })
  })

  socket.on('report', (d = {}) => {
    const peer = socket.data.peer
    if (!peer) return
    if (!blocked.has(socket.id)) blocked.set(socket.id, new Set())
    blocked.get(socket.id).add(peer.id)
    console.log('REPORT', new Date().toISOString(), String(d.reason || '').slice(0, 60), 'reported:', peer.data.profile.name)
  })

  socket.on('disconnect', () => {
    removeFromQueue(socket)
    leavePeer(socket, 'disconnected')
    blocked.delete(socket.id)
    io.emit('online', { count: io.engine.clientsCount })
  })
})

server.listen(PORT, () => console.log('omechat server on', PORT))

// Omechat matching + signaling server (Socket.IO). Run: npm install && node server.js
const http = require('http')
const crypto = require('crypto')
const { Server } = require('socket.io')

const PORT = process.env.PORT || 3001
const ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
const GRACE_MS = 29000 // how long a chat waits for a stranger who went offline / minimized to come back

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('omechat server ok')
})
// Short ping timing so a dropped connection is noticed in about 15 seconds (default is about 45).
const io = new Server(server, {
  cors: { origin: ORIGINS },
  maxHttpBufferSize: 200 * 1024,
  pingInterval: 8000,
  pingTimeout: 6000,
})

const queue = [] // sockets waiting for a stranger
const blocked = new Map() // socket.id -> Set of socket ids it reported
const rooms = new Map() // room id -> { id, members: [member, member] }
const byToken = new Map() // resume token -> member
// member = { sock, token, initiator, away, timer, room }

const rid = () => crypto.randomBytes(12).toString('hex')

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

// The other person in this socket's chat (may be away), or null.
function otherMember(s) {
  const m = s.data.member
  const room = s.data.room
  if (!m || !room) return null
  return room.members.find((x) => x !== m) || null
}

// The other person only if their connection is alive right now (a minimized page still counts, so it gets the messages).
function livePeer(s) {
  const o = otherMember(s)
  return o && o.sock.connected ? o.sock : null
}

// End a chat for everyone. `except` is the member who is leaving (not told).
function destroyRoom(room, reason, except) {
  rooms.delete(room.id)
  for (const m of room.members) {
    clearTimeout(m.timer)
    m.timer = null
    byToken.delete(m.token)
    const s = m.sock
    if (!s.connected) blocked.delete(s.id)
    if (s.data.member === m) {
      s.data.member = null
      s.data.room = null
    }
    if (m !== except && !m.away && s.connected) s.emit('peer-left', { reason })
  }
}

function leavePeer(s, reason) {
  const room = s.data.room
  if (room) destroyRoom(room, reason, s.data.member)
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
  const room = { id: rid(), members: [] }
  const join = (sock, initiator) => {
    const m = { sock, token: rid(), initiator, away: false, timer: null, room }
    room.members.push(m)
    sock.data.room = room
    sock.data.member = m
    byToken.set(m.token, m)
    return m
  }
  const mo = join(other, true)
  const ms = join(s, false)
  rooms.set(room.id, room)
  other.emit('matched', { peer: s.data.profile, initiator: true, room: { id: room.id, token: mo.token } })
  s.emit('matched', { peer: other.data.profile, initiator: false, room: { id: room.id, token: ms.token } })
}

io.on('connection', (socket) => {
  socket.data = { member: null, room: null, mode: 'text', sameCountry: false, profile: clean() }
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

  // A user whose connection dropped comes back with the token they got when matched.
  socket.on('resume', (d = {}) => {
    const m = byToken.get(String(d.token || ''))
    const room = m && m.room
    if (!m || !room || !rooms.has(room.id) || room.id !== d.id) {
      socket.emit('resume-failed')
      return
    }
    if (!m.away) {
      // never marked away (e.g. quick tab switch): nothing to resume, the chat is still alive
      if (m.sock === socket) socket.emit('resumed', { peer: room.members.find((x) => x !== m).sock.data.profile, initiator: m.initiator })
      else socket.emit('resume-failed')
      return
    }
    clearTimeout(m.timer)
    m.timer = null
    m.away = false
    const old = m.sock
    m.sock = socket
    socket.data = { ...old.data, member: m, room }
    if (old.id !== socket.id && blocked.has(old.id)) {
      blocked.set(socket.id, blocked.get(old.id))
      blocked.delete(old.id)
    }
    const other = room.members.find((x) => x !== m)
    socket.emit('resumed', { peer: other.sock.data.profile, initiator: m.initiator })
    if (other && !other.away && other.sock.connected) other.sock.emit('peer-back')
  })

  // The page was minimized / hidden: start the same grace timer, the stranger sees "disconnected" with a countdown.
  socket.on('hidden', () => {
    const m = socket.data.member
    const room = socket.data.room
    if (!room || !m || m.sock !== socket || m.away) return
    const other = room.members.find((x) => x !== m)
    m.away = true
    if (other && !other.away && other.sock.connected) other.sock.emit('peer-away', { seconds: GRACE_MS / 1000 })
    m.timer = setTimeout(() => {
      if (rooms.has(room.id) && m.away) destroyRoom(room, 'timeout', m)
    }, GRACE_MS)
  })

  socket.on('message', (d = {}) => {
    const peer = livePeer(socket)
    if (peer && typeof d.text === 'string') {
      const out = { text: d.text.slice(0, 500) }
      // optional: message id (for edits) and the message being replied to
      if (typeof d.mid === 'string') out.mid = d.mid.slice(0, 40)
      if (d.reply && typeof d.reply.text === 'string') out.reply = { text: d.reply.text.slice(0, 120), mine: !!d.reply.mine }
      peer.emit('message', out)
    }
  })
  // A user edited one of their own messages.
  socket.on('edit', (d = {}) => {
    const peer = livePeer(socket)
    if (peer && typeof d.mid === 'string' && typeof d.text === 'string') {
      peer.emit('edit', { mid: d.mid.slice(0, 40), text: d.text.slice(0, 500) })
    }
  })
  socket.on('typing', (on) => livePeer(socket)?.emit('typing', !!on))
  socket.on('signal', (m) => livePeer(socket)?.emit('signal', m))

  // Friend requests: only between two Google users
  socket.on('friend-request', () => {
    const peer = livePeer(socket)
    if (peer && peer.data.profile.google && socket.data.profile.google) {
      peer.emit('friend-request', { fromId: socket.id, from: socket.data.profile })
    }
  })
  socket.on('friend-response', (d = {}) => {
    const target = io.sockets.sockets.get(d.to)
    if (target && socket.data.profile.google) target.emit('friend-response', { accept: !!d.accept, from: socket.data.profile })
  })

  socket.on('report', (d = {}) => {
    const other = otherMember(socket)
    if (!other) return
    const peer = other.sock
    if (!blocked.has(socket.id)) blocked.set(socket.id, new Set())
    blocked.get(socket.id).add(peer.id)
    console.log('REPORT', new Date().toISOString(), String(d.reason || '').slice(0, 60), 'reported:', peer.data.profile.name)
  })

  socket.on('disconnect', () => {
    removeFromQueue(socket)
    const m = socket.data.member
    const room = socket.data.room
    if (room && m && m.sock === socket && !m.away) {
      const other = room.members.find((x) => x !== m)
      if (!other || other.away) {
        // nobody is left to wait for
        destroyRoom(room, 'disconnected', m)
      } else {
        // wait for them to come back, and tell the other person
        m.away = true
        other.sock.emit('peer-away', { seconds: GRACE_MS / 1000 })
        m.timer = setTimeout(() => {
          if (rooms.has(room.id) && m.away) destroyRoom(room, 'timeout', m)
        }, GRACE_MS)
      }
    } else if (!room) {
      blocked.delete(socket.id)
    }
    io.emit('online', { count: io.engine.clientsCount })
  })
})

server.listen(PORT, () => console.log('omechat server on', PORT))

// Bearchat matching + signaling server (Socket.IO). Run: npm install && node server.js
const http = require('http')
const crypto = require('crypto')
const { Server } = require('socket.io')

const PORT = process.env.PORT || 3001
const ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('bearchat server ok')
})
// Ping timing: short net blips are ignored; a really dead connection (net off) is noticed in 15-30 seconds; a closed tab is noticed at once.
const io = new Server(server, {
  cors: { origin: ORIGINS },
  maxHttpBufferSize: 200 * 1024,
  pingInterval: 15000,
  pingTimeout: 15000,
})

const queue = [] // sockets waiting for a stranger
const blocked = new Map() // socket.id -> Set of socket ids it reported
const rooms = new Map() // room id -> { id, members: [member, member] }
const byToken = new Map() // resume token -> member
// member = { sock, token, initiator, away, timer, room, pending } (pending = events sent while this person was away)

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

// Send an event to the other person. If they are away (closed tab / no net) it is kept and delivered when they come back.
function relay(s, event, payload) {
  const o = otherMember(s)
  if (!o) return
  if (o.away || !o.sock.connected) {
    if (o.pending.length < 100) o.pending.push([event, payload])
  } else {
    o.sock.emit(event, payload)
  }
}

function flushPending(m, sock) {
  const q = m.pending
  m.pending = []
  for (const [ev, payload] of q) sock.emit(ev, payload)
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
    const m = { sock, token: rid(), initiator, away: false, timer: null, room, pending: [] }
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
      if (m.sock === socket) {
        const o = room.members.find((x) => x !== m)
        socket.emit('resumed', { peer: o.sock.data.profile, initiator: m.initiator })
        flushPending(m, socket)
        if (o.away) socket.emit('peer-away')
      } else socket.emit('resume-failed')
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
    flushPending(m, socket)
    if (other.away) socket.emit('peer-away')
    else if (other.sock.connected) other.sock.emit('peer-back')
  })

  socket.on('message', (d = {}) => {
    if (typeof d.text !== 'string') return
    const out = { text: d.text.slice(0, 500) }
    if (typeof d.mid === 'string') out.mid = d.mid.slice(0, 24)
    const r = d.reply
    if (r && typeof r.text === 'string') out.reply = { text: r.text.slice(0, 120), mine: !!r.mine }
    relay(socket, 'message', out)
  })
  socket.on('edit', (d = {}) => {
    if (typeof d.text !== 'string' || typeof d.mid !== 'string') return
    relay(socket, 'edit', { mid: d.mid.slice(0, 24), text: d.text.slice(0, 500) })
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
    if (room && m && m.sock === socket) {
      const other = room.members.find((x) => x !== m)
      if (!other || other.away) {
        // nobody is left to wait for
        destroyRoom(room, 'disconnected', m)
      } else if (!m.away) {
        // site/tab closed or internet off: keep the chat, tell the other person, resume if they come back
        m.away = true
        if (other.sock.connected) other.sock.emit('peer-away')
      }
    } else if (!room) {
      blocked.delete(socket.id)
    }
    io.emit('online', { count: io.engine.clientsCount })
  })
})

server.listen(PORT, () => console.log('bearchat server on', PORT))

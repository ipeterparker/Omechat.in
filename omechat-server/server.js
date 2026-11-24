// Omechat matching + signaling server (Socket.IO). Run: npm install && node server.js
const http = require('http')
const crypto = require('crypto')
const { Server } = require('socket.io')

const PORT = process.env.PORT || 3001
// Only the real site may talk to this server (set ALLOWED_ORIGINS on Render to override, comma separated)
const ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((x) => x.trim()).filter(Boolean)
  : ['https://omechat.in', 'https://www.omechat.in', 'http://localhost:3000']

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('omechat server ok')
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

// Everyone gets the live count, but at most once every 3 seconds (not on every single connect/disconnect)
let onlineTimer = null
function scheduleOnline() {
  if (onlineTimer) return
  onlineTimer = setTimeout(() => {
    onlineTimer = null
    io.emit('online', { count: io.engine.clientsCount })
  }, 3000)
}

// Simple per-connection rate limit: returns false when an event is sent too often (the event is then ignored)
const rateState = new WeakMap()
function allow(s, key, max, windowMs) {
  const now = Date.now()
  let st = rateState.get(s)
  if (!st) rateState.set(s, (st = {}))
  const e = st[key]
  if (!e || now - e.t >= windowMs) {
    st[key] = { t: now, n: 1 }
    return true
  }
  e.n++
  return e.n <= max
}

// Only an embedded image or a Google profile picture is allowed as a photo (any other link would show the viewer's IP to a stranger)
function safePhoto(v) {
  if (typeof v !== 'string' || v.length >= 150000) return undefined
  if (/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v)) return v
  if (v.length < 500 && /^https:\/\/[a-z0-9-]+\.googleusercontent\.com\/[^\s"'<>]*$/i.test(v)) return v
  return undefined
}

const clean = (p = {}) => ({
  name: String(p.name || 'Anonymous').slice(0, 24),
  google: !!p.google,
  photo: safePhoto(p.photo),
  age: Number.isFinite(p.age) && p.age >= 0 && p.age <= 120 ? Math.round(p.age) : undefined,
  gender: p.gender === 'Male' || p.gender === 'Female' ? p.gender : undefined,
  country: typeof p.country === 'string' ? p.country.slice(0, 2).toUpperCase() : null,
})

function removeFromQueue(s) {
  const i = queue.indexOf(s)
  if (i >= 0) queue.splice(i, 1)
}

// ---- Banned-word block: "telegram" and "paid" (any style: symbols, spaces, numbers, short forms) -> 3 minute block ----
const BLOCK_MS = 3 * 60 * 1000

// Look-alike letters (small caps, Cyrillic, Greek...) -> plain letters
const LOOKALIKE = {
  'ᴛ': 't', 'ᴇ': 'e', 'ʟ': 'l', 'ɢ': 'g', 'ʀ': 'r', 'ᴀ': 'a', 'ᴍ': 'm', 'ᴘ': 'p', 'ɪ': 'i', 'ᴅ': 'd',
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'т': 't', 'і': 'i', 'ӏ': 'l', 'м': 'm', 'ԁ': 'd', 'ɡ': 'g',
  'α': 'a', 'ε': 'e', 'ο': 'o', 'ρ': 'p', 'τ': 't', 'ι': 'i', 'μ': 'm', 'ł': 'l', 'đ': 'd', 'ø': 'o',
  '€': 'e', 'є': 'e', '£': 'e', '¢': 'c', '$': 's', 'я': 'r', '®': 'r',
  'ᴠ': 'v', 'ᴄ': 'c', 'ꜱ': 's', 'ᴏ': 'o', 'ᴡ': 'w',
}
const LOOKALIKE_RE = new RegExp('[' + Object.keys(LOOKALIKE).join('') + ']', 'g')

function normalizeText(s) {
  return String(s)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // accents
    .replace(/[​-‏⁠﻿­]/g, '') // invisible characters
    .toLowerCase()
    .replace(LOOKALIKE_RE, (c) => LOOKALIKE[c] || c)
}

// One letter -> the characters that can stand for it (a=4/@, e=3, i=1/!/|, l=1/|/!, t=7/+, g=9/6), repeats allowed.
const CLS = { t: '[t7+]', e: '[e3€£]', l: '[l1|!]', g: '[g96]', r: 'r', a: '[a4@]', m: 'm', p: 'p', i: '[i1!|]', d: 'd' }
const SEP = '[^a-z0-9@|!+]' // spaces, dots, dashes, underscores, emoji ... anything between letters
const L = (c, optional = false) => (optional ? `(?:${CLS[c]}+${SEP}*)*` : `${CLS[c]}+${SEP}*`)

const PATTERNS = [
  // telegram, also tlgrm / telgram / teleegram / t.e.l.e.g.r.a.m / t e l e g r a m
  new RegExp(L('t') + L('e', true) + L('l') + L('e', true) + L('g') + L('r') + L('a', true) + CLS.m + '+', 'g'),
  // short forms: "tg", "t.g", "t.me"
  /(?<![a-z0-9])t[.\-_*]{0,2}g(?![a-z0-9])/g,
  /(?<![a-z0-9])t\s?\.\s?me(?![a-z])/g,
]
// "paid" is only blocked together with service / promotion / ads (so "I paid", "unpaid", "prepaid" are fine).
// Works with symbols too: p@id s3rvice, p.a.i.d promo, paid s€rvices, "services are paid" ...
const PAID = '(?<![a-z])' + L('p') + L('a') + L('i') + 'd+'
const PAID_END = PAID + '(?![a-z])'
const CTX = '(?:' + [
  's[e3€£a4@]*r+[vw]+[i1!|]*[cs5]+[e3€£]*s*[a-z]*', // service(s), servis, srvc, sarvice
  's' + SEP + '*[e3€£a4@]+' + SEP + '*r+' + SEP + '*[vw]+' + SEP + '*[i1!|]+' + SEP + '*[cs5]+' + SEP + '*[e3€£]*', // s e r v i c e
  'p+r+[o0]+m+[o0][a-z]*', // promo, promotion, promote
  '[a4@]+d+s?(?![a-z0-9])', // ad, ads
  '[a4@]+d+v[a-z]*', // advert, advertising, advertisement
].join('|') + ')'
const CTX_START = '(?<![a-z])' + CTX
const LINK = '(?:' + SEP + '+(?:is|are|ka|ki|ke|hai|hain|h|only|available|wala|wali|me|mein)(?![a-z]))?'
const PAID_PATTERNS = [
  new RegExp(PAID + LINK + SEP + '*' + CTX, 'g'), // paid service
  new RegExp(CTX_START + LINK + SEP + '*' + PAID_END, 'g'), // service paid / services are paid
]
// Russian spelling of telegram
const CYRILLIC_TELEGRAM = /т\s*[еe]\s*л\s*[еe]\s*г\s*р\s*[аa]\s*м/i
// Hindi spelling of telegram
const DEVANAGARI_TELEGRAM = /ट[ेि]?ल[ीिे]?ग्?र[ाैे]?म/

function hasBannedWord(text) {
  if (typeof text !== 'string' || !text) return false
  if (DEVANAGARI_TELEGRAM.test(text.replace(/[\s​-‏⁠﻿]/g, ''))) return true
  if (CYRILLIC_TELEGRAM.test(text)) return true
  const t = normalizeText(text)
  for (const re of PAID_PATTERNS) {
    re.lastIndex = 0
    if (re.test(t)) return true
  }
  for (const re of PATTERNS) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(t))) {
      const hit = m[0]
      // Letters split by spaces/symbols must stand alone (so "swap aid" or "tell grams" is not caught)
      const split = new RegExp(SEP).test(hit)
      const before = t[m.index - 1] || ''
      const after = t[m.index + hit.length] || ''
      if (!split || (!/[a-z]/.test(before) && !/[a-z]/.test(after))) return true
      if (hit.length === 0) re.lastIndex++
    }
  }
  return false
}

const bans = new Map() // "cid:..." / "sock:..." -> time (ms) until which that person is blocked
setInterval(() => {
  const now = Date.now()
  for (const [k, until] of bans) if (until <= now) bans.delete(k)
}, 60 * 1000).unref()

function banKeys(s) {
  const keys = []
  const cid = s.handshake.auth && s.handshake.auth.cid
  if (typeof cid === 'string' && cid) keys.push('cid:' + cid.slice(0, 64))
  else keys.push('sock:' + s.id) // no device id available: block at least this connection
  return keys
}

// Milliseconds still left on this person's block (0 = not blocked)
function banLeft(s) {
  const now = Date.now()
  let left = 0
  for (const k of banKeys(s)) left = Math.max(left, (bans.get(k) || 0) - now)
  return Math.max(0, left)
}
// ---- end banned-word block ----

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

// ---- Text chat only: a banned word is blocked only when it is sent to many different strangers in a short time ----
// (one now and then is fine and the chat goes on normally; video chat has no word block at all)
const STRIKE_LIMIT = 7 // this many different strangers ...
const STRIKE_WINDOW_MS = 5 * 60 * 1000 // ... within this time -> 3 minute block
const strikes = new Map() // person key -> [{ t, room }]
setInterval(() => {
  const now = Date.now()
  for (const [k, list] of strikes) {
    const keep = list.filter((x) => now - x.t < STRIKE_WINDOW_MS)
    if (keep.length) strikes.set(k, keep)
    else strikes.delete(k)
  }
}, 60 * 1000).unref()

// Returns true when this banned word should lead to a block now.
function shouldBlock(s) {
  if (s.data.mode === 'video') return false // video chat: no word block
  const cid = s.handshake.auth && s.handshake.auth.cid
  const key = typeof cid === 'string' && cid ? 'cid:' + cid.slice(0, 64) : 'sock:' + s.id
  const now = Date.now()
  const list = (strikes.get(key) || []).filter((x) => now - x.t < STRIKE_WINDOW_MS)
  const room = s.data.room ? s.data.room.id : 'none'
  if (!list.some((x) => x.room === room)) list.push({ t: now, room }) // same stranger twice counts once
  if (new Set(list.map((x) => x.room)).size >= STRIKE_LIMIT) {
    strikes.delete(key)
    return true
  }
  strikes.set(key, list)
  return false
}

// Banned word used: end their chat, take them out of the queue and block them for 3 minutes (every time it happens again, a fresh 3 minutes).
function punish(s, where) {
  const until = Date.now() + BLOCK_MS
  for (const k of banKeys(s)) bans.set(k, until)
  removeFromQueue(s)
  leavePeer(s, 'left')
  console.log('BLOCKED', new Date().toISOString(), where, banKeys(s).join(' '))
  s.emit('blocked', { ms: BLOCK_MS })
}
// True (and tells them) if this person is still inside a block.
function stillBlocked(s) {
  const left = banLeft(s)
  if (left <= 0) return false
  s.emit('blocked', { ms: left })
  return true
}

function compatible(a, b) {
  if (a.data.mode !== b.data.mode) return false
  if (blocked.get(a.id)?.has(b.id) || blocked.get(b.id)?.has(a.id)) return false
  // "same country only" counts only for a person whose country is known (otherwise they could never match)
  const wants = (x) => x.data.sameCountry && x.data.profile.country
  const same = wants(a) || wants(b)
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
  socket.emit('online', { count: io.engine.clientsCount })
  scheduleOnline()
  { const left = banLeft(socket); if (left > 0) socket.emit('blocked', { ms: left }) }

  socket.on('join', (d = {}) => {
    if (!allow(socket, 'join', 10, 10000)) return
    leavePeer(socket, 'left')
    removeFromQueue(socket)
    if (stillBlocked(socket)) return
    socket.data.mode = d.mode === 'video' ? 'video' : 'text'
    socket.data.sameCountry = !!d.sameCountry
    socket.data.profile = clean(d.profile)
    queue.push(socket)
    tryMatch(socket)
  })

  socket.on('skip', () => {
    if (!allow(socket, 'skip', 10, 10000)) return
    leavePeer(socket, 'left')
  })
  socket.on('stop', () => {
    removeFromQueue(socket)
    leavePeer(socket, 'left')
  })

  // A user whose connection dropped comes back with the token they got when matched.
  socket.on('resume', (d = {}) => {
    if (!allow(socket, 'resume', 10, 10000)) return
    const m = byToken.get(String(d.token || ''))
    const room = m && m.room
    if (!m || !room || !rooms.has(room.id) || room.id !== d.id) {
      socket.emit('resume-failed')
      return
    }
    if (m.sock === socket) {
      // same connection that is already in this chat: nothing to resume, the chat is still alive
      const o = room.members.find((x) => x !== m)
      socket.emit('resumed', { peer: o.sock.data.profile, initiator: m.initiator })
      flushPending(m, socket)
      if (o.away) socket.emit('peer-away')
      return
    }
    // A new connection with the right secret token takes over this seat. This also covers a quick net switch,
    // where the server has not yet noticed that the old connection is dead (so the chat is not lost).
    const wasAway = m.away
    clearTimeout(m.timer)
    m.timer = null
    m.away = false
    const old = m.sock
    m.sock = socket
    socket.data = { ...old.data, member: m, room }
    old.data = { ...old.data, member: null, room: null } // the old connection no longer owns this chat
    if (old.id !== socket.id && blocked.has(old.id)) {
      blocked.set(socket.id, blocked.get(old.id))
      blocked.delete(old.id)
    }
    if (old.connected) old.disconnect(true)
    const other = room.members.find((x) => x !== m)
    socket.emit('resumed', { peer: other.sock.data.profile, initiator: m.initiator })
    flushPending(m, socket)
    if (other.away) socket.emit('peer-away')
    else if (wasAway && other.sock.connected) other.sock.emit('peer-back')
  })

  socket.on('message', (d = {}) => {
    if (typeof d.text !== 'string') return
    if (!allow(socket, 'message', 20, 10000)) return
    if (stillBlocked(socket)) return
    if ((hasBannedWord(d.text) || hasBannedWord(d.reply && d.reply.text)) && shouldBlock(socket)) return punish(socket, 'message')
    const out = { text: d.text.slice(0, 500) }
    if (typeof d.mid === 'string') out.mid = d.mid.slice(0, 24)
    const r = d.reply
    if (r && typeof r.text === 'string') out.reply = { text: r.text.slice(0, 120), mine: !!r.mine }
    relay(socket, 'message', out)
  })
  socket.on('edit', (d = {}) => {
    if (typeof d.text !== 'string' || typeof d.mid !== 'string') return
    if (!allow(socket, 'edit', 20, 10000)) return
    if (stillBlocked(socket)) return
    if (hasBannedWord(d.text) && shouldBlock(socket)) return punish(socket, 'edit')
    relay(socket, 'edit', { mid: d.mid.slice(0, 24), text: d.text.slice(0, 500) })
  })
  socket.on('typing', (on) => {
    if (!allow(socket, 'typing', 20, 5000)) return
    livePeer(socket)?.emit('typing', !!on)
  })
  socket.on('signal', (m) => {
    if (!allow(socket, 'signal', 300, 10000)) return
    livePeer(socket)?.emit('signal', m)
  })

  // Friend requests: only between two Google users
  socket.on('friend-request', () => {
    if (!allow(socket, 'friend', 5, 30000)) return
    const peer = livePeer(socket)
    if (peer && peer.data.profile.google && socket.data.profile.google) {
      // remember who asked, so only a person who really asked can get the answer
      if (!peer.data.friendFrom) peer.data.friendFrom = new Set()
      if (peer.data.friendFrom.size < 20) peer.data.friendFrom.add(socket.id)
      peer.emit('friend-request', { fromId: socket.id, from: socket.data.profile })
    }
  })
  socket.on('friend-response', (d = {}) => {
    if (!allow(socket, 'friend', 10, 30000)) return
    // the answer goes only to the person who really asked this user, and only once
    if (typeof d.to !== 'string' || !socket.data.friendFrom || !socket.data.friendFrom.has(d.to)) return
    socket.data.friendFrom.delete(d.to)
    const target = io.sockets.sockets.get(d.to)
    if (target && socket.data.profile.google) target.emit('friend-response', { accept: !!d.accept, from: socket.data.profile })
  })

  socket.on('report', (d = {}) => {
    if (!allow(socket, 'report', 5, 60000)) return
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
    scheduleOnline()
  })
})

// One bad message from a user must never take the whole server down
process.on('uncaughtException', (e) => console.error('uncaughtException', e))
process.on('unhandledRejection', (e) => console.error('unhandledRejection', e))

server.listen(PORT, () => console.log('omechat server on', PORT))

export type Identity = { type: 'anon' } | { type: 'google'; name: string; email: string; picture?: string }
export type Gender = 'Male' | 'Female'
export type Profile = {
  email?: string // the Google account this profile belongs to
  name: string
  dob: string
  gender: Gender
  photo?: string
  bio?: string
  interests?: string[]
  joined: string
}
export type PublicProfile = {
  name: string
  google: boolean
  photo?: string
  age?: number
  gender?: Gender
  country?: string | null
}

const K_ANON = 'omechat-identity'
const K_GOOGLE = 'omechat-google'
const K_PROFILE = 'omechat-profile'
const K_FRIENDS = 'omechat-friends'

function read<T>(store: Storage, key: string): T | null {
  try {
    const raw = store.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function loadIdentity(): Identity | null {
  return read<Identity>(sessionStorage, K_ANON) ?? read<Identity>(localStorage, K_GOOGLE)
}
// The saved Google sign-in only (video chat needs this, even if this tab has an anonymous text-chat identity)
export function loadGoogleIdentity(): Identity | null {
  const g = read<Identity>(localStorage, K_GOOGLE)
  return g && g.type === 'google' ? g : null
}
export function saveIdentity(i: Identity) {
  try {
    if (i.type === 'google') localStorage.setItem(K_GOOGLE, JSON.stringify(i))
    else sessionStorage.setItem(K_ANON, JSON.stringify(i))
  } catch {}
}
export function clearIdentity() {
  try {
    sessionStorage.removeItem(K_ANON)
    localStorage.removeItem(K_GOOGLE)
  } catch {}
}
// A saved profile is only returned for the Google account it was made for (another account on the same phone never inherits it)
export function loadProfile(): Profile | null {
  const p = read<Profile>(localStorage, K_PROFILE)
  if (!p) return null
  const g = read<Identity>(localStorage, K_GOOGLE)
  if (p.email && g && g.type === 'google' && g.email !== p.email) return null
  return p
}
export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(K_PROFILE, JSON.stringify(p))
  } catch {}
}
// Sign out: login, profile and friends all leave this device, so the next person who signs in starts clean
export function signOut() {
  clearAll()
}

export function clearAll() {
  try {
    clearIdentity()
    localStorage.removeItem(K_PROFILE)
    localStorage.removeItem(K_FRIENDS)
  } catch {}
}

export type Friend = { name: string; photo?: string }
export function loadFriends(): Friend[] {
  return read<Friend[]>(localStorage, K_FRIENDS) ?? []
}
export function addFriend(f: Friend) {
  try {
    const list = loadFriends().filter((x) => x.name !== f.name || x.photo !== f.photo)
    localStorage.setItem(K_FRIENDS, JSON.stringify([...list, f]))
  } catch {}
}

// Age from a "YYYY-MM-DD" text. Read as plain numbers (new Date("2000-01-01") is UTC midnight, which is the
// day before in the Americas and could make a person look a day younger or older than they are).
export function ageFromDob(dob?: string): number | undefined {
  if (!dob) return undefined
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob)
  if (!m) return undefined
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const check = new Date(y, mo - 1, d)
  if (check.getFullYear() !== y || check.getMonth() !== mo - 1 || check.getDate() !== d) return undefined // e.g. 2000-02-31
  const now = new Date()
  let age = now.getFullYear() - y
  if (now.getMonth() < mo - 1 || (now.getMonth() === mo - 1 && now.getDate() < d)) age--
  return age < 0 || age > 120 ? undefined : age
}

// Today as "YYYY-MM-DD" in the person's own time zone (toISOString() would give the UTC date)
export function todayISO(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

export function toPublic(identity: Identity, profile: Profile | null, country: string | null): PublicProfile {
  if (identity.type !== 'google') return { name: 'Anonymous', google: false, country }
  return {
    name: profile?.name || identity.name,
    google: true,
    photo: profile?.photo || identity.picture,
    age: ageFromDob(profile?.dob),
    gender: profile?.gender,
    country,
  }
}

// Square crop + resize so a gallery photo stays small (about 10-20 KB).
export async function fileToDataUrl(file: File, size = 256): Promise<string> {
  const bmp = await createImageBitmap(file)
  const side = Math.min(bmp.width, bmp.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, size, size)
  return canvas.toDataURL('image/jpeg', 0.82)
}

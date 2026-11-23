export type Identity = { type: 'anon' } | { type: 'google'; name: string; email: string; picture?: string }
export type Gender = 'Male' | 'Female'
export type Profile = {
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

const K_ANON = 'bearchat-identity'
const K_GOOGLE = 'bearchat-google'
const K_PROFILE = 'bearchat-profile'
const K_FRIENDS = 'bearchat-friends'

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
export function loadProfile(): Profile | null {
  return read<Profile>(localStorage, K_PROFILE)
}
export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(K_PROFILE, JSON.stringify(p))
  } catch {}
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
    const list = loadFriends().filter((x) => x.name !== f.name)
    localStorage.setItem(K_FRIENDS, JSON.stringify([...list, f]))
  } catch {}
}

export function ageFromDob(dob?: string): number | undefined {
  if (!dob) return undefined
  const d = new Date(dob)
  if (Number.isNaN(d.getTime())) return undefined
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
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

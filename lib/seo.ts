// Set NEXT_PUBLIC_SITE_URL in .env.local to your real domain (for example https://omechat.in).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
export const SITE_NAME = 'Omechat'

export type FAQ = { q: string; a: string }
export type SeoPage = {
  slug: string
  title: string
  description: string
  h1: string
  intro: string
  steps: string[]
  points: { title: string; text: string }[]
  faq: FAQ[]
}

export const HOME_TITLE = 'Omegle Alternative: Free Random Chat with Strangers | Omechat'
export const HOME_DESCRIPTION =
  'Looking for an Omegle alternative? Omechat is a free random chat site with text and video chat, no signup, a Same Country filter and safety tools. 18+ only. Works on any phone or laptop.'

export const KEYWORDS = [
  'random chat', 'random text chat', 'random video chat', 'talk to strangers', 'chat with strangers online',
  'omegle alternative', 'omegle alternative no signup', 'omegle alternative India', 'sites like omegle', 'omegle like sites',
  'omegle ka alternative', 'free chat no signup', 'anonymous chat', 'random chat India', 'Omechat',
]

export const OMEGLE_FAQ: FAQ[] = [
  { q: 'What is the best Omegle alternative?', a: 'The best Omegle alternative is one that is free, works in your browser, needs no signup and has real safety tools. Omechat offers random text and video chat, a Skip button, a Report button and a Same Country filter, for 18+ users only.' },
  { q: 'Is there an Omegle alternative with no signup?', a: 'Yes. Omechat lets you continue anonymously, so you can start a random chat in a few seconds without creating an account.' },
  { q: 'Is there an Omegle alternative for India?', a: 'Yes. Turn on Same Country in Omechat and you will be matched only with people from India. You can chat in English, Hindi or Hinglish.' },
  { q: 'Why did people look for Omegle alternatives?', a: 'Omegle shut down in November 2023, so people started looking for similar random chat sites to meet new people online.' },
  { q: 'Does Omechat work on mobile?', a: 'Yes. Omechat runs in your phone browser on Android and iPhone, so there is no app to download.' },
]

export const HOME_FAQ: FAQ[] = [
  { q: 'What is Omechat?', a: 'Omechat is a free website where you can talk to random people online through text chat or video chat. Tap Start, get matched with a stranger, and tap Skip to meet someone new.' },
  { q: 'Do I need to sign up?', a: 'No. You can continue anonymously and start chatting right away. If you sign in with Google you can add a name, photo and age to your profile.' },
  { q: 'Is Omechat an Omegle alternative?', a: 'Yes. If you liked random chat sites such as Omegle, Omechat gives you a similar way to meet new people. Omechat is an independent site and is not connected to Omegle.' },
  { q: 'Can I chat only with people from my country?', a: 'Yes. Turn on the Same Country option and you will only be matched with people from your own country.' },
  { q: 'Who can use Omechat?', a: 'You must be 18 or older. Explicit content and harassment are not allowed, and you can report anyone from inside the chat.' },
]

export const PAGES: SeoPage[] = [
  {
    slug: 'random-chat',
    title: 'Random Chat: Talk to Strangers Online Free | Omechat',
    description: 'Start a free random chat with people from around the world. Text or video, no signup needed, 18+ only. Skip anytime with one tap on Omechat.',
    h1: 'Random chat with strangers, free and instant',
    intro: 'Omechat connects you with a random person in seconds. Choose text or video, say hi, and tap Skip whenever you want someone new. You do not need an account to start.',
    steps: ['Open Omechat and pick Text Chat or Video Chat.', 'Continue anonymously, or sign in with Google for a profile.', 'Tap Start to meet a stranger. Tap Skip to meet the next one.'],
    points: [
      { title: 'No signup needed', text: 'Use anonymous mode to chat right away. Signing in with Google is optional.' },
      { title: 'Same Country filter', text: 'Turn it on in Settings to be matched with people from your own country.' },
      { title: 'Skip in one tap', text: 'Not enjoying a chat? Skip and get a new stranger instantly.' },
    ],
    faq: [
      { q: 'Is random chat on Omechat free?', a: 'Yes, Omechat is free to use.' },
      { q: 'Do I need an account?', a: 'No. You can chat anonymously. An account is only needed for a profile and friend requests.' },
      { q: 'How old do I have to be?', a: 'You must be 18 or older to use Omechat.' },
    ],
  },
  {
    slug: 'random-text-chat',
    title: 'Random Text Chat with Strangers: Free, No Signup | Omechat',
    description: 'Prefer typing to talking? Join a free random text chat with strangers on Omechat. See when they are typing, skip anytime, no signup needed.',
    h1: 'Random text chat, no camera needed',
    intro: 'Text chat is the easiest way to meet someone new. No camera and no microphone, just type a message and see who answers. Omechat shows when the other person is typing, so the conversation feels natural.',
    steps: ['Open Text Chat on Omechat.', 'Tap Start. We look for someone to talk to.', 'Type your message. Tap Skip, then Really, to move on to someone else.'],
    points: [
      { title: 'Typing indicator', text: 'You see a typing sign under their message while they write a reply.' },
      { title: 'Chat themes', text: 'Pick a Black, White or picture theme. Only you see your theme.' },
      { title: 'Names and flags', text: 'Strangers who sign in show their name, and every chat shows the country flag.' },
    ],
    faq: [
      { q: 'Can I use text chat without a camera?', a: 'Yes. Text chat needs no camera or microphone.' },
      { q: 'What happens when the stranger leaves?', a: 'You see a short message and can press Start for a new chat. If you do nothing, Omechat looks for the next person after 30 seconds.' },
      { q: 'Can I pick who I talk to?', a: 'You can turn on Same Country to meet people from your own country. Otherwise matches are random.' },
    ],
  },
  {
    slug: 'random-video-chat',
    title: 'Random Video Chat with Strangers: Free and Easy | Omechat',
    description: 'Free random video chat on Omechat. Split-screen video, mic and camera controls, one-tap Next. Meet new people face to face. 18+ only.',
    h1: 'Random video chat with new people',
    intro: 'See and hear a new person every time. Omechat shows the stranger on the top half of your screen and yourself on the bottom half, so video chat works well on a phone.',
    steps: ['Open Video Chat and allow camera and microphone.', 'Tap Start to be matched with a stranger.', 'Tap the Next button to meet someone else.'],
    points: [
      { title: 'Your controls only affect you', text: 'Mute, camera off and flip camera change your own video, never the stranger.' },
      { title: 'Report and block', text: 'Report anyone who breaks the rules. You will not be matched with them again.' },
      { title: 'Friend requests', text: 'Users who sign in with Google can send each other friend requests.' },
    ],
    faq: [
      { q: 'Do I need to allow my camera?', a: 'Yes, video chat needs your camera and microphone. You can turn them off any time with the buttons on screen.' },
      { q: 'Does it work on a phone?', a: 'Yes. Omechat works in your phone browser, no app download needed.' },
      { q: 'Can I stay anonymous on video chat?', a: 'You can use anonymous mode. Other people will see your video, so only share what you are comfortable with.' },
    ],
  },
  {
    slug: 'omegle-alternative',
    title: 'Omegle Alternative: Free Random Chat Site | Omechat',
    description: 'Looking for an Omegle alternative? Omechat gives you random text and video chat with strangers, no signup, a Same Country filter and report tools.',
    h1: 'A simple Omegle alternative',
    intro: 'Omegle closed in 2023, but people still want an easy way to meet strangers online. Omechat is an independent random chat site with text chat, video chat and no signup. It is not connected to Omegle.',
    steps: ['Open Omechat. No download needed.', 'Choose Text Chat or Video Chat.', 'Tap Start and meet someone new.'],
    points: [
      { title: 'Familiar and simple', text: 'Start, chat, skip. The idea is the same, with a clean layout made for phones.' },
      { title: 'Safety tools', text: '18+ only, a Report button and a Skip button are always there.' },
      { title: 'Extra features', text: 'Same Country filter, chat themes, optional Google profile and friend requests.' },
    ],
    faq: [
      { q: 'Is Omechat the same as Omegle?', a: 'No. Omechat is an independent site and is not affiliated with Omegle.' },
      { q: 'Is it free like Omegle was?', a: 'Yes, Omechat is free to use.' },
      { q: 'Do I need to register?', a: 'No. You can chat anonymously without registering.' },
    ],
  },
  {
    slug: 'talk-to-strangers',
    title: 'Talk to Strangers Online: Free Chat, No Signup | Omechat',
    description: 'Want to talk to strangers online? Omechat matches you with a random person for text or video chat in seconds. Free, no signup, 18+.',
    h1: 'Talk to strangers online, safely and easily',
    intro: 'Sometimes you just want to talk to someone new. Omechat helps you do that in a few seconds, with text or video, and you stay in control of every conversation.',
    steps: ['Pick Text Chat or Video Chat.', 'Tap Start and say hello.', 'Skip, report or stop whenever you want.'],
    points: [
      { title: 'You are in control', text: 'Leave any chat with one tap. Nobody can force you to stay.' },
      { title: 'Be kind', text: 'Explicit content and harassment are not allowed. Read our guidelines before you start.' },
      { title: 'Protect your privacy', text: 'Do not share your phone number, address or passwords with strangers.' },
    ],
    faq: [
      { q: 'Is it safe to talk to strangers online?', a: 'Be careful with any stranger. Never share personal details, and use Report or Skip if a chat feels wrong.' },
      { q: 'Is Omechat only for adults?', a: 'Yes. You must be 18 or older.' },
      { q: 'Do I have to give my name?', a: 'No. Anonymous mode needs no name.' },
    ],
  },
  {
    slug: 'india-random-chat',
    title: 'Random Chat India: Talk to Indians Online Free | Omechat',
    description: 'Free random chat for India. Turn on Same Country to talk only to people from India, with text or video chat and no signup on Omechat.',
    h1: 'Random chat India: meet people from your own country',
    intro: 'Want to chat with people from India? Turn on Same Country and Omechat matches you only with users from your country. Works in your phone browser, in English or Hinglish.',
    steps: ['Open Omechat on your phone.', 'Open Settings and turn on Same Country.', 'Tap Start to meet someone from India.'],
    points: [
      { title: 'Same Country', text: 'Both people are matched by country, so you meet people from your own part of the world.' },
      { title: 'Text or video', text: 'Use text chat or video chat, whichever you prefer.' },
      { title: 'Free on mobile', text: 'No app to install. Open the site and start.' },
    ],
    faq: [
      { q: 'How does Same Country work?', a: 'Omechat checks your country and only matches you with people from the same country when this option is on.' },
      { q: 'Can I chat in Hindi?', a: 'Yes, you can chat in any language you like, including Hindi and Hinglish.' },
      { q: 'Is it free in India?', a: 'Yes, Omechat is free to use.' },
    ],
  },
]

// Set NEXT_PUBLIC_SITE_URL in .env.local to your real domain (for example https://omechat.in).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://omechat.in').replace(/\/$/, '')
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

export const HOME_TITLE = 'Omegle : Talk to Strangers! | Omechat'
export const HOME_DESCRIPTION =
  'Best Omegle alternative for random video chat and text chat with strangers worldwide. Start in one tap. Free, no signup for text chat, instant matching and a one-tap Skip.'

export const KEYWORDS = [
  'Omechat', 'omechat.in', 'Omechat Omegle', 'Omechat video chat', 'Omechat text chat', 'omechat alternative', 'omechat chat',
  'Omegle', 'omegle chat', 'omegle video chat', 'omegle text chat', 'omegle online', 'omegle free', 'omegle new', 'omegle com',
  'omegle alternative', 'best omegle alternative', 'omegle alternative no signup', 'omegle alternative India', 'omegle alternative free',
  'omegle alternative video chat', 'omegle alternative text chat', 'omegle alternative app', 'omegle alternative 2026',
  'omegle replacement', 'omegle ka alternative', 'omegle jaisi website', 'omegle jaisa chat', 'sites like omegle',
  'omegle like sites', 'websites like omegle', 'apps like omegle', 'chat like omegle', 'new omegle', 'random chat',
  'random text chat', 'random video chat', 'random chat India', 'random chat app', 'random chat online', 'talk to strangers',
  'chat with strangers', 'chat with strangers online', 'video chat with strangers', 'text chat with strangers', 'stranger chat',
  'anonymous chat', 'anonymous video chat', 'free chat no signup', 'chat without login', 'free random chat', 'online chat rooms',
  'meet new people online', 'same country chat', 'Indian random chat', 'chat with Indian strangers',
  'chat', 'stranger', 'strangers chat', 'chat random', 'talk to random people', 'talk to someone online', 'make new friends online',
  'omegle talk', 'omegle talk to strangers', 'omegle stranger chat', 'omegle random chat', 'omegle india', 'ome chat', 'omechat com',
  'free video chat with strangers', 'free text chat with strangers', 'chat with girls and boys online', 'random chat no login',
  'anonymous chat online', 'chat app without registration', 'hinglish chat', 'chat with Indians online',
]

export const OMEGLE_FAQ: FAQ[] = [
  { q: 'What is the best Omegle alternative?', a: 'The best Omegle alternative is one that is free, works in your browser, needs no signup and has real safety tools. Omechat offers random text and video chat, a Skip button, a Report button and a Same Country filter, for 18+ users only. If you search for Omegle, Omegle talk, Omegle alternatives or Ome chat, you can start on omechat.in in one tap, on mobile or laptop.' },
  { q: 'Is there an Omegle alternative with no signup?', a: 'Yes. Omechat is an Omegle alternative with no signup for text chat: continue anonymously and start a random chat in a few seconds without creating an account. Signing in with Google is optional, adds a profile, and is used for video chat.' },
  { q: 'Is there an Omegle alternative for India?', a: 'Yes. Turn on Same Country in Omechat and you will be matched only with people from India, so it works as a random chat India site and an Omegle alternative for Indian users. You can chat in English, Hindi or Hinglish, free on Android, iPhone and laptop.' },
  { q: 'Why did people look for Omegle alternatives?', a: 'Omegle shut down in November 2023, so many people started looking for Omegle alternatives: similar sites to talk to strangers, make new friends and have random video chat or text chat online. Omechat is built for the same need, with an 18+ rule and a Report button.' },
  { q: 'Does Omechat work on mobile?', a: 'Yes. Omechat works in the browser on Android and iPhone and on laptops, so there is no app to download. Open omechat.in, pick text chat or video chat, tap Start and talk to strangers for free.' },
  { q: 'Is Omegle back, and what replaced it?', a: 'Omegle closed in November 2023 and the original site is not available. Websites like Omegle, such as Omechat, took its place for people who want to talk to strangers online. Omechat is an independent site, not connected to Omegle, with random text chat, random video chat, a Skip button and a Report button.' },
  { q: 'What is stranger chat?', a: 'Stranger chat means talking to a random person you have never met, usually without sharing your name. On Omechat you tap Start, get matched with a stranger, chat by text or video, and tap Skip to meet someone else. Keep your personal details private and use Skip or Report if a chat feels wrong.' },
  { q: 'Can I chat with strangers without login or registration?', a: 'Yes. Text chat on Omechat works without login: continue anonymously, tap Start and chat with a stranger for free. Signing in with Google is optional and is used for a profile and for video chat.' },
  { q: 'Is Omechat free?', a: 'Yes. Omechat is free to use. There is no payment to start a random text chat or video chat. The site shows ads to cover its running costs.' },
  { q: 'Is text chat or video chat better?', a: 'Text chat is more private because it needs no camera or microphone, so it is the easiest way to start. Video chat is more personal because you see and hear the other person. You can use both on Omechat, and you can skip to a new stranger in either one.' },
  { q: 'How can I talk to strangers online safely?', a: 'Do not share your phone number, address, passwords, bank details or private photos. Never send money. Use Skip to leave any chat in one tap and Report to flag rule breakers. Remember that anyone can record their screen, and that Omechat is for adults aged 18 and above.' },
  { q: 'Does Omechat have chat rooms?', a: 'No. Omechat connects you one to one with a random stranger instead of putting you in a public room. Tap Start for a new person and Skip to move on, in text chat or video chat.' },
  { q: 'Can I make new friends on Omechat?', a: 'Yes. Many people use random chat to meet new people. If you sign in with Google you can send a friend request to someone you enjoyed talking to. Be kind, respect the other person, and never share private details too soon.' },
  { q: 'Can I chat in Hindi or Hinglish?', a: 'Yes. You can write in English, Hindi or Hinglish. Turn on Same Country if you want to be matched with people from India.' },
]

export const HOME_FAQ: FAQ[] = [
  { q: 'What is Omechat?', a: 'Omechat (omechat.in, also searched as Ome chat) is a free random chat website where you can talk to strangers online through text chat or video chat. Tap Start, get matched with a random person, and tap Skip to meet someone new. It works in your browser on mobile and laptop, with no app to install, for people aged 18 and above.' },
  { q: 'Do I need to sign up?', a: 'No. You can continue anonymously and start a text chat right away. Signing in with Google is optional: it lets you add a name, photo and age to your profile and is used for video chat.' },
  { q: 'Is Omechat an Omegle alternative?', a: 'Yes. If you used Omegle or searched for Omegle talk to strangers, Omechat gives you a similar way to meet new people online: random text and video chat, instant matching, a Skip button and a Report button. It is a free Omegle alternative available worldwide, including India. Omechat is an independent site and is not connected to Omegle.' },
  { q: 'Can I chat only with people from my country?', a: 'Yes. Turn on the Same Country option and you will only be matched with people from your own country, for example random chat India for Indian users. Turn it off to talk to strangers from all over the world. You can chat in English, Hindi or Hinglish.' },
  { q: 'Who can use Omechat?', a: 'You must be 18 or older. Explicit content, nudity, hate speech and harassment are not allowed, and you can report anyone from inside the chat. Do not share personal details with strangers, and use Skip to leave any chat that feels uncomfortable.' },
]

export const SAFETY_FAQ: FAQ[] = [
  { q: 'Is Omechat safe?', a: 'Omechat has safety tools: Skip leaves any chat in one tap, Report lets you flag a user in video chat, and spammers are blocked automatically. But like every random chat website, you talk to real strangers and no site can guarantee that every user is well behaved, so keep your personal details private and use Skip and Report whenever something feels wrong.' },
  { q: 'Can other users record my video chat?', a: 'Other users could record their own screen, so only show what you are comfortable with. A website cannot stop screen recording or screenshots on someone else\'s device.' },
  { q: 'What should I keep private on video chat?', a: 'Do not show private things. Other users may record their screen. Keep your ID, documents, home address, school or workplace details and private photos out of view, and never share personal details with a stranger. Use Skip to leave any chat in one tap and Report if someone breaks the rules.' },
  { q: 'What should I do if someone asks for money or threatens me?', a: 'Stop replying, do not send money, photos or videos, take a screenshot as proof, use Report and tell a trusted person. In India you can report cyber crime at cybercrime.gov.in or call 1930.' },
  { q: 'Is Omechat safe for minors?', a: 'No. Omechat is for people aged 18 and above only. You must confirm your age before you start, but we do not check ID, so parents and guardians should make sure children do not use random chat websites.' },
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
  {
    slug: 'chat-with-strangers',
    title: 'Chat with Strangers Online: Free, Anonymous | Omechat',
    description: 'Chat with strangers online for free on Omechat. Random text or video chat, no signup needed, Skip in one tap, Report button and 18+ rules.',
    h1: 'Chat with strangers online, free and anonymous',
    intro: 'Want to chat with strangers online? Omechat pairs you with a random person in seconds. Type a message or switch on your camera, and tap Skip whenever you want someone new.',
    steps: ['Open Omechat and choose Text Chat or Video Chat.', 'Continue anonymously. No account is needed for text chat.', 'Tap Start to meet a stranger and Skip to meet the next one.'],
    points: [
      { title: 'Anonymous by default', text: 'You do not need to give your name, phone number or email to start a text chat.' },
      { title: 'One to one chats', text: 'You talk to one stranger at a time, not a crowded public room.' },
      { title: 'You can leave anytime', text: 'Skip ends a chat at once, and Report helps keep the site clean.' },
    ],
    faq: [
      { q: 'How do I chat with strangers on Omechat?', a: 'Open omechat.in, pick Text Chat or Video Chat, continue anonymously and tap Start. You are matched with a random person.' },
      { q: 'Is it free to chat with strangers here?', a: 'Yes. Omechat is free to use.' },
      { q: 'Can I stay anonymous?', a: 'Yes. Anonymous mode needs no name. Never share personal details with a stranger.' },
    ],
  },
  {
    slug: 'stranger-chat',
    title: 'Stranger Chat: Meet Random People Online Free | Omechat',
    description: 'Stranger chat made simple. Meet random people online with free text or video chat on Omechat. No signup for text chat, 18+ only, Skip anytime.',
    h1: 'Stranger chat: meet random people online',
    intro: 'Stranger chat is the simple idea of talking to someone you have never met. Omechat makes it quick: tap Start, say hi, and Skip if the chat is not for you.',
    steps: ['Open Omechat on your phone or laptop.', 'Pick text or video and tap Start.', 'Chat, Skip or Report. You decide how long each chat lasts.'],
    points: [
      { title: 'Fast matching', text: 'You are connected to a random stranger as soon as one is available.' },
      { title: 'Text or video', text: 'Type if you want privacy, or use video if you want to see who you talk to.' },
      { title: 'Rules for everyone', text: 'Explicit content, hate and harassment are not allowed, and spammers are blocked automatically.' },
    ],
    faq: [
      { q: 'What is a stranger chat site?', a: 'It is a website where you are matched with a random person to talk to. Omechat is one, with text chat and video chat.' },
      { q: 'Is stranger chat safe?', a: 'No random chat is risk free. Keep your details private, never send money and use Skip or Report when something feels wrong.' },
      { q: 'Who can use Omechat?', a: 'Only people aged 18 and above.' },
    ],
  },
  {
    slug: 'omegle-video-chat',
    title: 'Omegle Video Chat Alternative: Free Random Video Chat | Omechat',
    description: 'Looking for Omegle video chat? Omechat is a free random video chat alternative with split-screen video, one-tap Next and a Report button. 18+ only.',
    h1: 'Omegle video chat alternative for your phone',
    intro: 'If you used Omegle for video chat, Omechat gives you a similar way to meet new people face to face. See a stranger on the top half of your screen, yourself on the bottom half, and tap Next for someone new. Omechat is an independent site and is not connected to Omegle.',
    steps: ['Open Video Chat and allow your camera and microphone.', 'Tap Start to be matched with a stranger.', 'Tap Next to meet someone else, or Report if someone breaks the rules.'],
    points: [
      { title: 'Made for phones', text: 'The split-screen layout fits a phone screen, in the browser, with no app to install.' },
      { title: 'Own controls', text: 'Mute, camera off and flip camera only change your own video.' },
      { title: 'Report and block', text: 'Report anyone who breaks the rules and you will not be matched with them again.' },
    ],
    faq: [
      { q: 'Is there a free Omegle video chat alternative?', a: 'Yes. Omechat offers free random video chat with strangers in your browser.' },
      { q: 'Do I need to install an app?', a: 'No. Omechat works in the browser on Android, iPhone and laptops.' },
      { q: 'Can someone record my video?', a: 'Other users could record their own screen, so only show what you are comfortable with. Do not show private things.' },
    ],
  },
  {
    slug: 'omegle-text-chat',
    title: 'Omegle Text Chat Alternative: Free Random Text Chat | Omechat',
    description: 'Omegle text chat alternative. Free random text chat with strangers on Omechat. No signup, typing indicator, chat themes, Skip anytime. 18+ only.',
    h1: 'Omegle text chat alternative, no signup',
    intro: 'Missing Omegle text chat? Omechat lets you type to a random stranger without a camera, an account or an app. You see when they are typing, and you can Skip to a new person in one tap. Omechat is not connected to Omegle.',
    steps: ['Open Text Chat on Omechat.', 'Tap Start and wait a moment for a stranger.', 'Type your message. Tap Skip, then Really, to move on.'],
    points: [
      { title: 'No camera needed', text: 'Text chat uses no camera and no microphone.' },
      { title: 'Typing indicator', text: 'You can see when the stranger is writing a reply.' },
      { title: 'Themes', text: 'Choose a Black, White or picture theme for your own screen.' },
    ],
    faq: [
      { q: 'Is there an Omegle text chat alternative with no signup?', a: 'Yes. Omechat text chat works without signup. Continue anonymously and tap Start.' },
      { q: 'Can I chat in Hindi?', a: 'Yes, in English, Hindi or Hinglish.' },
      { q: 'What if the stranger leaves?', a: 'You see a short message and can press Start for a new chat.' },
    ],
  },
  {
    slug: 'anonymous-chat',
    title: 'Anonymous Chat Online: Free, No Login | Omechat',
    description: 'Free anonymous chat online. Talk to a random stranger with text or video on Omechat without login or registration. 18+ only, Skip and Report included.',
    h1: 'Anonymous chat online, no login needed',
    intro: 'Anonymous chat lets you talk without showing who you are. On Omechat you can start a random text chat without an account, a name or an email address.',
    steps: ['Open Omechat and choose Text Chat.', 'Continue anonymously.', 'Tap Start and chat. Tap Skip to leave at any time.'],
    points: [
      { title: 'No account for text chat', text: 'Start straight away. Signing in with Google is optional.' },
      { title: 'Keep it private', text: 'Do not share your phone number, address, passwords or private photos.' },
      { title: 'Be respectful', text: 'Everyone must follow the guidelines, and rule breakers can be reported.' },
    ],
    faq: [
      { q: 'Is Omechat really anonymous?', a: 'You do not need to give a name to use text chat. Other people only see what you choose to type or show, but no website can promise perfect anonymity, so stay careful.' },
      { q: 'Do I need to log in?', a: 'No. Login is optional.' },
      { q: 'Can I chat without registration?', a: 'Yes. Text chat works without registration.' },
    ],
  },
  {
    slug: 'meet-new-people-online',
    title: 'Meet New People Online: Free Random Chat | Omechat',
    description: 'Meet new people online with free random text and video chat on Omechat. Make new friends, no signup for text chat, Same Country filter, 18+ only.',
    h1: 'Meet new people online and make new friends',
    intro: 'Meeting new people online can start with one hello. Omechat matches you with a random person for text or video chat, and users who sign in with Google can send a friend request after a good conversation.',
    steps: ['Open Omechat and pick Text Chat or Video Chat.', 'Tap Start and say hello.', 'Enjoyed the chat? Sign in with Google to send a friend request.'],
    points: [
      { title: 'Easy start', text: 'No app and no signup for text chat. Open the site and tap Start.' },
      { title: 'Same Country', text: 'Turn it on to meet people from your own country, for example India.' },
      { title: 'Friend requests', text: 'Signed-in users can send each other friend requests.' },
    ],
    faq: [
      { q: 'How can I meet new people on Omechat?', a: 'Tap Start in text chat or video chat and you are matched with a random person. Tap Skip to meet someone else.' },
      { q: 'Can I add someone as a friend?', a: 'Yes, if both of you are signed in with Google you can send a friend request.' },
      { q: 'Is Omechat only for adults?', a: 'Yes. You must be 18 or older.' },
    ],
  },
]

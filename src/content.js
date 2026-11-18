// All page text lives here so it is easy to review and change.
// Source: Saeed's resume (Nov 2026) + HANDOVER.md. Items marked TODO need Saeed's confirmation.

export const profile = {
  name: 'Saeed J. Hareez',
  line: 'Founder-developer building learning platforms that connect Saudi Arabia and Indonesia.',
  headline: ['I build learning platforms.', 'From Saudi Arabia to Indonesia.'],
  sub: 'Co-founder of JISR · Web developer & international coordinator at Markaz Tadarus · Jakarta, Indonesia',
  email: 'saeedhareez@gmail.com',
  linkedin: 'https://www.linkedin.com/in/saeed-hareez-398685288',
  github: 'https://github.com/Archaick',
}

export const projects = [
  {
    id: 'jisr',
    flag: 'Flagship · Co-founder',
    name: 'JISR',
    tagline: 'An online Arabic programme for Indonesians',
    url: 'https://ar-jisr.web.app',
    host: 'ar-jisr.web.app',
    stat: { value: '140+', label: 'active students in the first cohort' },
    problem:
      'Indonesians who want to learn Arabic had few structured, affordable online programmes built for them.',
    built: [
      'A complete learning platform, built end to end as the sole developer',
      'Arabic right-to-left support alongside Indonesian',
      'Online payments and built-in accounting',
    ],
    stack: ['React', 'Firebase', 'JavaScript', 'Tailwind CSS'],
    demo: 'quiz',
  },
  {
    id: 'tadarus',
    flag: 'Markaz Tadarus Indonesia',
    name: 'Belajar 5T & Tadarus Global',
    tagline: 'Teacher training in Indonesia, followed live from Saudi Arabia',
    url: 'https://markaztadarus.com',
    host: 'markaztadarus.com',
    stat: { value: '5', label: 'steps per lesson, a star for each one finished' },
    problem: 'Teachers in many schools needed one place to learn, and the programme team abroad needed to see their progress as it happens.',
    built: [
      'A five-step learning path for every lesson, with quizzes and audio',
      'Schools join by code; admins approve teachers and follow progress',
      'A live globe of every programme and who is learning right now',
    ],
    stack: ['React', 'Mantine', 'Firebase', 'd3-geo', 'PWA'],
    demo: 'globe',
  },
  {
    id: 'hijaz',
    flag: 'Foundation website & admin',
    name: 'Markaz Al-Hijaz',
    tagline: 'A foundation’s site where every certificate can be checked in one scan',
    url: 'https://markazalhijaz.org',
    host: 'markazalhijaz.org',
    stat: { value: '1 scan', label: 'to prove a printed certificate is genuine' },
    problem: 'The foundation issues many certificates, and whoever receives one needs to know it is real.',
    built: [
      'Certificates issued in bulk from Excel, with signatures, stamps and a QR code that is checked live',
      'A form builder with quizzes, file uploads and printable PDF answers',
      'News, donations, short links and a globe of programmes',
      'Admin roles, change history and a recycle bin, in Indonesian, English and Arabic',
    ],
    stack: ['Next.js', 'next-intl', 'Mantine', 'Firebase'],
    demo: 'cert',
  },
]

export const smallBuilds = []

// Logos come from Saeed's other projects (hijaz/public/partners). Waqf Al-I'jaz has no
// logo on file, so it shows its Arabic name. TODO: confirm the Riau and Gontor logos.
export const partnerships = [
  {
    kind: 'Educational cooperation',
    a: { name: 'Riau University', place: 'Indonesia', logo: 'uir' },
    b: { name: 'Waqf Al-I’jaz', place: 'Istanbul', ar: 'وقف الإعجاز' },
  },
  {
    kind: 'Higher-education cooperation',
    a: { name: 'YARSI University', place: 'Indonesia', logo: 'yarsi' },
    b: { name: 'Waqf Al-I’jaz', place: 'Istanbul', ar: 'وقف الإعجاز' },
  },
  {
    kind: 'Higher-education partnership',
    a: { name: 'UNIDA Gontor', place: 'Indonesia', logo: 'unida' },
    b: { name: 'Hidayaa', place: 'Makkah', logo: 'hidayaa' },
  },
]

export const experience = [
  { role: 'Web Developer & International Relations Coordinator', org: 'Markaz Tadarus Indonesia', when: '2025 – now', where: 'Jakarta' },
  { role: 'Co-founder & sole developer', org: 'JISR', when: '', where: 'Online' }, // TODO: confirm start year
  { role: 'Language Consultant & Linguistic QA Analyst', org: 'Appen', when: '2019 – 2023', where: 'Saudi Arabia', note: 'Saudi-Hijazi Arabic localisation and QA for AI speech and text data.' },
]

export const education = [
  { name: 'BSc Computer Science', org: 'University of the People', when: '2021 – 2024' },
  { name: 'Humanitarian Coordination & Information Management', org: 'UNICEF', when: '2026' },
  { name: 'Google IT Support', org: 'Coursera', when: '' },
]

export const skills = [
  'React', 'Next.js', 'Firebase & Firestore rules', 'JavaScript', 'Tailwind CSS', 'Mantine',
  'Multilingual & RTL sites', 'PWAs', 'Admin systems with audit trails', 'Role-based access',
  'Payments & accounting flows',
]

export const languages = [
  { name: 'Arabic', level: 'Native' },
  { name: 'English', level: 'Fluent' },
  { name: 'Indonesian', level: 'Intermediate' },
]

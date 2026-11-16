// All page text lives here so it is easy to review and change.
// Source: Saeed's resume (Nov 2026) + HANDOVER.md. Items marked TODO need Saeed's confirmation.

export const profile = {
  name: 'Saeed J. Hareez',
  line: 'Founder-developer building learning platforms for Arabic and Qur’anic education.',
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
    tagline: 'Arabic learning platform for Indonesians',
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
    name: 'Belajar 5T',
    tagline: 'Teacher learning platform for Qur’an schools',
    url: 'https://markaztadarus.com',
    host: 'markaztadarus.com',
    stat: { value: '3', label: 'languages — Indonesian, English, Arabic (full RTL)' },
    problem:
      'Qur’an teachers across many schools needed one place to learn, be assessed and be followed up — without paperwork.',
    built: [
      'Schools join with a code; admins approve teachers',
      'Lessons with quizzes in 10+ question types and progress tracking',
      'Qur’an recitation ayah by ayah, live highlighting and a choice of reciters',
      'Audit history, recycle bin and “view as teacher” for admins',
    ],
    stack: ['React', 'Mantine', 'Firebase', 'PWA'],
  },
  {
    id: 'global',
    flag: 'Markaz Tadarus Indonesia',
    name: 'Tadarus Global',
    tagline: 'Every country running Tadarus, on one living globe',
    url: 'https://markaztadarus.com/global',
    host: 'markaztadarus.com/global',
    stat: null,
    problem:
      'Partners and donors needed to see at a glance where Tadarus reaches — and that it all traces back to Makkah.',
    built: [
      'A globe drawn from map data, turned by drag, pinch or scroll',
      'Programme countries lit in gold and joined to Makkah by a line of light',
      'Real-time day and night, the true Sun and Moon, and live session markers',
      'Close up, Indonesia’s provinces with their programme counts',
    ],
    stack: ['React', 'd3-geo', 'TopoJSON', 'Firebase'],
    demo: 'globe',
  },
  {
    id: 'hijaz',
    flag: 'Institute website',
    name: 'Markaz Al-Hijaz',
    tagline: 'Multilingual institute site with admin tools',
    url: null, // TODO: confirm public URL
    host: 'markaz-al-hijaz',
    stat: null, // TODO: an outcome number from Saeed
    problem: 'The institute needed a fast public site that staff could update themselves.',
    built: [
      'Static-exported Next.js site with multiple languages',
      'Admin tools for news, forms and activity logs',
    ],
    stack: ['Next.js', 'next-intl', 'Firebase'],
  },
]

export const smallBuilds = [
  {
    name: 'Bulk certificate system',
    text: 'Hundreds of certificates from one Excel file — each with a QR code for public online verification, signatures, stamps and print-ready PDFs.',
  },
  {
    name: 'Belajar 5T recitation player',
    text: 'Qur’an recitation ayah by ayah with the current ayah highlighted live, and a choice of reciters.',
  },
]

export const partnerships = [
  { a: 'Riau University', b: 'Waqf Al-I’jaz, Istanbul', kind: 'Educational cooperation agreement' },
  { a: 'YARSI University', b: 'Waqf Al-I’jaz, Istanbul', kind: 'Higher-education cooperation agreement' },
  { a: 'University of Darussalam Gontor', b: 'Hidayaa, Makkah', kind: 'Higher-education partnership agreement' },
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

// Synthetic starting dataset. Modelled on the Kaggle "Updated Resume Dataset"
// (gauravduttakiit/resume-dataset): plain-text resumes grouped by job category.
// Real Kaggle rows can be dropped in through the Ingest screen at runtime.

import { parseResumeText, atsCheck, matchCandidateToJob, decideShortlist } from './screening';

const AGENCY = {
  id: 'agency',
  name: 'Hiring Intelligence',
  tagline: 'Recruitment screening, run for you',
};

const ADMIN_USER = {
  id: 'usr_admin',
  email: 'ishwari@hiringintelligence.io',
  password: 'password123',
  name: 'Ishwari Kshirsagar',
  role: 'ADMIN',
  companyId: null,
  title: 'Founder & Lead Recruiter',
};

const COMPANIES = [
  {
    id: 'cmp_northwind',
    name: 'Northwind Logistics',
    industry: 'Logistics & Supply Chain',
    location: 'Pune, IN',
    contactName: 'Rajesh Iyer',
    contactEmail: 'rajesh.iyer@northwind.example',
    createdAt: '2026-06-02T09:00:00Z',
  },
  {
    id: 'cmp_lumen',
    name: 'Lumen Retail',
    industry: 'E-commerce',
    location: 'Bengaluru, IN',
    contactName: 'Sara Thomas',
    contactEmail: 'sara.thomas@lumenretail.example',
    createdAt: '2026-06-18T09:00:00Z',
  },
  {
    id: 'cmp_atlas',
    name: 'Atlas Analytics',
    industry: 'Data & BI Consulting',
    location: 'Mumbai, IN',
    contactName: 'Vivek Menon',
    contactEmail: 'vivek.menon@atlasanalytics.example',
    createdAt: '2026-07-05T09:00:00Z',
  },
];

const CLIENT_USERS = [
  { id: 'usr_northwind', email: 'rajesh.iyer@northwind.example', password: 'password123', name: 'Rajesh Iyer', role: 'RECRUITER', companyId: 'cmp_northwind', title: 'Head of Talent' },
  { id: 'usr_lumen', email: 'sara.thomas@lumenretail.example', password: 'password123', name: 'Sara Thomas', role: 'RECRUITER', companyId: 'cmp_lumen', title: 'Recruitment Lead' },
  { id: 'usr_atlas', email: 'vivek.menon@atlasanalytics.example', password: 'password123', name: 'Vivek Menon', role: 'RECRUITER', companyId: 'cmp_atlas', title: 'Engineering Manager' },
];

const JOBS = [
  {
    id: 'job_nw_backend',
    companyId: 'cmp_northwind',
    title: 'Senior Backend Engineer',
    description:
      'Design and run the microservices behind our shipment tracking platform. You will own service boundaries, database schema, and the event pipeline that keeps depots in sync.',
    requiredSkills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Kafka', 'AWS'],
    minExperience: 4,
    maxExperience: 8,
    status: 'OPEN',
    createdAt: '2026-07-20T09:00:00Z',
  },
  {
    id: 'job_nw_devops',
    companyId: 'cmp_northwind',
    title: 'DevOps Engineer',
    description:
      'Own CI/CD, container orchestration and cloud infrastructure across our fleet. Kubernetes and infrastructure-as-code are day-to-day tools here.',
    requiredSkills: ['Kubernetes', 'AWS', 'Docker', 'Terraform', 'CI/CD', 'Linux'],
    minExperience: 3,
    maxExperience: 7,
    status: 'OPEN',
    createdAt: '2026-07-22T09:00:00Z',
  },
  {
    id: 'job_lumen_frontend',
    companyId: 'cmp_lumen',
    title: 'Frontend Engineer',
    description:
      'Build the storefront and the internal merchandising console. Strong React fundamentals, an eye for accessible UI, and comfort with a design system.',
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'REST APIs'],
    minExperience: 2,
    maxExperience: 5,
    status: 'OPEN',
    createdAt: '2026-07-28T09:00:00Z',
  },
  {
    id: 'job_lumen_fullstack',
    companyId: 'cmp_lumen',
    title: 'Full Stack Engineer',
    description:
      'Ship features end to end across a Node.js API and a React frontend. You will work close to product and move quickly.',
    requiredSkills: ['Node.js', 'React', 'JavaScript', 'PostgreSQL', 'REST APIs', 'AWS'],
    minExperience: 3,
    maxExperience: 6,
    status: 'OPEN',
    createdAt: '2026-08-04T09:00:00Z',
  },
  {
    id: 'job_lumen_mobile',
    companyId: 'cmp_lumen',
    title: 'Android Engineer',
    description:
      'Own the customer Android app. Kotlin, Jetpack Compose, and a track record of shipping in the Play Store.',
    requiredSkills: ['Kotlin', 'Android', 'Java', 'REST APIs', 'Git'],
    minExperience: 2,
    maxExperience: 6,
    status: 'OPEN',
    createdAt: '2026-08-10T09:00:00Z',
  },
  {
    id: 'job_atlas_data',
    companyId: 'cmp_atlas',
    title: 'Data Analyst',
    description:
      'Turn client operational data into dashboards and readouts leadership can act on. SQL fluency and a strong grip on statistics required.',
    requiredSkills: ['SQL', 'Python', 'Data Analysis', 'Tableau', 'Statistics', 'Excel'],
    minExperience: 1,
    maxExperience: 4,
    status: 'OPEN',
    createdAt: '2026-08-06T09:00:00Z',
  },
  {
    id: 'job_atlas_de',
    companyId: 'cmp_atlas',
    title: 'Data Engineer',
    description:
      'Build and maintain the ingestion and transformation pipelines feeding our analytics warehouse. Spark and Airflow experience expected.',
    requiredSkills: ['Python', 'SQL', 'Spark', 'Airflow', 'ETL', 'AWS'],
    minExperience: 3,
    maxExperience: 7,
    status: 'OPEN',
    createdAt: '2026-08-12T09:00:00Z',
  },
  {
    id: 'job_atlas_ml',
    companyId: 'cmp_atlas',
    title: 'Machine Learning Engineer',
    description:
      'Take models from notebook to production for our forecasting product. Solid Python, ML fundamentals, and an appetite for MLOps.',
    requiredSkills: ['Python', 'Machine Learning', 'Deep Learning', 'SQL', 'AWS', 'Docker'],
    minExperience: 2,
    maxExperience: 6,
    status: 'OPEN',
    createdAt: '2026-08-15T09:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Candidate pool — generated from templates into plain resume text so the
// parser, ATS check and matcher all run on realistic input at seed time.
// ---------------------------------------------------------------------------

const COLLEGES = [
  'IIT Bombay', 'VJTI Mumbai', 'BITS Pilani', 'NIT Trichy', 'COEP Pune',
  'Delhi Technological University', 'IIIT Hyderabad', 'PICT Pune', 'SPIT Mumbai', 'VIT Vellore',
];
const CITIES = ['Pune, IN', 'Mumbai, IN', 'Bengaluru, IN', 'Hyderabad, IN', 'Remote, IN'];
const FIRST_NAMES = [
  'Ananya', 'Vikram', 'Sneha', 'Karan', 'Divya', 'Arjun', 'Neha', 'Rohit', 'Priya', 'Aditya',
  'Meera', 'Rahul', 'Kavya', 'Yash', 'Simran', 'Nikhil', 'Pooja', 'Ishaan', 'Tanvi', 'Aryan',
  'Riya', 'Siddharth', 'Ayesha', 'Manish', 'Isha', 'Varun', 'Nandini', 'Harsh', 'Sana', 'Devansh',
];
const LAST_NAMES = [
  'Rao', 'Mehta', 'Iyer', 'Malhotra', 'Nair', 'Kapoor', 'Joshi', 'Bansal', 'Sharma', 'Verma',
  'Pillai', 'Deshmukh', 'Reddy', 'Agarwal', 'Kaur', 'Bhat', 'Menon', 'Chatterjee', 'Gupta', 'Shetty',
];

// profile blueprints: skill sets that mirror the Kaggle category labels
const PROFILES = [
  { category: 'Java Backend', core: ['Java', 'Spring Boot', 'Hibernate', 'REST APIs', 'PostgreSQL', 'Microservices'], extra: ['Kafka', 'AWS', 'Docker', 'JUnit', 'System Design', 'Redis'], expRange: [2, 11], degree: 'B.Tech Computer Science' },
  { category: 'Frontend', core: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'REST APIs'], extra: ['Redux', 'Next.js', 'Tailwind CSS', 'Figma', 'Git'], expRange: [1, 8], degree: 'B.E. Information Technology' },
  { category: 'Full Stack', core: ['Node.js', 'Express', 'React', 'JavaScript', 'MongoDB', 'REST APIs'], extra: ['TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL'], expRange: [2, 9], degree: 'B.Tech Computer Engineering' },
  { category: 'DevOps', core: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Linux'], extra: ['Jenkins', 'Ansible', 'Python', 'Git', 'GCP'], expRange: [2, 10], degree: 'B.Tech Electronics & Communication' },
  { category: 'Data Analyst', core: ['SQL', 'Python', 'Data Analysis', 'Excel', 'Statistics', 'Tableau'], extra: ['Power BI', 'PostgreSQL', 'Machine Learning'], expRange: [0, 5], degree: 'M.Sc Statistics' },
  { category: 'Data Engineer', core: ['Python', 'SQL', 'Spark', 'Airflow', 'ETL', 'AWS'], extra: ['Hadoop', 'Kafka', 'PostgreSQL', 'Docker'], expRange: [2, 9], degree: 'B.Tech Computer Science' },
  { category: 'Machine Learning', core: ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'SQL', 'Statistics'], extra: ['AWS', 'Docker', 'Data Analysis'], expRange: [1, 7], degree: 'M.Tech Artificial Intelligence' },
  { category: 'Mobile', core: ['Kotlin', 'Android', 'Java', 'REST APIs', 'Git'], extra: ['Swift', 'System Design', 'CI/CD'], expRange: [1, 8], degree: 'B.E. Computer Science' },
  { category: 'QA Automation', core: ['Selenium', 'Java', 'JUnit', 'CI/CD', 'Git'], extra: ['Python', 'REST APIs', 'Jira'], expRange: [1, 7], degree: 'B.Sc Computer Science' },
  { category: 'Engineering Manager', core: ['Leadership', 'Agile', 'System Design', 'Java', 'Microservices'], extra: ['AWS', 'Product Management', 'Jira'], expRange: [7, 15], degree: 'B.Tech Computer Science' },
];

function mulberry32(seed) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function sample(rng, arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
}

function buildResumeText(person) {
  return [
    person.name,
    `${person.email} | ${person.phone} | ${person.city}`,
    '',
    'SUMMARY',
    `${person.category} professional with ${person.years} years of experience. ` +
      `Hands-on with ${person.skills.slice(0, 4).join(', ')}. ${person.blurb}`,
    '',
    'SKILLS',
    person.skills.join(', '),
    '',
    'EXPERIENCE',
    `${person.employer} — ${person.roleTitle} (${person.years} years)`,
    `- Delivered production work across ${person.skills.slice(0, 3).join(', ')}.`,
    `- Collaborated with product and QA in an Agile team.`,
    '',
    'EDUCATION',
    `${person.degree}, ${person.college}`,
  ].join('\n');
}

const BLURBS = [
  'Comfortable owning a service from design through on-call.',
  'Enjoys mentoring juniors and tightening the review process.',
  'Has led migrations with zero customer-facing downtime.',
  'Strong bias toward automated testing and clean interfaces.',
  'Works well directly with stakeholders to scope ambiguous problems.',
];
const EMPLOYERS = ['Finmark Systems', 'Cobalt Software', 'Greytail Labs', 'Meridian Tech', 'Orbit Commerce', 'BlueRiver Digital'];

function buildCandidatePool() {
  const rng = mulberry32(20260830);
  const people = [];
  const total = 52;

  for (let i = 0; i < total; i += 1) {
    const profile = PROFILES[i % PROFILES.length];
    const first = pick(rng, FIRST_NAMES);
    const last = pick(rng, LAST_NAMES);
    const name = `${first} ${last}`;
    const handle = `${first}.${last}`.toLowerCase();
    const [lo, hi] = profile.expRange;
    const years = lo + Math.floor(rng() * (hi - lo + 1));

    // Most candidates get the full core skill set; some are deliberately partial
    // so match scores spread out and the ATS check has something to flag.
    const coverage = rng();
    const coreCount = coverage > 0.7 ? profile.core.length : Math.max(2, Math.round(profile.core.length * (0.4 + coverage * 0.5)));
    const skills = [
      ...sample(rng, profile.core, coreCount),
      ...sample(rng, profile.extra, Math.floor(rng() * 3)),
    ];

    const person = {
      name,
      email: rng() > 0.06 ? `${handle}${i}@example.com` : '', // a few missing emails -> ATS flag
      phone: rng() > 0.12 ? `+91 ${90000 + Math.floor(rng() * 9999)} ${10000 + Math.floor(rng() * 89999)}` : '',
      city: pick(rng, CITIES),
      category: profile.category,
      years,
      skills: [...new Set(skills)],
      degree: rng() > 0.1 ? profile.degree : '',
      college: pick(rng, COLLEGES),
      employer: pick(rng, EMPLOYERS),
      roleTitle: profile.category === 'Engineering Manager' ? 'Engineering Manager' : `${profile.category} Engineer`,
      blurb: pick(rng, BLURBS),
    };
    person.rawText = buildResumeText(person);
    people.push(person);
  }
  return people;
}

// ---------------------------------------------------------------------------

export function buildSeed() {
  const now = new Date().toISOString();

  const companies = COMPANIES.map((c) => ({ ...c }));
  const users = [ADMIN_USER, ...CLIENT_USERS].map((u) => ({ ...u }));
  const jobs = JOBS.map((j) => ({ ...j }));

  const pool = buildCandidatePool();
  const candidates = pool.map((person, idx) => {
    const parsed = parseResumeText(person.rawText, { fileName: `${person.name.replace(/\s+/g, '_')}.txt`, fallbackName: person.name });
    // trust the generated structured fields where the parser is intentionally lossy
    const merged = {
      ...parsed,
      name: person.name,
      skills: person.skills,
      experienceYears: person.years,
      education: person.degree ? `${person.degree}, ${person.college}` : parsed.education,
      category: person.category,
    };
    const ats = atsCheck(merged);
    // spread ingestion dates across the last ~5 months so trends have shape
    const daysAgo = 3 + Math.floor((idx / pool.length) * 150) + (idx % 7);
    return {
      id: `cnd_${idx + 1}`,
      ...merged,
      ...ats,
      createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    };
  });

  // Run screening: every candidate against every open job.
  const matches = [];
  for (const job of jobs) {
    if (job.status !== 'OPEN') continue;
    const jobMatches = candidates.map((cand) => {
      const result = matchCandidateToJob(cand, job);
      return {
        jobId: job.id,
        candidateId: cand.id,
        ...result,
        createdAt: now,
      };
    });
    const ranked = decideShortlist(jobMatches);
    ranked.forEach((m, i) => {
      matches.push({ id: `mch_${job.id}_${m.candidateId}`, ...m, rank: i + 1 });
    });
  }

  return {
    companies,
    users,
    jobs,
    candidates,
    matches,
    meta: { seededAt: now, agency: AGENCY },
  };
}

export { AGENCY };

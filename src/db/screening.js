import { extractSkills } from './skills';

// ---------------------------------------------------------------------------
// Resume parsing
// ---------------------------------------------------------------------------
// The demo cannot read binary PDFs in the browser, so ingestion works on plain
// resume text (the shape the Kaggle "Updated Resume Dataset" ships in). The real
// backend replaces this with an AI extraction call; the output contract is the
// same object below.

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /\+?\d{2}[\s-]?\d{5}[\s-]?\d{5}/;
const YEARS_RE = /(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)?/i;

const DEGREE_KEYWORDS = [
  'B.Tech', 'BTech', 'B.E.', 'BE ', 'B.Sc', 'BSc', 'BCA', 'B.Com',
  'M.Tech', 'MTech', 'M.E.', 'M.Sc', 'MSc', 'MCA', 'MBA', 'PhD', 'Ph.D',
];

function guessName(text, fallback) {
  const firstLine = text.split(/\r?\n/).map((l) => l.trim()).find((l) => l.length > 0);
  if (firstLine && /^[A-Za-z][A-Za-z.'-]+(?:\s+[A-Za-z][A-Za-z.'-]+){1,3}$/.test(firstLine) && firstLine.length <= 40) {
    return firstLine;
  }
  return fallback;
}

function guessEducation(text) {
  for (const kw of DEGREE_KEYWORDS) {
    const idx = text.toLowerCase().indexOf(kw.toLowerCase());
    if (idx !== -1) {
      const slice = text.slice(idx, idx + 90).split(/\r?\n/)[0].trim();
      return slice.replace(/[;,.]$/, '');
    }
  }
  return '';
}

export function parseResumeText(rawText, { fileName = 'resume.txt', fallbackName } = {}) {
  const text = String(rawText || '');
  const email = (text.match(EMAIL_RE) || [''])[0].toLowerCase();
  const phone = (text.match(PHONE_RE) || [''])[0].trim();
  const yearsMatch = text.match(YEARS_RE);
  const experienceYears = yearsMatch ? Math.min(40, Math.round(parseFloat(yearsMatch[1]))) : 0;
  const skills = extractSkills(text);
  const name = guessName(text, fallbackName || fileName.replace(/\.[a-z]+$/i, '').replace(/[_-]+/g, ' '));

  const summarySource = text.replace(/\s+/g, ' ').trim();
  const resumeSummary = summarySource.length > 320 ? `${summarySource.slice(0, 317)}...` : summarySource;

  return {
    name,
    email,
    phone,
    skills,
    experienceYears,
    education: guessEducation(text),
    resumeSummary,
    rawText: text,
    sourceFile: fileName,
  };
}

// ---------------------------------------------------------------------------
// ATS completeness check
// ---------------------------------------------------------------------------
// Scores how machine-readable / complete a parsed resume is (0-100). This is a
// gate on data quality, not on candidate quality.

export function atsCheck(candidate) {
  const checks = [
    { ok: !!candidate.email, weight: 20, flag: 'No email address found' },
    { ok: !!candidate.phone, weight: 10, flag: 'No phone number found' },
    { ok: (candidate.skills?.length || 0) >= 3, weight: 30, flag: 'Fewer than 3 recognised skills' },
    { ok: (candidate.experienceYears || 0) > 0, weight: 20, flag: 'Years of experience not stated' },
    { ok: !!candidate.education, weight: 10, flag: 'No education section detected' },
    { ok: (candidate.rawText?.length || 0) >= 200, weight: 10, flag: 'Resume text unusually short' },
  ];
  const score = checks.reduce((sum, c) => sum + (c.ok ? c.weight : 0), 0);
  const flags = checks.filter((c) => !c.ok).map((c) => c.flag);
  return { atsScore: score, atsFlags: flags, atsPassed: score >= 60 };
}

// ---------------------------------------------------------------------------
// Candidate <-> job matching
// ---------------------------------------------------------------------------
// matchScore = skill coverage (70) + experience fit (30).

export function experienceFit(years, min, max) {
  const lo = Number(min) || 0;
  const hi = Number(max) || lo + 3;
  if (years >= lo && years <= hi) return 1;
  if (years < lo) return Math.max(0, 1 - (lo - years) / Math.max(lo, 2));
  return Math.max(0, 1 - (years - hi) / Math.max(hi, 3));
}

export function matchCandidateToJob(candidate, job) {
  const required = job.requiredSkills || [];
  const candSkills = new Set((candidate.skills || []).map((s) => s.toLowerCase()));

  const matchedSkills = required.filter((s) => candSkills.has(s.toLowerCase()));
  const missingSkills = required.filter((s) => !candSkills.has(s.toLowerCase()));

  const coverage = required.length === 0 ? 0 : matchedSkills.length / required.length;
  const fit = experienceFit(candidate.experienceYears || 0, job.minExperience, job.maxExperience);

  const matchScore = Math.round(coverage * 70 + fit * 30);

  const explanation = buildExplanation(candidate, job, matchedSkills, missingSkills, fit);

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    explanation,
    experienceFitLabel: fit >= 0.99 ? 'Within range' : fit >= 0.6 ? 'Near range' : 'Outside range',
  };
}

function buildExplanation(candidate, job, matched, missing, fit) {
  const parts = [];
  if (matched.length) {
    parts.push(`Covers ${matched.length}/${job.requiredSkills.length} required skills (${matched.join(', ')}).`);
  } else {
    parts.push('None of the required skills were found on the resume.');
  }
  if (missing.length) parts.push(`Gaps: ${missing.join(', ')}.`);
  const years = candidate.experienceYears || 0;
  if (fit >= 0.99) parts.push(`${years} yrs experience sits inside the ${job.minExperience}-${job.maxExperience} yr window.`);
  else if (years < job.minExperience) parts.push(`${years} yrs experience is below the ${job.minExperience} yr minimum.`);
  else parts.push(`${years} yrs experience is above the ${job.maxExperience} yr ceiling.`);
  return parts.join(' ');
}

// Decides which matches become the shortlist for a job: score threshold plus a
// hard cap so a client always gets a focused list.
export function decideShortlist(matches, { minScore = 55, maxShortlist = 10 } = {}) {
  const ranked = [...matches].sort((a, b) => b.matchScore - a.matchScore);
  return ranked.map((m, index) => ({
    ...m,
    rank: index + 1,
    status: m.matchScore >= minScore && index < maxShortlist ? 'SHORTLISTED' : 'REVIEW',
  }));
}

// ---------------------------------------------------------------------------
// Interview question generation (skill-driven templates)
// ---------------------------------------------------------------------------
const QUESTION_TEMPLATES = {
  Java: 'Walk through how the JVM manages memory and when you last tuned garbage collection.',
  'Spring Boot': 'How do you structure configuration and profiles across environments in a Spring Boot service?',
  Microservices: 'How do you decide service boundaries, and how do you handle a distributed transaction across them?',
  React: 'How do you manage shared state and avoid unnecessary re-renders in a large React app?',
  'Node.js': 'Explain the event loop and a time you had to debug a blocked one.',
  AWS: 'Which AWS services have you run in production, and how did you manage cost versus scale?',
  Kubernetes: 'Describe a rollout strategy you have used and how you handled a bad deploy.',
  PostgreSQL: 'How do you approach a zero-downtime schema migration on a large table?',
  Kafka: 'How do you guarantee ordering and idempotency with Kafka consumers?',
  Python: 'When do you reach for async Python, and what are its limits?',
  'Machine Learning': 'How do you detect and correct for data leakage in a training pipeline?',
  Leadership: 'Describe how you handled an underperforming engineer on your team.',
  'System Design': 'Design a URL shortener and talk through the scaling bottlenecks.',
  Terraform: 'How do you structure Terraform modules and manage state for a team?',
  Docker: 'How do you keep production images small and secure?',
  SQL: 'Write a query to find the second-highest salary per department and explain the plan.',
};

export function generateInterviewQuestions(candidate) {
  const skillQs = (candidate.skills || [])
    .map((s) => QUESTION_TEMPLATES[s])
    .filter(Boolean)
    .slice(0, 5);

  const generic = [
    'Tell us about a project on your resume you are most proud of and your specific contribution.',
    `You list ${candidate.experienceYears || 0} years of experience — describe how your responsibilities changed over that time.`,
  ];

  return [...skillQs, ...generic].slice(0, 6);
}

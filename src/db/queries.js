// Higher-level reads/writes composed from the raw store. The API layer calls
// these so page components stay unaware of the persistence mechanism.

import { getAll, getById, where, insert, insertMany, update, removeWhere } from './store';
import {
  parseResumeText,
  atsCheck,
  matchCandidateToJob,
  decideShortlist,
  generateInterviewQuestions,
} from './screening';

// --- companies -------------------------------------------------------------

export function listCompanies() {
  const jobs = getAll('jobs');
  const matches = getAll('matches');
  return getAll('companies')
    .map((company) => {
      const jobIds = new Set(jobs.filter((j) => j.companyId === company.id).map((j) => j.id));
      return {
        ...company,
        openJobs: jobs.filter((j) => j.companyId === company.id && j.status === 'OPEN').length,
        totalJobs: jobIds.size,
        shortlistedCandidates: matches.filter((m) => jobIds.has(m.jobId) && m.status === 'SHORTLISTED').length,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCompany(id) {
  return getById('companies', id);
}

export function createCompany(payload) {
  return insert('companies', {
    name: payload.name,
    industry: payload.industry || '',
    location: payload.location || '',
    contactName: payload.contactName || '',
    contactEmail: payload.contactEmail || '',
  });
}

// --- jobs -----------------------------------------------------------------

function decorateJob(job) {
  const jobMatches = where('matches', (m) => m.jobId === job.id);
  return {
    ...job,
    companyName: getById('companies', job.companyId)?.name || 'Unknown company',
    applicantCount: jobMatches.length,
    shortlistedCount: jobMatches.filter((m) => m.status === 'SHORTLISTED').length,
  };
}

export function listJobs({ role, companyId } = {}) {
  let jobs = getAll('jobs');
  if (role === 'RECRUITER' && companyId) jobs = jobs.filter((j) => j.companyId === companyId);
  return jobs.map(decorateJob).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getJob(id) {
  const job = getById('jobs', id);
  return job ? decorateJob(job) : null;
}

export function createJob(payload, { companyId } = {}) {
  const job = insert('jobs', {
    companyId: payload.companyId || companyId,
    title: payload.title,
    description: payload.description,
    requiredSkills: payload.requiredSkills || [],
    minExperience: Number(payload.minExperience) || 0,
    maxExperience: Number(payload.maxExperience) || 0,
    status: payload.status || 'OPEN',
  });
  rescoreJob(job.id);
  return decorateJob(job);
}

export function updateJob(id, payload) {
  const patch = { ...payload };
  if (payload.minExperience != null) patch.minExperience = Number(payload.minExperience);
  if (payload.maxExperience != null) patch.maxExperience = Number(payload.maxExperience);
  const job = update('jobs', id, patch);
  rescoreJob(id);
  return job ? decorateJob(job) : null;
}

// --- matching / screening ------------------------------------------------

function stripTemp({ _prevStatus, _locked, ...row }) {
  return row;
}

// Recompute every candidate's match against one job and rebuild its shortlist,
// keeping any status a recruiter has manually locked (REJECTED / SHORTLISTED).
export function rescoreJob(jobId) {
  const job = getById('jobs', jobId);
  if (!job) return;
  const existing = where('matches', (m) => m.jobId === jobId);
  const byCandidate = new Map(existing.map((m) => [m.candidateId, m]));

  const scored = getAll('candidates').map((cand) => {
    const prev = byCandidate.get(cand.id);
    return {
      id: prev?.id || `mch_${jobId}_${cand.id}`,
      jobId,
      candidateId: cand.id,
      ...matchCandidateToJob(cand, job),
      createdAt: prev?.createdAt || new Date().toISOString(),
      _prevStatus: prev?.status,
      _locked: prev?.statusLocked || false,
    };
  });

  const ranked = decideShortlist(scored).map((m) =>
    m._locked ? stripTemp({ ...m, status: m._prevStatus, statusLocked: true }) : stripTemp(m)
  );

  removeWhere('matches', (m) => m.jobId === jobId);
  insertMany('matches', ranked);
}

export function setMatchStatus(jobId, candidateId, status) {
  const row = where('matches', (m) => m.jobId === jobId && m.candidateId === candidateId)[0];
  if (!row) return null;
  return update('matches', row.id, { status, statusLocked: status !== 'REVIEW' });
}

// --- candidates ---------------------------------------------------------

function withBestMatch(candidate, restrictJobIds) {
  let matches = where('matches', (m) => m.candidateId === candidate.id);
  if (restrictJobIds) matches = matches.filter((m) => restrictJobIds.has(m.jobId));
  const best = matches.reduce((acc, m) => (m.matchScore > (acc?.matchScore ?? -1) ? m : acc), null);
  return { ...candidate, matchCount: matches.length, bestMatchScore: best?.matchScore ?? null };
}

export function listCandidates({ role, companyId } = {}) {
  const candidates = getAll('candidates');
  if (role === 'ADMIN' || !companyId) {
    return candidates.map((c) => withBestMatch(c)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const jobIds = new Set(getAll('jobs').filter((j) => j.companyId === companyId).map((j) => j.id));
  const visibleIds = new Set(
    getAll('matches').filter((m) => jobIds.has(m.jobId) && m.matchScore >= 30).map((m) => m.candidateId)
  );
  return candidates
    .filter((c) => visibleIds.has(c.id))
    .map((c) => withBestMatch(c, jobIds))
    .sort((a, b) => (b.bestMatchScore || 0) - (a.bestMatchScore || 0));
}

export function getCandidate(id, { role, companyId } = {}) {
  const candidate = getById('candidates', id);
  if (!candidate) return null;

  let visibleJobIds = null;
  if (role === 'RECRUITER' && companyId) {
    visibleJobIds = new Set(getAll('jobs').filter((j) => j.companyId === companyId).map((j) => j.id));
  }

  const rawMatches = where('matches', (m) => m.candidateId === id).filter(
    (m) => !visibleJobIds || visibleJobIds.has(m.jobId)
  );
  // a recruiter may only open a candidate that surfaced for one of their jobs
  if (visibleJobIds && !rawMatches.some((m) => m.matchScore >= 30)) return null;

  const matches = rawMatches
    .map((m) => {
      const job = getById('jobs', m.jobId);
      return {
        ...m,
        jobTitle: job?.title || 'Removed job',
        companyName: getById('companies', job?.companyId)?.name || '',
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
  return { ...candidate, matches, interviewQuestions: generateInterviewQuestions(candidate) };
}

export function getJobRanking(jobId) {
  return where('matches', (m) => m.jobId === jobId)
    .map((m) => {
      const cand = getById('candidates', m.candidateId);
      return {
        matchId: m.id,
        candidateId: m.candidateId,
        name: cand?.name || 'Unknown',
        email: cand?.email || '',
        experienceYears: cand?.experienceYears ?? 0,
        skills: cand?.skills || [],
        atsScore: cand?.atsScore ?? 0,
        matchScore: m.matchScore,
        matchedSkills: m.matchedSkills,
        missingSkills: m.missingSkills,
        explanation: m.explanation,
        status: m.status,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

// --- ingestion --------------------------------------------------------

// Accepts already-parsed candidate objects OR { rawText } resume blobs.
export function ingestResumes(entries) {
  const prepared = entries.map((entry, i) => {
    const parsed =
      entry.rawText != null
        ? parseResumeText(entry.rawText, { fileName: entry.sourceFile || `upload_${i}.txt`, fallbackName: entry.name })
        : {};
    const base = {
      name: entry.name || parsed.name || `Candidate ${i + 1}`,
      email: entry.email ?? parsed.email ?? '',
      phone: entry.phone ?? parsed.phone ?? '',
      skills: entry.skills || parsed.skills || [],
      experienceYears: entry.experienceYears ?? parsed.experienceYears ?? 0,
      education: entry.education || parsed.education || '',
      resumeSummary: entry.resumeSummary || parsed.resumeSummary || '',
      rawText: entry.rawText || parsed.rawText || '',
      sourceFile: entry.sourceFile || parsed.sourceFile || `upload_${i}.txt`,
      category: entry.category || 'Uncategorised',
    };
    return { ...base, ...atsCheck(base) };
  });

  const inserted = insertMany('candidates', prepared);
  getAll('jobs')
    .filter((j) => j.status === 'OPEN')
    .forEach((j) => rescoreJob(j.id));

  return inserted.map((c) => ({
    id: c.id,
    name: c.name,
    skills: c.skills,
    experienceYears: c.experienceYears,
    education: c.education,
    atsScore: c.atsScore,
    atsFlags: c.atsFlags,
    sourceFile: c.sourceFile,
  }));
}

// --- analytics / dashboard --------------------------------------------------

function scope({ role, companyId } = {}) {
  const jobs = getAll('jobs');
  const scopedJobs = role === 'RECRUITER' && companyId ? jobs.filter((j) => j.companyId === companyId) : jobs;
  const jobIds = new Set(scopedJobs.map((j) => j.id));
  const matches = getAll('matches').filter((m) => jobIds.has(m.jobId));
  const candidateIds = new Set(matches.map((m) => m.candidateId));
  const candidatePool =
    role === 'ADMIN'
      ? getAll('candidates')
      : getAll('candidates').filter((c) => candidateIds.has(c.id));
  return { jobs: scopedJobs, matches, candidatePool };
}

export function dashboardSummary(ctx = {}) {
  const { jobs, matches } = scope(ctx);
  const scores = matches.map((m) => m.matchScore);
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((j) => ({
      id: j.id,
      title: j.title,
      companyName: getById('companies', j.companyId)?.name || '',
      requiredSkills: j.requiredSkills,
      minExperience: j.minExperience,
      maxExperience: j.maxExperience,
      shortlistedCount: matches.filter((m) => m.jobId === j.id && m.status === 'SHORTLISTED').length,
    }));

  return {
    openJobs: jobs.filter((j) => j.status === 'OPEN').length,
    candidatesScreened: ctx.role === 'ADMIN' ? getAll('candidates').length : new Set(matches.map((m) => m.candidateId)).size,
    shortlisted: matches.filter((m) => m.status === 'SHORTLISTED').length,
    avgMatchScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    companies: ctx.role === 'ADMIN' ? getAll('companies').length : undefined,
    recentJobs,
  };
}

export function skillDemand(ctx = {}) {
  const { candidatePool } = scope(ctx);
  const counts = {};
  candidatePool.forEach((c) => (c.skills || []).forEach((s) => (counts[s] = (counts[s] || 0) + 1)));
  return Object.entries(counts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function screeningFunnel(ctx = {}) {
  const { matches, candidatePool } = scope(ctx);
  return [
    { stage: 'Ingested', count: ctx.role === 'ADMIN' ? getAll('candidates').length : candidatePool.length },
    { stage: 'Matched', count: matches.filter((m) => m.matchScore >= 30).length },
    { stage: 'Strong match', count: matches.filter((m) => m.matchScore >= 55).length },
    { stage: 'Shortlisted', count: matches.filter((m) => m.status === 'SHORTLISTED').length },
    { stage: 'Rejected', count: matches.filter((m) => m.status === 'REJECTED').length },
  ];
}

export function skillGap(ctx = {}) {
  const { jobs, candidatePool } = scope(ctx);
  const required = {};
  jobs.forEach((j) => (j.requiredSkills || []).forEach((s) => (required[s] = (required[s] || 0) + 1)));
  const available = {};
  candidatePool.forEach((c) => (c.skills || []).forEach((s) => (available[s] = (available[s] || 0) + 1)));
  return Object.keys(required)
    .map((skill) => ({ skill, required: required[skill], available: available[skill] || 0 }))
    .sort((a, b) => b.required - a.required || a.available - b.available)
    .slice(0, 6);
}

export function ingestTrend(ctx = {}) {
  const { matches, candidatePool } = scope(ctx);
  const shortlistedCandidateIds = new Set(matches.filter((m) => m.status === 'SHORTLISTED').map((m) => m.candidateId));
  const buckets = {};
  const bucketFor = (iso) => {
    const d = new Date(iso);
    const key = `${d.toLocaleString('en', { month: 'short' })} ${d.getFullYear()}`;
    buckets[key] = buckets[key] || { month: key, ingested: 0, shortlisted: 0, _order: d.getFullYear() * 12 + d.getMonth() };
    return buckets[key];
  };
  candidatePool.forEach((c) => {
    const b = bucketFor(c.createdAt);
    b.ingested += 1;
    if (shortlistedCandidateIds.has(c.id)) b.shortlisted += 1;
  });
  return Object.values(buckets)
    .sort((a, b) => a._order - b._order)
    .map(({ _order, ...rest }) => rest);
}

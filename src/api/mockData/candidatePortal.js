export const mockMyApplications = [
  {
    id: 'a1',
    jobId: 'j1',
    jobTitle: 'Senior Backend Engineer (Java)',
    appliedAt: '2026-07-15T10:00:00Z',
    status: 'SHORTLISTED',
    matchScore: 74,
  },
  {
    id: 'a2',
    jobId: 'j5',
    jobTitle: 'Engineering Manager',
    appliedAt: '2026-07-18T12:30:00Z',
    status: 'SCREENING',
    matchScore: 58,
  },
  {
    id: 'a3',
    jobId: 'j3',
    jobTitle: 'DevOps Engineer',
    appliedAt: '2026-07-05T08:45:00Z',
    status: 'REJECTED',
    matchScore: 41,
  },
];

export const applicationStatusMeta = {
  SCREENING: { label: 'Screening', color: 'amber' },
  SHORTLISTED: { label: 'Shortlisted', color: 'blue' },
  INTERVIEW: { label: 'Interview Scheduled', color: 'blue' },
  OFFERED: { label: 'Offer Extended', color: 'green' },
  REJECTED: { label: 'Not Selected', color: 'red' },
};

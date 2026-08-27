import axiosClient from './axiosClient';
import { mockDelay, USE_MOCK_API } from './mockHelpers';
import { mockCandidates } from './mockData/candidates';

function extractKeywords(query) {
  const skillVocabulary = [
    'Java', 'Spring Boot', 'React', 'AWS', 'Docker', 'Kubernetes', 'Python', 'SQL',
    'PostgreSQL', 'JavaScript', 'TypeScript', 'Terraform', 'Kafka', 'Node.js',
    'Tailwind CSS', 'Leadership', 'Agile', 'System Design', 'Tableau', 'Statistics',
  ];
  const lowerQuery = query.toLowerCase();
  return skillVocabulary.filter((skill) => lowerQuery.includes(skill.toLowerCase()));
}

export async function queryAssistant(query) {
  if (USE_MOCK_API) {
    const keywords = extractKeywords(query);
    let matched = mockCandidates;

    if (keywords.length > 0) {
      matched = mockCandidates.filter((c) =>
        keywords.every((kw) => c.skills.some((s) => s.toLowerCase() === kw.toLowerCase()))
      );
    }

    const minExpMatch = query.match(/(\d+)\+?\s*years?/i);
    if (minExpMatch) {
      const minExp = parseInt(minExpMatch[1], 10);
      matched = matched.filter((c) => c.experienceYears >= minExp);
    }

    const candidates = matched.map((c) => ({
      candidateId: c.id,
      name: c.name,
      skills: c.skills,
      experienceYears: c.experienceYears,
      bestMatchScore: Math.max(0, ...c.appliedJobs.map((a) => a.matchScore)),
    }));

    const answerText =
      candidates.length > 0
        ? `Found ${candidates.length} candidate${candidates.length === 1 ? '' : 's'} matching "${query}".`
        : `No candidates matched "${query}". Try broadening your search terms.`;

    return mockDelay({ answerText, candidates }, 900);
  }

  const { data } = await axiosClient.post('/assistant/query', { query });
  return data;
}

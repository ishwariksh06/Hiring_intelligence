export const mockCandidates = [
  {
    id: 'c1',
    name: 'Ananya Rao',
    email: 'ananya.rao@example.com',
    phone: '+91 98765 43210',
    skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'AWS', 'Docker'],
    experienceYears: 5,
    education: 'B.Tech Computer Science, IIT Bombay',
    resumeSummary:
      'Backend engineer with 5 years of experience building scalable microservices in Java and Spring Boot. Strong background in cloud-native deployments on AWS.',
    appliedJobs: [
      { jobId: 'j1', jobTitle: 'Senior Backend Engineer (Java)', matchScore: 92, strengths: ['Java', 'Spring Boot', 'AWS'], missingSkills: [] },
      { jobId: 'j5', jobTitle: 'Engineering Manager', matchScore: 61, strengths: ['Java', 'System Design'], missingSkills: ['Leadership', 'Agile'] },
    ],
  },
  {
    id: 'c2',
    name: 'Vikram Mehta',
    email: 'vikram.mehta@example.com',
    phone: '+91 98765 11223',
    skills: ['Java', 'Spring Boot', 'Kafka', 'MySQL'],
    experienceYears: 6,
    education: 'M.Tech Software Engineering, BITS Pilani',
    resumeSummary:
      'Backend developer specializing in event-driven architectures with Kafka. 6 years across fintech and logistics domains.',
    appliedJobs: [
      { jobId: 'j1', jobTitle: 'Senior Backend Engineer (Java)', matchScore: 78, strengths: ['Java', 'Spring Boot'], missingSkills: ['PostgreSQL', 'AWS'] },
    ],
  },
  {
    id: 'c3',
    name: 'Sneha Iyer',
    email: 'sneha.iyer@example.com',
    phone: '+91 91234 56789',
    skills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'Redux'],
    experienceYears: 3,
    education: 'B.E. Information Technology, VJTI Mumbai',
    resumeSummary:
      'Frontend engineer with 3 years of experience crafting responsive, accessible web applications using React and TypeScript.',
    appliedJobs: [
      { jobId: 'j2', jobTitle: 'Frontend Engineer (React)', matchScore: 95, strengths: ['React', 'JavaScript', 'Tailwind CSS'], missingSkills: [] },
    ],
  },
  {
    id: 'c4',
    name: 'Karan Malhotra',
    email: 'karan.malhotra@example.com',
    phone: '+91 90909 80808',
    skills: ['React', 'JavaScript', 'CSS', 'Node.js'],
    experienceYears: 2,
    education: 'B.Sc Computer Science, Delhi University',
    resumeSummary:
      'Full-stack leaning frontend developer, 2 years of experience, comfortable with React and lightweight Node.js services.',
    appliedJobs: [
      { jobId: 'j2', jobTitle: 'Frontend Engineer (React)', matchScore: 68, strengths: ['React', 'JavaScript'], missingSkills: ['Tailwind CSS', 'REST APIs'] },
    ],
  },
  {
    id: 'c5',
    name: 'Divya Nair',
    email: 'divya.nair@example.com',
    phone: '+91 99887 76655',
    skills: ['Kubernetes', 'AWS', 'Docker', 'Terraform', 'CI/CD', 'Jenkins'],
    experienceYears: 4,
    education: 'B.Tech Electronics & Communication, NIT Trichy',
    resumeSummary:
      'DevOps engineer with 4 years automating cloud infrastructure and CI/CD pipelines for high-availability systems.',
    appliedJobs: [
      { jobId: 'j3', jobTitle: 'DevOps Engineer', matchScore: 89, strengths: ['Kubernetes', 'AWS', 'Terraform'], missingSkills: [] },
    ],
  },
  {
    id: 'c6',
    name: 'Arjun Kapoor',
    email: 'arjun.kapoor@example.com',
    phone: '+91 98123 45678',
    skills: ['AWS', 'Docker', 'Bash', 'Python'],
    experienceYears: 3,
    education: 'B.Tech Computer Science, VIT Vellore',
    resumeSummary:
      'Infrastructure engineer transitioning into DevOps, with strong scripting and cloud fundamentals.',
    appliedJobs: [
      { jobId: 'j3', jobTitle: 'DevOps Engineer', matchScore: 54, strengths: ['AWS', 'Docker'], missingSkills: ['Kubernetes', 'Terraform', 'CI/CD'] },
    ],
  },
  {
    id: 'c7',
    name: 'Neha Joshi',
    email: 'neha.joshi@example.com',
    phone: '+91 97654 32109',
    skills: ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics'],
    experienceYears: 2,
    education: 'M.Sc Statistics, Fergusson College',
    resumeSummary:
      'Data analyst with 2 years of experience building dashboards and statistical models for operations teams.',
    appliedJobs: [
      { jobId: 'j4', jobTitle: 'Data Analyst', matchScore: 91, strengths: ['SQL', 'Python', 'Tableau'], missingSkills: [] },
    ],
  },
  {
    id: 'c8',
    name: 'Rohit Bansal',
    email: 'rohit.bansal@example.com',
    phone: '+91 96543 21098',
    skills: ['Java', 'System Design', 'Leadership', 'Agile', 'Spring Boot'],
    experienceYears: 10,
    education: 'B.Tech Computer Science, IIT Delhi',
    resumeSummary:
      'Engineering leader with 10 years of experience, including 4 years managing backend teams of 8+ engineers.',
    appliedJobs: [
      { jobId: 'j5', jobTitle: 'Engineering Manager', matchScore: 88, strengths: ['Leadership', 'Java', 'Agile'], missingSkills: [] },
    ],
  },
];

export const mockInterviewQuestions = {
  c1: [
    'Can you walk us through how you designed service boundaries in a recent microservices project?',
    'How do you approach schema migrations in PostgreSQL without downtime?',
    'Describe a time you had to debug a production issue in a distributed system.',
    'What AWS services have you used for deployment, and how do you manage cost/scale tradeoffs?',
  ],
  c2: [
    'How do you ensure message ordering and idempotency when working with Kafka?',
    'Walk us through a schema design decision you made in MySQL for a high-write workload.',
    'How would you approach migrating a service from MySQL to PostgreSQL?',
  ],
  c3: [
    'How do you manage global state in a large React application?',
    'Describe your approach to making a component library accessible.',
    'How do you handle performance optimization in a data-heavy React dashboard?',
  ],
  c4: [
    'What is your experience integrating a React frontend with Node.js backend APIs?',
    'How comfortable are you adopting a utility-first CSS framework like Tailwind?',
  ],
  c5: [
    'Describe a complex CI/CD pipeline you built end-to-end.',
    'How do you manage secrets and configuration across Kubernetes environments?',
    'Walk us through a Terraform module you are proud of.',
  ],
  c6: [
    'What steps would you take to learn Kubernetes fundamentals in your first 30 days?',
    'Describe your experience with infrastructure-as-code, even outside Terraform.',
  ],
  c7: [
    'Walk us through how you would build a hiring funnel dashboard from raw application data.',
    'What statistical methods do you use to validate a trend before reporting it?',
  ],
  c8: [
    'How do you balance hands-on technical work with people management?',
    'Describe how you have handled a low-performing engineer on your team.',
    'What is your approach to system design reviews for your team\'s projects?',
  ],
};

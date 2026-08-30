// Canonical skill vocabulary used by the resume parser and the job matcher.
// Each entry: canonical label + lowercase aliases that may appear in raw text.
export const SKILL_DICTIONARY = [
  { label: 'Java', aliases: ['java', 'java 8', 'java 11', 'java 17', 'core java'] },
  { label: 'Spring Boot', aliases: ['spring boot', 'springboot', 'spring-boot', 'spring framework', 'spring mvc'] },
  { label: 'Hibernate', aliases: ['hibernate', 'jpa', 'spring data jpa'] },
  { label: 'Microservices', aliases: ['microservices', 'micro services', 'micro-services'] },
  { label: 'REST APIs', aliases: ['rest api', 'rest apis', 'restful', 'rest', 'web services'] },
  { label: 'GraphQL', aliases: ['graphql'] },
  { label: 'Kafka', aliases: ['kafka', 'apache kafka'] },
  { label: 'RabbitMQ', aliases: ['rabbitmq', 'rabbit mq'] },
  { label: 'Node.js', aliases: ['node.js', 'nodejs', 'node js', 'node'] },
  { label: 'Express', aliases: ['express', 'express.js', 'expressjs'] },
  { label: 'Python', aliases: ['python', 'python3'] },
  { label: 'Django', aliases: ['django'] },
  { label: 'Flask', aliases: ['flask'] },
  { label: 'FastAPI', aliases: ['fastapi', 'fast api'] },
  { label: 'JavaScript', aliases: ['javascript', 'js', 'es6', 'ecmascript'] },
  { label: 'TypeScript', aliases: ['typescript', 'ts'] },
  { label: 'React', aliases: ['react', 'react.js', 'reactjs'] },
  { label: 'Redux', aliases: ['redux', 'redux toolkit'] },
  { label: 'Next.js', aliases: ['next.js', 'nextjs', 'next js'] },
  { label: 'Angular', aliases: ['angular', 'angularjs'] },
  { label: 'Vue', aliases: ['vue', 'vue.js', 'vuejs'] },
  { label: 'HTML', aliases: ['html', 'html5'] },
  { label: 'CSS', aliases: ['css', 'css3', 'scss', 'sass'] },
  { label: 'Tailwind CSS', aliases: ['tailwind', 'tailwind css', 'tailwindcss'] },
  { label: 'SQL', aliases: ['sql', 'mysql', 'ms sql', 'sql server', 't-sql', 'pl/sql'] },
  { label: 'PostgreSQL', aliases: ['postgresql', 'postgres', 'psql'] },
  { label: 'MongoDB', aliases: ['mongodb', 'mongo', 'mongoose'] },
  { label: 'Redis', aliases: ['redis'] },
  { label: 'Elasticsearch', aliases: ['elasticsearch', 'elastic search', 'elk'] },
  { label: 'AWS', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'cloudformation'] },
  { label: 'Azure', aliases: ['azure', 'microsoft azure'] },
  { label: 'GCP', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
  { label: 'Docker', aliases: ['docker', 'containers', 'containerization'] },
  { label: 'Kubernetes', aliases: ['kubernetes', 'k8s', 'eks', 'aks', 'gke'] },
  { label: 'Terraform', aliases: ['terraform', 'iac', 'infrastructure as code'] },
  { label: 'Ansible', aliases: ['ansible'] },
  { label: 'Jenkins', aliases: ['jenkins'] },
  { label: 'CI/CD', aliases: ['ci/cd', 'ci cd', 'continuous integration', 'continuous delivery', 'github actions', 'gitlab ci'] },
  { label: 'Git', aliases: ['git', 'github', 'gitlab', 'bitbucket', 'version control'] },
  { label: 'Linux', aliases: ['linux', 'unix', 'bash', 'shell scripting'] },
  { label: 'Go', aliases: ['golang', 'go lang'] },
  { label: 'Rust', aliases: ['rust'] },
  { label: 'C++', aliases: ['c++', 'cpp'] },
  { label: 'C#', aliases: ['c#', '.net', 'dotnet', 'asp.net'] },
  { label: 'Kotlin', aliases: ['kotlin'] },
  { label: 'Swift', aliases: ['swift', 'ios development'] },
  { label: 'Android', aliases: ['android', 'android sdk', 'jetpack compose'] },
  { label: 'Machine Learning', aliases: ['machine learning', 'ml', 'scikit-learn', 'sklearn'] },
  { label: 'Deep Learning', aliases: ['deep learning', 'tensorflow', 'pytorch', 'keras', 'neural networks'] },
  { label: 'NLP', aliases: ['nlp', 'natural language processing', 'spacy', 'nltk'] },
  { label: 'Data Analysis', aliases: ['data analysis', 'data analytics', 'pandas', 'numpy'] },
  { label: 'Power BI', aliases: ['power bi', 'powerbi'] },
  { label: 'Tableau', aliases: ['tableau'] },
  { label: 'Excel', aliases: ['excel', 'advanced excel', 'ms excel'] },
  { label: 'Statistics', aliases: ['statistics', 'statistical analysis', 'hypothesis testing'] },
  { label: 'Spark', aliases: ['spark', 'apache spark', 'pyspark'] },
  { label: 'Hadoop', aliases: ['hadoop', 'hdfs', 'mapreduce'] },
  { label: 'Airflow', aliases: ['airflow', 'apache airflow'] },
  { label: 'ETL', aliases: ['etl', 'data pipelines', 'data warehousing'] },
  { label: 'Agile', aliases: ['agile', 'scrum', 'kanban', 'sprint planning'] },
  { label: 'System Design', aliases: ['system design', 'distributed systems', 'scalability', 'high availability'] },
  { label: 'Leadership', aliases: ['leadership', 'team lead', 'people management', 'mentoring', 'stakeholder management'] },
  { label: 'Selenium', aliases: ['selenium', 'test automation', 'automation testing'] },
  { label: 'JUnit', aliases: ['junit', 'mockito', 'unit testing'] },
  { label: 'Jira', aliases: ['jira', 'confluence'] },
  { label: 'Figma', aliases: ['figma', 'ui/ux', 'wireframing', 'prototyping'] },
  { label: 'Product Management', aliases: ['product management', 'roadmapping', 'product strategy'] },
  { label: 'SEO', aliases: ['seo', 'search engine optimization'] },
  { label: 'Salesforce', aliases: ['salesforce', 'crm'] },
];

const ALIAS_LOOKUP = SKILL_DICTIONARY.flatMap((entry) =>
  entry.aliases.map((alias) => ({ alias, label: entry.label }))
).sort((a, b) => b.alias.length - a.alias.length);

// Pulls canonical skill labels out of free text. Longer aliases win so that
// "spring boot" is not shadowed by a bare "spring".
export function extractSkills(text) {
  if (!text) return [];
  const haystack = ` ${text.toLowerCase().replace(/[^a-z0-9+#./ ]/g, ' ')} `;
  const found = new Set();
  for (const { alias, label } of ALIAS_LOOKUP) {
    const needle = ` ${alias} `;
    if (haystack.includes(needle)) found.add(label);
  }
  return [...found];
}

export const ALL_SKILL_LABELS = SKILL_DICTIONARY.map((e) => e.label);

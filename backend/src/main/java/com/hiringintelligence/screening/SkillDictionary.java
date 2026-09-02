package com.hiringintelligence.screening;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Canonical skill vocabulary used by the resume parser and the job matcher.
 * Port of the frontend {@code src/db/skills.js}. Each entry has a canonical label
 * plus lowercase aliases that may appear in raw resume text.
 */
@Component
public class SkillDictionary {

    private record Entry(String label, List<String> aliases) {}

    private record Alias(String alias, String label) {}

    private static final List<Entry> DICTIONARY = List.of(
            new Entry("Java", List.of("java", "java 8", "java 11", "java 17", "core java")),
            new Entry("Spring Boot", List.of("spring boot", "springboot", "spring-boot", "spring framework", "spring mvc")),
            new Entry("Hibernate", List.of("hibernate", "jpa", "spring data jpa")),
            new Entry("Microservices", List.of("microservices", "micro services", "micro-services")),
            new Entry("REST APIs", List.of("rest api", "rest apis", "restful", "rest", "web services")),
            new Entry("GraphQL", List.of("graphql")),
            new Entry("Kafka", List.of("kafka", "apache kafka")),
            new Entry("RabbitMQ", List.of("rabbitmq", "rabbit mq")),
            new Entry("Node.js", List.of("node.js", "nodejs", "node js", "node")),
            new Entry("Express", List.of("express", "express.js", "expressjs")),
            new Entry("Python", List.of("python", "python3")),
            new Entry("Django", List.of("django")),
            new Entry("Flask", List.of("flask")),
            new Entry("FastAPI", List.of("fastapi", "fast api")),
            new Entry("JavaScript", List.of("javascript", "js", "es6", "ecmascript")),
            new Entry("TypeScript", List.of("typescript", "ts")),
            new Entry("React", List.of("react", "react.js", "reactjs")),
            new Entry("Redux", List.of("redux", "redux toolkit")),
            new Entry("Next.js", List.of("next.js", "nextjs", "next js")),
            new Entry("Angular", List.of("angular", "angularjs")),
            new Entry("Vue", List.of("vue", "vue.js", "vuejs")),
            new Entry("HTML", List.of("html", "html5")),
            new Entry("CSS", List.of("css", "css3", "scss", "sass")),
            new Entry("Tailwind CSS", List.of("tailwind", "tailwind css", "tailwindcss")),
            new Entry("SQL", List.of("sql", "mysql", "ms sql", "sql server", "t-sql", "pl/sql")),
            new Entry("PostgreSQL", List.of("postgresql", "postgres", "psql")),
            new Entry("MongoDB", List.of("mongodb", "mongo", "mongoose")),
            new Entry("Redis", List.of("redis")),
            new Entry("Elasticsearch", List.of("elasticsearch", "elastic search", "elk")),
            new Entry("AWS", List.of("aws", "amazon web services", "ec2", "s3", "lambda", "cloudformation")),
            new Entry("Azure", List.of("azure", "microsoft azure")),
            new Entry("GCP", List.of("gcp", "google cloud", "google cloud platform")),
            new Entry("Docker", List.of("docker", "containers", "containerization")),
            new Entry("Kubernetes", List.of("kubernetes", "k8s", "eks", "aks", "gke")),
            new Entry("Terraform", List.of("terraform", "iac", "infrastructure as code")),
            new Entry("Ansible", List.of("ansible")),
            new Entry("Jenkins", List.of("jenkins")),
            new Entry("CI/CD", List.of("ci/cd", "ci cd", "continuous integration", "continuous delivery", "github actions", "gitlab ci")),
            new Entry("Git", List.of("git", "github", "gitlab", "bitbucket", "version control")),
            new Entry("Linux", List.of("linux", "unix", "bash", "shell scripting")),
            new Entry("Go", List.of("golang", "go lang")),
            new Entry("Rust", List.of("rust")),
            new Entry("C++", List.of("c++", "cpp")),
            new Entry("C#", List.of("c#", ".net", "dotnet", "asp.net")),
            new Entry("Kotlin", List.of("kotlin")),
            new Entry("Swift", List.of("swift", "ios development")),
            new Entry("Android", List.of("android", "android sdk", "jetpack compose")),
            new Entry("Machine Learning", List.of("machine learning", "ml", "scikit-learn", "sklearn")),
            new Entry("Deep Learning", List.of("deep learning", "tensorflow", "pytorch", "keras", "neural networks")),
            new Entry("NLP", List.of("nlp", "natural language processing", "spacy", "nltk")),
            new Entry("Data Analysis", List.of("data analysis", "data analytics", "pandas", "numpy")),
            new Entry("Power BI", List.of("power bi", "powerbi")),
            new Entry("Tableau", List.of("tableau")),
            new Entry("Excel", List.of("excel", "advanced excel", "ms excel")),
            new Entry("Statistics", List.of("statistics", "statistical analysis", "hypothesis testing")),
            new Entry("Spark", List.of("spark", "apache spark", "pyspark")),
            new Entry("Hadoop", List.of("hadoop", "hdfs", "mapreduce")),
            new Entry("Airflow", List.of("airflow", "apache airflow")),
            new Entry("ETL", List.of("etl", "data pipelines", "data warehousing")),
            new Entry("Agile", List.of("agile", "scrum", "kanban", "sprint planning")),
            new Entry("System Design", List.of("system design", "distributed systems", "scalability", "high availability")),
            new Entry("Leadership", List.of("leadership", "team lead", "people management", "mentoring", "stakeholder management")),
            new Entry("Selenium", List.of("selenium", "test automation", "automation testing")),
            new Entry("JUnit", List.of("junit", "mockito", "unit testing")),
            new Entry("Jira", List.of("jira", "confluence")),
            new Entry("Figma", List.of("figma", "ui/ux", "wireframing", "prototyping")),
            new Entry("Product Management", List.of("product management", "roadmapping", "product strategy")),
            new Entry("SEO", List.of("seo", "search engine optimization")),
            new Entry("Salesforce", List.of("salesforce", "crm"))
    );

    private final List<Alias> aliasLookup;

    public SkillDictionary() {
        List<Alias> all = new ArrayList<>();
        for (Entry e : DICTIONARY) {
            for (String a : e.aliases()) {
                all.add(new Alias(a, e.label()));
            }
        }
        // longest alias first so "spring boot" is not shadowed by a bare "spring"
        all.sort((a, b) -> Integer.compare(b.alias().length(), a.alias().length()));
        this.aliasLookup = List.copyOf(all);
    }

    /** Pulls canonical skill labels out of free text. */
    public List<String> extractSkills(String text) {
        if (text == null || text.isEmpty()) {
            return new ArrayList<>();
        }
        String haystack = " " + text.toLowerCase().replaceAll("[^a-z0-9+#./ ]", " ") + " ";
        Set<String> found = new LinkedHashSet<>();
        for (Alias a : aliasLookup) {
            if (haystack.contains(" " + a.alias() + " ")) {
                found.add(a.label());
            }
        }
        return new ArrayList<>(found);
    }

    public List<String> allLabels() {
        return DICTIONARY.stream().map(Entry::label).toList();
    }
}

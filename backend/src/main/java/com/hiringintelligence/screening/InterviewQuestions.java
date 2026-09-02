package com.hiringintelligence.screening;

import com.hiringintelligence.domain.Candidate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Skill-driven interview question templates. Port of {@code generateInterviewQuestions}. */
@Component
public class InterviewQuestions {

    private static final Map<String, String> TEMPLATES = new LinkedHashMap<>();

    static {
        TEMPLATES.put("Java", "Walk through how the JVM manages memory and when you last tuned garbage collection.");
        TEMPLATES.put("Spring Boot", "How do you structure configuration and profiles across environments in a Spring Boot service?");
        TEMPLATES.put("Microservices", "How do you decide service boundaries, and how do you handle a distributed transaction across them?");
        TEMPLATES.put("React", "How do you manage shared state and avoid unnecessary re-renders in a large React app?");
        TEMPLATES.put("Node.js", "Explain the event loop and a time you had to debug a blocked one.");
        TEMPLATES.put("AWS", "Which AWS services have you run in production, and how did you manage cost versus scale?");
        TEMPLATES.put("Kubernetes", "Describe a rollout strategy you have used and how you handled a bad deploy.");
        TEMPLATES.put("PostgreSQL", "How do you approach a zero-downtime schema migration on a large table?");
        TEMPLATES.put("Kafka", "How do you guarantee ordering and idempotency with Kafka consumers?");
        TEMPLATES.put("Python", "When do you reach for async Python, and what are its limits?");
        TEMPLATES.put("Machine Learning", "How do you detect and correct for data leakage in a training pipeline?");
        TEMPLATES.put("Leadership", "Describe how you handled an underperforming engineer on your team.");
        TEMPLATES.put("System Design", "Design a URL shortener and talk through the scaling bottlenecks.");
        TEMPLATES.put("Terraform", "How do you structure Terraform modules and manage state for a team?");
        TEMPLATES.put("Docker", "How do you keep production images small and secure?");
        TEMPLATES.put("SQL", "Write a query to find the second-highest salary per department and explain the plan.");
    }

    public List<String> generate(Candidate candidate) {
        List<String> out = new ArrayList<>();
        List<String> skills = candidate.getSkills() == null ? List.of() : candidate.getSkills();
        for (String s : skills) {
            String q = TEMPLATES.get(s);
            if (q != null && !out.contains(q) && out.size() < 5) {
                out.add(q);
            }
        }
        out.add("Tell us about a project on your resume you are most proud of and your specific contribution.");
        out.add("You list " + candidate.getExperienceYears()
                + " years of experience — describe how your responsibilities changed over that time.");
        return out.size() > 6 ? out.subList(0, 6) : out;
    }
}

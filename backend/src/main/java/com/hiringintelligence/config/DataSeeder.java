package com.hiringintelligence.config;

import com.hiringintelligence.domain.Candidate;
import com.hiringintelligence.domain.Company;
import com.hiringintelligence.domain.Job;
import com.hiringintelligence.domain.JobStatus;
import com.hiringintelligence.domain.Role;
import com.hiringintelligence.domain.User;
import com.hiringintelligence.repo.CandidateRepository;
import com.hiringintelligence.repo.CompanyRepository;
import com.hiringintelligence.repo.JobRepository;
import com.hiringintelligence.repo.MatchRepository;
import com.hiringintelligence.repo.ReportRepository;
import com.hiringintelligence.repo.UserRepository;
import com.hiringintelligence.screening.AtsChecker;
import com.hiringintelligence.screening.ParsedResume;
import com.hiringintelligence.screening.ResumeParser;
import com.hiringintelligence.screening.ScreeningService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

/**
 * Seeds companies, users, jobs and a synthetic candidate pool on first run.
 * Port of {@code src/db/seed.js}. Guarded on empty tables; matches are produced
 * by running the real screening pipeline over the seeded rows.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    static final String AGENCY_NAME = "Hiring Intelligence";
    private static final String DEMO_PASSWORD = "password123";
    private static final int CANDIDATE_COUNT = 52;
    private static final int RNG_SEED = 20260830;

    private final AppProperties props;
    private final CompanyRepository companies;
    private final UserRepository users;
    private final JobRepository jobs;
    private final CandidateRepository candidates;
    private final MatchRepository matches;
    private final ReportRepository reports;
    private final PasswordEncoder passwordEncoder;
    private final ResumeParser parser;
    private final AtsChecker ats;
    private final ScreeningService screening;

    public DataSeeder(AppProperties props, CompanyRepository companies, UserRepository users,
                      JobRepository jobs, CandidateRepository candidates, MatchRepository matches,
                      ReportRepository reports, PasswordEncoder passwordEncoder, ResumeParser parser,
                      AtsChecker ats, ScreeningService screening) {
        this.props = props;
        this.companies = companies;
        this.users = users;
        this.jobs = jobs;
        this.candidates = candidates;
        this.matches = matches;
        this.reports = reports;
        this.passwordEncoder = passwordEncoder;
        this.parser = parser;
        this.ats = ats;
        this.screening = screening;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!props.getSeed().isEnabled()) {
            return;
        }
        if (companies.count() > 0 || users.count() > 0) {
            log.info("Seed skipped — data already present ({} companies, {} users)",
                    companies.count(), users.count());
            return;
        }
        seed();
    }

    /** Wipes every table and re-seeds. Backs the admin "Reset database" action. */
    @Transactional
    public void reseed() {
        matches.deleteAllInBatch();
        reports.deleteAllInBatch();
        jobs.deleteAllInBatch();
        candidates.deleteAllInBatch();
        users.deleteAllInBatch();
        companies.deleteAllInBatch();
        seed();
    }

    @Transactional
    public void seed() {
        log.info("Seeding database...");

        // --- companies -----------------------------------------------------
        Company northwind = company("Northwind Logistics", "Logistics & Supply Chain", "Pune, IN",
                "Rajesh Iyer", "rajesh.iyer@northwind.example", "2026-06-02T09:00:00Z");
        Company lumen = company("Lumen Retail", "E-commerce", "Bengaluru, IN",
                "Sara Thomas", "sara.thomas@lumenretail.example", "2026-06-18T09:00:00Z");
        Company atlas = company("Atlas Analytics", "Data & BI Consulting", "Mumbai, IN",
                "Vivek Menon", "vivek.menon@atlasanalytics.example", "2026-07-05T09:00:00Z");
        companies.saveAll(List.of(northwind, lumen, atlas));

        // --- users -------------------------------------------------------
        users.save(user("ishwari@hiringintelligence.io", "Ishwari Kshirsagar", Role.ADMIN, null,
                "Founder & Lead Recruiter"));
        users.save(user("rajesh.iyer@northwind.example", "Rajesh Iyer", Role.RECRUITER, northwind.getId(),
                "Head of Talent"));
        users.save(user("sara.thomas@lumenretail.example", "Sara Thomas", Role.RECRUITER, lumen.getId(),
                "Recruitment Lead"));
        users.save(user("vivek.menon@atlasanalytics.example", "Vivek Menon", Role.RECRUITER, atlas.getId(),
                "Engineering Manager"));

        // --- jobs -------------------------------------------------------
        jobs.saveAll(List.of(
                job(northwind, "Senior Backend Engineer",
                        "Design and run the microservices behind our shipment tracking platform. You will own service "
                                + "boundaries, database schema, and the event pipeline that keeps depots in sync.",
                        List.of("Java", "Spring Boot", "Microservices", "PostgreSQL", "Kafka", "AWS"), 4, 8,
                        "2026-07-20T09:00:00Z"),
                job(northwind, "DevOps Engineer",
                        "Own CI/CD, container orchestration and cloud infrastructure across our fleet. Kubernetes and "
                                + "infrastructure-as-code are day-to-day tools here.",
                        List.of("Kubernetes", "AWS", "Docker", "Terraform", "CI/CD", "Linux"), 3, 7,
                        "2026-07-22T09:00:00Z"),
                job(lumen, "Frontend Engineer",
                        "Build the storefront and the internal merchandising console. Strong React fundamentals, an eye "
                                + "for accessible UI, and comfort with a design system.",
                        List.of("React", "JavaScript", "TypeScript", "CSS", "REST APIs"), 2, 5,
                        "2026-07-28T09:00:00Z"),
                job(lumen, "Full Stack Engineer",
                        "Ship features end to end across a Node.js API and a React frontend. You will work close to "
                                + "product and move quickly.",
                        List.of("Node.js", "React", "JavaScript", "PostgreSQL", "REST APIs", "AWS"), 3, 6,
                        "2026-08-04T09:00:00Z"),
                job(lumen, "Android Engineer",
                        "Own the customer Android app. Kotlin, Jetpack Compose, and a track record of shipping in the "
                                + "Play Store.",
                        List.of("Kotlin", "Android", "Java", "REST APIs", "Git"), 2, 6,
                        "2026-08-10T09:00:00Z"),
                job(atlas, "Data Analyst",
                        "Turn client operational data into dashboards and readouts leadership can act on. SQL fluency "
                                + "and a strong grip on statistics required.",
                        List.of("SQL", "Python", "Data Analysis", "Tableau", "Statistics", "Excel"), 1, 4,
                        "2026-08-06T09:00:00Z"),
                job(atlas, "Data Engineer",
                        "Build and maintain the ingestion and transformation pipelines feeding our analytics warehouse. "
                                + "Spark and Airflow experience expected.",
                        List.of("Python", "SQL", "Spark", "Airflow", "ETL", "AWS"), 3, 7,
                        "2026-08-12T09:00:00Z"),
                job(atlas, "Machine Learning Engineer",
                        "Take models from notebook to production for our forecasting product. Solid Python, ML "
                                + "fundamentals, and an appetite for MLOps.",
                        List.of("Python", "Machine Learning", "Deep Learning", "SQL", "AWS", "Docker"), 2, 6,
                        "2026-08-15T09:00:00Z")
        ));

        // --- candidate pool -------------------------------------------
        seedCandidates();

        // --- screening -----------------------------------------------
        screening.rescoreAllOpenJobs();

        log.info("Seed complete: {} companies, {} users, {} jobs, {} candidates, {} matches",
                companies.count(), users.count(), jobs.count(), candidates.count(), matches.count());
    }

    // ------------------------------------------------------------------
    // Candidate pool generation (port of buildCandidatePool)
    // ------------------------------------------------------------------

    private record Profile(String category, List<String> core, List<String> extra,
                           int expLo, int expHi, String degree) {}

    private static final List<Profile> PROFILES = List.of(
            new Profile("Java Backend",
                    List.of("Java", "Spring Boot", "Hibernate", "REST APIs", "PostgreSQL", "Microservices"),
                    List.of("Kafka", "AWS", "Docker", "JUnit", "System Design", "Redis"), 2, 11,
                    "B.Tech Computer Science"),
            new Profile("Frontend",
                    List.of("React", "JavaScript", "TypeScript", "HTML", "CSS", "REST APIs"),
                    List.of("Redux", "Next.js", "Tailwind CSS", "Figma", "Git"), 1, 8,
                    "B.E. Information Technology"),
            new Profile("Full Stack",
                    List.of("Node.js", "Express", "React", "JavaScript", "MongoDB", "REST APIs"),
                    List.of("TypeScript", "PostgreSQL", "AWS", "Docker", "GraphQL"), 2, 9,
                    "B.Tech Computer Engineering"),
            new Profile("DevOps",
                    List.of("Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Linux"),
                    List.of("Jenkins", "Ansible", "Python", "Git", "GCP"), 2, 10,
                    "B.Tech Electronics & Communication"),
            new Profile("Data Analyst",
                    List.of("SQL", "Python", "Data Analysis", "Excel", "Statistics", "Tableau"),
                    List.of("Power BI", "PostgreSQL", "Machine Learning"), 0, 5,
                    "M.Sc Statistics"),
            new Profile("Data Engineer",
                    List.of("Python", "SQL", "Spark", "Airflow", "ETL", "AWS"),
                    List.of("Hadoop", "Kafka", "PostgreSQL", "Docker"), 2, 9,
                    "B.Tech Computer Science"),
            new Profile("Machine Learning",
                    List.of("Python", "Machine Learning", "Deep Learning", "NLP", "SQL", "Statistics"),
                    List.of("AWS", "Docker", "Data Analysis"), 1, 7,
                    "M.Tech Artificial Intelligence"),
            new Profile("Mobile",
                    List.of("Kotlin", "Android", "Java", "REST APIs", "Git"),
                    List.of("Swift", "System Design", "CI/CD"), 1, 8,
                    "B.E. Computer Science"),
            new Profile("QA Automation",
                    List.of("Selenium", "Java", "JUnit", "CI/CD", "Git"),
                    List.of("Python", "REST APIs", "Jira"), 1, 7,
                    "B.Sc Computer Science"),
            new Profile("Engineering Manager",
                    List.of("Leadership", "Agile", "System Design", "Java", "Microservices"),
                    List.of("AWS", "Product Management", "Jira"), 7, 15,
                    "B.Tech Computer Science")
    );

    private static final List<String> COLLEGES = List.of(
            "IIT Bombay", "VJTI Mumbai", "BITS Pilani", "NIT Trichy", "COEP Pune",
            "Delhi Technological University", "IIIT Hyderabad", "PICT Pune", "SPIT Mumbai", "VIT Vellore");
    private static final List<String> CITIES = List.of(
            "Pune, IN", "Mumbai, IN", "Bengaluru, IN", "Hyderabad, IN", "Remote, IN");
    private static final List<String> FIRST_NAMES = List.of(
            "Ananya", "Vikram", "Sneha", "Karan", "Divya", "Arjun", "Neha", "Rohit", "Priya", "Aditya",
            "Meera", "Rahul", "Kavya", "Yash", "Simran", "Nikhil", "Pooja", "Ishaan", "Tanvi", "Aryan",
            "Riya", "Siddharth", "Ayesha", "Manish", "Isha", "Varun", "Nandini", "Harsh", "Sana", "Devansh");
    private static final List<String> LAST_NAMES = List.of(
            "Rao", "Mehta", "Iyer", "Malhotra", "Nair", "Kapoor", "Joshi", "Bansal", "Sharma", "Verma",
            "Pillai", "Deshmukh", "Reddy", "Agarwal", "Kaur", "Bhat", "Menon", "Chatterjee", "Gupta", "Shetty");
    private static final List<String> BLURBS = List.of(
            "Comfortable owning a service from design through on-call.",
            "Enjoys mentoring juniors and tightening the review process.",
            "Has led migrations with zero customer-facing downtime.",
            "Strong bias toward automated testing and clean interfaces.",
            "Works well directly with stakeholders to scope ambiguous problems.");
    private static final List<String> EMPLOYERS = List.of(
            "Finmark Systems", "Cobalt Software", "Greytail Labs", "Meridian Tech", "Orbit Commerce", "BlueRiver Digital");

    private void seedCandidates() {
        Rng rng = new Rng(RNG_SEED);
        List<Candidate> pool = new ArrayList<>(CANDIDATE_COUNT);

        for (int i = 0; i < CANDIDATE_COUNT; i++) {
            Profile profile = PROFILES.get(i % PROFILES.size());
            String first = rng.pick(FIRST_NAMES);
            String last = rng.pick(LAST_NAMES);
            String name = first + " " + last;
            String handle = (first + "." + last).toLowerCase();
            int lo = profile.expLo();
            int hi = profile.expHi();
            int years = lo + (int) Math.floor(rng.next() * (hi - lo + 1));

            double coverage = rng.next();
            int coreCount = coverage > 0.7
                    ? profile.core().size()
                    : Math.max(2, (int) Math.round(profile.core().size() * (0.4 + coverage * 0.5)));
            List<String> skills = new ArrayList<>(rng.sample(profile.core(), coreCount));
            int extraN = (int) Math.floor(rng.next() * 3);
            skills.addAll(rng.sample(profile.extra(), extraN));
            List<String> uniqueSkills = new ArrayList<>(new LinkedHashSet<>(skills));

            String email = rng.next() > 0.06 ? handle + i + "@example.com" : "";
            String phone = "";
            if (rng.next() > 0.12) {
                phone = "+91 " + (90000 + (int) Math.floor(rng.next() * 9999))
                        + " " + (10000 + (int) Math.floor(rng.next() * 89999));
            }
            String city = rng.pick(CITIES);
            String degree = rng.next() > 0.1 ? profile.degree() : "";
            String college = rng.pick(COLLEGES);
            String employer = rng.pick(EMPLOYERS);
            String roleTitle = profile.category().equals("Engineering Manager")
                    ? "Engineering Manager" : profile.category() + " Engineer";
            String blurb = rng.pick(BLURBS);

            String rawText = buildResumeText(name, email, phone, city, profile.category(), years,
                    uniqueSkills, employer, roleTitle, blurb, degree, college);

            ParsedResume parsed = parser.parse(rawText, name.replaceAll("\\s+", "_") + ".txt", name);

            Candidate c = new Candidate();
            c.setName(name);
            c.setEmail(parsed.email());
            c.setPhone(parsed.phone());
            c.setSkills(uniqueSkills);
            c.setExperienceYears(years);
            c.setEducation(!degree.isEmpty() ? degree + ", " + college : parsed.education());
            c.setResumeSummary(parsed.resumeSummary());
            c.setRawText(rawText);
            c.setSourceFile(parsed.sourceFile());
            c.setCategory(profile.category());

            AtsChecker.AtsResult result = ats.check(c);
            c.setAtsScore(result.atsScore());
            c.setAtsFlags(new ArrayList<>(result.atsFlags()));

            long daysAgo = 3 + (long) Math.floor((i / (double) CANDIDATE_COUNT) * 150) + (i % 7);
            c.setCreatedAt(Instant.now().minus(daysAgo, ChronoUnit.DAYS));

            pool.add(c);
        }
        candidates.saveAll(pool);
    }

    private String buildResumeText(String name, String email, String phone, String city, String category,
                                   int years, List<String> skills, String employer, String roleTitle,
                                   String blurb, String degree, String college) {
        String top4 = String.join(", ", skills.subList(0, Math.min(4, skills.size())));
        String top3 = String.join(", ", skills.subList(0, Math.min(3, skills.size())));
        return String.join("\n",
                name,
                email + " | " + phone + " | " + city,
                "",
                "SUMMARY",
                category + " professional with " + years + " years of experience. Hands-on with " + top4 + ". " + blurb,
                "",
                "SKILLS",
                String.join(", ", skills),
                "",
                "EXPERIENCE",
                employer + " — " + roleTitle + " (" + years + " years)",
                "- Delivered production work across " + top3 + ".",
                "- Collaborated with product and QA in an Agile team.",
                "",
                "EDUCATION",
                (degree.isEmpty() ? "" : degree + ", ") + college);
    }

    // ------------------------------------------------------------------

    private Company company(String name, String industry, String location, String contactName,
                            String contactEmail, String createdAt) {
        Company c = new Company();
        c.setName(name);
        c.setIndustry(industry);
        c.setLocation(location);
        c.setContactName(contactName);
        c.setContactEmail(contactEmail);
        c.setCreatedAt(OffsetDateTime.parse(createdAt).toInstant());
        return c;
    }

    private User user(String email, String name, Role role, java.util.UUID companyId, String title) {
        User u = new User();
        u.setEmail(email);
        u.setName(name);
        u.setRole(role);
        u.setCompanyId(companyId);
        u.setTitle(title);
        u.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
        return u;
    }

    private Job job(Company company, String title, String description, List<String> skills,
                    int minExp, int maxExp, String createdAt) {
        Job j = new Job();
        j.setCompanyId(company.getId());
        j.setTitle(title);
        j.setDescription(description);
        j.setRequiredSkills(new ArrayList<>(skills));
        j.setMinExperience(minExp);
        j.setMaxExperience(maxExp);
        j.setStatus(JobStatus.OPEN);
        j.setCreatedAt(OffsetDateTime.parse(createdAt).toInstant());
        return j;
    }

    /** Exposed for tests / diagnostics. */
    public Map<String, Long> counts() {
        return Map.of(
                "companies", companies.count(),
                "users", users.count(),
                "jobs", jobs.count(),
                "candidates", candidates.count(),
                "matches", matches.count()
        );
    }
}

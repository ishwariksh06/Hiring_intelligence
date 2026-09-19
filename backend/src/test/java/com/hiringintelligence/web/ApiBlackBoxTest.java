package com.hiringintelligence.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Black-box API tests: only HTTP requests and responses are used, with no knowledge of internals.
 * Runs against the real Spring context with an isolated in-memory H2 database (seeded).
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:blackbox;DB_CLOSE_DELAY=-1",
        "app.seed.enabled=true"
})
@AutoConfigureMockMvc
class ApiBlackBoxTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private static final String ADMIN = "ishwari@hiringintelligence.io";
    private static final String CLIENT = "rajesh.iyer@northwind.example";
    private static final String PASSWORD = "password123";

    private String login(String email, String password) throws Exception {
        MvcResult r = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}")).andReturn();
        if (r.getResponse().getStatus() != 200) return null;
        return json.readTree(r.getResponse().getContentAsString()).get("token").asText();
    }

    private String bearer(String token) { return "Bearer " + token; }

    // ---------- Authentication ----------
    @Test void TC_AUTH_01_validAdminLogin() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + ADMIN + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }
    @Test void TC_AUTH_02_validClientLogin() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + CLIENT + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.role").value("RECRUITER"));
    }
    @Test void TC_AUTH_03_wrongPasswordRejected() throws Exception { assertThat(login(ADMIN, "wrong")).isNull(); }
    @Test void TC_AUTH_04_unknownUserRejected() throws Exception { assertThat(login("nobody@x.com", PASSWORD)).isNull(); }
    @Test void TC_AUTH_05_blankFieldsRejected() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"\",\"password\":\"\"}"))
                .andExpect(status().is4xxClientError());
    }
    @Test void TC_AUTH_06_malformedJsonRejected() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{bad"))
                .andExpect(status().is4xxClientError());
    }
    @Test void TC_AUTH_07_sqlInjectionInEmailRejected() throws Exception {
        assertThat(login("' OR '1'='1' --", "' OR '1'='1")).isNull();
    }

    // ---------- Authorisation / RBAC ----------
    @Test void TC_SEC_01_noTokenIs401() throws Exception { mvc.perform(get("/api/jobs")).andExpect(status().isUnauthorized()); }
    @Test void TC_SEC_02_garbageTokenIs401() throws Exception {
        mvc.perform(get("/api/jobs").header("Authorization", "Bearer abc.def.ghi")).andExpect(status().isUnauthorized());
    }
    @Test void TC_SEC_03_clientCannotListCompanies() throws Exception {
        mvc.perform(get("/api/companies").header("Authorization", bearer(login(CLIENT, PASSWORD))))
                .andExpect(status().isForbidden());
    }
    @Test void TC_SEC_04_clientCannotListCandidatePool() throws Exception {
        mvc.perform(get("/api/candidates").header("Authorization", bearer(login(CLIENT, PASSWORD))))
                .andExpect(status().isForbidden());
    }
    @Test void TC_SEC_05_clientCannotIngestResumes() throws Exception {
        mvc.perform(post("/api/resumes").contentType(MediaType.APPLICATION_JSON).content("[]")
                .header("Authorization", bearer(login(CLIENT, PASSWORD)))).andExpect(status().isForbidden());
    }
    @Test void TC_SEC_06_clientCannotResetData() throws Exception {
        mvc.perform(post("/api/admin/reset").header("Authorization", bearer(login(CLIENT, PASSWORD))))
                .andExpect(status().isForbidden());
    }
    @Test void TC_SEC_07_adminCanListCompanies() throws Exception {
        mvc.perform(get("/api/companies").header("Authorization", bearer(login(ADMIN, PASSWORD))))
                .andExpect(status().isOk());
    }
    @Test void TC_SEC_08_clientSeesOnlyOwnCompanyJobs() throws Exception {
        String token = login(CLIENT, PASSWORD);
        JsonNode jobs = json.readTree(mvc.perform(get("/api/jobs").header("Authorization", bearer(token)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        assertThat(jobs.size()).isGreaterThan(0);
        String company = jobs.get(0).get("companyId").asText();
        for (JsonNode j : jobs) assertThat(j.get("companyId").asText()).isEqualTo(company);
        JsonNode all = json.readTree(mvc.perform(get("/api/jobs").header("Authorization", bearer(login(ADMIN, PASSWORD))))
                .andReturn().getResponse().getContentAsString());
        assertThat(all.size()).isGreaterThan(jobs.size());
    }
    @Test void TC_SEC_09_corsAllowsConfiguredOrigin() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/api/jobs")
                .header("Origin", "http://localhost:5173").header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk());
    }
    @Test void TC_SEC_10_corsRejectsUnknownOrigin() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/api/jobs")
                .header("Origin", "https://evil.example").header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    // ---------- Jobs ----------
    private String jobBody(String title, int min, int max) {
        return "{\"title\":\"" + title + "\",\"description\":\"Test job\",\"requiredSkills\":[\"Java\",\"SQL\"],"
                + "\"minExperience\":" + min + ",\"maxExperience\":" + max + "}";
    }
    private String firstCompanyId(String adminToken) throws Exception {
        return json.readTree(mvc.perform(get("/api/companies").header("Authorization", bearer(adminToken)))
                .andReturn().getResponse().getContentAsString()).get(0).get("id").asText();
    }

    @Test void TC_JOB_01_adminCreatesJob() throws Exception {
        String t = login(ADMIN, PASSWORD);
        String body = jobBody("QA Engineer", 2, 5).replace("{", "{\"companyId\":\"" + firstCompanyId(t) + "\",");
        mvc.perform(post("/api/jobs").header("Authorization", bearer(t)).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().is2xxSuccessful()).andExpect(jsonPath("$.title").value("QA Engineer"));
    }
    @Test void TC_JOB_02_blankTitleRejected() throws Exception {
        String t = login(ADMIN, PASSWORD);
        mvc.perform(post("/api/jobs").header("Authorization", bearer(t)).contentType(MediaType.APPLICATION_JSON)
                .content(jobBody("", 1, 2))).andExpect(status().is4xxClientError());
    }
    @Test void TC_JOB_03_negativeExperienceRejected() throws Exception {
        String t = login(ADMIN, PASSWORD);
        mvc.perform(post("/api/jobs").header("Authorization", bearer(t)).contentType(MediaType.APPLICATION_JSON)
                .content(jobBody("Bad", -1, 2))).andExpect(status().is4xxClientError());
    }
    @Test void TC_JOB_04_unknownJobIs404() throws Exception {
        String t = login(ADMIN, PASSWORD);
        mvc.perform(get("/api/jobs/00000000-0000-0000-0000-000000000000").header("Authorization", bearer(t)))
                .andExpect(status().isNotFound());
    }
    @Test void TC_JOB_05_malformedIdRejected() throws Exception {
        String t = login(ADMIN, PASSWORD);
        mvc.perform(get("/api/jobs/not-a-uuid").header("Authorization", bearer(t))).andExpect(status().is4xxClientError());
    }
    @Test void TC_JOB_06_rankedCandidatesSortedByScore() throws Exception {
        String t = login(ADMIN, PASSWORD);
        String jobId = json.readTree(mvc.perform(get("/api/jobs").header("Authorization", bearer(t)))
                .andReturn().getResponse().getContentAsString()).get(0).get("id").asText();
        JsonNode list = json.readTree(mvc.perform(get("/api/jobs/" + jobId + "/candidates").header("Authorization", bearer(t)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        for (int i = 1; i < list.size(); i++) {
            assertThat(list.get(i - 1).get("matchScore").asInt()).isGreaterThanOrEqualTo(list.get(i).get("matchScore").asInt());
        }
    }

    // ---------- Companies ----------
    @Test void TC_COMP_01_createCompany() throws Exception {
        String t = login(ADMIN, PASSWORD);
        mvc.perform(post("/api/companies").header("Authorization", bearer(t)).contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Acme Test Co\",\"industry\":\"Testing\"}"))
                .andExpect(status().is2xxSuccessful()).andExpect(jsonPath("$.name").value("Acme Test Co"));
    }
    @Test void TC_COMP_02_blankNameRejected() throws Exception {
        String t = login(ADMIN, PASSWORD);
        mvc.perform(post("/api/companies").header("Authorization", bearer(t)).contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"\"}")).andExpect(status().is4xxClientError());
    }

    // ---------- Ingestion ----------
    @Test void TC_ING_01_jsonIngestParsesResume() throws Exception {
        String t = login(ADMIN, PASSWORD);
        String body = "[{\"rawText\":\"Asha Rao\\nasha.rao@example.com | +91 98765 43210\\nB.Tech\\n4 years of experience\\n"
                + "SKILLS\\nJava, Spring Boot, SQL\",\"name\":\"Asha Rao\"}]";
        mvc.perform(post("/api/resumes").header("Authorization", bearer(t)).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().is2xxSuccessful());
    }
    @Test void TC_ING_02_fileIngestAcceptsTextResume() throws Exception {
        String t = login(ADMIN, PASSWORD);
        MockMultipartFile f = new MockMultipartFile("files", "resume.txt", "text/plain",
                "Ravi Kumar\nravi.k@example.com\n3 years of experience\nSKILLS\nJava, Docker, AWS".getBytes());
        mvc.perform(multipart("/api/resumes").file(f).header("Authorization", bearer(t))).andExpect(status().is2xxSuccessful());
    }
    @Test void TC_ING_03_emptyBatchRejectedWith400() throws Exception {
        String t = login(ADMIN, PASSWORD);
        mvc.perform(post("/api/resumes").header("Authorization", bearer(t)).contentType(MediaType.APPLICATION_JSON).content("[]"))
                .andExpect(status().isBadRequest());
    }
    @Test void TC_ING_04_wrongContentTypeRejected() throws Exception {
        String t = login(ADMIN, PASSWORD);
        mvc.perform(post("/api/resumes").header("Authorization", bearer(t)).contentType(MediaType.TEXT_PLAIN).content("hello"))
                .andExpect(status().is4xxClientError());
    }

    // ---------- Dashboard / analytics / reports ----------
    @Test void TC_DASH_01_summaryLoads() throws Exception {
        mvc.perform(get("/api/dashboard/summary").header("Authorization", bearer(login(ADMIN, PASSWORD)))).andExpect(status().isOk());
    }
    @Test void TC_ANL_01_skillsLoads() throws Exception {
        mvc.perform(get("/api/analytics/skills").header("Authorization", bearer(login(ADMIN, PASSWORD)))).andExpect(status().isOk());
    }
    @Test void TC_ANL_02_funnelLoads() throws Exception {
        mvc.perform(get("/api/analytics/funnel").header("Authorization", bearer(login(ADMIN, PASSWORD)))).andExpect(status().isOk());
    }
    @Test void TC_ANL_03_trendLoads() throws Exception {
        mvc.perform(get("/api/analytics/trend").header("Authorization", bearer(login(ADMIN, PASSWORD)))).andExpect(status().isOk());
    }
    @Test void TC_RPT_01_generateAndListReport() throws Exception {
        String t = login(ADMIN, PASSWORD);
        mvc.perform(post("/api/reports/generate").header("Authorization", bearer(t)).contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"QA Report\"}")).andExpect(status().is2xxSuccessful());
        mvc.perform(get("/api/reports").header("Authorization", bearer(t))).andExpect(status().isOk());
    }
}

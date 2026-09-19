package com.hiringintelligence.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiringintelligence.config.AppProperties;
import com.hiringintelligence.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Regression tests for the defects found in the first test cycle (report section 10).
 * PR_01..PR_06 were written as failing probes before the fixes; they now pass.
 */
@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:defectfix;DB_CLOSE_DELAY=-1", "app.seed.enabled=true"})
@AutoConfigureMockMvc
class DefectFixRegressionTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private String login(String email) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"password123\"}"))
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("token").asText();
    }

    @Test
    void PR_01_shortJwtSecretShouldBeRejected() {
        AppProperties p = new AppProperties();
        AppProperties.Jwt jwt = new AppProperties.Jwt();
        jwt.setSecret("short");
        p.setJwt(jwt);
        assertThatThrownBy(() -> new JwtService(p)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void PR_02_repeatedFailedLoginsShouldBeThrottled() throws Exception {
        int last = 0;
        for (int i = 0; i < 15; i++) {
            last = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"victim-a@example.com\",\"password\":\"bad" + i + "\"}"))
                    .andReturn().getResponse().getStatus();
        }
        assertThat(last).isEqualTo(429);
    }

    @Test
    void PR_03_jobWithMinAboveMaxShouldBeRejected() throws Exception {
        String admin = login("ishwari@hiringintelligence.io");
        String companies = mvc.perform(get("/api/companies").header("Authorization", "Bearer " + admin))
                .andReturn().getResponse().getContentAsString();
        String cid = json.readTree(companies).get(0).get("id").asText();
        int status = mvc.perform(post("/api/jobs").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"companyId\":\"" + cid + "\",\"title\":\"Inverted range\",\"description\":\"x\","
                        + "\"requiredSkills\":[\"Java\"],\"minExperience\":10,\"maxExperience\":2}"))
                .andReturn().getResponse().getStatus();
        assertThat(status).isBetween(400, 499);
    }

    @Test
    void PR_04_recruiterShouldNotReadOtherCompanyJobById() throws Exception {
        String admin = login("ishwari@hiringintelligence.io");
        String recruiter = login("rajesh.iyer@northwind.example");
        JsonNode mine = json.readTree(mvc.perform(get("/api/jobs").header("Authorization", "Bearer " + recruiter))
                .andReturn().getResponse().getContentAsString());
        String myCompany = mine.get(0).get("companyId").asText();
        JsonNode all = json.readTree(mvc.perform(get("/api/jobs").header("Authorization", "Bearer " + admin))
                .andReturn().getResponse().getContentAsString());
        String foreignJobId = null;
        for (JsonNode j : all) {
            if (!j.get("companyId").asText().equals(myCompany)) { foreignJobId = j.get("id").asText(); break; }
        }
        int status = mvc.perform(get("/api/jobs/" + foreignJobId).header("Authorization", "Bearer " + recruiter))
                .andReturn().getResponse().getStatus();
        assertThat(status).isIn(403, 404);
    }

    @Test
    void PR_05_executableUploadShouldBeRejected() throws Exception {
        String admin = login("ishwari@hiringintelligence.io");
        MockMultipartFile exe = new MockMultipartFile("files", "malware.exe", "application/octet-stream", new byte[]{'M', 'Z', 0, 1});
        int status = mvc.perform(multipart("/api/resumes").file(exe).header("Authorization", "Bearer " + admin))
                .andReturn().getResponse().getStatus();
        assertThat(status).isBetween(400, 499);
    }

    @Test
    void PR_06_recruiterShouldNotReadCandidateById() throws Exception {
        String admin = login("ishwari@hiringintelligence.io");
        String recruiter = login("rajesh.iyer@northwind.example");
        JsonNode pool = json.readTree(mvc.perform(get("/api/candidates").header("Authorization", "Bearer " + admin))
                .andReturn().getResponse().getContentAsString());
        JsonNode first = pool.isArray() ? pool.get(0) : pool.get("content").get(0);
        int status = mvc.perform(get("/api/candidates/" + first.get("id").asText())
                .header("Authorization", "Bearer " + recruiter)).andReturn().getResponse().getStatus();
        assertThat(status).isIn(403, 404);
    }
    @Test
    void PR_07_pdfUploadIsStillAccepted() throws Exception {
        String admin = login("ishwari@hiringintelligence.io");
        MockMultipartFile pdf = new MockMultipartFile("files", "cv.pdf", "application/pdf", "%PDF-1.4 fake".getBytes());
        int status = mvc.perform(multipart("/api/resumes").file(pdf).header("Authorization", "Bearer " + admin))
                .andReturn().getResponse().getStatus();
        assertThat(status).isEqualTo(200);
    }

    @Test
    void PR_08_emptyFileIsRejected() throws Exception {
        String admin = login("ishwari@hiringintelligence.io");
        MockMultipartFile empty = new MockMultipartFile("files", "empty.txt", "text/plain", new byte[0]);
        int status = mvc.perform(multipart("/api/resumes").file(empty).header("Authorization", "Bearer " + admin))
                .andReturn().getResponse().getStatus();
        assertThat(status).isEqualTo(400);
    }

    @Test
    void PR_09_zeroMaxMeansNoCeilingAndIsAccepted() throws Exception {
        String admin = login("ishwari@hiringintelligence.io");
        String cid = json.readTree(mvc.perform(get("/api/companies").header("Authorization", "Bearer " + admin))
                .andReturn().getResponse().getContentAsString()).get(0).get("id").asText();
        int status = mvc.perform(post("/api/jobs").header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"companyId\":\"" + cid + "\",\"title\":\"Open ended\",\"description\":\"x\","
                        + "\"requiredSkills\":[\"Java\"],\"minExperience\":3,\"maxExperience\":0}"))
                .andReturn().getResponse().getStatus();
        assertThat(status).isEqualTo(200);
    }

    @Test
    void PR_10_throttledLoginReturnsRetryAfterHeader() throws Exception {
        String header = null;
        for (int i = 0; i < 7; i++) {
            header = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"victim-b@example.com\",\"password\":\"nope" + i + "\"}"))
                    .andReturn().getResponse().getHeader("Retry-After");
        }
        assertThat(header).isNotNull();
    }

    @Test
    void PR_11_correctPasswordStillWorksAfterFewFailures() throws Exception {
        for (int i = 0; i < 3; i++) {
            mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"priya@nowhere.test\",\"password\":\"x\"}"));
        }
        assertThat(login("ishwari@hiringintelligence.io")).isNotBlank();
    }
}

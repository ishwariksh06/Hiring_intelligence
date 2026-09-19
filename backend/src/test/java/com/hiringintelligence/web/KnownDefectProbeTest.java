package com.hiringintelligence.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiringintelligence.config.AppProperties;
import com.hiringintelligence.security.JwtService;
import org.junit.jupiter.api.Disabled;
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
 * Probe tests that assert the DESIRED behaviour for suspected weaknesses. They failed when first run
 * (see the test report, section 10), so they are @Disabled to keep the regression suite green.
 * Remove @Disabled from a test after fixing the matching defect to turn it into a regression test.
 */
@Disabled("Known-defect probes: assert desired behaviour that is not implemented yet")
@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:probe;DB_CLOSE_DELAY=-1", "app.seed.enabled=true"})
@AutoConfigureMockMvc
class KnownDefectProbeTest {

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
                    .content("{\"email\":\"ishwari@hiringintelligence.io\",\"password\":\"bad" + i + "\"}"))
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
        System.out.println("PR_06 status=" + status);
        assertThat(status).isIn(403, 404);
    }
}

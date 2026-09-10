package com.quochuystore.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class EmbeddingClientConfig {

    @Value("${ai-service.base-url}")
    private String baseUrl;

    @Value("${ai-service.api-key}")
    private String apiKey;

    @Value("${ai-service.connect-timeout-ms}")
    private long connectTimeoutMs;

    @Value("${ai-service.read-timeout-ms}")
    private long readTimeoutMs;

    @Bean
    public RestClient aiServiceRestClient() {
        // uvicorn (h11) only speaks HTTP/1.1; the JDK client defaults to an HTTP/2
        // cleartext upgrade attempt that h11 rejects, so pin the version explicitly.
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofMillis(connectTimeoutMs))
                .build();

        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofMillis(readTimeoutMs));

        return RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("X-Api-Key", apiKey)
                .requestFactory(requestFactory)
                .build();
    }
}

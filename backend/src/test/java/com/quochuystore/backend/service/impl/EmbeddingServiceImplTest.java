package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.embedding.response.EmbedBatchFailureDto;
import com.quochuystore.backend.dto.embedding.response.EmbedBatchResponseDto;
import com.quochuystore.backend.dto.embedding.response.EmbedBatchResultDto;
import com.quochuystore.backend.dto.embedding.response.EmbeddingResponseDto;
import com.quochuystore.backend.exception.EmbeddingServiceException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmbeddingServiceImplTest {

    @Mock
    private RestClient restClient;

    @Mock
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    private EmbeddingServiceImpl embeddingService;

    private Locale originalLocale;

    @BeforeEach
    void setUp() {
        originalLocale = Locale.getDefault();
        embeddingService = new EmbeddingServiceImpl(restClient);
    }

    @AfterEach
    void tearDown() {
        Locale.setDefault(originalLocale);
    }

    private void mockSuccessfulCall(EmbeddingResponseDto responseDto) {
        lenient().when(restClient.post()).thenReturn(requestBodyUriSpec);
        lenient().when(requestBodyUriSpec.uri(eq("/embed"))).thenReturn(requestBodyUriSpec);
        lenient().when(requestBodyUriSpec.contentType(any(MediaType.class))).thenReturn(requestBodyUriSpec);
        lenient().when(requestBodyUriSpec.body(any(Object.class))).thenReturn(requestBodyUriSpec);
        lenient().when(requestBodyUriSpec.retrieve()).thenReturn(responseSpec);
        lenient().when(responseSpec.body(EmbeddingResponseDto.class)).thenReturn(responseDto);
    }

    @Test
    void embedImage_returnsEmbedding_onHappyPath() {
        float[] expected = new float[512];
        expected[0] = 0.42f;
        mockSuccessfulCall(new EmbeddingResponseDto(expected, true, 0.9));

        float[] result = embeddingService.embedImage("bytes".getBytes(), "shirt.jpg");

        assertThat(result).hasSize(512);
        assertThat(result[0]).isEqualTo(0.42f);
    }

    @Test
    void embedImage_usesDefaultFilename_whenFilenameIsNull() {
        mockSuccessfulCall(new EmbeddingResponseDto(new float[512], false, null));

        assertThat(embeddingService.embedImage("bytes".getBytes(), null)).hasSize(512);
    }

    @Test
    void embedImage_throwsEmbeddingServiceException_whenDimensionIsWrong() {
        mockSuccessfulCall(new EmbeddingResponseDto(new float[128], true, 0.5));

        assertThatThrownBy(() -> embeddingService.embedImage("bytes".getBytes(), "shirt.jpg"))
                .isInstanceOf(EmbeddingServiceException.class)
                .hasMessageContaining("512");
    }

    @Test
    void embedImage_throwsEmbeddingServiceException_whenResponseBodyIsNull() {
        mockSuccessfulCall(null);

        assertThatThrownBy(() -> embeddingService.embedImage("bytes".getBytes(), "shirt.jpg"))
                .isInstanceOf(EmbeddingServiceException.class);
    }

    @Test
    void embedImage_throwsEmbeddingServiceException_whenEmbeddingFieldIsNull() {
        mockSuccessfulCall(new EmbeddingResponseDto(null, false, null));

        assertThatThrownBy(() -> embeddingService.embedImage("bytes".getBytes(), "shirt.jpg"))
                .isInstanceOf(EmbeddingServiceException.class);
    }

    @Test
    void embedImage_wrapsRestClientException_asEmbeddingServiceException() {
        lenient().when(restClient.post()).thenReturn(requestBodyUriSpec);
        lenient().when(requestBodyUriSpec.uri(eq("/embed"))).thenReturn(requestBodyUriSpec);
        lenient().when(requestBodyUriSpec.contentType(any(MediaType.class))).thenReturn(requestBodyUriSpec);
        lenient().when(requestBodyUriSpec.body(any(Object.class))).thenReturn(requestBodyUriSpec);
        lenient().when(requestBodyUriSpec.retrieve()).thenThrow(new RestClientException("connection refused"));

        assertThatThrownBy(() -> embeddingService.embedImage("bytes".getBytes(), "shirt.jpg"))
                .isInstanceOf(EmbeddingServiceException.class)
                .hasCauseInstanceOf(RestClientException.class);
    }

    @Test
    void embedImageUrls_returnsEmptyMap_whenInputIsEmpty() {
        Map<Long, float[]> result = embeddingService.embedImageUrls(Map.of());

        assertThat(result).isEmpty();
    }

    @Test
    void embedImageUrls_returnsOnlySuccesses_whenBatchHasPartialFailures() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(eq("/embed-batch"))).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.contentType(any(MediaType.class))).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.body(any(Object.class))).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.retrieve()).thenReturn(responseSpec);

        float[] embedding1 = new float[512];
        EmbedBatchResponseDto batchResponse = new EmbedBatchResponseDto(
                List.of(new EmbedBatchResultDto(1L, embedding1, true)),
                List.of(new EmbedBatchFailureDto(2L, "404 fetching image")));
        when(responseSpec.body(EmbedBatchResponseDto.class)).thenReturn(batchResponse);

        Map<Long, float[]> result = embeddingService.embedImageUrls(Map.of(1L, "http://a", 2L, "http://b"));

        assertThat(result).hasSize(1);
        assertThat(result).containsKey(1L);
        assertThat(result).doesNotContainKey(2L);
    }

    @Test
    void embedImageUrls_skipsWrongDimensionResults() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(eq("/embed-batch"))).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.contentType(any(MediaType.class))).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.body(any(Object.class))).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.retrieve()).thenReturn(responseSpec);

        EmbedBatchResponseDto batchResponse = new EmbedBatchResponseDto(
                List.of(new EmbedBatchResultDto(1L, new float[128], true)),
                List.of());
        when(responseSpec.body(EmbedBatchResponseDto.class)).thenReturn(batchResponse);

        Map<Long, float[]> result = embeddingService.embedImageUrls(Map.of(1L, "http://a"));

        assertThat(result).isEmpty();
    }

    @Test
    void embedImageUrls_wrapsRestClientException_asEmbeddingServiceException() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(eq("/embed-batch"))).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.contentType(any(MediaType.class))).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.body(any(Object.class))).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.retrieve()).thenThrow(new RestClientException("connection refused"));

        assertThatThrownBy(() -> embeddingService.embedImageUrls(Map.of(1L, "http://a")))
                .isInstanceOf(EmbeddingServiceException.class)
                .hasCauseInstanceOf(RestClientException.class);
    }

    @Test
    void toVectorLiteral_producesDotDecimalFormat_regardlessOfDefaultLocale() {
        Locale.setDefault(Locale.forLanguageTag("vi-VN"));

        String literal = embeddingService.toVectorLiteral(new float[]{0.1f, -0.25f, 1f});

        assertThat(literal).isEqualTo("[0.1,-0.25,1.0]");
        assertThat(literal).doesNotContain(",25").doesNotContain("0,1");
    }

    @Test
    void toVectorLiteral_handlesEmptyArray() {
        assertThat(embeddingService.toVectorLiteral(new float[0])).isEqualTo("[]");
    }
}

package com.quochuystore.backend.controller;

import com.quochuystore.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.PayOS;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PayOS payOS;
    private final OrderService orderService;

    @PostMapping("/payos-webhook")
    public ResponseEntity<Void> handlePayOSWebhook(@RequestBody Webhook webhook) {
        log.info("Received PayOS webhook request: code={}, success={}, desc={}",
                webhook.getCode(), webhook.getSuccess(), webhook.getDesc());

        try {
            // Verify signature using PayOS SDK
            WebhookData data = payOS.webhooks().verify(webhook);

            // Check success: success is true and code is "00"
            boolean isSuccess = Boolean.TRUE.equals(webhook.getSuccess()) && "00".equals(webhook.getCode());

            // Update order status: success -> AWAITING_PICKUP, fail -> CANCELED
            orderService.updateOrderStatusByPayOSCode(data.getOrderCode(), isSuccess);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to verify/process PayOS webhook payload", e);
            // Even if processing fails, return bad request so PayOS can retry or report
            // error
            return ResponseEntity.badRequest().build();
        }
    }
}

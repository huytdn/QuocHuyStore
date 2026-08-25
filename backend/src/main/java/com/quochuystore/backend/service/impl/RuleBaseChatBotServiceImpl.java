package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.config.CacheKeyConstants;
import com.quochuystore.backend.dto.mapper.MessageMapper;
import com.quochuystore.backend.dto.message.response.ConversationResponseDto;
import com.quochuystore.backend.dto.message.response.MessageResponseDto;
import com.quochuystore.backend.dto.voucher.response.VoucherResponseDto;
import com.quochuystore.backend.entity.Conversation;
import com.quochuystore.backend.entity.Message;
import com.quochuystore.backend.entity.Order;
import com.quochuystore.backend.entity.User;
import com.quochuystore.backend.entity.enums.OrderStatus;
import com.quochuystore.backend.entity.enums.UserRole;
import com.quochuystore.backend.repository.ConversationRepository;
import com.quochuystore.backend.repository.MessageRepository;
import com.quochuystore.backend.repository.OrderRepository;
import com.quochuystore.backend.repository.UserRepository;
import com.quochuystore.backend.service.ChatBotService;
import com.quochuystore.backend.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service("ruleBaseChatBotService")
@RequiredArgsConstructor
@Slf4j
public class RuleBaseChatBotServiceImpl implements ChatBotService {

    public static final String SCENARIO_ORDER_STATUS = "Tôi muốn kiểm tra trạng thái đơn hàng của mình";
    public static final String SCENARIO_SIZE_GUIDE = "Tư vấn cho tôi cách chọn size chuẩn";
    public static final String SCENARIO_VOUCHER = "Cho tôi hỏi về các mã giảm giá Voucher đang có";

    private final OrderRepository orderRepository;
    private final VoucherService voucherService;
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("#,###₫");

    @Override
    public void processAutoReply(Conversation conversation, User user, String messageText) {
        if (conversation == null || user == null || messageText == null) {
            return;
        }

        String normalizedText = messageText.trim();
        String replyContent = null;

        // 1. Exact matching for Scenario 1: Kiểm tra trạng thái đơn hàng
        if (SCENARIO_ORDER_STATUS.equalsIgnoreCase(normalizedText)) {
            replyContent = handleOrderStatusQuery(user);
        }
        // 2. Exact matching for Scenario 2: Tư vấn chọn size
        else if (SCENARIO_SIZE_GUIDE.equalsIgnoreCase(normalizedText)) {
            replyContent = handleSizeGuideQuery();
        }
        // 3. Exact matching for Scenario 3: Mã giảm giá Voucher
        else if (SCENARIO_VOUCHER.equalsIgnoreCase(normalizedText)) {
            replyContent = handleVoucherQuery(user);
        }

        // If no scenario matched, return immediately without bot intervention
        if (replyContent == null) {
            return;
        }

        final String finalReply = replyContent;

        // Send asynchronous response with 500ms delay to simulate realistic concierge assistant response
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(500);

                User adminSender = userRepository.findFirstByRole(UserRole.ADMIN).orElse(null);

                Message botMessage = Message.builder()
                        .conversation(conversation)
                        .sender(adminSender)
                        .receiver(user)
                        .content(finalReply)
                        .isRead(false)
                        .build();

                Message savedBotMsg = messageRepository.save(botMessage);

                // Update conversation metadata
                OffsetDateTime now = OffsetDateTime.now();
                conversation.setLastMessage(savedBotMsg.getContent());
                conversation.setUpdatedAt(now);
                conversation.setAdminLastSeenAt(now);
                conversationRepository.save(conversation);

                // Map response DTO
                MessageResponseDto responseDto = MessageMapper.toMessageResponseDto(savedBotMsg);

                // Push to Redis Real-time Buffer
                String cacheKey = CacheKeyConstants.CHAT_ROOM_PREFIX + conversation.getId();
                try {
                    redisTemplate.opsForList().leftPush(cacheKey, responseDto);
                    redisTemplate.opsForList().trim(cacheKey, 0, CacheKeyConstants.CHAT_ROOM_BUFFER_SIZE - 1);
                    redisTemplate.expire(cacheKey, Duration.ofHours(CacheKeyConstants.CHAT_ROOM_TTL_HOURS));
                } catch (Exception ex) {
                    log.warn("Redis buffer push failed for key: {}. Error: {}", cacheKey, ex.getMessage());
                }

                // Broadcast to chat room topic
                messagingTemplate.convertAndSend("/topic/chat/" + conversation.getId(), responseDto);

                // Broadcast conversation update to admin overview stream
                long unreadForAdmin = messageRepository.countUnreadByConversationAndSenderRole(conversation.getId(), UserRole.USER);
                ConversationResponseDto convDto = MessageMapper.toConversationResponseDto(conversation, unreadForAdmin);
                messagingTemplate.convertAndSend("/topic/admin/conversations", convDto);

                log.info("RuleBaseChatBot successfully replied to user {} for conversation {}", user.getId(), conversation.getId());

            } catch (Exception e) {
                log.error("Error executing RuleBaseChatBot auto reply", e);
            }
        });
    }

    /**
     * Scenario 1: Query recent 5 orders from DB and format with #LM-{id} and Vietnamese status names.
     */
    private String handleOrderStatusQuery(User user) {
        Page<Order> recentOrdersPage = orderRepository.findByUserId(
                user.getId(),
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        List<Order> orders = recentOrdersPage.getContent();

        if (orders.isEmpty()) {
            return "Dạ hiện tại bạn chưa có đơn hàng nào tại LUMIÈRE.\n\n" +
                    "Bạn có thể khám phá các bộ sưu tập thời trang mới nhất tại: /product";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Dạ LUMIÈRE xin gửi bạn thông tin các đơn hàng gần đây của bạn:\n\n");

        for (Order order : orders) {
            String shortCode = "LM-" + order.getId();
            String formattedAmount = order.getTotalPrice() != null
                    ? CURRENCY_FORMAT.format(order.getTotalPrice())
                    : "0₫";
            String statusText = formatOrderStatus(order.getStatus());

            sb.append("📦 Đơn #").append(shortCode)
                    .append(" (").append(formattedAmount).append(")")
                    .append(" — Trạng thái: [").append(statusText).append("]\n");
        }

        sb.append("\n👉 Bạn có thể xem chi tiết và lịch sử đơn hàng tại: /orders");
        return sb.toString();
    }

    /**
     * Scenario 2: Return exact size guide table matching LUMIÈRE specifications.
     */
    private String handleSizeGuideQuery() {
        return "Dạ LUMIÈRE xin gửi bạn bảng quy chuẩn kích thước tham khảo:\n\n" +
                "🧥 TOPS (Áo & Vest) [Ngực / Eo / Tay áo]:\n" +
                "• Size S: Ngực 38 | Eo 38 | Tay 22\n" +
                "• Size M: Ngực 42 | Eo 42 | Tay 23\n" +
                "• Size L: Ngực 46 | Eo 46 | Tay 24\n" +
                "• Size XL: Ngực 50 | Eo 48 | Tay 25\n" +
                "• Size 2XL: Ngực 54 | Eo 42 | Tay 25\n" +
                "• Size 3XL: Ngực 58 | Eo 46 | Tay 26\n\n" +
                "👖 BOTTOMS (Quần âu & Váy) [Eo / Mông / Dài đáy]:\n" +
                "• Size S: Eo 68 | Mông 36 | Dài đáy 72\n" +
                "• Size M: Eo 70 | Mông 38 | Dài đáy 72\n" +
                "• Size L: Eo 72 | Mông 40 | Dài đáy 72\n" +
                "• Size XL: Eo 26 | Mông 42 | Dài đáy 77\n" +
                "• Size 2XL: Eo 30 | Mông 44 | Dài đáy 77\n" +
                "• Size 3XL: Eo 34 | Mông 46 | Dài đáy 77\n\n" +
                "👉 Bạn có thể bấm vào mục 'Bảng size' tại từng trang chi tiết sản phẩm để xem hình ảnh trực quan!";
    }

    /**
     * Scenario 3: Query active public vouchers from VoucherService (Redis Cache backed) and format list.
     */
    private String handleVoucherQuery(User user) {
        try {
            List<VoucherResponseDto> publicVouchers = voucherService.getPublicVouchers(user.getId());

            List<VoucherResponseDto> usableVouchers = publicVouchers.stream()
                    .filter(v -> Boolean.TRUE.equals(v.getCanUse()))
                    .toList();

            if (usableVouchers.isEmpty()) {
                return "Dạ hiện tại LUMIÈRE chưa có mã giảm giá mới khả dụng cho tài khoản của bạn.\n\n" +
                        "Bạn hãy theo dõi thêm các chương trình khuyến mãi tại bước Giỏ hàng / Đặt hàng khi mua sắm nhé!";
            }

            StringBuilder sb = new StringBuilder();
            sb.append("Dạ LUMIÈRE xin gửi bạn các mã ưu đãi độc quyền đang có hiệu lực:\n\n");

            for (VoucherResponseDto v : usableVouchers) {
                String minOrder = v.getMinOrderAmount() != null
                        ? CURRENCY_FORMAT.format(v.getMinOrderAmount())
                        : "0₫";
                String maxDiscount = v.getMaxDiscountAmount() != null
                        ? " (Tối đa " + CURRENCY_FORMAT.format(v.getMaxDiscountAmount()) + ")"
                        : "";

                sb.append("🎟️ Mã: ").append(v.getCode())
                        .append(" — Giảm ").append(v.getDiscountPercent()).append("%")
                        .append(maxDiscount)
                        .append(" cho đơn từ ").append(minOrder)
                        .append("\n");
            }

            sb.append("\n👉 Bạn có thể xem chi tiết điều kiện và chọn áp dụng mã trực tiếp tại bước Giỏ hàng / Đặt hàng nhé!");
            return sb.toString();

        } catch (Exception e) {
            log.error("Error retrieving vouchers for chatbot", e);
            return "Dạ bạn có thể kiểm tra và chọn áp dụng toàn bộ các mã ưu đãi hiện có trực tiếp tại bước Giỏ hàng / Đặt hàng nhé!";
        }
    }

    /**
     * Map OrderStatus enum to user-friendly Vietnamese text.
     */
    private String formatOrderStatus(OrderStatus status) {
        if (status == null) return "Đang xử lý";
        return switch (status) {
            case PENDING_APPROVAL -> "Chờ xác nhận";
            case PENDING_PAYMENT -> "Chờ thanh toán";
            case AWAITING_PICKUP -> "Đang chuẩn bị hàng";
            case IN_TRANSIT -> "Đang vận chuyển";
            case DELIVERED -> "Giao thành công";
            case DELIVERY_FAILED -> "Giao không thành công";
            case CANCELED -> "Đã hủy";
        };
    }
}

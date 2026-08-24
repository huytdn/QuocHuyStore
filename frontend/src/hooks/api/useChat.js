import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "../../store/useAuthStore";

/**
 * Lấy phòng chat của Khách hàng hiện tại (Tự tạo nếu chưa có)
 * Endpoint: GET /messages/my-conversation
 */
export const useMyConversation = (enabled = true) => {
  return useQuery({
    queryKey: ["my-conversation"],
    queryFn: async () => {
      const response = await axiosClient.get("/messages/my-conversation");
      return response.data; // ConversationResponseDto
    },
    enabled,
    retry: 1,
  });
};

/**
 * Lấy lịch sử tin nhắn trong phòng chat (Có phân trang)
 * Endpoint: GET /messages
 * Params: { page, size, conversationId }
 */
export const useChatMessages = (params = {}, enabled = true) => {
  return useQuery({
    queryKey: ["chat-messages", params],
    queryFn: async () => {
      const response = await axiosClient.get("/messages", { params });
      return response.data; // PageResponseDto<MessageResponseDto>
    },
    enabled: enabled && (!!params.conversationId || params.conversationId === 0),
    refetchInterval: false,
  });
};

/**
 * Gửi tin nhắn qua REST API (Fallback / REST)
 * Endpoint: POST /messages
 * Payload: { conversationId, receiverId, content }
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosClient.post("/messages", payload);
      return response.data; // MessageResponseDto
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      queryClient.invalidateQueries({ queryKey: ["my-conversation"] });
      queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
    },
  });
};

/**
 * Đánh dấu đã đọc tin nhắn trong cuộc hội thoại (REST)
 * Endpoint: PATCH /messages/{conversationId}/read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId) => {
      if (!conversationId) return null;
      const response = await axiosClient.patch(`/messages/${conversationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-conversation"] });
      queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
    },
  });
};

/**
 * Lấy danh sách hội thoại khách hàng dành cho Admin
 * Endpoint: GET /admin/conversations
 * Params: { page, size, search }
 */
export const useAdminConversations = (params = {}, enabled = true) => {
  return useQuery({
    queryKey: ["admin-conversations", params],
    queryFn: async () => {
      const response = await axiosClient.get("/admin/conversations", { params });
      return response.data; // PageResponseDto<ConversationResponseDto>
    },
    enabled,
  });
};

/**
 * Helper khởi tạo STOMP Client duy nhất kết nối tới WebSocket Gateway (/api/v1/ws)
 */
export const initStompClient = ({ onConnect, onError, onDisconnect }) => {
  const token = useAuthStore.getState().accessToken;

  // Endpoint WebSocket trùng khớp với hợp đồng: /api/v1/ws (dùng SockJS fallback)
  const wsUrl = "http://localhost:8080/api/v1/ws";

  const client = new Client({
    webSocketFactory: () => new SockJS(wsUrl),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (str) => {
      if (process.env.NODE_ENV === "development") {
        // console.log("[STOMP]:", str);
      }
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = (frame) => {
    if (onConnect) onConnect(client, frame);
  };

  client.onStompError = (frame) => {
    console.error("[STOMP Error]:", frame.headers?.message);
    if (onError) onError(frame);
  };

  client.onWebSocketClose = () => {
    if (onDisconnect) onDisconnect();
  };

  client.activate();
  return client;
};

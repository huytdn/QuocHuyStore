package com.quochuystore.backend.service;

import com.quochuystore.backend.entity.Conversation;
import com.quochuystore.backend.entity.User;

public interface ChatBotService {

    /**
     * Process rule-based auto-reply for incoming user chat message.
     * Matches exact scenario queries and sends an asynchronous response from ADMIN/Concierge.
     *
     * @param conversation The chat conversation
     * @param user         The sender user
     * @param messageText  The message content sent by user
     */
    void processAutoReply(Conversation conversation, User user, String messageText);
}

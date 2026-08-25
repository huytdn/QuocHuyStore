import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { FiSend, FiSearch, FiUser, FiMessageSquare } from "react-icons/fi";
import {
  useAdminConversations,
  useChatMessages,
  useSendMessage,
  useMarkAsRead,
  initStompClient,
} from "../../hooks/api/useChat";

const AdminMessages = () => {
  const [activeConvId, setActiveConvId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [liveSocketMessages, setLiveSocketMessages] = useState([]);
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);

  const stompClientRef = useRef(null);
  const chatBodyRef = useRef(null);
  const activeConvIdRef = useRef(activeConvId);

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  // 1. Fetch Conversations List for Admin
  const { data: convsPageData, isLoading: isConvsLoading, refetch: refetchConvs } = useAdminConversations({
    page: 0,
    size: 50,
    search: searchQuery.trim() || undefined,
  });

  const conversations = convsPageData?.content || [];
  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  // 2. Fetch Messages for active conversation
  const { data: historyPage, isLoading: isHistoryLoading } = useChatMessages(
    { conversationId: activeConvId, page: 0, size: 50 },
    !!activeConvId
  );

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // 3. Setup STOMP WebSocket Connection for Admin
  useEffect(() => {
    const client = initStompClient({
      onConnect: (stomp, frame) => {
        stompClientRef.current = stomp;

        // Subscribe to Admin-wide conversations channel
        stomp.subscribe("/topic/admin/conversations", () => {
          try {
            refetchConvs();
          } catch (e) {
            console.error("Admin conv update parse error", e);
          }
        });
      },
    });

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  // 4. Subscribe to active conversation room topic
  useEffect(() => {
    if (!activeConvId || !stompClientRef.current?.connected) return;

    // Mark active conversation as read
    markAsReadMutation.mutate(activeConvId);

    const subscription = stompClientRef.current.subscribe(
      `/topic/chat/${activeConvId}`,
      (messageFrame) => {
        try {
          const body = JSON.parse(messageFrame.body);

          if (body.type === "TYPING") {
            if (body.senderRole === "USER") {
              setIsOpponentTyping(!!body.isTyping);
            }
          } else if (body.type === "READ_RECEIPT") {
            // Read receipt update
          } else {
            // New message
            setLiveSocketMessages((prev) => {
              if (prev.some((m) => m.id === body.id)) return prev;
              return [...prev, body];
            });
            setIsOpponentTyping(false);
            markAsReadMutation.mutate(activeConvId);
          }
        } catch (e) {
          console.error("Parse WS room error", e);
        }
      }
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [activeConvId]);

  // Combine REST History + Live Socket Messages
  const displayMessages = useMemo(() => {
    const restMessages = historyPage?.content || [];
    // Sort REST messages ascending by createdAt / id
    const sortedRest = [...restMessages].reverse();

    const combined = [...sortedRest];
    liveSocketMessages.forEach((liveMsg) => {
      if (liveMsg.conversationId === activeConvId && !combined.some((m) => m.id === liveMsg.id)) {
        combined.push(liveMsg);
      }
    });

    return combined;
  }, [historyPage, liveSocketMessages, activeConvId]);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, activeConvId, isOpponentTyping]);

  // Typing event
  const handleTypingInput = (e) => {
    const text = e.target.value;
    setReplyInput(text);

    if (stompClientRef.current?.connected && activeConvId) {
      stompClientRef.current.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify({
          conversationId: activeConvId,
          isTyping: text.length > 0,
        }),
      });
    }
  };

  // Send Reply
  const handleSendReply = (e) => {
    if (e) e.preventDefault();
    const content = replyInput.trim();
    if (!content || !activeConvId) return;

    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          conversationId: activeConvId,
          content,
        }),
      });
    } else {
      sendMessageMutation.mutate({
        conversationId: activeConvId,
        content,
      });
    }

    setReplyInput("");
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-[#fbf9f9] text-[#1b1c1c] font-dmsans min-h-screen flex text-left">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab="messages" />

      {/* Main Content Area */}
      <main className="ml-56 flex-1 h-screen flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <AdminHeader />

        {/* Messaging 3-Pane Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Pane 1: Inbox Sidebar */}
          <aside className="w-80 border-r border-[#cfc4c5] bg-[#fbf9f9] flex flex-col overflow-y-auto shrink-0">
            <div className="p-6 border-b border-[#cfc4c5]">
              <h2 className="font-serif text-2xl font-bold text-black mb-4 uppercase tracking-wider">
                Tin nhắn
              </h2>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tin nhắn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#f5f3f3] border-none border-b border-[#cfc4c5] focus:ring-0 focus:border-black font-sans text-xs text-black placeholder:text-neutral-500 outline-none"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {isConvsLoading ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  Đang tải danh sách cuộc trò chuyện...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-400 italic">
                  Hiện chưa có cuộc trò chuyện nào
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  const hasUnread = (conv.unreadCount || 0) > 0;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setLiveSocketMessages([]);
                        if ((conv.unreadCount || 0) > 0) {
                          markAsReadMutation.mutate(conv.id);
                        }
                      }}
                      className={`p-5 border-b border-[#cfc4c5] cursor-pointer transition-colors ${
                        isActive
                          ? "bg-[#efeded] border-l-4 border-l-black"
                          : "bg-[#fbf9f9] hover:bg-[#f5f3f3]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h3
                          className={`font-sans text-sm ${
                            isActive || hasUnread ? "font-bold text-black" : "font-medium text-neutral-800"
                          }`}
                        >
                          {conv.userDisplayName || conv.username || `Hội thoại #${conv.id}`}
                        </h3>
                        <span className="label-sm text-[10px] text-neutral-400 font-mono">
                          {formatTime(conv.updatedAt)}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-neutral-500 truncate mb-3 leading-relaxed">
                        {conv.lastMessage || "Chưa có tin nhắn"}
                      </p>
                      <div className="flex gap-2 flex-wrap items-center">
                        {hasUnread && (
                          <span className="px-2 py-0.5 font-sans font-bold text-[9px] uppercase tracking-widest bg-black text-white">
                            {conv.unreadCount} Chưa đọc
                          </span>
                        )}
                        <span className="px-2 py-0.5 font-sans font-bold text-[9px] uppercase tracking-widest bg-[#e9dfcb] text-[#696253] border border-[#cfc4c5]">
                          Hỗ trợ
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#fbf9f9] select-none min-h-[500px]">
              <div className="w-16 h-16 bg-neutral-200/80 border border-neutral-300 rounded-full flex items-center justify-center text-neutral-400 mb-4 shadow-2xs">
                <FiMessageSquare size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-black uppercase tracking-wide mb-2">
                Chọn cuộc trò chuyện
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                Vui lòng chọn một khách hàng từ danh sách bên trái để bắt đầu xem lịch sử cuộc hội thoại và gửi tin nhắn phản hồi.
              </p>
            </div>
          ) : (
            <>
              {/* Pane 2: Main Chat Area */}
              <section className="flex-1 flex flex-col bg-white relative min-w-0">
                {/* Active Chat Header */}
                <div className="p-6 border-b border-[#cfc4c5] flex justify-between items-center bg-[#fbf9f9]">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-black">
                      {activeConv?.userDisplayName || activeConv?.username || "Khách hàng"}
                    </h2>
                    <p className="font-sans text-xs text-neutral-500 mt-0.5">
                      Phòng chat #{activeConv?.id} • Cập nhật gần nhất: {formatTime(activeConv?.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Chat Messages Body */}
                <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#fbf9f9]">
                  {isHistoryLoading ? (
                    <div className="py-12 text-center text-xs text-neutral-400">
                      Đang tải tin nhắn...
                    </div>
                  ) : displayMessages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-neutral-400 italic">
                      Chưa có tin nhắn trong cuộc hội thoại này
                    </div>
                  ) : (
                    displayMessages.map((msg) => {
                      const isAdmin = msg.senderRole === "ADMIN";

                      return (
                        <div
                          key={msg.id || `${msg.createdAt}-${Math.random()}`}
                          className={`flex flex-col max-w-2xl ${
                            isAdmin ? "items-end ml-auto" : "items-start"
                          }`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-xl border shadow-2xs font-sans text-xs md:text-sm leading-relaxed whitespace-pre-line ${
                              isAdmin
                                ? "bg-black text-white border-black rounded-tr-none"
                                : "bg-[#f5f3f3] border-[#cfc4c5] text-black rounded-tl-none"
                            }`}
                          >
                            <p>{msg.content}</p>
                          </div>
                          <span className="label-sm text-[10px] text-neutral-400 mt-2 mx-1 font-mono">
                            {isAdmin
                              ? `Admin (${msg.senderDisplayName || "You"}) • ${formatTime(msg.createdAt)}`
                              : `${msg.senderDisplayName || activeConv?.userDisplayName || "Khách hàng"} • ${formatTime(msg.createdAt)}`}
                          </span>
                        </div>
                      );
                    })
                  )}

                  {/* Typing indicator */}
                  {isOpponentTyping && (
                    <div className="text-xs text-neutral-400 italic font-mono">
                      Khách hàng đang gõ tin nhắn...
                    </div>
                  )}
                </div>

                {/* Message Reply Input */}
                <div className="p-6 border-t border-[#cfc4c5] bg-[#fbf9f9]">
                  <form onSubmit={handleSendReply} className="relative">
                    <textarea
                      rows={3}
                      value={replyInput}
                      onChange={handleTypingInput}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      placeholder="Nhập tin nhắn phản hồi..."
                      className="w-full p-4 border border-[#cfc4c5] bg-white focus:ring-0 focus:border-black font-sans text-xs md:text-sm text-black placeholder:text-neutral-400 outline-none resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!replyInput.trim()}
                      className="absolute bottom-4 right-4 p-3 bg-black text-white hover:bg-neutral-800 transition-colors disabled:opacity-30 cursor-pointer flex items-center justify-center"
                      title="Gửi phản hồi"
                    >
                      <FiSend size={16} />
                    </button>
                  </form>
                </div>
              </section>

              {/* Pane 3: Customer Profile Sidebar */}
              <aside className="w-96 border-l border-[#cfc4c5] bg-[#fbf9f9] overflow-y-auto hidden lg:block shrink-0">
                <div className="p-8">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold font-serif mb-4 shadow-xs">
                      {(activeConv?.userDisplayName || "U").charAt(0).toUpperCase()}
                    </div>
                    <h2 className="font-serif text-xl font-bold text-black">
                      {activeConv?.userDisplayName || activeConv?.username || "Khách hàng"}
                    </h2>
                    <p className="font-sans text-xs text-neutral-500 mt-1">
                      ID: {activeConv?.userId || "N/A"}
                    </p>
                    <div className="mt-3 px-3 py-1 bg-[#e9dfcb] border border-[#cfc4c5] inline-block">
                      <span className="font-sans text-[10px] font-bold text-[#696253] uppercase tracking-widest">
                        LUMIÈRE Member
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#cfc4c5] mb-6"></div>

                  {/* Details Sections */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-sans text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                        Thông tin Hội thoại
                      </h3>
                      <ul className="space-y-2.5 font-sans text-xs text-black">
                        <li className="flex justify-between">
                          <span className="text-neutral-500">Mã phòng:</span>
                          <span className="font-mono font-bold">#{activeConv?.id}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-neutral-500">Tin chưa đọc:</span>
                          <span className="font-bold text-red-600">{activeConv?.unreadCount || 0}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-neutral-500">Tài khoản:</span>
                          <span className="font-semibold">{activeConv?.username || "Guest"}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>
              </aside>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminMessages;

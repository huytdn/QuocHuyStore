import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiSend,
  FiPaperclip,
  FiSmile,
  FiMessageSquare,
  FiCheckCircle,
  FiPhoneCall,
  FiHelpCircle,
  FiUser,
  FiChevronRight,
  FiShield,
} from "react-icons/fi";
import Footer from "../components/Footer";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import {
  useMyConversation,
  useChatMessages,
  useSendMessage,
  useMarkAsRead,
  initStompClient,
} from "../hooks/api/useChat";

const Support = () => {
  const user = useAuthStore((state) => state.user);
  const isUserLoggedIn = useAuthStore((state) => !!state.accessToken);

  const [inputMessage, setInputMessage] = useState("");
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const [liveSocketMessages, setLiveSocketMessages] = useState([]);

  const stompClientRef = useRef(null);
  const chatBodyRef = useRef(null);

  // Backend API Queries
  const { data: myConv, isLoading: isConvLoading } =
    useMyConversation(isUserLoggedIn);
  const conversationId = myConv?.id;

  const { data: historyPage, isLoading: isHistoryLoading } = useChatMessages(
    { conversationId, page: 0, size: 50 },
    isUserLoggedIn && !!conversationId,
  );

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  const resetUserUnread = useChatStore((state) => state.resetUserUnread);

  // STOMP WebSocket Integration
  useEffect(() => {
    if (!isUserLoggedIn || !conversationId) return;

    // Mark conversation as read on enter & reset store unread badge
    markAsReadMutation.mutate(conversationId);
    resetUserUnread();

    const client = initStompClient({
      onConnect: (stomp, frame) => {
        stompClientRef.current = stomp;

        // Subscribe to room topic
        stomp.subscribe(`/topic/chat/${conversationId}`, (messageFrame) => {
          try {
            const body = JSON.parse(messageFrame.body);

            if (body.type === "TYPING") {
              if (body.senderId !== user?.id) {
                setIsOpponentTyping(!!body.isTyping);
              }
            } else if (body.type === "READ_RECEIPT") {
              // Message read update
            } else {
              // New MessageResponseDto or ChatEventDto
              setLiveSocketMessages((prev) => {
                const exists = prev.some((m) => m.id === body.id);
                if (exists) return prev;
                return [...prev, body];
              });
              setIsOpponentTyping(false);
              markAsReadMutation.mutate(conversationId);
            }
          } catch (e) {
            console.error("Parse WS error", e);
          }
        });
      },
    });

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [isUserLoggedIn, conversationId]);

  // Combine REST History + Live Socket Messages
  const displayMessages = useMemo(() => {
    if (!isUserLoggedIn) return [];

    const restMessages = historyPage?.content || [];
    // Sort REST messages ascending by createdAt / id
    const sortedRest = [...restMessages].reverse();

    // Merge live socket messages avoiding duplicates
    const combined = [...sortedRest];
    liveSocketMessages.forEach((liveMsg) => {
      if (!combined.some((m) => m.id === liveMsg.id)) {
        combined.push(liveMsg);
      }
    });

    return combined;
  }, [historyPage, liveSocketMessages, isUserLoggedIn]);

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
  }, [displayMessages, isOpponentTyping]);

  // Send Typing event via STOMP
  const handleTypingInput = (e) => {
    const text = e.target.value;
    setInputMessage(text);

    if (
      stompClientRef.current &&
      stompClientRef.current.connected &&
      conversationId
    ) {
      stompClientRef.current.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify({
          conversationId,
          isTyping: text.length > 0,
        }),
      });
    }
  };

  // Send Message (WebSocket or REST Fallback)
  const handleSendMessage = (textToSend) => {
    const content = (textToSend || inputMessage).trim();
    if (!content) return;

    if (isUserLoggedIn && conversationId) {
      // 1. Try sending via WebSocket STOMP
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
          destination: "/app/chat.send",
          body: JSON.stringify({
            conversationId,
            content,
          }),
        });
      } else {
        // 2. Fallback to REST API
        sendMessageMutation.mutate({
          conversationId,
          content,
        });
      }
    } else {
      // Guest local simulation mode
      const guestMsg = {
        id: Date.now(),
        senderRole: "USER",
        senderDisplayName: user?.displayName || "Khách hàng",
        content,
        createdAt: new Date().toISOString(),
      };
      setLiveSocketMessages((prev) => [...prev, guestMsg]);

      // Simulated Concierge response for Guests
      setTimeout(() => {
        setLiveSocketMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            senderRole: "ADMIN",
            senderDisplayName: "LUMIÈRE Concierge",
            content:
              "Cảm ơn bạn đã nhắn tin! Vui lòng Đăng nhập tài khoản để nhận hỗ trợ trực tiếp và lưu lịch sử trao đổi nhé.",
            createdAt: new Date().toISOString(),
          },
        ]);
      }, 1000);
    }

    setInputMessage("");
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const quickTopics = [
    {
      label: "Kiểm tra đơn hàng",
      query: "Tôi muốn kiểm tra trạng thái đơn hàng của mình",
    },
    { label: "Tư vấn chọn Size", query: "Tư vấn cho tôi cách chọn size chuẩn" },
    {
      label: "Mã giảm giá Voucher",
      query: "Cho tôi hỏi về các mã giảm giá Voucher đang có",
    },
  ];

  return (
    <div className="bg-[#fbf9f9] text-black min-h-screen flex flex-col font-dmsans pt-20">
      {/* Main Content Container */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-6 md:px-10 py-10 flex flex-col items-center justify-center">
        {/* Page Header */}
        <header className="w-full text-center mb-8">
          <span className="label-sm text-neutral-500 tracking-[0.25em] text-[10px] md:text-xs font-semibold uppercase mb-2 block">
            HỖ TRỢ KHÁCH HÀNG
          </span>
          <h1 className="font-serif text-[32px] md:text-[44px] font-bold text-black uppercase tracking-tight mb-3">
            LUMIÈRE Concierge
          </h1>
          <p className="body-md text-neutral-600 max-w-2xl mx-auto text-xs md:text-sm font-light leading-relaxed">
            Dịch vụ tư vấn thời trang cao cấp & hỗ trợ trực tuyến 24/7. Kết nối
            trực tiếp với đội ngũ chuyên gia và bộ phận Chăm sóc Khách hàng của
            LUMIÈRE.
          </p>
        </header>

        {/* Chat Container Window */}
        <div className="w-full max-w-5xl bg-white border border-neutral-200 shadow-sm flex flex-col md:flex-row h-[72vh] min-h-[600px] overflow-hidden text-left">
          {/* Left Sidebar: Conversations & Specialist Info */}
          <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-neutral-200 bg-[#f8f7f5] p-6 flex flex-col justify-between shrink-0">
            <div>
              <div className="flex items-center gap-3.5 pb-6 border-b border-neutral-200">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-300 shrink-0">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3Ud0kcMXQ9BE51B37tfczo3JrXU5Xe0mdDoSZNNMDj_K0VJq7yJ11RuU6PskczsHGzVnuSnWgPSAG_kYafB7LsmlkRg44BSiUzNwYg4PcBMRX8H6oZZ45R_hUuQ3vihe0VDtUsp6RiZlUCp6rs1W1PAmtYfCmS08WklGUA2QQSs-4iAk717tOSWut1-GatfhSUBGKXP6QPBBzWGTHbIJnnjYJIRLwrhk7p6tuWC3wsUQkokutNm3a"
                    alt="LUMIÈRE Concierge Representative"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-black leading-tight">
                    LUMIÈRE Concierge
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span className="label-sm text-[10px] text-emerald-800 font-bold tracking-wider uppercase">
                      Đang trực tuyến
                    </span>
                  </div>
                </div>
              </div>

              {/* User Identity Info */}
              <div className="py-5 border-b border-neutral-200 text-xs space-y-2">
                <p className="text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">
                  Tài khoản kết nối
                </p>
                {isUserLoggedIn ? (
                  <div className="flex items-center gap-2 text-black font-semibold">
                    <FiUser size={14} className="text-neutral-500" />
                    <span>{user?.displayName || user?.email}</span>
                  </div>
                ) : (
                  <p className="text-neutral-500 italic text-[11px]">
                    Khách vãng lai (Vui lòng{" "}
                    <Link
                      to="/login"
                      className="text-black font-bold underline"
                    >
                      đăng nhập
                    </Link>{" "}
                    để đồng bộ lịch sử đơn)
                  </p>
                )}
              </div>

              {/* Quick Topics Selection */}
              <div className="pt-5 space-y-2.5">
                <p className="text-neutral-500 uppercase tracking-wider font-semibold text-[10px] mb-3">
                  Chủ đề gợi ý nhanh
                </p>
                {quickTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(topic.query)}
                    className="w-full text-left text-xs bg-white hover:bg-neutral-100 border border-neutral-200 p-2.5 flex items-center justify-between text-neutral-800 font-medium transition-colors cursor-pointer group"
                  >
                    <span>{topic.label}</span>
                    <FiChevronRight
                      size={14}
                      className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Hotline & Security Badge */}
            <div className="pt-6 border-t border-neutral-200 mt-auto text-[11px] text-neutral-500 space-y-2">
              <div className="flex items-center gap-2 text-black font-semibold">
                <FiPhoneCall size={14} className="text-black" />
                <span>Hotline: 1900 8888 (8:00 - 21:00)</span>
              </div>
              <p className="text-[10px] text-neutral-400">
                Bảo mật dữ liệu hội thoại mã hóa 256-bit chuẩn LUMIÈRE Archive.
              </p>
            </div>
          </aside>

          {/* Right Main Chat Area */}
          <section className="flex-1 flex flex-col bg-white relative">
            {/* Chat Room Header */}
            <div className="p-4 md:p-6 border-b border-neutral-200 flex items-center justify-between bg-[#FAF8F5]/80 backdrop-blur-xs z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-neutral-300 md:hidden">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3Ud0kcMXQ9BE51B37tfczo3JrXU5Xe0mdDoSZNNMDj_K0VJq7yJ11RuU6PskczsHGzVnuSnWgPSAG_kYafB7LsmlkRg44BSiUzNwYg4PcBMRX8H6oZZ45R_hUuQ3vihe0VDtUsp6RiZlUCp6rs1W1PAmtYfCmS08WklGUA2QQSs-4iAk717tOSWut1-GatfhSUBGKXP6QPBBzWGTHbIJnnjYJIRLwrhk7p6tuWC3wsUQkokutNm3a"
                    alt="LUMIÈRE Concierge"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base md:text-lg text-black leading-tight">
                    LUMIÈRE Support
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span className="label-sm text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">
                      Concierge Online
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <FiShield size={16} className="text-emerald-700" />
                <span className="hidden sm:inline">Hỗ trợ chính hãng</span>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div
              ref={chatBodyRef}
              className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 bg-[#fbf9f9]"
            >
              {/* Today Time Divider */}
              <div className="text-center w-full my-2">
                <span className="label-sm text-[10px] text-neutral-400 uppercase tracking-widest bg-white border border-neutral-200 px-3 py-1 font-mono">
                  HÔM NAY / TODAY
                </span>
              </div>

              {/* Initial Welcome Banner if history is empty */}
              {isUserLoggedIn &&
                !isHistoryLoading &&
                displayMessages.length === 0 && (
                  <div className="bg-[#f5f3f3] border border-neutral-200 p-4 rounded-md text-xs text-neutral-700 leading-relaxed max-w-md self-start">
                    Xin chào <strong>{user?.displayName}</strong>! Cảm ơn bạn đã
                    liên hệ với LUMIÈRE Concierge. Hãy gửi câu hỏi hoặc thắc mắc
                    của bạn bên dưới để bộ phận Hỗ trợ phục vụ bạn nhé!
                  </div>
                )}

              {/* Render Messages */}
              {displayMessages.map((msg) => {
                const isUser =
                  msg.senderRole === "USER" || msg.senderId === user?.id;

                return (
                  <div
                    key={msg.id || `${msg.createdAt}-${Math.random()}`}
                    className={`flex items-end gap-3 max-w-[85%] ${
                      isUser ? "self-end flex-row-reverse" : "self-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-neutral-200 hidden md:block">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3Ud0kcMXQ9BE51B37tfczo3JrXU5Xe0mdDoSZNNMDj_K0VJq7yJ11RuU6PskczsHGzVnuSnWgPSAG_kYafB7LsmlkRg44BSiUzNwYg4PcBMRX8H6oZZ45R_hUuQ3vihe0VDtUsp6RiZlUCp6rs1W1PAmtYfCmS08WklGUA2QQSs-4iAk717tOSWut1-GatfhSUBGKXP6QPBBzWGTHbIJnnjYJIRLwrhk7p6tuWC3wsUQkokutNm3a"
                          alt="Concierge Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-3.5 py-2.5 text-xs md:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                          isUser
                            ? "bg-black text-white rounded-xl rounded-tr-none"
                            : "bg-[#f5f3f3] text-black border border-neutral-200 rounded-xl rounded-tl-none"
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="label-sm text-[10px] text-neutral-400 font-mono">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        {isUser && msg.isRead && (
                          <span className="text-[10px] text-emerald-700 font-bold uppercase">
                            • Đã xem
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isOpponentTyping && (
                <div className="flex items-center gap-2 text-xs text-neutral-400 self-start italic">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-neutral-200">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3Ud0kcMXQ9BE51B37tfczo3JrXU5Xe0mdDoSZNNMDj_K0VJq7yJ11RuU6PskczsHGzVnuSnWgPSAG_kYafB7LsmlkRg44BSiUzNwYg4PcBMRX8H6oZZ45R_hUuQ3vihe0VDtUsp6RiZlUCp6rs1W1PAmtYfCmS08WklGUA2QQSs-4iAk717tOSWut1-GatfhSUBGKXP6QPBBzWGTHbIJnnjYJIRLwrhk7p6tuWC3wsUQkokutNm3a"
                      alt="Concierge Avatar"
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                  <span>LUMIÈRE Concierge đang soạn phản hồi...</span>
                </div>
              )}
            </div>

            {/* Bottom Message Input Controls */}
            <div className="p-4 md:p-6 border-t border-neutral-200 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-end gap-3"
              >
                <button
                  type="button"
                  onClick={() =>
                    alert("Tính năng đính kèm tệp sẽ khả dụng sớm!")
                  }
                  className="p-2.5 text-neutral-400 hover:text-black transition-colors cursor-pointer rounded-full hover:bg-neutral-100"
                  title="Đính kèm tệp"
                >
                  <FiPaperclip size={18} />
                </button>

                <div className="flex-1 relative">
                  <textarea
                    rows={1}
                    value={inputMessage}
                    onChange={handleTypingInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Nhập nội dung tin nhắn của bạn tại đây..."
                    className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-xs md:text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors rounded-none resize-none min-h-[46px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="bg-black text-white h-11 w-11 flex items-center justify-center hover:bg-neutral-800 transition-colors disabled:opacity-30 cursor-pointer shrink-0"
                  title="Gửi tin nhắn"
                >
                  <FiSend size={16} />
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* Detailed Footer */}
      <Footer variant="detailed" />
    </div>
  );
};

export default Support;

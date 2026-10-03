import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  Cpu,
  Zap,
  HelpCircle,
  RotateCcw,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatVnd } from "../../lib/cart";
import { MarkdownContent } from "./MarkdownContent";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  suggestedBuild?: {
    title: string;
    totalPrice: number;
    items: { slot: string; name: string; price: number }[];
    builderParams?: string;
  };
}

const QUICK_PROMPTS = [
  "Tư vấn build PC 15 - 20 triệu chơi game mượt",
  "Cấu hình làm đồ họa 2D & dựng video Premiere 4K",
  "Nguồn 650W có gánh được card RTX 4070 không?",
  "So sánh Intel Core i5-13400F và Ryzen 5 7600",
  "Chính sách bảo hành và đổi trả 1-đổi-1 ra sao?",
];

function generateAiResponse(userText: string): {
  text: string;
  suggestedBuild?: ChatMessage["suggestedBuild"];
} {
  const query = userText.toLowerCase();

  // 1. Tư vấn cấu hình chơi game 15 - 20 triệu
  if (
    (query.includes("chơi game") ||
      query.includes("game") ||
      query.includes("gaming")) &&
    (query.includes("15") || query.includes("20") || query.includes("triệu"))
  ) {
    return {
      text:
        `Chào bạn! Với mức ngân sách **15 - 20 triệu đồng**, TechZone khuyến nghị cấu hình tối ưu hiệu năng/giá thành để chiến mượt mọi tựa game Esport (Valorant, CS2, FO4) ở 200+ FPS và chơi tốt game AAA (Black Myth Wukong, Cyberpunk 2077) ở độ phân giải Full HD / 2K:\n\n` +
        `• **CPU:** Intel Core i5-13400F (10 nhân 16 luồng, cực mát)\n` +
        `• **VGA:** MSI GeForce RTX 4060 VENTUS 2X 8G (Hỗ trợ DLSS 3 + Ray Tracing)\n` +
        `• **Mainboard:** ASUS TUF GAMING B760M-PLUS WIFI D4\n` +
        `• **RAM:** Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz\n` +
        `• **SSD:** Kingston NV2 1TB PCIe 4.0 NVMe siêu tốc\n` +
        `• **Nguồn:** Corsair CV650 650W 80 Plus Bronze gánh tải an toàn\n` +
        `• **Vỏ Case:** Montech X3 Mesh kèm sẵn 6 quạt RGB`,
      suggestedBuild: {
        title: "Cấu hình Gaming Esport & AAA Mid-Range",
        totalPrice: 19850000,
        items: [
          { slot: "CPU", name: "Intel Core i5-13400F", price: 4790000 },
          {
            slot: "VGA",
            name: "MSI GeForce RTX 4060 VENTUS 2X 8G",
            price: 8290000,
          },
          {
            slot: "Mainboard",
            name: "ASUS TUF GAMING B760M-PLUS",
            price: 3490000,
          },
          {
            slot: "RAM",
            name: "Corsair Vengeance LPX 16GB DDR4",
            price: 950000,
          },
          { slot: "SSD", name: "Kingston NV2 1TB PCIe 4.0", price: 1450000 },
          { slot: "PSU", name: "Corsair CV650 650W 80 Plus", price: 1290000 },
        ],
        builderParams: "preset=esports",
      },
    };
  }

  // 2. Tư vấn cấu hình Đồ họa / Dựng video 4K / Blender
  if (
    query.includes("đồ họa") ||
    query.includes("render") ||
    query.includes("premiere") ||
    query.includes("blender") ||
    query.includes("dựng video")
  ) {
    return {
      text:
        `Đối với nhu cầu **Đồ họa chuyên nghiệp, Dựng video 4K và Render 3D**, yếu tố quan trọng nhất là Dung lượng RAM lớn (tối thiểu 32GB) và Card đồ họa VRAM từ 12GB trở lên cùng CPU nhiều nhân đa luồng:\n\n` +
        `• **CPU:** Intel Core i7-14700K (20 nhân 28 luồng, xung nhịp lên đến 5.6GHz)\n` +
        `• **Tản nhiệt:** Deepcool LT720 AIO Liquid Cooler 360mm tản nhiệt cực êm\n` +
        `• **VGA:** MSI GeForce RTX 4070 SUPER 12G (12GB VRAM chuẩn render)\n` +
        `• **Mainboard:** ASUS ROG STRIX Z790-A GAMING WIFI\n` +
        `• **RAM:** Kingston Fury Beast 32GB (2x16GB) DDR5 6000MHz\n` +
        `• **SSD:** Samsung 990 Pro 1TB PCIe Gen4 NVMe (Tốc độ đọc 7450MB/s)\n` +
        `• **Nguồn:** Corsair RM850e 850W 80 Plus Gold chuẩn PCIe 5.0`,
      suggestedBuild: {
        title: "Cấu hình Workstation Đồ Họa 4K & Render 3D",
        totalPrice: 42500000,
        items: [
          { slot: "CPU", name: "Intel Core i7-14700K", price: 10490000 },
          { slot: "VGA", name: "MSI RTX 4070 SUPER 12G", price: 16990000 },
          {
            slot: "Mainboard",
            name: "ASUS ROG STRIX Z790-A WIFI",
            price: 6890000,
          },
          {
            slot: "RAM",
            name: "Kingston Fury Beast 32GB DDR5",
            price: 2890000,
          },
          { slot: "SSD", name: "Samsung 990 Pro 1TB NVMe", price: 2690000 },
          { slot: "PSU", name: "Corsair RM850e 850W Gold", price: 2990000 },
        ],
        builderParams: "preset=workstation",
      },
    };
  }

  // 3. Câu hỏi về công suất Nguồn 650W vs RTX 4070
  if (
    query.includes("650w") ||
    query.includes("nguồn") ||
    query.includes("psu") ||
    (query.includes("rtx 4070") && query.includes("nguồn"))
  ) {
    return {
      text:
        `Về câu hỏi **"Nguồn 650W có gánh được RTX 4070 không?"**:\n\n` +
        `• **Trả lời ngắn:** **CÓ THỂ GÁNH ĐƯỢC**, nhưng phụ thuộc vào CPU đi kèm và chất lượng của bộ nguồn.\n` +
        `• **Chi tiết công suất:**\n` +
        `  - RTX 4070 tiêu thụ điện năng tối đa khoảng **200W** (rất tiết kiệm nhờ kiến trúc Ada Lovelace).\n` +
        `  - Nếu đi kèm CPU tầm trung như Core i5-13400F hoặc Ryzen 5 7600 (ăn ~65W - 95W) thì tổng công suất dàn máy chỉ rơi vào khoảng **350W - 400W**. Bộ nguồn 650W 80 Plus Bronze/Gold sẽ hoạt động ở dải công suất tối ưu 50 - 65% tải.\n` +
        `  - ⚠️ **Lưu ý:** Nếu bạn dùng CPU cao cấp như Core i7-14700K hoặc i9, hoặc phiên bản **RTX 4070 Ti / 4070 SUPER**, TechZone khuyến nghị nâng cấp lên nguồn **750W - 850W Gold** để đảm bảo không bị sập nguồn khi tải spike.`,
    };
  }

  // 4. So sánh CPU i5-13400F vs Ryzen 5 7600
  if (
    query.includes("13400f") ||
    query.includes("7600") ||
    (query.includes("intel") && query.includes("ryzen"))
  ) {
    return {
      text:
        `So sánh chi tiết giữa **Intel Core i5-13400F** và **AMD Ryzen 5 7600**:\n\n` +
        `1. **Hiệu năng Gaming thuần túy:**\n` +
        `   • Ryzen 5 7600 nhỉnh hơn 5% - 10% ở độ phân giải 1080p nhờ kiến trúc Zen 4 xung nhịp đơn nhân cao và bộ nhớ đệm L3 lớn.\n` +
        `2. **Đa nhiệm & Làm việc (Workstation / Đồ họa):**\n` +
        `   • i5-13400F có lợi thế 10 nhân (6P + 4E) 16 luồng so với 6 nhân 12 luồng của R5 7600, render đa nhiệm và chạy máy ảo mượt hơn.\n` +
        `3. **Khả năng nâng cấp & Chi phí:**\n` +
        `   • i5-13400F hỗ trợ cả RAM DDR4 giá rẻ, giúp tiết kiệm chi phí ban đầu.\n` +
        `   • R5 7600 dùng socket AM5 mới nhất, được AMD cam kết hỗ trợ đến năm 2027+, sau này bạn chỉ cần thay CPU mới mà không cần đổi Mainboard.\n\n` +
        `💡 **Lời khuyên:** Tiết kiệm chi phí build PC thì chọn i5-13400F + RAM DDR4; muốn nền tảng mới nhất để nâng cấp lâu dài thì chọn Ryzen 5 7600!`,
    };
  }

  // 5. Chính sách bảo hành & Đổi trả
  if (
    query.includes("bảo hành") ||
    query.includes("đổi trả") ||
    query.includes("chính sách")
  ) {
    return {
      text:
        `Chính sách bảo hành tại **TechZone Computer** cam kết chuẩn hãng 100%:\n\n` +
        `✓ **1 ĐỔI 1 TRONG 30 NGÀY ĐẦU:** Nếu sản phẩm phát sinh lỗi phần cứng do nhà sản xuất, khách hàng được đổi ngay sản phẩm mới nguyên seal.\n` +
        `✓ **Thời gian bảo hành:** 12 - 36 tháng tùy linh kiện (CPU/Main/VGA/Nguồn thường được bảo hành 36 tháng).\n` +
        `✓ **Mượn máy thay thế:** Khách hàng bảo hành máy tính nguyên bộ hoặc laptop được TechZone hỗ trợ mượn máy tương đương để làm việc trong thời gian chờ xử lý.\n` +
        `✓ **Tra cứu bảo hành online:** Bạn có thể vào mục **"Bảo Hành"** trên thanh menu để kiểm tra tiến độ sửa chữa theo Serial hoặc SĐT bất cứ lúc nào!`,
    };
  }

  // Phản hồi tổng quát thông minh
  return {
    text:
      `Cảm ơn bạn đã đặt câu hỏi! Tôi là **TechZone AI Specialist**.\n\n` +
      `Tôi có thể hỗ trợ bạn:\n` +
      `• Gợi ý cấu hình PC phù hợp nhất theo **ngân sách** và **tựa game/phần mềm** bạn sử dụng.\n` +
      `• Kiểm tra **độ tương thích phần cứng** (Socket CPU, Chuẩn RAM, Công suất nguồn).\n` +
      `• Giải đáp các thông số kỹ thuật (TDP, PCIe 4.0 vs 5.0, Tần số quét màn hình).\n\n` +
      `Hãy nhập mức kinh phí bạn dự định chi hoặc linh kiện bạn đang phân vân, tôi sẽ phân tích ngay!`,
  };
}

export function AiConsultantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Xin chào! Tôi là **Trợ lý Công nghệ AI của TechZone** 🤖. Bạn cần tư vấn cấu hình PC theo ngân sách hay giải đáp thắc mắc kỹ thuật phần cứng nào?",
      timestamp: "Vừa xong",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAiResponse(text);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response.text,
        suggestedBuild: response.suggestedBuild,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleApplyBuild = (builderParams?: string) => {
    setIsOpen(false);
    navigate(`/build-pc${builderParams ? `?${builderParams}` : ""}`);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-2 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] px-3 py-2 text-xs font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 group border border-orange-600"
          title="Trợ lý AI tư vấn phần cứng & Build PC"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="hidden sm:inline">AI Tư Vấn PC</span>
        </button>
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[95vw] sm:w-[460px] h-[590px] max-h-[85vh] rounded-xl bg-white shadow-2xl border border-stone-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3">
          {/* Header */}
          <div className="bg-stone-900 border-b border-stone-800 px-4 py-3 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#c2410c] flex items-center justify-center text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold leading-tight">
                    TechZone AI Chat
                  </h3>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[11px] text-stone-400">
                  Trợ lý tư vấn phần cứng & cấu hình máy tính
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition"
              aria-label="Đóng chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-stone-50 border-b border-stone-200 p-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[11px] font-medium text-stone-700 hover:border-[#c2410c] hover:text-[#c2410c] hover:bg-orange-50/40 transition shadow-2xs shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-[#faf9f7]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#c2410c] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border border-orange-200">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="max-w-[88%] space-y-2">
                  {m.sender === "ai" ? (
                    <div className="p-3.5 rounded-lg border border-stone-200 bg-white text-stone-800 shadow-2xs leading-relaxed text-xs">
                      <MarkdownContent content={m.text} />
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-[#c2410c] text-white shadow-2xs leading-relaxed text-xs font-medium whitespace-pre-wrap">
                      {m.text}
                    </div>
                  )}

                  {/* Render Suggested Build Card if available */}
                  {m.suggestedBuild && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50/60 p-3 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-orange-200/60 pb-2">
                        <span className="font-bold text-stone-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-[#c2410c]" />
                          {m.suggestedBuild.title}
                        </span>
                        <span className="font-black text-[#c2410c] text-xs">
                          {formatVnd(m.suggestedBuild.totalPrice)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {m.suggestedBuild.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-[11px] text-stone-600"
                          >
                            <span className="font-semibold text-stone-700 w-16 shrink-0">
                              {item.slot}:
                            </span>
                            <span className="truncate flex-1 pr-2">
                              {item.name}
                            </span>
                            <span className="font-medium text-stone-800">
                              {formatVnd(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          handleApplyBuild(m.suggestedBuild?.builderParams)
                        }
                        className="w-full py-2 px-3 rounded-lg bg-[#c2410c] hover:bg-[#9a3412] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-2xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Mở cấu hình này trong PC Builder</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span
                    className={`block text-[10px] text-stone-400 ${m.sender === "user" ? "text-right" : "text-left"}`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-stone-500 text-xs bg-white p-2.5 rounded-lg border border-stone-200 w-fit shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                <span>TechZone AI đang phân tích dữ liệu phần cứng...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập câu hỏi (ví dụ: tư vấn máy tính 18 triệu...)"
              className="flex-1 rounded-lg border border-stone-300 px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c2410c] bg-stone-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="px-3.5 py-2 rounded-lg bg-[#c2410c] hover:bg-[#9a3412] disabled:opacity-50 text-white transition flex items-center justify-center shadow-xs"
              aria-label="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

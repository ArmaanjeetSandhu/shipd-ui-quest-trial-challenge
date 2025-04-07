import {
  ChevronRight,
  Cpu,
  Lightbulb,
  Menu,
  Send,
  Settings,
  Share2,
  Thermometer,
  UserPlus,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const SIDEBAR_EXPANDED_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 60;
const USER_RESPONSE_DELAY = 500;
const OPTION_RESPONSE_DELAY = 800;
const FOLLOWUP_RESPONSE_DELAY = 500;

const OPTIONS = ["Tell me a fact", "Give me advice", "Share a quote"];
const WELCOME_MESSAGE = {
  id: Date.now(),
  content: "Hello! I'm here to help. What would you like to talk about?",
  role: "assistant" as "user" | "assistant" | "system",
  options: OPTIONS,
};

type MessageRole = "user" | "assistant" | "system";

type Message = {
  id: number;
  content: string;
  role: MessageRole;
  options?: string[];
  isOptionMessage?: boolean;
};

type Conversation = {
  id: number;
  title: string;
  messages: Message[];
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("Luminous");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [creativity, setCreativity] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [webSearch, setWebSearch] = useState(false);
  const [memoryRetention, setMemoryRetention] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([WELCOME_MESSAGE]);
    }
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getResponseForOption = useCallback((option: string): string => {
    if (option === "Tell me a fact") {
      return "Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat!";
    } else if (option === "Give me advice") {
      return "When learning something new, try teaching it to someone else. This 'Feynman Technique' helps reinforce your understanding and identify gaps in your knowledge.";
    } else if (option === "Share a quote") {
      return `"The greatest glory in living lies not in never falling, but in rising every time we fall." — Nelson Mandela`;
    }
    return "";
  }, []);

  const processOptionSelection = useCallback(
    (option: string) => {
      const userOptionMessage: Message = {
        id: Date.now(),
        content: option,
        role: "user",
        isOptionMessage: true,
      };
      setMessages((prevMessages) => [...prevMessages, userOptionMessage]);

      setTimeout(() => {
        const responseContent = getResponseForOption(option);
        const botResponse: Message = {
          id: Date.now(),
          content: responseContent,
          role: "assistant",
        };

        setMessages((prevMessages) => [...prevMessages, botResponse]);

        setTimeout(() => {
          const followUpMessage: Message = {
            id: Date.now() + 1,
            content: "Thanks for selecting an option! Please select another:",
            role: "assistant",
            options: OPTIONS,
          };
          setMessages((prevMessages) => [...prevMessages, followUpMessage]);
        }, FOLLOWUP_RESPONSE_DELAY);
      }, OPTION_RESPONSE_DELAY);
    },
    [getResponseForOption]
  );

  const handleSend = useCallback(() => {
    if (input) {
      const newUserMessage: Message = {
        id: Date.now(),
        content: input,
        role: "user",
      };

      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInput("");

      setTimeout(() => {
        const responseMessage: Message = {
          id: Date.now(),
          content:
            "Thanks for your message! Please select one of these options:",
          role: "assistant",
          options: OPTIONS,
        };
        setMessages((prevMessages) => [...prevMessages, responseMessage]);
      }, USER_RESPONSE_DELAY);
    }
  }, [input]);

  const handleOptionClick = useCallback(
    (option: string) => {
      processOptionSelection(option);
    },
    [processOptionSelection]
  );

  const saveCurrentConversation = useCallback(() => {
    if (messages.length > 1) {
      const conversationTitle = `Previous Conversation ${
        conversations.length + 1
      }`;
      const newConversation: Conversation = {
        id: Date.now(),
        title: conversationTitle,
        messages: [...messages],
      };

      setConversations((prev) => [...prev, newConversation]);
    }
  }, [messages, conversations.length]);

  const handleNewChat = useCallback(() => {
    saveCurrentConversation();
    setMessages([]);
    setCurrentConversationId(null);
  }, [saveCurrentConversation]);

  const loadConversation = useCallback(
    (conversationId: number) => {
      const conversation = conversations.find(
        (conv) => conv.id === conversationId
      );
      if (conversation) {
        if (messages.length > 1 && currentConversationId !== conversationId) {
          saveCurrentConversation();
        }
        setMessages(conversation.messages);
        setCurrentConversationId(conversationId);
      }
    },
    [
      conversations,
      messages.length,
      currentConversationId,
      saveCurrentConversation,
    ]
  );

  const toggleConfig = useCallback(() => {
    setConfigOpen((prev) => !prev);
  }, []);

  const OptionButtons = useCallback(
    ({ options }: { options: string[] }) => (
      <div className="flex flex-col gap-2 mt-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleOptionClick(option)}
            className="py-2 px-4 bg-gray-700 bg-opacity-70 hover:bg-gray-600 rounded text-white text-left cursor-pointer transition-colors flex justify-between items-center w-full"
          >
            <span>{option}</span>
            <span>&gt;</span>
          </button>
        ))}
      </div>
    ),
    [handleOptionClick]
  );

  const ToggleSwitch = useCallback(
    ({
      label,
      enabled,
      setEnabled,
    }: {
      label: string;
      enabled: boolean;
      setEnabled: (value: boolean) => void;
    }) => (
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-sm">
          <span>{label}</span>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative w-10 h-5 rounded-full transition-colors duration-300 ease-in-out ${
            enabled ? "bg-amber-500" : "bg-orange-800 opacity-70"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    ),
    []
  );

  const blinkingDotStyle = {
    animation: "pulse 2s infinite ease-in-out",
  };

  const getSliderBackground = (
    value: number,
    min: number,
    max: number
  ): string => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, rgba(237, 137, 54, 0.9) 0%, rgba(237, 137, 54, 0.9) ${percentage}%, rgba(146, 64, 14, 0.8) ${percentage}%, rgba(146, 64, 14, 0.8) 100%)`;
  };

  const creativitySliderStyle = {
    background: getSliderBackground(creativity, 0, 1),
  };

  const maxTokensSliderStyle = {
    background: getSliderBackground(maxTokens, 256, 4096),
  };

  return (
    <div className="flex h-screen w-screen">
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }

        .dotted-bg {
          background-image: radial-gradient(
            rgba(255, 255, 255, 0.05) 1px,
            transparent 1px
          );
          background-size: 20px 20px;
        }

        input[type="range"] {
          height: 4px;
          -webkit-appearance: none;
          border-radius: 5px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: absolute;
            left: -250px;
            transition: left 0.3s ease;
            z-index: 10;
            height: 100vh;
          }

          .sidebar.show {
            left: 0;
          }
        }
      `}</style>

      {sidebarCollapsed ? (
        <div
          className="bg-stone-800 text-white p-2 sidebar border-r border-gray-700 transition-all duration-300 ease-in-out"
          style={{ width: SIDEBAR_COLLAPSED_WIDTH }}
        >
          <div className="flex flex-col items-center space-y-5">
            <button className="bg-amber-500 p-1.5 rounded flex items-center justify-center">
              <Lightbulb size={16} />
            </button>
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-1 hover:bg-stone-700 rounded transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="bg-stone-800 text-white p-2.5 sidebar border-r border-gray-700 transition-all duration-300 ease-in-out"
          style={{ width: SIDEBAR_EXPANDED_WIDTH }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="bg-amber-500 p-1.5 rounded flex items-center justify-center">
                <Lightbulb size={16} />
              </button>
              <h2 className="font-bold text-lg">Luminary</h2>
            </div>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1 hover:bg-stone-700 rounded transition-colors"
              aria-label="Collapse sidebar"
            >
              <X size={16} />
            </button>
          </div>

          <button
            className="w-full py-2 bg-amber-500 rounded text-white cursor-pointer"
            onClick={handleNewChat}
          >
            New Conversation
          </button>

          <div className="mt-5">
            <button
              onClick={toggleConfig}
              className="flex items-center justify-between w-full py-2 hover:bg-gray-700 rounded px-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings size={16} />
                <span>Configuration</span>
              </div>
              <ChevronRight
                size={16}
                className={`transition-transform duration-200 ${
                  configOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {configOpen && (
              <div className="mt-2 ml-2 p-3 bg-stone-700 bg-opacity-85 rounded">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1 text-sm text-orange-400">
                    <Thermometer size={16} className="text-orange-400" />
                    <span className="font-medium">
                      Creativity: {creativity.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={creativity}
                    onChange={(e) => setCreativity(parseFloat(e.target.value))}
                    className="w-full"
                    style={creativitySliderStyle}
                  />
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1 text-sm text-orange-400">
                    <Cpu size={16} className="text-orange-400" />
                    <span className="font-medium">Max Tokens: {maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="4096"
                    step="1"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full"
                    style={maxTokensSliderStyle}
                  />
                </div>

                <ToggleSwitch
                  label="Web Search"
                  enabled={webSearch}
                  setEnabled={setWebSearch}
                />

                <ToggleSwitch
                  label="Memory Retention"
                  enabled={memoryRetention}
                  setEnabled={setMemoryRetention}
                />
              </div>
            )}
          </div>

          <div className="mt-5">
            <h3 className="text-gray-300 font-medium px-2 py-2 mb-2">
              Conversation History
            </h3>
            <div className="max-h-[300px] overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`text-sm px-2 py-2 ml-2 pl-2 hover:bg-stone-700 rounded cursor-pointer mb-1 transition-colors ${
                      currentConversationId === conv.id ? "bg-stone-700" : ""
                    }`}
                  >
                    {conv.title}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400 px-2 py-1 ml-2 pl-2">
                  No previous conversations
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-gray-900">
        <div className="p-2.5 border-b border-gray-700 bg-stone-800 bg-opacity-80 flex items-center justify-between">
          <div className="flex items-center">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="mr-2 p-1 hover:bg-stone-900 rounded"
              >
                <Menu size={18} />
              </button>
            )}
            <button className="py-1 px-3 bg-stone-700 bg-opacity-80 rounded-full text-amber-500 flex items-center justify-center gap-1 transition-all duration-300 hover:bg-stone-500 hover:bg-opacity-70 hover:scale-105">
              <span className="font-bold">{model}</span>
              <ChevronRight size={14} />
            </button>
            <span
              style={blinkingDotStyle}
              className="w-2 h-2 bg-amber-500 rounded-full mx-2 inline-block"
            ></span>
            <span className="text-white">Ready</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-1.5 w-8 h-8 text-gray-300 rounded-full transition-all duration-300 hover:bg-stone-700 hover:text-white hover:scale-105 flex items-center justify-center">
              <Share2 size={18} />
            </button>
            <button className="p-1.5 w-8 h-8 text-gray-300 rounded-full transition-all duration-300 hover:bg-stone-700 hover:text-white hover:scale-105 flex items-center justify-center">
              <UserPlus size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2.5 flex flex-col dotted-bg">
          {messages.map((message) => (
            <div key={message.id} className="w-full flex">
              <div
                className={`${
                  message.role === "user"
                    ? "bg-amber-600 ml-auto rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                    : "bg-gray-800 mr-auto rounded-tr-lg rounded-tl-lg rounded-br-lg"
                } p-2.5 my-1.5 text-white inline-block max-w-[70%]`}
              >
                <p>{message.content}</p>

                {message.options && <OptionButtons options={message.options} />}

                <div
                  className={`text-xs ${
                    message.role === "user" ? "text-white" : "text-gray-400"
                  } text-right mt-1 flex items-center justify-end`}
                >
                  {message.role === "assistant" && (
                    <span
                      style={blinkingDotStyle}
                      className="w-2 h-2 bg-amber-500 rounded-full mr-1 inline-block"
                    ></span>
                  )}
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-2.5 border-t border-gray-700 bg-stone-800 bg-opacity-80 flex justify-center">
          <div className="relative max-w-2xl w-4/5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="w-full p-3 rounded-full border border-gray-600 bg-gray-800 text-white pr-12"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSend}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-amber-500 rounded-full text-white cursor-pointer flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

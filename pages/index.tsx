import { useState } from "react";

function App() {
  type BasicMessage = {
    id: number;
    content: string;
    role: string;
  };

  const [messages, setMessages] = useState<BasicMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("Luminous");

  const handleSend = () => {
    if (input) {
      const newMessages = [
        ...messages,
        {
          id: Date.now(),
          content: input,
          role: "user",
        },
      ];

      setMessages(newMessages);
      setInput("");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen w-screen">
      <div className="w-[250px] bg-gray-800 text-white p-2.5">
        <div className="mb-5">
          <h2>Basic AI Chat</h2>
        </div>

        <button
          className="w-full py-2 bg-amber-600 rounded text-white cursor-pointer"
          onClick={handleNewChat}
        >
          New Chat
        </button>

        <div className="mt-5">
          <p>Settings</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-900">
        <div className="p-2.5 border-b border-gray-700 flex justify-between">
          <div>
            <span className="text-amber-500">Model: {model}</span>
          </div>
          <div></div>
        </div>

        <div className="flex-1 overflow-auto p-2.5 flex flex-col">
          {messages.length === 0 ? (
            <div className="text-gray-500 text-center mt-5">
              No messages yet. Type something to start.
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`${
                  message.role === "user"
                    ? "self-end bg-amber-900"
                    : "self-start bg-gray-800"
                } p-2.5 rounded-lg my-1.5 max-w-[70%] text-white`}
              >
                <p>{message.content}</p>

                <div className="text-xs text-gray-400 text-right">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-2.5 border-t border-gray-700 flex">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 p-2 rounded border border-gray-600 bg-gray-800 text-white"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="ml-2.5 px-3 py-2 bg-amber-600 rounded text-white cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

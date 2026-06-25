import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MODELS = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", provider: "Google" }
];

const PROMPT_CHIPS = [
  "Explain quantum computing in simple terms",
  "Write a Python function to reverse a string",
  "What are the best practices for React performance?",
  "Help me debug a TypeScript error"
];

function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("ai_chat_history");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "TaskForge AI Assistant"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: text }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.choices[0].message.content,
        model: selectedModel,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI request failed:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        model: selectedModel,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleChipClick = (prompt) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("ai_chat_history");
  };

  const getModelName = (modelId) => {
    const model = MODELS.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
              <p className="text-sm text-gray-400">Powered by leading AI models</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>

            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Prompt Chips */}
        {messages.length === 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROMPT_CHIPS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(prompt)}
                className="p-4 bg-gray-900 border border-gray-800 rounded-lg text-left text-sm text-gray-300 hover:bg-gray-800 hover:border-sky-500/50 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-4 bg-sky-500/10 rounded-full mb-4">
                <Sparkles className="w-12 h-12 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Start a conversation</h2>
              <p className="text-gray-400 max-w-md">
                Ask me anything! Choose a prompt above or type your own question below.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 items-start",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                  message.role === "user"
                    ? "bg-sky-500"
                    : "bg-gray-800"
                )}
              >
                {message.role === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-gray-300" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={cn(
                  "flex flex-col max-w-[70%]",
                  message.role === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-3 rounded-lg",
                    message.role === "user"
                      ? "bg-sky-500 text-white"
                      : message.isError
                      ? "bg-red-900/30 border border-red-800 text-red-200"
                      : "bg-gray-900 border border-gray-800 text-gray-200"
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
                </div>

                {/* Model Badge */}
                {message.role === "assistant" && message.model && (
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {getModelName(message.model)}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800">
                <Bot className="w-5 h-5 text-gray-300" />
              </div>
              <div className="bg-gray-900 border border-gray-800 px-4 py-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask me anything..."
            rows={1}
            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            style={{ minHeight: "48px", maxHeight: "200px" }}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2",
              !input.trim() || isTyping
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/30"
            )}
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIAssistant;
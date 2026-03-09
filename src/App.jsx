import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);

  async function generateResponse() {
    if (!prompt.trim()) return;

    // Add the user question first
    const userMessage = { sender: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Add the bot response
      const botMessage = { sender: "bot", text };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage = {
        sender: "bot",
        text: "⚠️ Failed to fetch response. Check your API key or network.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }

  return (
    <div className="grid grid-cols-5 h-screen">
      <div className="col-span-1 bg-zinc-800">
        <h1 className="text-2xl italic text-white m-4">Welcome to DeepTalk AI </h1>
        <h1 className=" pt-8 text-xl text-white m-4 ">Recent Searches</h1>
        {
          messages.filter((msg) => msg.sender === "user")
            .slice(-5)
            .reverse()
            .map((msg, index) => (
              <div
                key={index}
                className="bg-zinc-700 text-white p-2 m-4 rounded-lg text-sm truncate"
              >
                {msg.text}
              </div>
            ))
        }
      </div>
      <div className="col-span-4 bg-black flex flex-col">
        <div className="text-5xl text-purple-300 mx-20 my-7 pl-5 border-l-4 border-purple-600">
          Hello user, Ask me Anything
        </div>

        {/* Chat area */}
        <div className="flex-1 p-6 text-white text-lg overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-2xl max-w-xl ${
                msg.sender === "user"
                  ? "bg-zinc-700 self-end text-right ml-auto"
                  : "bg-zinc-800 self-start text-left mr-auto"
              }`}
            >
              {msg.sender === "bot" ? (
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => <p {...props} className="mb-2" />,
                    strong: ({ node, ...props }) => <strong {...props} className="font-bold" />,
                    em: ({ node, ...props }) => <em {...props} className="italic" />,
                    ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside mb-2" />,
                    ol: ({ node, ...props }) => <ol {...props} className="list-decimal list-inside mb-2" />,
                    code: ({ node, ...props }) => <code {...props} className="bg-zinc-800 px-2 py-1 rounded" />,
                    pre: ({ node, ...props }) => <pre {...props} className="bg-zinc-800 p-2 rounded overflow-x-auto" />,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="bg-zinc-800 w-1/2 h-13 flex px-4 py-2 rounded-3xl text-white m-auto border border-zinc-700 items-center gap-4 mb-6">
          <input
            type="text"
            className="w-full h-full outline-none bg-transparent"
            placeholder="Ask me Anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateResponse()}
          />
          <button
            onClick={generateResponse}
            className="bg-purple-600 px-4 py-1 rounded-2xl hover:bg-purple-700 transition"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import "./Chat.css"; // Import the CSS file

function Chat() {
  const [userMessage, setUserMessage] = useState("");
  const [response, setResponse] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // Typing indicator
  const [messageSent, setMessageSent] = useState(false); // Message sent confirmation
  const chatEndRef = useRef(null); // Reference for the last message to scroll to

  const handleSendMessage = async () => {
    if (!userMessage) return;

    const newMessages = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages);
    setIsTyping(true); // Show typing indicator
    setMessageSent(true); // Show message sent confirmation

    // Hide confirmation after 2 seconds
    setTimeout(() => {
      setMessageSent(false);
    }, 2000);

    try {
      const res = await fetch("http://localhost:5000/api/get_advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();
      setMessages([...newMessages, { role: "bot", text: data.advice }]);
      setResponse(data.advice);
      setUserMessage(""); // Clear input field
    } catch (error) {
      console.error("Error fetching advice:", error);
    } finally {
      setIsTyping(false); // Hide typing indicator when the bot finishes typing
    }
  };

  // Function to clear chat history
  const clearChat = () => {
    setMessages([]);
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // Trigger this effect whenever the messages change

  return (
    <div className="chat-container">
      <h1 className="chat-title">🌍 Travel Advisor Chatbot</h1>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === "user" ? "user-message" : "bot-message"}`}
          >
            {msg.text}
          </div>
        ))}

        {/* Display typing indicator when isTyping is true */}
        {isTyping && (
          <div className="message bot-message typing-indicator">
            <span>Bot is typing...</span>
          </div>
        )}

        {/* This is the "end of chat" reference */}
        <div ref={chatEndRef} />
      </div>

      {/* Message Sent Confirmation */}
      {messageSent && (
        <div className="message-sent">
          <span>✔️ Message Sent!</span>
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Ask for advice..."
          className="chat-input"
        />
        <button onClick={handleSendMessage} className="send-button">
          Send
        </button>
        <button onClick={clearChat} className="clear-button">
          Clear Chat
        </button>
      </div>
    </div>
  );
}

export default Chat;

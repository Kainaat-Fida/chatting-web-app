import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { fetchMessages, sendMessage } from "../features/chat/chatSlice";
import { Paperclip, Send } from "lucide-react";

// Memoized selector for messages by chatId
const selectMessagesByChatId = createSelector(
  [(state) => state.chat.messages, (_, chatId) => chatId],
  (messages, chatId) => messages?.[chatId] || []
);

export default function Messages({ selectedUser = {}, currentUser = {} }) {
  const dispatch = useDispatch();
  const messagesEndRef = useRef();
  const [input, setInput] = useState("");

  // Generate consistent chatId
  const chatId =
    selectedUser?.uid &&
    currentUser?.uid &&
    (currentUser.uid > selectedUser.uid
      ? currentUser.uid + selectedUser.uid
      : selectedUser.uid + currentUser.uid);

  const messages = useSelector((state) => selectMessagesByChatId(state, chatId));

  // Fetch messages whenever chatId changes
  useEffect(() => {
    if (chatId) dispatch(fetchMessages({ chatId }));
  }, [chatId, dispatch]);

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !selectedUser?.uid || !currentUser?.uid) return;

    dispatch(
      sendMessage({ chatId, currentUser, selectedUser, message: input.trim() })
    );
    setInput("");
  };

  if (!selectedUser?.uid) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#f3eee6]">
        Select a contact to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f6f2eb] custom-scroll scroll-smooth">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            No messages yet. Start a conversation!
          </div>
        )}

        {messages.map((msg) => {
          const isSender = msg.senderId === currentUser?.uid;
          return (
            <div
              key={msg.id}
              className={`flex mb-3 ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-xl shadow-sm break-words ${
                  isSender ? "bg-[#d1f3d3] text-gray-800" : "bg-white text-gray-800"
                }`}
              >
                <div className="text-sm">{msg.message}</div>
                <div className="text-[10px] text-gray-500 text-right mt-1">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none h-[70px] border-t bg-[#f0f2f5] px-4 py-3 flex items-center gap-3">
        <Paperclip size={22} className="text-gray-500" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 px-4 py-2 rounded-full bg-white outline-none border border-gray-300"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Send
          onClick={handleSend}
          className="cursor-pointer text-gray-600"
          size={24}
        />
      </div>
    </div>
  );
}

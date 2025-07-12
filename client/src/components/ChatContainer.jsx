import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useThemeStore } from "../store/useThemeStore";
import { themeClassMap } from "../constant";
import MessagesSkeleton from "./skeletons/MessagesSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatChatDate } from "../lib/utlis";
import { SmilePlus } from "lucide-react";
import { emojiOptions } from "../lib/emojis";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeToMessages,
    isTyping,
  } = useChatStore();
  const { theme } = useThemeStore();
  const themeClasses = themeClassMap[theme] || {};
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [deletingMessageIds, setDeletingMessageIds] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [reactionPickerVisible, setReactionPickerVisible] = useState(null);
  const pickerRef = useRef(null);
  const [activeMessageId, setActiveMessageId] = useState(null);

  useEffect(() => {
    if (!selectedUser || !selectedUser.id) return;

    getMessages(selectedUser.id);
    subscribeToMessages();
    return () => unsubscribeToMessages();
  }, [selectedUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setReactionPickerVisible(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (messageEndRef?.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const validMessages = Array.isArray(messages)
    ? messages.filter((m) => m && m._id)
    : [];

  const handleUnsend = async (messageId) => {
    try {
      await useChatStore.getState().deleteMessage(messageId);
      setDeletingMessageIds((prev) => [...prev, messageId]);
      setTimeout(() => {
        setDeletingMessageIds((prev) => prev.filter((id) => id !== messageId));
      }, 400);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const startEditing = (message) => {
    setEditingMessageId(message._id);
    setEditedText(message.text);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditedText("");
  };

  const handleEditSave = async (messageId) => {
    await useChatStore.getState().editMessage(messageId, editedText);
    cancelEditing();
  };

  const handleReaction = (messageId, emoji) => {
    useChatStore.getState().addReaction(messageId, emoji);
    setReactionPickerVisible(null);
  };

  if (isMessagesLoading) {
    return (
      <div>
        <ChatHeader />
        <MessagesSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full w-full relative ${
        themeClasses.base || "bg-base-100"
      } ${themeClasses.text || "text-base-content"}`}
    >
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {Object.entries(
          validMessages.reduce((groups, message) => {
            const date = formatChatDate(message.createdAt);
            if (!groups[date]) groups[date] = [];
            groups[date].push(message);
            return groups;
          }, {})
        ).map(([date, messagesForDay]) => (
          <div key={date}>
            <div className="text-center my-4 text-sm text-base-content opacity-60">
              {date}
            </div>

            {messagesForDay.map((message, index) => {
              const isOwnMessage =
                String(message.senderId) === String(authUser.id);
              const isDeleting = deletingMessageIds.includes(message._id);

              const emojiMap = {};
              message.reactions?.forEach((r) => {
                if (!emojiMap[r.emoji]) emojiMap[r.emoji] = [];
                emojiMap[r.emoji].push(r.userId);
              });

              return (
                <div
                  key={message._id}
                  className={`chat ${
                    isOwnMessage ? "chat-end" : "chat-start"
                  } ${isDeleting ? "animate-fadeOut" : ""}`}
                  ref={messageEndRef}
                >
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full border">
                      <img
                        src={
                          isOwnMessage
                            ? authUser.profilePicture || "/default-profile.png"
                            : selectedUser.profilePicture ||
                              "/default-profile.png"
                        }
                        alt="profile"
                      />
                    </div>
                  </div>

                  <div className="chat-header mb-1">
                    <time className="text-xs opacity-50 ml-1">
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>

                  <div className="chat-bubble flex flex-col group relative">
                    {message.image && (
                      <img
                        src={message.image}
                        className="sm:max-w-[200px] rounded-md"
                        alt="sent"
                      />
                    )}

                    {editingMessageId === message._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          className="input input-sm w-full"
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                        />
                        <button
                          onClick={() => handleEditSave(message._id)}
                          className="btn btn-sm btn-success"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="btn btn-sm btn-ghost"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p>
                        {message.text}
                        {message.isEdited && (
                          <span className="text-[10px] text-gray-400 ml-1">
                            (edited)
                          </span>
                        )}
                      </p>
                    )}

                    {Object.keys(emojiMap).length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {Object.entries(emojiMap).map(([emoji, users]) => (
                          <span
                            key={emoji}
                            className="bg-base-300 text-base-content rounded-full px-2 py-1 text-xs flex items-center border border-base-200 hover:scale-105 transition"
                          >
                            {emoji} <span className="ml-1">{users.length}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="absolute bottom-1 right-1">
                      <button
                        className={`p-1 rounded-full transition hover:bg-base-300 ${
                          themeClasses.text || "text-base-content"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setReactionPickerVisible(
                            reactionPickerVisible === message._id
                              ? null
                              : message._id
                          );
                        }}
                      >
                        <SmilePlus size={16} />
                      </button>

                      {reactionPickerVisible === message._id && (
                        <div
                          ref={pickerRef}
                          className="absolute z-50 top-full mt-2 right-0 w-64 max-h-48 overflow-y-auto p-2 rounded-xl bg-base-200 border border-base-300 shadow-lg flex flex-wrap gap-1"
                          style={{
                            scrollbarWidth: "thin",
                            maxWidth: "calc(100vw - 2rem)",
                          }}
                        >
                          {emojiOptions.map((emoji) => (
                            <button
                              key={emoji}
                              className="text-lg hover:scale-110 transition-transform"
                              onClick={() => handleReaction(message._id, emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {isOwnMessage && editingMessageId !== message._id && (
                      <div className="absolute -top-6 left-0 space-x-1">
                        <button
                          onClick={() => startEditing(message)}
                          className="text-xs text-blue-400 hover:underline hover:text-indigo-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleUnsend(message._id)}
                          className="text-xs text-red-400 hover:underline hover:text-red-600"
                        >
                          Unsend
                        </button>
                      </div>
                    )}
                  </div>

                  {isOwnMessage && message.isSeen && (
                    <div className="text-[10px] text-gray-400 mt-1 ml-2">
                      Seen
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="chat chat-start">
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        selectedUser?.profilePicture || "/default-profile.png"
                      }
                      alt="typing"
                    />
                  </div>
                </div>
                <div className="chat-bubble bg-base-300 text-base-content">
                  <span className="text-sm italic opacity-60">Typing...</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;

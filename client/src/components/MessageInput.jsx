import { useState, useRef } from "react";
import { Send, X, Paperclip } from "lucide-react"; // FileText icon for generic files
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const MessageInput = () => {
  const { selectedUser } = useChatStore();
  const { authUser, socket } = useAuthStore();
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessages } = useChatStore();

  // Example file upload function (you'll need to implement your backend API)
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // Replace this URL with your actual file upload endpoint
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data.fileUrl; // Adjust according to your backend response
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;

    let fileUrl = null;

    if (selectedFile) {
      try {
        fileUrl = await uploadFile(selectedFile);
      } catch (error) {
        alert("File upload failed");
        return;
      }
    }

    await sendMessages({
      text: text.trim(),
      image: fileUrl && selectedFile.type.startsWith("image/") ? fileUrl : null,
      file:
        fileUrl && !selectedFile.type.startsWith("image/")
          ? {
              url: fileUrl,
              name: selectedFile.name,
              type: selectedFile.type,
            }
          : null,
    });

    setText("");
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTyping = () => {
    if (socket && selectedUser) {
      socket.emit("typing", {
        senderId: authUser.id,
        receiverId: selectedUser._id,
      });

      clearTimeout(window.__stopTypingTimeout);
      window.__stopTypingTimeout = setTimeout(() => {
        socket.emit("stopTyping", {
          senderId: authUser.id,
          receiverId: selectedUser._id,
        });
      }, 1000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSend} className="flex items-center p-4 gap-2">
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleTyping();
        }}
        placeholder="Type a message..."
        className="input w-full border-1 border-white focus:outline-none focus:border-indigo-600"
      />

      {selectedFile && (
        <div className="flex items-center space-x-2 border rounded p-2 max-w-xs">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="preview"
              className="h-12 w-12 object-cover rounded"
            />
          ) : (
            <FileText size={24} />
          )}
          <span className="truncate">{selectedFile.name}</span>
          <button
            type="button"
            onClick={removeSelectedFile}
            className="btn btn-xs btn-circle"
            title="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <input
        type="file"
        accept="*/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="btn btn-sm rounded-full"
        title="Attach file"
      >
        <Paperclip size={18} />
      </button>

      <button type="submit" className="btn btn-sm btn-primary" title="Send">
        <Send size={18} />
      </button>
    </form>
  );
};

export default MessageInput;

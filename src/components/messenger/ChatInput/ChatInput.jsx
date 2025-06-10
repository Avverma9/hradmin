import React, { useState, useEffect } from "react";
import { FaSmile, FaPaperclip, FaPaperPlane } from "react-icons/fa";
import Picker from "emoji-picker-react";
import styles from "./ChatInput.module.css";

const ChatInput = ({
    message,
    setMessage,
    onSend,
    selectedFiles,
    setSelectedFiles,
    filePreviews,
    setFilePreviews,
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiClick = (emojiData) => {
        setMessage((prev) => prev + emojiData.emoji);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend(e);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        // Generate previews and clean up object URLs when component unmounts
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setSelectedFiles((prev) => [...prev, ...files]);
        setFilePreviews((prev) => [...prev, ...newPreviews]);
    };

    // Cleanup: Revoke object URLs on unmount
    useEffect(() => {
        return () => {
            filePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [filePreviews]);

    return (
        <div className={styles.chatInput}>
            <input
                type="text"
                placeholder="Enter message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                name="message"
                aria-label="Message input"
            />
            <button
                className={styles.icon}
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                aria-label="Toggle emoji picker"
            >
                <FaSmile />
            </button>
            <label className={styles.icon} aria-label="Attach file">
                <FaPaperclip />
                <input
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
            </label>
            <button
                className={styles.sendBtn}
                onClick={onSend}
                type="button"
                aria-label="Send message"
            >
                <FaPaperPlane /> Send
            </button>

            {showEmojiPicker && (
                <div className={styles.emojiPicker}>
                    <Picker onEmojiClick={handleEmojiClick} height={350} width={280} />
                </div>
            )}

            {filePreviews.length > 0 && (
                <div className={styles.previewContainer}>
                    {filePreviews.map((src, index) => (
                        <img
                            key={index}
                            src={src}
                            alt={`preview-${index}`}
                            className={styles.previewImg}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatInput;

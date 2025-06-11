import React, { useEffect, useState } from "react";
import { FaSearch, FaBell } from "react-icons/fa";
import styles from "./Sidebar.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getChats,
  getContacts,
  setActiveReceiverId,
} from "src/components/redux/reducers/messenger/messenger";
import { userId, userName } from "../../../../utils/util";

const Sidebar = ({ activeTab, setActiveTab, searchQuery, setSearchQuery }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dispatch = useDispatch();

  const contacts = useSelector((state) => state.messenger.contacts);
  const chats = useSelector((state) => state.messenger.chats);
  const activeReceiverId = useSelector(
    (state) => state.messenger.activeReceiverId
  );

  useEffect(() => {
    if (userId) {
      dispatch(getContacts(userId));
      dispatch(getChats(userId));
    }
  }, [dispatch]);

  const filteredChats = chats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter((contact) =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTickIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4caf50"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <div className={styles.sidebar}>
      {/* Profile Header */}
      <div className={styles.profileSection}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#ddd" />
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
            fill="#555"
          />
          <path
            d="M12 14c-4 0-6 2-6 4v1h12v-1c0-2-2-4-6-4z"
            fill="#555"
          />
        </svg>
        <div>
          <div className={styles.profileName}>{userName}</div>
          <div className={styles.status}>Active</div>
        </div>
        <div className={styles.notificationContainer}>
          <FaBell
            className={styles.bellIcon}
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <p>No new notifications</p>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className={styles.tabButtons}>
        {["Chat", "Contacts"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${
              activeTab === tab ? styles.active : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chats */}
      {activeTab === "Chat" && (
        <div className={styles.chatList}>
          <h5>Recent</h5>
          {filteredChats.length === 0 ? (
            <p>No recent chats</p>
          ) : (
            filteredChats.map((chat, index) => (
              <React.Fragment key={chat.receiver}>
                <div
                  className={`${styles.chatItem} ${
                    activeReceiverId === chat.receiver ? styles.active : ""
                  }`}
                  onClick={() =>
                    dispatch(setActiveReceiverId(chat.receiverId))
                  }
                  style={{ cursor: "pointer" }}
                >
                  {/* Avatar */}
                  <div className={styles.avatar}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#ddd" />
                      <path
                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
                        fill="#555"
                      />
                      <path
                        d="M12 14c-4 0-6 2-6 4v1h12v-1c0-2-2-4-6-4z"
                        fill="#555"
                      />
                    </svg>
                  </div>

                  {/* Chat Info */}
                  <div style={{ flex: 1 }}>
                    <h6
                      style={{
                        border: "1px solid #ccc",
                        fontSize: "12px",
                        padding: "2px 4px",
                        borderRadius: "4px",
                        margin: 0,
                        display: "inline-block",
                      }}
                    >
                      {chat.name === userName ? "You" : chat?.name}
                    </h6>
                    <div
                      style={{
                        fontSize: "13px",
                        marginTop: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {chat.receiverId !== userId && renderTickIcon()}
                      {chat.content}
                    </div>
                  </div>

                  {/* Time */}
                  <span className={styles.time}>
                    {new Date(chat.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Separator */}
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid #eee",
                    margin: "0",
                  }}
                />
              </React.Fragment>
            ))
          )}
        </div>
      )}

      {/* Contacts */}
      {activeTab === "Contacts" && (
        <div className={styles.contactList}>
          <div className={styles.contactLabel}>Contacts</div>
          {filteredContacts.map((contact) => (
            <div
              key={contact._id}
              className={styles.contactGroup}
              onClick={() =>
                dispatch(setActiveReceiverId(contact.userId))
              }
            >
              <div className={styles.contactItem}>
                <div className={styles.avatar}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#ddd" />
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
                      fill="#555"
                    />
                    <path
                      d="M12 14c-4 0-6 2-6 4v1h12v-1c0-2-2-4-6-4z"
                      fill="#555"
                    />
                  </svg>
                </div>
                <div className={styles.contactInfo}>
                  <div className={styles.contactName}>{contact.name}</div>
                  <div className={styles.contactMobile}>{contact.mobile}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;

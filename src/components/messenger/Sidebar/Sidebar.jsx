import React, { useEffect, useState } from "react";
import { FaSearch, FaBell } from "react-icons/fa";
import styles from "./Sidebar.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getChats, getContacts, setActiveReceiverId } from "src/components/redux/reducers/messenger/messenger";
import { userId, userName } from "../../../../utils/util";

const Sidebar = ({ activeTab, setActiveTab, searchQuery, setSearchQuery }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const dispatch = useDispatch();

    const contacts = useSelector((state) => state.messenger.contacts);
    const chats = useSelector((state) => state.messenger.chats);
    const activeReceiverId = useSelector((state) => state.messenger.activeReceiverId);

    useEffect(() => {
        if (userId) {
            dispatch(getContacts(userId));
            dispatch(getChats(userId));
        }
    }, [dispatch, userId]);

    return (
        <div className={styles.sidebar}>
            <div className={styles.profileSection}>
                <img
                    src="https://randomuser.me/api/portraits/women/75.jpg"
                    alt="profile"
                    className={styles.profilePic}
                />
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

            <div className={styles.searchBar}>
                <FaSearch className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className={styles.tabButtons}>
                {["Chat", "Contacts"].map((tab) => (
                    <button
                        key={tab}
                        className={`${styles.tabButton} ${activeTab === tab ? styles.active : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === "Chat" && (
                <div className={styles.chatList}>
                    <h5>Recent</h5>
                    {chats.length === 0 ? (
                        <p>No recent chats</p>
                    ) : (
                        chats.map((chat, index) => (
                            <div
                                key={chat.receiver}
                                className={`${styles.chatItem} ${activeReceiverId === chat.receiver ? styles.active : ""}`}
                                onClick={() => {
                                    console.log("Clicked receiver id:", chat.receiverId);
                                    dispatch(setActiveReceiverId(chat.receiverId));
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                <img
                                    src={`https://randomuser.me/api/portraits/men/${10 + index}.jpg`}
                                    alt={chat.name}
                                    className={styles.avatar}
                                />
                                <div>
                                    <h6>{chat.name}</h6>
                                    <span>{chat.content}</span>
                                </div>
                                <span className={styles.time}>
                                    {new Date(chat.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === "Contacts" && (
                <div className={styles.contactList}>
                    <div className={styles.contactLabel}>Contacts</div>
                    {contacts.map((contact) => (
                        <div key={contact._id} className={styles.contactGroup}>
                            <div className={styles.contactItem}>
                                <img
                                    src="https://randomuser.me/api/portraits/men/10.jpg"
                                    alt={contact.name || "Contact"}
                                    className={styles.avatar}
                                />
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

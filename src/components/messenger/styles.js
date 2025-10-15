export const styles = {
  messengerWrapper: {
    display: 'flex',
    width: '96vw',
    maxWidth: '1400px',
    height: '90vh',
    minHeight: '700px',
    maxHeight: '900px',
    margin: '2vh auto',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.12)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    position: 'relative'
  },

  sidebar: {
    width: '340px',
    minWidth: '340px',
    backgroundColor: '#f8fafc',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
  },

  profileSection: {
    padding: '28px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    minHeight: '100px'
  },

  profileAvatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '22px',
    fontWeight: '700',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    flexShrink: 0
  },

  profileInfo: {
    flex: 1
  },

  profileName: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },

  status: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.85)',
    margin: '6px 0 0 0'
  },

  bellIcon: {
    fontSize: '22px',
    color: 'rgba(255, 255, 255, 0.85)',
    cursor: 'pointer',
    padding: '12px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    flexShrink: 0
  },

  searchBar: {
    margin: '24px 20px',
    position: 'relative'
  },

  searchInput: {
    width: '100%',
    padding: '16px 24px 16px 48px',
    border: '1px solid #e2e8f0',
    borderRadius: '30px',
    fontSize: '15px',
    outline: 'none',
    backgroundColor: '#ffffff',
    transition: 'all 0.3s ease',
    boxShadow: '0 3px 6px rgba(0,0,0,0.04)'
  },

  searchIcon: {
    position: 'absolute',
    left: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    fontSize: '16px'
  },

  tabButtons: {
    display: 'flex',
    margin: '0 20px 24px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
  },

  tabButton: {
    flex: 1,
    padding: '14px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    color: '#64748b'
  },

  activeTab: {
    backgroundColor: '#667eea',
    color: 'white',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35)'
  },

  chatList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 12px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#cbd5e1 transparent'
  },

  chatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 18px',
    margin: '3px 8px',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative'
  },

  activeChatItem: {
    backgroundColor: 'rgba(102, 126, 234, 0.12)',
    borderLeft: '4px solid #667eea',
    transform: 'translateX(4px)'
  },

  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px',
    fontWeight: '600',
    flexShrink: 0,
    boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
  },

  chatInfo: {
    flex: 1,
    minWidth: 0
  },

  chatName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 6px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  lastMessage: {
    fontSize: '14px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  time: {
    fontSize: '12px',
    color: '#94a3b8',
    flexShrink: 0,
    fontWeight: '500'
  },

  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    minHeight: 0
  },

  chatPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },

  chatHeader: {
    padding: '24px 28px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    background: 'linear-gradient(90deg, #ffffff 0%, #f8fafc 100%)',
    minHeight: '90px'
  },

  chatHeaderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px'
  },

  chatHeaderAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.35)'
  },

  chatHeaderDetails: {
    display: 'flex',
    flexDirection: 'column'
  },

  chatHeaderName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },

  activeStatus: {
    fontSize: '14px',
    color: '#10b981',
    margin: '4px 0 0 0',
    fontWeight: '600'
  },

  inactiveStatus: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 0'
  },

  chatIcons: {
    display: 'flex',
    gap: '6px'
  },

  iconBtn: {
    padding: '14px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '50%',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '20px',
    transition: 'all 0.3s ease'
  },

  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 28px',
    backgroundColor: '#f8fafc',
    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
    scrollbarWidth: 'thin',
    scrollbarColor: '#cbd5e1 transparent'
  },

  noMessagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b'
  },

  noMessagesImage: {
    width: '160px',
    height: '160px',
    opacity: 0.75,
    marginBottom: '20px'
  },

  message: {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    animation: 'fadeIn 0.4s ease'
  },

  messageRight: {
    alignItems: 'flex-end'
  },

  messageLeft: {
    alignItems: 'flex-start'
  },

  bubble: {
    maxWidth: '70%',
    padding: '16px 20px',
    borderRadius: '24px',
    position: 'relative',
    wordWrap: 'break-word',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  },

  bubbleRight: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderBottomRightRadius: '8px'
  },

  bubbleLeft: {
    backgroundColor: '#ffffff',
    color: '#1e293b',
    border: '1px solid #e2e8f0',
    borderBottomLeftRadius: '8px'
  },

  senderName: {
    fontSize: '12px',
    marginBottom: '8px',
    opacity: 0.85,
    fontWeight: '600'
  },

  messageText: {
    fontSize: '16px',
    lineHeight: '1.5',
    margin: 0
  },

  messageImage: {
    maxWidth: '240px',
    borderRadius: '16px',
    marginBottom: '10px',
    boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
  },

  timestamp: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: '8px 16px 0',
    alignSelf: 'flex-end',
    fontWeight: '500'
  },

  chatInputWrapper: {
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    padding: '24px 28px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    minHeight: '110px'
  },

  previewContainer: {
    display: 'flex',
    gap: '16px',
    marginBottom: '18px',
    flexWrap: 'wrap'
  },

  previewWrapper: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
  },

  previewImg: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '16px'
  },

  removeBtn: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '28px',
    height: '28px',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
    transition: 'all 0.3s ease'
  },

  chatInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 24px',
    border: '1px solid #e2e8f0',
    borderRadius: '30px',
    backgroundColor: '#f8fafc',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    transition: 'all 0.3s ease'
  },

  messageInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '16px',
    padding: '10px 0',
    color: '#1e293b'
  },

  inputIcon: {
    fontSize: '22px',
    color: '#64748b',
    cursor: 'pointer',
    padding: '10px',
    borderRadius: '50%',
    transition: 'all 0.3s ease'
  },

  sendBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.35)'
  },

  emojiPicker: {
    position: 'absolute',
    bottom: '120px',
    right: '28px',
    zIndex: 1000,
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 25px 80px rgba(0,0,0,0.18)',
    border: '1px solid #e2e8f0'
  },

  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60px',
    color: '#64748b',
    fontSize: '16px'
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
    padding: '60px 24px',
    textAlign: 'center'
  },

  emptyStateTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#334155'
  },

  emptyStateText: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.6'
  }
};

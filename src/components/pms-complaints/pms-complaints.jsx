import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { toast } from "react-toastify";
import {
  FiImage,
  FiClock,
  FiX,
  FiFilter,
  FiPlus,
  FiSearch,
  FiMessageCircle,
  FiSend,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Chip,
  Modal,
  Select,
  styled,
  Tooltip,
  MenuItem,
  Container,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  CircularProgress,
  Button,
  Grid,
  Autocomplete,
  Card,
  CardContent,
  CardActions,
  Stack,
  Divider,
  InputAdornment,
  Paper,
  Avatar,
  Badge,
  Fade,
  Zoom,
  Slide,
  Skeleton,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import { fDateTime } from "../../../utils/format-time";
import {
  localUrl,
  userName as name,
  hotelEmail as email,
  userId,
  userName,
} from "../../../utils/util";

import { fetchUsers } from "src/components/redux/reducers/user";
import FeedbackDialog from "../settings/complaints/Feedback";

const COMPLAINT_STATUS = {
  PENDING: "Pending",
  RESOLVED: "Resolved",
  WORKING: "Working",
  CLOSED: "Closed",
};

// Enhanced Styled Components with beautiful animations and gradients
const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === COMPLAINT_STATUS.PENDING
      ? theme.palette.warning.main
      : status === COMPLAINT_STATUS.RESOLVED
        ? theme.palette.success.main
        : status === COMPLAINT_STATUS.WORKING
          ? theme.palette.info.main
          : status === COMPLAINT_STATUS.CLOSED
            ? theme.palette.error.main
            : theme.palette.grey[500],
  color: theme.palette.common.white,
  fontSize: "0.75rem",
  fontWeight: "bold",
  height: "32px",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  borderRadius: "16px",
  boxShadow: theme.shadows[2],
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[4],
  },
}));

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  backdrop: "blur(10px)",
}));

const ModalContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(3),
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  padding: 0,
  width: "clamp(320px, 90vw, 900px)",
  maxHeight: "90vh",
  overflowY: "auto",
  border: "none",
  outline: "none",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(3),
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `1px solid ${theme.palette.divider}`,
  overflow: "visible",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
    borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    transform: "translateY(-8px)",
    "&::before": {
      opacity: 1,
    },
  },
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    right: "-50%",
    width: "200%",
    height: "200%",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
    transform: "rotate(45deg)",
  },
}));

const FilterCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2.5),
  backgroundColor: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(10px)",
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
    transition: "left 0.5s",
  },
  "&:hover": {
    boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
    transform: "translateY(-4px)",
    "&::before": {
      left: "100%",
    },
  },
}));

// Enhanced Chat Components with modern messaging UI
const ChatContainer = styled(Paper)(({ theme }) => ({
  height: "600px",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.spacing(2.5),
  overflow: "hidden",
  background: theme.palette.background.default,
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(2),
  backgroundColor: "#f8fafc",
  backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.8) 2px, transparent 0), 
                    radial-gradient(circle at 75px 75px, rgba(255,255,255,0.8) 2px, transparent 0)`,
  backgroundSize: "100px 100px",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  scrollBehavior: "smooth",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.grey[300],
    borderRadius: "3px",
    "&:hover": {
      background: theme.palette.grey[400],
    },
  },
}));

const ChatInput = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: "flex",
  gap: theme.spacing(1.5),
  background: theme.palette.background.paper,
  alignItems: "flex-end",
}));

const MessageBubble = styled(Box)(({ theme, isAdmin }) => ({
  display: "flex",
  justifyContent: isAdmin ? "flex-end" : "flex-start",
  marginBottom: theme.spacing(1),
  animation: "messageSlideIn 0.3s ease-out",
  "@keyframes messageSlideIn": {
    from: {
      opacity: 0,
      transform: isAdmin ? "translateX(20px)" : "translateX(-20px)",
    },
    to: {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
  "& .message-content": {
    padding: theme.spacing(2),
    maxWidth: "75%",
    backgroundColor: isAdmin
      ? theme.palette.primary.main
      : theme.palette.background.paper,
    color: isAdmin
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    borderRadius: theme.spacing(2.5),
    borderBottomRightRadius: isAdmin ? theme.spacing(0.5) : theme.spacing(2.5),
    borderBottomLeftRadius: isAdmin ? theme.spacing(2.5) : theme.spacing(0.5),
    boxShadow: isAdmin
      ? "0 2px 12px rgba(25, 118, 210, 0.3)"
      : "0 2px 12px rgba(0,0,0,0.08)",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      bottom: "-6px",
      [isAdmin ? "right" : "left"]: "15px",
      width: 0,
      height: 0,
      borderLeft: isAdmin ? "6px solid transparent" : "none",
      borderRight: isAdmin ? "none" : "6px solid transparent",
      borderTop: `6px solid ${
        isAdmin ? theme.palette.primary.main : theme.palette.background.paper
      }`,
    },
  },
}));

const SendButton = styled(IconButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: "white",
  minWidth: 52,
  minHeight: 52,
  borderRadius: "50%",
  boxShadow: "0 4px 16px rgba(25, 118, 210, 0.4)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(25, 118, 210, 0.5)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
  "&:disabled": {
    background: theme.palette.grey[300],
    color: theme.palette.grey[500],
    boxShadow: "none",
  },
}));

// Enhanced ChatModal with real-time refresh and smooth animations
const ChatModal = ({
  open,
  onClose,
  complaint,
  onSendMessage,
  onMessageChange,
  newMessage,
  sendingMessage,
  refreshingChat,
}) => {
  // Combine messages from both updatedBy and chats arrays
  const messages = useMemo(() => {
    if (!complaint) return [];

    const adminMessages = (complaint?.updatedBy || []).flatMap((u) =>
      (u.messages || []).map((msg) => ({
        ...msg,
        messageType: "admin",
        senderName: msg.sender || "Admin",
      }))
    );

    const chatMessages = (complaint?.chats || []).map((chat) => ({
      ...chat,
      messageType: "chat",
      senderName: chat.sender || "User",
      content: chat.content,
      timestamp: chat.timestamp,
      sender: chat.sender,
      receiver: chat.receiver,
    }));

    const allMessages = [...adminMessages, ...chatMessages];
    return allMessages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [complaint?.updatedBy, complaint?.chats]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (open) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleInputChange = (e) => {
    onMessageChange(e);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  if (!complaint) {
    return null;
  }

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        style: {
          backgroundColor: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(5px)",
        },
      }}
    >
      <Fade in={open}>
        <ModalContainer sx={{ width: "clamp(320px, 90vw, 800px)" }}>
          <ChatContainer>
            <ChatHeader>
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  width: 48,
                  height: 48,
                }}
              >
                <FiMessageCircle size={24} />
              </Avatar>
              <Box flex={1}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: "1.1rem" }}
                >
                  Chat Support - #{complaint.complaintId}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {complaint.hotelName || "Hotel Support"}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {messages.length} messages
                </Typography>
              </Box>
              {refreshingChat && (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} color="inherit" />
                  <Typography variant="caption">Syncing...</Typography>
                </Box>
              )}
              <IconButton
                onClick={onClose}
                sx={{
                  color: "inherit",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.2)",
                  },
                }}
              >
                <FiX />
              </IconButton>
            </ChatHeader>

            <ChatMessages>
              {messages.length > 0 ? (
                messages.map((msg, index) => {
                  const isAdmin =
                    msg.sender === "Admin" ||
                    msg.sender === userName ||
                    msg.messageType === "admin" ||
                    (msg.sender && msg.sender.includes("Admin"));

                  return (
                    <Fade
                      in={true}
                      key={`${msg._id || index}-${msg.timestamp}`}
                    >
                      <MessageBubble isAdmin={isAdmin}>
                        <Box className="message-content">
                          <Stack
                            direction="row"
                            alignItems="center"
                            gap={1}
                            mb={0.5}
                          >
                            <Avatar
                              sx={{ width: 20, height: 20, fontSize: "0.7rem" }}
                            >
                              {(
                                msg.senderName ||
                                msg.sender ||
                                (isAdmin ? "A" : "U")
                              ).charAt(0)}
                            </Avatar>
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              sx={{ opacity: 0.8 }}
                            >
                              {msg.senderName ||
                                msg.sender ||
                                (isAdmin ? "Admin" : "User")}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.6, fontSize: "0.65rem" }}
                            >
                              {fDateTime(msg.timestamp)}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              lineHeight: 1.4,
                            }}
                          >
                            {msg.content}
                          </Typography>
                        </Box>
                      </MessageBubble>
                    </Fade>
                  );
                })
              ) : (
                <Box textAlign="center" py={8}>
                  <FiMessageCircle size={48} color="#ccc" />
                  <Typography variant="h6" color="text.secondary" mt={2}>
                    No messages yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start the conversation with your customer
                  </Typography>
                </Box>
              )}
              {isTyping && (
                <Fade in={isTyping}>
                  <Box display="flex" alignItems="center" gap={1} px={2}>
                    <Avatar sx={{ width: 20, height: 20 }}>A</Avatar>
                    <Box
                      sx={{
                        display: "flex",
                        gap: "2px",
                        p: 1,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 1,
                      }}
                    >
                      {[1, 2, 3].map((dot) => (
                        <Box
                          key={dot}
                          sx={{
                            width: 4,
                            height: 4,
                            bgcolor: "grey.400",
                            borderRadius: "50%",
                            animation: `typing 1.4s ease-in-out ${dot * 0.2}s infinite`,
                            "@keyframes typing": {
                              "0%, 60%, 100%": {
                                transform: "translateY(0)",
                              },
                              "30%": {
                                transform: "translateY(-10px)",
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Fade>
              )}
              <div ref={messagesEndRef} />
            </ChatMessages>

            <ChatInput>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={4}
                disabled={sendingMessage}
                inputRef={inputRef}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "background.default",
                  },
                }}
              />
              <SendButton
                onClick={onSendMessage}
                disabled={!newMessage.trim() || sendingMessage}
              >
                {sendingMessage ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <FiSend />
                )}
              </SendButton>
            </ChatInput>
          </ChatContainer>
        </ModalContainer>
      </Fade>
    </StyledModal>
  );
};

const Complaint = () => {
  const dispatch = useDispatch();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [openAttachmentsModal, setOpenAttachmentsModal] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [currentComplaintId, setCurrentComplaintId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [timelineOpen, setTimelineOpen] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatComplaint, setChatComplaint] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [refreshingChat, setRefreshingChat] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [regarding, setRegarding] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [createHotelEmail, setCreateHotelEmail] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [issue, setIssue] = useState("");
  const [images, setImages] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [fetchTimer, setFetchTimer] = useState(null);
  const [assignedTo, setAssignedTo] = useState("");
  const [complaintId, setComplaintId] = useState("");

  const allUsers = useSelector((state) =>
    Array.isArray(state.user.userData) ? state.user.userData : []
  );

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
       const query = new URLSearchParams({
        status: statusFilter,
        complaintId: searchText,
        hotelEmail: email,
      }).toString();
       const response = await fetch(
        `${localUrl}/get/all-complaint-on-admin/panel/by-filter?${query}`
      );

      if (!response.ok) throw new Error("Failed to fetch complaints");
      const result = await response.json();
      setComplaints(result);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhanced refresh function for real-time updates
  const refreshChatData = useCallback(
    async (complaintId = null) => {
      try {
        setRefreshingChat(true);
        const response = await fetch(
          `${localUrl}/get/all-complaint-on-admin/panel`
        );
        if (!response.ok) throw new Error("Failed to refresh data");
        const result = await response.json();
        setComplaints(result);

        // Update current chat complaint if it matches
        if (complaintId && chatComplaint) {
          const updatedComplaint = result.find(
            (c) => c.complaintId === complaintId
          );
          if (updatedComplaint) {
            setChatComplaint(updatedComplaint);
          }
        }
      } catch (err) {
        console.error("Error refreshing chat data:", err);
      } finally {
        setRefreshingChat(false);
      }
    },
    [chatComplaint]
  );

  useEffect(() => {
    fetchComplaints();
    dispatch(fetchUsers());
  }, [fetchComplaints, dispatch]);

  useEffect(() => {
    if (fetchTimer) clearTimeout(fetchTimer);
    if (bookingId) {
      const timer = setTimeout(async () => {
        setLoadingHotels(true);
        try {
          const response = await fetch(
            `${localUrl}/get/all/filtered/booking/by/query?bookingId=${bookingId}`
          );
          if (!response.ok) throw new Error("Could not fetch hotel details");
          const data = await response.json();
          setHotels(data || []);
        } catch (err) {
          console.error("Error fetching hotel data:", err);
          toast.error(err.message || "Failed to fetch hotel data.");
          setHotels([]);
        } finally {
          setLoadingHotels(false);
        }
      }, 1500);
      setFetchTimer(timer);
    } else {
      setHotels([]);
      setLoadingHotels(false);
    }
    return () => {
      if (fetchTimer) clearTimeout(fetchTimer);
    };
  }, [bookingId]);

  // Enhanced sendChatMessage with immediate UI update and refresh
  const sendChatMessage = useCallback(
    async (complaintId, messageContent) => {
      try {
        setSendingMessage(true);

        // Optimistic UI update
        const optimisticMessage = {
          _id: `temp-${Date.now()}`,
          sender: userName || "Admin",
          content: messageContent.trim(),
          timestamp: new Date().toISOString(),
          messageType: "admin",
          senderName: userName || "Admin",
        };

        // Add optimistic message to current chat
        if (chatComplaint) {
          setChatComplaint((prev) => ({
            ...prev,
            chats: [...(prev.chats || []), optimisticMessage],
          }));
        }

        const response = await fetch(
          `${localUrl}/do/chat-support/${complaintId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              (() => {
                const lastChat =
                  complaints?.chats?.[complaints.chats.length - 1];
                const receiver = lastChat?.sender || "User";

                return {
                  sender: userName || "Admin",
                  receiver: receiver,
                  content: messageContent.trim(),
                };
              })()
            ),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Chat API Error Response:", errorText);
          throw new Error(errorText || "Failed to send message");
        }

        const result = await response.json();

        // Clear input immediately
        setNewMessage("");
        // Refresh data in background
        setTimeout(() => {
          refreshChatData(complaintId);
        }, 500);

        return result;
      } catch (err) {
        console.error("Error sending chat message:", err);

        // Remove optimistic message on error
        if (chatComplaint) {
          setChatComplaint((prev) => ({
            ...prev,
            chats:
              prev.chats?.filter((msg) => !msg._id?.startsWith("temp-")) || [],
          }));
        }

        toast.error("Failed to send message. Please try again. ❌");
        throw err;
      } finally {
        setSendingMessage(false);
      }
    },
    [chatComplaint, refreshChatData]
  );

  const updateComplaintStatus = useCallback(
    async (id, status, feedBack, message = null) => {
      try {
        setSendingMessage(true);

        const payload = {
          status,
          feedBack,
          updatedBy: {
            name,
            email,
            feedBack,
            status,
            updatedAt: new Date().toISOString(),
          },
        };

        if (message?.content?.trim()) {
          payload.messages = {
            sender: "Admin",
            content: message.content.trim(),
            timestamp: message.timestamp || new Date().toISOString(),
          };
        }

        const response = await fetch(
          `${localUrl}/approveComplaint-on-panel/by-id/${id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(errorText || "Failed to update complaint");
        }

        const updatedComplaint = await response.json();

        setComplaints((prev) =>
          prev.map((c) => (c._id === id ? updatedComplaint : c))
        );

        if (chatComplaint && chatComplaint._id === id) {
          setChatComplaint(updatedComplaint);
        }

        if (payload.messages) {
          toast.success("Message sent successfully! ✅");
          setNewMessage("");
        } else {
          toast.success("Status updated successfully! 🎉");
        }

        return updatedComplaint;
      } catch (err) {
        console.error("Error updating complaint:", err);
        toast.error(
          message?.content
            ? "Failed to send message. Please try again. ❌"
            : "Failed to update status. Please try again. ❌"
        );
        throw err;
      } finally {
        setSendingMessage(false);
        setFeedbackOpen(false);
      }
    },
    [name, email, chatComplaint]
  );

  const handleStatusChange = useCallback((id, status) => {
    setCurrentComplaintId(id);
    setNewStatus(status);
    setFeedbackOpen(true);
  }, []);

  const handleFeedbackSubmit = useCallback(
    (feedBack) => {
      if (currentComplaintId && newStatus) {
        updateComplaintStatus(currentComplaintId, newStatus, feedBack);
      }
    },
    [currentComplaintId, newStatus, updateComplaintStatus]
  );

  const handleOpenTimeline = useCallback((complaint) => {
    setSelectedComplaint(complaint);
    setTimelineOpen(true);
  }, []);

  const handleCloseTimeline = useCallback(() => {
    setTimelineOpen(false);
    setSelectedComplaint(null);
  }, []);

  const handleOpenChat = useCallback((complaint) => {
    console.log("Opening chat for complaint:", complaint);
    setChatComplaint(complaint);
    setChatOpen(true);
    setNewMessage("");
  }, []);

  const handleCloseChat = useCallback(() => {
    setChatOpen(false);
    setChatComplaint(null);
    setNewMessage("");
    setSendingMessage(false);
    setRefreshingChat(false);
  }, []);

  const handleMessageChange = useCallback((e) => {
    setNewMessage(e.target.value);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !chatComplaint || sendingMessage) {
      return;
    }

    try {
      await sendChatMessage(chatComplaint.complaintId, newMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [newMessage, chatComplaint, sendingMessage, sendChatMessage]);

  const handleHotelChange = useCallback(
    (event) => {
      const selectedHotelId = event.target.value;
      const selectedHotel = hotels.find(
        (h) => h?.hotelDetails?.hotelId === selectedHotelId
      );
      if (selectedHotel) {
        setHotelId(selectedHotel.hotelDetails.hotelId);
        setHotelName(selectedHotel.hotelDetails.hotelName);
        setCreateHotelEmail(selectedHotel.hotelDetails.hotelEmail);
      }
    },
    [hotels]
  );

  const resetCreateForm = () => {
    setRegarding("");
    setHotelName("");
    setHotelId("");
    setMessages([]);
    setCreateHotelEmail("");
    setBookingId("");
    setIssue("");
    setImages([]);
    setHotels([]);
    setAssignedTo("");
  };

  const handleCreateComplaintSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData();
      formData.append("userId", complaintId);
      formData.append("regarding", regarding);
      formData.append("hotelName", hotelName);
      formData.append("hotelId", hotelId);
      formData.append("messages", messages);
      formData.append("hotelEmail", createHotelEmail);
      formData.append("bookingId", bookingId);
      formData.append("issue", issue);
      if (assignedTo) {
        formData.append("assignedTo", assignedTo);
      }
      Array.from(images).forEach((file) => formData.append("images", file));

      try {
        const response = await fetch(
          `${localUrl}/create-a-complaint/on/hotel`,
          {
            method: "POST",
            body: formData,
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to create complaint");
        }
        toast.success("Complaint created successfully! 🎉");
        setIsCreateModalOpen(false);
        fetchComplaints();
        resetCreateForm();
      } catch (err) {
        toast.error("Failed to create complaint. ❌");
        console.error("Error creating complaint:", err);
      }
    },
    [
      complaintId,
      regarding,
      hotelName,
      hotelId,
      createHotelEmail,
      bookingId,
      issue,
      images,
      fetchComplaints,
      assignedTo,
    ]
  );

  const filteredComplaints = useMemo(
    () =>
      complaints?.filter((complaint) => {
        const searchTextLower = searchText.toLowerCase();
        const latestUpdate = complaint.updatedBy?.at(-1) || {};
        const matchesSearchText =
          complaint.hotelName?.toLowerCase().includes(searchTextLower) ||
          (latestUpdate.email || "").toLowerCase().includes(searchTextLower) ||
          complaint.complaintId?.includes(searchText);
        const matchesStatus =
          statusFilter === "" || complaint.status === statusFilter;
        return matchesSearchText && matchesStatus;
      }),
    [complaints, searchText, statusFilter]
  );

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(
      (c) => c.status === COMPLAINT_STATUS.PENDING
    ).length;
    const resolved = complaints.filter(
      (c) => c.status === COMPLAINT_STATUS.RESOLVED
    ).length;
    const working = complaints.filter(
      (c) => c.status === COMPLAINT_STATUS.WORKING
    ).length;
    const closed = complaints.filter(
      (c) => c.status === COMPLAINT_STATUS.CLOSED
    ).length;

    return { total, pending, resolved, working, closed };
  }, [complaints]);

  const ComplaintTimeline = ({ open, onClose, timeline }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case COMPLAINT_STATUS.PENDING:
          return "warning";
        case COMPLAINT_STATUS.RESOLVED:
          return "success";
        case COMPLAINT_STATUS.WORKING:
          return "info";
        case COMPLAINT_STATUS.CLOSED:
          return "error";
        default:
          return "grey";
      }
    };

    const sortedTimeline = useMemo(
      () =>
        timeline
          ? [...timeline].sort(
              (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
            )
          : [],
      [timeline]
    );

    return (
      <StyledModal open={open} onClose={onClose}>
        <Fade in={open}>
          <ModalContainer>
            <Box p={4}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h5" fontWeight="bold" color="primary">
                  Complaint Timeline
                </Typography>
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{ bgcolor: "grey.100" }}
                >
                  <FiX />
                </IconButton>
              </Stack>
              {sortedTimeline.length > 0 ? (
                <Timeline position="alternate" sx={{ padding: 0 }}>
                  {sortedTimeline.map((update, index) => (
                    <Zoom
                      in={true}
                      style={{ transitionDelay: `${index * 100}ms` }}
                      key={index}
                    >
                      <TimelineItem>
                        <TimelineSeparator>
                          <TimelineDot
                            color={getStatusColor(update.status)}
                            sx={{ p: 1 }}
                          />
                          {index < sortedTimeline.length - 1 && (
                            <TimelineConnector />
                          )}
                        </TimelineSeparator>
                        <TimelineContent sx={{ py: "12px", px: 2 }}>
                          <Paper
                            sx={{
                              p: 2.5,
                              borderRadius: 2,
                              bgcolor: "background.default",
                              boxShadow: 2,
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              gap={1}
                              mb={1}
                            >
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: "primary.main",
                                }}
                              >
                                {update.name?.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                >
                                  {update.name}
                                </Typography>
                                <StatusChip
                                  status={update.status}
                                  label={update.status}
                                  size="small"
                                />
                              </Box>
                            </Stack>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              mb={1}
                            >
                              {fDateTime(update.updatedAt)}
                            </Typography>
                            {update.feedBack && (
                              <Typography
                                variant="body2"
                                sx={{ mt: 1, fontStyle: "italic" }}
                              >
                                "{update.feedBack}"
                              </Typography>
                            )}
                          </Paper>
                        </TimelineContent>
                      </TimelineItem>
                    </Zoom>
                  ))}
                </Timeline>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary" variant="h6">
                    No update history available
                  </Typography>
                </Box>
              )}
            </Box>
          </ModalContainer>
        </Fade>
      </StyledModal>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <HeaderCard>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={3}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Complaint Management System 🎯
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage customer complaints with real-time support
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              {stats.total} total complaints • {stats.pending} pending
              resolution
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<FiPlus />}
            onClick={() => setIsCreateModalOpen(true)}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "inherit",
              "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
              backdropFilter: "blur(10px)",
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              position: "relative",
              zIndex: 1,
            }}
          >
            Create New Complaint
          </Button>
        </Stack>
      </HeaderCard>

      {/* Enhanced Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            label: "Total",
            value: stats.total,
            color: "primary.main",
            icon: "📊",
          },
          {
            label: "Pending",
            value: stats.pending,
            color: "warning.main",
            icon: "⏳",
          },
          {
            label: "In Progress",
            value: stats.working,
            color: "info.main",
            icon: "🔄",
          },
          {
            label: "Resolved",
            value: stats.resolved,
            color: "success.main",
            icon: "✅",
          },
          {
            label: "Closed",
            value: stats.closed,
            color: "error.main",
            icon: "🔒",
          },
        ].map((stat, index) => (
          <Grid item xs={6} sm={2.4} key={stat.label}>
            <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
              <StatsCard>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb={1}
                >
                  <Typography variant="h4" sx={{ mr: 1 }}>
                    {stat.icon}
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="medium"
                >
                  {stat.label}
                </Typography>
              </StatsCard>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Filter Controls */}
      <FilterCard>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems="center"
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search complaints by hotel, email, or ID... 🔍"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch size={20} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: { md: 400 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <FormControl size="medium" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filter by Status"
              startAdornment={<FiFilter style={{ marginRight: 8 }} />}
            >
              <MenuItem value="">All Status</MenuItem>
              {Object.values(COMPLAINT_STATUS).map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FiRefreshCw />}
            onClick={fetchComplaints}
            sx={{ minWidth: 120 }}
          >
            Refresh
          </Button>
        </Stack>
      </FilterCard>

      {/* Enhanced Complaints List */}
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Typography color="error" variant="h6">
            Failed to load complaints: {error} ❌
          </Typography>
        </Paper>
      ) : filteredComplaints.length > 0 ? (
        <Grid container spacing={3}>
          {filteredComplaints.map((c, index) => {
            const latest = c.updatedBy?.at(-1) || {};
            const totalMessages =
              (c.chats?.length || 0) +
              (c.updatedBy?.reduce(
                (sum, u) => sum + (u.messages?.length || 0),
                0
              ) || 0);

            return (
              <Grid item xs={12} md={6} lg={4} key={c._id}>
                <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                  <StyledCard>
                    <CardContent sx={{ pb: 1 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={2}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            gutterBottom
                          >
                            #{c.complaintId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {c.regarding}
                          </Typography>
                        </Box>
                        <StatusChip status={c.status} label={c.status} />
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      <Stack spacing={1.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="medium">
                            🏨 Hotel:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {c.hotelName}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            mb={0.5}
                          >
                            📝 Issue:
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {c.issue}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          🕒 Updated {fDateTime(c.updatedAt)} by{" "}
                          <strong>{latest.name || "System"}</strong>
                        </Typography>
                      </Stack>
                    </CardContent>

                    <CardActions
                      sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
                    >
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Attachments">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedComplaint(c);
                              setOpenAttachmentsModal(true);
                            }}
                            sx={{
                              bgcolor: "grey.100",
                              "&:hover": { bgcolor: "grey.200" },
                            }}
                          >
                            <FiImage />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Timeline">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenTimeline(c)}
                            sx={{
                              bgcolor: "grey.100",
                              "&:hover": { bgcolor: "grey.200" },
                            }}
                          >
                            <FiClock />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open Chat Support">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenChat(c)}
                            sx={{
                              bgcolor: "primary.light",
                              color: "primary.main",
                              "&:hover": {
                                bgcolor: "primary.main",
                                color: "white",
                              },
                            }}
                          >
                            <Badge
                              badgeContent={totalMessages}
                              color="error"
                              sx={{
                                "& .MuiBadge-badge": {
                                  fontSize: "0.6rem",
                                  height: "18px",
                                  minWidth: "18px",
                                },
                              }}
                            >
                              <FiMessageCircle />
                            </Badge>
                          </IconButton>
                        </Tooltip>
                      </Stack>

                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={c.status}
                          onChange={(e) =>
                            handleStatusChange(c._id, e.target.value)
                          }
                          variant="outlined"
                          sx={{ borderRadius: 2 }}
                        >
                          {Object.values(COMPLAINT_STATUS).map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </CardActions>
                  </StyledCard>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            📭
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No complaints found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or create a new complaint
          </Typography>
        </Paper>
      )}

      {/* All Modals */}
      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />

      <StyledModal
        open={openAttachmentsModal}
        onClose={() => setOpenAttachmentsModal(false)}
      >
        <Fade in={openAttachmentsModal}>
          <ModalContainer>
            <Box p={4}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h5" fontWeight="bold" color="primary">
                  📎 Attachments
                </Typography>
                <IconButton
                  onClick={() => setOpenAttachmentsModal(false)}
                  size="small"
                  sx={{ bgcolor: "grey.100" }}
                >
                  <FiX />
                </IconButton>
              </Stack>
              {selectedComplaint?.images?.length > 0 ? (
                <Grid container spacing={2}>
                  {selectedComplaint.images.map((img, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Paper sx={{ p: 1, borderRadius: 2 }}>
                        <img
                          src={img}
                          alt={`Attachment ${i + 1}`}
                          style={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    📷
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    No attachments available
                  </Typography>
                </Box>
              )}
            </Box>
          </ModalContainer>
        </Fade>
      </StyledModal>

      <ComplaintTimeline
        open={timelineOpen}
        onClose={handleCloseTimeline}
        timeline={selectedComplaint?.updatedBy}
      />

      <ChatModal
        open={chatOpen}
        onClose={handleCloseChat}
        complaint={chatComplaint}
        onSendMessage={handleSendMessage}
        onMessageChange={handleMessageChange}
        newMessage={newMessage}
        sendingMessage={sendingMessage}
        refreshingChat={refreshingChat}
      />

      {/* Create Complaint Modal - Similar enhanced styling */}
      <StyledModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <Fade in={isCreateModalOpen}>
          <ModalContainer>
            <Box p={4}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h5" fontWeight="bold" color="primary">
                  ➕ Create New Complaint
                </Typography>
                <IconButton
                  onClick={() => setIsCreateModalOpen(false)}
                  size="small"
                  sx={{ bgcolor: "grey.100" }}
                >
                  <FiX />
                </IconButton>
              </Stack>
              <Box
                component="form"
                onSubmit={handleCreateComplaintSubmit}
                noValidate
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Booking ID"
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                      size="small"
                      required
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small" required>
                      <InputLabel>Hotel</InputLabel>
                      {loadingHotels ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: 40,
                          }}
                        >
                          <CircularProgress size={20} />
                        </Box>
                      ) : (
                        <Select
                          value={hotelId}
                          label="Hotel"
                          onChange={handleHotelChange}
                          disabled={!bookingId || hotels.length === 0}
                        >
                          {hotels.map((h) => (
                            <MenuItem
                              key={h?.hotelDetails?.hotelId}
                              value={h?.hotelDetails?.hotelId}
                            >
                              {h?.hotelDetails?.hotelName}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small" required>
                      <InputLabel>Regarding</InputLabel>
                      <Select
                        value={regarding}
                        onChange={(e) => setRegarding(e.target.value)}
                        label="Regarding"
                      >
                        <MenuItem value="Booking">Booking</MenuItem>
                        <MenuItem value="Hotel">Hotel</MenuItem>
                        <MenuItem value="Website">Website</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Autocomplete
                      freeSolo
                      options={allUsers}
                      getOptionLabel={(option) =>
                        typeof option === "string"
                          ? option
                          : `${option.userName || "Unknown"} (${option.email})`
                      }
                      filterOptions={(options, state) =>
                        options.filter((user) =>
                          user.email
                            .toLowerCase()
                            .includes(state.inputValue.toLowerCase())
                        )
                      }
                      inputValue={assignedTo}
                      onInputChange={(event, newInputValue) => {
                        setAssignedTo(newInputValue);
                      }}
                      onChange={(event, newValue) => {
                        if (newValue && newValue.email) {
                          setComplaintId(newValue.userId);
                        } else {
                          setAssignedTo("");
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assigned To"
                          placeholder="Enter email"
                          size="small"
                          fullWidth
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Issue Description"
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      fullWidth
                      multiline
                      minRows={4}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 2,
                        border: "2px dashed grey.300",
                        borderRadius: 2,
                      }}
                    >
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        size="large"
                        sx={{ mb: 2 }}
                      >
                        Upload Images (max 3) 📷
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={(e) =>
                            setImages(Array.from(e.target.files))
                          }
                        />
                      </Button>
                      {images.length > 0 && (
                        <Grid container spacing={1}>
                          {images.map((img, i) => (
                            <Grid item xs={4} sm={3} md={2} key={i}>
                              <Box sx={{ position: "relative" }}>
                                <img
                                  src={
                                    img instanceof File
                                      ? URL.createObjectURL(img)
                                      : img
                                  }
                                  alt={`upload-${i}`}
                                  style={{
                                    width: "100%",
                                    height: 80,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    border: "1px solid #ddd",
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setImages((prev) =>
                                      prev.filter((_, idx) => idx !== i)
                                    )
                                  }
                                  sx={{
                                    position: "absolute",
                                    top: -8,
                                    right: -8,
                                    bgcolor: "error.main",
                                    color: "white",
                                    width: 20,
                                    height: 20,
                                    "&:hover": { bgcolor: "error.dark" },
                                  }}
                                >
                                  ×
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack
                      direction="row"
                      justifyContent="flex-end"
                      spacing={2}
                      sx={{ mt: 2 }}
                    >
                      <Button
                        onClick={() => setIsCreateModalOpen(false)}
                        size="large"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        type="submit"
                        size="large"
                        sx={{ px: 4 }}
                      >
                        Submit Complaint ✅
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </ModalContainer>
        </Fade>
      </StyledModal>
    </Container>
  );
};

export default Complaint;

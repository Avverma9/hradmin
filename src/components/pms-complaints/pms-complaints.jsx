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
  height: "28px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
}));

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
}));

const ModalContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[24],
  padding: theme.spacing(4),
  width: "clamp(320px, 90vw, 900px)",
  maxHeight: "90vh",
  overflowY: "auto",
  border: "none",
  outline: "none",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-2px)",
  },
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  boxShadow: theme.shadows[4],
}));

const FilterCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.divider}`,
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

// Chat Styled Components
const ChatContainer = styled(Paper)(({ theme }) => ({
  height: "500px",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const ChatInput = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: "flex",
  gap: theme.spacing(1),
}));

const MessageBubble = styled(Box)(({ theme, isAdmin }) => ({
  display: "flex",
  justifyContent: isAdmin ? "flex-end" : "flex-start",
  marginBottom: theme.spacing(1),
  "& .message-content": {
    padding: theme.spacing(1.5),
    maxWidth: "70%",
    backgroundColor: isAdmin
      ? theme.palette.primary.main
      : theme.palette.grey[200],
    color: isAdmin
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    borderRadius: theme.spacing(2),
    borderBottomRightRadius: isAdmin ? theme.spacing(0.5) : theme.spacing(2),
    borderBottomLeftRadius: isAdmin ? theme.spacing(2) : theme.spacing(0.5),
  },
}));

const ChatModal = ({
  open,
  onClose,
  complaint,
  onSendMessage,
  onMessageChange,
  newMessage,
  sendingMessage,
}) => {
  const messages = useMemo(
    () =>
      (complaint?.updatedBy || [])
        .flatMap((u) => u.messages || [])
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    [complaint?.updatedBy]
  );

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (open) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages, scrollToBottom]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  if (!complaint) {
    return null;
  }

  return (
    <StyledModal open={open} onClose={onClose}>
      <ModalContainer sx={{ width: "clamp(320px, 90vw, 600px)" }}>
        <ChatContainer>
          <ChatHeader>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
              <FiMessageCircle />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold">
                Chat - #{complaint.complaintId}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {complaint.userName ||
                  complaint.userEmail ||
                  complaint.assignedTo ||
                  "User"}
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: "inherit" }}>
              <FiX />
            </IconButton>
          </ChatHeader>

          <ChatMessages>
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <MessageBubble
                  key={index}
                  isAdmin={msg.sender === "Admin" || msg.sender === userName}
                >
                  <Box className="message-content">
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      display="block"
                      gutterBottom
                    >
                      {msg.sender}
                    </Typography>
                    <Typography
                      variant="body2"
                      paragraph
                      sx={{
                        mb: 0.5,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.7, fontSize: "0.7rem" }}
                    >
                      {fDateTime(msg.timestamp)}
                    </Typography>
                  </Box>
                </MessageBubble>
              ))
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No messages yet. Start the conversation!
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </ChatMessages>

          <ChatInput>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={newMessage}
              onChange={onMessageChange}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={3}
              disabled={sendingMessage}
              inputRef={inputRef}
              autoFocus
            />
            <IconButton
              color="primary"
              onClick={onSendMessage}
              disabled={!newMessage.trim() || sendingMessage}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
                "&:disabled": { bgcolor: "grey.300" },
                minWidth: 48,
                minHeight: 48,
              }}
            >
              {sendingMessage ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <FiSend />
              )}
            </IconButton>
          </ChatInput>
        </ChatContainer>
      </ModalContainer>
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
  }, [statusFilter, searchText]);

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

  // FIXED: Updated function with proper receiver extraction
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

        // FIXED: Proper receiver extraction with multiple fallback options
        if (message?.content?.trim()) {
          // Get the receiver with proper fallback
          const receiver =
            message.receiver ||
            chatComplaint?.userName ||
            chatComplaint?.userEmail ||
            chatComplaint?.email ||
            chatComplaint?.assignedTo ||
            chatComplaint?.userId ||
            "User";

          console.log("Sending message with receiver:", receiver); // Debug log
          console.log("Full message payload:", message); // Debug log

          payload.messages = {
            sender: "Admin",
            receiver: receiver, // Now properly set with fallbacks
            content: message.content.trim(),
            timestamp: message.timestamp || new Date().toISOString(),
          };
        }

        console.log(
          "Final payload being sent:",
          JSON.stringify(payload, null, 2)
        ); // Debug log

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
          toast.success("Message sent successfully!");
          setNewMessage("");
        } else {
          toast.success("Status updated successfully!");
        }

        return updatedComplaint;
      } catch (err) {
        console.error("Error updating complaint:", err);
        toast.error(
          message?.content
            ? "Failed to send message. Please try again."
            : "Failed to update status. Please try again."
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
    console.log("Opening chat for complaint:", complaint); // Debug log
    setChatComplaint(complaint);
    setChatOpen(true);
    setNewMessage("");
  }, []);

  const handleCloseChat = useCallback(() => {
    setChatOpen(false);
    setChatComplaint(null);
    setNewMessage("");
    setSendingMessage(false);
  }, []);

  const handleMessageChange = useCallback((e) => {
    setNewMessage(e.target.value);
  }, []);

  // FIXED: Updated handleSendMessage with better receiver extraction
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !chatComplaint || sendingMessage) {
      return;
    }

    // FIXED: Extract receiver with multiple fallback options
    const receiverEmail =
      chatComplaint.userName ||
      chatComplaint.userEmail ||
      chatComplaint.email ||
      chatComplaint.assignedTo ||
      chatComplaint.userId ||
      "User";

    console.log("Receiver extracted:", receiverEmail); // Debug log
    console.log("Chat complaint data:", chatComplaint); // Debug log

    const messageToSend = {
      sender: "Admin",
      receiver: receiverEmail, // Now properly extracted
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log("Message to send:", messageToSend); // Debug log

    try {
      await updateComplaintStatus(
        chatComplaint._id,
        chatComplaint.status,
        "",
        messageToSend
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [newMessage, chatComplaint, sendingMessage, updateComplaintStatus]);

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
        toast.success("Complaint created successfully!");
        setIsCreateModalOpen(false);
        fetchComplaints();
        resetCreateForm();
      } catch (err) {
        toast.error("Failed to create complaint.");
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
        <ModalContainer>
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
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot
                      color={getStatusColor(update.status)}
                      sx={{ p: 1 }}
                    />
                    {index < sortedTimeline.length - 1 && <TimelineConnector />}
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
                      <Stack direction="row" alignItems="center" gap={1} mb={1}>
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
                          <Typography variant="subtitle2" fontWeight="bold">
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
              ))}
            </Timeline>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary" variant="h6">
                No update history available
              </Typography>
            </Box>
          )}
        </ModalContainer>
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
          spacing={2}
        >
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Complaint Management
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Manage and track customer complaints efficiently
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<FiPlus />}
            onClick={() => setIsCreateModalOpen(true)}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "inherit",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              backdropFilter: "blur(10px)",
              borderRadius: 2,
              px: 3,
            }}
          >
            Create New Complaint
          </Button>
        </Stack>
      </HeaderCard>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={2.4}>
          <StatsCard>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Complaints
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <StatsCard>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {stats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <StatsCard>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {stats.working}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <StatsCard>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {stats.resolved}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resolved
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <StatsCard>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              {stats.closed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Closed
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>

      <FilterCard>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by hotel name, email, or complaint ID..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { md: 400 } }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
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
        </Stack>
      </FilterCard>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography color="error" variant="h6">
            Failed to load complaints: {error}
          </Typography>
        </Paper>
      ) : filteredComplaints.length > 0 ? (
        <Grid container spacing={2}>
          {filteredComplaints.map((c) => {
            const latest = c.updatedBy?.at(-1) || {};
            return (
              <Grid item xs={12} md={6} lg={4} key={c._id}>
                <StyledCard>
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={2}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          #{c.complaintId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {c.regarding}
                        </Typography>
                      </Box>
                      <StatusChip status={c.status} label={c.status} />
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Hotel:</strong> {c.hotelName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Issue:</strong> {c.issue?.substring(0, 100)}
                        {c.issue?.length > 100 && "..."}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Updated {fDateTime(c.updatedAt)} by{" "}
                        {latest.name || "System"}
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
                          sx={{ bgcolor: "grey.100" }}
                        >
                          <FiImage />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Timeline">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenTimeline(c)}
                          sx={{ bgcolor: "grey.100" }}
                        >
                          <FiClock />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open Chat">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenChat(c)}
                          sx={{
                            bgcolor: "primary.light",
                            color: "primary.main",
                          }}
                        >
                          <Badge
                            badgeContent={c.messages?.length || 0}
                            color="error"
                            sx={{
                              "& .MuiBadge-badge": {
                                fontSize: "0.6rem",
                                height: "16px",
                                minWidth: "16px",
                              },
                            }}
                          >
                            <FiMessageCircle />
                          </Badge>
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <FormControl size="small" sx={{ minWidth: 110 }}>
                      <Select
                        value={c.status}
                        onChange={(e) =>
                          handleStatusChange(c._id, e.target.value)
                        }
                        variant="outlined"
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
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No complaints found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or create a new complaint
          </Typography>
        </Paper>
      )}

      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />

      <StyledModal
        open={openAttachmentsModal}
        onClose={() => setOpenAttachmentsModal(false)}
      >
        <ModalContainer>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5" fontWeight="bold" color="primary">
              Attachments
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
              <Typography variant="h6" color="text.secondary">
                No attachments available
              </Typography>
            </Box>
          )}
        </ModalContainer>
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
      />

      <StyledModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <ModalContainer>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5" fontWeight="bold" color="primary">
              Create New Complaint
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
                  sx={{ p: 2, border: "2px dashed grey.300", borderRadius: 2 }}
                >
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    size="large"
                    sx={{ mb: 2 }}
                  >
                    Upload Images (max 3)
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) => setImages(Array.from(e.target.files))}
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
                  <Button variant="contained" type="submit" size="large">
                    Submit Complaint
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </ModalContainer>
      </StyledModal>
    </Container>
  );
};

export default Complaint;

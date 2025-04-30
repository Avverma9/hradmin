import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Box,
    Divider,
    IconButton,
    styled,
    useTheme
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";

// Flat, compact dialog
const FlatDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiPaper-root": {
        borderRadius: 0,
        boxShadow: "none",
    },
}));

const CompactListItem = styled(ListItem)(({ theme }) => ({
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
}));

const CompactAvatar = styled(Avatar)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    width: 36,
    height: 36,
    fontSize: 18,
}));

export default function UserDetailsModal({ open, onClose, userData }) {
    const theme = useTheme();

    return (
        <FlatDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle
                sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "#fff",
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="subtitle1" fontWeight="bold">
                    User Details
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ padding: 0 }}>
                {userData && userData.length > 0 ? (
                    <List disablePadding>
                        {userData.map((user, index) => (
                            <Box key={user._id || index}>
                                <CompactListItem>
                                    <ListItemAvatar>
                                        <CompactAvatar>
                                            <PersonIcon fontSize="small" />
                                        </CompactAvatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body1" fontWeight={500}>
                                                {user.userName || "Unnamed User"}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.mobile || "No mobile"}
                                                </Typography>
                                                {user.email && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {user.email}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                </CompactListItem>
                                {index < userData.length - 1 && (
                                    <Divider variant="fullWidth" component="li" />
                                )}
                            </Box>
                        ))}
                    </List>
                ) : (
                    <Typography sx={{ p: 2 }} variant="body2" color="text.secondary">
                        No user data available.
                    </Typography>
                )}
            </DialogContent>
        </FlatDialog>
    );
}

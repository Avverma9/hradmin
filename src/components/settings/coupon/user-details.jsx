import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";

export default function UserDetailsModal({ open, onClose, userList }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>User Details</DialogTitle>
            <DialogContent>
                <List>
                    {userList.map((user) => (
                        <ListItem key={user._id}>
                            <ListItemText
                                primary={user.userName}
                                secondary={user.mobile || ""}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
}

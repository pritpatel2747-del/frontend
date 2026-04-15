import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useNotifications } from "context/NotificationContext";

function NotificationToast() {
  const { currentToast, closeToast } = useNotifications();

  if (!currentToast) {
    return null;
  }

  // Map notification type to severity
  const getSeverity = (type) => {
    switch (type) {
      case "invitation_sent":
      case "invitation_rejected":
      case "invitation_accepted":
      case "profile_updated":
      case "success":
        return "success";
      case "user_deleted":
      case "error":
        return "error";
      case "info":
      case "user_joined":
      case "user_removed":
      default:
        return "info";
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    closeToast();
  };

  return (
    <Snackbar
      open={!!currentToast}
      autoHideDuration={2000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{marginTop:"50px !important"}}
    >
      <Alert
        onClose={handleClose}
        severity={getSeverity(currentToast.type)}
        sx={{ width: "100%" }}
        elevation={6}
        variant="filled"
      >
        {currentToast.message}
      </Alert>
    </Snackbar>
  );
}

export default NotificationToast;

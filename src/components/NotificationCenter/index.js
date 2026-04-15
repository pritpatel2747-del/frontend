import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useNotifications } from "context/NotificationContext";

function NotificationCenter() {
  const { notifications, removeNotification, clearNotifications } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const deleteNotification = async (id) => {
    removeNotification(id);
    const response = await fetch(`http://localhost:3001/api/notifications/${id}`, {
      method: "DELETE"
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Failed to delete notification:", data.error);
    }
    console.log("delete response:", data);
  };
  const handleRemoveNotification = (id) => {
    deleteNotification(id);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "invitation_sent":
      case "invitation_accepted":
        return "mail_outline";
      case "profile_updated":
        return "account_circle";
      case "user_deleted":
        return "person_remove";
      case "user_joined":
        return "person_add";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (status) => {
    switch (status) {
      case "success":
        return "#4caf50";
      case "error":
        return "#f44336";
      case "warning":
        return "#ff9800";
      case "info":
      default:
        return "#2196f3";
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
        sx={{ mr: 1 }}
        aria-label="notifications"
      >
        <Badge badgeContent={notifications.length} color="error">
          <Icon>notifications</Icon>
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: "350px",
            borderRadius: "12px",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem disabled sx={{ justifyContent: "center", py: 3 }}>
            <MDTypography variant="body2" color="textSecondary">
              No notifications
            </MDTypography>
          </MenuItem>
        ) : (
          <>
            <MDBox sx={{ px: 2, py: 1.5 }}>
              <MDTypography variant="h6" fontWeight="bold">
                Notifications
              </MDTypography>
            </MDBox>
            <Divider />
            <List sx={{ maxHeight: 300, overflow: "auto" }}>
              {notifications.map((notification) => (
                <div key={notification.id}>
                  <ListItem
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderLeft: `4px solid ${getNotificationColor(
                        notification.status
                      )}`,
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <Icon
                      sx={{
                        mr: 1.5,
                        color: getNotificationColor(notification.status),
                        fontSize: "1.5rem",
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Icon>
                    <ListItemText
                      primary={
                        <MDTypography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {notification.message}
                        </MDTypography>
                      }
                      secondary={formatTime(notification.timestamp)}
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleRemoveNotification(notification.id)
                      }
                      sx={{ ml: 1 }}
                    >
                      <Icon sx={{ fontSize: "1rem" }}>close</Icon>
                    </IconButton>
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
            {notifications.length > 0 && (
              <>
                <Divider />
                <MDBox sx={{ p: 1, textAlign: "center" }}>
                  <MDButton
                    variant="text"
                    size="small"
                    onClick={clearNotifications}
                  >
                    Clear All
                  </MDButton>
                </MDBox>
              </>
            )}
          </>
        )}
      </Menu>
    </>
  );
}

export default NotificationCenter;

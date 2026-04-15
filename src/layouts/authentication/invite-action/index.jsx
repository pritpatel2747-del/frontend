/**
 * Invite Action Page
 * Handles invitation verification, acceptance, and rejection with a countdown timer
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Container,
  Typography,
} from "@mui/material";
import MDBox from "components/MDBox";
import "./index.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function InviteAction() {
  const { token } = useParams();
  const navigate = useNavigate();

  // State for invitation data
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for countdown timer
  const [remainingTime, setRemainingTime] = useState(900); // 15 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);

  // State for API operations
  const [isProcessing, setIsProcessing] = useState(false);

  // State for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // State for confirmation dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setError("No invitation token provided. Please check your invitation link.");
      setLoading(false);
      return;
    }

    verifyToken();
  }, [token]);

  // Countdown timer effect
  useEffect(() => {
    if (isExpired || !invitation) return;

    if (remainingTime <= 0) {
      setIsExpired(true);
      showSnackbar("Invitation has expired", "error");
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime, invitation, isExpired]);

  // Format time as MM:SS
  // const formatTime = (seconds) => {
  //   const minutes = Math.floor(seconds / 60);
  //   const secs = seconds % 60;
  //   return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  // };

  // Verify invitation token
  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify/${token}`);
      const data = await response.json();
       console.log("Verification response : "+JSON.stringify(data));
      if (!response.ok) {
        setError(data.error || "Invalid or expired invitation link");
        setIsExpired(true);
        setLoading(false);
        return;
      }

      setInvitation(data);
      setLoading(false);
    } catch (err) {
      console.error("Error verifying invitation:", err);
      setError("Error verifying invitation. Please try again later.");
      setLoading(false);
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Handle accept button click
  const handleAccept = () => {
    setDialogAction("accept");
    setDialogOpen(true);
  };

  // Handle reject button click
  const handleReject = () => {
    setDialogAction("reject");
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogAction(null);
  };

  // Handle dialog confirm
  const handleDialogConfirm = async () => {
    handleDialogClose();
    await respondToInvite(dialogAction);
  };

  // Respond to invitation (accept or reject)
  const respondToInvite = async (action) => {
    setIsProcessing(true);
  
    try {
      const response = await fetch(`${API_BASE_URL}/respond-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({
          token,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showSnackbar(data.error || `Failed to ${action} invitation`, "error");
        setIsProcessing(false);
        return;
      }

      if (action === "accept") {
        showSnackbar("Invitation accepted! Redirecting to dashboard...", "success");
        // Store auth info if needed (backend should handle login after accepting)
        setTimeout(() => {
          navigate("/authentication/sign-in", { state: { message: "Invitation accepted! Please sign in." } });
        }, 1500);
      } else {
        showSnackbar("Invitation rejected.", "info");
        setTimeout(() => {
          navigate("/authentication/sign-in");
        }, 1500);
      }
    } catch (err) {
      console.error(`Error ${action}ing invitation:`, err);
      showSnackbar(`Error ${action}ing invitation. Please try again.`, "error");
      setIsProcessing(false);
    }
  };
 
  // Render loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error || isExpired) {
    return (
      <Container maxWidth="sm">
        <MDBox className="expire-action" sx={{ py: 10 }}>
          <Card className="expire-card" sx={{ p: 3, textAlign: "center" }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || "Invitation has expired"}
            </Alert>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {isExpired
                ? "This invitation link has expired. Please contact the administrator for a new one."
                : error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/authentication/sign-in")}
              className="go-to-signin"
            >
              Go to Sign In
            </Button>
          </Card>
        </MDBox>
      </Container>
    );
  }

  // Render main invitation acceptance page
  return (
    <Container className="invitation-container" maxWidth="sm">
      <MDBox className="invite-action" sx={{ py: 10 }}>
        <Card  className="invitation-card" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: "bold" }}>
            Invitation Received
          </Typography>

          <MDBox sx={{ mb: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Name:</strong> {invitation?.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Email:</strong> {invitation?.email}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Role:</strong>{" "}
              {invitation?.role
                ? invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)
                : "User"}
            </Typography>
          </MDBox>

          {/* Countdown Timer */}
          {/* <MDBox sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main" }}>
              {formatTime(remainingTime)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Time remaining to accept
            </Typography>
          </MDBox> */}

          {/* Action Buttons */}
          <MDBox sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleAccept}
              disabled={isExpired || isProcessing}
              className="accept"
            >
              {isProcessing && dialogAction === "accept" ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Accepting...
                </>
              ) : (
                "Accept"
              )}
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="large"
              onClick={handleReject}
              disabled={isExpired || isProcessing}
              className="reject"
            >
              {isProcessing && dialogAction === "reject" ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Rejecting...
                </>
              ) : (
                "Reject"
              )}
            </Button>
          </MDBox>

          {isExpired && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              This invitation has expired. Please contact the administrator for a new one.
            </Alert>
          )}
        </Card>
      </MDBox>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} className="confirmation-dialogue">
        <DialogTitle>
          {dialogAction === "accept" ? "Accept Invitation?" : "Reject Invitation?"}
        </DialogTitle>
        <DialogContent>
          {dialogAction === "accept"
            ? "Are you sure you want to accept this invitation? You will be able to log in after accepting."
            : "Are you sure you want to reject this invitation? This action cannot be undone."}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary" className="cancel-invitation-respond">
            Cancel
          </Button>
          <Button
            onClick={handleDialogConfirm}
            color={dialogAction === "accept" ? "success" : "error"}
            variant="contained"
            autoFocus
            className="confirm"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default InviteAction;

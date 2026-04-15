/**
 * Invite Verification Page
 * Displays invitation response page with timer
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
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Alert,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

function InviteVerify() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUserFormDialog, setShowUserFormDialog] = useState(false);
  const [success, setSuccess] = useState(null);
  const [userForm, setUserForm] = useState({
    
    name: "",
    role: "user",
  });

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setError("No token provided. Please check your invitation link.");
      setLoading(false);
      return;
    }

    verifyToken();
  }, [token]);

  // Verify invitation token
  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid or expired invitation link");
        setIsExpired(true);
        setLoading(false);
        return;
      }

      setInvitation(data);
      // Calculate remaining time based on expiration
      const expiressAt = new Date(data.expiresAt);
      const now = new Date();
      const remainingSeconds = Math.max(0, Math.floor((expiressAt - now) / 1000));
      setRemainingTime(remainingSeconds);
      setLoading(false);
    } catch (err) {
      setError("Error verifying invitation: " + err.message);
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (remainingTime <= 0 && invitation) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime, invitation]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle accept
  const handleAccept = () => {
    setShowUserFormDialog(true);
  };

  // Handle user form change
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit accept
  const handleSubmitAccept = async () => {
    if (!userForm.name) {
      setError("Name is required");
      return;
    }

    setIsProcessing(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/respond-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          token,
          action: "accept",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error accepting invitation");
        setIsProcessing(false);
        return;
      }

      setSuccess("Invitation accepted successfully! Account created.");
      setShowUserFormDialog(false);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError("Error accepting invitation: " + err.message);
      setIsProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/respond-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          token,
          action: "reject",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error rejecting invitation");
        setIsProcessing(false);
        return;
      }

      setSuccess("Invitation rejected successfully.");

      setTimeout(() => {
        navigate("/authentication/sign-in");
      }, 2000);
    } catch (err) {
      setError("Error rejecting invitation: " + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f7fa",
        padding: 2,
      }}
    >
      <CssBaseline />
      <Grid container justifyContent="center" sx={{ maxWidth: 600 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
            <MDBox sx={{ textAlign: "center", mb: 3 }}>
              <MDTypography variant="h4" fontWeight="bold" mb={1}>
                Invitation Verification
              </MDTypography>
              <MDTypography variant="body2" color="textSecondary">
                Verify your invitation to join our platform
              </MDTypography>
            </MDBox>

            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {!loading && error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!loading && success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {!loading && invitation && !isExpired && (
              <MDBox>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <MDTypography variant="body2" fontWeight="medium">
                    Invitation for: <strong>{invitation.email}</strong>
                  </MDTypography>
                </Alert>

                <Box
                  sx={{
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffc107",
                    borderRadius: 1,
                    p: 2,
                    mb: 3,
                    textAlign: "center",
                  }}
                >
                  <MDTypography variant="h6" fontWeight="bold" sx={{ color: "#856404" }}>
                    ⏱️ {formatTime(remainingTime)}
                  </MDTypography>
                  <MDTypography variant="body2" sx={{ color: "#856404", mt: 0.5 }}>
                    Time remaining to accept/reject
                  </MDTypography>
                </Box>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleAccept}
                    disabled={isProcessing}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    Reject
                  </Button>
                </Box>
              </MDBox>
            )}

            {!loading && isExpired && (
              <MDBox>
                <Alert severity="error" sx={{ mb: 3 }}>
                  <MDTypography variant="body2" fontWeight="bold">
                    ❌ Link Expired
                  </MDTypography>
                  <MDTypography variant="body2" sx={{ mt: 1 }}>
                    The invitation link has expired. Please request a new invitation.
                  </MDTypography>
                </Alert>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/authentication/sign-in")}
                  >
                    Go to Sign In
                  </Button>
                </Box>
              </MDBox>
            )}

            {/* User Form Dialog */}
            <Dialog
              open={showUserFormDialog}
              onClose={() => setShowUserFormDialog(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Complete Your Profile</DialogTitle>
              <DialogContent sx={{ pt: 2 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={userForm.name}
                  onChange={handleUserFormChange}
                  margin="normal"
                  variant="outlined"
                  placeholder="Enter your full name"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={userForm.role}
                    onChange={handleUserFormChange}
                    label="Role"
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="viewer">Viewer</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowUserFormDialog(false)}>Cancel</Button>
                <Button
                  onClick={handleSubmitAccept}
                  variant="contained"
                  color="primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? <CircularProgress size={24} /> : "Accept & Create Account"}
                </Button>
              </DialogActions>
            </Dialog>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default InviteVerify;

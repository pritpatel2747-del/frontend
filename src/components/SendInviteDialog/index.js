import { useState } from "react";
import * as Yup from "yup";

// MUI components
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

// Notification context
import { useNotifications } from "context/NotificationContext";

// Validation schema
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  role: Yup.string().required("Role is required"),
});

function SendInviteDialog({ open, onClose, onInviteSent }) {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Validate form
      await validationSchema.validate(formData, { abortEarly: false });

      // Call invite endpoint
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Failed to send invitation";
        setErrorMessage(errorMsg);
        addNotification(errorMsg, "error", "error");
        return;
      }

      setSuccessMessage("Invitation sent successfully!");
      addNotification(`Invitation sent to ${formData.email}`, "invitation_sent", "success");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
      });

      // Close dialog after 2 seconds
      setTimeout(() => {
        onClose();
        if (onInviteSent) {
          onInviteSent();
        }
      }, 2000);
    } catch (error) {
      if (error.inner && error.inner.length > 0) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        const errorMsg = "An error occurred. Please try again.";
        setErrorMessage(errorMsg);
        addNotification(errorMsg, "error", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Send Invitation</DialogTitle>
      <DialogContent>
        <MDBox sx={{ mt: 2 }}>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Full Name"
                fullWidth
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.name && (
                <MDTypography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                  {errors.name}
                </MDTypography>
              )}
            </MDBox>

            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email Address"
                fullWidth
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.email && (
                <MDTypography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                  {errors.email}
                </MDTypography>
              )}
            </MDBox>

            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.password && (
                <MDTypography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                  {errors.password}
                </MDTypography>
              )}
            </MDBox>

            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Confirm Password"
                fullWidth
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <MDTypography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                  {errors.confirmPassword}
                </MDTypography>
              )}
            </MDBox>

            <MDBox mb={2}>
              <MDTypography variant="label" sx={{ display: "block", mb: 1 }}>
                Role
              </MDTypography>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontFamily: "inherit",
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
              {errors.role && (
                <MDTypography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                  {errors.role}
                </MDTypography>
              )}
            </MDBox>
          </Box>
        </MDBox>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <MDButton
          color="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </MDButton>
        <MDButton
          color="info"
          variant="gradient"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Sending..." : "Send Invitation"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default SendInviteDialog;

/**
 * Users List Component
 * Displays a table of users with delete and invite functionality
 * Integrates with Node.js/Express backend API
 */

import { useState, useEffect, use } from "react";
import * as Yup from "yup";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import CustomField from "components/CustomField";
import Icon from "@mui/material/Icon";
import "./UserList.css";
import { useNotifications } from "context/NotificationContext";


const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

function UserList() {
  // State for users list
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for form schema (metadata-driven from backend)
  const [formSchema, setFormSchema] = useState([]);
  const [schemaLoading, setSchemaLoading] = useState(false);

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // State for add/invite user dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({});
  const [isInviting, setIsInviting] = useState(false);

  // State for form validation
  const [formErrors, setFormErrors] = useState({});
  const { userData, setUserData } = useNotifications();
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch user schema from backend
  const fetchUserSchema = async () => {
    setSchemaLoading(true);
    try {
      console.log(`Fetching user schema from: ${API_BASE_URL}/user-schema`);
      const response = await fetch(`${API_BASE_URL}/user-schema`);

      if (!response.ok) {
        throw new Error(`Failed to fetch schema (${response.status})`);
      }

      const schema = await response.json();
      console.log("User schema fetched:", schema);
      setFormSchema(schema);

      // Initialize form state dynamically based on schema
      const initialForm = {};
      schema.forEach((field) => {
        initialForm[field.name] = "";
      });
      setInviteForm(initialForm);
    } catch (err) {
      console.error("Error fetching user schema:", err);
      showSnackbar(`Error fetching form schema: ${err.message}`, "error");
    } finally {
      setSchemaLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    fetchUserSchema();
  }, []);

  // Fetch all users from backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log(` Fetching users from: ${API_BASE_URL}/users`);
      const response = await fetch(`${API_BASE_URL}/users`);

      if (!response.ok) {
        throw new Error(`Failed to fetch users (${response.status})`);
      }

      const data = await response.json();
      console.log(" Users fetched:", data);

      // Handle both array and object with users property
      const usersList = Array.isArray(data) ? data : data.users || [];
      // userData(usersList);
      // console.log("User data from context:", userData);
      // setUsers(usersList);
      setUserData(usersList);

      if (!usersList || usersList.length === 0) {
        showSnackbar("No users found. Try adding some.", "info");
      }
    } catch (err) {
      console.error(" Error fetching users:", err);
      showSnackbar(` Error  fetching users: ${err.message}. Make sure backend is running.`, "error");
      setUsers([]);
    } finally {
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

  // Dynamically create validation schema based on formSchema
  const createValidationSchema = () => {
    const shape = {};
    formSchema.forEach((field) => {
      if (field.name === "confirmPassword") {
        shape[field.name] = Yup.string()
          .oneOf([Yup.ref("password"), null], "Passwords must match")
          .required("Please confirm your password");
      } else if (field.required) {
        if (field.name === "email") {
          shape[field.name] = Yup.string()
            .email("Please enter a valid email address")
            .required("Email is required");
        } else if (field.name === "password") {
          shape[field.name] = Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required");
        } else if (field.name === "name") {
          shape[field.name] = Yup.string()
            .min(2, "Name must be at least 2 characters")
            .required("Name is required");
        } else {
          shape[field.name] = Yup.string().required(`${field.label} is required`);
        }
      } else {
        shape[field.name] = Yup.string().optional();
      }
    });
    return Yup.object().shape(shape);
  };

  // Validate invite form using Yup
  const validateInviteForm = async () => {
    try {
      const validationSchema = createValidationSchema();
      await validationSchema.validate(inviteForm, { abortEarly: false });
      setFormErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      if (error.inner && error.inner.length > 0) {
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
      }
      setFormErrors(newErrors);
      return false;
    }
  };
  // Handle delete button click
  const handleDeleteClick = (user) => {
    console.log(`Delete button clicked for user:`, user);
    //  removeUserData(user.id);
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("auth_token");
      console.log(` Deleting user ID: ${selectedUser.id}`);
      const response = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        }, 
      });
      if (!response.ok) {
        throw new Error(`Failed to delete user (${response.status})`);
      }

      console.log(" User deleted successfully");
      showSnackbar(`User "${selectedUser.name}" deleted successfully`, "success");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      console.error(" Error deleting user:", err);
      showSnackbar(`Error deleting user: ${err.message}`, "error");
    }
  };

  // Handle close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  // Handle open invite dialog
  const handleOpenInviteDialog = () => {
    // Dynamically initialize form based on schema
    const initialForm = {};
    formSchema.forEach((field) => {
      initialForm[field.name] = field.type === "select" ? (field.options?.[0]?.value || "") : "";
    });
    setInviteForm(initialForm);
    setFormErrors({});
    setInviteDialogOpen(true);
  };

  // Handle close invite dialog
  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
    // Reset form
    const resetForm = {};
    formSchema.forEach((field) => {
      resetForm[field.name] = field.type === "select" ? (field.options?.[0]?.value || "") : "";
    });
    setInviteForm(resetForm);
    setFormErrors({});
  };

  // Handle invite form change
  const handleInviteFormChange = (e) => {
    const { name, value } = e.target;
    setInviteForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts editing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle send invite
  const handleSendInvite = async () => {
    const isValid = await validateInviteForm();
    if (!isValid) {
      showSnackbar("Please fix the errors in the form", "error");
      return;
    }

    setIsInviting(true);
    try {
      console.log(`Sending invite to:`, inviteForm);

      // Filter out frontend-only fields (isServerField: false)
      const serverData = {};
      formSchema.forEach((field) => {
        if (field.isServerField && inviteForm[field.name] !== undefined) {
          serverData[field.name] = inviteForm[field.name] || null;
        }
      });

      console.log("Filtered server data:", serverData);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(serverData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invite");
      }

      console.log(" Invite sent successfully:", data);
      showSnackbar(
        `Invitation sent to ${inviteForm.email}. They have 15 minutes to accept.`,
        "success"
      );
      handleCloseInviteDialog();
      await fetchUsers();
    } catch (err) {
      console.error("Error sending invite:", err);
      showSnackbar(`Error sending invite: ${err.message}`, "error");
    } finally {
      setIsInviting(false);
    }
  };
  console.log("user data:", users);

  return (
    <MDBox>
      {/* Header with title and add button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <MDTypography variant="h6" fontWeight="medium">
          Users Management
        </MDTypography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Icon>person_add</Icon>}
          onClick={handleOpenInviteDialog}
          sx={{ backgroundColor: "aliceblue", "&:hover": { backgroundColor: "aliceblue" } }}
          className="send-invite"
        >
          Send Invite
        </Button>
      </Box>

      {/* Users table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                  className="table-head"
                >
                  <TableCell sx={{ fontWeight: "bold", width: "8%" }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "20%" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "25%" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "17%", textAlign: "center" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <MDTypography variant="body2" color="textSecondary">
                        No users found. Click &quot;Send Invite&quot; to add one.
                      </MDTypography>
                    </TableCell>
                  </TableRow>
                ) : (

                  userData.map((user) => (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{ display: "flex" }}
                    >
                      <TableCell sx={{ width: "8%" }}>{user.id}</TableCell>
                      <TableCell sx={{ width: "20%" }}>{user.name}</TableCell>
                      <TableCell sx={{ width: "25%" }}>{user.email}</TableCell>
                      <TableCell sx={{ width: "15%" }}>
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "4px",
                            backgroundColor:
                              user.role === "admin"
                                ? "#ffebee"
                                : user.role === "user"
                                  ? "#e3f2fd"
                                  : "#f3e5f5",
                            color:
                              user.role === "admin"
                                ? "#c62828"
                                : user.role === "user"
                                  ? "#1565c0"
                                  : "#6a1b9a",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ width: "15%" }}>
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "4px",
                            backgroundColor:
                              user.status === "success"
                                ? "#e8f5e9"
                                : user.status === "pending"
                                  ? "#fff3e0"
                                  : "#ffebee",
                            color:
                              user.status === "success"
                                ? "#2e7d32"
                                : user.status === "pending"
                                  ? "#e65100"
                                  : "#c62828",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ width: "17%", textAlign: "center" }}>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(user)}
                          title="Delete user"
                        >
                          <Icon fontSize="small">delete</Icon>
                        </IconButton>
                    
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{selectedUser?.name}</strong> (
            {selectedUser?.email})? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary" className="cancel-dialogue">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
            className="delete-dialogue"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Invite Dialog */}
      <Dialog open={inviteDialogOpen} onClose={handleCloseInviteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Send Invitation</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <MDTypography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Send an invitation to a new user. They will have 15 minutes to accept.
          </MDTypography>

          {schemaLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Render fields dynamically from schema */}
              {formSchema.map((field, index) => {
                // Render section header for "additional" section (first field only)
                const isFirstAdditionalField =
                  field.section === "additional" &&
                  (index === 0 || formSchema[index - 1]?.section !== "additional");

                return (
                  <div key={field.name}>
                    {isFirstAdditionalField && (
                      <MDTypography variant="h6" sx={{ mt: 3, mb: 2 }} fontWeight="medium">
                        Additional Information
                      </MDTypography>
                    )}
                    <CustomField
                      field={field}
                      value={inviteForm[field.name] || ""}
                      onChange={handleInviteFormChange}
                      error={formErrors[field.name]}
                      disabled={isInviting}
                    />
                  </div>
                );
              })}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseInviteDialog}
            color="primary"
            disabled={isInviting}
            className="cancel-invitation-dialogue"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendInvite}
            color="primary"
            variant="contained"
            disabled={isInviting}
            startIcon={isInviting ? <CircularProgress size={20} /> : <Icon>send</Icon>}
            className="send-invite-action"
            sx={{ backgroundColor: "aliceblue", "&:hover": { backgroundColor: "aliceblue" } }}
          >
            {isInviting ? "Sending..." : "Send Invite"}
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
    </MDBox>
  );
}

export default UserList;

/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import CustomField from "components/CustomField";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Push Notification Service
import { initializePushNotifications } from "services/pushNotificationService";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
if ("Notification" in window) { Notification.requestPermission(); }

function SignIn() {
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [formSchema, setFormSchema] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSetRememberMe = () => setRememberMe(!rememberMe);
  
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        console.log(`Fetching sign-in schema from: ${API_BASE_URL}/user-schema?type=signin`);
        const response = await fetch(`${API_BASE_URL}/user-schema?type=signin`);

        if (!response.ok) {
          throw new Error(`Failed to fetch schema (${response.status})`);
        }

        const schema = await response.json();
        console.log("Sign-in schema fetched:", schema);
        setFormSchema(schema);

        // Initialize form state dynamically
        const initialForm = {};
        schema.forEach((field) => {
          initialForm[field.name] = "";
        });
        setFormData(initialForm);
      } catch (err) {
        console.error("Error fetching sign-in schema:", err);
        setErrorMessage(`Error loading form: ${err.message}`);
      } finally {
        setSchemaLoading(false);
      }
    };

    fetchSchema();
  }, []);

  // Create validation schema dynamically
  const createValidationSchema = () => {
    const shape = {};
    formSchema.forEach((field) => {
      if (field.required) {
        if (field.name === "email") {
          shape[field.name] = Yup.string()
            .email("Please enter a valid email address")
            .required("Email is required");
        } else if (field.name === "password") {
          shape[field.name] = Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required");
        } else {
          shape[field.name] = Yup.string().required(`${field.label} is required`);
        }
      } else {
        shape[field.name] = Yup.string().optional();
      }
    });
    return Yup.object().shape(shape);
  };

  // Handle field change
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Validate form
      const validationSchema = createValidationSchema();
      await validationSchema.validate(formData, { abortEarly: false });

      // Call login endpoint
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Login failed");
        return;
      }

      // ✅ Store JWT token with correct key name: auth_token (for ProtectedRoute)
      console.log("✅ Login successful! Storing token...");
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_id", data.user.id);
      localStorage.setItem("user_data", JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      // ✅ Initialize push notifications for user
      console.log("📱 Initializing push notifications...");
      try {
        const pushInitialized = await initializePushNotifications(data.token);
        if (pushInitialized) {
          console.log("✅ Push notifications initialized successfully");
        } else {
          console.warn("⚠️ Push notifications not available on this browser");
        }
      } catch (pushError) {
        console.warn("⚠️ Could not initialize push notifications:", pushError);
        // Don't block login if push notifications fail
      }

      console.log("✅ Token stored. Redirecting to dashboard...");
      setSuccessMessage("Login successful! Redirecting...");

      // Redirect to dashboard immediately
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.inner && error.inner.length > 0) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GitHubIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GoogleIcon color="inherit" />
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {successMessage && (
            <Alert severity="success" sx={{ marginBottom: "4%" }}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && <Alert severity="error" sx={{ marginBottom: "4%" }}>{errorMessage}</Alert>}

          {schemaLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <MDBox component="form" role="form" onSubmit={handleSubmit}>
              {/* Render fields dynamically from schema */}
              {formSchema.map((field) => (
                <MDBox key={field.name} mb={2}>
                  <CustomField
                    field={field}
                    value={formData[field.name] || ""}
                    onChange={handleFieldChange}
                    error={errors[field.name]}
                    disabled={loading}
                  />
                </MDBox>
              ))}

              <MDBox display="flex" alignItems="center" ml={-1}>
                <Switch checked={rememberMe} onChange={handleSetRememberMe} />
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color="text"
                  onClick={handleSetRememberMe}
                  sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                >
                  &nbsp;&nbsp;Remember me
                </MDTypography>
              </MDBox>
              <MDBox mt={4} mb={1}>
                <MDButton variant="gradient" color="info" fullWidth type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "sign in"}
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text">
                  Don&apos;t have an account?{" "}
                  <MDTypography
                    component={Link}
                    to="/authentication/sign-up"
                    variant="button"
                    color="info"
                    fontWeight="medium"
                    textGradient
                  >
                    Sign up
                  </MDTypography>
                </MDTypography>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default SignIn;

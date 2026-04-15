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

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import CustomField from "components/CustomField";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

// Yup validation
import * as Yup from "yup";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

function Cover() {
  const navigate = useNavigate();

  // State
  const [formSchema, setFormSchema] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        console.log(`Fetching sign-up schema from: ${API_BASE_URL}/user-schema?type=signup`);
        const response = await fetch(`${API_BASE_URL}/user-schema?type=signup`);

        if (!response.ok) {
          throw new Error(`Failed to fetch schema (${response.status})`);
        }

        const schema = await response.json();
        console.log("Sign-up schema fetched:", schema);
        setFormSchema(schema);

        // Initialize form state dynamically
        const initialForm = {};
        schema.forEach((field) => {
          if (field.type === "checkbox") {
            initialForm[field.name] = false;
          } else {
            initialForm[field.name] = "";
          }
        });
        setFormData(initialForm);
      } catch (err) {
        console.error("Error fetching sign-up schema:", err);
        setError(`Error loading form: ${err.message}`);
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
      if (field.name === "confirmPassword") {
        shape[field.name] = Yup.string()
          .oneOf([Yup.ref("password"), null], "Passwords must match")
          .required("Please confirm your password");
      } else if (field.name === "agreeTerms") {
        shape[field.name] = Yup.boolean()
          .oneOf([true], "You must agree to the Terms and Conditions")
          .required("You must agree to the Terms and Conditions");
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

  // Handle field change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setErrors({});

    try {
      // Validate form
      const validationSchema = createValidationSchema();
      await validationSchema.validate(formData, { abortEarly: false });

      setLoading(true);

      // Filter out frontend-only fields before sending to backend
      const serverData = {};
      formSchema.forEach((field) => {
        if (field.isServerField && formData[field.name] !== undefined) {
          serverData[field.name] = formData[field.name];
        }
      });

      console.log("Filtered server data:", serverData);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(serverData),
      });
      localStorage.setItem("token", response.token);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      setSuccess("Signup successful! Check your email to verify your account.");

      // Clear form
      const resetForm = {};
      formSchema.forEach((field) => {
        if (field.type === "checkbox") {
          resetForm[field.name] = false;
        } else {
          resetForm[field.name] = "";
        }
      });
      setFormData(resetForm);

      // Redirect to sign-in after 2 seconds
      setTimeout(() => {
        navigate("/authentication/sign-in");
      }, 2000);
    } catch (err) {
      if (err.inner && err.inner.length > 0) {
        const newErrors = {};
        err.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      } else {
        setError(err.message || "An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {schemaLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <MDBox component="form" role="form" onSubmit={handleSignup}>
              {/* Render fields dynamically from schema */}
              {formSchema.map((field) => (
                <MDBox key={field.name} mb={2}>
                  <CustomField
                    field={field}
                    value={formData[field.name] || false}
                    onChange={handleInputChange}
                    error={errors[field.name]}
                    disabled={loading}
                  />
                </MDBox>
              ))}

              <MDBox mt={4} mb={1}>
                <MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                      Signing up...
                    </>
                  ) : (
                    "Sign up"
                  )}
                </MDButton>
              </MDBox>

              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text">
                  Already have an account?{" "}
                  <MDTypography
                    component={Link}
                    to="/authentication/sign-in"
                    variant="button"
                    color="info"
                    fontWeight="medium"
                    textGradient
                  >
                    Sign In
                  </MDTypography>
                </MDTypography>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;

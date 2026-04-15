import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import * as Yup from "yup";
import CustomField from "components/CustomField";
import MDTypography from "components/MDTypography";
import MDBox from 'components/MDBox';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const WorkInfoModal = ({ open, handleClose, handleSave, userId, existingData }) => {
  // State for form schema
  const [formSchema, setFormSchema] = useState([]);
  // State for form fields
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({});
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
  const [loginId, setLoginId] = useState();
 


  //Fetch schema from backend on component mount
  useEffect(() => {
    additionalInfo();
    profileData();
    updateTheData();
  }, [open]);

  // profile id get using api  
  const profileData = async () => {
    // const token = localStorage.getItem("authToken");
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.log("token is not found");
    }
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("response for profile data : " + JSON.stringify(data));
    setLoginId(data.user.id);
  }

  const additionalInfo = async () => {
    try {
      console.log(`Fetching sign-in schema from: ${API_BASE_URL}/user-schema?type=additional`);
      const response = await fetch(`${API_BASE_URL}/user-schema?type=additional`);
      const schema = await response.json();
      setFormSchema(schema);
    } catch (err) {
      console.log("error for fetching the additionalInfo : " + err);
    }
  }
  const handleFieldChange = async (e) => {
    const { name, value } = e.target;
    console.log("name of field : " + name);
    console.log("value of the field :" + value);
    formSchema.map((field) => {
      if (field.name === name) {
        if (value === "") {
          setError(`${name} is required`)
        } else {
          setError("");
        }
      }
    })

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  const updateTheData = async () => {
    if (loginId > 0) {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${API_BASE_URL}/data-upload/${loginId}`, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData)
        })
        const data = await response.json();
        console.log("response for updating the data : " + JSON.stringify(data.message));
      } catch (err) {
        console.log("error for updating the data : " + err)
      }
    }
  }

  const saveData = async () => {
    formSchema.map((field) => {
      if (field.name === name) {
        if (value === "") {
          setError(`${name} is required`)
        } else {
          setError("");
        }
      }
    })
    setUserData(formData);
    handleClose();
  }
  const closeModel = async () => {
    handleClose();
  }
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Professional Information</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Please fill in your work details, or skip this step.
        </DialogContentText>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {formSchema.map((field) => (
          <MDBox key={field.name}>
            <CustomField
              field={field}
              onChange={handleFieldChange}
              value={formData[field.name] || ""}
              disabled={loading}
            />
          </MDBox>
        ))}

      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          color="inherit"
          sx={{ backgroundColor: "revert",'&:hover':{backgroundColor:"darkgray",color:"white !important"} }}
          onClick={closeModel}
        >
          Skip
        </Button>
        <Button
          variant="contained"
          color="primary" 
          sx={{ position: 'relative', backgroundColor: "#589af1 !important", color: "white !important" }}
          onClick={saveData}
        >
          <span>save user</span>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkInfoModal;

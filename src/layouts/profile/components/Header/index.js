import { useState, useEffect } from "react";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";

// axios for API calls
import axios from "axios";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React base styles
import breakpoints from "assets/theme/base/breakpoints";

// Images
import burceMars from "assets/images/bruce-mars.jpg";
import backgroundImage from "assets/images/bg-profile.jpeg";
import { height } from "@mui/system";
import { Button } from "@mui/material";
import AdditionalInfoDialog from "components/additionalinfoDialogue";
import { Await } from "react-router-dom";
import { useNotifications } from "context/NotificationContext";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
function Header({ children }) {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [headerData, setHeaderData] = useState(null);
  const [profileImage, setProfileImage] = useState(burceMars);
  const [uploading, setUploading] = useState(false);
  const backendUrl = "http://localhost:3001";

  
  const [showAdditionalInfoDialog, setShowAdditionalInfoDialog] = useState(false);
  const [userData, setUserData] = useState(null);
  const [hasMissingInfo, setHasMissingInfo] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const { updateInfo, setUpdateInfo } = useNotifications();
  console.log("update info in header : ", updateInfo);

  // Check if user has incomplete profile on mount
  useEffect(() => {
    checkUserProfile();
  }, []);


  const checkUserProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const id = localStorage.getItem("user_id");
      console.log("Checking user profile with token:", token);
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/check-incomplete-profile/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      }); 

      const data = await response.json();
      console.log("Profile check response:", data);
      console.log("user id : " + data.user.id);
      setDashboardData(data.user.id);
      if (data.isIncomplete) {
        setModelOpen(true);
      } else {
        setModelopen(false);
      }
      if (response.ok && data.isIncomplete) {
        setUserData(data.user);
        setHasMissingInfo(true);
        setShowAdditionalInfoDialog(true);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
    console.log("user data in dashboard : ", userData);
  };
  console.log("dashboard id : ", dashboardData);

  const uploadData = async () => {
    try {
      const userId = dashboardData;
      console.log(userId);
    } catch (err) {
      console.log("error in data upload : ", err);
    }
  }

  const handleAdditionalInfoSave = (updatedUser) => {
    setUpdateInfo(updatedUser);
    setShowAdditionalInfoDialog(false);
    fetchProfileData();
    setHasMissingInfo(false);
  };
  console.log("user data after save : ", userData);
  const handleCloseDialog = () => {
    setShowAdditionalInfoDialog(false);
  };

  useEffect(() => {
    fetchProfileData();
  }, []);
  const [addInfo, setAddInfo] = useState(false);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No token found, redirecting to login.");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUpdateInfo(data.user);
      setProfileImage(backendUrl + data.user.profile_image);

    } catch (err) {
      console.log("Error fetching profile data:", err);
    }
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setProfileImage(objectUrl);

    await uploadImage(file);
  };

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      const token = localStorage.getItem("auth_token");

      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await axios.post(`${API_BASE_URL}/upload-profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });
      console.log("Upload response:", response.data.imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileUpload = () => {
    const fileInput = document.getElementById("profile-image-input");
    if (fileInput) {
      fileInput.click();
    }
  };

  useEffect(() => {
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }
    window.addEventListener("resize", handleTabsOrientation);
    handleTabsOrientation();

    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);
  const modelOpenClose = async () => {
    console.log("model open flag : " + modelOpen);
    if (modelOpen) {
      setModelOpen(false);
    } else {
      setModelOpen(true);
    }
  }

  console.log("file image url : ", profileImage);
  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Box
              sx={{
                position: "relative",
                display: "inline-block",
              }}
            >
              <MDAvatar sx={{ backgroundColor: "black !important", objectFit: "cover" }} src={profileImage} alt="profile-image" size="xl" shadow="sm" />

              {/* Upload overlay button */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: "-4px",
                  right: "-2px",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#f6f6f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#f6f6f6",
                    transform: "scale(1.1)",
                  },
                  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                }}
                onClick={triggerFileUpload}
              >
                {uploading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  <AddIcon sx={{ color: "white", fontSize: "24px" }} />
                )}
              </Box>

              {/* Hidden file input */}
              <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </Box>
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {updateInfo?.name || "User Name"}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                {updateInfo?.work_title || "Work Title"}  ({updateInfo?.company || "Company Name"})
              </MDTypography>
            </MDBox>
          </Grid>


          {/* <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>
            {/* <AppBar position="static">
              <Tabs orientation={tabsOrientation} value={tabValue} onChange={handleSetTabValue}>
                <Tab
                  label="App"
                  icon={
                    <Icon fontSize="small" sx={{ mt: -0.25 }}>
                      home
                    </Icon>
                  }
                />
                <Tab
                  label="Message"
                  icon={
                    <Icon fontSize="small" sx={{ mt: -0.25 }}>
                      email
                    </Icon>
                  }
                />
                <Tab
                  label="Settings"
                  icon={
                    <Icon fontSize="small" sx={{ mt: -0.25 }}>
                      settings
                    </Icon>
                  }
                />
              </Tabs>
            </AppBar> */}
        </Grid>

        {modelOpen && <AdditionalInfoDialog
          open={showAdditionalInfoDialog}
          handleClose={handleCloseDialog}
          handleSave={handleAdditionalInfoSave} 
          userId={dashboardData}
          existingData={userData}
        />}

        {children}
      </Card>
    </MDBox>
  );
}

// Setting default props for the Header
Header.defaultProps = {
  children: "",
};

// Typechecking props for the Header
Header.propTypes = {
  children: PropTypes.node,
};

export default Header;

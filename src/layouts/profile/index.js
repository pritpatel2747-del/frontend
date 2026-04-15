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

// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import ProfilesList from "examples/Lists/ProfilesList";
import DefaultProjectCard from "examples/Cards/ProjectCards/DefaultProjectCard";

// Overview page components
import Header from "layouts/profile/components/Header";
import PlatformSettings from "layouts/profile/components/PlatformSettings";

// Data
import profilesListData from "layouts/profile/data/profilesListData";

// Images
import homeDecor1 from "assets/images/home-decor-1.jpg";
import homeDecor2 from "assets/images/home-decor-2.jpg";
import homeDecor3 from "assets/images/home-decor-3.jpg";
import homeDecor4 from "assets/images/home-decor-4.jpeg";
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";
import "./index.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
import { useNotifications } from "context/NotificationContext";

function Overview() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {updateInfo} = useNotifications();

  // Fetch profile data on component mount and when token changes
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("No authentication token found. Please sign in.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          setError("Session expired. Please sign in again.");
        } else {
          throw new Error("Failed to fetch profile data");
        }
        return;
      }

      const data = await response.json();
      setProfileData(data.user);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <Alert severity="error">{error}</Alert>
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={1}>
            <div style={{display:"flex",flexDirection:"column",width:"100%"}}>
              <MDBox pt={2} px={2} lineHeight={1.25}>
                <MDTypography variant="h6" fontWeight="medium">
                  Additional Profile Information
                </MDTypography>
              </MDBox>
              <MDBox p={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <MDBox p={2} bgColor="light" borderRadius="lg">
                      <MDTypography variant="button" fontWeight="medium">
                        Email
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {updateInfo?.email}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <MDBox p={2} bgColor="light" borderRadius="lg">
                      <MDTypography variant="button" fontWeight="medium">
                        Role
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {updateInfo?.role}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <MDBox p={2} bgColor="light" borderRadius="lg">
                      <MDTypography variant="button" fontWeight="medium">
                        Phone
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {updateInfo?.phone_number || "Not provided"}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <MDBox p={2} bgColor="light" borderRadius="lg">
                      <MDTypography variant="button" fontWeight="medium">
                        Address
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {updateInfo?.address || "Not provided"}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <MDBox p={2} bgColor="light" borderRadius="lg">
                      <MDTypography variant="button" fontWeight="medium">
                        Work Title
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {updateInfo?.work_title || "Not provided"}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <MDBox p={2} bgColor="light" borderRadius="lg">
                      <MDTypography variant="button" fontWeight="medium">
                        Company
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {updateInfo?.company || "Not provided"}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12}>
                    <MDBox p={2} bgColor="light" borderRadius="lg">
                      <MDTypography variant="button" fontWeight="medium">
                        Work Place
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {updateInfo?.work_place || "Not provided"}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>
            </div>
            <div  style={{display:"flex",justifyContent:"space-around",width:"100%",paddingLeft:"1%",paddingRight:"1%"}}>
            <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" ,width:"100%"}}>
            
              <ProfileInfoCard
                title="profile information"
                description={updateInfo?.email || "No description available"}
                info={{
                  fullName: updateInfo?.name || "N/A",
                  mobile: updateInfo?.phone_number || "Not provided",
                  email: updateInfo?.email || "N/A",
                  location: updateInfo?.address || "Not provided",
                }}
                social={[
                  {
                    link: "https://www.facebook.com/CreativeTim/",
                    icon: <FacebookIcon />,
                    color: "facebook",
                  },
                  {
                    link: "https://twitter.com/creativetim",
                    icon: <TwitterIcon />,
                    color: "twitter",
                  },
                  {
                    link: "https://www.instagram.com/creativetimofficial/",
                    icon: <InstagramIcon />,
                    color: "instagram",
                  },
                ]}
                action={{ route: "", tooltip: "Edit Profile" }}
                shadow={false}
              />
              <Divider orientation="vertical" sx={{ mx: 0 }} />
            </Grid>
            <Grid item xs={12} xl={4}>
              <ProfilesList title="conversations" profiles={profilesListData} shadow={false} />
            </Grid>
            </div>
          </Grid>
        </MDBox>

      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;


import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import io from "socket.io-client";


// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 React routes
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Notification Context and Components
import { NotificationProvider } from "context/NotificationContext";
import NotificationToast from "components/NotificationToast";

// Invite Action component (for handling invite verification and acceptance)
import InviteAction from "layouts/authentication/invite-action";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import ProtectedRoute from "components/ProtectedRoute";
import "../src/components/css/style.css";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);
  

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);

    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  /**
   * ✅ Socket.IO Listener: Real-time force logout when admin deletes user
   * Listen for force_logout event emitted when this user's account is deleted
   */
  // useEffect(() => {
  //   const token = localStorage.getItem("auth_token");
  //   const userId = localStorage.getItem("user_id");

  //   // Only connect if user has valid credentials
  //   if (!token || !userId) {
  //     console.log("📍 Socket.IO: No auth credentials found. Skipping connection.");
  //     return;
  //   }

  //   console.log(`📍 Socket.IO: Connecting for user ${userId}...`);

  //   // Connect to Socket.IO server
  //   const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:3001", {
  //     auth: {
  //       token: token
  //     },
  //     reconnection: true,
  //     reconnectionDelay: 1000,
  //     reconnectionDelayMax: 5000,
  //     reconnectionAttempts: 5
  //   });

  //   // ✅ Connection successful
  //   socket.on("connect", () => {
  //     console.log(`✅ Socket.IO connected: ${socket.id} for user ${userId}`);
  //   });

  //   // ✅ Listen for force_logout event (user account was deleted)
  //   socket.on("force_logout", (data) => {
  //     console.log("🔴 FORCE_LOGOUT event received!");
  //     console.log("📦 Event data:", data);

  //     // Extract message with fallback
  //     const message = data?.message || "Your account has been deleted by an administrator";

  //     // ✅ Clear all auth data
  //     console.log("🧹 Clearing localStorage...");
  //     localStorage.clear();

  //     // ✅ Verify cleared
  //     console.log("✅ Auth data cleared - localStorage length:", localStorage.length);

  //     // ✅ Show notification
  //     alert(message);

  //     // ✅ Redirect to sign-in
  //     console.log("📍 Redirecting to sign-in page...");
  //     window.location.href = "/authentication/sign-in";
  //   });

  //   // Listen for disconnect
  //   socket.on("disconnect", () => {
  //     console.log("❌ Socket.IO disconnected");
  //   });

  //   // Listen for errors
  //   socket.on("error", (error) => {
  //     console.error("❌ Socket.IO error:", error);
  //   });

  //   socket.on("connect_error", (error) => {
  //     console.error("❌ Socket.IO connection error:", error);
  //   });

  //   // ✅ Cleanup on unmount
  //   return () => {
  //     console.log("🧹 Cleaning up Socket.IO connection...");
  //     socket.disconnect();
  //   };
  // }, []); // Run once on mount

  // /**
  //  * ✅ Multi-Tab Logout Sync: Detect storage changes from other tabs
  //  * If user logs out in one tab, logout in all other tabs
  //  */
  // useEffect(() => {
  //   const handleStorageChange = (event) => {
  //     if (event.key === "auth_token" && !event.newValue) {
  //       console.log("🔴 Auth token was removed in another tab. Redirecting...");
  //       window.location.href = "/authentication/sign-in";
  //     }
  //   };

  //   window.addEventListener("storage", handleStorageChange);

  //   return () => {
  //     window.removeEventListener("storage", handleStorageChange);
  //   };
  // }, []);

  // /**
  //  * ✅ Global Auth Check
  //  * Redirects to sign-in if auth_token is missing when accessing protected routes
  //  */
  // useEffect(() => {
  //   const token = localStorage.getItem("auth_token");
  //   const isPublicPage = pathname.includes("/authentication/sign-in")
  //     || pathname.includes("/authentication/sign-up")
  //     || pathname.includes("/verify/");

  //   // If no token and on protected page, redirect immediately
  //   if (!token && !isPublicPage) {
  //     console.log("🔴 Global auth check: No auth_token found. Redirecting to sign-in");
  //     window.location.href = "/authentication/sign-in";
  //   }
  // }, [pathname]);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }
      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }
      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return direction === "rtl" ? (
    <NotificationProvider>
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
          <CssBaseline />
          <NotificationToast />
          {layout === "dashboard" && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                brandName="Material Dashboard 2"
                routes={routes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              <Configurator />
              {configsButton}
            </>
          )}
          {layout === "vr" && <Configurator />}
          <Routes>
            <Route path="/verify/:token" element={<InviteAction />} />
            {getRoutes(routes)}
            <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
          </Routes>
        </ThemeProvider>
      </CacheProvider>
    </NotificationProvider>
  ) : (
    <NotificationProvider>
      <ThemeProvider theme={darkMode ? themeDark : theme}>
        <CssBaseline />
        <NotificationToast />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="Material Dashboard 2"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          <Route path="/verify/:token" element={<InviteAction />} />
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
        </Routes>
      </ThemeProvider>
    </NotificationProvider>
  );
}

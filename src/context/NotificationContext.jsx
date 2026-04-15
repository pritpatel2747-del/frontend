import { Name } from "ajv";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { json } from "react-router-dom";
import { io } from "socket.io-client";

const NotificationContext = createContext();


export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [currentToast, setCurrentToast] = useState(null);
  const [socket, setSocket] = useState(null);
  const [userData, setUserData] = useState([]);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [notifyList, setNotifyList] = useState([]);


  const fetchStoredNotifications = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
      const response = await fetch(`${API_BASE_URL}/notifications?limit=50`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Stored notifications fetched:", data.notifications);
        if (data.notifications && Array.isArray(data.notifications)) {
          const formattedNotifications = data.notifications.map((n) => ({
            id: n.id,
            type: n.type,
            message: n.message,
            timestamp: n.createdAt || n.timestamp,
            status: "success"
          }));
          setNotifications(formattedNotifications);
          console.log("✅ Loaded stored notifications:", formattedNotifications.length);
        }
      }
    } catch (error) {
      console.error("Error fetching stored notifications:", error);
    }
  };

  useEffect(() => {
    fetchStoredNotifications();

    // window notification permission request
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
    const socketUrl = API_BASE_URL.replace("/api", "");
    console.log("Connecting to:", socketUrl);
    const existingToken = localStorage.getItem("authToken") || localStorage.getItem("auth_token");

    if (!existingToken) {
      console.error(" No authentication token found in localStorage");
        console.warn("[DEBUG] Available keys:", Object.keys(localStorage).filter(k => k.includes("token") || k.includes("auth")));
      return; 
    }

    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      auth: {
        token: existingToken
      }
    });

    newSocket.on("connect_error", (err) => {
      console.error(" Connection error:", err.message);
    });

    newSocket.on("auth_failed", (data) => {
      console.error(" Authentication failed:", data.error);
    });

    newSocket.on("session_created", ({ token }) => {
      console.log("Received session_created with token:", token);
      localStorage.setItem("my_socket_token", token);
    })
    newSocket.on("user_removed", (data) => {
      console.log("user_removed data : " + data)
    })
    newSocket.on("connect", () => {
      console.log(" Connected successfully - ID:", newSocket.id);
      console.log(" Ready to receive notifications");
    });
    newSocket.on("disconnect", () => {
      console.log(" Disconnected - will reconnect...");
    });

    newSocket.on("user-list", (data) => {
      setUserData(data);
    })

    newSocket.on("update-user-info", (data) => {
      setUpdateInfo(data.updatedInfo[0]);
    })

    newSocket.on("toast", (data) => {
      console.log(" Toast received:", data.message);
      const notification = {
        id: data.id || Date.now(),
        type: data.type,
        message: data.message,
        timestamp: data.timestamp,
        status: data.status,
      };
      showNotification(data.type, data.message);
      setCurrentToast(notification);
    });
    newSocket.on("log_out", (data) => {
      console.log("log out successfully ..")
      console.log(data);
    })
    newSocket.on("user_removed", (data) => {
      console.log("User removed:", data.id);
    });
    newSocket.on("deleted_user", (data) => {
      showNotification("Account Deleted", data.message);
      console.log("Deleted user notification received:", data);
      localStorage.clear();
      window.location.href = "/authentication/sign-in";
    }); 
    
    newSocket.on("notification", (data) => {
      console.log(" Notification received:", data.message);
      const notification = {
        id: data.id || Date.now(),
        type: data.type,
        message: data.message,
        timestamp: data.timestamp,
        status: data.status,
      };

      setNotifications((prev) => { 
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) {
          console.log(" Duplicate notification skipped");
          return prev;
        }
      
        console.log(` Notification added. Total: ${prev.length + 1}`);
        return [notification, ...prev];
      });
    });

    newSocket.on("user_joined", (data) => {
      console.log("User joined:", data);
      newSocket.emit("join_room", { roomId: data.id });
    });
          
    newSocket.on("connectionReady", (status) => {
      console.log("Connection ready status:", status);
      if (status.status === "connected") {
        console.log("Successfully joined room for user:", joinedUser);
      } else {
        console.error("Failed to join room:", status);
      }
    });

    newSocket.on("error", (error) => {
      console.error(" Socket error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);


  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }; 

  const addNotification = useCallback(
    (message, type = "info", status = "info") => {
      const notification = {
        id: Date.now(),
        type,
        message,
        timestamp: new Date(),
        status,
      };

      setNotifications((prev) => [notification, ...prev]);
      setCurrentToast(notification);
    },
    []
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);
  
  const closeToast = useCallback(() => {
    setCurrentToast(null);
  }, []);

  const value = {
    notifications,
    currentToast,
    addNotification,
    clearNotifications,
    removeNotification,
    closeToast,
    socket,
    userData,
    setUserData,
    updateInfo,
    setUpdateInfo,
    fetchStoredNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

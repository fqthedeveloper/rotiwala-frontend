// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage
  const loadUser = () => {
    const access = localStorage.getItem("access");
    if (!access) {
      setUser(null);
      return false;
    }
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      parsedUser.role = localStorage.getItem("role") || parsedUser.role;
      setUser(parsedUser);
      return true;
    }
    return false;
  };

  useEffect(() => {
    loadUser();
    setLoading(false);

    // Listen for auth changes (from other tabs or login/logout)
    const authChanged = () => loadUser();
    window.addEventListener("authChanged", authChanged);
    return () => window.removeEventListener("authChanged", authChanged);
  }, []);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("selected_shop");
    setUser(null);
    window.dispatchEvent(new Event("authChanged"));
  };

  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default AuthContext;
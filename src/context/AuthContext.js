import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import BaseApiService from "../services/baseApiService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const isLoggedOut = useRef(false);
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [roles, setRoles] = useState(
    JSON.parse(localStorage.getItem("roles") || "[]")
  );

  // Logout function
  const logout = useCallback(() => {
    isLoggedOut.current = true;
    setToken("");
    setRoles([]);
    localStorage.clear();
    localStorage.setItem("logout", Date.now());
    navigate("/login");
  }, [navigate]);

  // Refresh access token from HTTP-only cookie
  const refreshAuthToken = useCallback(async () => {
    if (isLoggedOut.current) return false;
    try {
      const api = new BaseApiService(`api/refresh`);
      const res = await api.create('');
      if (!res || !res.data || !res.data.accessToken) {
        throw new Error("Failed to refresh token");
      }
    
      const { accessToken, roles: newRoles } = res.data;
      setToken(accessToken);
      setRoles(newRoles);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("roles", JSON.stringify(newRoles));
      console.log("🔁 Token refreshed via HTTP-only cookie");
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  

  // Cross-tab logout synchronization
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "logout") logout();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [logout]);

  // Auto-refresh token on user activity if expired
  useEffect(() => {
    const handleActivity = () => {
  if (!token) return;

  try {
    const { exp } = jwtDecode(token);
    const now = Date.now() / 1000;
    const timeLeft = exp - now;

    if (timeLeft <= 0) {
      console.log("⛔ Token expired – logging out.");
      logout();
    } else if (timeLeft < 50) {
      console.log("🔁 Token about to expire – refreshing...");
      refreshAuthToken();
    } else {
      console.log(`✅ Token valid – ${Math.floor(timeLeft)} seconds left.`);
      // No action needed
    }
  } catch (err) {
    console.warn("🔒 Invalid token – logging out.");
    logout();
  }
};
    ["click", "keydown", "mousemove", "touchstart"].forEach((evt) =>
      window.addEventListener(evt, handleActivity)
    );
    return () => {
      ["click", "keydown", "mousemove", "touchstart"].forEach((evt) =>
        window.removeEventListener(evt, handleActivity)
      );
    };
  }, [token, refreshAuthToken, logout]);

  // Login method
  const login = (accessToken, userRoles) => {
    setToken(accessToken);
    setRoles(userRoles);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("roles", JSON.stringify(userRoles));
  };

  return (
    <AuthContext.Provider value={{ token, roles, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

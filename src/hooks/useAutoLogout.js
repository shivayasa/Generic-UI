// src/hooks/useAutoLogout.js
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const INACTIVITY_LIMIT = 3 * 60 * 1000; // 5 min
const WARNING_LIMIT =  2 * 60 * 1000; // 4 min

const useAutoLogout = () => {
  const [showWarning, setShowWarning] = useState(false);
  const inactivityTimer = useRef(null);
  const warningTimer = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setShowWarning(false);
    if (location.pathname !== "/login") {
      navigate("/login");
    }
  }, [location.pathname, navigate]);

  const resetTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    clearTimeout(warningTimer.current);
    setShowWarning(false);

    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
    }, WARNING_LIMIT);

    inactivityTimer.current = setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT);
  }, [logout]);

  const handleStayLoggedIn = useCallback(() => {
    setShowWarning(false);
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((event) => window.dispatchEvent(new Event(event)));
  }, []);

  useEffect(() => {
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      clearTimeout(inactivityTimer.current);
      clearTimeout(warningTimer.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("token");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return { showWarning, handleStayLoggedIn, logout };
};

export default useAutoLogout;

import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Login from "./login";
import ProtectedRoute from "./components/ProtectedRoute";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Form from "./scenes/form";
import Line from "./scenes/line";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar/calendar";
import SchemaDataGrid from "./scenes/dynamicform/SchemaDataGrid";
// ...other imports...

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  // Advanced session handling
  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
  const WARNING_LIMIT = 14 * 60 * 1000; // Show warning after 14 minutes
  const inactivityTimer = useRef(null);
  const warningTimer = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Remove token and redirect to login
  const logout = () => {
    localStorage.removeItem("token");
    setShowWarning(false);
    if (location.pathname !== "/login") {
      navigate("/login");
    }
  };

  // Reset inactivity timer on user activity
  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      setShowWarning(false);

      // Show warning before logout
      warningTimer.current = setTimeout(() => {
        setShowWarning(true);
      }, WARNING_LIMIT);

      inactivityTimer.current = setTimeout(() => {
        logout();
      }, INACTIVITY_LIMIT);
    };

    // User activity events
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); // Start timer on mount

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
    // eslint-disable-next-line
  }, [location.pathname]);

  // Remove token on browser/tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("token");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Optional: Modal warning before logout
  const handleStayLoggedIn = () => {
    setShowWarning(false);
    // Reset timers
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    // Restart timers
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach(event => window.dispatchEvent(new Event(event)));
  };

  // Only show sidebar/topbar if authenticated and not on login page
  const isAuthenticated = !!localStorage.getItem("token");
  const isLoginPage = location.pathname === "/login";

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" height="100vh" bgcolor="background.default" color="text.primary">
          {isAuthenticated && !isLoginPage && <Sidebar isSidebar={isSidebar} />}
          <Box
            component="main"
            flexGrow={1}
            overflow="auto"
            display="flex"
            flexDirection="column"
          >
            {isAuthenticated && !isLoginPage && <Topbar setIsSidebar={setIsSidebar} />}
            <Box flexGrow={1} p={2}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                <Route path="/form" element={<ProtectedRoute><Form /></ProtectedRoute>} />
                <Route path="/line" element={<ProtectedRoute><Line /></ProtectedRoute>} />
                <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
                <Route path="/geography" element={<ProtectedRoute><Geography /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                <Route path="/schemas/:schemaName" element={<ProtectedRoute><SchemaDataGrid /></ProtectedRoute>} />
                {/* Add more protected routes here */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Box>
          </Box>
        </Box>
        {/* Warning Modal */}
        <Dialog open={showWarning}>
          <DialogTitle>Session Expiring Soon</DialogTitle>
          <DialogContent>
            <Box>
              You will be logged out soon due to inactivity.
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStayLoggedIn} color="primary" variant="contained">
              Stay Logged In
            </Button>
            <Button onClick={logout} color="error" variant="outlined">
              Logout Now
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
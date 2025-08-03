import {
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import {
  CssBaseline,
  ThemeProvider,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import { useState } from "react";
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
import { AuthProvider } from "./context/AuthContext";
import useAutoLogout from "./hooks/useAutoLogout";
import { useTokenExpirationLogger } from "./hooks/useTokenExpirationLogger";

function App() {
  useTokenExpirationLogger();
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token");
  const isLoginPage = location.pathname === "/login";

  const { showWarning, handleStayLoggedIn, logout } = useAutoLogout();

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box display="flex" height="100vh" bgcolor="background.default">
            {isAuthenticated && !isLoginPage && (
              <Sidebar isSidebar={isSidebar} />
            )}
            <Box
              component="main"
              flexGrow={1}
              overflow="auto"
              display="flex"
              flexDirection="column"
            >
              {isAuthenticated && !isLoginPage && (
                <Topbar setIsSidebar={setIsSidebar} />
              )}
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
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Box>
            </Box>
          </Box>

          {/* Session Timeout Modal */}
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
    </AuthProvider>
  );
}

export default App;

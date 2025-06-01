import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Form from "./scenes/form";
import Line from "./scenes/line";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import { AlertProvider } from "./context/AlertContext";
import { LoaderProvider } from "./context/LoaderContext";
import DynamicForm from "./scenes/company/DynamicForm";
import SchemaDataGrid from "./scenes/company/SchemaDataGrid";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <AlertProvider>
        <LoaderProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box display="flex" height="100vh" bgcolor="background.default" color="text.primary">
              <Sidebar isSidebar={isSidebar} />
              <Box
                component="main"
                flexGrow={1}
                overflow="auto"
                display="flex"
                flexDirection="column"
              >
                <Topbar setIsSidebar={setIsSidebar} />
                <Box flexGrow={1} p={2}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/schemas/:schemaName" element={<SchemaDataGrid />} />
                    <Route path="/form" element={<Form />} />
                    <Route path="/line" element={<Line />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/geography" element={<Geography />} />
                  </Routes>
                </Box>
              </Box>
            </Box>
          </ThemeProvider>
        </LoaderProvider>
      </AlertProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, alpha, useMediaQuery, Drawer, CircularProgress } from "@mui/material";
import { Link, Route } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import DatabaseIcon from "@mui/icons-material/Storage";
import { DataGrid } from "@mui/x-data-grid";
import BaseApiService from "../../services/baseApiService";

const schemaService = new BaseApiService("");
// Sidebar Item Component
const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[800],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
      sx={{
        '& svg': {
          color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[800],
        },
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? alpha(colors.primary[500], 0.3)
            : alpha(colors.primary[500], 0.1),
          '& svg, & span': {
            color: theme.palette.mode === 'dark' 
              ? colors.blueAccent[400] 
              : colors.blueAccent[600],
          }
        },
        '&.active': {
          backgroundColor: theme.palette.mode === 'dark'
            ? alpha(colors.primary[500], 0.5)
            : alpha(colors.primary[500], 0.2),
          '& svg, & span': {
            color: theme.palette.mode === 'dark' 
              ? colors.blueAccent[400] 
              : colors.blueAccent[600],
          }
        }
      }}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

// Sidebar Content Component
const SidebarContent = ({ isCollapsed, setIsCollapsed, selected, setSelected, colors, theme, schemas }) => {
  const themeStyles = {
    sidebar: {
      background: theme.palette.mode === 'dark' 
        ? colors.primary[400] 
        : '#fcfcfc',
      text: theme.palette.mode === 'dark'
        ? colors.grey[100]
        : colors.grey[800],
      secondaryText: theme.palette.mode === 'dark'
        ? colors.grey[300]
        : colors.grey[500],
      hover: theme.palette.mode === 'dark'
        ? alpha(colors.primary[500], 0.3)
        : alpha(colors.primary[500], 0.1),
      boxShadow: theme.palette.mode === 'dark'
        ? '0 4px 12px 0 rgba(0, 0, 0, 0.5)'
        : '0 4px 12px 0 rgba(0, 0, 0, 0.05)'
    }
  };

  return (
    <Box
      sx={{
        ".pro-sidebar .pro-menu": {
          background: theme.palette.mode === 'dark' 
            ? '#1F2A40' 
            : '#fcfcfc',
        },
        "& .pro-sidebar-inner": {
          background: `${themeStyles.sidebar.background} !important`,
          boxShadow: themeStyles.sidebar.boxShadow,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
          transition: 'all 0.2s ease-in-out',
          "& svg": {
            color: themeStyles.sidebar.text,
          },
          "& span": {
            color: themeStyles.sidebar.text,
          }
        },
        "& .pro-inner-item:hover": {
          backgroundColor: `${themeStyles.sidebar.hover} !important`,
          "& svg, & span": {
            color: theme.palette.mode === 'dark' 
              ? colors.blueAccent[400] 
              : colors.blueAccent[600],
          }
        },
        "& .pro-menu-item.active": {
          backgroundColor: theme.palette.mode === 'dark'
            ? alpha(colors.primary[500], 0.5)
            : alpha(colors.primary[500], 0.2),
          "& svg, & span": {
            color: theme.palette.mode === 'dark' 
              ? colors.blueAccent[400] 
              : colors.blueAccent[600],
          }
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed} style={{ border: 'none' }}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: themeStyles.sidebar.text,
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography 
                  variant="h3" 
                  color={themeStyles.sidebar.text}
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: "0.5px"
                  }}
                >
                  Generic UI
                </Typography>
                <IconButton 
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  sx={{
                    color: theme.palette.mode === 'dark' 
                      ? colors.grey[100] 
                      : colors.grey[800],
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? alpha(colors.primary[500], 0.3)
                        : alpha(colors.primary[500], 0.1),
                      color: theme.palette.mode === 'dark'
                        ? colors.blueAccent[400]
                        : colors.blueAccent[600]
                    }
                  }}
                >
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>
			{!isCollapsed && (
            <Box mb="25px">
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center"
              >
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={`../../assets/user.png`}
                  style={{ 
                    cursor: "pointer", 
                    borderRadius: "50%",
                    border: `2px solid ${theme.palette.mode === 'dark' 
                      ? colors.blueAccent[500]
                      : colors.blueAccent[600]}`,
                    padding: "2px"
                  }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  sx={{ 
                    m: "10px 0 0 0",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: themeStyles.sidebar.text,
                  }}
                >
                  Ed Roh
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{
                    fontSize: "0.9rem",
                    opacity: 0.9,
                    color: theme.palette.mode === 'dark'
                      ? colors.greenAccent[500]
                      : colors.greenAccent[700],
                  }}
                >
                  VP Fancy Admin
                </Typography>
              </Box>
            </Box>
          )}
          {/* Schema Dynamic Menu */}
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
		  <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              sx={{ 
                m: "15px 0 5px 20px",
                fontSize: "0.8rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: themeStyles.sidebar.secondaryText,
                display: isCollapsed ? "none" : "block"
              }}
            >
              Forms
            </Typography>
            {Array.isArray(schemas) && schemas.map((schema) => (
              <Item
                key={schema}
                title={schema}
                to={`/schemas/${schema}`}
                icon={<DatabaseIcon />} // Use appropriate icon
                selected={selected === schema}
                setSelected={setSelected}
              />
            ))}
			<Typography
              variant="h6"
              sx={{ 
                m: "15px 0 5px 20px",
                fontSize: "0.8rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: themeStyles.sidebar.secondaryText,
                display: isCollapsed ? "none" : "block"
              }}
            >
              Pages
            </Typography>
            <Item
              title="Profile Form"
              to="/form"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Calendar"
              to="/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="FAQ Page"
              to="/faq"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              sx={{ 
                m: "15px 0 5px 20px",
                fontSize: "0.8rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: themeStyles.sidebar.secondaryText,
                display: isCollapsed ? "none" : "block"
              }}
            >
              Charts
            </Typography>
            <Item
              title="Bar Chart"
              to="/bar"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Pie Chart"
              to="/pie"
              icon={<PieChartOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Line Chart"
              to="/line"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Geography Chart"
              to="/geography"
              icon={<MapOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
			
          </Box>

          
        </Menu>
      </ProSidebar>
    </Box>
  );
};

// Schema DataGrid Component
const SchemaDataGrid = ({ match }) => {
  const { schemaName } = match.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/${schemaName}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schemaName]);

  if (loading) return <CircularProgress />;

  const columns = [
    // Define columns dynamically based on schema structure
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 150 },
    // Add more columns as per the schema
  ];

  return (
    <DataGrid
      rows={data}
      columns={columns}
      pageSize={5}
      checkboxSelection
      disableSelectionOnClick
    />
  );
};

// Sidebar Component
const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [schemas, setSchemas] = useState([]);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch schemas from backend
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const data = await schemaService.http.request({ url: "/schemas", method: "GET" });
  
        // Check if response is valid
      if (data?.success && Array.isArray(data.data?.schemas)) {
        setSchemas(data.data.schemas); // Access schemas inside 'data'
      } else {
          console.error("Unexpected response format:", data);
          setSchemas([]); // fallback to empty list
        }
      } catch (error) {
        console.error("Failed to fetch schemas:", error);
        setSchemas([]); // fallback in case of error
      }
    };
  
    fetchForms();
  }, []);
  
  

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            backgroundColor: 'transparent',
            border: 'none'
          },
        }}
      >
        <SidebarContent
          isCollapsed={false}
          setIsCollapsed={setIsCollapsed}
          selected={selected}
          setSelected={setSelected}
          colors={colors}
          theme={theme}
          schemas={schemas}
        />
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: isCollapsed ? '80px' : '280px',
          transition: 'width 0.2s ease-in-out',
        }}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          selected={selected}
          setSelected={setSelected}
          colors={colors}
          theme={theme}
          schemas={schemas}
        />
      </Box>

      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 1199,
            display: { md: 'none' },
            backgroundColor: theme.palette.mode === 'dark' 
              ? colors.primary[400] 
              : colors.primary[100],
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? colors.primary[300] 
                : colors.primary[200],
            }
          }}
        >
          <MenuOutlinedIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default Sidebar;

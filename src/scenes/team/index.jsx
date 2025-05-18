import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import { Box, Typography, useTheme, IconButton, Tooltip, Avatar, Chip, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../components/Header";
import { mockDataTeam } from "../../data/mockData";
import { tokens } from "../../theme";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Enhanced columns with better formatting and visuals
  const columns = [
    { 
      field: "id", 
      headerName: "ID",
      width: 80,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: theme.palette.mode === 'dark' ? colors.blueAccent[300] : colors.blueAccent[700],
          }}
        >
          #{params.value}
        </Typography>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Avatar
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${params.value}`}
            sx={{
              width: 36,
              height: 36,
              background: theme.palette.mode === 'dark' 
                ? "linear-gradient(135deg, #818cf8, #c084fc)"
                : "linear-gradient(135deg, #6366f1, #a855f7)",
            }}
          />
          <Typography variant="body1" fontWeight="600">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "age",
      headerName: "Age",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            background: theme.palette.mode === 'dark'
              ? "rgba(129, 140, 248, 0.1)"
              : "rgba(99, 102, 241, 0.1)",
            color: theme.palette.mode === 'dark' ? "#818cf8" : "#6366f1",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
      renderCell: (params) => (
        <Typography
          component="a"
          href={`tel:${params.value}`}
          sx={{
            textDecoration: "none",
            color: "inherit",
            transition: "all 0.2s",
            "&:hover": {
              color: theme.palette.mode === 'dark' ? "#818cf8" : "#6366f1",
            }
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      renderCell: (params) => (
        <Typography
          component="a"
          href={`mailto:${params.value}`}
          sx={{
            textDecoration: "none",
            color: "inherit",
            transition: "all 0.2s",
            "&:hover": {
              color: theme.palette.mode === 'dark' ? "#818cf8" : "#6366f1",
            }
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "accessLevel",
      headerName: "Access Level",
      flex: 1,
      renderCell: ({ row: { access } }) => {
        const getAccessConfig = (accessType) => {
          const configs = {
            admin: {
              icon: AdminPanelSettingsOutlinedIcon,
              color: theme.palette.mode === 'dark' ? "#818cf8" : "#6366f1",
              background: theme.palette.mode === 'dark' ? "rgba(129, 140, 248, 0.1)" : "rgba(99, 102, 241, 0.1)",
              label: "Admin"
            },
            manager: {
              icon: SecurityOutlinedIcon,
              color: theme.palette.mode === 'dark' ? "#a78bfa" : "#8b5cf6",
              background: theme.palette.mode === 'dark' ? "rgba(167, 139, 250, 0.1)" : "rgba(139, 92, 246, 0.1)",
              label: "Manager"
            },
            user: {
              icon: LockOpenOutlinedIcon,
              color: theme.palette.mode === 'dark' ? "#c084fc" : "#9333ea",
              background: theme.palette.mode === 'dark' ? "rgba(192, 132, 252, 0.1)" : "rgba(147, 51, 234, 0.1)",
              label: "User"
            }
          };
          return configs[accessType];
        };

        const config = getAccessConfig(access);
        const Icon = config.icon;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              p: "0.5rem 1rem",
              borderRadius: "999px",
              background: config.background,
              color: config.color,
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: `0 4px 12px ${config.background}`,
              }
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
            <Typography fontWeight="600" fontSize="0.875rem">
              {config.label}
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Box m="20px" sx={{ height: "100%" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header 
          title="TEAM" 
          subtitle="Managing the Team Members" 
        />
        <Box display="flex" gap="1rem">
          <Button
            variant="contained"
            startIcon={<FilterListIcon />}
            sx={{
              background: theme.palette.mode === 'dark'
                ? "linear-gradient(135deg, #818cf8, #c084fc)"
                : "linear-gradient(135deg, #6366f1, #a855f7)",
              boxShadow: "none",
              "&:hover": {
                boxShadow: theme.palette.mode === 'dark'
                  ? "0 8px 16px rgba(129, 140, 248, 0.2)"
                  : "0 8px 16px rgba(99, 102, 241, 0.2)",
              }
            }}
          >
            Filters
          </Button>
          <IconButton
            sx={{
              background: theme.palette.mode === 'dark'
                ? "rgba(129, 140, 248, 0.1)"
                : "rgba(99, 102, 241, 0.1)",
              "&:hover": {
                background: theme.palette.mode === 'dark'
                  ? "rgba(129, 140, 248, 0.2)"
                  : "rgba(99, 102, 241, 0.2)",
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            sx={{
              background: theme.palette.mode === 'dark'
                ? "rgba(129, 140, 248, 0.1)"
                : "rgba(99, 102, 241, 0.1)",
              "&:hover": {
                background: theme.palette.mode === 'dark'
                  ? "rgba(129, 140, 248, 0.2)"
                  : "rgba(99, 102, 241, 0.2)",
              }
            }}
          >
            <DownloadIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Previous DataGrid styling remains the same */}
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          // Your existing DataGrid styles here
        }}
      >
        <DataGrid
          checkboxSelection
          rows={mockDataTeam}
          columns={columns}
          components={{
            Toolbar: GridToolbar,
          }}
          componentsProps={{
            toolbar: {
              sx: {
                "& .MuiButton-root": {
                  color: theme.palette.mode === 'dark' ? "#818cf8" : "#6366f1",
                },
              },
            },
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-toolbarContainer": {
              padding: "1rem",
              background: theme.palette.mode === 'dark'
                ? "rgba(129, 140, 248, 0.05)"
                : "rgba(99, 102, 241, 0.05)",
              borderRadius: "12px",
              margin: "0 0 1rem 0",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default Team;
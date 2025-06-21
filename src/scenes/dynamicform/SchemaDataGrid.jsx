import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Container,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import BaseApiService from "../../services/baseApiService";

const SchemaDataGrid = () => {
  const { schemaName } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectionModel, setSelectionModel] = useState([]);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [addMode, setAddMode] = useState(false);
  const [newRecord, setNewRecord] = useState({});
  const [searchText, setSearchText] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [editRecord, setEditRecord] = useState({});

  useEffect(() => {
    setAddMode(false);
    setNewRecord({});
    setEditRow(null);
    setEditRecord({});
    if (!schemaName) return;

    const fetchSchemaData = async () => {
      setLoading(true);
      setError("");
      try {
        const api = new BaseApiService(`api/${schemaName}`);
        const res = await api.getAll();
        const data = res.data;

        if (Array.isArray(data) && data.length > 0) {
          const allKeys = new Set();
          data.forEach((item) => Object.keys(item).forEach((key) => allKeys.add(key)));
          const dynamicCols = Array.from(allKeys).map((key, idx) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            width: 180,
            editable: false, // Disable inline editing
            cellClassName: idx === 0 ? "name-column--cell" : undefined,
          }));
          setColumns(dynamicCols);
          setRows(data);
        } else {
          setColumns([]);
          setRows([]);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchemaData();
  }, [schemaName]);

  const handleAddNew = async () => {
    try {
      const api = new BaseApiService(`api/${schemaName}`);
      const result = await api.create(newRecord);

      if (!result.success) throw new Error(result.error.message);

      const created = result.data;
      setRows((prev) => [...prev, created]);
      setSnackbar({ open: true, message: "Added successfully", severity: "success" });
      setAddMode(false);
      setNewRecord({});
    } catch (err) {
      setSnackbar({ open: true, message: `Add failed: ${err.message}`, severity: "error" });
    }
  };

  // Remove inline editing handler
  // const handleEditCommit = async ({ id, field, value }) => { ... }

  const handleDelete = async () => {
    try {
      const api = new BaseApiService(`api/${schemaName}`);
      await Promise.all(selectionModel.map((id) => api.delete(id)));

      setRows((prev) => prev.filter((row) => !selectionModel.includes(row._id)));
      setSnackbar({ open: true, message: "Deleted successfully", severity: "success" });
      setSelectionModel([]);
    } catch (err) {
      setSnackbar({ open: true, message: `Delete failed: ${err.message}`, severity: "error" });
    }
  };

   // Find the first visible column (not _id, __v, createdAt, updatedAt)
  const getFirstVisibleColumn = useCallback(() => {
    return columns.find(
      (col) =>
        col.field !== "_id" &&
        col.field !== "__v" &&
        col.field !== "createdAt" &&
        col.field !== "updatedAt"
    );
  }, [columns]);

  // Handle cell click for first visible column
  const handleCellClick = useCallback(
    (params) => {
      const firstVisibleCol = getFirstVisibleColumn();
      if (firstVisibleCol && params.field === firstVisibleCol.field) {
        setEditRow(params.row);
        setEditRecord(params.row);
      }
    },
    [getFirstVisibleColumn]
  );

  // Handle update from edit form
  const handleUpdate = async () => {
    try {
      const api = new BaseApiService(`api/${schemaName}`);
      const result = await api.update(editRow._id, editRecord);
      if (!result.success) throw new Error(result.error.message);

      setSnackbar({ open: true, message: "Updated successfully", severity: "success" });
      setRows((prev) =>
        prev.map((row) => (row._id === editRow._id ? { ...row, ...editRecord } : row))
      );
      setEditRow(null);
      setEditRecord({});
    } catch (err) {
      setSnackbar({ open: true, message: `Update failed: ${err.message}`, severity: "error" });
    }
  };

  const CustomToolbar = () => (
    <GridToolbarContainer
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      {/* Left side: buttons */}
      <Box display="flex" gap={2}>
        <Button
          onClick={() => setAddMode(true)}
          variant="contained"
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: "#fff",
            "&:hover": {
              backgroundColor: colors.blueAccent[600],
            },
          }}
        >
          Add New
        </Button>
        <Button
          onClick={handleDelete}
          disabled={selectionModel.length === 0}
          color="error"
          variant="outlined"
        >
          Delete Selected
        </Button>
        <GridToolbarExport />
      </Box>

      {/* Right side: search */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ width: 250 }}
      />
    </GridToolbarContainer>
  );

  // Search/filter logic
  const filteredRows = rows.filter((row) =>
    columns
      .filter(
        (col) =>
          col.field !== "_id" &&
          col.field !== "__v" &&
          col.field !== "createdAt" &&
          col.field !== "updatedAt"
      )
      .some((col) => {
        const value = row[col.field];
        return value && value.toString().toLowerCase().includes(searchText.toLowerCase());
      })
  );

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
        <Typography mt={2}>Loading {schemaName}...</Typography>
      </Container>
    );
  }

  return (
    <Box m="20px">
      <Typography variant="h4" gutterBottom>
        {schemaName
          .replace(/([A-Z])/g, " $1")
          .replace(/^ /, "")
          .replace(/^./, (s) => s.toUpperCase())}
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        {addMode ? (
          // --- Add New Form ---
          <Box mb={3} p={2} sx={{ background: colors.primary[400], borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Add New{" "}
              {schemaName
                .replace(/([A-Z])/g, " $1")
                .replace(/^ /, "")
                .replace(/^./, (s) => s.toUpperCase())}
            </Typography>
            <Box component="form" sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                {columns
                  .filter(
                    (col) =>
                      col.field !== "_id" &&
                      col.field !== "__v" &&
                      col.field !== "createdAt" &&
                      col.field !== "updatedAt"
                  )
                  .map((col) => (
                    <Grid item xs={12} sm={6} md={6} key={col.field}>
                      <TextField
                        margin="dense"
                        label={col.headerName}
                        fullWidth
                        value={newRecord[col.field] || ""}
                        onChange={(e) =>
                          setNewRecord({ ...newRecord, [col.field]: e.target.value })
                        }
                      />
                    </Grid>
                  ))}
              </Grid>
              <Box display="flex" gap={2} mt={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setAddMode(false);
                    setNewRecord({});
                  }}
                >
                  Back
                </Button>
                <Button variant="contained" onClick={handleAddNew}>
                  Save
                </Button>
              </Box>
            </Box>
          </Box>
        ) : editRow ? (
          // --- Edit Form ---
          <Box mb={3} p={2} sx={{ background: colors.primary[400], borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Edit{" "}
              {schemaName
                .replace(/([A-Z])/g, " $1")
                .replace(/^ /, "")
                .replace(/^./, (s) => s.toUpperCase())}
            </Typography>
            <Box component="form" sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                {columns
                  .filter(
                    (col) =>
                      col.field !== "_id" &&
                      col.field !== "__v" &&
                      col.field !== "createdAt" &&
                      col.field !== "updatedAt"
                  )
                  .map((col) => (
                    <Grid item xs={12} sm={6} md={6} key={col.field}>
                      <TextField
                        margin="dense"
                        label={col.headerName}
                        fullWidth
                        value={editRecord[col.field] || ""}
                        onChange={(e) =>
                          setEditRecord({ ...editRecord, [col.field]: e.target.value })
                        }
                      />
                    </Grid>
                  ))}
              </Grid>
              <Box display="flex" gap={2} mt={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setEditRow(null);
                    setEditRecord({});
                  }}
                >
                  Back
                </Button>
                <Button variant="contained" onClick={handleUpdate}>
                  Update
                </Button>
              </Box>
            </Box>
          </Box>
        ) : filteredRows.length === 0 ? (
          <Typography variant="h6" color="textSecondary" align="center" mt={4}>
            No data available
          </Typography>
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={columns.filter(
              (col) =>
                col.field !== "_id" &&
                col.field !== "__v" &&
                col.field !== "createdAt" &&
                col.field !== "updatedAt"
            )}
            getRowId={(row) => row._id || row.id}
            checkboxSelection
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            disableSelectionOnClick
            onSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
            // onCellEditCommit={handleEditCommit} // <-- removed inline editing
            components={{ Toolbar: CustomToolbar }}
            onCellClick={handleCellClick}
          />
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: {
            backgroundColor:
              snackbar.severity === "success"
                ? colors.greenAccent[600]
                : colors.redAccent?.[600] || "red",
          },
        }}
      />
    </Box>
  );
};

export default SchemaDataGrid;
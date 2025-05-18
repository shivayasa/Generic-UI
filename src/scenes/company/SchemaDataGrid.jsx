import React, { useEffect, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";

import BaseApiService from "../../services/baseApiService";

const schemaService = new BaseApiService("");

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
  const [openDialog, setOpenDialog] = useState(false);
  const [newRecord, setNewRecord] = useState({});

  useEffect(() => {
    if (!schemaName) return;

    const fetchSchemaData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await schemaService.http.request({ url: `/api/${schemaName}`, method: "GET" });
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          const allKeys = new Set();
          data.forEach((item) => Object.keys(item).forEach((key) => allKeys.add(key)));
          const dynamicCols = Array.from(allKeys).map((key) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            width: 180,
            editable: key !== "_id" && key !== "__v",
            cellClassName: key === "name" ? "name-column--cell" : undefined,
          }));
          setColumns(dynamicCols);
          setRows(data);
        } else {
          setColumns([]);
          setRows([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemaData();
  }, [schemaName]);

  const handleEditCommit = async ({ id, field, value }) => {
    try {
      const res = await fetch(`/api/${schemaName}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setSnackbar({ open: true, message: "Updated successfully", severity: "success" });
      setRows((prev) => prev.map((row) => (row._id === id ? { ...row, [field]: value } : row)));
    } catch (err) {
      setSnackbar({ open: true, message: `Failed: ${err.message}`, severity: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await Promise.all(
        selectionModel.map((id) =>
          fetch(`/api/${schemaName}/${id}`, { method: "DELETE" })
        )
      );
      setRows((prev) => prev.filter((row) => !selectionModel.includes(row._id)));
      setSnackbar({ open: true, message: "Deleted successfully", severity: "success" });
      setSelectionModel([]);
    } catch (err) {
      setSnackbar({ open: true, message: `Delete failed: ${err.message}`, severity: "error" });
    }
  };

  const handleAddNew = async () => {
    try {
      const res = await fetch(`/api/${schemaName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const created = await res.json();
      setRows((prev) => [...prev, created]);
      setSnackbar({ open: true, message: "Added successfully", severity: "success" });
      setOpenDialog(false);
      setNewRecord({});
    } catch (err) {
      setSnackbar({ open: true, message: `Add failed: ${err.message}`, severity: "error" });
    }
  };

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <Button
        onClick={() => setOpenDialog(true)}
        sx={{ color: `${colors.grey[100]} !important` }}
      >
        Add New
      </Button>
      <Button
        onClick={handleDelete}
        disabled={selectionModel.length === 0}
        color="error"
        sx={{ color: `${colors.grey[100]} !important` }}
      >
        Delete Selected
      </Button>
      <GridToolbarExport />
    </GridToolbarContainer>
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
    <Box
      m="20px"
    >
      <Typography variant="h4" gutterBottom>
          {schemaName.toUpperCase()} Data
      </Typography>


      {error && <Alert severity="error">{error}</Alert>}

      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
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
        {rows.length === 0 ? (
          <Typography variant="h6" color="textSecondary" align="center" mt={4}>
            No data available
          </Typography>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id || row.id}
            checkboxSelection
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            disableSelectionOnClick
            onSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
            onCellEditCommit={handleEditCommit}
            components={{ Toolbar: CustomToolbar }}
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
            backgroundColor: snackbar.severity === "success" ? colors.greenAccent[600] : colors.redAccent?.[600] || "red",
          },
        }}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New {schemaName} Entry</DialogTitle>
        <DialogContent>
          {columns
            .filter((col) => col.field !== "_id" && col.field !== "__v")
            .map((col) => (
              <TextField
                key={col.field}
                margin="dense"
                label={col.headerName}
                fullWidth
                value={newRecord[col.field] || ""}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, [col.field]: e.target.value })
                }
              />
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddNew} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchemaDataGrid;

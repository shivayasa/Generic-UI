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
  MenuItem,
  InputLabel,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import BaseApiService from "../../services/baseApiService";

// Utility to extract filename from URL
const extractFilename = (url) => url?.split("/").pop() || "";

const SchemaDataGrid = () => {
  const { schemaName } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fieldConfigs, setFieldConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectionModel, setSelectionModel] = useState([]);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [addMode, setAddMode] = useState(false);
  const [newRecord, setNewRecord] = useState({});
  const [searchText, setSearchText] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [editRecord, setEditRecord] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchSchemaFields = async () => {
      try {
        const api = new BaseApiService();
        const res = await api.http.request({
          url: `/schemas/${schemaName}`,
          method: "GET",
        });
        setFieldConfigs(res?.data?.fields || {});
      } catch {
        setFieldConfigs({});
      }
    };

    if (schemaName) fetchSchemaFields();
  }, [schemaName]);

  useEffect(() => {
    if (!schemaName || !Object.keys(fieldConfigs).length) return;

    setAddMode(false);
    setNewRecord({});
    setEditRow(null);
    setEditRecord({});

    const fetchSchemaData = async () => {
      setLoading(true);
      setError("");
      try {
        const api = new BaseApiService(`api/${schemaName}`);
        const res = await api.getAll();
        const data = res.data;

        if (Array.isArray(data) && data.length > 0) {
          const schemaKeys = Object.keys(fieldConfigs);
          const extraKeys = Array.from(
            new Set(data.flatMap((item) => Object.keys(item)))
          ).filter((k) => !schemaKeys.includes(k));
          const allKeys = [...schemaKeys, ...extraKeys];

          const visible = schemaKeys.filter(
            (k) => !["_id", "__v", "createdAt", "updatedAt"].includes(k)
          );
          const firstVisible = visible[0];

          const dynamicCols = allKeys.map((key, idx) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            width: 180,
            editable: false,
            cellClassName:
              key === firstVisible
                ? "first-visible-column--cell"
                : idx === 0
                ? "name-column--cell"
                : undefined,
            ...(fieldConfigs[key] || {}),
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
  }, [schemaName, fieldConfigs]);

  const renderField = (col, value, onChange, mode = "add") => {
    if (col.upload) {
      const isFile = value instanceof File;
      const displayName = isFile
        ? value.name
        : mode === "edit" && typeof value === "string"
        ? extractFilename(value)
        : "";

      return (
        <div>
          <InputLabel>{col.headerName}</InputLabel>
          {mode === "edit" && !isFile && value && (
            <Box mb={1}>
              {/\.(jpe?g|png|gif|bmp|webp)$/i.test(value) ? (
                <img
                  src={`http://localhost:3000/uploads/${schemaName}/${value}`}
                  alt={col.field}
                  style={{
                    maxWidth: 120,
                    maxHeight: 120,
                    display: "block",
                    marginBottom: 8,
                  }}
                />
              ) : (
                <a
                  href={`http://localhost:3000/uploads/${schemaName}/${value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download {displayName}
                </a>
              )}
            </Box>
          )}
          <input
            type="file"
            name={col.field}
            onChange={onChange}
            required={col.required && mode === "add"}
            className="dynamic-form-file-input"
          />
          {displayName && (
            <Typography variant="caption">
              {isFile ? `Selected: ${displayName}` : `Current: ${displayName}`}
            </Typography>
          )}
        </div>
      );
    }

    if (col.enum) {
      return (
        <TextField
          select
          label={col.headerName}
          name={col.field}
          value={value || ""}
          onChange={onChange}
          required={col.required}
          fullWidth
        >
          {col.enum.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    return (
      <TextField
        margin="dense"
        label={col.headerName}
        fullWidth
        name={col.field}
        value={value ?? ""}
        onChange={onChange}
        required={col.required}
        type={col.type === "number" ? "number" : "text"}
      />
    );
  };

  const handleFieldChange = (e) => {
    const { name, files, value, type } = e.target;
    const update = type === "file" ? files[0] : value;
    if (addMode) {
      setNewRecord((p) => ({ ...p, [name]: update }));
    } else if (editRow) {
      setEditRecord((p) => ({ ...p, [name]: update }));
    }
  };

  const handleAddNew = async () => {
    try {
      const filtered = {};
      columns.forEach((col) => {
        if (!["_id", "__v", "createdAt", "updatedAt"].includes(col.field)) {
          filtered[col.field] = newRecord[col.field] ?? "";
        }
      });

      const hasFile = columns.some(
        (col) =>
          (col.upload || col.isUpload) &&
          newRecord[col.field] instanceof File
      );

      let payload = filtered;
      if (hasFile) {
        payload = new FormData();
        columns.forEach((col) => {
          if (!["_id", "__v", "createdAt", "updatedAt"].includes(col.field)) {
            const v = newRecord[col.field];
            if (v != null && v !== "") {
              payload.append(col.field, v);
            }
          }
        });
      }

      const api = new BaseApiService(`api/${schemaName}`);
      const result = await api.create(payload, hasFile);
      if (!result.success) throw new Error(result.error.message);

      setRows((p) => [...p, result.data]);
      setSnackbar({
        open: true,
        message: "Added successfully",
        severity: "success",
      });
      setAddMode(false);
      setNewRecord({});
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Add failed: ${err.message}`,
        severity: "error",
      });
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const api = new BaseApiService(`api/${schemaName}`);
      await Promise.all(selectionModel.map((id) => api.delete(id)));
      setRows((p) => p.filter((r) => !selectionModel.includes(r._id)));
      setSnackbar({
        open: true,
        message: "Deleted successfully",
        severity: "success",
      });
      setSelectionModel([]);
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Delete failed: ${err.message}`,
        severity: "error",
      });
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    try {
      const filtered = {};
      columns.forEach((col) => {
        if (!["_id", "__v", "createdAt", "updatedAt"].includes(col.field)) {
          filtered[col.field] = editRecord[col.field] ?? "";
        }
      });

      const hasFile = columns.some(
        (col) =>
          (col.upload || col.isUpload) &&
          editRecord[col.field] instanceof File
      );

      let payload = filtered;
      if (hasFile) {
        payload = new FormData();
        columns.forEach((col) => {
          if (!["_id", "__v", "createdAt", "updatedAt"].includes(col.field)) {
            const v = editRecord[col.field];
            if (v != null && v !== "") {
              payload.append(col.field, v);
            }
          }
        });
      }

      const api = new BaseApiService(`api/${schemaName}`);
      const result = await api.update(editRow._id, payload, hasFile);
      if (!result.success) throw new Error(result.error.message);

      setRows((p) =>
        p.map((r) => (r._id === editRow._id ? { ...r, ...editRecord } : r))
      );
      setSnackbar({
        open: true,
        message: "Updated successfully",
        severity: "success",
      });
      setEditRow(null);
      setEditRecord({});
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Update failed: ${err.message}`,
        severity: "error",
      });
      console.error(err);
    }
  };

  const getFirstVisibleColumn = useCallback(() => {
    return columns.find(
      (col) =>
        !["_id", "__v", "createdAt", "updatedAt"].includes(col.field)
    );
  }, [columns]);

  const handleCellClick = useCallback(
    (params) => {
      const first = getFirstVisibleColumn();
      if (first && params.field === first.field) {
        setEditRow(params.row);
        setEditRecord(params.row);
      }
    },
    [getFirstVisibleColumn]
  );

  const visibleCols = columns.filter(
    (col) =>
      !col.field.endsWith("Url") &&
      !["_id", "__v", "createdAt", "updatedAt"].includes(col.field)
  );

  const filteredRows = rows.filter((row) =>
    visibleCols.some((col) => {
      const v = row[col.field];
      return (
        v &&
        v
          .toString()
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    })
  );

  const CustomToolbar = () => (
    <GridToolbarContainer
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Box display="flex" gap={2}>
        <Button
          onClick={() => setAddMode(true)}
          variant="contained"
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: "#fff",
            "&:hover": { backgroundColor: colors.blueAccent[600] },
          }}
        >
          Add New
        </Button>
        <Button
          onClick={handleDelete}
          disabled={!selectionModel.length}
          color="error"
          variant="outlined"
        >
          Delete Selected
        </Button>
        <GridToolbarExport />
      </Box>
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
          "& .first-visible-column--cell": { fontWeight: "bold" },
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
          <Box mb={3} p={2} sx={{ background: colors.primary[400], borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Add New{" "}
              {schemaName
                .replace(/([A-Z])/g, " $1")
                .replace(/^ /, "")
                .replace(/^./, (s) => s.toUpperCase())}
            </Typography>
            <Grid container spacing={2}>
              {visibleCols.map((col) => (
                <Grid item xs={12} sm={6} md={6} key={col.field}>
                  {renderField(col, newRecord[col.field], handleFieldChange, "add")}
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
        ) : editRow ? (
          <Box mb={3} p={2} sx={{ background: colors.primary[400], borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Edit{" "}
              {schemaName
                .replace(/([A-Z])/g, " $1")
                .replace(/^ /, "")
                .replace(/^./, (s) => s.toUpperCase())}
            </Typography>
            <Grid container spacing={2}>
              {visibleCols.map((col) => (
                <Grid item xs={12} sm={6} md={6} key={col.field}>
                  {renderField(col, editRecord[col.field], handleFieldChange, "edit")}
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
        ) : filteredRows.length === 0 ? (
          <Typography variant="h6" color="textSecondary" align="center" mt={4}>
            No data available
          </Typography>
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={visibleCols}
            getRowId={(row) => row._id || row.id}
            checkboxSelection
            pageSize={pageSize}
            onPageSizeChange={(n) => setPageSize(n)}
            rowsPerPageOptions={[5, 10, 25]}
            pagination
            page={page}
            onPageChange={(n) => setPage(n)}
            disableSelectionOnClick
            onSelectionModelChange={(s) => setSelectionModel(s)}
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

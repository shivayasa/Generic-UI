import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import Header from "../../components/Header";
import BaseApiService from "../../services/baseApiService";
import "./DynamicForm.css";

const DynamicForm = () => {
  const [formList, setFormList] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [schema, setSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [recordId, setRecordId] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch available forms/models
    const fetchForms = async () => {
      try {
        const api = new BaseApiService("/schemas");
        const res = await api.http.request({ url: "", method: "GET" });
        if (res?.success && Array.isArray(res.data?.schemas)) {
          setFormList(res.data.schemas);
        }
      } catch (err) {
        setError("Failed to fetch forms.");
      }
    };
    fetchForms();
  }, []);

  useEffect(() => {
    // Fetch schema for selected form
    const fetchSchema = async () => {
      if (!selectedForm) {
        setSchema(null);
        return;
      }
      try {
        const api = new BaseApiService(`/schemas/${selectedForm}`);
        const res = await api.http.request({ url: "", method: "GET" });
        if (res?.success && res.data?.schema) {
          setSchema(res.data.schema);
        }
      } catch (err) {
        setError("Failed to fetch schema.");
      }
    };
    fetchSchema();
  }, [selectedForm]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedForm) return;
    try {
      const api = new BaseApiService(`/api/${selectedForm}`);
      let result;
      if (recordId) {
        result = await api.update(recordId, formData);
      } else {
        result = await api.create(formData);
      }
      if (!result.success) throw new Error(result.error?.message || "Failed");
      setSnackbar({ open: true, message: "Saved successfully", severity: "success" });
      setFormData({});
      setRecordId("");
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  const handleGetById = async () => {
    if (!selectedForm || !recordId) return;
    try {
      const api = new BaseApiService(`/api/${selectedForm}`);
      const res = await api.getById(recordId);
      if (res.success && res.data) {
        setFormData(res.data);
        setSnackbar({ open: true, message: "Record loaded", severity: "success" });
      } else {
        throw new Error("Not found");
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  const handleDelete = async () => {
    if (!selectedForm || !recordId) return;
    try {
      const api = new BaseApiService(`/api/${selectedForm}`);
      const res = await api.delete(recordId);
      if (res.success) {
        setFormData({});
        setRecordId("");
        setSnackbar({ open: true, message: "Deleted", severity: "success" });
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  // Render each field based on schema
  const renderField = (key, config) => {
    if (config.type === "file") {
      return (
        <Grid item xs={12} sm={6} key={key}>
          <input
            type="file"
            name={key}
            onChange={handleChange}
            required={config.required}
            className="dynamic-form-file-input"
          />
        </Grid>
      );
    }
    if (config.enum) {
      return (
        <Grid item xs={12} sm={6} key={key}>
          <TextField
            select
            label={config.label || key}
            name={key}
            value={formData[key] || ""}
            onChange={handleChange}
            required={config.required}
            fullWidth
          >
            {config.enum.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      );
    }
    return (
      <Grid item xs={12} sm={6} key={key}>
        <TextField
          label={config.label || key}
          name={key}
          value={formData[key] || ""}
          onChange={handleChange}
          required={config.required}
          fullWidth
          type={config.type === "number" ? "number" : "text"}
        />
      </Grid>
    );
  };

  return (
    <Box className="dynamic-form-container">
      <Header
        title={selectedForm || "Dynamic Forms"}
        subtitle="Select a model to generate its form"
        className="dynamic-form-header"
      />

      <FormControl className="dynamic-form-select">
        <Select
          value={selectedForm}
          onChange={(e) => {
            setSelectedForm(e.target.value);
            setRecordId("");
            setFormData({});
          }}
          displayEmpty
          renderValue={(selected) => selected || "Select a form"}
        >
          {formList.map((form) => (
            <MenuItem key={form} value={form}>
              {form}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {schema && (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} className="dynamic-form-grid">
            {Object.entries(schema.fields).map(([key, config]) => renderField(key, config))}
          </Grid>
          <Box className="dynamic-form-actions">
            <Button variant="contained" color="primary" type="submit">
              {recordId ? "Update" : "Submit"}
            </Button>
            <Button variant="outlined" color="info" onClick={handleGetById}>
              Get By ID
            </Button>
            <Button variant="outlined" color="error" onClick={handleDelete}>
              Delete
            </Button>
            <TextField
              label="Record ID"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              size="small"
              style={{ marginLeft: 16 }}
            />
          </Box>
        </form>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

export default DynamicForm;
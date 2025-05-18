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
} from "@mui/material";
import Header from "../../components/Header";
import BaseApiService from "../../services/baseApiService";

const schemaService = new BaseApiService("");

const DynamicForm = () => {
  const [formList, setFormList] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [schema, setSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [recordId, setRecordId] = useState("");

  useEffect(() => {
    const fetchForms = async () => {
      const res = await schemaService.http.request({ url: "/schemas/all", method: "GET" });
      if (res.success && res.data?.schemas) {
        const modelNames = Object.keys(res.data.schemas);
        setFormList(modelNames);
      } else {
        console.error("Unexpected response format", res.data);
        setFormList([]);
      }
    };
    fetchForms();
  }, []);

  useEffect(() => {
    const fetchSchema = async () => {
      const res = await schemaService.http.request({ url: `/schemas/${selectedForm}`, method: "GET" });
      if (res.success) {
        const data = res.data;
        setSchema(data);
        const emptyData = {};
        Object.keys(data.fields).forEach((key) => (emptyData[key] = ""));
        setFormData(emptyData);
      } else {
        console.error(res.error.message);
      }
    };

    if (selectedForm) fetchSchema();
  }, [selectedForm]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const api = new BaseApiService(`/api/${selectedForm}`);
    const hasFile = Object.entries(schema.fields).some(([_, cfg]) => cfg.upload);

    const result = recordId
      ? await api.update(recordId, formData, hasFile)
      : await api.create(formData, hasFile);

    if (result.success) {
      alert(`Form ${recordId ? "updated" : "submitted"} successfully!`);
    } else {
      alert(`Error: ${result.error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!recordId) return alert("Provide a record ID to delete.");
    const api = new BaseApiService(`/api/${selectedForm}`);
    const result = await api.delete(recordId);
    alert(result.success ? "Deleted successfully." : `Delete failed: ${result.error.message}`);
  };

  const handleGetById = async () => {
    if (!recordId) return alert("Provide a record ID to fetch.");
    const api = new BaseApiService(`/api/${selectedForm}`);
    const result = await api.getById(recordId);
    if (result.success) {
      setFormData(result.data);
    } else {
      alert(`Fetch failed: ${result.error.message}`);
    }
  };

  const renderField = (key, config) => {
    if (config.enum) {
      return (
        <Grid item xs={12} sm={6} key={key}>
          <FormControl fullWidth margin="normal">
            <InputLabel shrink={!!formData[key]}>{key}</InputLabel>
            <Select
              name={key}
              value={formData[key]}
              onChange={handleChange}
              required={config.required}
              displayEmpty
            >
              <MenuItem value="" disabled>Select {key}</MenuItem>
              {config.enum.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      );
    }

    if (config.upload) {
      return (
        <Grid item xs={12} sm={6} key={key}>
          <Box my={2}>
            <Typography>{key}</Typography>
            <input
              type="file"
              name={key}
              onChange={handleChange}
              required={config.required}
            />
          </Box>
        </Grid>
      );
    }

    return (
      <Grid item xs={12} sm={6} key={key}>
        <TextField
          fullWidth
          margin="normal"
          label={key}
          name={key}
          type={config.type === "String" ? "text" : config.type?.toLowerCase() || "text"}
          value={formData[key]}
          onChange={handleChange}
          required={config.required}
        />
      </Grid>
    );
  };

  return (
    <Box m="20px">
      <Header title={selectedForm || "Dynamic Forms"} subtitle="Select a model to generate its form" />

      <FormControl fullWidth margin="normal">
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
          <Grid container spacing={2}>
            {Object.entries(schema.fields).map(([key, config]) => renderField(key, config))}
          </Grid>

          <Box display="flex" gap={2} mt={2}>
            <Button variant="contained" color="primary" type="submit">
              {recordId ? "Update" : "Submit"}
            </Button>
            <Button variant="outlined" color="info" onClick={handleGetById}>
              Get By ID
            </Button>
            <Button variant="outlined" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default DynamicForm;

import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import BaseApiService from "../services/baseApiService";

const loginSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

const initialValues = {
  username: "",
  password: "",
};

const Login = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleFormSubmit = async (values, { setSubmitting }) => {
  setError("");
  try {
    const api = new BaseApiService("/api/login");
    const response = await api.create(values);
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } else {
      setError("Invalid credentials");
    }
  } catch (err) {
    setError("Login failed. Please check your credentials.");
  }
  setSubmitting(false);
};

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: theme.palette.mode === "dark"
          ? colors.primary[400]
          : "#f0f2f5",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: isNonMobile ? "48px 40px 36px 40px" : "32px 16px",
          borderRadius: 3,
          minWidth: isNonMobile ? 400 : "90vw",
          maxWidth: 400,
          background: theme.palette.mode === "dark"
            ? colors.primary[400]
            : "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          color={theme.palette.mode === "dark" ? colors.blueAccent[400] : "#1877f2"}
          mb={2}
          sx={{ fontFamily: "Arial, Helvetica, sans-serif", letterSpacing: "-1px" }}
        >
          Generic UI
        </Typography>
        <Typography
          variant="h6"
          color={theme.palette.mode === "dark" ? colors.grey[200] : colors.grey[700]}
          mb={3}
          sx={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          Sign in to your account
        </Typography>
        <Formik
          onSubmit={handleFormSubmit}
          initialValues={initialValues}
          validationSchema={loginSchema}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
          }) => (
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Username"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.username}
                name="username"
                error={!!touched.username && !!errors.username}
                helperText={touched.username && errors.username}
                sx={{ mb: 2, background: "#f5f6fa", borderRadius: 1 }}
                InputProps={{
                  style: { background: "#f5f6fa", borderRadius: 6 }
                }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ mb: 2, background: "#f5f6fa", borderRadius: 1 }}
                InputProps={{
                  style: { background: "#f5f6fa", borderRadius: 6 }
                }}
              />
              {error && (
                <Typography color="error" mb={2} align="center">
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                color="primary"
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  background: "#1877f2",
                  boxShadow: "none",
                  borderRadius: 2,
                  py: 1.5,
                  mb: 1,
                  "&:hover": {
                    background: "#166fe5",
                  },
                }}
                disabled={isSubmitting}
              >
                Log In
              </Button>
            </form>
          )}
        </Formik>
        <Typography
          variant="body2"
          color={theme.palette.mode === "dark" ? colors.grey[300] : colors.grey[600]}
          mt={3}
          align="center"
        >
          © {new Date().getFullYear()} Generic UI
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
/**
 * CustomField Component - Universal MUI field wrapper
 * Handles text, email, password, tel, select, checkbox, and multiline fields
 */

import React from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import MDTypography from "components/MDTypography";

const CustomField = ({ field, value, onChange, error, disabled = false }) => {
  // Checkbox field
  if (field.type === "checkbox") {
    return (
      <FormControlLabel
        control={
          <Checkbox
            name={field.name}
            checked={value || false}
            onChange={onChange}
            disabled={disabled}
          />
        }
        label={field.label}
      />
    );
  }

  // Select field
  if (field.type === "select") {
    return (
      <FormControl fullWidth margin="normal" error={!!error} disabled={disabled}>
        <InputLabel>{field.label}</InputLabel>
        <Select
          name={field.name}
          value={value || ""}
          onChange={onChange}
          label={field.label}
          sx={{padding:"10px 0.75px !important"}}
        >
          {field.options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error && (
          <MDTypography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
            {error}
          </MDTypography>
        )}
      </FormControl>
    );
  }

  return (
    <TextField
      fullWidth
      label={field.label}
      name={field.name}
      type={field.type}
      value={value || ""}
      onChange={onChange}
      margin="normal"
      variant="outlined"
      placeholder={field.placeholder}
      multiline={field.multiline || false}
      rows={field.multiline ? 4 : 1}
      error={!!error}
      helperText={error}
      disabled={disabled}
    />
  );
};

export default CustomField;

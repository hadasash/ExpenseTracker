import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  LinearProgress,
} from '@mui/material';
import { CloudUpload, Delete, InsertDriveFile } from '@mui/icons-material';

const FileUpload = () => {
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setAdditionalFiles((prevFiles) => {
      const newFiles = files.filter(
        (file) => !prevFiles.some((prevFile) => prevFile.name === file.name)
      );
      return [...prevFiles, ...newFiles];
    });
};


  const handleFileRemove = (index) => {
    setAdditionalFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    additionalFiles.forEach((file) => formData.append("additionalFiles[]", file));

    try {
      setError('');
      setSuccess(false);
      setIsAnalyzing(true);

      const response = await axios.post("http://127.0.0.1:3000/expenses/processExpenses", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Server Response:', response.data);
      setSuccess(true);
    } catch (err) {
      console.error('Error during file upload:', err);
      setError('אירעה שגיאה בעת עיבוד הקבצים. אנא נסה שוב.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={4}>
      <Typography variant="h4" color="primary" gutterBottom>ניתוח חשבוניות AI</Typography>

      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUpload />}
        disabled={isAnalyzing}
      >
        בחר קבצים
        <input hidden type="file" multiple onChange={handleFileChange} />
      </Button>

      <Box width="100%">
        {additionalFiles.map((file, index) => (
          <Paper
            key={index}
            sx={{ display: 'flex', alignItems: 'center', p: 1, mt: 1, backgroundColor: '#f9f9f9' }}
            elevation={2}
          >
            <InsertDriveFile color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ flexGrow: 1 }}>{file.name}</Typography>
            <IconButton onClick={() => handleFileRemove(index)} color="error">
              <Delete />
            </IconButton>
          </Paper>
        ))}
      </Box>

      {isAnalyzing && <LinearProgress sx={{ width: '100%', mt: 2 }} />}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isAnalyzing || additionalFiles.length === 0}
      >
        {isAnalyzing ? 'מעבד...' : 'התחל ניתוח'}
      </Button>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" variant="filled">
          הקבצים עובדו בהצלחה!
        </Alert>
      </Snackbar>

      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileUpload;

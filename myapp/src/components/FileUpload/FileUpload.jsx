// export default FileUpload;
import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Paper, IconButton, LinearProgress } from '@mui/material';
import { CloudUpload, Delete, InsertDriveFile } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from '../SharedSnackbar';
import { useTranslation } from 'react-i18next';

const FileUpload = () => {
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();

  // פונקציה לעיבוד קבצים שנגררו
  const onDrop = (acceptedFiles) => {
    setAdditionalFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.filter(
        (file) => !prevFiles.some((prevFile) => prevFile.name === file.name)
      ),
    ]);
  };

  // שימוש ב-react-dropzone כדי לאפשר גרירה ושחרור
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    accept: '.pdf,.jpg,.png', // אפשר להגדיר את סוגי הקבצים המתקבלים
  });

  const handleFileRemove = (index) => {
    setAdditionalFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    additionalFiles.forEach((file) => formData.append("additionalFile", file));
  
    try {
      setIsAnalyzing(true);
  
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/expenses/processExpenses`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('Server Response:', response.data);
      openSnackbar(t('fileUpload.success'), 'success');
      setAdditionalFiles([]); // Clear files after success
    } catch (err) {
      console.error('Error during file upload:', err);
  
      if (err.response && err.response.data) {
        const { message } = err.response.data;
  
        if (message === 'Invoice already exists') {
          const { uniqueInvoiceId } = err.response.data;
          openSnackbar(`${t('fileUpload.invoiceExists')} ${uniqueInvoiceId}`, 'error');
        } else if (message === 'Salary slip already exists') {
          const { uniqueSalarySlipId } = err.response.data;
          openSnackbar(`${t('fileUpload.salarySlipExists')} ${uniqueSalarySlipId}`, 'error');
        } else {
          openSnackbar(t('fileUpload.error'), 'error');
        }
      } else {
        openSnackbar(t('fileUpload.error'), 'error');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };   

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={4} sx={{ width: '80%', margin: '0 auto' }}>

      <Box
        {...getRootProps()}
        sx={{
          width: '100%',
          padding: 3, // הגדלת השוליים
          border: '2px dashed #62B5E5',
          borderRadius: 2,
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': { backgroundColor: '#def2ff' },
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload 
          color="primary" 
          sx={{ fontSize: 60, mb: 2, opacity: 0.7 }} 
        />
        <Typography variant="h6" color="primary">גרור ושחרר קבצים כאן</Typography>
        <Typography variant="body2" color="textSecondary">או לחץ לבחירת קבצים</Typography>
      </Box>

      <Box width="100%">
        {additionalFiles.map((file, index) => (
          <Paper
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2, // הגדלת השוליים
              mt: 1,
              backgroundColor: '#f9f9f9',
              borderRadius: 1,
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: 4 },
            }}
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
        sx={{ mt: 2 }}
      >
        {isAnalyzing ? t('loading') : t('startAnalysis')}
      </Button>
    </Box>
  );
};

export default FileUpload;

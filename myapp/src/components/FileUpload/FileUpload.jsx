import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Alert,
  LinearProgress,
} from '@mui/material';
import { CloudUpload, DeleteOutline, InsertDriveFile } from '@mui/icons-material';

const FileUpload = () => {
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (acceptedFiles) => {
    setAdditionalFiles((prevFiles) => {
      const newFiles = acceptedFiles.filter(
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
    additionalFiles.forEach((file) => formData.append('additionalFiles[]', file));

    try {
      setError('');
      setSuccess(false);
      setIsAnalyzing(true);

      const response = await axios.post('http://127.0.0.1:3000/invoices/processInvoices', formData, {
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

  // Set up the dropzone configuration
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileChange,
    multiple: true,
    accept: '.pdf,.jpg,.jpeg,.png,.docx',
  });

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={4} p={4}>
      <Card sx={{ width: '100%' }}>
        <CardHeader
          title="העלאת חשבוניות למערכת"
          titleTypographyProps={{ variant: 'h4', color: 'primary.main' }}
          sx={{ pb: 0 }}
        />
        <Divider />
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              border: '2px dashed #0563B0',
              borderRadius: 2,
              p: 3,
              backgroundColor: '#f0f8ff',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#e1f5fe',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ color: 'primary.main', fontSize: 40, mb: 2 }} />
            <Typography variant="h6" color="primary.main">
              גרור ושחרר קבצים כאן
            </Typography>
            <Typography variant="body2" color="textSecondary">
              או לחץ כדי לבחור קבצים
            </Typography>
          </Box>

          {additionalFiles.length > 0 && (
            <Box mt={2}>
              <Typography variant="h6" color="primary.main" gutterBottom>
                קבצים שנבחרו
              </Typography>
              <Box>
                {additionalFiles.map((file, index) => (
                  <Card key={index} sx={{ display: 'flex', alignItems: 'center', p: 1, mt: 1 }}>
                    <InsertDriveFile color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </Typography>
                    <IconButton onClick={() => handleFileRemove(index)} color="error">
                      <DeleteOutline />
                    </IconButton>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {isAnalyzing && (
            <Box mt={2}>
              <LinearProgress />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                מעבד...
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isAnalyzing || additionalFiles.length === 0}
              startIcon={<CloudUpload />}
            >
              התחל ניתוח
            </Button>
          </Box>
        </CardContent>
      </Card>

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
// import React, { useState } from 'react';
// import axios from 'axios';
// import {
//   Box,
//   Button,
//   Typography,
//   Paper,
//   IconButton,
//   Snackbar,
//   Alert,
//   LinearProgress,
// } from '@mui/material';
// import { CloudUpload, Delete, InsertDriveFile } from '@mui/icons-material';

// const FileUpload = () => {
//   const [additionalFiles, setAdditionalFiles] = useState([]);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);

//   const handleFileChange = (event) => {
//     const files = Array.from(event.target.files);
//     setAdditionalFiles((prevFiles) => {
//       const newFiles = files.filter(
//         (file) => !prevFiles.some((prevFile) => prevFile.name === file.name)
//       );
//       return [...prevFiles, ...newFiles];
//     });
//   };

//   const handleFileRemove = (index) => {
//     setAdditionalFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async () => {
//     const formData = new FormData();
//     additionalFiles.forEach((file) => formData.append("additionalFile", file));

//     try {
//       setError('');
//       setSuccess(false);
//       setIsAnalyzing(true);

//       const response = await axios.post("http://127.0.0.1:3000/expenses/processExpenses", formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       console.log('Server Response:', response.data);
//       setSuccess(true);
//     } catch (err) {
//       console.error('Error during file upload:', err);
//       setError('אירעה שגיאה בעת עיבוד הקבצים. אנא נסה שוב.');
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const handleSuccessClose = () => {
//     setSuccess(false);
//     setAdditionalFiles([]); // Clear files after success message
//   };

//   return (
//     <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={4}>
//       <Typography variant="h4" color="primary" gutterBottom>ניתוח חשבוניות AI</Typography>

//       <Button
//         variant="contained"
//         component="label"
//         startIcon={<CloudUpload />}
//         disabled={isAnalyzing}
//       >
//         בחר קבצים
//         <input hidden type="file" multiple onChange={handleFileChange} />
//       </Button>

//       <Box width="100%">
//         {additionalFiles.map((file, index) => (
//           <Paper
//             key={index}
//             sx={{ display: 'flex', alignItems: 'center', p: 1, mt: 1, backgroundColor: '#f9f9f9' }}
//             elevation={2}
//           >
//             <InsertDriveFile color="primary" sx={{ mr: 1 }} />
//             <Typography variant="body2" sx={{ flexGrow: 1 }}>{file.name}</Typography>
//             <IconButton onClick={() => handleFileRemove(index)} color="error">
//               <Delete />
//             </IconButton>
//           </Paper>
//         ))}
//       </Box>

//       {isAnalyzing && <LinearProgress sx={{ width: '100%', mt: 2 }} />}

//       <Button
//         variant="contained"
//         color="primary"
//         onClick={handleSubmit}
//         disabled={isAnalyzing || additionalFiles.length === 0}
//       >
//         {isAnalyzing ? 'מעבד...' : 'התחל ניתוח'}
//       </Button>

//       <Snackbar open={success} autoHideDuration={3000} onClose={handleSuccessClose}>
//         <Alert onClose={handleSuccessClose} severity="success" variant="filled">
//           הקבצים עובדו בהצלחה!
//         </Alert>
//       </Snackbar>

//       <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError('')}>
//         <Alert onClose={() => setError('')} severity="error" variant="filled">
//           {error}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default FileUpload;
import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Paper, IconButton, Snackbar, Alert, LinearProgress } from '@mui/material';
import { CloudUpload, Delete, InsertDriveFile } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const FileUpload = () => {
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleSuccessClose = () => {
    setSuccess(false);
    setAdditionalFiles([]); // Clear files after success message
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
              boxShadow: 2,
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
        {isAnalyzing ? 'מעבד...' : 'התחל ניתוח'}
      </Button>

      <Snackbar open={success} autoHideDuration={3000} onClose={handleSuccessClose}>
        <Alert onClose={handleSuccessClose} severity="success" variant="filled">
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

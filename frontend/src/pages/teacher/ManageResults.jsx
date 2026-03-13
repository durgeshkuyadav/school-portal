import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Grid, Alert, Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import { academicApi } from '../../api/services';

const ManageResults = () => {
  const [examId, setExamId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [marks, setMarks] = useState('');
  const [remarks, setRemarks] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const showMsg = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const handleSave = async () => {
    if (!examId || !studentId || !marks) {
      showMsg('Exam ID, Student ID aur Marks zaroori hain!', 'error');
      return;
    }
    setLoading(true);
    try {
      await academicApi.saveResult(examId, {
        studentId: Number(studentId),
        studentName,
        marksObtained: Number(marks),
        remarks,
      });
      showMsg('✅ Result save ho gaya!');
      setStudentId(''); setStudentName(''); setMarks(''); setRemarks('');
    } catch {
      showMsg('❌ Error aaya, dobara try karo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!examId) { showMsg('Exam ID daalo!', 'error'); return; }
    setLoading(true);
    try {
      await academicApi.publishResults(examId);
      showMsg('🎉 Results publish ho gaye! Students ab dekh sakte hain.');
    } catch {
      showMsg('❌ Publish mein error aaya', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3} color="#1E3A5F">
        📝 Student Results Update Karo
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Marks Enter Karo
              </Typography>

              <TextField
                fullWidth label="Exam ID" value={examId}
                onChange={e => setExamId(e.target.value)}
                sx={{ mb: 2 }} type="number"
                helperText="Exam ka ID daalo"
              />
              <TextField
                fullWidth label="Student ID" value={studentId}
                onChange={e => setStudentId(e.target.value)}
                sx={{ mb: 2 }} type="number"
              />
              <TextField
                fullWidth label="Student Ka Naam" value={studentName}
                onChange={e => setStudentName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth label="Marks Milaye" value={marks}
                onChange={e => setMarks(e.target.value)}
                sx={{ mb: 2 }} type="number"
                helperText="Kitne marks mile student ko"
              />
              <TextField
                fullWidth label="Remarks (Optional)" value={remarks}
                onChange={e => setRemarks(e.target.value)}
                sx={{ mb: 3 }} multiline rows={2}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth variant="contained" startIcon={<SaveIcon />}
                    onClick={handleSave} disabled={loading}
                    sx={{ bgcolor: '#27AE60', '&:hover': { bgcolor: '#219A52' } }}
                  >
                    Save Karo
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth variant="contained" startIcon={<PublishIcon />}
                    onClick={handlePublish} disabled={loading}
                    sx={{ bgcolor: '#1E3A5F', '&:hover': { bgcolor: '#2980B9' } }}
                  >
                    Publish Karo
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 2, bgcolor: '#FFF8E1', border: '1px solid #F39C12' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2} color="#E67E22">
                ℹ️ Kaise Use Karein
              </Typography>
              <Typography color="text.secondary" mb={1}>
                <strong>1. Exam ID daalo</strong> — Admin ne jo exam banaya uska ID
              </Typography>
              <Typography color="text.secondary" mb={1}>
                <strong>2. Student ID daalo</strong> — Student ka system ID
              </Typography>
              <Typography color="text.secondary" mb={1}>
                <strong>3. Marks daalo</strong> — Kitne marks mile
              </Typography>
              <Typography color="text.secondary" mb={1}>
                <strong>4. "Save Karo"</strong> dabao — Result save hoga
              </Typography>
              <Typography color="text.secondary" mb={2}>
                <strong>5. "Publish Karo"</strong> — Tab students dekh sakte hain
              </Typography>
              <Alert severity="warning">
                Publish karne ke baad hi students result dekh sakte hain!
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageResults;

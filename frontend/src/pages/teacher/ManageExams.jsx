import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField,
  Button, Select, MenuItem, FormControl, InputLabel,
  Grid, Alert, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { academicApi } from '../../api/services';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const ManageExams = () => {
  const user = useSelector(selectUser);
  const [form, setForm] = useState({
    name: '', examType: 'UNIT_TEST', classId: '', subjectId: '',
    subjectName: '', className: '', totalMarks: '', passingMarks: '',
    examDate: '', academicYear: '2025-2026'
  });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const showMsg = (msg, sev = 'success') => setSnack({ open: true, msg, severity: sev });
  const handleChange = f => e => setForm({ ...form, [f]: e.target.value });

  const handleCreate = async () => {
    if (!form.name || !form.classId || !form.totalMarks || !form.examDate) {
      showMsg('Zaroori fields bhari nahi hain!', 'error'); return;
    }
    setLoading(true);
    try {
      await academicApi.createExam({
        ...form,
        classId: Number(form.classId),
        subjectId: Number(form.subjectId),
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
      });
      showMsg('✅ Exam create ho gaya!');
      setForm({ name: '', examType: 'UNIT_TEST', classId: '', subjectId: '',
        subjectName: '', className: '', totalMarks: '', passingMarks: '',
        examDate: '', academicYear: '2025-2026' });
    } catch {
      showMsg('❌ Error aaya', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3} color="#1E3A5F">
        📋 Exam Create Karo
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Exam Ka Naam *"
                    value={form.name} onChange={handleChange('name')}
                    placeholder="Jaise: Unit Test 1, Mid Term" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Exam Type</InputLabel>
                    <Select value={form.examType} label="Exam Type" onChange={handleChange('examType')}>
                      <MenuItem value="UNIT_TEST">Unit Test</MenuItem>
                      <MenuItem value="MID_TERM">Mid Term</MenuItem>
                      <MenuItem value="FINAL">Final Exam</MenuItem>
                      <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                      <MenuItem value="HALF_YEARLY">Half Yearly</MenuItem>
                      <MenuItem value="ANNUAL">Annual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Exam Date *" type="date"
                    value={form.examDate} onChange={handleChange('examDate')}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Class ID *" type="number"
                    value={form.classId} onChange={handleChange('classId')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Class Ka Naam"
                    value={form.className} onChange={handleChange('className')}
                    placeholder="Jaise: Class 3A" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Subject ID"
                    type="number" value={form.subjectId} onChange={handleChange('subjectId')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Subject Ka Naam"
                    value={form.subjectName} onChange={handleChange('subjectName')}
                    placeholder="Jaise: Mathematics" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Total Marks *" type="number"
                    value={form.totalMarks} onChange={handleChange('totalMarks')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Passing Marks" type="number"
                    value={form.passingMarks} onChange={handleChange('passingMarks')}
                    helperText="Pass hone ke liye minimum marks" />
                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth variant="contained" startIcon={<AddIcon />}
                    onClick={handleCreate} disabled={loading} size="large"
                    sx={{ bgcolor: '#1E3A5F', py: 1.5 }}>
                    {loading ? 'Ban Raha Hai...' : 'Exam Create Karo'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card elevation={2} sx={{ borderRadius: 2, bgcolor: '#E3F2FD' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2} color="#1E3A5F">
                📌 Steps
              </Typography>
              <Typography mb={1} color="text.secondary">
                <strong>1.</strong> Exam create karo (yahan se)
              </Typography>
              <Typography mb={1} color="text.secondary">
                <strong>2.</strong> "Results Update" page pe jao
              </Typography>
              <Typography mb={1} color="text.secondary">
                <strong>3.</strong> Har student ke marks daalo
              </Typography>
              <Typography mb={1} color="text.secondary">
                <strong>4.</strong> "Publish Karo" dabao
              </Typography>
              <Typography color="text.secondary">
                <strong>5.</strong> Students apna result dekh sakte hain ✅
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageExams;

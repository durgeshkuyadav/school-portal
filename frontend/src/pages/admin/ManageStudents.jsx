import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  CircularProgress, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { studentApi } from '../../api/services';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', admissionNumber: '',
    classId: '', rollNumber: '', guardianName: '',
    guardianPhone: '', academicYear: '2025-2026', gender: 'MALE'
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentApi.getAll();
      setStudents(res.data?.content || res.data || []);
    } catch { setStudents([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleChange = f => e => setForm({ ...form, [f]: e.target.value });

  const handleCreate = async () => {
    try {
      await studentApi.create({
        ...form,
        classId: Number(form.classId),
        rollNumber: Number(form.rollNumber)
      });
      setOpen(false);
      fetchStudents();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.message || 'Try again'));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1E3A5F">
          👨‍🎓 Students
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => setOpen(true)} sx={{ bgcolor: '#1E3A5F' }}>
          Naya Student
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : students.length === 0 ? (
        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">
              Koi student nahi mila. "Naya Student" se add karo.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1E3A5F' }}>
                {['Naam', 'Admission No.', 'Class', 'Status'].map(h => (
                  <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s, i) => (
                <TableRow key={s.id || i} sx={{ '&:nth-of-type(odd)': { bgcolor: '#F5F7FA' } }}>
                  <TableCell>{s.firstName} {s.lastName}</TableCell>
                  <TableCell>{s.admissionNumber}</TableCell>
                  <TableCell>{s.className} - {s.section}</TableCell>
                  <TableCell>
                    <Chip label={s.status} color={s.status === 'ACTIVE' ? 'success' : 'default'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Student Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1E3A5F', color: 'white' }}>
          Naya Student Add Karo
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            {[
              { f: 'firstName', l: 'Pehla Naam *' },
              { f: 'lastName', l: 'Aakhri Naam *' },
              { f: 'admissionNumber', l: 'Admission Number *' },
              { f: 'classId', l: 'Class ID *', t: 'number' },
              { f: 'rollNumber', l: 'Roll Number *', t: 'number' },
              { f: 'guardianName', l: 'Guardian Ka Naam' },
              { f: 'guardianPhone', l: 'Guardian Ka Phone' },
            ].map(({ f, l, t }) => (
              <Grid item xs={12} sm={6} key={f}>
                <TextField fullWidth label={l} type={t || 'text'}
                  value={form[f]} onChange={handleChange(f)} size="small" />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#1E3A5F' }}>
            Save Karo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageStudents;

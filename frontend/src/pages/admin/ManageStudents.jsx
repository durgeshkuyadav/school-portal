import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  CircularProgress, Chip, Alert, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { studentApi, classApi } from '../../api/services';
import { toast } from 'react-toastify';

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', admissionNumber: '',
    classId: '', rollNumber: '', guardianName: '',
    guardianPhone: '', academicYear: '2025-2026', gender: 'MALE'
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [studRes, clsRes] = await Promise.allSettled([
        studentApi.getAll(),
        classApi.getAll(),
      ]);
      if (studRes.status === 'fulfilled')
        setStudents(studRes.value.data?.content || studRes.value.data || []);
      if (clsRes.status === 'fulfilled')
        setClasses(Array.isArray(clsRes.value.data) ? clsRes.value.data : []);
    } catch { setStudents([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = f => e => setForm({ ...form, [f]: e.target.value });

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.admissionNumber || !form.classId) {
      setError('Naam, Admission Number aur Class zaroori hain!');
      return;
    }
    setSaving(true); setError('');
    try {
      await studentApi.create({
        ...form,
        classId: Number(form.classId),
        rollNumber: form.rollNumber ? Number(form.rollNumber) : 1,
      });
      toast.success('Student add ho gaya!');
      setOpen(false);
      setForm({ firstName:'', lastName:'', admissionNumber:'', classId:'', rollNumber:'', guardianName:'', guardianPhone:'', academicYear:'2025-2026', gender:'MALE' });
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Error aaya, dobara try karo');
    } finally { setSaving(false); }
  };

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#1E3A5F">👨‍🎓 Students</Typography>
          <Typography variant="body2" color="text.secondary">{students.length} students registered</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setOpen(true); setError(''); }}
          sx={{ bgcolor: '#1E3A5F' }}>
          Naya Student
        </Button>
      </Box>

      {/* No classes warning */}
      {classes.length === 0 && !loading && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ Pehle <strong>Classes</strong> page pe jaake class banao, phir student add karo!
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display:'flex', justifyContent:'center', mt:5 }}><CircularProgress /></Box>
      ) : students.length === 0 ? (
        <Card elevation={2} sx={{ borderRadius:2 }}>
          <CardContent sx={{ textAlign:'center', py:6 }}>
            <Typography color="text.secondary">Koi student nahi mila. "Naya Student" se add karo.</Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius:2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor:'#1E3A5F' }}>
                {['Naam', 'Admission No.', 'Class', 'Guardian', 'Status'].map(h => (
                  <TableCell key={h} sx={{ color:'white', fontWeight:'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s, i) => (
                <TableRow key={s.id || i} sx={{ '&:nth-of-type(odd)':{ bgcolor:'#F5F7FA' } }}>
                  <TableCell><strong>{s.firstName} {s.lastName}</strong></TableCell>
                  <TableCell>{s.admissionNumber}</TableCell>
                  <TableCell>{s.className || `Class ${s.classId}`} {s.section ? `- ${s.section}` : ''}</TableCell>
                  <TableCell>{s.guardianName || '—'}</TableCell>
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
        <DialogTitle sx={{ bgcolor:'#1E3A5F', color:'white', fontWeight:700 }}>
          ➕ Naya Student Add Karo
        </DialogTitle>
        <DialogContent sx={{ pt:3 }}>
          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
          {classes.length === 0 && (
            <Alert severity="warning" sx={{ mb:2 }}>
              Pehle Classes page se class banao!
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth label="Pehla Naam *" value={form.firstName}
                onChange={handleChange('firstName')} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Aakhri Naam *" value={form.lastName}
                onChange={handleChange('lastName')} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Admission Number *" value={form.admissionNumber}
                onChange={handleChange('admissionNumber')} size="small"
                placeholder="Jaise: ADM2025001" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Class *" value={form.classId}
                onChange={handleChange('classId')} size="small">
                {classes.length === 0
                  ? <MenuItem disabled value="">Pehle class banao</MenuItem>
                  : classes.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} {c.section ? `- ${c.section}` : ''} ({c.academicYear})
                    </MenuItem>
                  ))
                }
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Roll Number" type="number"
                value={form.rollNumber} onChange={handleChange('rollNumber')} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Gender" value={form.gender}
                onChange={handleChange('gender')} size="small">
                {GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Guardian Ka Naam" value={form.guardianName}
                onChange={handleChange('guardianName')} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Guardian Ka Phone" value={form.guardianPhone}
                onChange={handleChange('guardianPhone')} size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Academic Year" value={form.academicYear}
                onChange={handleChange('academicYear')} size="small">
                <MenuItem value="2025-2026">2025-2026</MenuItem>
                <MenuItem value="2026-2027">2026-2027</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}
            disabled={saving || classes.length === 0} sx={{ bgcolor:'#1E3A5F' }}>
            {saving ? <CircularProgress size={20} /> : 'Save Karo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageStudents;
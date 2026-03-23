import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Avatar, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClassIcon from '@mui/icons-material/Class';
import { classApi } from '../../api/services';
import { toast } from 'react-toastify';

const CLASSES = ['Play Group', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const CLASS_COLORS = {
  'Play Group': '#E91E63', 'Nursery': '#9C27B0', 'KG': '#3F51B5',
  'Class 1': '#2196F3', 'Class 2': '#009688', 'Class 3': '#4CAF50',
  'Class 4': '#FF9800', 'Class 5': '#F44336',
};

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name:'Class 1', section:'A', academicYear:'2025-2026', maxStudents:40 });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await classApi.getAll();
      setClasses(Array.isArray(res.data) ? res.data : res.data?.content || []);
    } catch { setClasses([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleCreate = async () => {
    setSaving(true); setError('');
    try {
      await classApi.create({ ...form, maxStudents: Number(form.maxStudents) });
      toast.success(`${form.name} - ${form.section} class ban gayi!`);
      setDialogOpen(false);
      fetchClasses();
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Class create karne mein error aaya');
    } finally { setSaving(false); }
  };

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:5 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#1E3A5F">🏫 Classes</Typography>
          <Typography variant="body2" color="text.secondary">
            Play Group se Class 5 tak — {classes.length} class{classes.length !== 1 ? 'es' : ''} bani hain
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setDialogOpen(true); setError(''); }}
          sx={{ bgcolor:'#1E3A5F' }}>
          Nayi Class
        </Button>
      </Box>

      {/* Instruction alert when no classes */}
      {classes.length === 0 && (
        <Alert severity="info" sx={{ mb:3 }}>
          💡 Students add karne se pehle yahan se class banao. Class ID automatically assign hoga.
        </Alert>
      )}

      {classes.length === 0 ? (
        <Card elevation={2} sx={{ borderRadius:2 }}>
          <CardContent sx={{ textAlign:'center', py:8 }}>
            <ClassIcon sx={{ fontSize:64, color:'#2980B9', mb:2 }} />
            <Typography variant="h6" color="text.secondary" mb={2}>Abhi koi class nahi hai</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}
              sx={{ bgcolor:'#1E3A5F' }}>
              Pehli Class Banao
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {classes.map((cls, i) => {
            const color = CLASS_COLORS[cls.name] || '#1E3A5F';
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={cls.id || i}>
                <Card elevation={2} sx={{
                  borderRadius:2, textAlign:'center',
                  borderTop:`4px solid ${color}`,
                  '&:hover':{ boxShadow:6, transform:'translateY(-2px)', transition:'0.2s' }
                }}>
                  <CardContent sx={{ py:3 }}>
                    <Avatar sx={{ width:56, height:56, mx:'auto', mb:1.5, bgcolor:color, fontSize:20 }}>
                      {cls.name?.slice(0, 2)}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">{cls.name}</Typography>
                    <Typography variant="body2" color="text.secondary">Section: {cls.section}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>{cls.academicYear}</Typography>
                    <Box sx={{ display:'flex', gap:0.5, justifyContent:'center', flexWrap:'wrap' }}>
                      <Chip label={`ID: ${cls.id}`} size="small" variant="outlined" color="primary" />
                      <Chip label={`${cls.capacity || 40} seats`} size="small" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create Class Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor:'#1E3A5F', color:'white', fontWeight:700 }}>🏫 Nayi Class Banao</DialogTitle>
        <DialogContent sx={{ pt:3, display:'flex', flexDirection:'column', gap:2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField select label="Class Ka Naam *" fullWidth
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}>
            {CLASSES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField select label="Section" fullWidth
            value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}>
            {SECTIONS.map(s => <MenuItem key={s} value={s}>Section {s}</MenuItem>)}
          </TextField>
          <TextField select label="Academic Year" fullWidth
            value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })}>
            <MenuItem value="2025-2026">2025-2026</MenuItem>
            <MenuItem value="2026-2027">2026-2027</MenuItem>
          </TextField>
          <TextField label="Max Students" type="number" fullWidth
            value={form.maxStudents} onChange={e => setForm({ ...form, maxStudents: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving} sx={{ bgcolor:'#1E3A5F' }}>
            {saving ? <CircularProgress size={20} /> : 'Create Karo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageClasses;
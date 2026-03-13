import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClassIcon from '@mui/icons-material/Class';
import { classApi } from '../../api/services';
import { toast } from 'react-toastify';

const CLASSES = ['Play Group', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: 'Class 1', section: 'A', academicYear: '2025-2026', maxStudents: 40 });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await classApi.getAll();
      setClasses(Array.isArray(res.data) ? res.data : res.data?.content || []);
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleCreate = async () => {
    try {
      await classApi.create({ ...form, maxStudents: Number(form.maxStudents) });
      toast.success('Class created!');
      setDialogOpen(false);
      fetchClasses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create class');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#1E3A5F">🏫 Manage Classes</Typography>
          <Typography variant="body2" color="text.secondary">Play Group se Class 5 tak</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: '#1E3A5F' }}>
          Nayi Class
        </Button>
      </Box>

      {classes.length === 0 ? (
        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <ClassIcon sx={{ fontSize: 64, color: '#2980B9', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={2}>
              Abhi koi class nahi hai
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Pehli class banao — Play Group, Nursery, KG, ya Class 1-5
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}
              sx={{ bgcolor: '#1E3A5F' }}>
              Pehli Class Banao
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {classes.map((cls, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={cls.id || i}>
              <Card elevation={2} sx={{ borderRadius: 2, textAlign: 'center',
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)', transition: '0.2s' } }}>
                <CardContent sx={{ py: 3 }}>
                  <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 1.5, bgcolor: '#1E3A5F', fontSize: 20 }}>
                    {cls.name?.slice(0, 2)}
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">{cls.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Section: {cls.section}</Typography>
                  <Typography variant="body2" color="text.secondary">{cls.academicYear}</Typography>
                  <Chip label={`Capacity: ${cls.capacity || 40} students`} size="small" sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Class Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1E3A5F', color: 'white' }}>Nayi Class Banao</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#1E3A5F' }}>
            Create Karo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageClasses;

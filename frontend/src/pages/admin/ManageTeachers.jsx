import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar,
  Button, CircularProgress, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert,
  IconButton, Tooltip, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import apiClient from '../../api/apiClient';

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '',
  designation: '', qualification: '', subjectsTaught: '',
  bio: '', joiningDate: '', userId: ''
};

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/teachers');
      setTeachers(Array.isArray(data) ? data : []);
    } catch { setTeachers([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTeachers(); }, [loadTeachers]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(''); setDialogOpen(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({
      firstName: t.firstName || '', lastName: t.lastName || '',
      email: t.email || '', phone: t.phone || '',
      designation: t.designation || '', qualification: t.qualification || '',
      subjectsTaught: t.subjectsTaught || '', bio: t.bio || '',
      joiningDate: t.joiningDate || '', userId: t.userId || ''
    });
    setError(''); setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) { setError('First name aur last name required hai'); return; }
    setSaving(true); setError('');
    try {
      if (editing) { await apiClient.put(`/teachers/${editing.id}`, form); }
      else { await apiClient.post('/teachers', form); }
      setDialogOpen(false); loadTeachers();
    } catch (e) { setError(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Is teacher ko deactivate karein?')) return;
    try { await apiClient.delete(`/teachers/${id}`); loadTeachers(); }
    catch { setError('Delete failed'); }
  };

  const f = (key) => ({ value: form[key], onChange: (e) => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Teachers Manage Karo</Typography>
          <Typography variant="body2" color="text.secondary">{teachers.length} teacher{teachers.length !== 1 ? 's' : ''} registered</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Naya Teacher</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
      ) : teachers.length === 0 ? (
        <Card><CardContent sx={{ textAlign: 'center', py: 8 }}>
          <PersonIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography color="text.secondary">Koi teacher nahi mila</Typography>
          <Button variant="contained" sx={{ mt: 2 }} startIcon={<AddIcon />} onClick={openAdd}>Pehla Teacher Add Karo</Button>
        </CardContent></Card>
      ) : (
        <Grid container spacing={3}>
          {teachers.map((t) => (
            <Grid item xs={12} sm={6} md={4} key={t.id}>
              <Card elevation={2} sx={{ borderRadius: 2, borderTop: `4px solid ${t.isActive ? '#16A085' : '#95A5A6'}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#1E3A5F', width: 48, height: 48 }}>
                        {t.firstName?.[0]?.toUpperCase() || 'T'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="bold">{t.firstName} {t.lastName}</Typography>
                        <Typography variant="caption" color="text.secondary">{t.designation || 'Teacher'}</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(t)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Deactivate"><IconButton size="small" color="error" onClick={() => handleDelete(t.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 1.5 }} />
                  {t.email && <Typography variant="body2" color="text.secondary" mb={0.5}>📧 {t.email}</Typography>}
                  {t.phone && <Typography variant="body2" color="text.secondary" mb={0.5}>📞 {t.phone}</Typography>}
                  {t.qualification && <Typography variant="body2" color="text.secondary" mb={0.5}>🎓 {t.qualification}</Typography>}
                  {t.subjectsTaught && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {t.subjectsTaught.split(',').map((s, i) => (
                        <Chip key={i} label={s.trim()} size="small" variant="outlined" color="primary" />
                      ))}
                    </Box>
                  )}
                  <Box sx={{ mt: 1.5 }}>
                    <Chip size="small" label={t.isActive ? 'Active' : 'Inactive'} color={t.isActive ? 'success' : 'default'} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Teacher Update Karo' : 'Naya Teacher Add Karo'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField fullWidth label="First Name *" {...f('firstName')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Last Name *" {...f('lastName')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Email" type="email" {...f('email')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Phone" {...f('phone')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Designation" placeholder="Class Teacher / Subject Teacher" {...f('designation')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Qualification" placeholder="M.Sc Mathematics" {...f('qualification')} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Subjects Taught (comma separated)" placeholder="Math, Science, English" {...f('subjectsTaught')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Joining Date" type="date" InputLabelProps={{ shrink: true }} {...f('joiningDate')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="User ID (auth-service)" type="number" {...f('userId')} helperText="Login userId link karo" /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Bio" multiline rows={2} {...f('bio')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : editing ? 'Update' : 'Add Teacher'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageTeachers;

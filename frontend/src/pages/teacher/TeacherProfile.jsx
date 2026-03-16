import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress,
  Chip, Tabs, Tab, Divider, IconButton, Tooltip, Paper, LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import apiClient from '../../api/apiClient';
import { useAppSettings } from '../context/AppSettingsContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

/* ═══════════════════════════════════════════════════════════════════
   TEACHER PROFILE — View & Edit
   Access: Admin (all), Teacher (own profile)
   ═══════════════════════════════════════════════════════════════════ */

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  designation: '', qualification: '', subjectsTaught: '',
  bio: '', joiningDate: '', experienceYears: '', address: '',
  gender: 'MALE', dob: '', photoUrl: '', userId: ''
};

function InfoRow({ icon, label, value, isDark }) {
  if (!value) return null;
  const text = isDark ? '#e0e0e0' : '#333';
  const sub = isDark ? '#9090b0' : '#666';
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1 }}>
      <Box sx={{ color: '#1565C0', mt: 0.2 }}>{icon}</Box>
      <Box>
        <Typography fontSize={11} color={sub} fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>{label}</Typography>
        <Typography fontSize={14} color={text} fontWeight={500}>{value}</Typography>
      </Box>
    </Box>
  );
}

function PhotoUpload({ photoUrl, onPhotoChange, t, isDark }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      onPhotoChange(ev.target.result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={photoUrl}
          sx={{
            width: 100, height: 100,
            border: '3px solid #1565C0',
            boxShadow: '0 4px 16px rgba(21,101,192,0.25)',
            bgcolor: '#1565C0',
            fontSize: 36,
          }}
        >
          {!photoUrl && <PersonIcon sx={{ fontSize: 48 }} />}
        </Avatar>
        <Tooltip title={t.uploadPhoto}>
          <IconButton
            size="small"
            onClick={() => fileRef.current.click()}
            sx={{
              position: 'absolute', bottom: -2, right: -2,
              bgcolor: '#1565C0', color: '#fff', width: 30, height: 30,
              '&:hover': { bgcolor: '#0d47a1' },
            }}
          >
            <PhotoCameraIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {uploading && <CircularProgress size={16} />}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <Typography fontSize={11} color={isDark ? '#9090b0' : '#888'}>
        {t.changePhoto}
      </Typography>
    </Box>
  );
}

export default function TeacherProfile({ standalone = false }) {
  const { t, isDark } = useAppSettings();
  const user = useSelector(selectUser);
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SCHOOL_ADMIN';

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [editTeacher, setEditTeacher] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const bg = isDark ? '#0d1117' : '#f5f7ff';
  const card = isDark ? '#161b27' : '#fff';
  const border = isDark ? '#2d3348' : '#e8eaf6';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub = isDark ? '#8892a4' : '#64748b';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/teachers');
      setTeachers(Array.isArray(data) ? data : []);
    } catch { setTeachers([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openView = (teacher) => { setViewTeacher(teacher); setTab(0); };
  const openEdit = (teacher) => {
    setEditTeacher(teacher);
    setForm({
      firstName: teacher.firstName || '', lastName: teacher.lastName || '',
      email: teacher.email || '', phone: teacher.phone || '',
      designation: teacher.designation || '', qualification: teacher.qualification || '',
      subjectsTaught: teacher.subjectsTaught || '', bio: teacher.bio || '',
      joiningDate: teacher.joiningDate?.substring(0, 10) || '',
      experienceYears: teacher.experienceYears || '',
      address: teacher.address || '', gender: teacher.gender || 'MALE',
      dob: teacher.dob?.substring(0, 10) || '',
      photoUrl: teacher.photoUrl || '', userId: teacher.userId || ''
    });
    setError(''); setSuccess('');
  };
  const openAdd = () => { setEditTeacher('new'); setForm(EMPTY_FORM); setError(''); setSuccess(''); };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError(t.firstName + ' / ' + t.lastName + ' required'); return;
    }
    setSaving(true); setError('');
    try {
      if (editTeacher === 'new') await apiClient.post('/teachers', form);
      else await apiClient.put(`/teachers/${editTeacher.id}`, form);
      setSuccess(t.success + '!');
      setTimeout(() => { setEditTeacher(null); setSuccess(''); load(); }, 800);
    } catch (e) { setError(e.response?.data?.error || t.error); }
    finally { setSaving(false); }
  };

  const filtered = teachers.filter(tc =>
    search === '' ||
    `${tc.firstName} ${tc.lastName} ${tc.designation} ${tc.subjectsTaught}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ bgcolor: bg, minHeight: '100vh', p: standalone ? 3 : 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={text}>
            👨‍🏫 {t.teacherDetails}
          </Typography>
          <Typography fontSize={13} color={sub}>{filtered.length} {t.teachers}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small" placeholder={`🔍 ${t.search}...`}
            value={search} onChange={e => setSearch(e.target.value)}
            sx={{ width: 200, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: card, color: text } }}
          />
          {isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
              sx={{ borderRadius: 3, bgcolor: '#1565C0', textTransform: 'none', fontWeight: 700 }}>
              {t.addTeacher}
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#1565C0' }} />
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((teacher) => (
            <Grid item xs={12} sm={6} md={4} key={teacher.id}>
              <Card sx={{
                bgcolor: card, border: `1px solid ${border}`,
                borderRadius: 3, overflow: 'hidden', cursor: 'pointer',
                transition: 'all .2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(21,101,192,0.15)' },
              }}>
                {/* Color bar */}
                <Box sx={{ height: 5, background: 'linear-gradient(90deg, #1565C0, #6A1B9A)' }} />
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Avatar
                      src={teacher.photoUrl}
                      sx={{ width: 60, height: 60, bgcolor: '#1565C0', border: `2px solid ${border}` }}
                    >
                      {!teacher.photoUrl && <PersonIcon />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700} color={text} fontSize={15}>
                        {teacher.firstName} {teacher.lastName}
                      </Typography>
                      <Chip
                        label={teacher.designation || 'Teacher'}
                        size="small"
                        sx={{ mt: 0.5, bgcolor: isDark ? '#1e3a6e' : '#e3f2fd', color: '#1565C0', fontWeight: 600, fontSize: 11 }}
                      />
                      {teacher.subjectsTaught && (
                        <Typography fontSize={12} color={sub} mt={0.5}>
                          📚 {teacher.subjectsTaught}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {teacher.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                      <EmailIcon sx={{ fontSize: 14, color: sub }} />
                      <Typography fontSize={12} color={sub}>{teacher.email}</Typography>
                    </Box>
                  )}
                  {teacher.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 14, color: sub }} />
                      <Typography fontSize={12} color={sub}>{teacher.phone}</Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small" startIcon={<VisibilityIcon />}
                      variant="outlined" onClick={() => openView(teacher)}
                      sx={{ flex: 1, borderRadius: 2, borderColor: '#1565C0', color: '#1565C0', fontSize: 12 }}
                    >
                      {t.viewProfile}
                    </Button>
                    {(isAdmin || user?.profileId === teacher.id) && (
                      <Button
                        size="small" startIcon={<EditIcon />}
                        variant="contained" onClick={() => openEdit(teacher)}
                        sx={{ flex: 1, borderRadius: 2, bgcolor: '#1565C0', fontSize: 12 }}
                      >
                        {t.editProfile}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {filtered.length === 0 && !loading && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8, color: sub }}>
                <PersonIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                <Typography>{t.teachers}: 0</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* ── VIEW Dialog ── */}
      <Dialog open={!!viewTeacher} onClose={() => setViewTeacher(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: card, borderRadius: 3, border: `1px solid ${border}` } }}>
        {viewTeacher && (
          <>
            <Box sx={{ background: 'linear-gradient(135deg,#0B1F3A,#1565C0)', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar src={viewTeacher.photoUrl}
                    sx={{ width: 80, height: 80, border: '3px solid rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.1)' }}>
                    {!viewTeacher.photoUrl && <PersonIcon sx={{ fontSize: 40 }} />}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={800} color="#fff">
                      {viewTeacher.firstName} {viewTeacher.lastName}
                    </Typography>
                    <Chip label={viewTeacher.designation || 'Teacher'} size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', mt: 0.5 }} />
                  </Box>
                </Box>
                <IconButton onClick={() => setViewTeacher(null)} sx={{ color: '#fff' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            <Tabs value={tab} onChange={(_, v) => setTab(v)}
              sx={{ px: 2, borderBottom: `1px solid ${border}`, '& .MuiTab-root': { color: sub, fontWeight: 600 }, '& .Mui-selected': { color: '#1565C0' } }}>
              <Tab label={t.personalInfo} />
              <Tab label={t.academicInfo} />
              <Tab label={t.contactInfo} />
            </Tabs>

            <DialogContent sx={{ p: 3 }}>
              {tab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoRow icon={<PersonIcon fontSize="small" />} label={t.name} value={`${viewTeacher.firstName} ${viewTeacher.lastName}`} isDark={isDark} />
                    <InfoRow icon={<WorkIcon fontSize="small" />} label={t.gender} value={viewTeacher.gender} isDark={isDark} />
                    <InfoRow icon={<WorkIcon fontSize="small" />} label={t.dob} value={viewTeacher.dob?.substring(0, 10)} isDark={isDark} />
                    <InfoRow icon={<WorkIcon fontSize="small" />} label={t.joinDate} value={viewTeacher.joiningDate?.substring(0, 10)} isDark={isDark} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow icon={<WorkIcon fontSize="small" />} label={t.experience} value={viewTeacher.experienceYears ? `${viewTeacher.experienceYears} years` : null} isDark={isDark} />
                    {viewTeacher.bio && (
                      <Box sx={{ mt: 1 }}>
                        <Typography fontSize={11} color={sub} fontWeight={600} textTransform="uppercase" letterSpacing={0.5} mb={0.5}>{t.bio}</Typography>
                        <Typography fontSize={13} color={text} sx={{ p: 1.5, bgcolor: isDark ? '#1e2a3e' : '#f8f9ff', borderRadius: 2 }}>
                          {viewTeacher.bio}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              )}
              {tab === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoRow icon={<SchoolIcon fontSize="small" />} label={t.designation} value={viewTeacher.designation} isDark={isDark} />
                    <InfoRow icon={<SchoolIcon fontSize="small" />} label={t.qualification} value={viewTeacher.qualification} isDark={isDark} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow icon={<SchoolIcon fontSize="small" />} label={t.subject} value={viewTeacher.subjectsTaught} isDark={isDark} />
                  </Grid>
                </Grid>
              )}
              {tab === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoRow icon={<EmailIcon fontSize="small" />} label={t.email} value={viewTeacher.email} isDark={isDark} />
                    <InfoRow icon={<PhoneIcon fontSize="small" />} label={t.phone} value={viewTeacher.phone} isDark={isDark} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow icon={<PersonIcon fontSize="small" />} label={t.address} value={viewTeacher.address} isDark={isDark} />
                  </Grid>
                </Grid>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* ── EDIT / ADD Dialog ── */}
      <Dialog open={!!editTeacher} onClose={() => setEditTeacher(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: card, borderRadius: 3, border: `1px solid ${border}` } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg,#0B1F3A,#1565C0)', color: '#fff', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editTeacher === 'new' ? `➕ ${t.addTeacher}` : `✏️ ${t.editTeacher}`}
          <IconButton onClick={() => setEditTeacher(null)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {saving && <LinearProgress sx={{ mb: 2 }} />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Grid container spacing={2}>
            {/* Photo upload */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <PhotoUpload
                photoUrl={form.photoUrl}
                onPhotoChange={(url) => setForm(f => ({ ...f, photoUrl: url }))}
                t={t} isDark={isDark}
              />
            </Grid>

            {[
              [t.firstName, 'firstName', 'text'], [t.lastName, 'lastName', 'text'],
              [t.email, 'email', 'email'], [t.phone, 'phone', 'tel'],
              [t.designation, 'designation', 'text'], [t.qualification, 'qualification', 'text'],
              [t.subject, 'subjectsTaught', 'text'], [t.experience, 'experienceYears', 'number'],
              [t.joinDate, 'joiningDate', 'date'], [t.dob, 'dob', 'date'],
              [t.address, 'address', 'text'],
            ].map(([label, field, type]) => (
              <Grid item xs={12} sm={6} key={field}>
                <TextField fullWidth size="small" label={label} type={type}
                  value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  InputLabelProps={type === 'date' ? { shrink: true } : {}}
                  sx={{
                    '& .MuiOutlinedInput-root': { bgcolor: isDark ? '#1e2a3e' : '#fafbff', color: text, borderRadius: 2 },
                    '& .MuiInputLabel-root': { color: sub }
                  }}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label={t.bio}
                value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': { bgcolor: isDark ? '#1e2a3e' : '#fafbff', color: text, borderRadius: 2 },
                  '& .MuiInputLabel-root': { color: sub }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${border}` }}>
          <Button onClick={() => setEditTeacher(null)} sx={{ color: sub }}>{t.cancel}</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}
            sx={{ bgcolor: '#1565C0', borderRadius: 2, fontWeight: 700 }}>
            {t.saveChanges}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

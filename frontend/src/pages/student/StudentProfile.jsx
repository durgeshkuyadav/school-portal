import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress,
  Chip, Tabs, Tab, IconButton, Tooltip, LinearProgress, MenuItem, Select,
  FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { studentApi } from '../../api/services';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

/* ═══════════════════════════════════════════════════════════════════
   STUDENT PROFILE — View & Edit with Photo
   Access: Admin (all), Student (own profile)
   ═══════════════════════════════════════════════════════════════════ */

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  admissionNumber: '', classId: '', rollNumber: '',
  guardianName: '', guardianPhone: '', academicYear: '2025-2026',
  gender: 'MALE', dob: '', address: '', photoUrl: '', bloodGroup: ''
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function InfoRow({ icon, label, value, isDark }) {
  if (!value) return null;
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub = isDark ? '#8892a4' : '#64748b';
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.8 }}>
      <Box sx={{ color: '#6A1B9A', mt: 0.2, flexShrink: 0 }}>{icon}</Box>
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
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => { onPhotoChange(ev.target.result); setUploading(false); };
    reader.readAsDataURL(file);
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ position: 'relative' }}>
        <Avatar src={photoUrl}
          sx={{ width: 96, height: 96, border: '3px solid #6A1B9A', boxShadow: '0 4px 16px rgba(106,27,154,0.25)', bgcolor: '#6A1B9A', fontSize: 36 }}>
          {!photoUrl && <PersonIcon sx={{ fontSize: 48 }} />}
        </Avatar>
        <Tooltip title={t.uploadPhoto}>
          <IconButton size="small" onClick={() => fileRef.current.click()}
            sx={{ position: 'absolute', bottom: -2, right: -2, bgcolor: '#6A1B9A', color: '#fff', width: 30, height: 30, '&:hover': { bgcolor: '#4a148c' } }}>
            <PhotoCameraIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {uploading && <CircularProgress size={14} sx={{ color: '#6A1B9A' }} />}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <Typography fontSize={11} color={isDark ? '#9090b0' : '#888'}>{t.changePhoto}</Typography>
    </Box>
  );
}

export default function StudentProfile({ standalone = false }) {
  const { t, isDark } = useAppSettings();
  const user = useSelector(selectUser);
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SCHOOL_ADMIN';
  const isStudent = user?.role === 'STUDENT';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
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
      const { data } = await studentApi.getAll();
      setStudents(Array.isArray(data) ? data : data?.content || []);
    } catch { setStudents([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (student) => {
    setEditStudent(student);
    setForm({
      firstName: student.firstName || '', lastName: student.lastName || '',
      email: student.email || '', phone: student.phone || '',
      admissionNumber: student.admissionNumber || '', classId: student.classId || '',
      rollNumber: student.rollNumber || '', guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      academicYear: student.academicYear || '2025-2026',
      gender: student.gender || 'MALE', dob: student.dob?.substring(0, 10) || '',
      address: student.address || '', photoUrl: student.photoUrl || '',
      bloodGroup: student.bloodGroup || ''
    });
    setError(''); setSuccess('');
  };
  const openAdd = () => { setEditStudent('new'); setForm(EMPTY_FORM); setError(''); setSuccess(''); };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError(t.firstName + ' / ' + t.lastName + ' required'); return;
    }
    setSaving(true); setError('');
    try {
      if (editStudent === 'new') {
        await studentApi.create({ ...form, classId: Number(form.classId), rollNumber: Number(form.rollNumber) });
      } else {
        await studentApi.update(editStudent.id, form);
      }
      setSuccess(t.success + '!');
      setTimeout(() => { setEditStudent(null); setSuccess(''); load(); }, 800);
    } catch (e) { setError(e.response?.data?.error || t.error); }
    finally { setSaving(false); }
  };

  const filtered = students.filter(s =>
    search === '' ||
    `${s.firstName} ${s.lastName} ${s.admissionNumber} ${s.classId}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const accentColor = '#6A1B9A';

  return (
    <Box sx={{ bgcolor: bg, minHeight: '100vh', p: standalone ? 3 : 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={text}>
            👨‍🎓 {t.studentDetails}
          </Typography>
          <Typography fontSize={13} color={sub}>{filtered.length} {t.students}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small" placeholder={`🔍 ${t.search}...`}
            value={search} onChange={e => setSearch(e.target.value)}
            sx={{ width: 200, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: card, color: text } }}
          />
          {isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
              sx={{ borderRadius: 3, bgcolor: accentColor, textTransform: 'none', fontWeight: 700 }}>
              {t.addStudent}
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: accentColor }} />
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((student) => (
            <Grid item xs={12} sm={6} md={4} key={student.id}>
              <Card sx={{
                bgcolor: card, border: `1px solid ${border}`, borderRadius: 3,
                transition: 'all .2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(106,27,154,0.15)' },
              }}>
                <Box sx={{ height: 5, background: 'linear-gradient(90deg, #6A1B9A, #1565C0)' }} />
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Avatar src={student.photoUrl}
                      sx={{ width: 56, height: 56, bgcolor: accentColor, border: `2px solid ${border}` }}>
                      {!student.photoUrl && <PersonIcon />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700} color={text} fontSize={15}>
                        {student.firstName} {student.lastName}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                        <Chip label={`Class ${student.classId}`} size="small"
                          sx={{ bgcolor: isDark ? '#2d1a4e' : '#f3e5f5', color: accentColor, fontWeight: 600, fontSize: 11 }} />
                        {student.admissionNumber && (
                          <Chip label={`#${student.admissionNumber}`} size="small"
                            sx={{ bgcolor: isDark ? '#1e2a3e' : '#e3f2fd', color: '#1565C0', fontWeight: 600, fontSize: 11 }} />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {student.guardianName && (
                    <Typography fontSize={12} color={sub} mt={1.5}>
                      👨‍👩‍👧 {student.guardianName}
                    </Typography>
                  )}
                  {student.guardianPhone && (
                    <Typography fontSize={12} color={sub} mt={0.3}>
                      📞 {student.guardianPhone}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button size="small" startIcon={<VisibilityIcon />} variant="outlined"
                      onClick={() => { setViewStudent(student); setTab(0); }}
                      sx={{ flex: 1, borderRadius: 2, borderColor: accentColor, color: accentColor, fontSize: 12 }}>
                      {t.viewProfile}
                    </Button>
                    {(isAdmin || (isStudent && user?.profileId === student.id)) && (
                      <Button size="small" startIcon={<EditIcon />} variant="contained"
                        onClick={() => openEdit(student)}
                        sx={{ flex: 1, borderRadius: 2, bgcolor: accentColor, fontSize: 12 }}>
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
                <Typography>{t.students}: 0</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* ── VIEW Dialog ── */}
      <Dialog open={!!viewStudent} onClose={() => setViewStudent(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: card, borderRadius: 3, border: `1px solid ${border}` } }}>
        {viewStudent && (
          <>
            <Box sx={{ background: 'linear-gradient(135deg,#4a148c,#6A1B9A)', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar src={viewStudent.photoUrl}
                    sx={{ width: 80, height: 80, border: '3px solid rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.1)' }}>
                    {!viewStudent.photoUrl && <PersonIcon sx={{ fontSize: 40 }} />}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={800} color="#fff">
                      {viewStudent.firstName} {viewStudent.lastName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={`Class ${viewStudent.classId}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
                      {viewStudent.rollNumber && <Chip label={`Roll #${viewStudent.rollNumber}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }} />}
                    </Box>
                  </Box>
                </Box>
                <IconButton onClick={() => setViewStudent(null)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
              </Box>
            </Box>

            <Tabs value={tab} onChange={(_, v) => setTab(v)}
              sx={{ px: 2, borderBottom: `1px solid ${border}`, '& .MuiTab-root': { color: sub, fontWeight: 600 }, '& .Mui-selected': { color: accentColor } }}>
              <Tab label={t.personalInfo} />
              <Tab label={t.academicInfo} />
              <Tab label={t.contactInfo} />
            </Tabs>

            <DialogContent sx={{ p: 3 }}>
              {tab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoRow icon={<PersonIcon fontSize="small" />} label={t.name} value={`${viewStudent.firstName} ${viewStudent.lastName}`} isDark={isDark} />
                    <InfoRow icon={<PersonIcon fontSize="small" />} label={t.gender} value={viewStudent.gender} isDark={isDark} />
                    <InfoRow icon={<PersonIcon fontSize="small" />} label={t.dob} value={viewStudent.dob?.substring(0, 10)} isDark={isDark} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow icon={<SchoolIcon fontSize="small" />} label={t.admNo} value={viewStudent.admissionNumber} isDark={isDark} />
                    <InfoRow icon={<PersonIcon fontSize="small" />} label="Blood Group" value={viewStudent.bloodGroup} isDark={isDark} />
                    <InfoRow icon={<SchoolIcon fontSize="small" />} label={t.academicYear} value={viewStudent.academicYear} isDark={isDark} />
                  </Grid>
                </Grid>
              )}
              {tab === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoRow icon={<SchoolIcon fontSize="small" />} label={t.class} value={`Class ${viewStudent.classId}`} isDark={isDark} />
                    <InfoRow icon={<SchoolIcon fontSize="small" />} label={t.rollNo} value={viewStudent.rollNumber?.toString()} isDark={isDark} />
                  </Grid>
                </Grid>
              )}
              {tab === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoRow icon={<EmailIcon fontSize="small" />} label={t.email} value={viewStudent.email} isDark={isDark} />
                    <InfoRow icon={<PhoneIcon fontSize="small" />} label={t.phone} value={viewStudent.phone} isDark={isDark} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow icon={<PersonIcon fontSize="small" />} label={t.guardian} value={viewStudent.guardianName} isDark={isDark} />
                    <InfoRow icon={<PhoneIcon fontSize="small" />} label={t.guardianPhone} value={viewStudent.guardianPhone} isDark={isDark} />
                    <InfoRow icon={<PersonIcon fontSize="small" />} label={t.address} value={viewStudent.address} isDark={isDark} />
                  </Grid>
                </Grid>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* ── EDIT / ADD Dialog ── */}
      <Dialog open={!!editStudent} onClose={() => setEditStudent(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: card, borderRadius: 3, border: `1px solid ${border}` } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg,#4a148c,#6A1B9A)', color: '#fff', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editStudent === 'new' ? `➕ ${t.addStudent}` : `✏️ ${t.editStudent}`}
          <IconButton onClick={() => setEditStudent(null)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {saving && <LinearProgress sx={{ mb: 2, '& .MuiLinearProgress-bar': { bgcolor: accentColor } }} />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <PhotoUpload photoUrl={form.photoUrl}
                onPhotoChange={(url) => setForm(f => ({ ...f, photoUrl: url }))} t={t} isDark={isDark} />
            </Grid>

            {[
              [t.firstName, 'firstName'], [t.lastName, 'lastName'],
              [t.email, 'email'], [t.phone, 'phone'],
              [t.admNo, 'admissionNumber'], [t.rollNo, 'rollNumber'],
              [t.guardian, 'guardianName'], [t.guardianPhone, 'guardianPhone'],
              [t.dob, 'dob', 'date'], [t.academicYear, 'academicYear'],
              [t.address, 'address'],
            ].map(([label, field, type = 'text']) => (
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

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: sub }}>{t.gender}</InputLabel>
                <Select value={form.gender} label={t.gender}
                  onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  sx={{ bgcolor: isDark ? '#1e2a3e' : '#fafbff', color: text, borderRadius: 2 }}>
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: sub }}>Blood Group</InputLabel>
                <Select value={form.bloodGroup} label="Blood Group"
                  onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
                  sx={{ bgcolor: isDark ? '#1e2a3e' : '#fafbff', color: text, borderRadius: 2 }}>
                  {BLOOD_GROUPS.map(bg => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${border}` }}>
          <Button onClick={() => setEditStudent(null)} sx={{ color: sub }}>{t.cancel}</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}
            sx={{ bgcolor: accentColor, borderRadius: 2, fontWeight: 700 }}>
            {t.saveChanges}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar,
  Button, CircularProgress, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert,
  IconButton, Tooltip, Divider, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import apiClient from '../../api/apiClient';
import { authApi } from '../../api/services';
import { toast } from 'react-toastify';
import { useAppSettings } from '../../context/AppSettingsContext';

const DESIGNATIONS = ['Class Teacher','Subject Teacher','Senior Teacher','Head of Department','Vice Principal','Principal'];
const ROLES = [
  { value:'CLASS_TEACHER', label:'Class Teacher' },
  { value:'SUBJECT_TEACHER', label:'Subject Teacher' },
  { value:'SCHOOL_ADMIN', label:'School Admin / Principal' },
];
const emptyForm = { firstName:'', lastName:'', email:'', phone:'',
  designation:'Class Teacher', qualification:'', subjectsTaught:'', bio:'',
  joiningDate:'', role:'CLASS_TEACHER' };

export default function ManageTeachers() {
  const { isDark } = useAppSettings();
  const [teachers, setTeachers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);

  const card = isDark ? '#161b27' : '#fff';
  const bord = isDark ? '#2d3348' : '#e8eaf6';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub  = isDark ? '#8892a4' : '#64748b';

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try { const { data } = await apiClient.get('/teachers');
      setTeachers(Array.isArray(data) ? data : []);
    } catch { setTeachers([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTeachers(); }, [loadTeachers]);

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Naam zaroori hai'); return;
    }
    setSaving(true); setError('');
    try {
      if (editing) {
        await apiClient.put(`/teachers/${editing.id}`, form);
        toast.success('Teacher updated!');
        setOpen(false); loadTeachers();
      } else {
        // Step 1: Create teacher profile
        const tRes = await apiClient.post('/teachers', form);
        const teacherId = tRes.data?.id;
        // Step 2: Auto-generate login
        const authRes = await authApi.autoCreateTeacher({
          email: form.email || null,
          role: form.role || 'CLASS_TEACHER',
          profileId: teacherId,
        });
        setCreatedCreds({ teacherName:`${form.firstName} ${form.lastName}`,
          designation: form.designation, ...authRes.data });
        setOpen(false); setForm(emptyForm); loadTeachers();
      }
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const copy = (t) => { navigator.clipboard.writeText(t).then(() => toast.success('Copied!')); };
  const f = key => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={text}>👨‍🏫 Teachers</Typography>
          <Typography fontSize={13} color={sub}>{teachers.length} teachers registered</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon/>}
          onClick={() => { setEditing(null); setForm(emptyForm); setError(''); setOpen(true); }}
          sx={{ bgcolor:'#0A2E1A', borderRadius:2, fontWeight:700 }}>
          Naya Teacher
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display:'flex', justifyContent:'center', mt:5 }}><CircularProgress /></Box>
      ) : teachers.length === 0 ? (
        <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3 }}>
          <CardContent sx={{ textAlign:'center', py:8 }}>
            <PersonIcon sx={{ fontSize:64, color:sub, mb:2 }}/>
            <Typography color={sub} mb={2}>Koi teacher nahi mila</Typography>
            <Button variant="contained" startIcon={<AddIcon/>}
              onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}
              sx={{ bgcolor:'#0A2E1A' }}>
              Pehla Teacher Add Karo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {teachers.map(t => (
            <Grid item xs={12} sm={6} md={4} key={t.id}>
              <Card elevation={0} sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3, overflow:'hidden',
                transition:'all .2s', '&:hover':{ transform:'translateY(-3px)', boxShadow: isDark?'0 8px 32px rgba(0,0,0,.4)':'0 8px 32px rgba(10,46,26,.15)' } }}>
                <Box sx={{ height:4, background:'linear-gradient(90deg,#0A2E1A,#2E7D32)' }}/>
                <CardContent sx={{ p:2.5 }}>
                  <Box sx={{ display:'flex', gap:2, alignItems:'flex-start' }}>
                    <Avatar sx={{ width:52, height:52, bgcolor:'#0A2E1A', border:`2px solid ${bord}` }}>
                      {t.firstName?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex:1 }}>
                      <Typography fontWeight={700} color={text}>{t.firstName} {t.lastName}</Typography>
                      <Chip label={t.designation||'Teacher'} size="small"
                        sx={{ mt:.5, bgcolor: isDark?'#1e3a2e':'#E8F5E9', color:'#2E7D32', fontWeight:600, fontSize:11 }}/>
                    </Box>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => {
                      setEditing(t); setForm({ firstName:t.firstName||'', lastName:t.lastName||'',
                        email:t.email||'', phone:t.phone||'', designation:t.designation||'Class Teacher',
                        qualification:t.qualification||'', subjectsTaught:t.subjectsTaught||'',
                        bio:t.bio||'', joiningDate:t.joiningDate||'', role:'CLASS_TEACHER' });
                      setError(''); setOpen(true);
                    }}><EditIcon fontSize="small"/></IconButton></Tooltip>
                  </Box>
                  <Divider sx={{ my:1.5, borderColor:bord }}/>
                  {t.email && <Typography fontSize={12} color={sub} mb={.5}>📧 {t.email}</Typography>}
                  {t.phone && <Typography fontSize={12} color={sub} mb={.5}>📞 {t.phone}</Typography>}
                  {t.qualification && <Typography fontSize={12} color={sub} mb={.5}>🎓 {t.qualification}</Typography>}
                  {t.subjectsTaught && (
                    <Box sx={{ mt:1, display:'flex', flexWrap:'wrap', gap:.5 }}>
                      {t.subjectsTaught.split(',').map((s,i) => (
                        <Chip key={i} label={s.trim()} size="small" variant="outlined" color="primary" sx={{ fontSize:10 }}/>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle sx={{ background:'linear-gradient(135deg,#0A2E1A,#2E7D32)', color:'#fff', fontWeight:700 }}>
          {editing ? '✏️ Teacher Update' : '➕ Naya Teacher Add Karo'}
        </DialogTitle>
        <DialogContent sx={{ pt:2 }}>
          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
          {!editing && (
            <Alert severity="info" sx={{ mb:2, borderRadius:2, fontSize:12 }}>
              💡 Login ID auto-generate hoga: <strong>TCH{new Date().getFullYear().toString().slice(2)}001</strong> format
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt:.5 }}>
            <Grid item xs={6}><TextField fullWidth label="First Name *" {...f('firstName')} size="small"/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Last Name *" {...f('lastName')} size="small"/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Email" type="email" {...f('email')} size="small"/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Phone" {...f('phone')} size="small"/></Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Designation" value={form.designation}
                onChange={e => setForm(p => ({ ...p, designation:e.target.value }))} size="small">
                {DESIGNATIONS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            {!editing && (
              <Grid item xs={6}>
                <TextField fullWidth select label="Role / Permission" value={form.role}
                  onChange={e => setForm(p => ({ ...p, role:e.target.value }))} size="small">
                  {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField fullWidth label="Qualification" placeholder="M.Sc Mathematics" {...f('qualification')} size="small"/>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Subjects (comma separated)" placeholder="Math, Science" {...f('subjectsTaught')} size="small"/>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Joining Date" type="date" InputLabelProps={{ shrink:true }} {...f('joiningDate')} size="small"/>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Bio (optional)" multiline rows={2} {...f('bio')} size="small"/>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}
            sx={{ bgcolor:'#0A2E1A', borderRadius:2, fontWeight:700 }}>
            {saving ? <CircularProgress size={20} color="inherit"/> : editing ? 'Update' : '✅ Add + Generate ID'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={!!createdCreds} maxWidth="sm" fullWidth
        PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
          <CheckCircleIcon sx={{ color:'#2E7D32', fontSize:28 }}/>
          <Box>
            <Typography fontWeight={800} color={text}>Teacher Added!</Typography>
            <Typography fontSize={12} color={sub}>Yeh credentials teacher ko de do</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p:2.5, bgcolor: isDark?'#1e3a2e':'#E8F5E9', borderRadius:3, border:'2px solid #2E7D32', mb:2 }}>
            <Typography fontWeight={700} color={text} mb={2}>
              👨‍🏫 {createdCreds?.teacherName} — {createdCreds?.designation}
            </Typography>
            <Divider sx={{ mb:2 }}/>
            {[
              { label:'Login ID', value:createdCreds?.username, mono:true },
              { label:'Default Password', value:createdCreds?.defaultPassword, mono:true },
              { label:'Email', value:createdCreds?.email },
            ].map(({ label, value, mono }) => value ? (
              <Box key={label} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1.5 }}>
                <Box>
                  <Typography fontSize={11} color={sub} fontWeight={600} textTransform="uppercase">{label}</Typography>
                  <Typography fontWeight={mono?800:600}
                    sx={{ color: mono?'#2E7D32':text, fontFamily: mono?'monospace':'inherit', fontSize: mono?18:14 }}>
                    {value}
                  </Typography>
                </Box>
                <Tooltip title="Copy"><IconButton size="small" onClick={() => copy(value)}>
                  <ContentCopyIcon fontSize="small"/>
                </IconButton></Tooltip>
              </Box>
            ) : null)}
          </Box>
          <Alert severity="warning" sx={{ borderRadius:2, fontSize:12 }}>
            ⚠️ Default password = Login ID. Teacher pehli baar login karke change kar sakta hai.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => copy(`Login ID: ${createdCreds?.username}\nPassword: ${createdCreds?.defaultPassword}`)}
            startIcon={<ContentCopyIcon/>} variant="outlined">Copy Both</Button>
          <Button onClick={() => setCreatedCreds(null)} variant="contained" sx={{ bgcolor:'#0A2E1A' }}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

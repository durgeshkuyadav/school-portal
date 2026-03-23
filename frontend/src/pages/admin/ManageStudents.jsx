import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  CircularProgress, Chip, Alert, MenuItem, Avatar, Divider,
  IconButton, Tooltip, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { studentApi, classApi, authApi } from '../../api/services';
import { toast } from 'react-toastify';
import { useAppSettings } from '../../context/AppSettingsContext';

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const emptyForm = {
  firstName: '', lastName: '', email: '', admissionNumber: '',
  classId: '', rollNumber: '', guardianName: '',
  guardianPhone: '', academicYear: '2025-2026', gender: 'MALE'
};

export default function ManageStudents() {
  const { isDark } = useAppSettings();
  const [students, setStudents]   = useState([]);
  const [classes, setClasses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [form, setForm]           = useState(emptyForm);
  const [createdCreds, setCreatedCreds] = useState(null);
  const [viewStudent, setViewStudent]   = useState(null);

  const card = isDark ? '#161b27' : '#fff';
  const bord = isDark ? '#2d3348' : '#e8eaf6';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub  = isDark ? '#8892a4' : '#64748b';

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.allSettled([studentApi.getAll(), classApi.getAll()]);
      if (sRes.status === 'fulfilled')
        setStudents(sRes.value.data?.content || sRes.value.data || []);
      if (cRes.status === 'fulfilled')
        setClasses(Array.isArray(cRes.value.data) ? cRes.value.data : []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.classId) {
      setError('Naam aur Class zaroori hain!'); return;
    }
    setSaving(true); setError('');
    try {
      const admNo = form.admissionNumber ||
        `ADM${new Date().getFullYear()}${String(students.length + 1).padStart(3, '0')}`;
      const studentRes = await studentApi.create({
        firstName: form.firstName, lastName: form.lastName,
        admissionNumber: admNo,
        classId: Number(form.classId),
        rollNumber: form.rollNumber ? Number(form.rollNumber) : students.length + 1,
        guardianName: form.guardianName, guardianPhone: form.guardianPhone,
        academicYear: form.academicYear, gender: form.gender,
      });
      const studentId = studentRes.data?.id;
      const authRes = await authApi.autoCreateStudent({
        email: form.email || null, role: 'STUDENT',
        profileId: studentId, classId: Number(form.classId),
      });
      const cls = classes.find(c => String(c.id) === String(form.classId));
      setCreatedCreds({ studentName: `${form.firstName} ${form.lastName}`,
        className: cls?.name || '', ...authRes.data });
      setOpen(false); setForm(emptyForm); fetchAll();
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Error — dobara try karo');
    } finally { setSaving(false); }
  };

  const copy = (t) => { navigator.clipboard.writeText(t).then(() => toast.success('Copied!')); };
  const filtered = students.filter(s => !search ||
    `${s.firstName} ${s.lastName} ${s.admissionNumber}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={text}>👨‍🎓 Students</Typography>
          <Typography fontSize={13} color={sub}>{students.length} students registered</Typography>
        </Box>
        <Box sx={{ display:'flex', gap:1.5 }}>
          <TextField size="small" placeholder="Search..." value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment> }}
            sx={{ width:200 }} />
          <Button variant="contained" startIcon={<AddIcon/>}
            onClick={() => { setOpen(true); setError(''); }}
            sx={{ bgcolor:'#0B1F3A', borderRadius:2, fontWeight:700 }}>
            Naya Student
          </Button>
        </Box>
      </Box>

      {classes.length === 0 && !loading && (
        <Alert severity="warning" sx={{ mb:2, borderRadius:2 }}>
          ⚠️ Pehle <strong>Classes</strong> page se class banao!
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display:'flex', justifyContent:'center', mt:5 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} elevation={0}
          sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: isDark ? '#1e2a3e' : '#0B1F3A' }}>
                {['Student','Adm. No.','Login ID','Class','Guardian','Status',''].map(h => (
                  <TableCell key={h} sx={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ textAlign:'center', py:4, color:sub }}>
                  {search ? 'Koi result nahi mila' : 'Koi student nahi — Add karo!'}
                </TableCell></TableRow>
              ) : filtered.map((s, i) => (
                <TableRow key={s.id || i}
                  sx={{ bgcolor: i%2===0 ? (isDark?'#1e2a3e22':'#f8f9ff') : 'transparent' }}>
                  <TableCell>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                      <Avatar sx={{ width:32, height:32, bgcolor:'#0B1F3A', fontSize:12 }}>
                        {s.firstName?.[0]}{s.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography fontSize={13} fontWeight={700} color={text}>{s.firstName} {s.lastName}</Typography>
                        <Typography fontSize={11} color={sub}>Roll #{s.rollNumber}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color:text, fontSize:12 }}>{s.admissionNumber}</TableCell>
                  <TableCell>
                    <Chip label={s.username || 'Not set'} size="small"
                      sx={{ bgcolor: s.username?'#E3F2FD':'#f5f5f5',
                        color: s.username?'#1565C0':sub, fontWeight:700, fontSize:11, fontFamily:'monospace' }} />
                  </TableCell>
                  <TableCell sx={{ color:text, fontSize:12 }}>
                    {s.className || `Class ${s.classId}`}
                  </TableCell>
                  <TableCell sx={{ color:sub, fontSize:12 }}>{s.guardianName || '—'}</TableCell>
                  <TableCell>
                    <Chip label={s.status} size="small" color={s.status==='ACTIVE'?'success':'default'} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View"><IconButton size="small" onClick={() => setViewStudent(s)}>
                      <VisibilityIcon fontSize="small"/>
                    </IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle sx={{ background:'linear-gradient(135deg,#0B1F3A,#1565C0)', color:'#fff', fontWeight:700 }}>
          ➕ Naya Student Add Karo
        </DialogTitle>
        <DialogContent sx={{ pt:2.5 }}>
          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
          <Alert severity="info" sx={{ mb:2, borderRadius:2, fontSize:12 }}>
            💡 Login ID auto-generate hoga: <strong>STU{new Date().getFullYear().toString().slice(2)}001</strong> format
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth label="Pehla Naam *" value={form.firstName} size="small"
                onChange={e => setForm(f => ({ ...f, firstName:e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Aakhri Naam *" value={form.lastName} size="small"
                onChange={e => setForm(f => ({ ...f, lastName:e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Class *" value={form.classId} size="small"
                onChange={e => setForm(f => ({ ...f, classId:e.target.value }))}>
                {classes.length === 0
                  ? <MenuItem disabled value="">Pehle class banao</MenuItem>
                  : classes.map(c => <MenuItem key={c.id} value={String(c.id)}>
                      {c.name}{c.section ? ` - ${c.section}` : ''}
                    </MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Gender" value={form.gender} size="small"
                onChange={e => setForm(f => ({ ...f, gender:e.target.value }))}>
                {GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Admission No." value={form.admissionNumber} size="small"
                onChange={e => setForm(f => ({ ...f, admissionNumber:e.target.value }))}
                placeholder="Auto-generate hoga" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Roll No." type="number" value={form.rollNumber} size="small"
                onChange={e => setForm(f => ({ ...f, rollNumber:e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Guardian" value={form.guardianName} size="small"
                onChange={e => setForm(f => ({ ...f, guardianName:e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Guardian Phone" value={form.guardianPhone} size="small"
                onChange={e => setForm(f => ({ ...f, guardianPhone:e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email (optional)" value={form.email} size="small"
                onChange={e => setForm(f => ({ ...f, email:e.target.value }))}
                placeholder="Blank chhodo — auto-generate hoga" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}
            disabled={saving || classes.length === 0}
            sx={{ bgcolor:'#0B1F3A', borderRadius:2, fontWeight:700 }}>
            {saving ? <CircularProgress size={20} color="inherit"/> : '✅ Add + Generate ID'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={!!createdCreds} maxWidth="sm" fullWidth
        PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
          <CheckCircleIcon sx={{ color:'#2E7D32', fontSize:28 }}/>
          <Box>
            <Typography fontWeight={800} color={text}>Student Added!</Typography>
            <Typography fontSize={12} color={sub}>Yeh credentials student ko de do</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p:2.5, bgcolor: isDark?'#1e2a3e':'#E8F5E9', borderRadius:3, border:'2px solid #2E7D32', mb:2 }}>
            <Typography fontWeight={700} color={text} mb={2}>
              🎓 {createdCreds?.studentName} — {createdCreds?.className}
            </Typography>
            <Divider sx={{ mb:2 }}/>
            {[
              { label:'Login ID (Username)', value: createdCreds?.username, mono:true },
              { label:'Default Password',   value: createdCreds?.defaultPassword, mono:true },
              { label:'Email',              value: createdCreds?.email },
            ].map(({ label, value, mono }) => value ? (
              <Box key={label} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1.5 }}>
                <Box>
                  <Typography fontSize={11} color={sub} fontWeight={600} textTransform="uppercase">{label}</Typography>
                  <Typography fontWeight={mono?800:600} sx={{ color: mono?'#1565C0':text,
                    fontFamily: mono?'monospace':'inherit', fontSize: mono?18:14 }}>
                    {value}
                  </Typography>
                </Box>
                <Tooltip title="Copy">
                  <IconButton size="small" onClick={() => copy(value)}>
                    <ContentCopyIcon fontSize="small"/>
                  </IconButton>
                </Tooltip>
              </Box>
            ) : null)}
          </Box>
          <Alert severity="warning" sx={{ borderRadius:2, fontSize:12 }}>
            ⚠️ Default password = Login ID. Student pehli baar login karke change kar sakta hai.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => copy(`Login ID: ${createdCreds?.username}\nPassword: ${createdCreds?.defaultPassword}`)}
            startIcon={<ContentCopyIcon/>} variant="outlined">Copy Both</Button>
          <Button onClick={() => setCreatedCreds(null)} variant="contained" sx={{ bgcolor:'#0B1F3A' }}>Done</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewStudent} onClose={() => setViewStudent(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        {viewStudent && <>
          <Box sx={{ background:'linear-gradient(135deg,#0B1F3A,#1565C0)', p:3, textAlign:'center' }}>
            <Avatar sx={{ width:60, height:60, mx:'auto', mb:1, bgcolor:'rgba(255,255,255,.2)', fontSize:22 }}>
              {viewStudent.firstName?.[0]}{viewStudent.lastName?.[0]}
            </Avatar>
            <Typography fontWeight={800} color="#fff">{viewStudent.firstName} {viewStudent.lastName}</Typography>
          </Box>
          <DialogContent sx={{ pt:2 }}>
            {[['Adm. No.', viewStudent.admissionNumber],['Class',`${viewStudent.className||`Class ${viewStudent.classId}`}`],
              ['Roll No.', viewStudent.rollNumber],['Guardian',viewStudent.guardianName],
              ['Phone',viewStudent.guardianPhone],['Year',viewStudent.academicYear]
            ].map(([l,v]) => v ? (
              <Box key={l} sx={{ display:'flex', justifyContent:'space-between', py:0.8, borderBottom:`1px solid ${bord}` }}>
                <Typography fontSize={12} color={sub}>{l}</Typography>
                <Typography fontSize={13} fontWeight={600} color={text}>{v}</Typography>
              </Box>
            ) : null)}
          </DialogContent>
          <DialogActions sx={{ p:2 }}>
            <Button onClick={() => setViewStudent(null)} variant="contained" sx={{ bgcolor:'#0B1F3A' }}>Close</Button>
          </DialogActions>
        </>}
      </Dialog>
    </Box>
  );
}

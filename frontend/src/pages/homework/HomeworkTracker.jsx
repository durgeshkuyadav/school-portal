import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Chip, Alert, Avatar, Divider, IconButton, Tooltip, Tabs, Tab,
  LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { classApi } from '../../api/services';
import { toast } from 'react-toastify';
import { useAppSettings } from '../../context/AppSettingsContext';

const SUBJECTS = ['Mathematics','Science','English','Hindi','Social Studies','Computer','Art'];
const PRIORITY = ['Low','Medium','High'];
const LS_KEY = 'vm_homework';

const load = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } };
const save = d => localStorage.setItem(LS_KEY, JSON.stringify(d));

export default function HomeworkTracker() {
  const { isDark } = useAppSettings();
  const user = useSelector(selectUser);
  const isTeacher = ['CLASS_TEACHER','SUBJECT_TEACHER','SUPER_ADMIN','SCHOOL_ADMIN'].includes(user?.role);
  const isStudent = user?.role === 'STUDENT';

  const [homeworks, setHomeworks] = useState(load);
  const [classes, setClasses]     = useState([]);
  const [tab, setTab]             = useState(0);
  const [dialog, setDialog]       = useState(false);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [selHW, setSelHW]         = useState(null);
  const [submitNote, setSubmitNote] = useState('');
  const [form, setForm] = useState({
    title:'', subject:'Mathematics', classId:'', description:'',
    dueDate:'', priority:'Medium', points:10
  });

  const card = isDark ? '#161b27' : '#fff';
  const bord = isDark ? '#2d3348' : '#e8eaf6';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub  = isDark ? '#8892a4' : '#64748b';

  useEffect(() => {
    classApi.getAll().then(r => setClasses(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const persist = d => { setHomeworks(d); save(d); };

  const addHW = () => {
    if (!form.title || !form.classId) { toast.error('Title aur class zaroori hai'); return; }
    const hw = { id: Date.now(), ...form, classId: Number(form.classId),
      assignedBy: user?.username, assignedDate: new Date().toISOString().split('T')[0],
      submissions: [], status: 'ACTIVE' };
    persist([...homeworks, hw]);
    setDialog(false); setForm({ title:'', subject:'Mathematics', classId:'', description:'', dueDate:'', priority:'Medium', points:10 });
    toast.success('Homework assigned ho gaya!');
  };

  const submitHW = () => {
    const updated = homeworks.map(hw => hw.id === selHW.id ? {
      ...hw, submissions: [...hw.submissions, {
        studentId: user?.userId, studentName: user?.username,
        note: submitNote, date: new Date().toISOString().split('T')[0], status: 'SUBMITTED'
      }]
    } : hw);
    persist(updated); setSubmitDialog(false); setSubmitNote('');
    toast.success('Homework submit ho gaya! ✅');
  };

  const markChecked = (hwId, studentId) => {
    const updated = homeworks.map(hw => hw.id === hwId ? {
      ...hw, submissions: hw.submissions.map(s =>
        String(s.studentId) === String(studentId) ? { ...s, status: 'CHECKED' } : s)
    } : hw);
    persist(updated); toast.success('Marked as checked!');
  };

  const deleteHW = (id) => { persist(homeworks.filter(h => h.id !== id)); toast.success('Deleted!'); };

  const myHW = isStudent
    ? homeworks.filter(hw => String(hw.classId) === String(user?.classId))
    : homeworks.filter(hw => hw.assignedBy === user?.username);

  const filtered = tab === 0 ? myHW : myHW.filter(hw => {
    const sub = hw.submissions.find(s => String(s.studentId) === String(user?.userId));
    return tab === 1 ? !sub : sub;
  });

  const prioColor = { Low:'#2E7D32', Medium:'#E65100', High:'#C62828' };
  const today = new Date().toISOString().split('T')[0];

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={text}>📝 Homework Tracker</Typography>
          <Typography fontSize={13} color={sub}>
            {isTeacher ? 'Students ko homework assign karo' : 'Apna pending homework dekho aur submit karo'}
          </Typography>
        </Box>
        {isTeacher && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog(true)}
            sx={{ bgcolor:'#0B1F3A', borderRadius:2, fontWeight:700 }}>
            Homework Assign
          </Button>
        )}
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb:3 }}>
        {[
          { label:'Total', val:myHW.length, color:'#1565C0' },
          { label:'Active', val:myHW.filter(h=>h.status==='ACTIVE').length, color:'#E65100' },
          { label:'Submissions', val:myHW.reduce((s,h)=>s+h.submissions.length,0), color:'#2E7D32' },
        ].map(s => (
          <Grid item xs={4} key={s.label}>
            <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:2, textAlign:'center' }}>
              <CardContent sx={{ py:1.5 }}>
                <Typography variant="h5" fontWeight={800} sx={{ color:s.color }}>{s.val}</Typography>
                <Typography fontSize={11} color={sub}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {isStudent && (
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb:2 }}>
          <Tab label="All" />
          <Tab label="Pending" />
          <Tab label="Submitted" />
        </Tabs>
      )}

      {filtered.length === 0 ? (
        <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3 }}>
          <CardContent sx={{ textAlign:'center', py:6 }}>
            <AssignmentIcon sx={{ fontSize:60, color:sub, mb:2 }}/>
            <Typography color={sub}>Koi homework nahi mila</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map(hw => {
            const mySubmission = hw.submissions.find(s => String(s.studentId) === String(user?.userId));
            const isOverdue = hw.dueDate && hw.dueDate < today && !mySubmission;
            const submitCount = hw.submissions.length;
            return (
              <Grid item xs={12} md={6} key={hw.id}>
                <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3,
                  borderLeft:`4px solid ${prioColor[hw.priority] || '#1565C0'}` }}>
                  <CardContent>
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
                      <Typography fontWeight={700} color={text} flex={1} mr={1}>{hw.title}</Typography>
                      <Box sx={{ display:'flex', gap:.5, flexShrink:0 }}>
                        <Chip label={hw.priority} size="small"
                          sx={{ bgcolor: prioColor[hw.priority]+'22', color:prioColor[hw.priority], fontWeight:700, fontSize:10 }}/>
                        <Chip label={hw.subject} size="small" variant="outlined" sx={{ fontSize:10 }}/>
                      </Box>
                    </Box>
                    {hw.description && <Typography fontSize={12} color={sub} mb={1}>{hw.description}</Typography>}
                    <Box sx={{ display:'flex', gap:2, flexWrap:'wrap', mb:1 }}>
                      <Typography fontSize={11} color={sub}>📅 Due: <strong style={{ color: isOverdue?'#C62828':text }}>{hw.dueDate || 'Not set'}</strong></Typography>
                      <Typography fontSize={11} color={sub}>⭐ {hw.points} pts</Typography>
                      {isTeacher && <Typography fontSize={11} color={sub}>✅ {submitCount} submitted</Typography>}
                    </Box>
                    {isOverdue && <Alert severity="error" sx={{ py:.5, mb:1, fontSize:11 }}>⚠️ Overdue!</Alert>}
                    {mySubmission && (
                      <Alert severity={mySubmission.status==='CHECKED'?'success':'info'} sx={{ py:.5, mb:1, fontSize:11 }}>
                        {mySubmission.status==='CHECKED' ? '✅ Checked by teacher' : '📤 Submitted — waiting for review'}
                      </Alert>
                    )}
                    {/* Actions */}
                    <Box sx={{ display:'flex', gap:1, mt:1.5 }}>
                      {isStudent && !mySubmission && (
                        <Button size="small" variant="contained"
                          onClick={() => { setSelHW(hw); setSubmitDialog(true); }}
                          sx={{ bgcolor:'#2E7D32', borderRadius:2, fontWeight:700, fontSize:11 }}>
                          Submit Homework
                        </Button>
                      )}
                      {isTeacher && hw.submissions.length > 0 && (
                        <Button size="small" variant="outlined" sx={{ fontSize:11, borderRadius:2 }}
                          onClick={() => toast.info(`${submitCount} submissions: ${hw.submissions.map(s=>s.studentName).join(', ')}`)}>
                          View Submissions
                        </Button>
                      )}
                      {isTeacher && (
                        <Button size="small" color="error" onClick={() => deleteHW(hw.id)} sx={{ fontSize:11 }}>
                          Delete
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Assign Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle sx={{ background:'linear-gradient(135deg,#0B1F3A,#1565C0)', color:'#fff', fontWeight:700 }}>
          📝 Homework Assign Karo
        </DialogTitle>
        <DialogContent sx={{ pt:2 }}>
          <Grid container spacing={2} sx={{ mt:.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Title *" value={form.title} size="small" onChange={e => setForm(f => ({ ...f, title:e.target.value }))}/></Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Subject" value={form.subject} size="small" onChange={e => setForm(f => ({ ...f, subject:e.target.value }))}>
                {SUBJECTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Class" value={form.classId} size="small" onChange={e => setForm(f => ({ ...f, classId:e.target.value }))}>
                {classes.map(c => <MenuItem key={c.id} value={String(c.id)}>{c.name}{c.section?` - ${c.section}`:''}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={2} value={form.description} size="small" onChange={e => setForm(f => ({ ...f, description:e.target.value }))}/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Due Date" type="date" value={form.dueDate} size="small" InputLabelProps={{ shrink:true }} onChange={e => setForm(f => ({ ...f, dueDate:e.target.value }))}/></Grid>
            <Grid item xs={3}>
              <TextField fullWidth select label="Priority" value={form.priority} size="small" onChange={e => setForm(f => ({ ...f, priority:e.target.value }))}>
                {PRIORITY.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={3}><TextField fullWidth label="Points" type="number" value={form.points} size="small" onChange={e => setForm(f => ({ ...f, points:e.target.value }))}/></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={addHW} sx={{ bgcolor:'#0B1F3A', borderRadius:2 }}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Submit Dialog */}
      <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle fontWeight={700} color={text}>📤 Submit: {selHW?.title}</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={3} label="Completion Note (optional)"
            value={submitNote} onChange={e => setSubmitNote(e.target.value)} size="small" sx={{ mt:1 }}
            placeholder="Homework kaise complete kiya — likhna optional hai" />
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setSubmitDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitHW} sx={{ bgcolor:'#2E7D32', borderRadius:2 }}>Submit ✅</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

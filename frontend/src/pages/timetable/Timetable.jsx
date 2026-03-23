import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Tooltip, Select, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { classApi } from '../../api/services';
import { toast } from 'react-toastify';
import { useAppSettings } from '../../context/AppSettingsContext';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const PERIODS = ['8:00-8:45','8:45-9:30','9:30-10:15','10:15-10:30 (Break)','10:30-11:15','11:15-12:00','12:00-12:45','12:45-1:15 (Lunch)','1:15-2:00','2:00-2:45'];
const SUBJECTS = ['Mathematics','Science','English','Hindi','Social Studies','Computer','Physical Education','Art','Music','Library','Moral Science'];
const SUBJECT_COLORS = {
  Mathematics: '#1565C0', Science:'#2E7D32', English:'#6A1B9A', Hindi:'#C62828',
  'Social Studies':'#E65100', Computer:'#00695C', 'Physical Education':'#1565C0',
  Art:'#AD1457', Music:'#4527A0', Library:'#4E342E', 'Moral Science':'#558B2F',
};

const LS_KEY = 'vm_timetable';
const loadTT = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } };
const saveTT = d => localStorage.setItem(LS_KEY, JSON.stringify(d));

export default function Timetable() {
  const { isDark } = useAppSettings();
  const user = useSelector(selectUser);
  const isAdmin = ['SUPER_ADMIN','SCHOOL_ADMIN'].includes(user?.role);

  const [tt, setTT]           = useState(loadTT);
  const [classes, setClasses] = useState([]);
  const [selClass, setSelClass] = useState('');
  const [dialog, setDialog]   = useState(false);
  const [form, setForm] = useState({ day:'Monday', period:'8:00-8:45', subject:'Mathematics', teacher:'' });

  const card = isDark ? '#161b27' : '#fff';
  const bord = isDark ? '#2d3348' : '#e8eaf6';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub  = isDark ? '#8892a4' : '#64748b';

  useEffect(() => {
    classApi.getAll().then(r => {
      const cls = Array.isArray(r.data) ? r.data : [];
      setClasses(cls);
      if (cls.length > 0) setSelClass(String(cls[0].id));
    }).catch(() => {});
  }, []);

  const addSlot = () => {
    if (!selClass || !form.subject) { toast.error('Class aur subject zaroori hai'); return; }
    const key = `${selClass}_${form.day}_${form.period}`;
    const updated = { ...tt, [key]: { ...form, classId: selClass } };
    setTT(updated); saveTT(updated);
    setDialog(false); toast.success('Period add ho gaya!');
  };

  const removeSlot = (key) => {
    const updated = { ...tt };
    delete updated[key];
    setTT(updated); saveTT(updated);
    toast.success('Period remove ho gaya');
  };

  const getSlot = (day, period) => {
    const key = `${selClass}_${day}_${period}`;
    return tt[key] || null;
  };

  const isBreak = (p) => p.includes('Break') || p.includes('Lunch');

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={text}>🗓️ Timetable</Typography>
          <Typography fontSize={13} color={sub}>Class-wise weekly schedule</Typography>
        </Box>
        <Box sx={{ display:'flex', gap:1.5, alignItems:'center' }}>
          <TextField select label="Class" value={selClass} size="small" sx={{ width:200 }}
            onChange={e => setSelClass(e.target.value)}>
            {classes.map(c => <MenuItem key={c.id} value={String(c.id)}>
              {c.name}{c.section?` - ${c.section}`:''}
            </MenuItem>)}
          </TextField>
          {isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog(true)}
              sx={{ bgcolor:'#0B1F3A', borderRadius:2, fontWeight:700 }}>
              Period Add
            </Button>
          )}
        </Box>
      </Box>

      {/* Timetable grid */}
      <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3, overflow:'auto' }}>
        <Table sx={{ minWidth:800 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: isDark?'#1e2a3e':'#0B1F3A' }}>
              <TableCell sx={{ color:'#fff', fontWeight:700, fontSize:12, width:130 }}>Period / Time</TableCell>
              {DAYS.map(d => (
                <TableCell key={d} sx={{ color:'#fff', fontWeight:700, fontSize:12, textAlign:'center' }}>{d}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {PERIODS.map((period, pi) => {
              const brk = isBreak(period);
              return (
                <TableRow key={period} sx={{ bgcolor: brk ? (isDark?'#2d3348':'#f0f4ff') : (pi%2===0?(isDark?'#1e2a3e22':'#f8f9ff'):'transparent') }}>
                  <TableCell sx={{ color: brk?'#1565C0':sub, fontSize:11, fontWeight: brk?700:400, py:1 }}>
                    {period}
                  </TableCell>
                  {DAYS.map(day => {
                    if (brk) return (
                      <TableCell key={day} sx={{ textAlign:'center', color:'#1565C0', fontSize:11, fontStyle:'italic' }}>
                        —
                      </TableCell>
                    );
                    const slot = getSlot(day, period);
                    const color = slot ? (SUBJECT_COLORS[slot.subject] || '#1565C0') : null;
                    const key = `${selClass}_${day}_${period}`;
                    return (
                      <TableCell key={day} sx={{ p:.5, textAlign:'center' }}>
                        {slot ? (
                          <Box sx={{ p:.8, borderRadius:1.5, bgcolor: color+'22', border:`1px solid ${color}44`, position:'relative' }}>
                            <Typography fontSize={11} fontWeight={700} sx={{ color }}>
                              {slot.subject}
                            </Typography>
                            {slot.teacher && (
                              <Typography fontSize={10} color={sub}>{slot.teacher}</Typography>
                            )}
                            {isAdmin && (
                              <IconButton size="small" onClick={() => removeSlot(key)}
                                sx={{ position:'absolute', top:-4, right:-4, width:18, height:18,
                                  bgcolor:'#C62828', color:'#fff', '&:hover':{ bgcolor:'#B71C1C' } }}>
                                <DeleteIcon sx={{ fontSize:10 }} />
                              </IconButton>
                            )}
                          </Box>
                        ) : (
                          isAdmin ? (
                            <Box onClick={() => { setForm(f => ({ ...f, day, period })); setDialog(true); }}
                              sx={{ height:40, borderRadius:1.5, border:`1px dashed ${bord}`, cursor:'pointer',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                color:sub, fontSize:18, '&:hover':{ bgcolor:'#1565C022', borderColor:'#1565C0' } }}>
                              +
                            </Box>
                          ) : (
                            <Box sx={{ height:40 }} />
                          )
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Subject legend */}
      <Box sx={{ mt:2, display:'flex', gap:1, flexWrap:'wrap' }}>
        {Object.entries(SUBJECT_COLORS).map(([subj, color]) => (
          <Chip key={subj} label={subj} size="small"
            sx={{ bgcolor: color+'22', color, border:`1px solid ${color}44`, fontWeight:700, fontSize:10 }} />
        ))}
      </Box>

      {/* Add period dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle sx={{ background:'linear-gradient(135deg,#0B1F3A,#1565C0)', color:'#fff', fontWeight:700 }}>
          ➕ Period Add Karo
        </DialogTitle>
        <DialogContent sx={{ pt:2.5, display:'flex', flexDirection:'column', gap:2 }}>
          <TextField select label="Day" value={form.day} size="small"
            onChange={e => setForm(f => ({ ...f, day:e.target.value }))}>
            {DAYS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          <TextField select label="Period/Time" value={form.period} size="small"
            onChange={e => setForm(f => ({ ...f, period:e.target.value }))}>
            {PERIODS.filter(p => !isBreak(p)).map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          <TextField select label="Subject *" value={form.subject} size="small"
            onChange={e => setForm(f => ({ ...f, subject:e.target.value }))}>
            {SUBJECTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField label="Teacher Name (optional)" value={form.teacher} size="small"
            onChange={e => setForm(f => ({ ...f, teacher:e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={addSlot} sx={{ bgcolor:'#0B1F3A', borderRadius:2 }}>Add Period</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

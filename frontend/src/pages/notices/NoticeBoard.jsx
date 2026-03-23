import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Chip, Alert, Avatar, Divider, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';
import PushPinIcon from '@mui/icons-material/PushPin';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { useAppSettings } from '../../context/AppSettingsContext';

const NOTICE_TYPES = [
  { value:'GENERAL', label:'📢 General', color:'#1565C0' },
  { value:'EXAM',    label:'📝 Exam',    color:'#E65100' },
  { value:'EVENT',   label:'🎉 Event',   color:'#6A1B9A' },
  { value:'HOLIDAY', label:'🌴 Holiday', color:'#2E7D32' },
  { value:'URGENT',  label:'🚨 Urgent',  color:'#C62828' },
  { value:'FEE',     label:'💰 Fee',     color:'#F9A825' },
];

const TARGET_ROLES = ['ALL','STUDENT','CLASS_TEACHER','PARENT'];

const LS_KEY = 'vm_notices';
const load = () => { try {
  return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
} catch { return []; }};
const save = d => localStorage.setItem(LS_KEY, JSON.stringify(d));

export default function NoticeBoard() {
  const { isDark } = useAppSettings();
  const user = useSelector(selectUser);
  const isAdmin = ['SUPER_ADMIN','SCHOOL_ADMIN'].includes(user?.role);

  const [notices, setNotices] = useState(load);
  const [dialog, setDialog]   = useState(false);
  const [filter, setFilter]   = useState('ALL');
  const [form, setForm] = useState({
    title:'', body:'', type:'GENERAL', targetRole:'ALL', pinned:false, urgent:false
  });

  const card = isDark ? '#161b27' : '#fff';
  const bord = isDark ? '#2d3348' : '#e8eaf6';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub  = isDark ? '#8892a4' : '#64748b';

  const persist = d => { setNotices(d); save(d); };

  const addNotice = () => {
    if (!form.title || !form.body) { toast.error('Title aur content zaroori hai'); return; }
    const notice = {
      id: Date.now(), ...form,
      postedBy: user?.username, postedAt: new Date().toISOString(),
      read: []
    };
    const updated = [notice, ...notices];
    persist(updated); setDialog(false);
    setForm({ title:'', body:'', type:'GENERAL', targetRole:'ALL', pinned:false, urgent:false });
    toast.success('Notice posted!');
  };

  const deleteNotice = id => { persist(notices.filter(n => n.id !== id)); toast.success('Deleted!'); };
  const pinNotice = id => {
    persist(notices.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const filtered = notices
    .filter(n => filter === 'ALL' || n.type === filter)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.postedAt) - new Date(a.postedAt);
    });

  const getConfig = (type) => NOTICE_TYPES.find(t => t.value === type) || NOTICE_TYPES[0];

  const formatTime = (iso) => {
    const d = new Date(iso);
    const diff = (Date.now() - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)} hrs ago`;
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
  };

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={text}>📢 Notice Board</Typography>
          <Typography fontSize={13} color={sub}>{notices.length} notices • Dynamic aur real-time</Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog(true)}
            sx={{ bgcolor:'#C62828', borderRadius:2, fontWeight:700 }}>
            Post Notice
          </Button>
        )}
      </Box>

      {/* Filter chips */}
      <Box sx={{ display:'flex', gap:1, mb:3, flexWrap:'wrap' }}>
        <Chip label="All" onClick={() => setFilter('ALL')}
          sx={{ fontWeight:700, bgcolor: filter==='ALL'?'#0B1F3A':'transparent',
            color: filter==='ALL'?'#fff':text, border:`1px solid ${bord}` }} />
        {NOTICE_TYPES.map(t => (
          <Chip key={t.value} label={t.label} onClick={() => setFilter(t.value)}
            sx={{ fontWeight:700, cursor:'pointer',
              bgcolor: filter===t.value ? t.color : t.color+'22',
              color: filter===t.value ? '#fff' : t.color,
              border:`1px solid ${t.color}44` }} />
        ))}
      </Box>

      {filtered.length === 0 ? (
        <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3 }}>
          <CardContent sx={{ textAlign:'center', py:6 }}>
            <CampaignIcon sx={{ fontSize:60, color:sub, mb:2 }}/>
            <Typography color={sub}>Koi notice nahi mila</Typography>
            {isAdmin && <Button variant="outlined" sx={{ mt:2 }} onClick={() => setDialog(true)}>Pehla Notice Post Karo</Button>}
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
          {filtered.map(n => {
            const cfg = getConfig(n.type);
            return (
              <Card key={n.id} sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3,
                borderLeft:`4px solid ${cfg.color}`,
                boxShadow: n.urgent ? `0 0 0 2px ${cfg.color}44` : 'none' }}>
                <CardContent sx={{ p:2.5 }}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <Box sx={{ flex:1, mr:2 }}>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:.5 }}>
                        {n.pinned && <PushPinIcon sx={{ fontSize:14, color:'#E65100' }}/>}
                        {n.urgent && <NotificationsActiveIcon sx={{ fontSize:14, color:'#C62828' }}/>}
                        <Typography fontWeight={800} color={text} fontSize={15}>{n.title}</Typography>
                        <Chip label={cfg.label} size="small"
                          sx={{ bgcolor:cfg.color+'22', color:cfg.color, fontWeight:700, fontSize:10 }}/>
                        {n.targetRole !== 'ALL' && (
                          <Chip label={`For: ${n.targetRole}`} size="small" variant="outlined" sx={{ fontSize:10 }}/>
                        )}
                      </Box>
                      <Typography fontSize={14} color={sub} sx={{ lineHeight:1.6, mb:1.5 }}>
                        {n.body}
                      </Typography>
                      <Typography fontSize={11} color={sub}>
                        By <strong>{n.postedBy}</strong> • {formatTime(n.postedAt)}
                      </Typography>
                    </Box>
                    {isAdmin && (
                      <Box sx={{ display:'flex', gap:.5, flexShrink:0 }}>
                        <Tooltip title={n.pinned ? 'Unpin' : 'Pin'}>
                          <IconButton size="small" onClick={() => pinNotice(n.id)}
                            sx={{ color: n.pinned?'#E65100':sub }}>
                            <PushPinIcon fontSize="small"/>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => deleteNotice(n.id)}>
                            <DeleteIcon fontSize="small"/>
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Post Notice Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle sx={{ background:'linear-gradient(135deg,#C62828,#E53935)', color:'#fff', fontWeight:700 }}>
          📢 Notice Post Karo
        </DialogTitle>
        <DialogContent sx={{ pt:2 }}>
          <Grid container spacing={2} sx={{ mt:.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title *" value={form.title} size="small"
                onChange={e => setForm(f => ({ ...f, title:e.target.value }))}/>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Notice Type" value={form.type} size="small"
                onChange={e => setForm(f => ({ ...f, type:e.target.value }))}>
                {NOTICE_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Target Audience" value={form.targetRole} size="small"
                onChange={e => setForm(f => ({ ...f, targetRole:e.target.value }))}>
                {TARGET_ROLES.map(r => <MenuItem key={r} value={r}>{r === 'ALL' ? 'Everyone' : r}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Notice Content *" multiline rows={4} value={form.body} size="small"
                onChange={e => setForm(f => ({ ...f, body:e.target.value }))}
                placeholder="Notice ka poora text yahan likhein..."/>
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Priority" value={form.urgent?'urgent':'normal'} size="small"
                onChange={e => setForm(f => ({ ...f, urgent: e.target.value==='urgent' }))}>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="urgent">🚨 Urgent</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Pin?" value={form.pinned?'yes':'no'} size="small"
                onChange={e => setForm(f => ({ ...f, pinned: e.target.value==='yes' }))}>
                <MenuItem value="no">Don't Pin</MenuItem>
                <MenuItem value="yes">📌 Pin to Top</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={addNotice} sx={{ bgcolor:'#C62828', borderRadius:2, fontWeight:700 }}>
            Post Notice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

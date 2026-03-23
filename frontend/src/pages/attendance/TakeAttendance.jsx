import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip,
  CircularProgress, Alert, ToggleButton, ToggleButtonGroup,
  TextField, MenuItem, Divider, Avatar, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SaveIcon from '@mui/icons-material/Save';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { attendanceApi, classApi, studentApi } from '../../api/services';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { useAppSettings } from '../../context/AppSettingsContext';

const STATUS_CONFIG = {
  PRESENT:  { label: 'Present',  color: '#2E7D32', bg: '#E8F5E9', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
  ABSENT:   { label: 'Absent',   color: '#C62828', bg: '#FFEBEE', icon: <CancelIcon sx={{ fontSize: 16 }} /> },
  LATE:     { label: 'Late',     color: '#E65100', bg: '#FFF3E0', icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> },
  HALF_DAY: { label: 'Half Day', color: '#1565C0', bg: '#E3F2FD', icon: <ContentCutIcon sx={{ fontSize: 16 }} /> },
};

export default function TakeAttendance() {
  const { isDark } = useAppSettings();
  const user = useSelector(selectUser);

  const [classes, setClasses]         = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate]   = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents]       = useState([]);
  const [attendance, setAttendance]   = useState({});  // { studentId: 'PRESENT' }
  const [remarks, setRemarks]         = useState({});  // { studentId: 'remark' }
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const card  = isDark ? '#161b27' : '#fff';
  const bg    = isDark ? '#0d1117' : '#f5f7ff';
  const text  = isDark ? '#e0e6f0' : '#1a2340';
  const sub   = isDark ? '#8892a4' : '#64748b';
  const bord  = isDark ? '#2d3348' : '#e8eaf6';

  // Load classes
  useEffect(() => {
    classApi.getAll().then(r => {
      const cls = Array.isArray(r.data) ? r.data : r.data?.content || [];
      setClasses(cls);
      if (cls.length > 0) setSelectedClass(String(cls[0].id));
    }).catch(() => {});
  }, []);

  // Load students + check today status when class changes
  const loadStudentsAndStatus = useCallback(async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const [studRes, statusRes] = await Promise.allSettled([
        studentApi.getByClass(Number(selectedClass)),
        attendanceApi.getTodayStatus(Number(selectedClass)),
      ]);

      if (studRes.status === 'fulfilled') {
        const studs = studRes.value.data || [];
        setStudents(studs);
        // Default sab PRESENT
        const def = {};
        studs.forEach(s => { def[s.id] = 'PRESENT'; });
        setAttendance(def);
      }

      if (statusRes.status === 'fulfilled') {
        setTodayStatus(statusRes.value.data);
      }

      // Check if already marked for selected date
      if (selectedDate) {
        const dayRes = await attendanceApi.getClassByDate(
          Number(selectedClass), selectedDate);
        const marked = dayRes.data?.alreadyMarked || false;
        setAlreadyMarked(marked);
        if (marked && dayRes.data?.records?.length > 0) {
          // Pre-fill existing attendance
          const existing = {};
          dayRes.data.records.forEach(r => { existing[r.studentId] = r.status; });
          setAttendance(existing);
        }
      }
    } catch {}
    finally { setLoading(false); }
  }, [selectedClass, selectedDate]);

  useEffect(() => { loadStudentsAndStatus(); }, [loadStudentsAndStatus]);

  const handleStatusChange = (studentId, newStatus) => {
    if (!newStatus) return;
    setAttendance(prev => ({ ...prev, [studentId]: newStatus }));
  };

  const markAll = (status) => {
    const all = {};
    students.forEach(s => { all[s.id] = status; });
    setAttendance(all);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const cls = classes.find(c => String(c.id) === String(selectedClass));
      const payload = {
        classId: Number(selectedClass),
        className: cls?.name || '',
        date: selectedDate,
        students: students.map(s => ({
          studentId: s.id,
          studentName: `${s.firstName} ${s.lastName}`,
          status: attendance[s.id] || 'PRESENT',
          remarks: remarks[s.id] || '',
        })),
      };
      await attendanceApi.markBulk(payload);
      toast.success(`✅ ${students.length} students ki attendance save ho gayi!`);
      setAlreadyMarked(true);
      setConfirmOpen(false);
      loadStudentsAndStatus();
    } catch (e) {
      toast.error('Attendance save karne mein error: ' + (e.response?.data?.error || e.message));
    } finally { setSaving(false); }
  };

  // Stats
  const presentCount  = Object.values(attendance).filter(s => s === 'PRESENT').length;
  const absentCount   = Object.values(attendance).filter(s => s === 'ABSENT').length;
  const lateCount     = Object.values(attendance).filter(s => s === 'LATE').length;
  const halfDayCount  = Object.values(attendance).filter(s => s === 'HALF_DAY').length;
  const presentPct    = students.length > 0 ? Math.round(presentCount / students.length * 100) : 0;

  return (
    <Box sx={{ bgcolor: bg, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg,#0A2E1A,#2E7D32)',
        p: { xs: 2, md: 3 }, mb: 3,
      }}>
        <Typography variant="h5" fontWeight={900} color="#fff" mb={0.5}>
          📋 Attendance Lena
        </Typography>
        <Typography fontSize={13} color="rgba(255,255,255,0.65)">
          Class select karo → Date choose karo → Students mark karo → Save karo
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2, md: 3 }, pb: 4 }}>
        {/* Controls */}
        <Card sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 3, mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth select label="Class Select Karo" size="small"
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? '#1e2a3e' : '#f8f9ff' } }}
                >
                  {classes.map(c => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {c.name} {c.section ? `- ${c.section}` : ''} ({c.academicYear})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth label="Date" type="date" size="small"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? '#1e2a3e' : '#f8f9ff' } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" color="success"
                    onClick={() => markAll('PRESENT')} sx={{ flex: 1, fontSize: 11 }}>
                    All Present
                  </Button>
                  <Button size="small" variant="outlined" color="error"
                    onClick={() => markAll('ABSENT')} sx={{ flex: 1, fontSize: 11 }}>
                    All Absent
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Already marked warning */}
        {alreadyMarked && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            ✅ Is date ki attendance pehle se mark hai. Aap edit karke re-submit kar sakte ho.
          </Alert>
        )}

        {/* Stats row */}
        {students.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Present', count: presentCount, color: '#2E7D32', bg: '#E8F5E9' },
              { label: 'Absent',  count: absentCount,  color: '#C62828', bg: '#FFEBEE' },
              { label: 'Late',    count: lateCount,    color: '#E65100', bg: '#FFF3E0' },
              { label: 'Half Day',count: halfDayCount, color: '#1565C0', bg: '#E3F2FD' },
            ].map(s => (
              <Grid item xs={6} sm={3} key={s.label}>
                <Card sx={{ bgcolor: isDark ? card : s.bg, border: `1px solid ${bord}`, borderRadius: 2, textAlign: 'center' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.count}</Typography>
                    <Typography fontSize={12} color={sub}>{s.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Progress bar */}
        {students.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography fontSize={13} color={sub}>Attendance Rate</Typography>
              <Typography fontSize={13} fontWeight={700} color={presentPct >= 75 ? '#2E7D32' : '#C62828'}>
                {presentPct}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate" value={presentPct}
              sx={{ height: 8, borderRadius: 4,
                '& .MuiLinearProgress-bar': { bgcolor: presentPct >= 75 ? '#2E7D32' : '#C62828' } }}
            />
          </Box>
        )}

        {/* Students list */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#2E7D32' }} />
          </Box>
        ) : students.length === 0 ? (
          <Card sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <EventNoteIcon sx={{ fontSize: 60, color: sub, mb: 2 }} />
              <Typography color={sub}>
                {classes.length === 0
                  ? 'Pehle Admin se class banwao'
                  : 'Is class mein koi student nahi hai'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 3 }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${bord}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography fontWeight={700} color={text}>
                {students.length} Students — {classes.find(c => String(c.id) === String(selectedClass))?.name}
              </Typography>
              <Chip label={alreadyMarked ? 'Already Marked' : 'Not Marked'} size="small"
                color={alreadyMarked ? 'success' : 'warning'} />
            </Box>

            {students.map((student, idx) => {
              const status = attendance[student.id] || 'PRESENT';
              const cfg = STATUS_CONFIG[status];
              return (
                <Box key={student.id}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    p: 1.5, px: 2,
                    bgcolor: isDark ? 'transparent' : cfg.bg + '55',
                    transition: 'background .15s',
                  }}>
                    {/* Avatar */}
                    <Avatar sx={{ width: 38, height: 38, bgcolor: cfg.color, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {student.firstName?.[0]}{student.lastName?.[0]}
                    </Avatar>

                    {/* Name */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontSize={14} fontWeight={600} color={text} noWrap>
                        {student.firstName} {student.lastName}
                      </Typography>
                      <Typography fontSize={11} color={sub}>
                        Roll #{student.rollNumber || idx + 1}
                      </Typography>
                    </Box>

                    {/* Status toggle */}
                    <ToggleButtonGroup
                      value={status}
                      exclusive
                      onChange={(_, val) => handleStatusChange(student.id, val)}
                      size="small"
                      sx={{ flexShrink: 0 }}
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, c]) => (
                        <ToggleButton
                          key={key} value={key}
                          sx={{
                            px: { xs: 1, sm: 1.5 }, py: 0.5,
                            fontSize: { xs: 10, sm: 11 },
                            fontWeight: 700,
                            border: `1px solid ${c.color}44 !important`,
                            color: status === key ? '#fff' : c.color,
                            bgcolor: status === key ? c.color : 'transparent',
                            '&.Mui-selected': { bgcolor: c.color, color: '#fff' },
                            '&:hover': { bgcolor: c.bg },
                            minWidth: { xs: 32, sm: 60 },
                          }}
                        >
                          <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>{c.icon}</Box>
                          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{c.label}</Box>
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Box>
                  {idx < students.length - 1 && <Divider sx={{ borderColor: bord }} />}
                </Box>
              );
            })}

            {/* Submit button */}
            <Box sx={{ p: 2, borderTop: `1px solid ${bord}`, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Typography fontSize={13} color={sub} sx={{ alignSelf: 'center' }}>
                {presentCount} present / {students.length} total
              </Typography>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => setConfirmOpen(true)}
                disabled={students.length === 0}
                sx={{ bgcolor: '#2E7D32', borderRadius: 2, fontWeight: 700, px: 3 }}
              >
                Attendance Save Karo
              </Button>
            </Box>
          </Card>
        )}
      </Box>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>✅ Attendance Confirm Karo</DialogTitle>
        <DialogContent>
          <Typography mb={1.5}>
            <strong>{selectedDate}</strong> ke liye attendance save karoge?
          </Typography>
          <Grid container spacing={1}>
            {[
              { label: '✅ Present', count: presentCount, color: '#2E7D32' },
              { label: '❌ Absent',  count: absentCount,  color: '#C62828' },
              { label: '⏰ Late',    count: lateCount,    color: '#E65100' },
              { label: '✂️ Half',    count: halfDayCount, color: '#1565C0' },
            ].map(s => (
              <Grid item xs={6} key={s.label}>
                <Box sx={{ p: 1, borderRadius: 2, border: `1px solid ${s.color}44`, textAlign: 'center' }}>
                  <Typography fontWeight={700} sx={{ color: s.color }}>{s.count}</Typography>
                  <Typography fontSize={11}>{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}
            sx={{ bgcolor: '#2E7D32', fontWeight: 700 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Haan, Save Karo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Chip, Alert, MenuItem, TextField, Divider, LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { attendanceApi } from '../../api/services';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAppSettings } from '../../context/AppSettingsContext';

const STATUS_COLORS = {
  PRESENT:  { color: '#2E7D32', bg: '#E8F5E9', label: 'P' },
  ABSENT:   { color: '#C62828', bg: '#FFEBEE', label: 'A' },
  LATE:     { color: '#E65100', bg: '#FFF3E0', label: 'L' },
  HALF_DAY: { color: '#1565C0', bg: '#E3F2FD', label: 'H' },
  HOLIDAY:  { color: '#7B1FA2', bg: '#F3E5F5', label: 'H' },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function MyAttendance() {
  const { isDark } = useAppSettings();
  const user = useSelector(selectUser);

  const now   = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year,  setYear]  = useState(now.getFullYear());
  const [summary,   setSummary]   = useState(null);
  const [records,   setRecords]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  const card = isDark ? '#161b27' : '#fff';
  const bord = isDark ? '#2d3348' : '#e8eaf6';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub  = isDark ? '#8892a4' : '#64748b';

  useEffect(() => {
    if (!user?.userId) return;
    const from = `${year}-${String(month + 1).padStart(2,'0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to   = `${year}-${String(month + 1).padStart(2,'0')}-${lastDay}`;

    setLoading(true);
    Promise.allSettled([
      attendanceApi.getStudentSummary(user.userId, from, to),
      attendanceApi.getStudentList(user.userId, from, to),
    ]).then(([sumRes, listRes]) => {
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data);
      if (listRes.status === 'fulfilled') setRecords(listRes.value.data || []);
    }).finally(() => setLoading(false));
  }, [user?.userId, month, year]);

  // Build calendar map: { 'YYYY-MM-DD': status }
  const calMap = {};
  records.forEach(r => { calMap[r.attendanceDate] = r.status; });

  // Build calendar days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

  const pct = summary?.attendancePercentage || 0;
  const pctColor = pct >= 75 ? '#2E7D32' : pct >= 60 ? '#E65100' : '#C62828';
  const pctLabel = pct >= 75 ? 'Good 👍' : pct >= 60 ? 'Warning ⚠️' : 'Critical ❗';

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} color={text} mb={0.5}>
        📅 Meri Attendance
      </Typography>
      <Typography fontSize={13} color={sub} mb={3}>
        Apni attendance percentage aur calendar dekho
      </Typography>

      {/* Month/Year selector */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField select label="Month" size="small" value={month}
          onChange={e => setMonth(Number(e.target.value))} sx={{ width: 140 }}>
          {MONTHS.map((m, i) => <MenuItem key={i} value={i}>{m}</MenuItem>)}
        </TextField>
        <TextField select label="Year" size="small" value={year}
          onChange={e => setYear(Number(e.target.value))} sx={{ width: 120 }}>
          {[2025, 2026, 2027].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Left: Summary cards */}
          <Grid item xs={12} md={4}>
            {/* Main percentage card */}
            <Card sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 3, mb: 2, overflow: 'hidden' }}>
              <Box sx={{ background: `linear-gradient(135deg, ${pctColor}22, ${pctColor}11)`, p: 3, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                  <CircularProgress
                    variant="determinate" value={pct} size={100}
                    thickness={6}
                    sx={{ color: pctColor, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
                  />
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h5" fontWeight={900} sx={{ color: pctColor }}>
                      {pct}%
                    </Typography>
                  </Box>
                </Box>
                <Typography fontWeight={700} color={text} mt={0.5}>Attendance Rate</Typography>
                <Chip label={pctLabel} size="small"
                  sx={{ mt: 1, bgcolor: pctColor, color: '#fff', fontWeight: 700 }} />
              </Box>
              <CardContent>
                <LinearProgress variant="determinate" value={pct}
                  sx={{ height: 8, borderRadius: 4, mb: 2,
                    '& .MuiLinearProgress-bar': { bgcolor: pctColor } }} />
                {pct < 75 && (
                  <Alert severity={pct < 60 ? 'error' : 'warning'} sx={{ borderRadius: 2, fontSize: 12 }}>
                    {pct < 60
                      ? '❗ Attendance bahut kam hai! Teacher se baat karo.'
                      : '⚠️ 75% se kam hai. Improve karo!'}
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Counts */}
            <Card sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={700} color={text} mb={2}>Month Summary</Typography>
                {[
                  { icon: <CheckCircleIcon sx={{ color: '#2E7D32', fontSize: 20 }} />, label: 'Present', count: summary?.presentDays || 0, color: '#2E7D32' },
                  { icon: <CancelIcon sx={{ color: '#C62828', fontSize: 20 }} />,      label: 'Absent',  count: summary?.absentDays  || 0, color: '#C62828' },
                  { icon: <AccessTimeIcon sx={{ color: '#E65100', fontSize: 20 }} />,  label: 'Late',    count: summary?.lateDays    || 0, color: '#E65100' },
                  { icon: <EventAvailableIcon sx={{ color: '#1565C0', fontSize: 20 }} />, label: 'Total Working', count: summary?.totalDays || 0, color: '#1565C0' },
                ].map((item, i) => (
                  <Box key={i}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                      {item.icon}
                      <Typography fontSize={13} color={text} flex={1}>{item.label}</Typography>
                      <Typography fontWeight={700} sx={{ color: item.color }}>{item.count} days</Typography>
                    </Box>
                    {i < 3 && <Divider sx={{ borderColor: bord }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Right: Calendar */}
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 3 }}>
              <Box sx={{ p: 2, borderBottom: `1px solid ${bord}` }}>
                <Typography fontWeight={700} color={text}>
                  📆 {MONTHS[month]} {year} — Attendance Calendar
                </Typography>
              </Box>
              <CardContent>
                {/* Day headers */}
                <Grid container sx={{ mb: 1 }}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <Grid item key={d} xs={12/7}>
                      <Typography fontSize={11} fontWeight={700} color={sub} textAlign="center">
                        {d}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Calendar days */}
                <Grid container>
                  {calDays.map((day, idx) => {
                    if (!day) return <Grid item key={`empty-${idx}`} xs={12/7} sx={{ p: 0.3 }}><Box sx={{ height: 44 }} /></Grid>;
                    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                    const status  = calMap[dateStr];
                    const cfg     = status ? STATUS_COLORS[status] : null;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    const isSun   = new Date(dateStr).getDay() === 0;

                    return (
                      <Grid item key={day} xs={12/7} sx={{ p: 0.3 }}>
                        <Box sx={{
                          height: 44, borderRadius: 2,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          bgcolor: cfg ? cfg.bg : (isDark ? '#1e2a3e' : '#f8f9ff'),
                          border: isToday ? `2px solid ${pctColor}` : `1px solid ${bord}`,
                          cursor: 'default',
                          transition: 'all .15s',
                          opacity: isSun ? 0.5 : 1,
                        }}>
                          <Typography fontSize={12} fontWeight={isToday ? 800 : 500}
                            sx={{ color: cfg ? cfg.color : sub }}>
                            {day}
                          </Typography>
                          {cfg && (
                            <Typography fontSize={9} fontWeight={700} sx={{ color: cfg.color }}>
                              {cfg.label}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Legend */}
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${bord}`, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {Object.entries(STATUS_COLORS).map(([key, cfg]) => (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: cfg.bg, border: `1px solid ${cfg.color}` }} />
                      <Typography fontSize={11} color={sub}>{key}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

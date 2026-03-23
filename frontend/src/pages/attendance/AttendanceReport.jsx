import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, MenuItem, TextField, Alert, LinearProgress, Avatar
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { attendanceApi, classApi } from '../../api/services';
import { useAppSettings } from '../../context/AppSettingsContext';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

export default function AttendanceReport() {
  const { isDark } = useAppSettings();
  const now = new Date();

  const [classes,    setClasses]    = useState([]);
  const [selClass,   setSelClass]   = useState('');
  const [month,      setMonth]      = useState(now.getMonth() + 1);
  const [year,       setYear]       = useState(now.getFullYear());
  const [report,     setReport]     = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [fetched,    setFetched]    = useState(false);

  const card = isDark ? '#161b27' : '#fff';
  const bord = isDark ? '#2d3348' : '#e8eaf6';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub  = isDark ? '#8892a4' : '#64748b';

  useEffect(() => {
    classApi.getAll().then(r => {
      const cls = Array.isArray(r.data) ? r.data : r.data?.content || [];
      setClasses(cls);
      if (cls.length > 0) setSelClass(String(cls[0].id));
    }).catch(() => {});
  }, []);

  const fetchReport = async () => {
    if (!selClass) return;
    setLoading(true);
    try {
      const res = await attendanceApi.getMonthlyReport(Number(selClass), month, year);
      setReport(res.data || []);
      setFetched(true);
    } catch { setReport([]); setFetched(true); }
    finally { setLoading(false); }
  };

  // Auto-fetch when class/month/year changes
  useEffect(() => {
    if (selClass) fetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selClass, month, year]);

  const avgPct = report.length > 0
    ? (report.reduce((s, r) => s + r.percentage, 0) / report.length).toFixed(1)
    : 0;
  const critical = report.filter(r => r.percentage < 60).length;
  const warning  = report.filter(r => r.percentage >= 60 && r.percentage < 75).length;
  const good     = report.filter(r => r.percentage >= 75).length;

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} color={text} mb={0.5}>
        📊 Attendance Report
      </Typography>
      <Typography fontSize={13} color={sub} mb={3}>
        Class aur month select karo — monthly attendance report dekho
      </Typography>

      {/* Filters */}
      <Card sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField fullWidth select label="Class" size="small" value={selClass}
                onChange={e => setSelClass(e.target.value)}>
                {classes.map(c => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name} {c.section ? `- ${c.section}` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth select label="Month" size="small" value={month}
                onChange={e => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => <MenuItem key={i+1} value={i+1}>{m}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField fullWidth select label="Year" size="small" value={year}
                onChange={e => setYear(Number(e.target.value))}>
                {[2025, 2026, 2027].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : fetched && report.length === 0 ? (
        <Card sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AssessmentIcon sx={{ fontSize: 60, color: sub, mb: 2 }} />
            <Typography color={sub}>Is mahine ka koi attendance data nahi mila</Typography>
            <Typography fontSize={12} color={sub} mt={1}>
              Teacher ne attendance mark ki hogi tab yahan dikhega
            </Typography>
          </CardContent>
        </Card>
      ) : report.length > 0 ? (
        <>
          {/* Summary stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Class Average',  value: `${avgPct}%`, color: '#1565C0', sub: 'Overall' },
              { label: '✅ Good (≥75%)', value: good,         color: '#2E7D32', sub: 'Students' },
              { label: '⚠️ Warning',     value: warning,       color: '#E65100', sub: '60–75%' },
              { label: '❗ Critical',    value: critical,       color: '#C62828', sub: '<60%' },
            ].map(s => (
              <Grid item xs={6} sm={3} key={s.label}>
                <Card sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 2, textAlign: 'center' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                    <Typography fontSize={11} fontWeight={700} color={text}>{s.label}</Typography>
                    <Typography fontSize={10} color={sub}>{s.sub}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Critical alert */}
          {critical > 0 && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              ❗ <strong>{critical} students</strong> ki attendance 60% se kam hai — immediate action required!
            </Alert>
          )}

          {/* Report table */}
          <TableContainer component={Paper} elevation={0}
            sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? '#1e2a3e' : '#0B1F3A' }}>
                  {['Student', 'Present', 'Absent', 'Late', 'Working Days', 'Attendance %', 'Status'].map(h => (
                    <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {report.map((row, i) => {
                  const color = row.percentage >= 75 ? '#2E7D32'
                    : row.percentage >= 60 ? '#E65100' : '#C62828';
                  const status = row.percentage >= 75 ? 'Good'
                    : row.percentage >= 60 ? 'Warning' : 'Critical';
                  const chipColor = row.percentage >= 75 ? 'success'
                    : row.percentage >= 60 ? 'warning' : 'error';
                  return (
                    <TableRow key={i}
                      sx={{ bgcolor: i % 2 === 0
                        ? (isDark ? '#1e2a3e22' : '#f8f9ff')
                        : 'transparent' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: color, fontSize: 12 }}>
                            {row.studentName?.[0]}
                          </Avatar>
                          <Typography fontSize={13} fontWeight={600} color={text}>
                            {row.studentName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#2E7D32', fontWeight: 700 }}>{row.presentDays}</TableCell>
                      <TableCell sx={{ color: '#C62828', fontWeight: 700 }}>{row.absentDays}</TableCell>
                      <TableCell sx={{ color: '#E65100', fontWeight: 700 }}>{row.lateDays}</TableCell>
                      <TableCell sx={{ color: text }}>{row.totalWorkingDays}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography fontSize={13} fontWeight={700} sx={{ color }}>
                            {row.percentage}%
                          </Typography>
                          <LinearProgress variant="determinate" value={row.percentage}
                            sx={{ height: 4, borderRadius: 2, mt: 0.3,
                              '& .MuiLinearProgress-bar': { bgcolor: color } }} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={status} size="small" color={chipColor}
                          sx={{ fontWeight: 700, fontSize: 11 }} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </Box>
  );
}

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button, Chip, Alert
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { studentApi, classApi } from '../../api/services';
import apiClient from '../../api/apiClient';

const StatCard = ({ icon, label, value, color, path, hint, onClick }) => (
  <Card elevation={2} sx={{
    borderRadius:2, cursor:'pointer',
    borderLeft:`5px solid ${color}`,
    '&:hover':{ boxShadow:8, transform:'translateY(-3px)', transition:'0.2s' }
  }} onClick={onClick}>
    <CardContent sx={{ display:'flex', alignItems:'center', gap:2, py:2.5 }}>
      <Avatar sx={{ bgcolor:color + '20', color, width:52, height:52 }}>
        {icon}
      </Avatar>
      <Box sx={{ flex:1 }}>
        <Typography variant="h5" fontWeight="bold" color={color}>{value}</Typography>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
      </Box>
      <ArrowForwardIcon sx={{ color, opacity:0.5 }} />
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [counts, setCounts] = useState({ students:0, teachers:0, classes:0, tasks:0 });
  const [noClasses, setNoClasses] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c, t, tk] = await Promise.allSettled([
          studentApi.getAll(),
          classApi.getAll(),
          apiClient.get('/teachers'),
          apiClient.get('/students/tasks/all'),
        ]);
        const cls = c.status === 'fulfilled'
          ? (Array.isArray(c.value.data) ? c.value.data : c.value.data?.content || []) : [];
        setNoClasses(cls.length === 0);
        setCounts({
          students: s.status === 'fulfilled' ? (s.value.data?.totalElements || s.value.data?.content?.length || s.value.data?.length || 0) : 0,
          classes:  cls.length,
          teachers: t.status === 'fulfilled' ? (t.value.data?.length || 0) : 0,
          tasks:    tk.status === 'fulfilled' ? (tk.value.data?.length || 0) : 0,
        });
      } catch {}
    };
    load();
  }, []);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" color="#1E3A5F">
          🏫 Admin Dashboard
        </Typography>
        <Typography color="text.secondary">
          Namaste <strong>{user?.username}</strong> — School ka poora control yahan hai
        </Typography>
      </Box>

      {/* Setup guide */}
      {noClasses && (
        <Alert severity="info" sx={{ mb:3, borderRadius:2 }}>
          <strong>🚀 Shuru Karne Ka Sahi Order:</strong>
          <Box component="ol" sx={{ m:0, pl:2 }}>
            <li>Pehle <strong>Classes</strong> banao (Play Group, Class 1, Class 2...)</li>
            <li>Phir <strong>Teachers</strong> add karo</li>
            <li>Phir <strong>Students</strong> add karo (class select karke)</li>
          </Box>
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<ClassIcon sx={{ fontSize:26 }} />}
            label="Classes" value={counts.classes} color="#2980B9"
            hint="Pehle yahan se shuru karo"
            onClick={() => navigate('/admin/classes')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PersonIcon sx={{ fontSize:26 }} />}
            label="Teachers" value={counts.teachers} color="#27AE60"
            hint="Staff manage karo"
            onClick={() => navigate('/admin/teachers')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PeopleIcon sx={{ fontSize:26 }} />}
            label="Students" value={counts.students} color="#1E3A5F"
            hint="Saare students"
            onClick={() => navigate('/admin/students')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<TaskAltIcon sx={{ fontSize:26 }} />}
            label="Tasks" value={counts.tasks} color="#E67E22"
            hint="Assigned tasks"
            onClick={() => navigate('/admin/tasks')} />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card elevation={2} sx={{ borderRadius:2, mb:3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color="#1E3A5F" mb={2}>
            ⚡ Quick Actions
          </Typography>
          <Box sx={{ display:'flex', gap:1.5, flexWrap:'wrap' }}>
            <Button variant="contained" sx={{ bgcolor:'#2980B9' }}
              onClick={() => navigate('/admin/classes')}>
              + Nayi Class
            </Button>
            <Button variant="contained" sx={{ bgcolor:'#27AE60' }}
              onClick={() => navigate('/admin/teachers')}>
              + Teacher Add Karo
            </Button>
            <Button variant="contained" sx={{ bgcolor:'#1E3A5F' }}
              onClick={() => navigate('/admin/students')}>
              + Student Add Karo
            </Button>
            <Button variant="outlined"
              onClick={() => navigate('/admin/calendar')}>
              📅 Calendar
            </Button>
            <Button variant="outlined"
              onClick={() => navigate('/admin/gallery')}>
              🖼️ Gallery
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Login info */}
      <Card elevation={1} sx={{ borderRadius:2, bgcolor:'#F8F9FA' }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>🔐 Default Login Credentials</Typography>
          <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
            {[
              { role:'Admin', u:'admin', p:'admin123' },
              { role:'Teacher', u:'teacher1', p:'teacher123' },
              { role:'Student', u:'student1', p:'student123' },
            ].map(({ role, u, p }) => (
              <Chip key={role} label={`${role}: ${u} / ${p}`} size="small" variant="outlined" />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
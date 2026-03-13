import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const StatCard = ({ icon, label, color, path, onClick }) => (
  <Card elevation={3} sx={{
    borderRadius: 2, cursor: 'pointer',
    borderLeft: `5px solid ${color}`,
    '&:hover': { boxShadow: 8, transform: 'translateY(-3px)', transition: '0.2s' }
  }} onClick={onClick}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3 }}>
      <Avatar sx={{ bgcolor: color + '20', color, width: 56, height: 56 }}>
        {icon}
      </Avatar>
      <Typography variant="h6" fontWeight="bold">{label}</Typography>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h5" fontWeight="bold" color="#1E3A5F">
          Admin Dashboard 🏫
        </Typography>
        <Typography color="text.secondary">
          Namaste {user?.username} — School ka poora control yahan hai
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon sx={{ fontSize: 28 }} />}
            label="Students Manage Karo"
            color="#1E3A5F"
            onClick={() => navigate('/admin/students')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PersonIcon sx={{ fontSize: 28 }} />}
            label="Teachers Manage Karo"
            color="#27AE60"
            onClick={() => navigate('/admin/teachers')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ClassIcon sx={{ fontSize: 28 }} />}
            label="Classes Manage Karo"
            color="#2980B9"
            onClick={() => navigate('/admin/classes')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CalendarMonthIcon sx={{ fontSize: 28 }} />}
            label="Calendar Manage Karo"
            color="#E67E22"
            onClick={() => navigate('/admin/calendar')}
          />
        </Grid>
      </Grid>

      <Card elevation={2} sx={{ borderRadius: 2, bgcolor: '#F0F7FF' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color="#1E3A5F" mb={2}>
            🔧 Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" sx={{ bgcolor: '#1E3A5F' }}
                onClick={() => navigate('/admin/students')}>
                + Naya Student Add Karo
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" sx={{ borderColor: '#27AE60', color: '#27AE60' }}
                onClick={() => navigate('/admin/teachers')}>
                + Naya Teacher Add Karo
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" sx={{ borderColor: '#2980B9', color: '#2980B9' }}
                onClick={() => navigate('/admin/classes')}>
                + Naya Class Banao
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;

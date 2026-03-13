import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArticleIcon from '@mui/icons-material/Article';
import QuizIcon from '@mui/icons-material/Quiz';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const ActionCard = ({ icon, title, desc, color, path, onClick }) => (
  <Card elevation={2} sx={{
    borderRadius: 2, cursor: 'pointer',
    borderTop: `4px solid ${color}`,
    '&:hover': { boxShadow: 8, transform: 'translateY(-3px)', transition: '0.2s' }
  }} onClick={onClick}>
    <CardContent sx={{ textAlign: 'center', py: 4 }}>
      <Avatar sx={{ bgcolor: color + '20', color, width: 60, height: 60, mx: 'auto', mb: 2 }}>
        {icon}
      </Avatar>
      <Typography variant="h6" fontWeight="bold" mb={1}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{desc}</Typography>
    </CardContent>
  </Card>
);

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h5" fontWeight="bold" color="#1E3A5F">
          Namaste, {user?.username} 👋
        </Typography>
        <Typography color="text.secondary">
          Aapka Teacher Dashboard — yahan se sab manage karo
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <ActionCard
            icon={<AssignmentIcon sx={{ fontSize: 32 }} />}
            title="Exams Banao"
            desc="Naya exam create karo apni class ke liye"
            color="#1E3A5F"
            onClick={() => navigate('/teacher/exams')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ActionCard
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            title="Results Update Karo"
            desc="Student ke marks enter karo"
            color="#27AE60"
            onClick={() => navigate('/teacher/results')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ActionCard
            icon={<ArticleIcon sx={{ fontSize: 32 }} />}
            title="Content Upload Karo"
            desc="Notes, videos, assignments upload karo"
            color="#2980B9"
            onClick={() => navigate('/teacher/content')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ActionCard
            icon={<QuizIcon sx={{ fontSize: 32 }} />}
            title="Online Test Banao"
            desc="MCQ test create karo students ke liye"
            color="#E67E22"
            onClick={() => navigate('/teacher/exams')}
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Card elevation={2} sx={{ borderRadius: 2, bgcolor: '#F0F7FF', border: '1px solid #2980B9' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" color="#1E3A5F" mb={1}>
              💡 Yaad Rakhna
            </Typography>
            <Typography color="text.secondary">
              • <strong>Class Teacher</strong> ho toh content poori class ko dikhega<br/>
              • <strong>Subject Teacher</strong> ho toh content sirf us subject ke students ko dikhega<br/>
              • Results publish karne ke baad hi students dekh sakte hain
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;

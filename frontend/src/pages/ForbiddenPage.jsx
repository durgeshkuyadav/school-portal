import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

const ForbiddenPage = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', bgcolor: '#F5F7FA' }}>
      <LockIcon sx={{ fontSize: 80, color: '#E53935', mb: 2 }} />
      <Typography variant="h4" fontWeight="bold" color="#1E3A5F" mb={1}>
        403 - Access Nahi Hai
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Aapko is page ko dekhne ki permission nahi hai
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}
        sx={{ bgcolor: '#1E3A5F' }}>
        Home Pe Jao
      </Button>
    </Box>
  );
};

export default ForbiddenPage;

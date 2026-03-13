import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button,
  Chip, CircularProgress, LinearProgress
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import QuizIcon from '@mui/icons-material/Quiz';
import { testApi } from '../../api/services';

const OnlineTest = () => {
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [testsRes, attemptsRes] = await Promise.allSettled([
          testApi.getAvailableTests(),
          testApi.getMyAttempts(),
        ]);
        if (testsRes.status === 'fulfilled') setTests(testsRes.value.data || []);
        if (attemptsRes.status === 'fulfilled') setAttempts(attemptsRes.value.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const attemptedIds = attempts.map(a => a.testId);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={1} color="#1E3A5F">
        🧪 Online Tests
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Teacher ke diye hue tests yahan dikhenge
      </Typography>

      {/* Completed Tests */}
      {attempts.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" mb={2} color="#27AE60">
            ✅ Completed Tests
          </Typography>
          <Grid container spacing={2}>
            {attempts.map((a, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card elevation={2} sx={{ borderRadius: 2, borderLeft: '4px solid #27AE60' }}>
                  <CardContent>
                    <Typography fontWeight="bold">{a.testTitle || 'Test'}</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Score</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {a.score} / {a.totalMarks}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={a.percentage || 0}
                        color={a.percentage >= 50 ? 'success' : 'error'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {a.percentage?.toFixed(1)}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Available Tests */}
      <Typography variant="h6" fontWeight="bold" mb={2} color="#1E3A5F">
        📝 Available Tests
      </Typography>

      {tests.length === 0 ? (
        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <QuizIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Abhi koi test available nahi
            </Typography>
            <Typography color="text.secondary" mt={1}>
              Teacher jab test create karega, yahan dikhega
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {tests.map((t, i) => {
            const attempted = attemptedIds.includes(t.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={t.id || i}>
                <Card elevation={2} sx={{
                  borderRadius: 2,
                  borderLeft: `4px solid ${attempted ? '#ccc' : '#E67E22'}`,
                  opacity: attempted ? 0.7 : 1
                }}>
                  <CardContent>
                    <Typography fontWeight="bold" mb={1}>{t.title}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {t.subjectName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<TimerIcon />}
                        label={`${t.durationMinutes} min`}
                        size="small"
                      />
                      <Chip
                        label={`${t.totalMarks} marks`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={attempted}
                      sx={{
                        bgcolor: attempted ? '#ccc' : '#E67E22',
                        '&:hover': { bgcolor: '#D35400' }
                      }}
                    >
                      {attempted ? 'Already Attempted' : 'Start Test'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default OnlineTest;

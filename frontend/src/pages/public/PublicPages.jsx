import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar,
  Chip, CircularProgress, Container
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import { teacherApi, calendarApi } from '../../api/services';

// ── Teacher Directory ─────────────────────────────────────────────
export const TeacherDirectory = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherApi.getPublicProfiles()
      .then(res => setTeachers(res.data || []))
      .catch(() => setTeachers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #1E3A5F, #2980B9)', color: 'white', py: 6, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold">👨‍🏫 Our Teachers</Typography>
        <Typography sx={{ opacity: 0.85, mt: 1 }}>Meet the dedicated faculty of our school</Typography>
      </Box>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
        ) : teachers.length === 0 ? (
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <PersonIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No teacher profiles published yet</Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {teachers.map((t, i) => (
              <Grid item xs={12} sm={6} md={4} key={t.id || i}>
                <Card elevation={2} sx={{ borderRadius: 2, textAlign: 'center',
                  '&:hover': { boxShadow: 8, transform: 'translateY(-3px)', transition: '0.2s' } }}>
                  <CardContent sx={{ py: 4 }}>
                    <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#1E3A5F', fontSize: 28 }}>
                      {t.firstName?.[0] || 'T'}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">{t.firstName} {t.lastName}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>{t.designation || 'Teacher'}</Typography>
                    {t.subjects && t.subjects.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', mt: 1 }}>
                        {t.subjects.map((s, j) => (
                          <Chip key={j} label={s} size="small" variant="outlined" color="primary" />
                        ))}
                      </Box>
                    )}
                    {t.qualification && (
                      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        🎓 {t.qualification}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

// ── School Gallery ────────────────────────────────────────────────
export const SchoolGallery = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7FA' }}>
    <Box sx={{ background: 'linear-gradient(135deg, #1E3A5F, #2980B9)', color: 'white', py: 6, textAlign: 'center' }}>
      <Typography variant="h4" fontWeight="bold">🖼️ School Gallery</Typography>
      <Typography sx={{ opacity: 0.85, mt: 1 }}>Memories from our school</Typography>
    </Box>
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">Gallery coming soon...</Typography>
        </CardContent>
      </Card>
    </Container>
  </Box>
);

// ── School Calendar ───────────────────────────────────────────────
const EVENT_COLORS = {
  HOLIDAY: '#E74C3C', EXAM: '#E67E22', SPORTS: '#27AE60',
  CULTURAL: '#9B59B6', MEETING: '#2980B9', OTHER: '#95A5A6',
};

export const SchoolCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    calendarApi.getEvents(now.getMonth() + 1, now.getFullYear())
      .then(res => setEvents(Array.isArray(res.data) ? res.data : res.data?.content || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #1E3A5F, #2980B9)', color: 'white', py: 6, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold">📅 School Calendar</Typography>
        <Typography sx={{ opacity: 0.85, mt: 1 }}>
          Events & holidays for {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Typography>
      </Box>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
        ) : events.length === 0 ? (
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <EventIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No events this month</Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {events.map((event, i) => (
              <Grid item xs={12} sm={6} md={4} key={event.id || i}>
                <Card elevation={2} sx={{ borderRadius: 2, borderLeft: `4px solid ${EVENT_COLORS[event.eventType] || '#95A5A6'}` }}>
                  <CardContent>
                    <Typography fontWeight="bold">{event.title}</Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      📅 {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                    </Typography>
                    {event.description && (
                      <Typography variant="body2" color="text.secondary" mt={0.5}>{event.description}</Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip label={event.eventType} size="small"
                        sx={{ bgcolor: EVENT_COLORS[event.eventType], color: 'white', fontSize: '0.7rem' }} />
                      {event.isHoliday && <Chip label="Holiday" size="small" color="error" />}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default TeacherDirectory;

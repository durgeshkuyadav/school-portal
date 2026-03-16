import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import DeleteIcon from '@mui/icons-material/Delete';
import { calendarApi } from '../../api/services';
import { toast } from 'react-toastify';

const EVENT_TYPES = ['HOLIDAY', 'EXAM', 'SPORTS', 'CULTURAL', 'MEETING', 'OTHER'];

const EVENT_COLORS = {
  HOLIDAY: '#E74C3C',
  EXAM: '#E67E22',
  SPORTS: '#27AE60',
  CULTURAL: '#9B59B6',
  MEETING: '#2980B9',
  OTHER: '#95A5A6',
};

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({
    title: '', eventType: 'OTHER', eventDate: '', description: '', isHoliday: false,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await calendarApi.getEvents(currentMonth, currentYear);
      setEvents(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await calendarApi.createEvent(form);
      toast.success('Event created!');
      setDialogOpen(false);
      setForm({ title: '', eventType: 'OTHER', eventDate: '', description: '', isHoliday: false });
      fetchEvents();
    } catch {
      toast.error('Failed to create event');
    }
  };

  const handleDelete = async (id) => {
    try {
      await calendarApi.deleteEvent(id);
      toast.success('Event deleted');
      fetchEvents();
    } catch {
      toast.error('Failed to delete event');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">School Calendar</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage events, holidays & exam schedules
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Event
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {events.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <EventIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No events this month</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setDialogOpen(true)}>
              Add First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card sx={{ borderLeft: `4px solid ${EVENT_COLORS[event.eventType] || '#95A5A6'}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">{event.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        📅 {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </Typography>
                      {event.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {event.description}
                        </Typography>
                      )}
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Chip
                          label={event.eventType}
                          size="small"
                          sx={{ bgcolor: EVENT_COLORS[event.eventType], color: 'white', fontSize: '0.7rem' }}
                        />
                        {event.isHoliday && <Chip label="Holiday" size="small" color="error" />}
                      </Box>
                    </Box>
                    <Button size="small" color="error" onClick={() => handleDelete(event.id)}>
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Event Title" fullWidth required
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            label="Event Type" select fullWidth
            value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}
          >
            {EVENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField
            label="Event Date" type="date" fullWidth required
            InputLabelProps={{ shrink: true }}
            value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
          />
          <TextField
            label="Description" fullWidth multiline rows={2}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.title || !form.eventDate}>
            Create Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCalendar;

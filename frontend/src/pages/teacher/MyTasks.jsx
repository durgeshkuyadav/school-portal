import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, Alert, CircularProgress,
  Grid, LinearProgress, Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssignmentIcon from '@mui/icons-material/Assignment';
import apiClient from '../../api/apiClient';

const STATUS_COLORS = {
  PENDING: 'default', IN_PROGRESS: 'info', COMPLETED: 'success', CANCELLED: 'error'
};
const PRIORITY_COLORS = {
  URGENT: 'error', HIGH: 'warning', MEDIUM: 'info', LOW: 'default'
};

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/students/tasks/my-tasks');
      setTasks(data);
    } catch (e) {
      setError('Tasks load karne mein error');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/students/tasks/${selectedTask.id}/status`, { status: newStatus, note });
      setUpdateDialog(false);
      setSuccess('Task status update ho gaya!');
      loadTasks();
    } catch (e) {
      setError('Update failed');
    } finally { setSaving(false); }
  };

  const pending = tasks.filter(t => t.status === 'PENDING').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  const total = tasks.length;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={1}>Mere Tasks</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Admin ne aapko jo tasks assign kiye hain
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Progress overview */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" fontWeight="bold">Overall Progress</Typography>
          <Typography variant="body2" color="text.secondary">{completionPct}% complete</Typography>
        </Box>
        <LinearProgress variant="determinate" value={completionPct}
          sx={{ height: 8, borderRadius: 4, mb: 2 }} color="success" />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="caption">🔴 Pending: <b>{pending}</b></Typography>
          <Typography variant="caption">🔵 In Progress: <b>{inProgress}</b></Typography>
          <Typography variant="caption">🟢 Completed: <b>{completed}</b></Typography>
        </Box>
      </Card>

      {loading ? (
        <Box textAlign="center" py={4}><CircularProgress /></Box>
      ) : tasks.length === 0 ? (
        <Box textAlign="center" py={6}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary">Abhi koi task assigned nahi hai</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {tasks.map(task => (
            <Grid item xs={12} md={6} key={task.id}>
              <Card sx={{ borderLeft: `5px solid ${
                task.priority === 'URGENT' ? '#e74c3c' :
                task.priority === 'HIGH'   ? '#e67e22' :
                task.priority === 'MEDIUM' ? '#3498db' : '#95a5a6'
              }`, opacity: task.status === 'COMPLETED' ? 0.8 : 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{task.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip size="small" label={task.priority} color={PRIORITY_COLORS[task.priority]} />
                      <Chip size="small" label={task.status?.replace('_', ' ')} color={STATUS_COLORS[task.status]} />
                    </Box>
                  </Box>

                  {task.description && (
                    <Typography variant="body2" color="text.secondary" mb={1}>{task.description}</Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                    <Typography variant="caption">👤 By: <b>{task.assignedByName}</b></Typography>
                    {task.dueDate && (
                      <Typography variant="caption" color={
                        new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'error' : 'text.secondary'
                      }>
                        📅 Due: {new Date(task.dueDate).toLocaleDateString('en-IN')}
                      </Typography>
                    )}
                    <Typography variant="caption">📁 {task.category}</Typography>
                  </Box>

                  {task.adminRemark && (
                    <Alert severity="info" sx={{ mt: 1, py: 0.5 }}>
                      <Typography variant="caption"><b>Admin:</b> {task.adminRemark}</Typography>
                    </Alert>
                  )}

                  {task.completionNote && (
                    <Alert severity="success" sx={{ mt: 1, py: 0.5 }}>
                      <Typography variant="caption"><b>Aapka note:</b> {task.completionNote}</Typography>
                    </Alert>
                  )}

                  {/* Action buttons */}
                  {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                      {task.status === 'PENDING' && (
                        <Button size="small" variant="outlined" color="info"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => {
                            setSelectedTask(task); setNewStatus('IN_PROGRESS'); setNote(''); setUpdateDialog(true);
                          }}>
                          Start
                        </Button>
                      )}
                      <Button size="small" variant="contained" color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => {
                          setSelectedTask(task); setNewStatus('COMPLETED'); setNote(''); setUpdateDialog(true);
                        }}>
                        Mark Complete
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Status Update Dialog */}
      <Dialog open={updateDialog} onClose={() => setUpdateDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {newStatus === 'COMPLETED' ? '✅ Task Complete Karein' : '▶️ Task Start Karein'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Task: <b>{selectedTask?.title}</b>
          </Typography>
          <TextField fullWidth multiline rows={3}
            label={newStatus === 'COMPLETED' ? 'Completion Note (optional)' : 'Progress Note (optional)'}
            value={note} onChange={e => setNote(e.target.value)}
            placeholder={newStatus === 'COMPLETED' ? 'Task kis tarah complete kiya...' : 'Kya progress hai...'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained"
            color={newStatus === 'COMPLETED' ? 'success' : 'info'} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

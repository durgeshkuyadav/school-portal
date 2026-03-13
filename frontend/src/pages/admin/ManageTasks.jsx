import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Chip, IconButton, Grid, Alert, CircularProgress,
  Tooltip, Tabs, Tab, Badge, Avatar, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CommentIcon from '@mui/icons-material/Comment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';

const PRIORITY_COLORS = {
  URGENT: 'error', HIGH: 'warning', MEDIUM: 'info', LOW: 'default'
};
const STATUS_COLORS = {
  PENDING: 'default', IN_PROGRESS: 'info', COMPLETED: 'success', CANCELLED: 'error'
};
const PRIORITY_ORDER = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const emptyForm = {
  title: '', description: '', assignedToUserId: '', assignedToName: '',
  assignedToRole: '', priority: 'MEDIUM', category: 'ADMINISTRATIVE', dueDate: ''
};

export default function ManageTasks() {
  const [tasks, setTasks] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [remarkTask, setRemarkTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const userId = useSelector(s => s.auth.user?.userId);
  const role = useSelector(s => s.auth.user?.role);
  const isSuperAdmin = role === 'SUPER_ADMIN';

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isSuperAdmin ? '/students/tasks/all' : '/students/tasks/assigned-by-me';
      const { data } = await apiClient.get(endpoint);
      setTasks(data);
    } catch (e) {
      setError('Tasks load karne mein error: ' + (e.response?.data?.message || e.message));
    } finally { setLoading(false); }
  }, [isSuperAdmin]);

  const loadTeachers = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/teachers');
      setTeachers(data);
    } catch { setTeachers([]); }
  }, []);

  useEffect(() => { loadTasks(); loadTeachers(); }, [loadTasks, loadTeachers]);

  const filteredTasks = () => {
    const statusMap = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    const selected = statusMap[tab];
    if (selected === 'ALL') return [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    return tasks.filter(t => t.status === selected);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title required'); return; }
    if (!form.assignedToUserId) { setError('Please select a person to assign to'); return; }
    setSaving(true); setError('');
    try {
      if (editingTask) {
        await apiClient.put(`/students/tasks/${editingTask.id}`, form);
      } else {
        await apiClient.post('/students/tasks', form);
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingTask(null);
      loadTasks();
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Is task ko delete karein?')) return;
    try { await apiClient.delete(`/students/tasks/${taskId}`); loadTasks(); }
    catch (e) { setError('Delete failed'); }
  };

  const handleRemarkSave = async () => {
    if (!remark.trim()) return;
    try {
      await apiClient.put(`/students/tasks/${remarkTask.id}/remark`, { remark });
      setRemarkDialogOpen(false);
      setRemark('');
      loadTasks();
    } catch (e) { setError('Remark save failed'); }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title, description: task.description || '',
      assignedToUserId: task.assignedToUserId || '',
      assignedToName: task.assignedToName || '',
      assignedToRole: task.assignedToRole || '',
      priority: task.priority, category: task.category || 'ADMINISTRATIVE',
      dueDate: task.dueDate || ''
    });
    setDialogOpen(true);
  };

  const handleAssigneeChange = (userId) => {
    const selected = teachers.find(t => String(t.userId) === String(userId) || String(t.id) === String(userId));
    if (selected) {
      setForm(f => ({
        ...f,
        assignedToUserId: userId,
        assignedToName: `${selected.firstName} ${selected.lastName}`,
        assignedToRole: selected.designation || 'CLASS_TEACHER'
      }));
    } else {
      setForm(f => ({ ...f, assignedToUserId: userId }));
    }
  };

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Task Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Teachers aur Principal ko tasks assign karein
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setEditingTask(null); setForm(emptyForm); setDialogOpen(true); }}>
          New Task
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Tasks', val: counts.all, color: '#1E3A5F' },
          { label: 'Pending', val: counts.pending, color: '#E67E22' },
          { label: 'In Progress', val: counts.inProgress, color: '#2980B9' },
          { label: 'Completed', val: counts.completed, color: '#27AE60' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card sx={{ textAlign: 'center', borderTop: `4px solid ${s.color}` }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="h4" fontWeight="bold" color={s.color}>{s.val}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={<Badge badgeContent={counts.all} color="primary">All</Badge>} sx={{ mr: 1 }} />
        <Tab label={<Badge badgeContent={counts.pending} color="warning">Pending</Badge>} sx={{ mr: 1 }} />
        <Tab label={<Badge badgeContent={counts.inProgress} color="info">In Progress</Badge>} sx={{ mr: 1 }} />
        <Tab label={<Badge badgeContent={counts.completed} color="success">Completed</Badge>} />
        <Tab label="Cancelled" />
      </Tabs>

      {/* Task List */}
      {loading ? (
        <Box textAlign="center" py={4}><CircularProgress /></Box>
      ) : filteredTasks().length === 0 ? (
        <Box textAlign="center" py={6}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary">Koi task nahi mila</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredTasks().map(task => (
            <Grid item xs={12} md={6} key={task.id}>
              <Card sx={{ borderLeft: `5px solid ${
                task.priority === 'URGENT' ? '#e74c3c' :
                task.priority === 'HIGH'   ? '#e67e22' :
                task.priority === 'MEDIUM' ? '#3498db' : '#95a5a6'
              }` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1, mr: 1 }}>
                      {task.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip size="small" label={task.priority} color={PRIORITY_COLORS[task.priority]} />
                      <Chip size="small" label={task.status?.replace('_', ' ')} color={STATUS_COLORS[task.status]} />
                    </Box>
                  </Box>

                  {task.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {task.description}
                    </Typography>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#1E3A5F', fontSize: 10 }}>
                        {task.assignedToName?.[0] || '?'}
                      </Avatar>
                      <Typography variant="caption">
                        <b>Assigned to:</b> {task.assignedToName || 'N/A'}
                        {task.assignedToRole && <span style={{ color: '#666' }}> ({task.assignedToRole})</span>}
                      </Typography>
                    </Box>
                    {task.dueDate && (
                      <Typography variant="caption" color={
                        new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'error' : 'text.secondary'
                      }>
                        📅 Due: {new Date(task.dueDate).toLocaleDateString('en-IN')}
                      </Typography>
                    )}
                  </Box>

                  {task.completionNote && (
                    <Alert severity="success" sx={{ mt: 1, py: 0.5 }} icon={<CheckCircleIcon />}>
                      <Typography variant="caption"><b>Note:</b> {task.completionNote}</Typography>
                    </Alert>
                  )}

                  {task.adminRemark && (
                    <Alert severity="info" sx={{ mt: 1, py: 0.5 }}>
                      <Typography variant="caption"><b>Admin remark:</b> {task.adminRemark}</Typography>
                    </Alert>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                    <Tooltip title="Add Remark">
                      <IconButton size="small" color="info"
                        onClick={() => { setRemarkTask(task); setRemark(task.adminRemark || ''); setRemarkDialogOpen(true); }}>
                        <CommentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => openEdit(task)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(task.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Task Update Karein' : 'Naya Task Assign Karein'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Task Title *" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} sx={{ mb: 2 }} />
          <TextField fullWidth label="Description" multiline rows={3} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} sx={{ mb: 2 }} />

          {/* Assign to teacher */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Assign To *</InputLabel>
            <Select value={form.assignedToUserId}
              onChange={e => handleAssigneeChange(e.target.value)} label="Assign To *">
              {teachers.map(t => (
                <MenuItem key={t.id} value={t.userId || t.id}>
                  {t.firstName} {t.lastName} — {t.designation || 'Teacher'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} label="Priority">
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} label="Category">
                  {['ACADEMIC', 'ADMINISTRATIVE', 'EVENT', 'OTHER'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <TextField fullWidth label="Due Date" type="date" value={form.dueDate}
            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            InputLabelProps={{ shrink: true }} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : editingTask ? 'Update' : 'Assign Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remark Dialog */}
      <Dialog open={remarkDialogOpen} onClose={() => setRemarkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Admin Remark</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Task: <b>{remarkTask?.title}</b>
          </Typography>
          <TextField fullWidth multiline rows={3} label="Your Remark" value={remark}
            onChange={e => setRemark(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemarkDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRemarkSave} variant="contained">Save Remark</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Select, FormControl, InputLabel, Alert, CircularProgress,
  IconButton, Tooltip, Chip, Tabs, Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoIcon from '@mui/icons-material/Photo';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import UploadIcon from '@mui/icons-material/Upload';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import apiClient from '../../api/apiClient';

/*
 * AdminGallery — Manage school photos and videos
 * Photos: upload from device (stored as base64 in MongoDB via content-service)
 *         OR paste a URL (Google Drive, Imgur, etc.)
 * Videos: paste YouTube / Google Drive link
 */

const CATEGORIES = ['Sports Day', 'Cultural Fest', 'Science Exhibition', 'Annual Function',
  'Classroom', 'Other'];

const emptyForm = {
  title: '', description: '', category: 'Other',
  contentType: 'IMAGE', fileUrl: '', videoLink: ''
};

export default function AdminGallery() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [dialogOpen, setDialog]   = useState(false);
  const [tab, setTab]             = useState(0); // 0=URL/link 1=Upload from device
  const [form, setForm]           = useState(emptyForm);
  const [preview, setPreview]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [lightbox, setLightbox]   = useState(null); // {url, type}
  const fileRef = useRef();

  // ── Load gallery items from content-service ──────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Reuse content-service — class 0 = school-wide gallery
      const { data } = await apiClient.get('/content/class/0');
      // Filter only IMAGE / VIDEO_LINK types
      const gallery = (Array.isArray(data) ? data : []).filter(
        i => i.contentType === 'IMAGE' || i.contentType === 'VIDEO_LINK'
      );
      setItems(gallery);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── File input → base64 ───────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File 5MB se bada hai. URL paste karo ya chhota file use karo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setForm(f => ({ ...f, fileUrl: ev.target.result, contentType: 'IMAGE' }));
    };
    reader.readAsDataURL(file);
  };

  // ── Save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title zaroori hai'); return; }
    const isVideo = form.contentType === 'VIDEO_LINK';
    if (isVideo && !form.videoLink.trim()) { setError('Video link daalo'); return; }
    if (!isVideo && !form.fileUrl.trim()) { setError('Photo URL daalo ya file upload karo'); return; }

    setSaving(true); setError('');
    try {
      await apiClient.post('/content/upload', {
        title: form.title,
        description: form.description || form.category,
        contentType: form.contentType,
        fileUrl:    isVideo ? '' : form.fileUrl,
        videoLink:  isVideo ? form.videoLink : '',
        classId: 0,    // 0 = school-wide (gallery)
        subjectId: null
      });
      setSuccess('✅ Gallery mein add ho gaya!');
      setDialog(false);
      setForm(emptyForm);
      setPreview('');
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Is item ko gallery se hatao?')) return;
    try {
      await apiClient.delete(`/content/${id}`);
      load();
    } catch {
      setError('Delete failed');
    }
  };

  // ── YouTube embed URL ─────────────────────────────────────────
  const toEmbed = (url) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  };

  const photos = items.filter(i => i.contentType === 'IMAGE');
  const videos = items.filter(i => i.contentType === 'VIDEO_LINK');

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">🖼️ School Gallery</Typography>
          <Typography variant="body2" color="text.secondary">
            Photos aur videos manage karo — {photos.length} photos · {videos.length} videos
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setForm(emptyForm); setPreview(''); setError(''); setDialog(true); }}>
          Add Photo / Video
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab icon={<PhotoIcon fontSize="small" />} iconPosition="start" label={`Photos (${photos.length})`} />
        <Tab icon={<VideoLibraryIcon fontSize="small" />} iconPosition="start" label={`Videos (${videos.length})`} />
      </Tabs>

      {loading ? (
        <Box textAlign="center" py={6}><CircularProgress /></Box>
      ) : tab === 0 ? (
        /* ── Photos grid ── */
        photos.length === 0 ? (
          <Card><CardContent sx={{ textAlign: 'center', py: 8 }}>
            <PhotoIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">Koi photo nahi hai abhi</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setDialog(true)}>
              Pehli Photo Add Karo
            </Button>
          </CardContent></Card>
        ) : (
          <Grid container spacing={2}>
            {photos.map(item => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2,
                  '&:hover .overlay': { opacity: 1 } }}>
                  <Box
                    component="img"
                    src={item.fileUrl}
                    alt={item.title}
                    onClick={() => setLightbox({ url: item.fileUrl, type: 'image' })}
                    sx={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error'; }}
                  />
                  <Box className="overlay" sx={{
                    position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.55)',
                    opacity: 0, transition: 'opacity .2s', display: 'flex',
                    alignItems: 'flex-end', p: 1.5
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontSize={13} fontWeight={700} color="#fff">{item.title}</Typography>
                      {item.description && (
                        <Chip label={item.description} size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 10, mt: 0.5 }} />
                      )}
                    </Box>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(item.id)}
                        sx={{ color: '#ff6b6b', bgcolor: 'rgba(0,0,0,0.4)', '&:hover': { bgcolor: 'rgba(200,0,0,0.6)' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        /* ── Videos grid ── */
        videos.length === 0 ? (
          <Card><CardContent sx={{ textAlign: 'center', py: 8 }}>
            <VideoLibraryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">Koi video nahi hai abhi</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}
              onClick={() => { setForm(f => ({ ...f, contentType: 'VIDEO_LINK' })); setDialog(true); }}>
              Pehla Video Add Karo
            </Button>
          </CardContent></Card>
        ) : (
          <Grid container spacing={3}>
            {videos.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ borderRadius: 2 }}>
                  <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: '#000' }}>
                    <iframe
                      src={toEmbed(item.videoLink)}
                      title={item.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                      allowFullScreen
                    />
                  </Box>
                  <CardContent sx={{ py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight={700} fontSize={14}>{item.title}</Typography>
                      {item.description && (
                        <Typography fontSize={12} color="text.secondary">{item.description}</Typography>
                      )}
                    </Box>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      {/* ── Add Dialog ── */}
      <Dialog open={dialogOpen} onClose={() => setDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg,#0B1F3A,#1565C0)', color: '#fff', fontWeight: 800,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          📷 Photo / Video Add Karo
          <IconButton onClick={() => setDialog(false)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

          {/* Type selector */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select value={form.contentType} label="Type"
              onChange={e => setForm(f => ({ ...f, contentType: e.target.value, fileUrl: '', videoLink: '' }))}>
              <MenuItem value="IMAGE">📷 Photo / Image</MenuItem>
              <MenuItem value="VIDEO_LINK">🎥 Video Link (YouTube / Drive)</MenuItem>
            </Select>
          </FormControl>

          <TextField fullWidth label="Title *" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} sx={{ mb: 2 }} />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select value={form.category} label="Category"
              onChange={e => setForm(f => ({ ...f, category: e.target.value, description: e.target.value }))}>
              {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>

          {form.contentType === 'VIDEO_LINK' ? (
            <TextField fullWidth label="YouTube / Drive Link *" value={form.videoLink}
              onChange={e => setForm(f => ({ ...f, videoLink: e.target.value }))}
              placeholder="https://youtube.com/watch?v=..." sx={{ mb: 1 }}
              InputProps={{ startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          ) : (
            <Box>
              {/* Sub-tabs: URL vs Upload */}
              <Tabs value={tab === 0 ? 0 : 0} sx={{ mb: 2 }}>
                <Tab label="URL se" />
              </Tabs>

              {/* Option A — Paste URL */}
              <TextField fullWidth label="Image URL (Google Drive, Imgur, etc.)"
                value={form.fileUrl.startsWith('data:') ? '' : form.fileUrl}
                onChange={e => { setForm(f => ({ ...f, fileUrl: e.target.value })); setPreview(e.target.value); }}
                placeholder="https://drive.google.com/... ya https://i.imgur.com/..."
                sx={{ mb: 2 }}
                InputProps={{ startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />

              <Typography textAlign="center" color="text.secondary" fontSize={13} mb={1}>— ya —</Typography>

              {/* Option B — Upload file */}
              <Button fullWidth variant="outlined" startIcon={<UploadIcon />}
                onClick={() => fileRef.current.click()}
                sx={{ mb: 2, borderStyle: 'dashed', py: 1.5 }}>
                Device se Photo Upload Karo (max 5 MB)
              </Button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />

              {/* Preview */}
              {(preview || form.fileUrl) && !form.fileUrl.includes('youtube') && (
                <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                  <Box component="img" src={preview || form.fileUrl} alt="preview"
                    sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </Box>
              )}

              <Alert severity="info" sx={{ mt: 2 }} icon={false}>
                <Typography fontSize={12}>
                  <b>Google Drive URL kaise banayein:</b> File open karo → Share → Anyone with link → Copy link →
                  Link mein <code>/file/d/FILE_ID/view</code> ko <code>/uc?id=FILE_ID</code> se replace karo
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Gallery mein Add Karo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Lightbox ── */}
      <Dialog open={!!lightbox} onClose={() => setLightbox(null)} maxWidth="lg"
        PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}>
        <Box sx={{ position: 'relative' }}>
          <IconButton onClick={() => setLightbox(null)}
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff' }}>
            <CloseIcon />
          </IconButton>
          {lightbox && (
            <Box component="img" src={lightbox.url} alt="full"
              sx={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', display: 'block', borderRadius: 2 }}
            />
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
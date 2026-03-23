import React, { useState, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, IconButton,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Alert, Tooltip
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { toast } from 'react-toastify';

const CATEGORIES = [
  'Sports Day', 'Cultural Fest', 'Science Exhibition',
  'Annual Function', 'Classroom', 'Field Trip', 'Other'
];

const DEMO_PHOTOS = [
  { id: 1, title: 'Sports Day 2025', category: 'Sports Day', url: null, emoji: '🏆', color: '#1565C0' },
  { id: 2, title: 'Cultural Fest', category: 'Cultural Fest', url: null, emoji: '🎭', color: '#6A1B9A' },
  { id: 3, title: 'Science Exhibition', category: 'Science Exhibition', url: null, emoji: '🔬', color: '#2E7D32' },
  { id: 4, title: 'Annual Function', category: 'Annual Function', url: null, emoji: '🎉', color: '#E65100' },
];

export default function AdminGallery() {
  const [photos, setPhotos] = useState(DEMO_PHOTOS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Other', url: null, emoji: '📸' });
  const fileRef = useRef();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File 5MB se bada nahi hona chahiye');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(f => ({ ...f, url: ev.target.result }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!form.title.trim()) { toast.error('Title zaroori hai'); return; }
    const newPhoto = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      url: form.url,
      emoji: form.emoji,
      color: '#1565C0',
    };
    setPhotos(p => [newPhoto, ...p]);
    setDialogOpen(false);
    setForm({ title: '', category: 'Other', url: null, emoji: '📸' });
    toast.success('Photo gallery mein add ho gaya!');
  };

  const handleDelete = (id) => {
    setPhotos(p => p.filter(ph => ph.id !== id));
    toast.success('Photo delete ho gaya');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">🖼️ School Gallery</Typography>
          <Typography variant="body2" color="text.secondary">
            School ke events aur activities ki photos manage karo
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Photo Add Karo
        </Button>
      </Box>

      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {CATEGORIES.slice(0, 4).map(cat => {
          const count = photos.filter(p => p.category === cat).length;
          return (
            <Grid item xs={6} sm={3} key={cat}>
              <Card sx={{ textAlign: 'center', borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">{count}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{cat}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <PhotoLibraryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">Gallery mein abhi koi photo nahi hai</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setDialogOpen(true)}>
              Pehli Photo Add Karo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {photos.map(photo => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
              <Card sx={{
                borderRadius: 3, overflow: 'hidden',
                transition: 'all .2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 }
              }}>
                {/* Photo area */}
                <Box
                  sx={{
                    height: 180, position: 'relative', cursor: 'pointer',
                    bgcolor: photo.url ? 'transparent' : photo.color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: photo.url ? 'transparent'
                      : `linear-gradient(135deg, ${photo.color}33, ${photo.color}11)`,
                    overflow: 'hidden',
                  }}
                  onClick={() => setViewPhoto(photo)}
                >
                  {photo.url ? (
                    <Box
                      component="img"
                      src={photo.url}
                      alt={photo.title}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: 64 }}>{photo.emoji}</Typography>
                  )}
                  {/* Overlay on hover */}
                  <Box sx={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity .2s',
                    '&:hover': { opacity: 1 },
                  }}>
                    <FullscreenIcon sx={{ color: '#fff', fontSize: 40 }} />
                  </Box>
                </Box>

                {/* Card footer */}
                <CardContent sx={{ py: 1.5, px: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                      <Typography fontWeight={700} fontSize={13} noWrap>{photo.title}</Typography>
                      <Chip label={photo.category} size="small" sx={{ mt: 0.5, fontSize: 10 }} />
                    </Box>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(photo.id)}>
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

      {/* Add Photo Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>📸 Nayi Photo Add Karo</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {/* Upload area */}
          <Box
            onClick={() => fileRef.current.click()}
            sx={{
              border: '2px dashed',
              borderColor: form.url ? 'success.main' : 'primary.main',
              borderRadius: 3, p: 3, mb: 2, textAlign: 'center',
              cursor: 'pointer', transition: 'all .2s',
              bgcolor: form.url ? 'success.50' : 'primary.50',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {uploading ? (
              <CircularProgress size={32} />
            ) : form.url ? (
              <Box>
                <Box
                  component="img"
                  src={form.url}
                  sx={{ maxHeight: 180, maxWidth: '100%', borderRadius: 2, mb: 1 }}
                />
                <Typography color="success.main" fontWeight={700}>✅ Photo ready!</Typography>
              </Box>
            ) : (
              <Box>
                <AddPhotoAlternateIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography fontWeight={600}>Click karke photo select karo</Typography>
                <Typography variant="caption" color="text.secondary">JPG, PNG, WebP — max 5MB</Typography>
              </Box>
            )}
          </Box>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileSelect}
          />

          <TextField
            fullWidth label="Photo Title *" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            sx={{ mb: 2 }}
            placeholder="Jaise: Sports Day 2026 Final"
          />
          <TextField
            fullWidth select label="Category" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!form.title.trim()}
          >
            Gallery Mein Add Karo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen view dialog */}
      <Dialog
        open={!!viewPhoto}
        onClose={() => setViewPhoto(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {viewPhoto?.title}
          <Chip label={viewPhoto?.category} size="small" />
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {viewPhoto?.url ? (
            <Box
              component="img"
              src={viewPhoto.url}
              alt={viewPhoto.title}
              sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
            />
          ) : (
            <Box sx={{
              height: 300, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 100,
              background: `linear-gradient(135deg, ${viewPhoto?.color}22, ${viewPhoto?.color}11)`,
            }}>
              {viewPhoto?.emoji}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewPhoto(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
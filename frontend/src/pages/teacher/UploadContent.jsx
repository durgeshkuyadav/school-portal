import React, { useState, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Alert, Grid,
  CircularProgress, Chip, Tabs, Tab, Avatar, Divider
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ArticleIcon from '@mui/icons-material/Article';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { contentApi } from '../../api/services';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { useAppSettings } from '../../context/AppSettingsContext';

const CONTENT_TYPES = [
  { value: 'PDF_NOTES',     label: '📄 PDF Notes',       tab: 0 },
  { value: 'ASSIGNMENT',    label: '📝 Assignment',       tab: 0 },
  { value: 'WORKSHEET',     label: '📋 Worksheet',        tab: 0 },
  { value: 'IMAGE',         label: '🖼️ Image/Photo',     tab: 1 },
  { value: 'GALLERY_PHOTO', label: '📸 Gallery Photo',    tab: 1 },
  { value: 'VIDEO_LINK',    label: '🎥 Video Link',       tab: 2 },
  { value: 'ARTICLE',       label: '📰 Article/Notice',  tab: 2 },
];

export default function UploadContent() {
  const user = useSelector(selectUser);
  const { isDark } = useAppSettings();
  const fileRef = useRef();
  const [tab, setTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', contentType: 'PDF_NOTES',
    fileUrl: '', videoLink: '', classId: '', subjectId: '',
    imageUrl: '',
  });

  const card = isDark ? '#161b27' : '#fff';
  const bord = isDark ? '#2d3348' : '#e8eaf6';
  const sub  = isDark ? '#8892a4' : '#64748b';

  const isSubjectTeacher = user?.role === 'SUBJECT_TEACHER';
  const tabTypes = CONTENT_TYPES.filter(t => t.tab === tab);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image 10MB se bada nahi hona chahiye'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = ev => {
      setForm(f => ({ ...f, imageUrl: ev.target.result }));
      setPreview(ev.target.result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!form.title) { setError('Title zaroori hai!'); return; }
    if (!form.classId && tab !== 2) { setError('Class ID zaroori hai!'); return; }
    setSaving(true); setError('');
    try {
      await contentApi.upload({
        ...form,
        classId: form.classId ? Number(form.classId) : null,
        subjectId: form.subjectId ? Number(form.subjectId) : null,
      });
      toast.success('✅ Content upload ho gaya!');
      setForm({ title:'', description:'', contentType:tabTypes[0]?.value||'PDF_NOTES',
        fileUrl:'', videoLink:'', classId:'', subjectId:'', imageUrl:'' });
      setPreview(null);
    } catch (e) {
      setError(e.response?.data?.error || 'Upload failed');
    } finally { setSaving(false); }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={0.5}>📤 Content Upload</Typography>
      <Typography fontSize={13} color={sub} mb={3}>
        Notes, images, videos aur articles students ke liye upload karo
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 3 }}>
            {/* Tab selector */}
            <Tabs value={tab} onChange={(_, v) => { setTab(v); setForm(f => ({ ...f, contentType: CONTENT_TYPES.find(t => t.tab === v)?.value || f.contentType })); }}
              sx={{ borderBottom: `1px solid ${bord}`, '& .MuiTab-root': { fontWeight: 700 } }}>
              <Tab icon={<ArticleIcon fontSize="small" />} iconPosition="start" label="Documents" />
              <Tab icon={<ImageIcon fontSize="small" />} iconPosition="start" label="Images" />
              <Tab icon={<VideoLibraryIcon fontSize="small" />} iconPosition="start" label="Videos & Articles" />
            </Tabs>

            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error && <Alert severity="error">{error}</Alert>}

              <FormControl fullWidth size="small">
                <InputLabel>Content Type</InputLabel>
                <Select value={form.contentType} label="Content Type"
                  onChange={e => setForm(f => ({ ...f, contentType: e.target.value }))}>
                  {tabTypes.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField fullWidth label="Title *" value={form.title} size="small"
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Jaise: Chapter 3 Notes, Sports Day Photos" />

              <TextField fullWidth label="Description" multiline rows={2} value={form.description} size="small"
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

              {/* Tab 0 — Documents */}
              {tab === 0 && (
                <TextField fullWidth label="File URL (Google Drive / Dropbox link)" value={form.fileUrl} size="small"
                  onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))}
                  placeholder="https://drive.google.com/..." />
              )}

              {/* Tab 1 — Images */}
              {tab === 1 && (
                <Box>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageSelect} />
                  <Box onClick={() => fileRef.current.click()} sx={{
                    border: `2px dashed ${preview ? '#2E7D32' : '#1565C0'}`,
                    borderRadius: 3, p: 2, textAlign: 'center', cursor: 'pointer',
                    bgcolor: preview ? '#E8F5E9' : (isDark ? '#1e2a3e' : '#f0f4ff'),
                    mb: 1,
                  }}>
                    {uploading ? <CircularProgress size={28} /> :
                     preview ? (
                       <Box>
                         <Box component="img" src={preview} sx={{ maxHeight: 160, maxWidth: '100%', borderRadius: 2, mb: 1 }} />
                         <Typography fontSize={12} color="success.main" fontWeight={700}>✅ Image ready — click to change</Typography>
                       </Box>
                     ) : (
                       <Box>
                         <PhotoCameraIcon sx={{ fontSize: 40, color: '#1565C0', mb: 1 }} />
                         <Typography fontWeight={600}>Click karke image select karo</Typography>
                         <Typography variant="caption" color={sub}>JPG, PNG, WebP — max 10MB</Typography>
                       </Box>
                     )}
                  </Box>
                  <TextField fullWidth label="Ya Image URL daalo" value={form.imageUrl && !form.imageUrl.startsWith('data:') ? form.imageUrl : ''} size="small"
                    onChange={e => { setForm(f => ({ ...f, imageUrl: e.target.value })); setPreview(e.target.value); }}
                    placeholder="https://..." />
                </Box>
              )}

              {/* Tab 2 — Videos & Articles */}
              {tab === 2 && (
                <TextField fullWidth label={form.contentType === 'VIDEO_LINK' ? 'YouTube / Drive Video URL' : 'Article Content / Notice Text'}
                  value={form.contentType === 'VIDEO_LINK' ? form.videoLink : form.description}
                  multiline={form.contentType !== 'VIDEO_LINK'}
                  rows={form.contentType !== 'VIDEO_LINK' ? 4 : 1}
                  size="small"
                  onChange={e => form.contentType === 'VIDEO_LINK'
                    ? setForm(f => ({ ...f, videoLink: e.target.value }))
                    : setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder={form.contentType === 'VIDEO_LINK' ? 'https://youtube.com/...' : 'Notice ya article ka content yahan likhein...'} />
              )}

              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <TextField fullWidth label="Class ID" value={form.classId} size="small" type="number"
                    onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                    helperText="Admin se class ID lo" />
                </Grid>
                {isSubjectTeacher && (
                  <Grid item xs={6}>
                    <TextField fullWidth label="Subject ID *" value={form.subjectId} size="small" type="number"
                      onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))} />
                  </Grid>
                )}
              </Grid>

              <Button fullWidth variant="contained" startIcon={<UploadIcon />}
                onClick={handleUpload} disabled={saving} size="large"
                sx={{ bgcolor: '#0A2E1A', py: 1.5, borderRadius: 2, fontWeight: 700 }}>
                {saving ? <CircularProgress size={22} color="inherit" /> : '🚀 Upload Karo'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Typography fontWeight={700} mb={1.5}>
                {user?.role === 'CLASS_TEACHER' ? '📢 Class Teacher — Wide Access' : '🎯 Subject Teacher — Subject Focus'}
              </Typography>
              <Alert severity={user?.role === 'CLASS_TEACHER' ? 'info' : 'warning'} sx={{ borderRadius: 2, mb: 2 }}>
                {user?.role === 'CLASS_TEACHER'
                  ? 'Aapka content poori class ke saare students dekh sakte hain'
                  : 'Aapka content sirf us subject ke students ko dikhega'}
              </Alert>
              <Divider sx={{ my: 1.5 }} />
              <Typography fontWeight={700} mb={1} fontSize={13}>Content Types:</Typography>
              {CONTENT_TYPES.map(t => (
                <Box key={t.value} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip label={t.label} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: card, border: `1px solid ${bord}`, borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={700} mb={1}>💡 Tips</Typography>
              <Typography fontSize={12} color={sub} mb={0.5}>• Gallery photos public website pe bhi dikhenge</Typography>
              <Typography fontSize={12} color={sub} mb={0.5}>• Articles/Notices poore school ko dikhenge</Typography>
              <Typography fontSize={12} color={sub} mb={0.5}>• Images base64 ya URL dono kaam karte hain</Typography>
              <Typography fontSize={12} color={sub}>• Video ke liye YouTube embed link use karo</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

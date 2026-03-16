import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Alert, Snackbar, Grid
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { contentApi } from '../../api/services';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const UploadContent = () => {
  const user = useSelector(selectUser);
  const [form, setForm] = useState({
    title: '', description: '', contentType: 'PDF_NOTES',
    fileUrl: '', videoLink: '', classId: '', subjectId: ''
  });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const showMsg = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleUpload = async () => {
    if (!form.title || !form.classId) {
      showMsg('Title aur Class ID zaroori hai!', 'error');
      return;
    }
    setLoading(true);
    try {
      await contentApi.upload({
        ...form,
        classId: Number(form.classId),
        subjectId: form.subjectId ? Number(form.subjectId) : null,
      });
      showMsg('✅ Content upload ho gaya! Students ab dekh sakte hain.');
      setForm({ title: '', description: '', contentType: 'PDF_NOTES', fileUrl: '', videoLink: '', classId: '', subjectId: '' });
    } catch {
      showMsg('❌ Upload mein error aaya', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isSubjectTeacher = user?.role === 'SUBJECT_TEACHER';

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3} color="#1E3A5F">
        📤 Content Upload Karo
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <TextField
                fullWidth label="Title *" value={form.title}
                onChange={handleChange('title')} sx={{ mb: 2 }}
                placeholder="Jaise: Chapter 3 Notes, Math Assignment"
              />
              <TextField
                fullWidth label="Description" value={form.description}
                onChange={handleChange('description')}
                sx={{ mb: 2 }} multiline rows={2}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Content Type</InputLabel>
                <Select value={form.contentType} label="Content Type" onChange={handleChange('contentType')}>
                  <MenuItem value="PDF_NOTES">📄 PDF Notes</MenuItem>
                  <MenuItem value="VIDEO_LINK">🎥 Video Link</MenuItem>
                  <MenuItem value="IMAGE">🖼️ Image</MenuItem>
                  <MenuItem value="ASSIGNMENT">📝 Assignment</MenuItem>
                  <MenuItem value="WORKSHEET">📋 Worksheet</MenuItem>
                </Select>
              </FormControl>

              {form.contentType === 'VIDEO_LINK' ? (
                <TextField
                  fullWidth label="Video Link (YouTube/Drive)" value={form.videoLink}
                  onChange={handleChange('videoLink')} sx={{ mb: 2 }}
                  placeholder="https://youtube.com/..."
                />
              ) : (
                <TextField
                  fullWidth label="File URL" value={form.fileUrl}
                  onChange={handleChange('fileUrl')} sx={{ mb: 2 }}
                  placeholder="File ka link daalo"
                />
              )}

              <TextField
                fullWidth label="Class ID *" value={form.classId}
                onChange={handleChange('classId')} sx={{ mb: 2 }} type="number"
                helperText="Apni class ka ID daalo"
              />

              {isSubjectTeacher && (
                <TextField
                  fullWidth label="Subject ID *" value={form.subjectId}
                  onChange={handleChange('subjectId')} sx={{ mb: 2 }} type="number"
                  helperText="Apne subject ka ID daalo (Subject Teacher ke liye zaroori)"
                />
              )}

              <Button
                fullWidth variant="contained" startIcon={<UploadIcon />}
                onClick={handleUpload} disabled={loading} size="large"
                sx={{ mt: 1, bgcolor: '#1E3A5F', py: 1.5 }}
              >
                {loading ? 'Upload Ho Raha Hai...' : 'Upload Karo'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card elevation={2} sx={{ borderRadius: 2, bgcolor: '#E8F5E9', border: '1px solid #27AE60' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2} color="#27AE60">
                🔒 Visibility Rules
              </Typography>
              {user?.role === 'CLASS_TEACHER' ? (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Aap <strong>Class Teacher</strong> hain
                  </Alert>
                  <Typography color="text.secondary">
                    Aapka content <strong>poori class ke sabhi students</strong> ko dikhega
                  </Typography>
                </>
              ) : (
                <>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Aap <strong>Subject Teacher</strong> hain
                  </Alert>
                  <Typography color="text.secondary">
                    Aapka content <strong>sirf us subject ke students</strong> ko dikhega jo aapka subject padhte hain
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadContent;

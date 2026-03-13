import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip,
  CircularProgress, Button, TextField, InputAdornment
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ImageIcon from '@mui/icons-material/Image';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import { contentApi } from '../../api/services';

const iconMap = {
  PDF_NOTES: <PictureAsPdfIcon sx={{ color: '#E53935' }} />,
  VIDEO_LINK: <VideoLibraryIcon sx={{ color: '#1E88E5' }} />,
  IMAGE: <ImageIcon sx={{ color: '#43A047' }} />,
  ASSIGNMENT: <AssignmentIcon sx={{ color: '#FB8C00' }} />,
};

const StudentContent = () => {
  const [content, setContent] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await contentApi.getStudentContent();
        setContent(res.data || []);
        setFiltered(res.data || []);
      } catch {
        setContent([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(content.filter(c =>
      c.title?.toLowerCase().includes(q) ||
      c.uploaderName?.toLowerCase().includes(q)
    ));
  }, [search, content]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={1} color="#1E3A5F">
        📚 Study Materials
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Teachers ne jo notes, videos, assignments upload kiye hain
      </Typography>

      <TextField
        fullWidth
        placeholder="Search karo..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
        }}
      />

      {filtered.length === 0 ? (
        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              📭 Koi content nahi mila
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((c, i) => (
            <Grid item xs={12} sm={6} md={4} key={c.id || i}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%',
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)', transition: '0.2s' }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {iconMap[c.contentType] || <AssignmentIcon />}
                    <Chip
                      label={c.contentType?.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography fontWeight="bold" mb={1}>{c.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {c.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      By: {c.uploaderName}
                    </Typography>
                    {c.fileUrl && (
                      <Button
                        size="small"
                        variant="contained"
                        href={c.fileUrl}
                        target="_blank"
                        sx={{ bgcolor: '#1E3A5F' }}
                      >
                        Open
                      </Button>
                    )}
                    {c.videoLink && (
                      <Button
                        size="small"
                        variant="contained"
                        href={c.videoLink}
                        target="_blank"
                        sx={{ bgcolor: '#1E88E5' }}
                      >
                        Watch
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StudentContent;

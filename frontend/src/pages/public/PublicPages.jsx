import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar,
  Chip, CircularProgress, Container, Dialog, DialogContent,
  IconButton, Button
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import { teacherApi, calendarApi, publicApi } from '../../api/services';

const NAV = () => (
  <Box sx={{ background:'linear-gradient(135deg,#0B1F3A,#1565C0)', color:'white', py:2, px:3,
    display:'flex', alignItems:'center', justifyContent:'space-between' }}>
    <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
      <Typography sx={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700 }}>🏫 Vidya Mandir</Typography>
    </Box>
    <Box sx={{ display:'flex', gap:2 }}>
      {[['/', 'Home'], ['/teachers','Faculty'], ['/gallery','Gallery'], ['/calendar','Calendar']].map(([href, label]) => (
        <a key={href} href={href} style={{ color:'rgba(255,255,255,.8)', textDecoration:'none', fontSize:14, fontWeight:500 }}>{label}</a>
      ))}
    </Box>
  </Box>
);

// ── Teacher Directory ──────────────────────────────────────────────
export const TeacherDirectory = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    teacherApi.getPublicProfiles()
      .then(res => setTeachers(res.data || []))
      .catch(() => setTeachers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'#F4F7FC' }}>
      <NAV />
      <Box sx={{ background:'linear-gradient(135deg,#0B1F3A,#1565C0)', color:'white', py:6, textAlign:'center' }}>
        <Typography variant="h4" fontWeight={800}>👨‍🏫 Our Faculty</Typography>
        <Typography sx={{ opacity:.8, mt:1, fontSize:15 }}>
          Meet the dedicated educators of Vidya Mandir
        </Typography>
        <Chip label={`${teachers.length} Teachers`} sx={{ mt:2, bgcolor:'rgba(255,255,255,.2)', color:'#fff' }} />
      </Box>
      <Container maxWidth="lg" sx={{ py:6 }}>
        {loading ? (
          <Box sx={{ display:'flex', justifyContent:'center', mt:6 }}><CircularProgress /></Box>
        ) : teachers.length === 0 ? (
          <Card elevation={2} sx={{ borderRadius:3 }}>
            <CardContent sx={{ textAlign:'center', py:8 }}>
              <PersonIcon sx={{ fontSize:64, color:'#ccc', mb:2 }}/>
              <Typography color="text.secondary">No teacher profiles published yet</Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {teachers.map((t, i) => (
              <Grid item xs={12} sm={6} md={4} key={t.id || i}>
                <Card elevation={0} sx={{ borderRadius:3, border:'1px solid #e8eaf6',
                  transition:'all .2s', '&:hover':{ transform:'translateY(-4px)', boxShadow:8 } }}>
                  <Box sx={{ height:4, background:'linear-gradient(90deg,#0B1F3A,#1565C0)' }}/>
                  <CardContent sx={{ textAlign:'center', py:3 }}>
                    {t.profilePhotoUrl ? (
                      <Box component="img" src={t.profilePhotoUrl}
                        sx={{ width:80, height:80, borderRadius:'50%', objectFit:'cover',
                          mx:'auto', mb:2, border:'3px solid #1565C0' }}/>
                    ) : (
                      <Avatar sx={{ width:80, height:80, mx:'auto', mb:2, bgcolor:'#0B1F3A', fontSize:28 }}>
                        {t.firstName?.[0]}
                      </Avatar>
                    )}
                    <Typography variant="h6" fontWeight={700}>{t.firstName} {t.lastName}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>{t.designation || 'Teacher'}</Typography>
                    {t.qualification && (
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        🎓 {t.qualification}
                      </Typography>
                    )}
                    {t.subjectsTaught && (
                      <Box sx={{ display:'flex', flexWrap:'wrap', gap:.5, justifyContent:'center' }}>
                        {t.subjectsTaught.split(',').map((s, j) => (
                          <Chip key={j} label={s.trim()} size="small" variant="outlined" color="primary" sx={{ fontSize:10 }}/>
                        ))}
                      </Box>
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

// ── School Gallery (Live from content-service) ─────────────────────
export const SchoolGallery = () => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    publicApi.getContent()
      .then(res => setItems(res.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filters = ['ALL', 'IMAGE', 'GALLERY_PHOTO', 'VIDEO_LINK', 'ARTICLE'];
  const filtered = filter === 'ALL' ? items : items.filter(i => i.contentType === filter);

  const getEmbed = (url) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const ytEmbed = url.match(/youtube\.com\/embed\/([^?]+)/);
    if (ytEmbed) return url;
    return null;
  };

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'#F4F7FC' }}>
      <NAV />
      <Box sx={{ background:'linear-gradient(135deg,#0B1F3A,#6A1B9A)', color:'white', py:6, textAlign:'center' }}>
        <Typography variant="h4" fontWeight={800}>🖼️ School Gallery</Typography>
        <Typography sx={{ opacity:.8, mt:1, fontSize:15 }}>Photos, videos aur articles from our school</Typography>
        <Chip label={`${items.length} Items`} sx={{ mt:2, bgcolor:'rgba(255,255,255,.2)', color:'#fff' }} />
      </Box>

      <Container maxWidth="lg" sx={{ py:4 }}>
        {/* Filter chips */}
        <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mb:4, justifyContent:'center' }}>
          {filters.map(f => (
            <Chip key={f} label={f === 'ALL' ? '🌐 All' : f === 'IMAGE' || f === 'GALLERY_PHOTO' ? '🖼️ Photos' : f === 'VIDEO_LINK' ? '🎥 Videos' : '📰 Articles'}
              onClick={() => setFilter(f)}
              sx={{ fontWeight:700, cursor:'pointer',
                bgcolor: filter === f ? '#0B1F3A' : '#fff',
                color: filter === f ? '#fff' : '#0B1F3A',
                border: '1px solid #0B1F3A' }} />
          ))}
        </Box>

        {loading ? (
          <Box sx={{ display:'flex', justifyContent:'center', py:8 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Card sx={{ borderRadius:3 }}>
            <CardContent sx={{ textAlign:'center', py:8 }}>
              <ImageIcon sx={{ fontSize:64, color:'#ccc', mb:2 }}/>
              <Typography color="text.secondary">Koi content abhi available nahi hai</Typography>
              <Typography fontSize={12} color="text.secondary" mt={1}>
                Teachers jab content upload karenge, yahan dikhega
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {filtered.map((item, i) => (
              <Grid item xs={12} sm={6} md={4} key={item.id || i}>
                <Card elevation={0} sx={{ borderRadius:3, border:'1px solid #e8eaf6', overflow:'hidden',
                  cursor:'pointer', transition:'all .2s',
                  '&:hover':{ transform:'translateY(-4px)', boxShadow:8 } }}
                  onClick={() => setSelected(item)}>
                  {/* Media preview */}
                  <Box sx={{ height:180, position:'relative', overflow:'hidden',
                    bgcolor: item.imageUrl ? 'transparent' : '#F4F7FC',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {item.imageUrl ? (
                      <Box component="img" src={item.imageUrl} alt={item.title}
                        sx={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    ) : item.videoLink ? (
                      <Box sx={{ width:'100%', height:'100%', bgcolor:'#0B1F3A',
                        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1 }}>
                        <PlayCircleIcon sx={{ fontSize:56, color:'rgba(255,255,255,.8)' }}/>
                        <Typography fontSize={12} color="rgba(255,255,255,.6)">Click to watch</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
                        <ArticleIcon sx={{ fontSize:48, color:'#1565C0' }}/>
                        <Typography fontSize={12} color="text.secondary">{item.contentType}</Typography>
                      </Box>
                    )}
                    {/* Type badge */}
                    <Chip label={item.contentType?.replace('_', ' ')} size="small"
                      sx={{ position:'absolute', top:8, right:8, fontSize:10, fontWeight:700,
                        bgcolor:'rgba(0,0,0,.6)', color:'#fff' }}/>
                  </Box>
                  <CardContent sx={{ p:2 }}>
                    <Typography fontWeight={700} fontSize={14} noWrap>{item.title}</Typography>
                    {item.description && (
                      <Typography fontSize={12} color="text.secondary" sx={{
                        overflow:'hidden', textOverflow:'ellipsis',
                        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', mt:.5
                      }}>{item.description}</Typography>
                    )}
                    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mt:1.5 }}>
                      <Typography fontSize={11} color="text.secondary">By: {item.uploaderName}</Typography>
                      <Typography fontSize={11} color="text.secondary">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : ''}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Item detail dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p:0 }}>
          <Box sx={{ position:'relative' }}>
            <IconButton onClick={() => setSelected(null)}
              sx={{ position:'absolute', top:8, right:8, zIndex:10, bgcolor:'rgba(0,0,0,.5)', color:'#fff' }}>
              <CloseIcon />
            </IconButton>
            {selected?.imageUrl && (
              <Box component="img" src={selected.imageUrl} alt={selected.title}
                sx={{ width:'100%', maxHeight:'70vh', objectFit:'contain', bgcolor:'#000' }}/>
            )}
            {selected?.videoLink && getEmbed(selected.videoLink) && (
              <Box component="iframe" src={getEmbed(selected.videoLink)}
                sx={{ width:'100%', height:400, border:0 }} allowFullScreen/>
            )}
            {selected?.videoLink && !getEmbed(selected.videoLink) && (
              <Box sx={{ p:3, textAlign:'center' }}>
                <Button variant="contained" href={selected.videoLink} target="_blank">
                  🎥 Watch Video
                </Button>
              </Box>
            )}
          </Box>
          <Box sx={{ p:3 }}>
            <Typography variant="h6" fontWeight={700}>{selected?.title}</Typography>
            {selected?.description && (
              <Typography color="text.secondary" mt={1}>{selected.description}</Typography>
            )}
            <Box sx={{ display:'flex', gap:1, mt:2, flexWrap:'wrap' }}>
              <Chip label={`By: ${selected?.uploaderName}`} size="small" variant="outlined"/>
              <Chip label={selected?.contentType?.replace('_',' ')} size="small"/>
              {selected?.fileUrl && (
                <Button size="small" variant="outlined" href={selected.fileUrl} target="_blank">
                  📥 Download
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// ── School Calendar (Live) ─────────────────────────────────────────
const EVENT_COLORS = {
  HOLIDAY:'#E74C3C', EXAM:'#E67E22', SPORTS:'#27AE60',
  CULTURAL:'#9B59B6', MEETING:'#2980B9', OTHER:'#95A5A6',
};

export const SchoolCalendar = () => {
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    Promise.allSettled([
      publicApi.getCalendarEvents(now.getMonth() + 1, now.getFullYear()),
      publicApi.getHolidays(),
    ]).then(([evRes, holRes]) => {
      if (evRes.status === 'fulfilled')
        setEvents(Array.isArray(evRes.value.data) ? evRes.value.data : []);
      if (holRes.status === 'fulfilled')
        setHolidays(Array.isArray(holRes.value.data) ? holRes.value.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const allItems = [...events, ...holidays.filter(h => !events.find(e => e.id === h.id))];
  const unique = allItems.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'#F4F7FC' }}>
      <NAV />
      <Box sx={{ background:'linear-gradient(135deg,#0B1F3A,#2980B9)', color:'white', py:6, textAlign:'center' }}>
        <Typography variant="h4" fontWeight={800}>📅 School Calendar</Typography>
        <Typography sx={{ opacity:.8, mt:1, fontSize:15 }}>
          Events & holidays for {now.toLocaleString('default', { month:'long', year:'numeric' })}
        </Typography>
      </Box>
      <Container maxWidth="lg" sx={{ py:6 }}>
        {loading ? (
          <Box sx={{ display:'flex', justifyContent:'center', mt:6 }}><CircularProgress /></Box>
        ) : unique.length === 0 ? (
          <Card sx={{ borderRadius:3 }}>
            <CardContent sx={{ textAlign:'center', py:8 }}>
              <EventIcon sx={{ fontSize:64, color:'#ccc', mb:2 }}/>
              <Typography color="text.secondary">Is mahine koi events nahi hain</Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {unique.map((ev, i) => (
              <Grid item xs={12} sm={6} md={4} key={ev.id || i}>
                <Card elevation={0} sx={{ borderRadius:3, border:'1px solid #e8eaf6',
                  borderLeft:`4px solid ${EVENT_COLORS[ev.eventType] || '#95A5A6'}` }}>
                  <CardContent>
                    <Typography fontWeight={700}>{ev.title}</Typography>
                    <Typography variant="body2" color="text.secondary" mt={.5}>
                      📅 {new Date(ev.eventDate).toLocaleDateString('en-IN', { day:'numeric', month:'long' })}
                    </Typography>
                    {ev.description && (
                      <Typography variant="body2" color="text.secondary" mt={.5}>{ev.description}</Typography>
                    )}
                    <Box sx={{ display:'flex', gap:1, mt:1 }}>
                      <Chip label={ev.eventType} size="small"
                        sx={{ bgcolor:EVENT_COLORS[ev.eventType], color:'white', fontSize:'0.7rem' }}/>
                      {ev.isHoliday && <Chip label="Holiday" size="small" color="error"/>}
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

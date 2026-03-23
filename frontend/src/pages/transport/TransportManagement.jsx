import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Chip, Avatar, Divider, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { useAppSettings } from '../../context/AppSettingsContext';

const LS_KEY = 'vm_transport';
const loadT = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{"routes":[],"students":[]}'); } catch { return { routes:[], students:[] }; }};
const saveT = d => localStorage.setItem(LS_KEY, JSON.stringify(d));

const SAMPLE_ROUTES = [
  { id:1, routeNo:'R-01', name:'Gomti Nagar Route', driver:'Ramesh Kumar', driverPhone:'9876543210', busNo:'UP32-1234', capacity:40, students:12, stops:['School Gate','Civil Lines','Gomti Nagar Ext.','Vikas Nagar'] },
  { id:2, routeNo:'R-02', name:'Indira Nagar Route', driver:'Suresh Yadav', driverPhone:'9812345678', busNo:'UP32-5678', capacity:35, students:18, stops:['School Gate','Nishatganj','Indira Nagar Sec-11','Indira Nagar Sec-20'] },
];

const ROUTE_COLORS = ['#1565C0','#2E7D32','#6A1B9A','#E65100','#C62828'];

export default function TransportManagement() {
  const { isDark } = useAppSettings();
  const user = useSelector(selectUser);
  const isAdmin = ['SUPER_ADMIN','SCHOOL_ADMIN'].includes(user?.role);

  const [data, setData] = useState(() => {
    const d = loadT();
    if (d.routes.length === 0) return { ...d, routes: SAMPLE_ROUTES };
    return d;
  });
  const [tab, setTab]     = useState(0);
  const [routeDialog, setRouteDialog] = useState(false);
  const [studentDialog, setStudentDialog] = useState(false);
  const [selRoute, setSelRoute] = useState(null);
  const [routeForm, setRouteForm] = useState({ routeNo:'', name:'', driver:'', driverPhone:'', busNo:'', capacity:40, stopsText:'' });
  const [studentForm, setStudentForm] = useState({ name:'', class:'', address:'', stop:'' });

  const card = isDark ? '#161b27' : '#fff';
  const bord = isDark ? '#2d3348' : '#e8eaf6';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub  = isDark ? '#8892a4' : '#64748b';

  const persist = d => { setData(d); saveT(d); };

  const addRoute = () => {
    if (!routeForm.routeNo || !routeForm.name) { toast.error('Route no. aur name zaroori hai'); return; }
    const route = { id: Date.now(), ...routeForm, capacity: Number(routeForm.capacity),
      stops: routeForm.stopsText.split('\n').filter(s => s.trim()), students: 0 };
    persist({ ...data, routes: [...data.routes, route] });
    setRouteDialog(false); setRouteForm({ routeNo:'', name:'', driver:'', driverPhone:'', busNo:'', capacity:40, stopsText:'' });
    toast.success('Route added!');
  };

  const addStudent = () => {
    if (!studentForm.name || !selRoute) { toast.error('Details zaroori hain'); return; }
    const student = { id: Date.now(), routeId: selRoute.id, routeName: selRoute.name, ...studentForm };
    const routes = data.routes.map(r => r.id === selRoute.id ? { ...r, students: (r.students || 0) + 1 } : r);
    persist({ routes, students: [...data.students, student] });
    setStudentDialog(false); setStudentForm({ name:'', class:'', address:'', stop:'' });
    toast.success('Student assigned to route!');
  };

  const removeRoute = id => { persist({ ...data, routes: data.routes.filter(r => r.id !== id) }); };

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={text}>🚌 Transport</Typography>
          <Typography fontSize={13} color={sub}>{data.routes.length} routes • {data.students.length} students enrolled</Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setRouteDialog(true)}
            sx={{ bgcolor:'#1565C0', borderRadius:2, fontWeight:700 }}>
            Add Route
          </Button>
        )}
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb:3 }}>
        {[
          { label:'Total Routes', val:data.routes.length, color:'#1565C0', icon:'🚌' },
          { label:'Students Using Bus', val:data.students.length, color:'#2E7D32', icon:'👨‍🎓' },
          { label:'Total Capacity', val:data.routes.reduce((s,r)=>s+r.capacity,0), color:'#E65100', icon:'💺' },
          { label:'Drivers', val:data.routes.filter(r=>r.driver).length, color:'#6A1B9A', icon:'👨‍✈️' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:2, textAlign:'center' }}>
              <CardContent sx={{ py:1.5 }}>
                <Typography fontSize={22}>{s.icon}</Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color:s.color }}>{s.val}</Typography>
                <Typography fontSize={11} color={sub}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb:2 }}>
        <Tab label="Routes" />
        <Tab label="Students" />
      </Tabs>

      {tab === 0 && (
        data.routes.length === 0 ? (
          <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3 }}>
            <CardContent sx={{ textAlign:'center', py:6 }}>
              <DirectionsBusIcon sx={{ fontSize:60, color:sub, mb:2 }}/>
              <Typography color={sub} mb={2}>Koi route nahi mila</Typography>
              {isAdmin && (
                <Button variant="contained" startIcon={<AddIcon/>}
                  onClick={() => setRouteDialog(true)} sx={{ bgcolor:'#1565C0', borderRadius:2 }}>
                  Pehla Route Add Karo
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
        <Grid container spacing={2.5}>
          {data.routes.map((route, i) => {
            const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
            const fillPct = route.capacity > 0 ? Math.round((route.students / route.capacity) * 100) : 0;
            return (
              <Grid item xs={12} md={6} key={route.id}>
                <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3, overflow:'hidden' }}>
                  <Box sx={{ height:5, bgcolor:color }}/>
                  <CardContent>
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb:1.5 }}>
                      <Box sx={{ display:'flex', gap:1.5, alignItems:'center' }}>
                        <Avatar sx={{ bgcolor:color, width:44, height:44 }}>
                          <DirectionsBusIcon />
                        </Avatar>
                        <Box>
                          <Typography fontWeight={800} color={text}>{route.name}</Typography>
                          <Box sx={{ display:'flex', gap:.5 }}>
                            <Chip label={route.routeNo} size="small" sx={{ bgcolor:color+'22', color, fontWeight:700, fontSize:11 }}/>
                            <Chip label={route.busNo} size="small" variant="outlined" sx={{ fontSize:10 }}/>
                          </Box>
                        </Box>
                      </Box>
                      {isAdmin && (
                        <Box sx={{ display:'flex', gap:.5 }}>
                          <Button size="small" onClick={() => { setSelRoute(route); setStudentDialog(true); }}
                            sx={{ fontSize:10, borderRadius:2 }}>+ Student</Button>
                          <IconButton size="small" color="error" onClick={() => removeRoute(route.id)}>
                            <DeleteIcon fontSize="small"/>
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    <Divider sx={{ borderColor:bord, mb:1.5 }}/>
                    {route.driver && (
                      <Box sx={{ display:'flex', gap:.5, mb:1, flexWrap:'wrap' }}>
                        <Typography fontSize={12} color={sub}>🧑‍✈️ {route.driver}</Typography>
                        {route.driverPhone && <Typography fontSize={12} color={sub}>📞 {route.driverPhone}</Typography>}
                      </Box>
                    )}
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
                      <Typography fontSize={12} color={sub}>Occupancy</Typography>
                      <Typography fontSize={12} fontWeight={700} sx={{ color }}>
                        {route.students}/{route.capacity} ({fillPct}%)
                      </Typography>
                    </Box>
                    <Box sx={{ height:6, borderRadius:3, bgcolor: isDark?'#2d3348':'#e8eaf6', overflow:'hidden', mb:1.5 }}>
                      <Box sx={{ height:'100%', borderRadius:3, bgcolor:color,
                        width:`${fillPct}%`, transition:'width .3s' }}/>
                    </Box>
                    {route.stops && route.stops.length > 0 && (
                      <Box>
                        <Typography fontSize={11} color={sub} sx={{ mb:0.5 }}>🛑 Stops:</Typography>
                        <Box sx={{ display:'flex', gap:.5, flexWrap:'wrap' }}>
                          {route.stops.map((stop, si) => (
                            <Box key={si} sx={{ display:'flex', alignItems:'center', gap:.3 }}>
                              <LocationOnIcon sx={{ fontSize:12, color }} />
                              <Typography fontSize={11} color={sub}>{stop}</Typography>
                              {si < route.stops.length - 1 && <Typography sx={{ fontSize:10 }} color={sub}>→</Typography>}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        )
      )}

      {tab === 1 && (
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: isDark?'#1e2a3e':'#1565C0' }}>
                {['Student','Class','Route','Stop','Address'].map(h => (
                  <TableCell key={h} sx={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.students.length === 0 ? (
                <TableRow><TableCell colSpan={5} sx={{ textAlign:'center', py:4, color:sub }}>Koi student enrolled nahi hai</TableCell></TableRow>
              ) : data.students.map((s, i) => (
                <TableRow key={s.id || i} sx={{ bgcolor: i%2===0?(isDark?'#1e2a3e22':'#f8f9ff'):'transparent' }}>
                  <TableCell sx={{ color:text, fontWeight:600, fontSize:13 }}>{s.name}</TableCell>
                  <TableCell sx={{ color:sub, fontSize:12 }}>{s.class}</TableCell>
                  <TableCell><Chip label={s.routeName} size="small" sx={{ fontSize:10 }}/></TableCell>
                  <TableCell sx={{ color:sub, fontSize:12 }}>{s.stop}</TableCell>
                  <TableCell sx={{ color:sub, fontSize:12 }}>{s.address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Route Dialog */}
      <Dialog open={routeDialog} onClose={() => setRouteDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle sx={{ background:'linear-gradient(135deg,#1565C0,#0D47A1)', color:'#fff', fontWeight:700 }}>🚌 New Route</DialogTitle>
        <DialogContent sx={{ pt:2 }}>
          <Grid container spacing={2} sx={{ mt:.5 }}>
            <Grid item xs={6}><TextField fullWidth label="Route No. *" value={routeForm.routeNo} size="small" onChange={e => setRouteForm(f => ({ ...f, routeNo:e.target.value }))}/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Route Name *" value={routeForm.name} size="small" onChange={e => setRouteForm(f => ({ ...f, name:e.target.value }))}/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Driver Name" value={routeForm.driver} size="small" onChange={e => setRouteForm(f => ({ ...f, driver:e.target.value }))}/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Driver Phone" value={routeForm.driverPhone} size="small" onChange={e => setRouteForm(f => ({ ...f, driverPhone:e.target.value }))}/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Bus Number" value={routeForm.busNo} size="small" onChange={e => setRouteForm(f => ({ ...f, busNo:e.target.value }))}/></Grid>
            <Grid item xs={6}><TextField fullWidth label="Capacity" type="number" value={routeForm.capacity} size="small" onChange={e => setRouteForm(f => ({ ...f, capacity:e.target.value }))}/></Grid>
            <Grid item xs={12}><TextField fullWidth label="Stops (ek line mein ek stop)" multiline rows={4} value={routeForm.stopsText} size="small" placeholder="School Gate&#10;Civil Lines&#10;Gomti Nagar" onChange={e => setRouteForm(f => ({ ...f, stopsText:e.target.value }))}/></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setRouteDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={addRoute} sx={{ bgcolor:'#1565C0', borderRadius:2 }}>Add Route</Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={studentDialog} onClose={() => setStudentDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle fontWeight={700} color={text}>👨‍🎓 Assign to: {selRoute?.name}</DialogTitle>
        <DialogContent sx={{ pt:1.5, display:'flex', flexDirection:'column', gap:2 }}>
          <TextField label="Student Name *" value={studentForm.name} size="small" onChange={e => setStudentForm(f => ({ ...f, name:e.target.value }))}/>
          <TextField label="Class" value={studentForm.class} size="small" onChange={e => setStudentForm(f => ({ ...f, class:e.target.value }))}/>
          <TextField select label="Boarding Stop" value={studentForm.stop} size="small" onChange={e => setStudentForm(f => ({ ...f, stop:e.target.value }))}>
            {(selRoute?.stops || []).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField label="Home Address" value={studentForm.address} size="small" onChange={e => setStudentForm(f => ({ ...f, address:e.target.value }))}/>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setStudentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={addStudent} sx={{ bgcolor:'#1565C0', borderRadius:2 }}>Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
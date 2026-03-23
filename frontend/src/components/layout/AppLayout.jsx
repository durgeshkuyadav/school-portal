import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton,
  ListItemText, Typography, IconButton, Avatar,
  Menu, MenuItem, Divider, useTheme, useMediaQuery, Tooltip, Chip, Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArticleIcon from '@mui/icons-material/Article';
import QuizIcon from '@mui/icons-material/Quiz';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import GradeIcon from '@mui/icons-material/Grade';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ScienceIcon from '@mui/icons-material/Science';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { logout, selectUser } from '../../store/slices/authSlice';
import { useAppSettings } from '../../context/AppSettingsContext';
import SettingsPanel from '../settings/SettingsPanel';

const W = 258;

const THEMES = {
  admin:   { primary:'#0B1F3A', accent:'#1565C0', light:'#E3F2FD', name:'Admin Panel',   nameHi:'एडमिन पैनल',   grad:'linear-gradient(160deg,#0B1F3A 0%,#1565C0 100%)' },
  teacher: { primary:'#0A2E1A', accent:'#2E7D32', light:'#E8F5E9', name:'Teacher Panel', nameHi:'शिक्षक पैनल', grad:'linear-gradient(160deg,#0A2E1A 0%,#2E7D32 100%)' },
  student: { primary:'#1A0A36', accent:'#6A1B9A', light:'#F3E5F5', name:'Student Panel', nameHi:'छात्र पैनल', grad:'linear-gradient(160deg,#1A0A36 0%,#6A1B9A 100%)' },
};

const INLINE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
@keyframes slideInLeft  { from{opacity:0;transform:translateX(-20px);} to{opacity:1;transform:translateX(0);} }
@keyframes fadeUpItem   { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
@keyframes glowPulse    { 0%,100%{box-shadow:0 0 0 rgba(255,255,255,.0);} 50%{box-shadow:0 0 20px rgba(255,255,255,.08);} }
@keyframes gradShift    { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
.apl-sidebar { animation: slideInLeft .35s ease both; }
.apl-nav-item { animation: fadeUpItem .35s ease both; transition: all .22s ease !important; }
.apl-nav-item:hover { transform: translateX(4px) !important; }
.apl-user-card { animation: glowPulse 3s ease-in-out infinite; }
.apl-brand-bar { background-size:200% 200% !important; animation: gradShift 8s ease infinite; }
.apl-active-item { position:relative; overflow:hidden; }
.apl-active-item::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:rgba(255,255,255,.8);border-radius:0 2px 2px 0; }
`;

export default function AppLayout({ role }) {
  const muiTheme  = useTheme();
  const isMob     = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobOpen, setMobOpen] = useState(false);
  const [anchor,  setAnchor]  = useState(null);
  const [mounted, setMounted] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const user      = useSelector(selectUser);
  const { t, isDark, language } = useAppSettings();
  const th = THEMES[role] || THEMES.admin;

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);
  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  const NAV = {
    student: [
      { labelKey:'dashboard',  icon:<DashboardIcon/>, path:'/student/dashboard', emoji:'🏠' },
      { labelKey:'results',    icon:<GradeIcon/>,     path:'/student/results',   emoji:'📊' },
      { labelKey:'content',    icon:<ArticleIcon/>,   path:'/student/content',   emoji:'📚' },
      { labelKey:'tests',      icon:<QuizIcon/>,      path:'/student/tests',     emoji:'🧪' },
      { labelKey:'attendance', icon:<HowToRegIcon/>,  path:'/student/attendance',emoji:'📅' },
      { labelKey:'profile',    icon:<PersonIcon/>,    path:'/student/profile',   emoji:'👤' },
      { labelKey:'scienceLab', icon:<ScienceIcon/>,   path:'/student/lab',       emoji:'🔬' },
    ],
    teacher: [
      { labelKey:'dashboard',     icon:<DashboardIcon/>,  path:'/teacher/dashboard', emoji:'🏠' },
      { labelKey:'exams',         icon:<AssignmentIcon/>, path:'/teacher/exams',     emoji:'📝' },
      { labelKey:'updateResults', icon:<GradeIcon/>,      path:'/teacher/results',   emoji:'📊' },
      { labelKey:'uploadContent', icon:<ArticleIcon/>,    path:'/teacher/content',   emoji:'📂' },
      { labelKey:'myTasks',       icon:<TaskAltIcon/>,    path:'/teacher/tasks',     emoji:'✅', badge:'new' },
      { labelKey:'attendance',    icon:<FactCheckIcon/>,  path:'/teacher/attendance',emoji:'📋' },
      { labelKey:'profile',       icon:<PersonIcon/>,     path:'/teacher/profile',   emoji:'👤' },
      { labelKey:'scienceLab',    icon:<ScienceIcon/>,    path:'/teacher/lab',       emoji:'🔬' },
    ],
    admin: [
      { labelKey:'dashboard',  icon:<DashboardIcon/>,     path:'/admin/dashboard',  emoji:'🏠' },
      { labelKey:'students',   icon:<PeopleIcon/>,        path:'/admin/students',   emoji:'👨‍🎓' },
      { labelKey:'teachers',   icon:<PersonIcon/>,        path:'/admin/teachers',   emoji:'👨‍🏫' },
      { labelKey:'classes',    icon:<ClassIcon/>,         path:'/admin/classes',    emoji:'🏫' },
      { labelKey:'calendar',   icon:<CalendarMonthIcon/>, path:'/admin/calendar',   emoji:'📅' },
      { labelKey:'tasks',      icon:<TaskAltIcon/>,       path:'/admin/tasks',      emoji:'📋', badge:'new' },
      { labelKey:'attendance', icon:<FactCheckIcon/>,     path:'/admin/attendance', emoji:'📊' },
      { labelKey:'gallery',    icon:<PhotoLibraryIcon/>,  path:'/admin/gallery',    emoji:'🖼️' },
      { labelKey:'scienceLab', icon:<ScienceIcon/>,       path:'/admin/lab',        emoji:'🔬' },
    ],
  };

  const items = NAV[role] || [];
  const panelName = language === 'hi' ? th.nameHi : th.name;
  const darkBg    = isDark ? '#0d1117' : '#F4F7FC';
  const darkCard  = isDark ? '#161b27' : '#fff';
  const darkText  = isDark ? '#e0e6f0' : '#1a2340';
  const darkSub   = isDark ? '#8892a4' : '#607090';
  const darkBorder = isDark ? '#2d3348' : 'rgba(0,0,0,.06)';

  const welcomeMsg = {
    admin:   language === 'hi' ? '🏫 एडमिन नियंत्रण केंद्र' : '🏫 Admin Control Center',
    teacher: language === 'hi' ? '👨‍🏫 शिक्षक कार्यक्षेत्र'    : '👨‍🏫 Teacher Workspace',
    student: language === 'hi' ? '🎓 छात्र डैशबोर्ड'          : '🎓 Student Dashboard',
  };
  const statusMsg = {
    admin:   language === 'hi' ? '⚡ पूर्ण पहुंच'          : '⚡ Full Access',
    teacher: language === 'hi' ? '📝 पढ़ाने के लिए तैयार'   : '📝 Ready to teach',
    student: language === 'hi' ? '✨ जिज्ञासु रहें'         : '✨ Stay Curious',
  };

  const Sidebar = (
    <Box className="apl-sidebar" sx={{ height:'100%', display:'flex', flexDirection:'column', background: th.grad }}>
      <Box className="apl-brand-bar" sx={{
        p:2.5, pb:2,
        background:`linear-gradient(135deg,${th.primary},${th.accent},${th.primary})`,
        backgroundSize:'300%', borderBottom:'1px solid rgba(255,255,255,.1)',
      }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.2, mb:2 }}>
          <Box sx={{ width:40, height:40, borderRadius:'11px', fontSize:20, background:'linear-gradient(135deg,rgba(255,255,255,.25),rgba(255,255,255,.1))', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,.2)' }}>🏫</Box>
          <Box>
            <Typography sx={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, color:'#fff', lineHeight:1.2 }}>Vidya Mandir</Typography>
            <Typography sx={{ fontSize:10, color:'rgba(255,255,255,.5)', letterSpacing:'1px', textTransform:'uppercase' }}>{panelName}</Typography>
          </Box>
        </Box>
        <Box className="apl-user-card" sx={{ display:'flex', alignItems:'center', gap:1.2, background:'rgba(255,255,255,.1)', borderRadius:2, p:1.2, border:'1px solid rgba(255,255,255,.12)' }}>
          <Avatar sx={{ width:34, height:34, bgcolor:'rgba(255,255,255,.2)', fontSize:15, fontWeight:700 }}>{user?.username?.[0]?.toUpperCase()}</Avatar>
          <Box sx={{ flex:1, minWidth:0 }}>
            <Typography sx={{ fontSize:13, fontWeight:600, color:'#fff', lineHeight:1.2 }} noWrap>{user?.username}</Typography>
            <Typography sx={{ fontSize:10, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.5px' }}>{user?.role?.replace(/_/g,' ')}</Typography>
          </Box>
          <Box sx={{ width:8, height:8, borderRadius:'50%', background:'#4CAF50', flexShrink:0, boxShadow:'0 0 6px #4CAF50' }}/>
        </Box>
      </Box>

      <Box sx={{ flex:1, overflowY:'auto', p:1, pt:1.5, scrollbarWidth:'none', '&::-webkit-scrollbar':{display:'none'} }}>
        <Typography sx={{ fontSize:'9.5px', textTransform:'uppercase', letterSpacing:'2.5px', color:'rgba(255,255,255,.25)', px:1.5, mb:1 }}>
          {language === 'hi' ? 'नेविगेशन' : 'Navigation'}
        </Typography>
        <List disablePadding>
          {items.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb:.5 }}>
                <ListItemButton
                  className={`apl-nav-item${isActive?' apl-active-item':''}`}
                  onClick={() => { navigate(item.path); if(isMob) setMobOpen(false); }}
                  sx={{ borderRadius:'10px', py:.9, px:1.5, background: isActive ? 'rgba(255,255,255,.18)' : 'transparent', color:'#fff', animationDelay:`${i*.06}s`, '&:hover':{ background:'rgba(255,255,255,.12)' }, opacity: mounted ? 1 : 0 }}
                >
                  <Box sx={{ mr:1.5, fontSize:18, lineHeight:1, width:22, textAlign:'center' }}>{item.emoji}</Box>
                  <ListItemText primary={t[item.labelKey] || item.labelKey}
                    primaryTypographyProps={{ fontSize:13.5, fontWeight: isActive ? 700 : 500, color:'rgba(255,255,255,.92)', fontFamily:"'DM Sans',sans-serif" }} />
                  {item.badge && <Chip label={item.badge.toUpperCase()} size="small" sx={{ height:17, fontSize:9, fontWeight:800, letterSpacing:.5, bgcolor:'rgba(245,166,35,.9)', color:'#0B1F3A', ml:.5 }} />}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor:'rgba(255,255,255,.08)' }}/>
      <Box sx={{ p:1.5 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius:'10px', py:1, color:'rgba(255,255,255,.6)', '&:hover':{ background:'rgba(239,83,80,.15)', color:'#EF5350' } }}>
          <LogoutIcon sx={{ mr:1.5, fontSize:18 }}/>
          <ListItemText primary={t.logout} primaryTypographyProps={{ fontSize:13.5, fontFamily:"'DM Sans',sans-serif" }}/>
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      <style>{INLINE_CSS}</style>
      <Box sx={{ display:'flex', minHeight:'100vh', bgcolor: darkBg }}>
        <AppBar position="fixed" elevation={0} sx={{ zIndex: muiTheme.zIndex.drawer + 1, background: th.grad, borderBottom:'1px solid rgba(255,255,255,.1)' }}>
          <Toolbar sx={{ minHeight:'60px !important', px:{ xs:2, md:3 } }}>
            {isMob && <IconButton color="inherit" edge="start" onClick={()=>setMobOpen(!mobOpen)} sx={{ mr:1.5 }}><MenuIcon/></IconButton>}
            <Box sx={{ flex:1, display:'flex', alignItems:'center', gap:1 }}>
              <Typography sx={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#fff' }}>Vidya Mandir</Typography>
              <Box sx={{ px:1.5, py:.3, borderRadius:'100px', background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)' }}>
                <Typography sx={{ fontSize:10, color:'rgba(255,255,255,.7)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:600 }}>{panelName}</Typography>
              </Box>
            </Box>
            <Box sx={{ display:'flex', alignItems:'center', gap:1, mr:7 }}>
              <Tooltip title={t.notifications}>
                <IconButton color="inherit" sx={{ '&:hover':{ background:'rgba(255,255,255,.1)' } }}>
                  <Badge badgeContent={3} color="warning" sx={{ '& .MuiBadge-badge':{ fontSize:9, minWidth:16, height:16 } }}><NotificationsIcon sx={{ fontSize:20 }}/></Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title={`${user?.username}`}>
                <IconButton onClick={e=>setAnchor(e.currentTarget)} sx={{ '&:hover':{ background:'rgba(255,255,255,.1)' } }}>
                  <Avatar sx={{ width:32, height:32, bgcolor:'rgba(255,255,255,.2)', fontSize:14, fontWeight:700, border:'2px solid rgba(255,255,255,.3)' }}>{user?.username?.[0]?.toUpperCase()}</Avatar>
                </IconButton>
              </Tooltip>
            </Box>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={()=>setAnchor(null)} PaperProps={{ elevation:8, sx:{ mt:1, borderRadius:2, minWidth:200, bgcolor: darkCard } }}>
              <Box sx={{ px:2, py:1.5 }}>
                <Typography fontWeight={700} fontSize={14} color={darkText}>{user?.username}</Typography>
                <Typography color={darkSub} fontSize={12}>{user?.role}</Typography>
              </Box>
              <Divider/>
              <MenuItem onClick={handleLogout} sx={{ color:'error.main', gap:1, py:1.2 }}><LogoutIcon fontSize="small"/> {t.logout}</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width:{ md:W }, flexShrink:{ md:0 } }}>
          <Drawer variant={isMob ? 'temporary' : 'permanent'} open={isMob ? mobOpen : true} onClose={()=>setMobOpen(false)} ModalProps={{ keepMounted:true }}
            sx={{ '& .MuiDrawer-paper':{ width:W, boxSizing:'border-box', border:'none', boxShadow:'4px 0 24px rgba(0,0,0,.25)' } }}>
            {Sidebar}
          </Drawer>
        </Box>

        <Box component="main" sx={{ flexGrow:1, width:{ md:`calc(100% - ${W}px)` }, mt:'60px', p:{ xs:2, md:3.5 }, background: darkBg, minHeight:'calc(100vh - 60px)' }}>
          <Box sx={{ mb:3, p:2.5, borderRadius:3, background: darkCard, border:`1px solid ${darkBorder}`, boxShadow: isDark ? '0 2px 12px rgba(0,0,0,.3)' : '0 2px 12px rgba(0,0,0,.05)', display:'flex', alignItems:'center', justifyContent:'space-between', animation:'fadeUpItem .4s ease both' }}>
            <Box>
              <Typography sx={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color: th.primary, lineHeight:1.2 }}>{welcomeMsg[role]}</Typography>
              <Typography sx={{ fontSize:13, color: darkSub, mt:.5 }}>
                {language === 'hi' ? 'नमस्ते,' : 'Namaste,'} <strong style={{ color: darkText }}>{user?.username}</strong>
              </Typography>
            </Box>
            <Box sx={{ px:2, py:.8, borderRadius:'100px', background: isDark ? `${th.accent}22` : th.light, border:`1.5px solid ${th.accent}30` }}>
              <Typography sx={{ fontSize:12, fontWeight:700, color:th.accent }}>{statusMsg[role]}</Typography>
            </Box>
          </Box>
          <Outlet/>
        </Box>

        <SettingsPanel />
      </Box>
    </>
  );
}

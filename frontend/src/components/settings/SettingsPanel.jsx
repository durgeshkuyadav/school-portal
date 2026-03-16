import React, { useState } from 'react';
import {
  Box, IconButton, Drawer, Typography, Switch, FormControlLabel,
  ToggleButtonGroup, ToggleButton, Divider, Tooltip, Paper
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import TranslateIcon from '@mui/icons-material/Translate';
import { useAppSettings } from '../../context/AppSettingsContext';

/* ═══════════════════════════════════════════════════════════════════
   SETTINGS PANEL — floats in top-right corner
   Language: English / Hindi
   Appearance: Light / Dark mode
   ═══════════════════════════════════════════════════════════════════ */

const INLINE_CSS = `
@keyframes settingsSpin { from{transform:rotate(0deg);} to{transform:rotate(180deg);} }
@keyframes settingsSlide { from{opacity:0;transform:translateX(20px);} to{opacity:1;transform:translateX(0);} }
.settings-icon-btn:hover .settings-gear { animation: settingsSpin .4s ease; }
.settings-panel-content { animation: settingsSlide .25s ease; }
`;

export default function SettingsPanel({ sx = {} }) {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, themeMode, setThemeMode, t, isDark } = useAppSettings();

  const bg = isDark ? '#1a1a2e' : '#fff';
  const border = isDark ? '#2d2d4e' : '#e0e0e0';
  const text = isDark ? '#e0e0e0' : '#1a1a2e';
  const subtext = isDark ? '#a0a0b0' : '#666';
  const activeGrad = 'linear-gradient(135deg, #1565C0, #6A1B9A)';

  return (
    <>
      <style>{INLINE_CSS}</style>

      {/* ── Floating gear button ── */}
      <Tooltip title={t.settings} placement="left">
        <IconButton
          className="settings-icon-btn"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1300,
            bgcolor: isDark ? 'rgba(21,101,192,0.9)' : 'rgba(255,255,255,0.92)',
            color: isDark ? '#fff' : '#1565C0',
            boxShadow: isDark
              ? '0 4px 20px rgba(0,0,0,0.5)'
              : '0 4px 20px rgba(21,101,192,0.25)',
            backdropFilter: 'blur(10px)',
            border: `1.5px solid ${isDark ? 'rgba(106,27,154,0.5)' : 'rgba(21,101,192,0.2)'}`,
            width: 44, height: 44,
            transition: 'all .2s ease',
            '&:hover': {
              bgcolor: isDark ? '#1565C0' : '#1565C0',
              color: '#fff',
              transform: 'scale(1.08)',
            },
            ...sx
          }}
        >
          <SettingsIcon className="settings-gear" fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* ── Side drawer ── */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: bg,
            borderLeft: `1px solid ${border}`,
            p: 0,
          }
        }}
      >
        {/* Header */}
        <Box sx={{
          p: 2.5,
          background: activeGrad,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon sx={{ color: '#fff', fontSize: 22 }} />
            <Typography fontWeight={700} color="#fff" fontSize={17}>
              {t.settings}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box className="settings-panel-content" sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* ── Language section ── */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <TranslateIcon sx={{ color: '#1565C0', fontSize: 20 }} />
              <Typography fontWeight={700} color={text} fontSize={14} textTransform="uppercase" letterSpacing={1}>
                {t.language}
              </Typography>
            </Box>

            <ToggleButtonGroup
              value={language}
              exclusive
              onChange={(_, val) => val && setLanguage(val)}
              fullWidth
              sx={{ gap: 1 }}
            >
              <ToggleButton
                value="en"
                sx={{
                  flex: 1, py: 1.5, borderRadius: '10px !important',
                  border: `1.5px solid ${border} !important`,
                  color: language === 'en' ? '#fff' : text,
                  background: language === 'en' ? activeGrad : 'transparent',
                  fontWeight: 600, fontSize: 14,
                  '&:hover': { background: language === 'en' ? activeGrad : (isDark ? '#2d2d4e' : '#f5f5f5') },
                }}
              >
                🇬🇧 {t.english}
              </ToggleButton>
              <ToggleButton
                value="hi"
                sx={{
                  flex: 1, py: 1.5, borderRadius: '10px !important',
                  border: `1.5px solid ${border} !important`,
                  color: language === 'hi' ? '#fff' : text,
                  background: language === 'hi' ? activeGrad : 'transparent',
                  fontWeight: 600, fontSize: 14,
                  '&:hover': { background: language === 'hi' ? activeGrad : (isDark ? '#2d2d4e' : '#f5f5f5') },
                }}
              >
                🇮🇳 {t.hindi}
              </ToggleButton>
            </ToggleButtonGroup>

            <Typography fontSize={12} color={subtext} mt={1}>
              {language === 'hi'
                ? 'पूरा सिस्टम हिन्दी में बदल जाएगा'
                : 'Entire system will switch to English'}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: border }} />

          {/* ── Appearance section ── */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              {isDark ? <DarkModeIcon sx={{ color: '#6A1B9A', fontSize: 20 }} /> : <LightModeIcon sx={{ color: '#F5A623', fontSize: 20 }} />}
              <Typography fontWeight={700} color={text} fontSize={14} textTransform="uppercase" letterSpacing={1}>
                {t.appearance}
              </Typography>
            </Box>

            {/* Visual toggle card */}
            <Paper
              elevation={0}
              onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
              sx={{
                p: 2, borderRadius: 3, cursor: 'pointer',
                border: `1.5px solid ${border}`,
                bgcolor: isDark ? '#16213e' : '#f8f9ff',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all .2s',
                '&:hover': { border: `1.5px solid #1565C0` },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: isDark ? 'linear-gradient(135deg,#1a1a2e,#6A1B9A)' : 'linear-gradient(135deg,#ffe082,#fff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  {isDark
                    ? <DarkModeIcon sx={{ color: '#a78bfa', fontSize: 22 }} />
                    : <LightModeIcon sx={{ color: '#F5A623', fontSize: 22 }} />
                  }
                </Box>
                <Box>
                  <Typography fontWeight={700} color={text} fontSize={14}>
                    {isDark ? t.darkMode : t.lightMode}
                  </Typography>
                  <Typography fontSize={11} color={subtext}>
                    {isDark ? 'Click to switch to light' : 'Click to switch to dark'}
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={isDark}
                onChange={() => setThemeMode(isDark ? 'light' : 'dark')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#6A1B9A' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#6A1B9A' },
                }}
              />
            </Paper>

            {/* Preview boxes */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              {['light', 'dark'].map(mode => (
                <Box
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  sx={{
                    flex: 1, height: 64, borderRadius: 2, cursor: 'pointer',
                    background: mode === 'dark'
                      ? 'linear-gradient(135deg, #0d0d1a 0%, #1a1a3e 100%)'
                      : 'linear-gradient(135deg, #f5f5ff 0%, #e8f4ff 100%)',
                    border: themeMode === mode
                      ? '2.5px solid #1565C0'
                      : `1.5px solid ${border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 0.5,
                    transition: 'all .2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Mini preview UI lines */}
                  <Box sx={{ width: '60%', height: 4, borderRadius: 2, bgcolor: mode === 'dark' ? '#2d2d6e' : '#1565C0', opacity: 0.8 }} />
                  <Box sx={{ width: '40%', height: 3, borderRadius: 2, bgcolor: mode === 'dark' ? '#3d3d7e' : '#90caf9', opacity: 0.6 }} />
                  <Typography fontSize={10} color={mode === 'dark' ? '#a0a0c0' : '#666'} mt={0.5} fontWeight={600}>
                    {mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </Typography>
                  {themeMode === mode && (
                    <Box sx={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', bgcolor: '#1565C0' }} />
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ borderColor: border }} />

          {/* Current status */}
          <Box sx={{ p: 2, bgcolor: isDark ? '#16213e' : '#f0f4ff', borderRadius: 2 }}>
            <Typography fontSize={12} color={subtext} fontWeight={600} mb={1}>
              {language === 'hi' ? '⚙️ वर्तमान सेटिंग्स' : '⚙️ Current Settings'}
            </Typography>
            <Typography fontSize={13} color={text}>
              🌐 {language === 'hi' ? 'हिन्दी' : 'English'} &nbsp;|&nbsp;
              {isDark ? ' 🌙 Dark' : ' ☀️ Light'}
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────────
   VIDYA MANDIR — Public School Website  (Redesign v2)
   Palette  : Deep slate #0F172A + Emerald #10B981 + Warm cream #FAFAF8
   Type     : Cormorant Garant (display) + Plus Jakarta Sans (body)
   Login    : HIDDEN — accessible only via /portal-login direct URL
              NO login links anywhere on the public site
   ───────────────────────────────────────────────────────────────── */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --slate:    #0F172A;
  --slate2:   #1E293B;
  --slate3:   #334155;
  --em:       #10B981;
  --em2:      #059669;
  --em3:      #34D399;
  --em-pale:  #ECFDF5;
  --cream:    #FAFAF8;
  --warm:     #F5F0E8;
  --text:     #111827;
  --muted:    #6B7280;
  --lighter:  #9CA3AF;
  --border:   #E5E7EB;
  --card:     #FFFFFF;
  --r8:  8px;  --r12: 12px;  --r16: 16px;  --r24: 24px;
  --sh:  0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05);
  --sh2: 0 4px 24px rgba(0,0,0,0.12), 0 12px 48px rgba(0,0,0,0.08);
  --sh3: 0 24px 80px rgba(15,23,42,0.18);
}

html { scroll-behavior: smooth; }
body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--cream); color: var(--text); overflow-x: hidden; -webkit-font-smoothing: antialiased; }

/* ─── ANIMATIONS ────────────────────────────────── */
@keyframes fadeUp   { from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);} }
@keyframes fadeIn   { from{opacity:0;}to{opacity:1;} }
@keyframes slideR   { from{opacity:0;transform:translateX(-20px);}to{opacity:1;transform:translateX(0);} }
@keyframes float1   { 0%,100%{transform:translateY(0) rotate(-1deg);}50%{transform:translateY(-18px) rotate(1deg);} }
@keyframes float2   { 0%,100%{transform:translateY(-6px);}50%{transform:translateY(10px);} }
@keyframes ticker   { from{transform:translateX(0);}to{transform:translateX(-50%);} }
@keyframes shimmer  { 0%{background-position:200% 0;}100%{background-position:-200% 0;} }
@keyframes pulse3   { 0%,100%{opacity:.5;}50%{opacity:1;} }
@keyframes spin     { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
@keyframes scaleIn  { from{transform:scale(0.96);opacity:0;}to{transform:scale(1);opacity:1;} }
@keyframes gradMove { 0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;} }

/* ─── TICKER ────────────────────────────────────── */
.ticker-wrap {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1001;
  height: 34px; display: flex; align-items: center; overflow: hidden;
  background: var(--slate); border-bottom: 1px solid rgba(16,185,129,0.2);
}
.ticker-tag {
  background: var(--em); color: var(--slate); height: 100%;
  display: flex; align-items: center; padding: 0 18px;
  font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
  flex-shrink: 0; white-space: nowrap;
}
.ticker-track { overflow: hidden; flex: 1; }
.ticker-inner {
  display: inline-flex; white-space: nowrap;
  animation: ticker 30s linear infinite;
}
.ticker-item { padding: 0 36px; font-size: 12.5px; font-weight: 500; color: rgba(255,255,255,0.7); }
.ticker-sep   { color: var(--em); opacity: 0.5; }

/* ─── TOPNAV ─────────────────────────────────────── */
.topnav {
  position: fixed; top: 34px; left: 0; right: 0; z-index: 1000;
  height: 62px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px;
  background: rgba(250,250,248,0.92);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border);
  transition: all 0.3s;
}
.topnav.scrolled {
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  background: rgba(250,250,248,0.97);
}

.nav-brand { display: flex; align-items: center; gap: 11px; cursor: pointer; }
.nav-crest {
  width: 40px; height: 40px; border-radius: 10px;
  background: linear-gradient(135deg, var(--slate), var(--slate2));
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(15,23,42,0.25);
}
.nav-brand-text { line-height: 1.2; }
.nav-brand-name { font-family: 'Cormorant Garant', serif; font-size: 18px; font-weight: 700; color: var(--slate); }
.nav-brand-tag  { font-size: 10px; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; }

.nav-links { display: flex; gap: 0; }
.nav-link {
  background: none; border: none; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; font-weight: 500;
  color: var(--muted); padding: 6px 14px; border-radius: 8px; transition: all 0.2s;
}
.nav-link:hover  { color: var(--text); background: rgba(0,0,0,0.04); }
.nav-link.active { color: var(--em2); font-weight: 700; }

.nav-actions { display: flex; align-items: center; gap: 10px; }
.nav-notif {
  width: 36px; height: 36px; border-radius: 10px;
  border: 1.5px solid var(--border); background: var(--card);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 16px; transition: all 0.2s; position: relative;
}
.nav-notif:hover { border-color: var(--em); transform: scale(1.05); }
.notif-pip {
  position: absolute; top: 6px; right: 6px;
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--em); border: 2px solid var(--cream);
  animation: pulse3 2s infinite;
}

.ham {
  display: none; flex-direction: column; gap: 4px; cursor: pointer;
  background: none; border: none; padding: 8px;
}
.ham-b { width: 20px; height: 2px; background: var(--slate3); border-radius: 1px; transition: all 0.25s; }

/* ─── HERO ───────────────────────────────────────── */
.hero {
  min-height: 100vh; position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  padding-top: 96px;
}

.hero-canvas {
  position: absolute; inset: 0; z-index: 0;
  background: linear-gradient(160deg, var(--slate) 0%, #162032 55%, #0D2416 100%);
}

/* Subtle texture */
.hero-noise {
  position: absolute; inset: 0; z-index: 1; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}

/* Grid overlay */
.hero-grid {
  position: absolute; inset: 0; z-index: 1;
  background-image:
    linear-gradient(rgba(16,185,129,0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16,185,129,0.055) 1px, transparent 1px);
  background-size: 44px 44px;
}

/* Glow spots */
.hero-glow {
  position: absolute; border-radius: 50%; pointer-events: none; z-index: 2;
}
.hg1 {
  width: 700px; height: 700px; top: -200px; right: -180px;
  background: radial-gradient(circle, rgba(16,185,129,0.1), transparent 65%);
  animation: float1 14s ease-in-out infinite;
}
.hg2 {
  width: 480px; height: 480px; bottom: -80px; left: -100px;
  background: radial-gradient(circle, rgba(52,211,153,0.07), transparent 65%);
  animation: float2 11s ease-in-out infinite;
}

/* Decorative lines */
.hero-line {
  position: absolute; z-index: 2;
  background: linear-gradient(to right, transparent, rgba(16,185,129,0.15), transparent);
  height: 1px; width: 100%;
}
.hl1 { top: 35%; }
.hl2 { top: 65%; }

.hero-content {
  position: relative; z-index: 10;
  max-width: 860px; margin: 0 auto; padding: 0 32px 80px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
}

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 5px 16px; border-radius: 100px; margin-bottom: 28px;
  background: rgba(16,185,129,0.12);
  border: 1px solid rgba(16,185,129,0.28);
  animation: scaleIn 0.7s ease 0.1s both;
}
.hero-eyebrow span { font-size: 11px; font-weight: 700; color: var(--em3); letter-spacing: 1.5px; text-transform: uppercase; }
.eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--em); animation: pulse3 2s infinite; }

.hero-h1 {
  font-family: 'Cormorant Garant', serif;
  font-size: clamp(48px, 7.5vw, 96px);
  font-weight: 700; line-height: 1.0; color: #fff;
  margin-bottom: 12px;
  animation: fadeUp 0.9s ease 0.2s both;
}
.hero-h1-em {
  display: block; font-style: italic;
  color: transparent;
  background: linear-gradient(90deg, var(--em3), var(--em), #6EE7B7);
  -webkit-background-clip: text; background-clip: text;
  background-size: 200%;
  animation: shimmer 5s linear infinite, fadeUp 0.9s ease 0.25s both;
}

.hero-subhead {
  font-size: clamp(14px, 1.6vw, 17px); color: rgba(255,255,255,0.55);
  line-height: 1.75; max-width: 520px; margin-bottom: 48px;
  animation: fadeUp 0.9s ease 0.4s both;
}

/* Stats band */
.hero-band {
  width: 100%; max-width: 520px;
  display: flex; border-radius: var(--r12);
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04); backdrop-filter: blur(10px);
  overflow: hidden; margin-bottom: 44px;
  animation: fadeUp 0.9s ease 0.5s both;
}
.hero-stat { flex: 1; padding: 20px 0; text-align: center; border-right: 1px solid rgba(255,255,255,0.07); }
.hero-stat:last-child { border-right: none; }
.hs-n { font-family: 'Cormorant Garant', serif; font-size: 34px; font-weight: 700; color: var(--em3); line-height: 1; }
.hs-l { font-size: 10.5px; color: rgba(255,255,255,0.4); letter-spacing: 1px; text-transform: uppercase; margin-top: 4px; }

/* CTA buttons */
.hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; animation: fadeUp 0.9s ease 0.6s both; }
.btn-primary {
  background: var(--em); color: var(--slate);
  border: none; border-radius: var(--r12);
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14.5px; font-weight: 700;
  padding: 13px 30px; cursor: pointer;
  box-shadow: 0 4px 20px rgba(16,185,129,0.4), 0 0 0 0 rgba(16,185,129,0);
  transition: all 0.25s;
  display: inline-flex; align-items: center; gap: 8px;
}
.btn-primary:hover { background: var(--em3); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(16,185,129,0.5); }
.btn-ghost {
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8);
  border: 1.5px solid rgba(255,255,255,0.18); border-radius: var(--r12);
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14.5px; font-weight: 600;
  padding: 13px 28px; cursor: pointer; transition: all 0.25s; backdrop-filter: blur(8px);
  display: inline-flex; align-items: center; gap: 8px;
}
.btn-ghost:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }

/* Scroll cue */
.scroll-hint {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 5px; z-index: 10;
  color: rgba(255,255,255,0.28); font-size: 9.5px; letter-spacing: 2.5px; text-transform: uppercase;
  animation: pulse3 3s infinite;
}
.scroll-line { width: 1px; height: 40px; background: linear-gradient(to bottom, transparent, rgba(16,185,129,0.5)); }

/* ─── BODY LAYOUT ───────────────────────────────── */
.site-body { display: flex; }

/* ─── SIDEBAR ───────────────────────────────────── */
.sidebar {
  width: 264px; flex-shrink: 0; position: sticky; top: 96px;
  height: calc(100vh - 96px); overflow-y: auto; overflow-x: hidden;
  background: var(--card);
  border-right: 1px solid var(--border);
  scrollbar-width: none;
}
.sidebar::-webkit-scrollbar { display: none; }

.sb-head {
  padding: 28px 22px 18px;
  border-bottom: 1px solid var(--border);
}
.sb-school-name { font-family: 'Cormorant Garant', serif; font-size: 18px; font-weight: 700; color: var(--slate); }
.sb-school-sub  { font-size: 11px; color: var(--muted); letter-spacing: 0.5px; margin-top: 2px; }

.sb-section { padding: 16px 12px 4px; }
.sb-section-label { font-size: 9px; text-transform: uppercase; letter-spacing: 2.5px; color: var(--lighter); padding: 0 10px; margin-bottom: 6px; }

.sb-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 10px; cursor: pointer;
  background: none; border: none; width: 100%; text-align: left;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; font-weight: 500;
  color: var(--muted); transition: all 0.18s; margin-bottom: 1px;
}
.sb-item:hover  { background: var(--em-pale); color: var(--em2); }
.sb-item.active { background: var(--em-pale); color: var(--em2); font-weight: 700; }
.sb-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
.sb-pill {
  margin-left: auto; padding: 2px 8px; border-radius: 100px;
  font-size: 10px; font-weight: 700; background: var(--em); color: #fff;
}
.sb-pill.alert { background: #EF4444; }
.sb-hr { height: 1px; background: var(--border); margin: 8px 12px; }

/* No "Staff Portal" section in sidebar — login is hidden */

/* ─── MAIN ──────────────────────────────────────── */
.site-main { flex: 1; min-width: 0; padding: 56px 52px 100px; }

/* ─── SECTION COMMON ────────────────────────────── */
.sec { margin-bottom: 80px; scroll-margin-top: 108px; }
.sec-eye   { font-size: 10.5px; text-transform: uppercase; letter-spacing: 2.5px; color: var(--em2); font-weight: 700; margin-bottom: 6px; }
.sec-title { font-family: 'Cormorant Garant', serif; font-size: clamp(28px, 4vw, 44px); font-weight: 700; color: var(--slate); line-height: 1.1; }
.sec-desc  { font-size: 14.5px; color: var(--muted); line-height: 1.7; margin-top: 8px; max-width: 480px; }
.sec-head  { margin-bottom: 32px; }

/* ─── EVENTS ────────────────────────────────────── */
.events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(286px, 1fr)); gap: 20px; }

.ev-card {
  background: var(--card); border-radius: var(--r16); padding: 28px 24px;
  border: 1px solid var(--border); box-shadow: var(--sh);
  transition: all 0.28s; position: relative; overflow: hidden;
}
.ev-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: var(--em);
}
.ev-card.holiday::before  { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
.ev-card.sports::before   { background: linear-gradient(90deg, #3B82F6, #60A5FA); }
.ev-card.cultural::before { background: linear-gradient(90deg, #EC4899, #F472B6); }
.ev-card.exam::before     { background: linear-gradient(90deg, #8B5CF6, #A78BFA); }
.ev-card:hover { transform: translateY(-5px); box-shadow: var(--sh2); border-color: transparent; }

.ev-date {
  display: inline-flex; flex-direction: column; align-items: center;
  background: var(--slate); color: #fff; border-radius: 10px;
  padding: 8px 12px; margin-bottom: 14px; min-width: 52px;
}
.ev-d { font-family: 'Cormorant Garant', serif; font-size: 26px; font-weight: 700; line-height: 1; }
.ev-m { font-size: 9.5px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.55; margin-top: 1px; }

.ev-badge {
  display: inline-block; padding: 3px 10px; border-radius: 100px;
  font-size: 10.5px; font-weight: 700; margin-bottom: 10px;
  background: var(--em-pale); color: var(--em2);
}
.ev-badge.holiday  { background: #FFFBEB; color: #D97706; }
.ev-badge.sports   { background: #EFF6FF; color: #2563EB; }
.ev-badge.cultural { background: #FDF2F8; color: #DB2777; }
.ev-badge.exam     { background: #F5F3FF; color: #7C3AED; }

.ev-title { font-size: 15.5px; font-weight: 700; color: var(--slate); margin-bottom: 6px; }
.ev-desc  { font-size: 13px; color: var(--muted); line-height: 1.55; }

/* ─── CALENDAR ──────────────────────────────────── */
.cal-wrap {
  background: var(--card); border-radius: var(--r24);
  border: 1px solid var(--border); box-shadow: var(--sh); padding: 36px;
}
.cal-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
.cal-nav-btn {
  width: 36px; height: 36px; border-radius: 10px;
  border: 1.5px solid var(--border); background: var(--card);
  cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;
  color: var(--slate); transition: all 0.2s;
}
.cal-nav-btn:hover { background: var(--slate); color: #fff; border-color: var(--slate); }
.cal-month { font-family: 'Cormorant Garant', serif; font-size: 24px; font-weight: 700; color: var(--slate); }
.cal-grid  { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.cal-dow   { text-align: center; font-size: 10px; font-weight: 700; color: var(--lighter); padding: 8px 0; text-transform: uppercase; letter-spacing: 0.5px; }
.cal-day {
  aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  border-radius: 10px; cursor: default; transition: all 0.15s;
  font-size: 13px; font-weight: 500; color: var(--text); position: relative;
}
.cal-day:hover   { background: var(--em-pale); }
.cal-day.today   { background: var(--slate); color: #fff; font-weight: 700; }
.cal-day.holiday { color: #D97706; font-weight: 700; }
.cal-day.has-ev::after {
  content: ''; position: absolute; bottom: 4px;
  width: 4px; height: 4px; border-radius: 50%; background: var(--em);
}
.cal-day.other   { color: rgba(0,0,0,0.2); }

/* ─── GALLERY ───────────────────────────────────── */
.gal-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: 210px 210px;
  gap: 12px;
}
.gal-cell { border-radius: var(--r16); overflow: hidden; cursor: pointer; position: relative; transition: all 0.3s; }
.gal-cell:nth-child(1) { grid-column: span 7; grid-row: span 2; }
.gal-cell:nth-child(2) { grid-column: span 5; }
.gal-cell:nth-child(3) { grid-column: span 2; }
.gal-cell:nth-child(4) { grid-column: span 3; }
.gal-cell:hover { transform: scale(1.02); z-index: 3; box-shadow: var(--sh3); }
.gal-inner {
  width: 100%; height: 100%; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
  background: linear-gradient(135deg, var(--slate), var(--slate2));
}
.gal-cell:nth-child(2) .gal-inner { background: linear-gradient(135deg, #064E3B, #065F46); }
.gal-cell:nth-child(3) .gal-inner { background: linear-gradient(135deg, #312E81, #3730A3); }
.gal-cell:nth-child(4) .gal-inner { background: linear-gradient(135deg, #7C2D12, #9A3412); }
.gal-icon  { font-size: 56px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4)); }
.gal-cell:nth-child(1) .gal-icon { font-size: 80px; }
.gal-tag   { font-size: 11.5px; color: rgba(255,255,255,0.5); font-weight: 500; }
.gal-hover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(15,23,42,0.85), transparent 55%);
  opacity: 0; transition: opacity 0.3s;
  display: flex; align-items: flex-end; padding: 20px;
}
.gal-cell:hover .gal-hover-overlay { opacity: 1; }
.gal-hover-label { color: #fff; font-size: 14.5px; font-weight: 700; }

/* ─── NOTICES ───────────────────────────────────── */
.notices { display: flex; flex-direction: column; gap: 10px; }
.notice {
  display: flex; gap: 16px; align-items: flex-start;
  background: var(--card); border-radius: var(--r16); padding: 18px 22px;
  border: 1px solid var(--border); box-shadow: var(--sh);
  border-left: 3px solid transparent; transition: all 0.22s;
}
.notice.unread { border-left-color: var(--em); }
.notice.urgent { border-left-color: #EF4444; }
.notice:hover  { transform: translateX(4px); box-shadow: var(--sh2); }
.notice-ico {
  width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
  background: var(--em-pale);
}
.notice-ico.red    { background: #FEF2F2; }
.notice-ico.yellow { background: #FFFBEB; }
.notice-ico.green  { background: #F0FDF4; }
.notice-body { flex: 1; }
.notice-title { font-size: 14.5px; font-weight: 700; color: var(--slate); margin-bottom: 4px; }
.notice-text  { font-size: 13px; color: var(--muted); line-height: 1.55; }
.notice-time  { font-size: 11px; color: var(--lighter); margin-top: 4px; }

/* ─── TEACHERS ──────────────────────────────────── */
.faculty-scroll { display: flex; gap: 18px; overflow-x: auto; padding-bottom: 8px; }
.faculty-scroll::-webkit-scrollbar { height: 3px; }
.faculty-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.faculty-card {
  background: var(--card); border-radius: var(--r16); padding: 28px 22px; text-align: center;
  min-width: 190px; flex-shrink: 0; border: 1px solid var(--border); box-shadow: var(--sh);
  transition: all 0.28s;
}
.faculty-card:hover { transform: translateY(-6px); box-shadow: var(--sh2); border-color: var(--em); }
.faculty-avatar {
  width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 14px;
  display: flex; align-items: center; justify-content: center; font-size: 28px;
  background: linear-gradient(135deg, var(--slate), var(--slate2));
  border: 2px solid var(--border);
}
.faculty-name { font-size: 14.5px; font-weight: 700; color: var(--slate); margin-bottom: 3px; }
.faculty-sub  { font-size: 12px; color: var(--muted); margin-bottom: 10px; line-height: 1.4; }
.faculty-qual { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; background: var(--em-pale); color: var(--em2); }

/* ─── PARTNER SCHOOLS ───────────────────────────── */
.schools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(252px, 1fr)); gap: 18px; }
.school-card {
  background: var(--card); border-radius: var(--r16); padding: 26px;
  border: 1px solid var(--border); box-shadow: var(--sh);
  text-decoration: none; display: block; transition: all 0.28s;
}
.school-card:hover { transform: translateY(-4px); box-shadow: var(--sh2); border-color: var(--em); }
.school-logo {
  width: 48px; height: 48px; border-radius: 12px; margin-bottom: 14px;
  display: flex; align-items: center; justify-content: center; font-size: 24px;
  background: linear-gradient(135deg, var(--slate), var(--slate2));
}
.school-name { font-size: 15px; font-weight: 700; color: var(--slate); margin-bottom: 5px; }
.school-desc { font-size: 12.5px; color: var(--muted); line-height: 1.4; }
.school-cta  { margin-top: 14px; font-size: 12.5px; color: var(--em2); font-weight: 600; display: flex; align-items: center; gap: 4px; }

/* ─── CONTACT STRIP ─────────────────────────────── */
.contact-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 80px; }
.contact-card {
  background: var(--slate); border-radius: var(--r16); padding: 28px 22px; text-align: center;
  border: 1px solid rgba(255,255,255,0.06); transition: all 0.25s;
}
.contact-card:hover { transform: translateY(-3px); background: var(--slate2); }
.cc-ico   { font-size: 34px; margin-bottom: 10px; }
.cc-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.35); margin-bottom: 5px; }
.cc-val   { font-size: 14.5px; font-weight: 600; color: rgba(255,255,255,0.85); }

/* ─── FOOTER ─────────────────────────────────────── */
.site-footer {
  background: var(--slate); color: rgba(255,255,255,0.5);
  padding: 56px 56px 32px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.ft-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 52px; margin-bottom: 48px; }
.ft-name { font-family: 'Cormorant Garant', serif; font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 10px; }
.ft-desc { font-size: 13.5px; line-height: 1.7; }
.ft-col-h { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.28); margin-bottom: 16px; }
.ft-lnk {
  display: block; color: rgba(255,255,255,0.48); text-decoration: none;
  font-size: 13.5px; margin-bottom: 10px; transition: color 0.2s; cursor: pointer;
  background: none; border: none; text-align: left;
  font-family: 'Plus Jakarta Sans', sans-serif; padding: 0;
}
.ft-lnk:hover { color: rgba(255,255,255,0.85); }
.ft-bottom {
  border-top: 1px solid rgba(255,255,255,0.07); padding-top: 22px;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;
}
.ft-copy { font-size: 12.5px; }
/* No staff portal link in footer — deliberately hidden */

/* ─── SB OVERLAY ─────────────────────────────────── */
.sb-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 998; }
.sb-overlay.open { display: block; }

/* ─── RESPONSIVE ─────────────────────────────────── */
@media (max-width: 960px) {
  .sidebar { position: fixed; left: -264px; top: 96px; z-index: 999; height: calc(100vh - 96px); transition: left 0.3s; }
  .sidebar.open { left: 0; }
  .site-main { padding: 36px 22px 80px; }
  .ham { display: flex; }
  .nav-links { display: none; }
  .contact-strip { grid-template-columns: 1fr; }
  .ft-grid { grid-template-columns: 1fr; gap: 32px; }
  .gal-grid { grid-template-columns: 1fr 1fr; grid-template-rows: 170px 170px; }
  .gal-cell:nth-child(1) { grid-column: span 2; grid-row: span 1; }
}
@media (max-width: 600px) {
  .topnav { padding: 0 18px; }
  .ticker-wrap { display: none; }
  .hero { padding-top: 80px; }
  .hero-band { flex-direction: column; max-width: 260px; }
  .hero-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 14px 0; }
  .hero-stat:last-child { border-bottom: none; }
  .site-main { padding: 24px 16px 60px; }
  .events-grid { grid-template-columns: 1fr; }
  .faculty-scroll { gap: 12px; }
  .schools-grid { grid-template-columns: 1fr; }
  .site-footer { padding: 36px 20px 28px; }
}
`;

/* ── DATA ─────────────────────────────────────────── */
const TICKERS = [
  '📢 Annual Exams begin 10th April 2026',
  '🏆 Sports Day results — check the gallery',
  '📚 New worksheets uploaded for Class 3–5',
  '⚠️  School closed 18 March — Staff Meeting',
  '🎉 Cultural Fest registrations open now',
  '🌟 Congratulations to our Class 5 toppers!',
];

const EVENTS = [
  { d:26, m:'Jan', type:'holiday', title:'Republic Day',         desc:'National holiday — school remains closed.' },
  { d:14, m:'Feb', type:'cultural',title:'Annual Cultural Fest', desc:'Dance, drama, music & art for all classes.' },
  { d:22, m:'Mar', type:'sports',  title:'Inter-School Cricket', desc:'District level tournament — support the team!' },
  { d:10, m:'Apr', type:'exam',    title:'Annual Exams Begin',   desc:'Classes 1–5 annual examination schedule.' },
  { d:5,  m:'Jun', type:'event',   title:'New Session Begins',   desc:'Academic year 2026–27 with orientation.' },
  { d:15, m:'Aug', type:'holiday', title:'Independence Day',     desc:'Flag hoisting ceremony at 8:00 AM sharp.' },
];

const NOTICES = [
  { ico:'📢', c:'red',    title:'Exam Date Sheet Released',   text:'Annual examination schedule for Classes 1–5 is available. Check the school calendar for all dates.',                          time:'2 hours ago', unread:true, urgent:true  },
  { ico:'🏆', c:'green',  title:'Sports Day Results',          text:'Congratulations to all winners! Full results and photos are now available in the gallery section.',                           time:'1 day ago',   unread:true              },
  { ico:'📚', c:'',       title:'New Study Material Uploaded', text:'Mathematics and Science worksheets for Class 3–5 have been uploaded by respective subject teachers.',                         time:'2 days ago',  unread:false             },
  { ico:'⚠️', c:'yellow', title:'School Closed – March 18',    text:'School will remain closed on 18th March 2026 due to Annual Staff Development Day.',                                          time:'3 days ago',  unread:false, urgent:true },
  { ico:'🎉', c:'green',  title:'Cultural Fest Registration',  text:'Registration open for Annual Cultural Fest. Contact your class teacher before 5th March.',                                   time:'5 days ago',  unread:false             },
];

const FACULTY = [
  { e:'👩‍🏫', name:'Mrs. Priya Sharma', sub:'Class Teacher – V',   qual:'M.Ed, B.Sc'  },
  { e:'👨‍🏫', name:'Mr. Rahul Verma',   sub:'Mathematics',          qual:'M.Sc Math'   },
  { e:'👩‍🏫', name:'Mrs. Sunita Yadav', sub:'Hindi & EVS',          qual:'M.A. Hindi'  },
  { e:'👨‍🏫', name:'Mr. Anil Gupta',    sub:'Science',              qual:'M.Sc Sci.'   },
  { e:'👩‍🏫', name:'Ms. Kavya Singh',   sub:'English',              qual:'M.A. Eng.'   },
  { e:'👨‍🏫', name:'Mr. D. Tiwari',     sub:'Physical Education',   qual:'B.P.Ed'      },
];

const SCHOOLS = [
  { e:'🏫', name:"St. Mary's High School",  desc:'Central Board, Lucknow'  },
  { e:'🎓', name:'City Montessori School',   desc:'ISO Certified, 14 Campuses' },
  { e:'📐', name:'Delhi Public School',      desc:'CBSE, Kanpur Road'       },
  { e:'🌟', name:'Kendriya Vidyalaya',       desc:'Govt. School, Gomti Nagar' },
];

const GALLERY = [
  { e:'🏆', label:'Sports Day 2025'     },
  { e:'🎭', label:'Cultural Fest'       },
  { e:'🔬', label:'Science Exhibition'  },
  { e:'🎨', label:'Art Competition'     },
];

/* ── CALENDAR ─────────────────────────────────────── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOWS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const EV_D   = new Set([26,14,22,10,5,15]);
const HOL_D  = new Set([26,15]);

function buildDays(y, m) {
  const fd = new Date(y,m,1).getDay();
  const tot = new Date(y,m+1,0).getDate();
  const prev = new Date(y,m,0).getDate();
  const out = [];
  for (let i=fd-1; i>=0; i--) out.push({d:prev-i, curr:false});
  for (let d=1; d<=tot; d++) out.push({d, curr:true});
  while (out.length % 7) out.push({d:out.length-fd-tot+1, curr:false});
  return out;
}

/* ── COMPONENT ────────────────────────────────────── */
export default function HomePage() {
  const nav = useNavigate();
  const [active, setActive] = useState('events');
  const [sbOpen, setSbOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cal, setCal] = useState({ y:2026, m:2 });
  const [hovGal, setHovGal] = useState(-1);
  const today = new Date();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const goTo = (id) => {
    setActive(id); setSbOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 40);
  };

  const days = buildDays(cal.y, cal.m);
  const prevM = () => setCal(s => { const d=new Date(s.y,s.m-1); return {y:d.getFullYear(),m:d.getMonth()}; });
  const nextM = () => setCal(s => { const d=new Date(s.y,s.m+1); return {y:d.getFullYear(),m:d.getMonth()}; });

  const NAV_ITEMS = [
    ['events','events','📅 Events'],
    ['calendar','calendar','🗓 Calendar'],
    ['photos','photos','📸 Gallery'],
    ['notifications','notifications','🔔 Notice'],
    ['teachers','teachers','👨‍🏫 Faculty'],
    ['schools','schools'],
  ];

  return (
    <>
      <style>{STYLES}</style>

      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker-tag">📌 News</div>
        <div className="ticker-track">
          <div className="ticker-inner">
            {[...TICKERS,...TICKERS].map((t,i) => (
              <span key={i} className="ticker-item">
                {t} <span className="ticker-sep">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── TOPNAV ── */}
      <nav className={`topnav${scrolled?' scrolled':''}`}>
        <div className="nav-brand" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>
          <div className="nav-crest">🏫</div>
          <div className="nav-brand-text">
            <div className="nav-brand-name">Vidya Mandir</div>
            <div className="nav-brand-tag">School Portal</div>
          </div>
        </div>

        {/* <div className="nav-links">
          {NAV_ITEMS.map(([id,,lbl]) => (
            <button key={id} className={`nav-link${active===id?' active':''}`} onClick={() => goTo(id)}>{lbl}</button>
          ))}
        </div> */}

        <div className="nav-actions">
          <div className="nav-notif" onClick={() => goTo('notifications')}>
            🔔 <div className="notif-pip"/>
          </div>
          <button className="ham" onClick={() => setSbOpen(v=>!v)}>
            <div className="ham-b"/><div className="ham-b"/><div className="ham-b"/>
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-canvas">
          <div className="hero-noise"/>
          <div className="hero-grid"/>
        </div>
        <div className="hero-glow hg1"/>
        <div className="hero-glow hg2"/>
        <div className="hero-line hl1"/>
        <div className="hero-line hl2"/>

        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="eyebrow-dot"/>
            <span>Academic Year 2025 – 2026</span>
            <div className="eyebrow-dot"/>
          </div>

          <h1 className="hero-h1">
            Vidya Mandir
            <span className="hero-h1-em">School of Excellence</span>
          </h1>

          <p className="hero-subhead">
            Play Group se Class 5 tak — ek safar, ek parivar.<br/>
            <em>Excellence in Education · Values for Life · Gomti Nagar, Lucknow</em>
          </p>

          <div className="hero-band">
            <div className="hero-stat"><div className="hs-n">500+</div><div className="hs-l">Students</div></div>
            <div className="hero-stat"><div className="hs-n">32</div><div className="hs-l">Teachers</div></div>
            <div className="hero-stat"><div className="hs-n">15+</div><div className="hs-l">Years</div></div>
            <div className="hero-stat"><div className="hs-n">98%</div><div className="hs-l">Pass Rate</div></div>
          </div>

          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => goTo('events')}>🎉 Upcoming Events</button>
            <button className="btn-ghost" onClick={() => goTo('teachers')}>👨‍🏫 Meet Our Faculty</button>
          </div>
        </div>

        <div className="scroll-hint">
          <div className="scroll-line"/>
          Scroll
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="site-body">

        {/* SIDEBAR — no login link */}
        <div className={`sb-overlay${sbOpen?' open':''}`} onClick={() => setSbOpen(false)}/>
        <aside className={`sidebar${sbOpen?' open':''}`}>
          <div className="sb-head">
            <div className="sb-school-name">Vidya Mandir</div>
            <div className="sb-school-sub">School Management Portal</div>
          </div>

          <div className="sb-section">
            <div className="sb-section-label">School Info</div>
            {[
              ['events',        '📅','Upcoming Events',  <span className="sb-pill">6</span>],
              ['calendar',      '🗓','School Calendar',   null],
              ['photos',        '📸','Photo Gallery',     null],
              ['notifications', '🔔','Notices & Alerts',  <span className="sb-pill alert">2</span>],
            ].map(([id,ico,lbl,badge]) => (
              <button key={id} className={`sb-item${active===id?' active':''}`} onClick={() => goTo(id)}>
                <span className="sb-icon">{ico}</span>{lbl}{badge}
              </button>
            ))}
          </div>

          <div className="sb-hr"/>

          <div className="sb-section">
            <div className="sb-section-label">People</div>
            <button className={`sb-item${active==='teachers'?' active':''}`} onClick={() => goTo('teachers')}>
              <span className="sb-icon">👨‍🏫</span>Our Faculty
            </button>
          </div>

          <div className="sb-hr"/>

          {/* <div className="sb-section">
            <div className="sb-section-label">Network</div>
            <button className={`sb-item${active==='schools'?' active':''}`} onClick={() => goTo('schools')}>
              <span className="sb-icon">🔗</span>Partner Schools
            </button>
          </div> */}
          {/* ✅ NO "Staff Portal Login" section — login is hidden at /portal-login only */}
        </aside>

        {/* MAIN */}
        <main className="site-main">

          {/* EVENTS */}
          <section id="events" className="sec">
            <div className="sec-head">
              <div className="sec-eye">School Life</div>
              <h2 className="sec-title">Upcoming Events</h2>
              <p className="sec-desc">Stay informed about all school activities, examinations, holidays and competitions throughout the year.</p>
            </div>
            <div className="events-grid">
              {EVENTS.map((ev,i) => (
                <div key={i} className={`ev-card ${ev.type}`}>
                  <div className="ev-date"><div className="ev-d">{ev.d}</div><div className="ev-m">{ev.m}</div></div>
                  <div className={`ev-badge ${ev.type}`}>{ev.type.charAt(0).toUpperCase()+ev.type.slice(1)}</div>
                  <div className="ev-title">{ev.title}</div>
                  <div className="ev-desc">{ev.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CALENDAR */}
          <section id="calendar" className="sec">
            <div className="sec-head">
              <div className="sec-eye">Schedule</div>
              <h2 className="sec-title">School Calendar</h2>
              <p className="sec-desc">Monthly overview of all events, holidays, examinations and special occasions.</p>
            </div>
            <div className="cal-wrap">
              <div className="cal-hdr">
                <button className="cal-nav-btn" onClick={prevM}>‹</button>
                <span className="cal-month">{MONTHS[cal.m]} {cal.y}</span>
                <button className="cal-nav-btn" onClick={nextM}>›</button>
              </div>
              <div className="cal-grid">
                {DOWS.map(d => <div key={d} className="cal-dow">{d}</div>)}
                {days.map((c,i) => {
                  const isTd  = c.curr && cal.y===today.getFullYear() && cal.m===today.getMonth() && c.d===today.getDate();
                  const isHol = c.curr && HOL_D.has(c.d);
                  const isEv  = c.curr && EV_D.has(c.d);
                  return (
                    <div key={i} className={`cal-day${isTd?' today':''}${isHol&&!isTd?' holiday':''}${isEv?' has-ev':''}${!c.curr?' other':''}`}>
                      {c.d}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* GALLERY */}
          <section id="photos" className="sec">
            <div className="sec-head">
              <div className="sec-eye">Memories</div>
              <h2 className="sec-title">Photo Gallery</h2>
              <p className="sec-desc">Cherished moments from school events, competitions, and everyday life at Vidya Mandir.</p>
            </div>
            <div className="gal-grid">
              {GALLERY.map((g,i) => (
                <div key={i} className="gal-cell"
                  onMouseEnter={() => setHovGal(i)} onMouseLeave={() => setHovGal(-1)}>
                  <div className="gal-inner">
                    <span className="gal-icon">{g.e}</span>
                    <span className="gal-tag">{g.label}</span>
                  </div>
                  <div className="gal-hover-overlay">
                    <span className="gal-hover-label">📷 {g.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* NOTICES */}
          <section id="notifications" className="sec">
            <div className="sec-head">
              <div className="sec-eye">Announcements</div>
              <h2 className="sec-title">Notices &amp; Alerts</h2>
              <p className="sec-desc">Important announcements, circulars, and notices from school management.</p>
            </div>
            <div className="notices">
              {NOTICES.map((n,i) => (
                <div key={i} className={`notice${n.unread?' unread':''}${n.urgent?' urgent':''}`}>
                  <div className={`notice-ico ${n.c}`}>{n.ico}</div>
                  <div className="notice-body">
                    <div className="notice-title">{n.title}</div>
                    <div className="notice-text">{n.text}</div>
                    <div className="notice-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FACULTY */}
          <section id="teachers" className="sec">
            <div className="sec-head">
              <div className="sec-eye">Faculty</div>
              <h2 className="sec-title">Our Teachers</h2>
              <p className="sec-desc">Dedicated educators shaping the future of every child with passion and expertise.</p>
            </div>
            <div className="faculty-scroll">
              {FACULTY.map((f,i) => (
                <div key={i} className="faculty-card">
                  <div className="faculty-avatar">{f.e}</div>
                  <div className="faculty-name">{f.name}</div>
                  <div className="faculty-sub">{f.sub}</div>
                  <span className="faculty-qual">{f.qual}</span>
                </div>
              ))}
            </div>
          </section>

          {/* PARTNER SCHOOLS */}
          {/* <section id="schools" className="sec">
            <div className="sec-head">
              <div className="sec-eye">Network</div>
              <h2 className="sec-title">Partner Schools</h2>
              <p className="sec-desc">Affiliated institutions and partner schools in our education network.</p>
            </div>
            <div className="schools-grid">
              {SCHOOLS.map((s,i) => (
                <a key={i} href="#" className="school-card">
                  <div className="school-logo">{s.e}</div>
                  <div className="school-name">{s.name}</div>
                  <div className="school-desc">{s.desc}</div>
                  <div className="school-cta">Visit website <span>→</span></div>
                </a>
              ))}
            </div>
          </section> */}

          {/* CONTACT */}
          <div className="contact-strip">
            <div className="contact-card">
              <div className="cc-ico">📍</div>
              <div className="cc-label">Address</div>
              <div className="cc-val">Gomti Nagar, Lucknow, UP</div>
            </div>
            <div className="contact-card">
              <div className="cc-ico">📞</div>
              <div className="cc-label">Phone</div>
              <div className="cc-val">+91-522-0000000</div>
            </div>
            <div className="contact-card">
              <div className="cc-ico">✉️</div>
              <div className="cc-label">Email</div>
              <div className="cc-val">info@vidyamandir.edu.in</div>
            </div>
          </div>

        </main>
      </div>

      {/* FOOTER — no staff portal link */}
      <footer className="site-footer">
        <div className="ft-grid">
          <div>
            <div className="ft-name">🏫 Vidya Mandir</div>
            <div className="ft-desc">A premier institution providing quality education from Play Group to Class 5. Nurturing young minds with academic excellence and strong values since 2009.</div>
          </div>
          <div>
            <div className="ft-col-h">Quick Links</div>
            {['events','calendar','photos','notifications','teachers','schools'].map(id => (
              <button key={id} className="ft-lnk" onClick={() => goTo(id)}>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
          <div>
            <div className="ft-col-h">Contact Us</div>
            <div className="ft-lnk">📍 gangapur, Jaunpur, UP</div>
            <div className="ft-lnk">📞 +91-522-0000000</div>
            <div className="ft-lnk">✉️ info@vidyamandir.edu.in</div>
          </div>
        </div>
        <div className="ft-bottom">
          <div className="ft-copy">© 2026 Vidya Mandir School. All rights reserved.</div>
          {/* ✅ NO "🔐 Staff Portal" button — login only via /portal-login direct URL */}
        </div>
      </footer>
    </>
  );
}

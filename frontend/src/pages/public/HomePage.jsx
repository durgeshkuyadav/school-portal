import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────────
   VIDYA MANDIR — Public School Website
   Design: Deep navy + gold accent, Playfair Display + DM Sans
   Animated hero with morphing shapes, sidebar dashboard, no login exposure
   ───────────────────────────────────────────────────────────────── */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy:    #0A1628;
  --navy2:   #0F2040;
  --blue:    #1565C0;
  --blue2:   #1976D2;
  --sky:     #03A9F4;
  --gold:    #F5A623;
  --gold2:   #FFB84D;
  --cream:   #FFFDF7;
  --light:   #F4F7FC;
  --text:    #0D1B2E;
  --muted:   #607090;
  --border:  rgba(11,31,58,0.09);
  --card-bg: rgba(255,255,255,0.97);
  --r12: 12px; --r16: 16px; --r24: 24px;
  --sh:  0 4px 24px rgba(10,22,40,0.1);
  --sh2: 0 12px 48px rgba(10,22,40,0.18);
}

html { scroll-behavior: smooth; font-size: 16px; }
body { font-family: 'DM Sans', sans-serif; background: var(--light); color: var(--text); overflow-x: hidden; }

/* ─── ANIMATIONS ─────────────────────────────────────── */
@keyframes fadeUp   { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
@keyframes slideIn  { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
@keyframes cardPop  { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
@keyframes float1   { 0%,100% { transform:translateY(0)   rotate(0deg);   }  50% { transform:translateY(-22px) rotate(3deg);  } }
@keyframes float2   { 0%,100% { transform:translateY(0)   rotate(0deg);   }  50% { transform:translateY(-16px) rotate(-4deg); } }
@keyframes float3   { 0%,100% { transform:translateY(-8px) rotate(2deg);  }  50% { transform:translateY(8px)  rotate(-2deg); } }
@keyframes orbit    { from { transform:rotate(0deg) translateX(80px) rotate(0deg);   } to { transform:rotate(360deg) translateX(80px) rotate(-360deg); } }
@keyframes shimmer  { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
@keyframes ticker   { from { transform:translateX(0);     } to { transform:translateX(-50%); } }
@keyframes pulse2   { 0%,100%{opacity:.45;} 50%{opacity:.9;} }
@keyframes scaleBob { 0%,100%{transform:scale(1);} 50%{transform:scale(1.06);} }
@keyframes rotateY  { from{transform:rotateY(0deg);}to{transform:rotateY(360deg);} }

/* ─── TICKER ─────────────────────────────────────────── */
.ticker-wrap {
  background: var(--gold); color: var(--navy); overflow: hidden;
  height: 36px; display:flex; align-items:center;
  position: fixed; top: 0; left: 0; right: 0; z-index: 1001;
}
.ticker-label {
  background: var(--navy); color: var(--gold); padding: 0 16px;
  height: 100%; display:flex; align-items:center; font-size:11px;
  font-weight:700; letter-spacing:2px; text-transform:uppercase; flex-shrink:0; white-space:nowrap;
}
.ticker-track { overflow:hidden; flex:1; }
.ticker-inner {
  display:inline-flex; gap:0; white-space:nowrap;
  animation: ticker 28s linear infinite;
}
.ticker-item { padding: 0 40px; font-size:13px; font-weight:600; }
.ticker-dot  { color: var(--navy); opacity:.4; }

/* ─── TOP NAV ─────────────────────────────────────────── */
.topnav {
  position: fixed; top: 36px; left: 0; right: 0; z-index: 1000;
  height: 64px; display:flex; align-items:center; justify-content:space-between;
  padding: 0 40px;
  background: rgba(10,22,40,0.93); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(245,166,35,0.15);
  transition: all 0.35s ease;
}
.topnav.scrolled {
  box-shadow: 0 4px 32px rgba(0,0,0,0.35);
  background: rgba(10,22,40,0.98);
}

.nav-logo-wrap { display:flex; align-items:center; gap:12px; cursor:pointer; }
.nav-logo-emblem {
  width:44px; height:44px; border-radius:12px;
  background: linear-gradient(135deg, var(--gold) 0%, #FF8C00 100%);
  display:flex; align-items:center; justify-content:center; font-size:22px;
  box-shadow: 0 4px 16px rgba(245,166,35,0.4);
  animation: scaleBob 4s ease-in-out infinite;
}
.nav-logo-text { line-height:1.15; }
.nav-logo-name { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:#fff; letter-spacing:.3px; }
.nav-logo-sub  { font-size:10px; color:rgba(255,255,255,.4); letter-spacing:1.5px; text-transform:uppercase; }

.nav-center { display:flex; gap:2px; }
.nav-btn {
  background:none; border:none; cursor:pointer;
  color:rgba(255,255,255,.65); font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:500;
  padding:8px 14px; border-radius:8px; transition:all .2s;
}
.nav-btn:hover { color:#fff; background:rgba(255,255,255,.09); }
.nav-btn.active { color:var(--gold); }

.nav-right { display:flex; align-items:center; gap:10px; }
.nav-notif-btn {
  width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.1); display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:rgba(255,255,255,.7); font-size:16px; transition:all .2s; position:relative;
}
.nav-notif-btn:hover { background:rgba(255,255,255,.14); color:#fff; }
.notif-dot {
  position:absolute; top:5px; right:5px; width:8px; height:8px;
  background:var(--gold); border-radius:50%; border:2px solid var(--navy);
  animation: scaleBob 1.5s ease-in-out infinite;
}

/* ─── HERO ─────────────────────────────────────────────── */
.hero {
  min-height: 100vh; position:relative; overflow:hidden;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding-top: 100px;
}

/* Animated layered background */
.hero-bg {
  position:absolute; inset:0; z-index:0;
  background: radial-gradient(ellipse 120% 80% at 60% 30%, #102A50 0%, #081420 60%, #030C18 100%);
}
.hero-bg-grid {
  position:absolute; inset:0; z-index:1;
  background-image:
    linear-gradient(rgba(245,166,35,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(245,166,35,.04) 1px, transparent 1px);
  background-size: 50px 50px;
}
.hero-bg-radial {
  position:absolute; inset:0; z-index:2;
  background: radial-gradient(circle 600px at 70% 50%, rgba(3,169,244,.07), transparent),
              radial-gradient(circle 400px at 20% 70%, rgba(245,166,35,.06), transparent);
}

/* Floating shapes */
.shape {
  position:absolute; border-radius:50%; z-index:2; pointer-events:none;
}
.shape-1 {
  width:500px; height:500px; top:-120px; right:-80px;
  background: radial-gradient(circle, rgba(3,169,244,.12), transparent 70%);
  animation: float1 9s ease-in-out infinite;
}
.shape-2 {
  width:320px; height:320px; bottom:60px; left:-60px;
  background: radial-gradient(circle, rgba(245,166,35,.10), transparent 70%);
  animation: float2 12s ease-in-out infinite;
}
.shape-3 {
  width:180px; height:180px; top:45%; left:12%;
  background: radial-gradient(circle, rgba(3,169,244,.08), transparent 70%);
  animation: float3 7s ease-in-out infinite;
}
/* Orbiting dots */
.orbit-center { position:absolute; top:50%; right:18%; z-index:2; width:0; height:0; }
.orbit-dot {
  width:10px; height:10px; border-radius:50%; background:var(--gold); opacity:.5;
  animation: orbit 6s linear infinite;
}
.orbit-dot:nth-child(2) { width:6px; height:6px; background:var(--sky); animation-duration:9s; animation-direction:reverse; }
.orbit-dot:nth-child(3) { width:8px; height:8px; background:#fff; opacity:.2; animation-duration:13s; }

.hero-content {
  position:relative; z-index:10; text-align:center;
  padding: 0 24px 80px; max-width:820px; margin:0 auto;
}

.hero-eyebrow {
  display:inline-flex; align-items:center; gap:8px;
  background: rgba(245,166,35,.12); border:1px solid rgba(245,166,35,.3);
  color:var(--gold); padding:6px 18px; border-radius:100px;
  font-size:12px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;
  margin-bottom:28px;
  animation: fadeUp .8s ease .1s both;
}

.hero-title {
  font-family:'Playfair Display',serif;
  font-size: clamp(44px,7.5vw,88px);
  font-weight:900; line-height:1.05; color:#fff;
  margin-bottom:24px;
  animation: fadeUp .8s ease .2s both;
}
.hero-title-accent {
  display:block; color:transparent;
  background: linear-gradient(90deg, var(--gold), var(--gold2), #FF8C00);
  -webkit-background-clip:text; background-clip:text;
  background-size:200%; animation: shimmer 4s linear infinite, fadeUp .8s ease .25s both;
}

.hero-sub {
  font-size: clamp(15px,1.8vw,19px); color:rgba(255,255,255,.65);
  line-height:1.7; margin-bottom:48px; max-width:540px; margin-left:auto; margin-right:auto;
  animation: fadeUp .8s ease .35s both;
}

.hero-stats {
  display:flex; justify-content:center; gap:0; margin-bottom:52px;
  border:1px solid rgba(255,255,255,.1); border-radius:var(--r16);
  background:rgba(255,255,255,.04); backdrop-filter:blur(8px);
  overflow:hidden; max-width:500px; margin-left:auto; margin-right:auto;
  animation: fadeUp .8s ease .45s both;
}
.hero-stat {
  flex:1; padding:20px 0; text-align:center;
  border-right:1px solid rgba(255,255,255,.08);
}
.hero-stat:last-child { border-right:none; }
.hero-stat-n { font-family:'Playfair Display',serif; font-size:32px; font-weight:900; color:var(--gold); line-height:1; }
.hero-stat-l { font-size:11px; color:rgba(255,255,255,.45); letter-spacing:.8px; margin-top:4px; }

.hero-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; animation: fadeUp .8s ease .55s both; }
.btn-gold {
  background: linear-gradient(135deg, var(--gold), #FF8C00);
  color:var(--navy); border:none; padding:14px 34px; border-radius:var(--r12);
  font-family:'DM Sans',sans-serif; font-size:15px; font-weight:700; cursor:pointer;
  box-shadow:0 8px 24px rgba(245,166,35,.45); transition:all .25s;
  display:inline-flex; align-items:center; gap:8px; text-decoration:none;
}
.btn-gold:hover { transform:translateY(-3px); box-shadow:0 14px 36px rgba(245,166,35,.55); }
.btn-outline {
  background:rgba(255,255,255,.07); border:1.5px solid rgba(255,255,255,.22);
  color:#fff; padding:14px 30px; border-radius:var(--r12);
  font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600; cursor:pointer;
  backdrop-filter:blur(6px); transition:all .25s;
  display:inline-flex; align-items:center; gap:8px; text-decoration:none;
}
.btn-outline:hover { background:rgba(255,255,255,.14); transform:translateY(-2px); }

.scroll-cue {
  position:absolute; bottom:28px; left:50%; transform:translateX(-50%);
  display:flex; flex-direction:column; align-items:center; gap:4px; z-index:10;
  color:rgba(255,255,255,.35); font-size:10px; letter-spacing:2px; text-transform:uppercase;
  animation: pulse2 2.5s ease infinite;
}
.scroll-cue-line { width:1px; height:44px; background:linear-gradient(to bottom, transparent, rgba(255,255,255,.4)); }

/* ─── PAGE BODY ───────────────────────────────────────── */
.site-body { display:flex; position:relative; }

/* ─── SIDEBAR ─────────────────────────────────────────── */
.sidebar {
  width:272px; flex-shrink:0; position:sticky; top:100px;
  height:calc(100vh - 100px); overflow-y:auto; overflow-x:hidden;
  background: var(--navy2);
  border-right:1px solid rgba(255,255,255,.06);
  scrollbar-width:none;
}
.sidebar::-webkit-scrollbar { display:none; }

.sb-header {
  padding:28px 22px 20px;
  border-bottom:1px solid rgba(255,255,255,.07);
  background: linear-gradient(160deg, rgba(21,101,192,.25), transparent);
}
.sb-label { font-size:10px; text-transform:uppercase; letter-spacing:2px; color:rgba(255,255,255,.3); margin-bottom:6px; }
.sb-school { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:#fff; line-height:1.3; }
.sb-tagline { font-size:11px; color:rgba(255,255,255,.35); margin-top:3px; }

.sb-section { padding:18px 14px 6px; }
.sb-section-title { font-size:9.5px; text-transform:uppercase; letter-spacing:2.5px; color:rgba(255,255,255,.22); padding:0 8px; margin-bottom:8px; }

.sb-item {
  display:flex; align-items:center; gap:11px; padding:10px 12px;
  border-radius:10px; cursor:pointer; transition:all .2s; margin-bottom:2px;
  color:rgba(255,255,255,.6); border:none; background:none; width:100%;
  text-align:left; font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:500;
  animation: slideIn .4s ease both;
}
.sb-item:hover { background:rgba(255,255,255,.08); color:#fff; }
.sb-item.active {
  background: linear-gradient(135deg, rgba(21,101,192,.55), rgba(3,169,244,.18));
  color:#fff;
}
.sb-item.active .sb-icon { color:var(--sky); }
.sb-icon { font-size:17px; width:20px; text-align:center; flex-shrink:0; }
.sb-badge {
  margin-left:auto; padding:2px 8px; border-radius:100px;
  font-size:10px; font-weight:700; background:var(--gold); color:var(--navy);
}
.sb-badge.red { background:#EF5350; color:#fff; }

.sb-hr { height:1px; background:rgba(255,255,255,.07); margin:8px 14px; }

.sb-sub { padding-left:44px; }
.sb-sub-item {
  display:block; padding:7px 10px; border-radius:7px;
  color:rgba(255,255,255,.38); font-size:12.5px; transition:all .2s;
  cursor:pointer; border:none; background:none; width:100%;
  text-align:left; font-family:'DM Sans',sans-serif; margin-bottom:1px;
}
.sb-sub-item:hover { color:rgba(255,255,255,.75); background:rgba(255,255,255,.05); }

/* ─── MAIN ────────────────────────────────────────────── */
.site-main { flex:1; min-width:0; padding:52px 48px 100px; }

.sec { margin-bottom:88px; scroll-margin-top:112px; }

.sec-eye { font-size:10.5px; text-transform:uppercase; letter-spacing:2.5px; color:var(--blue2); font-weight:700; margin-bottom:7px; }
.sec-title { font-family:'Playfair Display',serif; font-size:clamp(26px,4vw,42px); font-weight:900; color:var(--navy); line-height:1.15; }
.sec-desc { color:var(--muted); font-size:14.5px; line-height:1.65; margin-top:10px; max-width:520px; }
.sec-head { margin-bottom:36px; }

/* ─── EVENT CARDS ─────────────────────────────────────── */
.events-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:22px; }
.ev-card {
  background:var(--card-bg); border-radius:var(--r16); padding:26px 24px;
  box-shadow:var(--sh); border:1px solid var(--border); transition:all .3s;
  position:relative; overflow:hidden;
  animation: cardPop .5s ease both;
}
.ev-card::after {
  content:''; position:absolute; top:0; left:0; right:0; height:3.5px;
  background:linear-gradient(90deg, var(--blue), var(--sky));
}
.ev-card.holiday::after { background:linear-gradient(90deg, var(--gold), #FF8C00); }
.ev-card.sports::after  { background:linear-gradient(90deg, #43A047, #8BC34A); }
.ev-card.cultural::after{ background:linear-gradient(90deg, #E91E63, #F06292); }
.ev-card.exam::after    { background:linear-gradient(90deg, #7B1FA2, #CE93D8); }
.ev-card:hover { transform:translateY(-6px); box-shadow:var(--sh2); }

.ev-date {
  display:inline-flex; flex-direction:column; align-items:center;
  background:var(--navy); color:#fff; border-radius:10px; padding:8px 13px;
  margin-bottom:14px; min-width:50px;
}
.ev-day   { font-size:22px; font-weight:900; line-height:1; font-family:'Playfair Display',serif; }
.ev-month { font-size:10px; text-transform:uppercase; letter-spacing:1px; opacity:.6; }

.ev-tag {
  display:inline-block; padding:3px 10px; border-radius:100px;
  font-size:10.5px; font-weight:700; margin-bottom:10px;
  background:rgba(21,101,192,.1); color:var(--blue2);
}
.ev-tag.holiday  { background:rgba(245,166,35,.13); color:#B8860B; }
.ev-tag.sports   { background:rgba(67,160,71,.12);  color:#2E7D32; }
.ev-tag.cultural { background:rgba(233,30,99,.1);   color:#C2185B; }
.ev-tag.exam     { background:rgba(123,31,162,.1);  color:#6A1B9A; }

.ev-title { font-size:16px; font-weight:700; color:var(--navy); margin-bottom:7px; }
.ev-desc  { font-size:13px; color:var(--muted); line-height:1.5; }

/* ─── CALENDAR ────────────────────────────────────────── */
.cal-box {
  background:var(--card-bg); border-radius:var(--r24); padding:36px;
  box-shadow:var(--sh); border:1px solid var(--border);
}
.cal-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; }
.cal-nav {
  width:38px; height:38px; border-radius:10px; border:1.5px solid var(--border);
  background:none; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center;
  transition:all .2s; color:var(--navy); font-family:'DM Sans',sans-serif;
}
.cal-nav:hover { background:var(--navy); color:#fff; border-color:var(--navy); }
.cal-month-label { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:var(--navy); }

.cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }
.cal-dow { text-align:center; font-size:10.5px; font-weight:700; color:var(--muted); padding:8px 0; letter-spacing:.5px; text-transform:uppercase; }
.cal-d {
  aspect-ratio:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
  border-radius:10px; cursor:default; transition:all .18s; font-size:13.5px; font-weight:500; color:var(--text);
  position:relative;
}
.cal-d:hover { background:var(--light); }
.cal-d.today { background:var(--navy); color:#fff; font-weight:700; }
.cal-d.holiday { color:var(--gold); font-weight:700; }
.cal-d.has-ev::after {
  content:''; position:absolute; bottom:4px; width:4px; height:4px;
  background:var(--sky); border-radius:50%;
}
.cal-d.other { color:rgba(0,0,0,.18); }

/* ─── PHOTO GALLERY ───────────────────────────────────── */
.gallery-grid {
  display:grid;
  grid-template-columns:repeat(12,1fr);
  grid-template-rows:200px 200px;
  gap:12px;
}
.gal-item {
  border-radius:var(--r16); overflow:hidden; position:relative;
  cursor:pointer; transition:all .32s; background:var(--navy2);
}
.gal-item:nth-child(1) { grid-column:span 7; grid-row:span 2; }
.gal-item:nth-child(2) { grid-column:span 5; }
.gal-item:nth-child(3) { grid-column:span 2; }
.gal-item:nth-child(4) { grid-column:span 3; }
.gal-item.hover { transform:scale(1.025); z-index:3; box-shadow:0 20px 56px rgba(0,0,0,.3); }
.gal-inner {
  width:100%; height:100%; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:8px;
  background:linear-gradient(135deg,#0F2040,#1565C0);
  transition:all .3s;
}
.gal-item:nth-child(2) .gal-inner { background:linear-gradient(135deg,#1B5E20,#388E3C); }
.gal-item:nth-child(3) .gal-inner { background:linear-gradient(135deg,#6A1B9A,#AB47BC); }
.gal-item:nth-child(4) .gal-inner { background:linear-gradient(135deg,#BF360C,#EF6C00); }
.gal-emoji { font-size:52px; filter:drop-shadow(0 4px 12px rgba(0,0,0,.4)); }
.gal-item:nth-child(1) .gal-emoji { font-size:72px; }
.gal-label { font-size:12px; color:rgba(255,255,255,.5); font-weight:500; }

.gal-overlay {
  position:absolute; inset:0;
  background:linear-gradient(to top,rgba(10,22,40,.88) 0%,transparent 60%);
  opacity:0; transition:opacity .3s;
  display:flex; align-items:flex-end; padding:20px;
}
.gal-item.hover .gal-overlay { opacity:1; }
.gal-overlay-txt { color:#fff; font-size:14px; font-weight:700; }

/* ─── NOTIFICATIONS ───────────────────────────────────── */
.notif-list { display:flex; flex-direction:column; gap:11px; }
.notif {
  display:flex; gap:14px; align-items:flex-start;
  background:var(--card-bg); border-radius:var(--r16); padding:18px 22px;
  box-shadow:var(--sh); border:1px solid var(--border);
  transition:all .25s; border-left:3px solid transparent;
  animation: cardPop .4s ease both;
}
.notif.unread { border-left-color:var(--blue); }
.notif.urgent { border-left-color:#EF5350; }
.notif:hover { transform:translateX(5px); }

.notif-ico {
  width:44px; height:44px; border-radius:12px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center; font-size:20px;
  background:rgba(21,101,192,.09);
}
.notif-ico.red    { background:rgba(239,83,80,.09); }
.notif-ico.green  { background:rgba(76,175,80,.09); }
.notif-ico.yellow { background:rgba(245,166,35,.09); }

.notif-body { flex:1; }
.notif-ttl  { font-size:14.5px; font-weight:700; color:var(--navy); margin-bottom:4px; }
.notif-msg  { font-size:13px; color:var(--muted); line-height:1.55; }
.notif-time { font-size:11px; color:rgba(96,112,144,.55); margin-top:5px; }

/* ─── TEACHERS ────────────────────────────────────────── */
.teachers-scroll { display:flex; gap:18px; overflow-x:auto; padding-bottom:6px; }
.teachers-scroll::-webkit-scrollbar { height:3px; }
.teachers-scroll::-webkit-scrollbar-thumb { background:rgba(10,22,40,.15); border-radius:2px; }
.teacher-card {
  background:var(--card-bg); border-radius:var(--r16); padding:28px 22px; text-align:center;
  min-width:192px; flex-shrink:0; box-shadow:var(--sh); border:1px solid var(--border); transition:all .3s;
  animation: cardPop .5s ease both;
}
.teacher-card:hover { transform:translateY(-7px); box-shadow:var(--sh2); }
.t-ava {
  width:76px; height:76px; border-radius:50%; margin:0 auto 14px;
  display:flex; align-items:center; justify-content:center; font-size:30px;
  background:linear-gradient(135deg, var(--navy2), var(--blue));
  border:3px solid rgba(21,101,192,.18);
}
.t-name { font-size:15px; font-weight:700; color:var(--navy); margin-bottom:3px; }
.t-sub  { font-size:12px; color:var(--muted); margin-bottom:10px; line-height:1.4; }
.t-qual { display:inline-block; padding:3px 10px; border-radius:100px; font-size:11px; font-weight:600; background:rgba(21,101,192,.09); color:var(--blue2); }

/* ─── OTHER SCHOOLS ───────────────────────────────────── */
.school-links-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:18px; }
.school-link {
  background:var(--card-bg); border-radius:var(--r16); padding:24px;
  box-shadow:var(--sh); border:1px solid var(--border); text-decoration:none;
  transition:all .3s; display:block;
  animation: cardPop .5s ease both;
}
.school-link:hover { transform:translateY(-5px); box-shadow:var(--sh2); }
.sl-logo {
  width:50px; height:50px; border-radius:12px; margin-bottom:14px;
  display:flex; align-items:center; justify-content:center; font-size:24px;
  background:linear-gradient(135deg,var(--blue),var(--sky));
}
.sl-name { font-size:15.5px; font-weight:700; color:var(--navy); margin-bottom:4px; }
.sl-desc { font-size:12.5px; color:var(--muted); line-height:1.4; }
.sl-link { margin-top:14px; font-size:12.5px; color:var(--blue2); font-weight:600; }

/* ─── CONTACT STRIP ───────────────────────────────────── */
.contact-strip {
  display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:88px;
}
.contact-card {
  background:var(--navy); border-radius:var(--r16); padding:28px 24px; text-align:center;
  color:#fff; transition:all .3s;
}
.contact-card:hover { transform:translateY(-4px); }
.cc-icon { font-size:36px; margin-bottom:12px; }
.cc-title { font-size:13px; text-transform:uppercase; letter-spacing:1.5px; color:rgba(255,255,255,.4); margin-bottom:6px; }
.cc-val { font-size:15px; font-weight:600; color:#fff; }

/* ─── FOOTER ──────────────────────────────────────────── */
.site-footer {
  background:var(--navy); color:rgba(255,255,255,.55);
  padding:52px 52px 32px; border-top:1px solid rgba(255,255,255,.07);
}
.ft-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:52px; margin-bottom:44px; }
.ft-brand-name { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:#fff; margin-bottom:12px; }
.ft-brand-desc { font-size:13.5px; line-height:1.7; }
.ft-col-title { font-size:10px; text-transform:uppercase; letter-spacing:2px; color:rgba(255,255,255,.3); margin-bottom:16px; }
.ft-link {
  display:block; color:rgba(255,255,255,.5); text-decoration:none;
  font-size:13.5px; margin-bottom:10px; transition:color .2s; cursor:pointer;
  background:none; border:none; text-align:left; font-family:'DM Sans',sans-serif; padding:0;
}
.ft-link:hover { color:#fff; }
.ft-bottom { border-top:1px solid rgba(255,255,255,.08); padding-top:22px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
.ft-copy { font-size:12.5px; }
.ft-staff { font-size:11px; color:rgba(255,255,255,.2); cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; color:rgba(245,166,35,.45); transition:color .2s; }
.ft-staff:hover { color:rgba(245,166,35,.8); }

/* ─── HAMBURGER ───────────────────────────────────────── */
.ham-btn { display:none; flex-direction:column; gap:5px; cursor:pointer; background:none; border:none; padding:8px; }
.ham-bar { width:20px; height:2px; background:rgba(255,255,255,.75); border-radius:1px; transition:all .3s; }

/* ─── OVERLAY ─────────────────────────────────────────── */
.sb-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:998; }
.sb-overlay.open { display:block; }

/* ─── RESPONSIVE ──────────────────────────────────────── */
@media(max-width:960px){
  .sidebar{position:fixed;left:-272px;top:100px;z-index:999;transition:left .3s;height:calc(100vh - 100px);}
  .sidebar.open{left:0;}
  .site-main{padding:36px 24px 80px;}
  .ham-btn{display:flex;}
  .nav-center{display:none;}
  .contact-strip{grid-template-columns:1fr;}
  .ft-grid{grid-template-columns:1fr;gap:32px;}
  .gallery-grid{grid-template-columns:1fr 1fr;grid-template-rows:160px 160px;}
  .gal-item:nth-child(1){grid-column:span 2;grid-row:span 1;}
}
@media(max-width:600px){
  .topnav{padding:0 18px;}
  .ticker-wrap{display:none;}
  .hero{padding-top:80px;}
  .hero-stats{flex-direction:column;gap:0;max-width:280px;}
  .hero-stat{border-right:none;border-bottom:1px solid rgba(255,255,255,.08);padding:14px 0;}
  .hero-stat:last-child{border-bottom:none;}
  .site-main{padding:24px 16px 60px;}
  .events-grid{grid-template-columns:1fr;}
  .teachers-scroll{gap:12px;}
  .school-links-grid{grid-template-columns:1fr;}
  .site-footer{padding:36px 20px;}
}
`;

/* ── DATA ─────────────────────────────────────────────── */
const TICKER_ITEMS = [
  '📢 Annual Exams begin 10th April 2026',
  '🏆 Sports Day results — Check Gallery',
  '📚 New worksheets uploaded for Class 3-5',
  '⚠️  School closed 18 March — Staff Meeting',
  '🎉 Cultural Fest registrations open',
  '🌟 Congratulations to our Class 5 toppers!',
];

const EVENTS = [
  { day:26, month:'Jan', type:'holiday', title:'Republic Day',        desc:'National holiday — school remains closed.' },
  { day:14, month:'Feb', type:'cultural',title:'Annual Cultural Fest', desc:'Dance, drama, music & art competitions for all classes.' },
  { day:22, month:'Mar', type:'sports',  title:'Inter-School Cricket', desc:'District level cricket tournament — go team!' },
  { day:10, month:'Apr', type:'exam',    title:'Annual Exams Begin',   desc:'Classes 1–5 annual examination schedule starts.' },
  { day:5,  month:'Jun', type:'event',   title:'New Session Begins',   desc:'Academic year 2026–27 commences with orientation.' },
  { day:15, month:'Aug', type:'holiday', title:'Independence Day',     desc:'Flag hoisting ceremony at 8:00 AM sharp.' },
];

const NOTIFS = [
  { ico:'📢', type:'red',    title:'Exam Date Sheet Released',  msg:'Annual examination schedule for Classes 1–5 is available. Check the school calendar for all dates and timings.',             time:'2 hours ago',  unread:true,  urgent:true  },
  { ico:'🏆', type:'green',  title:'Sports Day Results',        msg:'Congratulations to all winners! Full results and photos are now available in the gallery section.',                          time:'1 day ago',    unread:true               },
  { ico:'📚', type:'',       title:'New Study Material Uploaded',msg:'Mathematics and Science worksheets for Class 3–5 have been uploaded by respective teachers.',                              time:'2 days ago',   unread:false              },
  { ico:'⚠️', type:'yellow', title:'School Closed – March 18',  msg:'School will remain closed on 18th March 2026 due to Annual Staff Development Day.',                                        time:'3 days ago',   unread:false, urgent:true  },
  { ico:'🎉', type:'green',  title:'Cultural Fest Registration', msg:'Registration open for Annual Cultural Fest. Interested students should contact their class teacher before 5th March.',    time:'5 days ago',   unread:false              },
];

const TEACHERS = [
  { e:'👩‍🏫', name:'Mrs. Priya Sharma',  sub:'Class Teacher – V',  qual:'M.Ed, B.Sc' },
  { e:'👨‍🏫', name:'Mr. Rahul Verma',    sub:'Mathematics',         qual:'M.Sc Math'   },
  { e:'👩‍🏫', name:'Mrs. Sunita Yadav',  sub:'Hindi & EVS',         qual:'M.A. Hindi'  },
  { e:'👨‍🏫', name:'Mr. Anil Gupta',     sub:'Science',             qual:'M.Sc Sci.'   },
  { e:'👩‍🏫', name:'Ms. Kavya Singh',    sub:'English',             qual:'M.A. Eng.'   },
  { e:'👨‍🏫', name:'Mr. Deepak Tiwari',  sub:'Physical Education',  qual:'B.P.Ed'      },
];

const SCHOOLS = [
  { e:'🏫', name:"St. Mary's High School",   desc:'Central Board, Lucknow'   },
  { e:'🎓', name:'City Montessori School',    desc:'ISO Certified, 14 Campuses' },
  { e:'📐', name:'Delhi Public School',       desc:'CBSE, Kanpur Road'        },
  { e:'🌟', name:'Kendriya Vidyalaya',        desc:'Govt. School, Gomti Nagar'  },
];

const GALLERY = [
  { e:'🏆', label:'Sports Day 2025'    },
  { e:'🎭', label:'Cultural Fest'      },
  { e:'🔬', label:'Science Exhibition' },
  { e:'🎨', label:'Art Competition'    },
];

/* ── CALENDAR HELPERS ─────────────────────────────────── */
const MOS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const EV_DAYS  = new Set([26,14,22,10,15,5]);
const HOL_DAYS = new Set([26,15]);

function calDays(y, m) {
  const fd=new Date(y,m,1).getDay(), tot=new Date(y,m+1,0).getDate(), prev=new Date(y,m,0).getDate();
  const out=[];
  for(let i=fd-1;i>=0;i--) out.push({d:prev-i,curr:false});
  for(let d=1;d<=tot;d++) out.push({d,curr:true});
  while(out.length%7!==0) out.push({d:out.length-fd-tot+1,curr:false});
  return out;
}

/* ─── COMPONENT ───────────────────────────────────────── */
export default function HomePage() {
  const nav = useNavigate();
  const [active, setActive]   = useState('events');
  const [sbOpen, setSbOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [calState, setCalState] = useState({ y: new Date().getFullYear(), m: new Date().getMonth() });
  const [hovGal, setHovGal]   = useState(-1);
  const today = new Date();

  // ── Live data from backend ──────────────────────────────────────
  const [liveTeachers, setLiveTeachers] = useState([]);
  const [liveEvents,   setLiveEvents]   = useState([]);
  const [liveGallery,  setLiveGallery]  = useState([]);
  const [liveNotices,  setLiveNotices]  = useState([]);
  const [dataLoaded,   setDataLoaded]   = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [teachRes, evRes, gallRes, noticeRes] = await Promise.allSettled([
          import('../../api/services').then(m => m.publicApi.getTeachers()),
          import('../../api/services').then(m => m.publicApi.getCalendarEvents(
            new Date().getMonth() + 1, new Date().getFullYear())),
          import('../../api/services').then(m => m.publicApi.getContent('GALLERY_PHOTO')),
          import('../../api/services').then(m => m.publicApi.getContent('ARTICLE')),
        ]);
        if (teachRes.status === 'fulfilled') setLiveTeachers(teachRes.value.data || []);
        if (evRes.status === 'fulfilled') setLiveEvents(evRes.value.data || []);
        if (gallRes.status === 'fulfilled') setLiveGallery(gallRes.value.data || []);
        if (noticeRes.status === 'fulfilled') setLiveNotices(noticeRes.value.data || []);
      } catch {}
      setDataLoaded(true);
    };
    fetchAll();

    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Merge live + static fallback
  const displayEvents   = liveEvents.length > 0 ? liveEvents : EVENTS;
  const displayTeachers = liveTeachers.length > 0 ? liveTeachers : TEACHERS;
  const displayGallery  = liveGallery.length > 0 ? liveGallery : GALLERY;
  const displayNotices  = liveNotices.length > 0 ? liveNotices : NOTIFS;

  const goTo = (id) => {
    setActive(id);
    setSbOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 40);
  };

  const days = calDays(calState.y, calState.m);

  const prevMo = () => setCalState(s => {
    const d=new Date(s.y,s.m-1); return {y:d.getFullYear(), m:d.getMonth()};
  });
  const nextMo = () => setCalState(s => {
    const d=new Date(s.y,s.m+1); return {y:d.getFullYear(), m:d.getMonth()};
  });

  return (
    <>
      <style>{STYLES}</style>

      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker-label">📌 News</div>
        <div className="ticker-track">
          <div className="ticker-inner">
            {[...TICKER_ITEMS,...TICKER_ITEMS].map((t,i)=>(
              <span key={i} className="ticker-item">
                {t} <span className="ticker-dot">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── TOP NAV ── */}
      <nav className={`topnav${scrolled?' scrolled':''}`}>
        <div className="nav-logo-wrap" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>
          <div className="nav-logo-emblem">🏫</div>
          <div className="nav-logo-text">
            <div className="nav-logo-name">Vidya Mandir</div>
            <div className="nav-logo-sub">School Portal</div>
          </div>
        </div>

        <div className="nav-center">
          {[['events','📅 Events'],['calendar','🗓 Calendar'],['photos','📸 Gallery'],
            ['notifications','🔔 Notice'],['teachers','👨‍🏫 Faculty'],['schools','🔗 Links']].map(([id,lbl])=>(
            <button key={id} className={`nav-btn${active===id?' active':''}`} onClick={()=>goTo(id)}>{lbl}</button>
          ))}
        </div>

        <div className="nav-right">
          <div className="nav-notif-btn" onClick={()=>goTo('notifications')}>
            🔔 <div className="notif-dot"/>
          </div>
          <button className="ham-btn" onClick={()=>setSbOpen(v=>!v)}>
            <div className="ham-bar"/><div className="ham-bar"/><div className="ham-bar"/>
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-bg-grid"/>
          <div className="hero-bg-radial"/>
        </div>
        <div className="shape shape-1"/>
        <div className="shape shape-2"/>
        <div className="shape shape-3"/>
        <div className="orbit-center">
          <div className="orbit-dot"/>
          <div className="orbit-dot"/>
          <div className="orbit-dot"/>
        </div>

        <div className="hero-content">
          <div className="hero-eyebrow">✦ Academic Year 2025 – 2026 ✦</div>
          <h1 className="hero-title">
            Swagat Hai Aapka
            <span className="hero-title-accent">Vidya Mandir Mein</span>
          </h1>
          <p className="hero-sub">
            Play Group se Class 5 tak — ek safar, ek parivar.<br/>
            <em>Excellence in Education · Values for Life</em>
          </p>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-n">500+</div><div className="hero-stat-l">Students</div></div>
            <div className="hero-stat"><div className="hero-stat-n">32</div><div className="hero-stat-l">Teachers</div></div>
            <div className="hero-stat"><div className="hero-stat-n">15+</div><div className="hero-stat-l">Years</div></div>
            <div className="hero-stat"><div className="hero-stat-n">98%</div><div className="hero-stat-l">Pass Rate</div></div>
          </div>
          <div className="hero-btns">
            <button className="btn-gold" onClick={()=>goTo('events')}>🎉 Upcoming Events</button>
            <button className="btn-outline" onClick={()=>goTo('teachers')}>👨‍🏫 Meet Our Faculty</button>
          </div>
        </div>
        <div className="scroll-cue"><div className="scroll-cue-line"/>Scroll</div>
      </section>

      {/* ── BODY ── */}
      <div className="site-body">

        {/* SIDEBAR */}
        <div className={`sb-overlay${sbOpen?' open':''}`} onClick={()=>setSbOpen(false)}/>
        <aside className={`sidebar${sbOpen?' open':''}`}>
          <div className="sb-header">
            <div className="sb-label">Navigation</div>
            <div className="sb-school">Vidya Mandir</div>
            <div className="sb-tagline">School Management Portal</div>
          </div>

          <div className="sb-section">
            <div className="sb-section-title">School Info</div>
            {[
              ['events',  '📅','Upcoming Events',  <span className="sb-badge">6</span>],
              ['calendar','🗓','School Calendar',   null],
              ['photos',  '📸','Photo Gallery',     null],
              ['notifications','🔔','Notices & Alerts', <span className="sb-badge red">2</span>],
            ].map(([id,ico,lbl,badge])=>(
              <button key={id} className={`sb-item${active===id?' active':''}`} onClick={()=>goTo(id)}
                style={{animationDelay:`${['events','calendar','photos','notifications'].indexOf(id)*0.06}s`}}>
                <span className="sb-icon">{ico}</span>{lbl}{badge}
              </button>
            ))}
          </div>

          <div className="sb-hr"/>

          <div className="sb-section">
            <div className="sb-section-title">People</div>
            <button className={`sb-item${active==='teachers'?' active':''}`} onClick={()=>goTo('teachers')}>
              <span className="sb-icon">👨‍🏫</span> Our Faculty
            </button>
          </div>

          <div className="sb-hr"/>

          <div className="sb-section">
            <div className="sb-section-title">Partner Schools</div>
            <button className={`sb-item${active==='schools'?' active':''}`} onClick={()=>goTo('schools')}>
              <span className="sb-icon">🔗</span> School Links
            </button>
            <div className="sb-sub">
              {SCHOOLS.map((s,i)=>(
                <button key={i} className="sb-sub-item" onClick={()=>goTo('schools')}>{s.e} {s.name}</button>
              ))}
            </div>
          </div>

          <div className="sb-hr"/>

          <div className="sb-section">
            <div className="sb-section-title">Portal Access</div>
            <button className="sb-item" onClick={()=>nav('/portal-login')}>
              <span className="sb-icon">🔐</span> Staff Portal Login
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="site-main">

          {/* EVENTS */}
          <section id="events" className="sec">
            <div className="sec-head">
              <div className="sec-eye">School Life</div>
              <h2 className="sec-title">Upcoming Events</h2>
              <p className="sec-desc">Stay informed about all school activities, exams, holidays and competitions throughout the year.</p>
            </div>
            <div className="events-grid">
              {displayEvents.map((ev,i)=>{
                // Handle both static format and live API format
                const evDate = ev.eventDate ? new Date(ev.eventDate) : null;
                const day   = ev.day || (evDate ? evDate.getDate() : '—');
                const month = ev.month || (evDate ? evDate.toLocaleString('default',{month:'short'}) : '');
                const type  = ev.type || ev.eventType?.toLowerCase() || 'event';
                const desc  = ev.desc || ev.description || '';
                return (
                  <div key={i} className={`ev-card ${type}`} style={{animationDelay:`${i*.07}s`}}>
                    <div className="ev-date"><div className="ev-day">{day}</div><div className="ev-month">{month}</div></div>
                    <div className={`ev-tag ${type}`}>{type.charAt(0).toUpperCase()+type.slice(1)}</div>
                    <div className="ev-title">{ev.title}</div>
                    <div className="ev-desc">{desc}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CALENDAR */}
          <section id="calendar" className="sec">
            <div className="sec-head">
              <div className="sec-eye">Schedule</div>
              <h2 className="sec-title">School Calendar</h2>
              <p className="sec-desc">Monthly overview of all events, holidays, examinations and special occasions.</p>
            </div>
            <div className="cal-box">
              <div className="cal-top">
                <button className="cal-nav" onClick={prevMo}>‹</button>
                <span className="cal-month-label">{MOS[calState.m]} {calState.y}</span>
                <button className="cal-nav" onClick={nextMo}>›</button>
              </div>
              <div className="cal-grid">
                {DOW.map(d=><div key={d} className="cal-dow">{d}</div>)}
                {days.map((cell,i)=>{
                  const isTd  = cell.curr && calState.y===today.getFullYear() && calState.m===today.getMonth() && cell.d===today.getDate();
                  const isHol = cell.curr && HOL_DAYS.has(cell.d);
                  const isEv  = cell.curr && EV_DAYS.has(cell.d);
                  return (
                    <div key={i} className={`cal-d${isTd?' today':''}${isHol&&!isTd?' holiday':''}${isEv?' has-ev':''}${!cell.curr?' other':''}`}>
                      {cell.d}
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
              <p className="sec-desc">Cherished moments from school events, competitions, and everyday school life.</p>
            </div>
            <div className="gallery-grid">
              {displayGallery.map((g,i)=>{
                const label = g.label || g.title || 'Photo';
                const emoji = g.e || '📷';
                return (
                  <div key={i} className={`gal-item${hovGal===i?' hover':''}`}
                    onMouseEnter={()=>setHovGal(i)} onMouseLeave={()=>setHovGal(-1)}>
                    <div className="gal-inner" style={{ position:'relative', overflow:'hidden', height:'100%' }}>
                      {g.imageUrl ? (
                        <img src={g.imageUrl} alt={label}
                          style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }}/>
                      ) : (
                        <><span className="gal-emoji">{emoji}</span><span className="gal-label">{label}</span></>
                      )}
                    </div>
                    <div className="gal-overlay"><span className="gal-overlay-txt">📷 {label}</span></div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section id="notifications" className="sec">
            <div className="sec-head">
              <div className="sec-eye">Announcements</div>
              <h2 className="sec-title">Notices &amp; Alerts</h2>
              <p className="sec-desc">Important announcements, circulars, and notices from school management.</p>
            </div>
            <div className="notif-list">
              {displayNotices.map((n,i)=>{
                // Handle both static and live (articles from content-service)
                const title = n.title || 'Notice';
                const msg   = n.msg || n.description || '';
                const ico   = n.ico || '📢';
                const time  = n.time || (n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN') : '');
                const type  = n.type || '';
                return (
                  <div key={i} className={`notif${n.unread?' unread':''}${n.urgent?' urgent':''}`}
                    style={{animationDelay:`${i*.06}s`}}>
                    <div className={`notif-ico ${type}`}>{ico}</div>
                    <div className="notif-body">
                      <div className="notif-ttl">{title}</div>
                      <div className="notif-msg">{msg}</div>
                      <div className="notif-time">{time}{n.uploaderName ? ` • By: ${n.uploaderName}` : ''}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* TEACHERS */}
          <section id="teachers" className="sec">
            <div className="sec-head">
              <div className="sec-eye">Faculty</div>
              <h2 className="sec-title">Our Teachers</h2>
              <p className="sec-desc">Dedicated educators shaping the future of every child with passion and expertise.</p>
            </div>
            <div className="teachers-scroll">
              {displayTeachers.map((t,i)=>{
                // Handle both static and live teacher data
                const name = t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim();
                const sub  = t.sub  || t.designation || 'Teacher';
                const qual = t.qual || t.qualification || '';
                const ava  = t.e    || t.profilePhotoUrl || name?.[0] || '👤';
                return (
                  <div key={i} className="teacher-card" style={{animationDelay:`${i*.07}s`}}>
                    {t.profilePhotoUrl
                      ? <img src={t.profilePhotoUrl} alt={name}
                          style={{ width:60, height:60, borderRadius:'50%', objectFit:'cover', marginBottom:8, border:'2px solid #E8F5E9' }}/>
                      : <div className="t-ava">{ava}</div>
                    }
                    <div className="t-name">{name}</div>
                    <div className="t-sub">{sub}</div>
                    {qual && <span className="t-qual">{qual}</span>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* SCHOOLS */}
          <section id="schools" className="sec">
            <div className="sec-head">
              <div className="sec-eye">Network</div>
              <h2 className="sec-title">Partner Schools</h2>
              <p className="sec-desc">Affiliated institutions and partner schools in our education network.</p>
            </div>
            <div className="school-links-grid">
              {SCHOOLS.map((s,i)=>(
                <a key={i} className="school-link" href="#" style={{animationDelay:`${i*.07}s`}}>
                  <div className="sl-logo">{s.e}</div>
                  <div className="sl-name">{s.name}</div>
                  <div className="sl-desc">{s.desc}</div>
                  <div className="sl-link">Visit website →</div>
                </a>
              ))}
            </div>
          </section>

          {/* CONTACT */}
          <div className="contact-strip">
            <div className="contact-card"><div className="cc-icon">📍</div><div className="cc-title">Address</div><div className="cc-val">Gomti Nagar, Lucknow, UP</div></div>
            <div className="contact-card"><div className="cc-icon">📞</div><div className="cc-title">Phone</div><div className="cc-val">+91-522-0000000</div></div>
            <div className="contact-card"><div className="cc-icon">✉️</div><div className="cc-title">Email</div><div className="cc-val">info@vidyamandir.edu.in</div></div>
          </div>

        </main>
      </div>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="ft-grid">
          <div>
            <div className="ft-brand-name">🏫 Vidya Mandir</div>
            <div className="ft-brand-desc">A premier institution providing quality education from Play Group to Class 5. Nurturing young minds with academic excellence and strong values since 2009.</div>
          </div>
          <div>
            <div className="ft-col-title">Quick Links</div>
            {['Events','Calendar','Gallery','Notices','Teachers','Schools'].map(l=>(
              <button key={l} className="ft-link" onClick={()=>goTo(l.toLowerCase().replace(' ',''))}>{l}</button>
            ))}
          </div>
          <div>
            <div className="ft-col-title">Contact Us</div>
            <div className="ft-link">📍 Gomti Nagar, Lucknow, UP</div>
            <div className="ft-link">📞 +91-522-0000000</div>
            <div className="ft-link">✉️ info@vidyamandir.edu.in</div>
          </div>
        </div>
        <div className="ft-bottom">
          <div className="ft-copy">© 2026 Vidya Mandir School. All rights reserved.</div>
          <button className="ft-staff" onClick={()=>nav('/portal-login')}>🔐 Staff Portal</button>
        </div>
      </footer>
    </>
  );
}

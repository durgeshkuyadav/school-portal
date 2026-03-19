import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────────
   VIDYA MANDIR  ·  Redesign v3
   - Compact sidebar with grouped nav + contact footer
   - Hero: word-by-word CSS entrance + parallax on the whole block
   - Consistent section alignment throughout
   ───────────────────────────────────────────────────────────────── */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root{
  --slate:#0F172A;  --slate2:#1E293B; --slate3:#334155;
  --em:#10B981;     --em2:#059669;    --em3:#34D399;    --em-pale:#ECFDF5;
  --cream:#FAFAF8;  --text:#111827;   --muted:#6B7280;  --light:#9CA3AF;
  --border:#E5E7EB; --card:#FFFFFF;
  --sh: 0 1px 3px rgba(0,0,0,.06), 0 4px 14px rgba(0,0,0,.05);
  --sh2:0 4px 24px rgba(0,0,0,.11), 0 12px 40px rgba(0,0,0,.07);
  --r:12px; --r2:16px; --r3:24px;
  --sbw:242px;
  --navh:90px;
}

html{scroll-behavior:smooth;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--cream);color:var(--text);overflow-x:hidden;-webkit-font-smoothing:antialiased;}

/* ── keyframes ─────────────────────────── */
@keyframes ticker {from{transform:translateX(0);}to{transform:translateX(-50%);}}
@keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
@keyframes pulse  {0%,100%{opacity:.4;}50%{opacity:1;}}
@keyframes wordIn {
  from{opacity:0;transform:translateY(48px) skewY(2.5deg);}
  to  {opacity:1;transform:translateY(0)    skewY(0);}
}
@keyframes fadeUp {from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
@keyframes scaleIn{from{opacity:0;transform:scale(.94);}to{opacity:1;transform:scale(1);}}

/* ── TICKER ─────────────────────────────── */
.ticker{position:fixed;top:0;left:0;right:0;z-index:1001;height:30px;
  display:flex;align-items:center;overflow:hidden;
  background:var(--slate);border-bottom:1px solid rgba(16,185,129,.15);}
.t-tag{background:var(--em);color:var(--slate);height:100%;
  display:flex;align-items:center;padding:0 15px;
  font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;flex-shrink:0;}
.t-track{overflow:hidden;flex:1;}
.t-inner{display:inline-flex;white-space:nowrap;animation:ticker 28s linear infinite;}
.t-item{padding:0 30px;font-size:11.5px;font-weight:500;color:rgba(255,255,255,.6);}
.t-sep{color:var(--em);opacity:.45;}

/* ── TOPNAV ──────────────────────────────── */
.nav{position:fixed;top:30px;left:0;right:0;z-index:1000;
  height:60px;display:flex;align-items:center;justify-content:space-between;
  padding:0 32px;
  background:rgba(250,250,248,.93);
  backdrop-filter:blur(18px) saturate(180%);
  border-bottom:1px solid var(--border);
  transition:box-shadow .3s;}
.nav.up{box-shadow:0 4px 20px rgba(0,0,0,.07);}
.nav-brand{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;}
.nav-crest{width:37px;height:37px;border-radius:9px;
  background:linear-gradient(135deg,var(--slate),var(--slate2));
  display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;
  box-shadow:0 2px 8px rgba(15,23,42,.22);}
.nav-nm{font-family:'Cormorant Garant',serif;font-size:17px;font-weight:700;color:var(--slate);line-height:1.2;}
.nav-tg{font-size:9px;color:var(--light);letter-spacing:1.5px;text-transform:uppercase;}
.nav-r{display:flex;align-items:center;gap:8px;}
.notif{position:relative;width:35px;height:35px;border-radius:9px;
  border:1.5px solid var(--border);background:var(--card);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;font-size:15px;transition:all .2s;}
.notif:hover{border-color:var(--em);}
.n-dot{position:absolute;top:6px;right:6px;width:6px;height:6px;
  border-radius:50%;background:var(--em);border:1.5px solid var(--cream);
  animation:pulse 2s infinite;}
.ham{display:none;flex-direction:column;gap:5px;cursor:pointer;
  background:none;border:none;padding:6px;}
.hb{width:20px;height:2px;background:var(--slate3);border-radius:2px;transition:all .25s;}
.ham.x .hb:nth-child(1){transform:rotate(45deg) translate(5px,5px);}
.ham.x .hb:nth-child(2){opacity:0;}
.ham.x .hb:nth-child(3){transform:rotate(-45deg) translate(5px,-5px);}

/* ── HERO ────────────────────────────────── */
.hero{min-height:100vh;position:relative;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
  padding-top:var(--navh);}
.hero-bg{position:absolute;inset:0;z-index:0;
  background:linear-gradient(155deg,#0F172A 0%,#13261a 55%,#0D2416 100%);}
.h-grid{position:absolute;inset:0;z-index:1;
  background-image:
    linear-gradient(rgba(16,185,129,.055) 1px,transparent 1px),
    linear-gradient(90deg,rgba(16,185,129,.055) 1px,transparent 1px);
  background-size:48px 48px;}
.h-noise{position:absolute;inset:0;z-index:1;opacity:.028;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:180px;}
.orb1,.orb2{position:absolute;border-radius:50%;pointer-events:none;z-index:2;}
.orb1{width:600px;height:600px;top:-140px;right:-100px;background:radial-gradient(circle,rgba(16,185,129,.11),transparent 65%);}
.orb2{width:360px;height:360px;bottom:-50px;left:-50px;background:radial-gradient(circle,rgba(52,211,153,.08),transparent 65%);}

/* The whole inner block slides up on scroll via JS */
.hero-inner{position:relative;z-index:10;
  max-width:800px;width:100%;margin:0 auto;
  padding:0 28px 80px;text-align:center;
  will-change:transform,opacity;}

.hero-eye{display:inline-flex;align-items:center;gap:8px;
  padding:5px 15px;border-radius:100px;margin-bottom:26px;
  background:rgba(16,185,129,.11);border:1px solid rgba(16,185,129,.26);
  animation:scaleIn .65s ease .08s both;}
.hero-eye span{font-size:10px;font-weight:700;color:var(--em3);letter-spacing:1.5px;text-transform:uppercase;}
.edot{width:5px;height:5px;border-radius:50%;background:var(--em);animation:pulse 2s infinite;}

/* word-by-word rows */
.wrow{overflow:hidden;line-height:1;display:block;margin-bottom:5px;}
.hw{display:inline-block;animation:wordIn .85s cubic-bezier(.16,1,.3,1) both;}

.t-main{font-family:'Cormorant Garant',serif;
  font-size:clamp(54px,8.2vw,104px);font-weight:700;
  color:#fff;letter-spacing:-2px;}
.t-italic{font-family:'Cormorant Garant',serif;
  font-size:clamp(38px,5.8vw,72px);
  font-style:italic;font-weight:400;
  background:linear-gradient(100deg,var(--em3),var(--em),#6EE7B7);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  background-size:200%;letter-spacing:-1px;
  animation:wordIn .85s cubic-bezier(.16,1,.3,1) both,
            shimmer 5s linear 1s infinite;}

.hero-sub{font-size:clamp(12.5px,1.35vw,14.5px);color:rgba(255,255,255,.46);
  line-height:1.85;max-width:420px;margin:18px auto 34px;
  animation:fadeUp .85s ease .78s both;}

.hero-band{width:100%;max-width:460px;margin:0 auto 34px;
  display:flex;border-radius:var(--r2);
  border:1px solid rgba(255,255,255,.08);
  background:rgba(255,255,255,.05);backdrop-filter:blur(10px);
  overflow:hidden;animation:fadeUp .85s ease .92s both;}
.hs{flex:1;padding:17px 0;text-align:center;border-right:1px solid rgba(255,255,255,.07);}
.hs:last-child{border-right:none;}
.hs-n{font-family:'Cormorant Garant',serif;font-size:30px;font-weight:700;color:var(--em3);line-height:1;}
.hs-l{font-size:9px;color:rgba(255,255,255,.34);letter-spacing:1.2px;text-transform:uppercase;margin-top:4px;}

.hero-ctas{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;
  animation:fadeUp .85s ease 1.06s both;}
.btn-p{background:var(--em);color:var(--slate);border:none;border-radius:var(--r);
  font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;font-weight:700;
  padding:12px 24px;cursor:pointer;
  box-shadow:0 4px 18px rgba(16,185,129,.36);transition:all .22s;
  display:inline-flex;align-items:center;gap:7px;}
.btn-p:hover{background:var(--em3);transform:translateY(-2px);box-shadow:0 8px 28px rgba(16,185,129,.48);}
.btn-g{background:rgba(255,255,255,.07);color:rgba(255,255,255,.8);
  border:1.5px solid rgba(255,255,255,.17);border-radius:var(--r);
  font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;font-weight:600;
  padding:12px 22px;cursor:pointer;transition:all .22s;backdrop-filter:blur(6px);
  display:inline-flex;align-items:center;gap:7px;}
.btn-g:hover{background:rgba(255,255,255,.12);transform:translateY(-2px);}

.scroll-cue{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
  display:flex;flex-direction:column;align-items:center;gap:5px;z-index:10;
  color:rgba(255,255,255,.2);font-size:8.5px;letter-spacing:3px;text-transform:uppercase;
  animation:pulse 3s infinite;}
.sc-line{width:1px;height:34px;background:linear-gradient(to bottom,transparent,rgba(16,185,129,.5));}

/* ── PAGE LAYOUT ─────────────────────────── */
.page{display:flex;align-items:flex-start;}

/* ── SIDEBAR ─────────────────────────────── */
.sb{width:var(--sbw);flex-shrink:0;
  position:sticky;top:90px;max-height:calc(100vh - 90px);
  overflow-y:auto;overflow-x:hidden;
  background:var(--card);border-right:1px solid var(--border);
  scrollbar-width:none;
  display:flex;flex-direction:column;transition:left .28s;}
.sb::-webkit-scrollbar{display:none;}

/* identity */
.sb-top{padding:16px 15px 14px;background:var(--slate);border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;}
.sb-logo-row{display:flex;align-items:center;gap:9px;margin-bottom:9px;}
.sb-logo{width:34px;height:34px;border-radius:8px;
  background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.28);
  display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.sb-nm{font-family:'Cormorant Garant',serif;font-size:15.5px;font-weight:700;color:#fff;line-height:1.2;}
.sb-sub{font-size:10px;color:rgba(255,255,255,.36);margin-top:1px;}
.sb-badge{display:inline-flex;align-items:center;gap:5px;
  padding:3px 9px;border-radius:100px;
  background:rgba(16,185,129,.14);border:1px solid rgba(16,185,129,.24);
  font-size:9.5px;font-weight:700;color:var(--em3);letter-spacing:.6px;}
.sb-bdot{width:5px;height:5px;border-radius:50%;background:var(--em);animation:pulse 2s infinite;}

/* nav items */
.sb-nav{padding:10px 9px;flex:1;}
.sb-grp{font-size:8.5px;text-transform:uppercase;letter-spacing:2px;
  color:var(--light);padding:8px 8px 4px;display:block;}
.sb-item{display:flex;align-items:center;gap:9px;
  padding:8px 9px;border-radius:9px;cursor:pointer;
  background:none;border:none;width:100%;text-align:left;
  font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:500;
  color:var(--muted);transition:all .14s;margin-bottom:1px;position:relative;}
.sb-item::before{content:'';position:absolute;left:0;top:22%;bottom:22%;
  width:3px;border-radius:0 2px 2px 0;background:var(--em);
  opacity:0;transition:opacity .14s;}
.sb-item:hover{background:var(--em-pale);color:var(--em2);}
.sb-item:hover::before{opacity:.45;}
.sb-item.on{background:var(--em-pale);color:var(--em2);font-weight:700;}
.sb-item.on::before{opacity:1;}
.sb-ico{font-size:15px;width:20px;text-align:center;flex-shrink:0;}
.sb-txt{flex:1;}
.sb-pill{padding:1px 7px;border-radius:100px;
  font-size:9px;font-weight:700;background:var(--em);color:#fff;}
.sb-pill.r{background:#EF4444;}

/* contact footer */
.sb-foot{padding:11px 14px;border-top:1px solid var(--border);flex-shrink:0;}
.sb-ci{display:flex;align-items:flex-start;gap:7px;
  font-size:11px;color:var(--muted);padding:3.5px 0;line-height:1.4;}
.sb-cico{font-size:12px;flex-shrink:0;margin-top:1px;}

/* ── MAIN ────────────────────────────────── */
.main{flex:1;min-width:0;padding:52px 48px 96px;}

/* ── SECTIONS ────────────────────────────── */
.sec{margin-bottom:68px;scroll-margin-top:104px;}
.sec-hd{margin-bottom:26px;}
.sec-eye{display:flex;align-items:center;gap:7px;
  font-size:10px;text-transform:uppercase;letter-spacing:2.5px;
  color:var(--em2);font-weight:700;margin-bottom:5px;}
.sec-eye::before{content:'';width:14px;height:2px;background:var(--em);border-radius:1px;display:block;}
.sec-title{font-family:'Cormorant Garant',serif;
  font-size:clamp(26px,3.2vw,38px);font-weight:700;color:var(--slate);line-height:1.1;}
.sec-desc{font-size:13.5px;color:var(--muted);line-height:1.72;margin-top:7px;max-width:470px;}

/* scroll reveal */
.reveal{opacity:0;transform:translateY(26px);
  transition:opacity .6s ease,transform .6s ease;}
.reveal.in{opacity:1;transform:translateY(0);}

/* ── EVENTS ──────────────────────────────── */
.ev-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:15px;}
.ev-card{background:var(--card);border-radius:var(--r2);padding:22px 18px;
  border:1px solid var(--border);box-shadow:var(--sh);
  position:relative;overflow:hidden;transition:all .24s;}
.ev-card::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--em);}
.ev-card.holiday::after {background:linear-gradient(90deg,#F59E0B,#FBBF24);}
.ev-card.sports::after  {background:linear-gradient(90deg,#3B82F6,#60A5FA);}
.ev-card.cultural::after{background:linear-gradient(90deg,#EC4899,#F472B6);}
.ev-card.exam::after    {background:linear-gradient(90deg,#8B5CF6,#A78BFA);}
.ev-card:hover{transform:translateY(-4px);box-shadow:var(--sh2);border-color:transparent;}
.ev-date{display:inline-flex;flex-direction:column;align-items:center;
  background:var(--slate);color:#fff;border-radius:8px;
  padding:8px 12px;margin-bottom:11px;min-width:48px;}
.ev-d{font-family:'Cormorant Garant',serif;font-size:23px;font-weight:700;line-height:1;}
.ev-m{font-size:9px;text-transform:uppercase;letter-spacing:1px;opacity:.48;margin-top:2px;}
.ev-badge{display:inline-block;padding:2px 9px;border-radius:100px;
  font-size:10px;font-weight:700;margin-bottom:8px;
  background:var(--em-pale);color:var(--em2);}
.ev-badge.holiday {background:#FFFBEB;color:#D97706;}
.ev-badge.sports  {background:#EFF6FF;color:#2563EB;}
.ev-badge.cultural{background:#FDF2F8;color:#DB2777;}
.ev-badge.exam    {background:#F5F3FF;color:#7C3AED;}
.ev-title{font-size:14px;font-weight:700;color:var(--slate);margin-bottom:5px;}
.ev-desc {font-size:12.5px;color:var(--muted);line-height:1.55;}

/* ── CALENDAR ────────────────────────────── */
.cal-wrap{background:var(--card);border-radius:var(--r3);
  border:1px solid var(--border);box-shadow:var(--sh);padding:30px 32px;}
.cal-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;}
.cal-btn{width:33px;height:33px;border-radius:8px;
  border:1.5px solid var(--border);background:var(--card);
  cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;
  color:var(--slate);transition:all .17s;}
.cal-btn:hover{background:var(--slate);color:#fff;border-color:var(--slate);}
.cal-mo{font-family:'Cormorant Garant',serif;font-size:21px;font-weight:700;color:var(--slate);}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.cal-dow{text-align:center;font-size:9px;font-weight:700;color:var(--light);
  padding:7px 0;text-transform:uppercase;letter-spacing:.5px;}
.cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  border-radius:7px;font-size:12px;font-weight:500;color:var(--text);
  position:relative;transition:background .12s;}
.cal-day:hover{background:var(--em-pale);}
.cal-day.today  {background:var(--slate);color:#fff;font-weight:700;}
.cal-day.holiday{color:#D97706;font-weight:700;}
.cal-day.has-ev::after{content:'';position:absolute;bottom:3px;
  width:4px;height:4px;border-radius:50%;background:var(--em);}
.cal-day.other{color:rgba(0,0,0,.16);}

/* ── GALLERY ─────────────────────────────── */
.gal-grid{display:grid;grid-template-columns:repeat(12,1fr);
  grid-template-rows:195px 195px;gap:11px;}
.gc{border-radius:var(--r2);overflow:hidden;cursor:pointer;
  position:relative;transition:all .26s;}
.gc:nth-child(1){grid-column:span 7;grid-row:span 2;}
.gc:nth-child(2){grid-column:span 5;}
.gc:nth-child(3){grid-column:span 2;}
.gc:nth-child(4){grid-column:span 3;}
.gc:hover{transform:scale(1.02);z-index:3;box-shadow:0 18px 56px rgba(15,23,42,.2);}
.gc-inner{width:100%;height:100%;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:10px;
  background:linear-gradient(135deg,var(--slate),var(--slate2));transition:filter .24s;}
.gc:nth-child(2) .gc-inner{background:linear-gradient(135deg,#064E3B,#065F46);}
.gc:nth-child(3) .gc-inner{background:linear-gradient(135deg,#312E81,#3730A3);}
.gc:nth-child(4) .gc-inner{background:linear-gradient(135deg,#7C2D12,#9A3412);}
.gc:hover .gc-inner{filter:brightness(1.1);}
.gc-ico{font-size:50px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.3));}
.gc:nth-child(1) .gc-ico{font-size:68px;}
.gc-tag{font-size:11px;color:rgba(255,255,255,.42);font-weight:500;}
.gc-over{position:absolute;inset:0;
  background:linear-gradient(to top,rgba(15,23,42,.84),transparent 55%);
  opacity:0;transition:opacity .26s;
  display:flex;align-items:flex-end;padding:16px;}
.gc:hover .gc-over{opacity:1;}
.gc-lbl{color:#fff;font-size:13.5px;font-weight:700;}

/* ── NOTICES ─────────────────────────────── */
.notices{display:flex;flex-direction:column;gap:8px;}
.notice{display:flex;gap:13px;align-items:flex-start;
  background:var(--card);border-radius:var(--r2);padding:15px 18px;
  border:1px solid var(--border);box-shadow:var(--sh);
  border-left:3px solid transparent;transition:all .19s;}
.notice.unread{border-left-color:var(--em);}
.notice.urgent{border-left-color:#EF4444;}
.notice:hover{transform:translateX(4px);box-shadow:var(--sh2);}
.ni{width:38px;height:38px;border-radius:10px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:17px;background:var(--em-pale);}
.ni.red   {background:#FEF2F2;}
.ni.yellow{background:#FFFBEB;}
.ni.green {background:#F0FDF4;}
.nb{flex:1;}
.nb-t{font-size:13.5px;font-weight:700;color:var(--slate);margin-bottom:3px;}
.nb-d{font-size:12px;color:var(--muted);line-height:1.55;}
.nb-s{font-size:10.5px;color:var(--light);margin-top:4px;}

/* ── FACULTY ─────────────────────────────── */
.fac-scroll{display:flex;gap:13px;overflow-x:auto;padding-bottom:8px;}
.fac-scroll::-webkit-scrollbar{height:3px;}
.fac-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
.fac-card{background:var(--card);border-radius:var(--r2);padding:22px 16px;text-align:center;
  min-width:170px;flex-shrink:0;border:1px solid var(--border);
  box-shadow:var(--sh);transition:all .24s;}
.fac-card:hover{transform:translateY(-5px);box-shadow:var(--sh2);border-color:var(--em);}
.fac-av{width:60px;height:60px;border-radius:50%;margin:0 auto 11px;
  display:flex;align-items:center;justify-content:center;font-size:24px;
  background:linear-gradient(135deg,var(--slate),var(--slate2));
  border:2px solid var(--border);}
.fac-nm{font-size:13px;font-weight:700;color:var(--slate);margin-bottom:3px;}
.fac-sb{font-size:11px;color:var(--muted);margin-bottom:8px;line-height:1.4;}
.fac-q {display:inline-block;padding:2px 9px;border-radius:100px;
  font-size:10px;font-weight:600;background:var(--em-pale);color:var(--em2);}

/* ── CONTACT ─────────────────────────────── */
.ct-row{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;margin-bottom:68px;}
.ct-card{background:var(--slate);border-radius:var(--r2);padding:24px 18px;text-align:center;
  border:1px solid rgba(255,255,255,.05);transition:all .2s;}
.ct-card:hover{background:var(--slate2);transform:translateY(-3px);}
.ct-ico{font-size:30px;margin-bottom:7px;}
.ct-lbl{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;
  color:rgba(255,255,255,.28);margin-bottom:4px;}
.ct-val{font-size:13px;font-weight:600;color:rgba(255,255,255,.78);}

/* ── FOOTER ──────────────────────────────── */
.footer{background:var(--slate);color:rgba(255,255,255,.42);
  padding:44px 44px 26px;border-top:1px solid rgba(255,255,255,.05);}
.ft-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px;margin-bottom:36px;}
.ft-nm{font-family:'Cormorant Garant',serif;font-size:19px;font-weight:700;color:#fff;margin-bottom:8px;}
.ft-dsc{font-size:13px;line-height:1.7;}
.ft-h {font-size:9px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.22);margin-bottom:13px;}
.ft-lnk{display:block;color:rgba(255,255,255,.42);text-decoration:none;
  font-size:12.5px;margin-bottom:8px;transition:color .17s;cursor:pointer;
  background:none;border:none;text-align:left;
  font-family:'Plus Jakarta Sans',sans-serif;padding:0;}
.ft-lnk:hover{color:rgba(255,255,255,.8);}
.ft-bot{border-top:1px solid rgba(255,255,255,.06);padding-top:18px;
  display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;}
.ft-copy{font-size:11.5px;}

/* ── OVERLAY ─────────────────────────────── */
.ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:998;}
.ov.on{display:block;}

/* ── RESPONSIVE ──────────────────────────── */
@media(max-width:980px){
  .sb{position:fixed;left:calc(-1 * var(--sbw));top:90px;z-index:999;max-height:calc(100vh - 90px);}
  .sb.on{left:0;}
  .main{padding:36px 22px 80px;}
  .ham{display:flex;}
  .ct-row{grid-template-columns:1fr;}
  .ft-grid{grid-template-columns:1fr;gap:26px;}
  .gal-grid{grid-template-columns:1fr 1fr;grid-template-rows:155px 155px;}
  .gc:nth-child(1){grid-column:span 2;grid-row:span 1;}
}
@media(max-width:600px){
  .nav{padding:0 15px;}
  .ticker{display:none;}
  .hero{padding-top:74px;}
  .hero-band{flex-direction:column;max-width:250px;}
  .hs{border-right:none;border-bottom:1px solid rgba(255,255,255,.07);padding:11px 0;}
  .hs:last-child{border-bottom:none;}
  .main{padding:22px 14px 58px;}
  .ev-grid{grid-template-columns:1fr;}
  .footer{padding:30px 16px 22px;}
  .t-main{letter-spacing:-1px;}
  .cal-wrap{padding:20px 14px;}
}
`;

/* ── DATA ──────────────────────────────────────── */
const TICKERS = [
  '📢 Annual Exams begin 10th April 2026',
  '🏆 Sports Day results — check the gallery',
  '📚 New worksheets uploaded for Class 3–5',
  '⚠️ School closed 18 March — Staff Meeting',
  '🎉 Cultural Fest registrations open now',
  '🌟 Congratulations to our Class 5 toppers!',
];

const EVENTS = [
  { d:26,m:'Jan',type:'holiday', title:'Republic Day',        desc:'National holiday — school remains closed.'       },
  { d:14,m:'Feb',type:'cultural',title:'Annual Cultural Fest',desc:'Dance, drama, music & art for all classes.'     },
  { d:22,m:'Mar',type:'sports',  title:'Inter-School Cricket',desc:'District level tournament — support the team!'  },
  { d:10,m:'Apr',type:'exam',    title:'Annual Exams Begin',  desc:'Classes 1–5 annual examination schedule.'      },
  { d:5, m:'Jun',type:'event',   title:'New Session Begins',  desc:'Academic year 2026–27 orientation day.'        },
  { d:15,m:'Aug',type:'holiday', title:'Independence Day',    desc:'Flag hoisting at 8:00 AM sharp.'               },
];

const NOTICES = [
  { ico:'📢',c:'red',   title:'Exam Date Sheet Released',   text:'Annual exam schedule for Classes 1–5 is available. Check the school calendar.', time:'2 hours ago',unread:true, urgent:true  },
  { ico:'🏆',c:'green', title:'Sports Day Results',          text:'Full results and photos are now live in the gallery section.',                   time:'1 day ago',  unread:true              },
  { ico:'📚',c:'',      title:'New Study Material Uploaded', text:'Maths & Science worksheets for Class 3–5 uploaded by subject teachers.',       time:'2 days ago', unread:false             },
  { ico:'⚠️',c:'yellow',title:'School Closed – March 18',    text:'Closed on 18th March 2026 — Annual Staff Development Day.',                    time:'3 days ago', unread:false,urgent:true  },
  { ico:'🎉',c:'green', title:'Cultural Fest Registration',  text:'Open for Annual Cultural Fest. Contact class teacher before 5th March.',       time:'5 days ago', unread:false             },
];

const FACULTY = [
  { e:'👩‍🏫',name:'Mrs. Priya Sharma',sub:'Class Teacher – V', qual:'M.Ed, B.Sc' },
  { e:'👨‍🏫',name:'Mr. Rahul Verma',  sub:'Mathematics',        qual:'M.Sc Math'  },
  { e:'👩‍🏫',name:'Mrs. Sunita Yadav',sub:'Hindi & EVS',        qual:'M.A. Hindi' },
  { e:'👨‍🏫',name:'Mr. Anil Gupta',   sub:'Science',            qual:'M.Sc Sci.'  },
  { e:'👩‍🏫',name:'Ms. Kavya Singh',  sub:'English',            qual:'M.A. Eng.'  },
  { e:'👨‍🏫',name:'Mr. D. Tiwari',    sub:'Physical Education', qual:'B.P.Ed'     },
];

const GALLERY = [
  { e:'🏆',label:'Sports Day 2025'    },
  { e:'🎭',label:'Cultural Fest'      },
  { e:'🔬',label:'Science Exhibition' },
  { e:'🎨',label:'Art Competition'    },
];

const MONTHS  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOWS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const EV_DAYS = new Set([26,14,22,10,5,15]);
const HOL_DAYS= new Set([26,15]);

function buildDays(y,m){
  const fd=new Date(y,m,1).getDay(), tot=new Date(y,m+1,0).getDate(), prv=new Date(y,m,0).getDate();
  const out=[];
  for(let i=fd-1;i>=0;i--)  out.push({d:prv-i,curr:false});
  for(let d=1;d<=tot;d++)    out.push({d,curr:true});
  while(out.length%7)        out.push({d:out.length-fd-tot+1,curr:false});
  return out;
}

/* ── scroll reveal ─ */
function useReveal(){
  useEffect(()=>{
    const all=document.querySelectorAll('.reveal');
    if(!all.length)return;
    const io=new IntersectionObserver(
      es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');}),
      {threshold:.1}
    );
    all.forEach(el=>io.observe(el));
    return()=>io.disconnect();
  });
}

/* ── hero block parallax ─ */
function useParallax(ref){
  useEffect(()=>{
    let raf;
    const fn=()=>{
      raf=requestAnimationFrame(()=>{
        if(!ref.current)return;
        const y=window.scrollY;
        ref.current.style.transform=`translateY(${y*.28}px)`;
        ref.current.style.opacity=String(Math.max(0,1-y*.0024));
      });
    };
    window.addEventListener('scroll',fn,{passive:true});
    return()=>{window.removeEventListener('scroll',fn);cancelAnimationFrame(raf);};
  },[ref]);
}

/* ── COMPONENT ─────────────────────────────────── */
export default function HomePage(){
  const [active,  setActive]  = useState('events');
  const [sbOpen,  setSbOpen]  = useState(false);
  const [scrolled,setScrolled]= useState(false);
  const [cal,     setCal]     = useState({y:2026,m:2});
  const heroRef = useRef(null);
  const today   = new Date();

  useReveal();
  useParallax(heroRef);

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>6);
    window.addEventListener('scroll',fn,{passive:true});
    return()=>window.removeEventListener('scroll',fn);
  },[]);

  const goTo=id=>{
    setActive(id);setSbOpen(false);
    setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}),40);
  };

  const NAV=[
    {id:'events',       ico:'📅',lbl:'Upcoming Events', pill:<span className="sb-pill">6</span>},
    {id:'calendar',     ico:'🗓',lbl:'School Calendar',  pill:null},
    {id:'photos',       ico:'📸',lbl:'Photo Gallery',    pill:null},
    {id:'notifications',ico:'🔔',lbl:'Notices & Alerts', pill:<span className="sb-pill r">2</span>},
    {id:'teachers',     ico:'👨‍🏫',lbl:'Our Faculty',     pill:null},
  ];

  const days=buildDays(cal.y,cal.m);
  const prevM=()=>setCal(s=>{const d=new Date(s.y,s.m-1);return{y:d.getFullYear(),m:d.getMonth()};});
  const nextM=()=>setCal(s=>{const d=new Date(s.y,s.m+1);return{y:d.getFullYear(),m:d.getMonth()};});

  return(
    <>
      <style>{STYLES}</style>

      {/* TICKER */}
      <div className="ticker">
        <div className="t-tag">📌 News</div>
        <div className="t-track">
          <div className="t-inner">
            {[...TICKERS,...TICKERS].map((t,i)=>(
              <span key={i} className="t-item">{t} <span className="t-sep">◆</span></span>
            ))}
          </div>
        </div>
      </div>

      {/* TOPNAV */}
      <nav className={`nav${scrolled?' up':''}`}>
        <div className="nav-brand" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>
          <div className="nav-crest">🏫</div>
          <div>
            <div className="nav-nm">Vidya Mandir</div>
            <div className="nav-tg">School Portal</div>
          </div>
        </div>
        <div className="nav-r">
          <div className="notif" onClick={()=>goTo('notifications')}>
            🔔<div className="n-dot"/>
          </div>
          <button className={`ham${sbOpen?' x':''}`} onClick={()=>setSbOpen(v=>!v)}>
            <div className="hb"/><div className="hb"/><div className="hb"/>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"><div className="h-grid"/><div className="h-noise"/></div>
        <div className="orb1"/><div className="orb2"/>

        <div className="hero-inner" ref={heroRef}>
          <div className="hero-eye">
            <div className="edot"/>
            <span>Academic Year 2025 – 2026</span>
            <div className="edot"/>
          </div>

          {/* Word-by-word entrance — pure CSS, no scroll interference */}
          <div className="wrow t-main">
            {['Vidya','Mandir'].map((w,i)=>(
              <React.Fragment key={w}>
                <span className="hw" style={{animationDelay:`${.18+i*.17}s`}}>{w}</span>
                {i===0&&' '}
              </React.Fragment>
            ))}
          </div>
          <div className="wrow" style={{marginBottom:'10px'}}>
            {['School','of','Excellence'].map((w,i)=>(
              <React.Fragment key={w}>
                <span className="hw t-italic" style={{animationDelay:`${.52+i*.14}s`}}>{w}</span>
                {i<2&&' '}
              </React.Fragment>
            ))}
          </div>

          <p className="hero-sub">
            Play Group se Class 5 tak — ek safar, ek parivar.<br/>
            <em>Excellence in Education · Values for Life · Gomti Nagar, Lucknow</em>
          </p>

          <div className="hero-band">
            <div className="hs"><div className="hs-n">500+</div><div className="hs-l">Students</div></div>
            <div className="hs"><div className="hs-n">32</div><div className="hs-l">Teachers</div></div>
            <div className="hs"><div className="hs-n">15+</div><div className="hs-l">Years</div></div>
            <div className="hs"><div className="hs-n">98%</div><div className="hs-l">Pass Rate</div></div>
          </div>

          <div className="hero-ctas">
            <button className="btn-p" onClick={()=>goTo('events')}>🎉 Upcoming Events</button>
            <button className="btn-g" onClick={()=>goTo('teachers')}>👨‍🏫 Meet Our Faculty</button>
          </div>
        </div>

        <div className="scroll-cue"><div className="sc-line"/>Scroll</div>
      </section>

      {/* PAGE */}
      <div className="page">
        <div className={`ov${sbOpen?' on':''}`} onClick={()=>setSbOpen(false)}/>

        {/* SIDEBAR */}
        <aside className={`sb${sbOpen?' on':''}`}>

          <div className="sb-top">
            <div className="sb-logo-row">
              <div className="sb-logo">🏫</div>
              <div>
                <div className="sb-nm">Vidya Mandir</div>
                <div className="sb-sub">School Portal</div>
              </div>
            </div>
            <div className="sb-badge">
              <span className="sb-bdot"/>
              Session 2025 – 26
            </div>
          </div>

          <div className="sb-nav">
            <span className="sb-grp">Menu</span>
            {NAV.map(({id,ico,lbl,pill})=>(
              <button key={id} className={`sb-item${active===id?' on':''}`} onClick={()=>goTo(id)}>
                <span className="sb-ico">{ico}</span>
                <span className="sb-txt">{lbl}</span>
                {pill}
              </button>
            ))}
          </div>

          <div className="sb-foot">
            <div className="sb-ci"><span className="sb-cico">📍</span>Gangapur, Jaunpur, UP</div>
            <div className="sb-ci"><span className="sb-cico">📞</span>+91-522-0000000</div>
            <div className="sb-ci"><span className="sb-cico">✉️</span>info@vidyamandir.edu.in</div>
          </div>

        </aside>

        {/* MAIN */}
        <main className="main">

          {/* EVENTS */}
          <section id="events" className="sec">
            <div className="sec-hd reveal">
              <div className="sec-eye">School Life</div>
              <h2 className="sec-title">Upcoming Events</h2>
              <p className="sec-desc">All school activities, examinations, holidays and competitions throughout the year.</p>
            </div>
            <div className="ev-grid">
              {EVENTS.map((ev,i)=>(
                <div key={i} className={`ev-card ${ev.type} reveal`} style={{transitionDelay:`${i*.065}s`}}>
                  <div className="ev-date"><div className="ev-d">{ev.d}</div><div className="ev-m">{ev.m}</div></div>
                  <div className={`ev-badge ${ev.type}`}>{ev.type[0].toUpperCase()+ev.type.slice(1)}</div>
                  <div className="ev-title">{ev.title}</div>
                  <div className="ev-desc">{ev.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CALENDAR */}
          <section id="calendar" className="sec">
            <div className="sec-hd reveal">
              <div className="sec-eye">Schedule</div>
              <h2 className="sec-title">School Calendar</h2>
              <p className="sec-desc">Monthly overview of events, holidays and examinations.</p>
            </div>
            <div className="cal-wrap reveal">
              <div className="cal-hdr">
                <button className="cal-btn" onClick={prevM}>‹</button>
                <span className="cal-mo">{MONTHS[cal.m]} {cal.y}</span>
                <button className="cal-btn" onClick={nextM}>›</button>
              </div>
              <div className="cal-grid">
                {DOWS.map(d=><div key={d} className="cal-dow">{d}</div>)}
                {days.map((c,i)=>{
                  const isTd =c.curr&&cal.y===today.getFullYear()&&cal.m===today.getMonth()&&c.d===today.getDate();
                  const isHol=c.curr&&HOL_DAYS.has(c.d);
                  const isEv =c.curr&&EV_DAYS.has(c.d);
                  return(
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
            <div className="sec-hd reveal">
              <div className="sec-eye">Memories</div>
              <h2 className="sec-title">Photo Gallery</h2>
              <p className="sec-desc">Cherished moments from school events and everyday life.</p>
            </div>
            <div className="gal-grid reveal">
              {GALLERY.map((g,i)=>(
                <div key={i} className="gc">
                  <div className="gc-inner">
                    <span className="gc-ico">{g.e}</span>
                    <span className="gc-tag">{g.label}</span>
                  </div>
                  <div className="gc-over"><span className="gc-lbl">📷 {g.label}</span></div>
                </div>
              ))}
            </div>
          </section>

          {/* NOTICES */}
          <section id="notifications" className="sec">
            <div className="sec-hd reveal">
              <div className="sec-eye">Announcements</div>
              <h2 className="sec-title">Notices &amp; Alerts</h2>
              <p className="sec-desc">Important circulars and notices from school management.</p>
            </div>
            <div className="notices">
              {NOTICES.map((n,i)=>(
                <div key={i} className={`notice${n.unread?' unread':''}${n.urgent?' urgent':''} reveal`} style={{transitionDelay:`${i*.065}s`}}>
                  <div className={`ni ${n.c}`}>{n.ico}</div>
                  <div className="nb">
                    <div className="nb-t">{n.title}</div>
                    <div className="nb-d">{n.text}</div>
                    <div className="nb-s">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FACULTY */}
          <section id="teachers" className="sec">
            <div className="sec-hd reveal">
              <div className="sec-eye">Faculty</div>
              <h2 className="sec-title">Our Teachers</h2>
              <p className="sec-desc">Dedicated educators shaping young minds with expertise and care.</p>
            </div>
            <div className="fac-scroll reveal">
              {FACULTY.map((f,i)=>(
                <div key={i} className="fac-card">
                  <div className="fac-av">{f.e}</div>
                  <div className="fac-nm">{f.name}</div>
                  <div className="fac-sb">{f.sub}</div>
                  <span className="fac-q">{f.qual}</span>
                </div>
              ))}
            </div>
          </section>

          {/* CONTACT */}
          <div className="ct-row reveal">
            <div className="ct-card"><div className="ct-ico">📍</div><div className="ct-lbl">Address</div><div className="ct-val">Gomti Nagar, Lucknow, UP</div></div>
            <div className="ct-card"><div className="ct-ico">📞</div><div className="ct-lbl">Phone</div><div className="ct-val">+91-522-0000000</div></div>
            <div className="ct-card"><div className="ct-ico">✉️</div><div className="ct-lbl">Email</div><div className="ct-val">info@vidyamandir.edu.in</div></div>
          </div>

        </main>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="ft-grid">
          <div>
            <div className="ft-nm">🏫 Vidya Mandir</div>
            <div className="ft-dsc">A premier institution providing quality education from Play Group to Class 5. Nurturing young minds with academic excellence and strong values since 2009.</div>
          </div>
          <div>
            <div className="ft-h">Quick Links</div>
            {['events','calendar','photos','notifications','teachers'].map(id=>(
              <button key={id} className="ft-lnk" onClick={()=>goTo(id)}>
                {id[0].toUpperCase()+id.slice(1)}
              </button>
            ))}
          </div>
          <div>
            <div className="ft-h">Contact Us</div>
            <div className="ft-lnk">📍 Gangapur, Jaunpur, UP</div>
            <div className="ft-lnk">📞 +91-522-0000000</div>
            <div className="ft-lnk">✉️ info@vidyamandir.edu.in</div>
          </div>
        </div>
        <div className="ft-bot">
          <div className="ft-copy">© 2026 Vidya Mandir School. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
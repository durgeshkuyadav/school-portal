import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { login, clearError, selectAuthLoading, selectAuthError, selectIsAuthenticated, selectRole } from '../../store/slices/authSlice';

/* ─────────────────────────────────────────────────────────────────
   HIDDEN STAFF LOGIN — accessible only via /portal-login
   Deep navy with geometric background, not linked from main nav
   ───────────────────────────────────────────────────────────────── */

const S = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

body{font-family:'DM Sans',sans-serif;background:#06101E;}

@keyframes fadeUp  {from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn  {from{opacity:0;}to{opacity:1;}}
@keyframes drift1  {0%,100%{transform:translate(0,0) rotate(0deg);}33%{transform:translate(18px,-12px) rotate(2deg);}66%{transform:translate(-12px,8px) rotate(-1deg);}}
@keyframes drift2  {0%,100%{transform:translate(0,0) rotate(0deg);}50%{transform:translate(-20px,16px) rotate(-3deg);}}
@keyframes pulse   {0%,100%{opacity:.25;}50%{opacity:.55;}}
@keyframes spin    {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes shimmer {0%{background-position:200% 0;}100%{background-position:-200% 0;}}

.login-page{
  min-height:100vh; display:flex; align-items:center; justify-content:center;
  padding:24px; position:relative; overflow:hidden;
  background:radial-gradient(ellipse 140% 100% at 50% 50%, #091628 0%, #040D1A 100%);
}

.bg-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;}
.bg-grid{
  position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(245,166,35,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(245,166,35,.035) 1px,transparent 1px);
  background-size:48px 48px;
  animation:fadeIn 2s ease .5s both;
}
.bg-shape{
  position:absolute;border-radius:50%;
  background:radial-gradient(circle, rgba(21,101,192,.15),transparent 70%);
  pointer-events:none;
}
.bg-s1{width:600px;height:600px;top:-200px;right:-150px;animation:drift1 16s ease-in-out infinite;}
.bg-s2{width:400px;height:400px;bottom:-100px;left:-100px;background:radial-gradient(circle,rgba(245,166,35,.1),transparent 70%);animation:drift2 20s ease-in-out infinite;}
.bg-s3{width:200px;height:200px;top:40%;left:5%;background:radial-gradient(circle,rgba(3,169,244,.08),transparent 70%);animation:drift1 12s ease-in-out infinite 4s;}

.bg-ring{
  position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.04);
  animation:spin linear infinite;
}
.bg-r1{width:700px;height:700px;top:50%;left:50%;margin:-350px 0 0 -350px;animation-duration:90s;}
.bg-r2{width:500px;height:500px;top:50%;left:50%;margin:-250px 0 0 -250px;animation-duration:60s;animation-direction:reverse;}
.bg-r3{width:300px;height:300px;top:50%;left:50%;margin:-150px 0 0 -150px;animation-duration:40s;}
.bg-dot{position:absolute;width:5px;height:5px;border-radius:50%;background:rgba(245,166,35,.4);animation:pulse 3s ease-in-out infinite;}
.bg-d1{top:15%;left:25%;animation-delay:.8s;}
.bg-d2{top:75%;right:30%;animation-delay:1.6s;}
.bg-d3{top:45%;right:12%;animation-delay:0s;}
.bg-d4{top:20%;right:40%;animation-delay:2.4s;}

.login-card{
  position:relative;z-index:10;
  width:100%;max-width:420px;
  animation:fadeUp .8s ease .1s both;
}

.card-glow{
  position:absolute;inset:-1px;border-radius:22px;z-index:-1;
  background:linear-gradient(135deg,rgba(245,166,35,.25),rgba(21,101,192,.2),rgba(3,169,244,.15));
  filter:blur(20px); opacity:.7;
}

.card-body{
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);
  border-radius:22px; padding:44px 40px;
  backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);
}

.card-emblem{
  width:72px;height:72px;border-radius:18px;margin:0 auto 20px;
  background:linear-gradient(135deg,#F5A623,#FF6B00);
  display:flex;align-items:center;justify-content:center;font-size:34px;
  box-shadow:0 8px 28px rgba(245,166,35,.4);
  animation:fadeUp .8s ease .2s both;
}
.card-title{
  font-family:'Playfair Display',serif;font-size:26px;font-weight:900;
  text-align:center;margin-bottom:6px;
  color:transparent;
  background:linear-gradient(90deg,#fff,rgba(255,255,255,.8));
  -webkit-background-clip:text;background-clip:text;
  animation:fadeUp .8s ease .25s both;
}
.card-sub{
  text-align:center;font-size:13px;color:rgba(255,255,255,.38);
  margin-bottom:36px;letter-spacing:.3px;
  animation:fadeUp .8s ease .3s both;
}

.field-wrap{margin-bottom:16px;animation:fadeUp .8s ease both;}
.field-wrap:nth-child(1){animation-delay:.35s;}
.field-wrap:nth-child(2){animation-delay:.42s;}

.field-label{font-size:11.5px;font-weight:600;color:rgba(255,255,255,.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:7px;display:block;}
.field-input{
  width:100%;background:rgba(255,255,255,.07);
  border:1.5px solid rgba(255,255,255,.1);border-radius:11px;
  color:#fff;font-family:'DM Sans',sans-serif;font-size:15px;
  padding:13px 16px;outline:none;transition:all .22s;
}
.field-input:focus{border-color:rgba(245,166,35,.6);background:rgba(255,255,255,.1);}
.field-input::placeholder{color:rgba(255,255,255,.22);}
.field-input.err{border-color:rgba(239,83,80,.6);}
.field-err{font-size:11.5px;color:#FF7043;margin-top:5px;}

.login-btn{
  width:100%;padding:15px;border-radius:12px;border:none;cursor:pointer;
  background:linear-gradient(135deg,#F5A623,#FF6B00);
  color:#0A1628;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;
  box-shadow:0 8px 24px rgba(245,166,35,.4);transition:all .25s;
  margin-top:24px;display:flex;align-items:center;justify-content:center;gap:8px;
  animation:fadeUp .8s ease .5s both;
}
.login-btn:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(245,166,35,.5);}
.login-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}

.err-banner{
  background:rgba(239,83,80,.15);border:1px solid rgba(239,83,80,.35);
  border-radius:10px;padding:12px 16px;margin-bottom:20px;
  font-size:13px;color:#FF7043;display:flex;align-items:center;gap:8px;
  animation:fadeUp .4s ease both;
}

.card-hint{
  text-align:center;margin-top:28px;
  font-size:12px;color:rgba(255,255,255,.2);
  animation:fadeUp .8s ease .6s both;
}
.card-hint a{color:rgba(245,166,35,.5);cursor:pointer;text-decoration:none;transition:color .2s;}
.card-hint a:hover{color:rgba(245,166,35,.9);}

.demo-creds{
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
  border-radius:12px;padding:16px;margin-top:24px;
  animation:fadeUp .8s ease .65s both;
}
.demo-title{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,.25);margin-bottom:10px;}
.demo-row{display:flex;justify-content:space-between;font-size:12px;color:rgba(255,255,255,.45);margin-bottom:4px;}
.demo-row:last-child{margin-bottom:0;}
.demo-role{font-weight:600;color:rgba(255,255,255,.35);}

.spinner{
  width:18px;height:18px;border:2px solid rgba(10,22,40,.3);
  border-top-color:var(--navy,#0A1628);border-radius:50%;
  animation:spin .7s linear infinite;
}

.back-btn{
  position:absolute;top:24px;left:24px;z-index:10;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);
  color:rgba(255,255,255,.55);padding:9px 18px;border-radius:10px;cursor:pointer;
  font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
  transition:all .2s;display:flex;align-items:center;gap:6px;
  animation:fadeIn 1s ease .8s both;
}
.back-btn:hover{background:rgba(255,255,255,.12);color:#fff;}
`;

const schema = yup.object({
  username: yup.string().required('Username daalna zaroori hai'),
  password: yup.string().required('Password daalna zaroori hai'),
});

const ROLE_HOME = {
  SUPER_ADMIN:    '/admin/dashboard',
  SCHOOL_ADMIN:   '/admin/dashboard',
  CLASS_TEACHER:  '/teacher/dashboard',
  SUBJECT_TEACHER:'/teacher/dashboard',
  STUDENT:        '/student/dashboard',
  PARENT:         '/student/dashboard',
};

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const loading   = useSelector(selectAuthLoading);
  const error     = useSelector(selectAuthError);
  const isAuth    = useSelector(selectIsAuthenticated);
  const role      = useSelector(selectRole);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (isAuth && role) {
      const from = location.state?.from?.pathname || ROLE_HOME[role] || '/';
      navigate(from, { replace: true });
    }
  }, [isAuth, role, navigate, location]);

  const onSubmit = (data) => {
    dispatch(clearError());
    dispatch(login(data));
  };

  return (
    <>
      <style>{S}</style>
      <div className="login-page">

        {/* Background */}
        <div className="bg-layer">
          <div className="bg-grid"/>
          <div className="bg-shape bg-s1"/><div className="bg-shape bg-s2"/><div className="bg-shape bg-s3"/>
          <div className="bg-ring bg-r1"/><div className="bg-ring bg-r2"/><div className="bg-ring bg-r3"/>
          <div className="bg-dot bg-d1"/><div className="bg-dot bg-d2"/>
          <div className="bg-dot bg-d3"/><div className="bg-dot bg-d4"/>
        </div>

        {/* Back button */}
        <button className="back-btn" onClick={() => navigate('/')}>← Back to School</button>

        {/* Card */}
        <div className="login-card">
          <div className="card-glow"/>
          <div className="card-body">
            <div className="card-emblem">🏫</div>
            <div className="card-title">Staff Portal</div>
            <div className="card-sub">Vidya Mandir · Authorized Access Only</div>

            {error && (
              <div className="err-banner">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="field-wrap">
                <label className="field-label">Username</label>
                <input {...register('username')} className={`field-input${errors.username?' err':''}`} placeholder="Enter your username" autoFocus autoComplete="username"/>
                {errors.username && <div className="field-err">{errors.username.message}</div>}
              </div>
              <div className="field-wrap">
                <label className="field-label">Password</label>
                <input {...register('password')} type="password" className={`field-input${errors.password?' err':''}`} placeholder="••••••••" autoComplete="current-password"/>
                {errors.password && <div className="field-err">{errors.password.message}</div>}
              </div>
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <div className="spinner"/> : <><span>🔐</span> Sign In to Portal</>}
              </button>
            </form>

            <div className="demo-creds">
              <div className="demo-title">Demo Credentials</div>
              {[['Admin','admin','admin123'],['Teacher','teacher1','teacher123'],['Student','student1','student123']].map(([r,u,p])=>(
                <div key={r} className="demo-row">
                  <span className="demo-role">{r}</span>
                  <span>{u} / {p}</span>
                </div>
              ))}
            </div>

            <div className="card-hint">
              Not staff? <a onClick={() => navigate('/')}>Return to School Website</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

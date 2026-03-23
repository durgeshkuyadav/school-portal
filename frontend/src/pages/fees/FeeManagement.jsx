import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Chip, Alert, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, LinearProgress,
  Avatar, Divider, IconButton, Tooltip, Tab, Tabs
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrintIcon from '@mui/icons-material/Print';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { classApi, studentApi } from '../../api/services';
import { toast } from 'react-toastify';
import { useAppSettings } from '../../context/AppSettingsContext';

const FEE_TYPES = ['Tuition Fee', 'Exam Fee', 'Sports Fee', 'Library Fee', 'Transport Fee', 'Miscellaneous'];
const MONTHS = ['April','May','June','July','August','September','October','November','December','January','February','March'];
const PAYMENT_METHODS = ['Cash', 'Online Transfer', 'Cheque', 'DD'];

const LS_KEY = 'vm_fees_data';

function loadData() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{"structure":[],"payments":[]}'); }
  catch { return { structure: [], payments: [] }; }
}
function saveData(d) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }

export default function FeeManagement() {
  const { isDark } = useAppSettings();
  const user = useSelector(selectUser);
  const isAdmin = ['SUPER_ADMIN','SCHOOL_ADMIN'].includes(user?.role);
  const isTeacher = ['CLASS_TEACHER','SUBJECT_TEACHER'].includes(user?.role);

  const [data, setData]       = useState(loadData);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [tab, setTab]         = useState(0);
  const [feeDialog, setFeeDialog] = useState(false);
  const [payDialog, setPayDialog] = useState(false);
  const [selStudent, setSelStudent] = useState(null);
  const [feeForm, setFeeForm] = useState({ classId:'', feeType:'Tuition Fee', amount:'', dueDate:'', academicYear:'2025-2026' });
  const [payForm, setPayForm] = useState({ month: MONTHS[0], amount:'', method:'Cash', remarks:'' });

  const card = isDark ? '#161b27' : '#fff';
  const bord = isDark ? '#2d3348' : '#e8eaf6';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub  = isDark ? '#8892a4' : '#64748b';

  useEffect(() => {
    classApi.getAll().then(r => setClasses(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    studentApi.getAll().then(r => setStudents(r.data?.content || r.data || [])).catch(() => {});
  }, []);

  const persist = (d) => { setData(d); saveData(d); };

  const addFeeStructure = () => {
    if (!feeForm.classId || !feeForm.amount) { toast.error('Class aur amount zaroori hai'); return; }
    const d = { ...data, structure: [...data.structure, { id: Date.now(), ...feeForm, amount: Number(feeForm.amount) }] };
    persist(d); setFeeDialog(false); setFeeForm({ classId:'', feeType:'Tuition Fee', amount:'', dueDate:'', academicYear:'2025-2026' });
    toast.success('Fee structure add ho gaya!');
  };

  const recordPayment = () => {
    if (!selStudent || !payForm.amount) { toast.error('Student aur amount zaroori hai'); return; }
    const payment = { id: Date.now(), studentId: selStudent.id,
      studentName: `${selStudent.firstName} ${selStudent.lastName}`,
      classId: selStudent.classId, ...payForm,
      amount: Number(payForm.amount), date: new Date().toISOString().split('T')[0],
      receiptNo: `RCP${Date.now().toString().slice(-6)}` };
    const d = { ...data, payments: [...data.payments, payment] };
    persist(d); setPayDialog(false);
    setPayForm({ month: MONTHS[0], amount:'', method:'Cash', remarks:'' });
    toast.success(`✅ Payment recorded! Receipt: ${payment.receiptNo}`);
  };

  const getStudentSummary = (student) => {
    const structure = data.structure.filter(s => String(s.classId) === String(student.classId));
    const totalDue = structure.reduce((sum, s) => sum + s.amount, 0);
    const paid = data.payments.filter(p => String(p.studentId) === String(student.id))
      .reduce((sum, p) => sum + p.amount, 0);
    return { totalDue, paid, balance: totalDue - paid, status: paid >= totalDue ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING' };
  };

  const totalCollected = data.payments.reduce((s, p) => s + p.amount, 0);
  const totalPending   = students.reduce((sum, s) => { const { balance } = getStudentSummary(s); return sum + Math.max(0, balance); }, 0);

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={text}>💰 Fee Management</Typography>
          <Typography fontSize={13} color={sub}>Fee structure, collections aur defaulters manage karo</Typography>
        </Box>
        {isAdmin && (
          <Box sx={{ display:'flex', gap:1 }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setFeeDialog(true)} sx={{ borderRadius:2 }}>Fee Structure</Button>
            <Button variant="contained" startIcon={<PaymentIcon />} onClick={() => setPayDialog(true)} sx={{ bgcolor:'#0B1F3A', borderRadius:2 }}>Record Payment</Button>
          </Box>
        )}
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb:3 }}>
        {[
          { label:'Total Collected', val:`₹${totalCollected.toLocaleString('en-IN')}`, color:'#2E7D32', icon:'💰' },
          { label:'Pending Amount',  val:`₹${totalPending.toLocaleString('en-IN')}`,   color:'#C62828', icon:'⚠️' },
          { label:'Payments Recorded', val:data.payments.length,                        color:'#1565C0', icon:'🧾' },
          { label:'Fee Structures',  val:data.structure.length,                         color:'#E65100', icon:'📋' },
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

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb:2, '& .MuiTabs-indicator':{ bgcolor:'#0B1F3A' } }}>
        <Tab label="Student Status" />
        <Tab label="Payment History" />
        <Tab label="Fee Structure" />
      </Tabs>

      {/* Tab 0 - Student fee status */}
      {tab === 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: isDark?'#1e2a3e':'#0B1F3A' }}>
                {['Student','Class','Total Due','Paid','Balance','Status','Action'].map(h => (
                  <TableCell key={h} sx={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ textAlign:'center', py:4, color:sub }}>
                  Koi student nahi mila
                </TableCell></TableRow>
              ) : students.map((s, i) => {
                const { totalDue, paid, balance, status } = getStudentSummary(s);
                return (
                  <TableRow key={s.id || i} sx={{ bgcolor: i%2===0?(isDark?'#1e2a3e22':'#f8f9ff'):'transparent' }}>
                    <TableCell>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                        <Avatar sx={{ width:28, height:28, bgcolor:'#0B1F3A', fontSize:11 }}>
                          {s.firstName?.[0]}{s.lastName?.[0]}
                        </Avatar>
                        <Typography fontSize={13} fontWeight={600} color={text}>{s.firstName} {s.lastName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color:sub, fontSize:12 }}>{s.className || `Class ${s.classId}`}</TableCell>
                    <TableCell sx={{ color:text, fontWeight:600 }}>₹{totalDue.toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ color:'#2E7D32', fontWeight:700 }}>₹{paid.toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ color: balance>0?'#C62828':'#2E7D32', fontWeight:700 }}>
                      ₹{Math.abs(balance).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Chip label={status} size="small"
                        color={status==='PAID'?'success':status==='PARTIAL'?'warning':'error'}
                        sx={{ fontWeight:700, fontSize:11 }} />
                    </TableCell>
                    <TableCell>
                      {isAdmin && (
                        <Button size="small" variant="outlined" onClick={() => { setSelStudent(s); setPayDialog(true); }}
                          sx={{ fontSize:10, borderRadius:2 }}>Pay</Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab 1 - Payment history */}
      {tab === 1 && (
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: isDark?'#1e2a3e':'#0B1F3A' }}>
                {['Receipt','Student','Month','Amount','Method','Date'].map(h => (
                  <TableCell key={h} sx={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.payments.length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ textAlign:'center', py:4, color:sub }}>
                  Koi payment record nahi hai
                </TableCell></TableRow>
              ) : [...data.payments].reverse().map((p, i) => (
                <TableRow key={p.id || i} sx={{ bgcolor: i%2===0?(isDark?'#1e2a3e22':'#f8f9ff'):'transparent' }}>
                  <TableCell sx={{ fontFamily:'monospace', color:'#1565C0', fontWeight:700, fontSize:12 }}>{p.receiptNo}</TableCell>
                  <TableCell sx={{ color:text, fontSize:13 }}>{p.studentName}</TableCell>
                  <TableCell sx={{ color:sub, fontSize:12 }}>{p.month}</TableCell>
                  <TableCell sx={{ color:'#2E7D32', fontWeight:700 }}>₹{p.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell><Chip label={p.method} size="small" variant="outlined" sx={{ fontSize:10 }}/></TableCell>
                  <TableCell sx={{ color:sub, fontSize:12 }}>{p.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab 2 - Fee structure */}
      {tab === 2 && (
        data.structure.length === 0 ? (
          <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3 }}>
            <CardContent sx={{ textAlign:'center', py:6 }}>
              <Typography color={sub}>Koi fee structure nahi — Admin se banwao</Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {data.structure.map((s, i) => {
              const cls = classes.find(c => String(c.id) === String(s.classId));
              return (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3 }}>
                    <Box sx={{ height:4, background:'linear-gradient(90deg,#0B1F3A,#1565C0)' }}/>
                    <CardContent>
                      <Typography fontWeight={700} color={text}>{s.feeType}</Typography>
                      <Typography fontSize={12} color={sub} mb={1}>{cls?.name || `Class ${s.classId}`} • {s.academicYear}</Typography>
                      <Typography variant="h5" fontWeight={800} color='#2E7D32'>₹{Number(s.amount).toLocaleString('en-IN')}</Typography>
                      {s.dueDate && <Typography fontSize={11} color={sub} mt={1}>Due: {s.dueDate}</Typography>}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )
      )}

      {/* Add Fee Structure Dialog */}
      <Dialog open={feeDialog} onClose={() => setFeeDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle sx={{ background:'linear-gradient(135deg,#0B1F3A,#1565C0)', color:'#fff', fontWeight:700 }}>
          📋 Fee Structure Add Karo
        </DialogTitle>
        <DialogContent sx={{ pt:2.5, display:'flex', flexDirection:'column', gap:2 }}>
          <TextField select label="Class *" value={feeForm.classId} size="small"
            onChange={e => setFeeForm(f => ({ ...f, classId:e.target.value }))}>
            {classes.map(c => <MenuItem key={c.id} value={String(c.id)}>{c.name}{c.section?` - ${c.section}`:''}</MenuItem>)}
          </TextField>
          <TextField select label="Fee Type" value={feeForm.feeType} size="small"
            onChange={e => setFeeForm(f => ({ ...f, feeType:e.target.value }))}>
            {FEE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField label="Amount (₹) *" type="number" value={feeForm.amount} size="small"
            onChange={e => setFeeForm(f => ({ ...f, amount:e.target.value }))} />
          <TextField label="Due Date" type="date" value={feeForm.dueDate} size="small"
            InputLabelProps={{ shrink:true }} onChange={e => setFeeForm(f => ({ ...f, dueDate:e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setFeeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={addFeeStructure} sx={{ bgcolor:'#0B1F3A', borderRadius:2 }}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={payDialog} onClose={() => { setPayDialog(false); setSelStudent(null); }} maxWidth="xs" fullWidth PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle sx={{ background:'linear-gradient(135deg,#2E7D32,#1B5E20)', color:'#fff', fontWeight:700 }}>
          💳 Payment Record Karo
        </DialogTitle>
        <DialogContent sx={{ pt:2.5, display:'flex', flexDirection:'column', gap:2 }}>
          <TextField select label="Student *" value={selStudent?.id || ''} size="small"
            onChange={e => setSelStudent(students.find(s => String(s.id) === String(e.target.value)) || null)}>
            {students.map(s => <MenuItem key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.className||`Class ${s.classId}`}</MenuItem>)}
          </TextField>
          <TextField select label="Month" value={payForm.month} size="small"
            onChange={e => setPayForm(f => ({ ...f, month:e.target.value }))}>
            {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
          <TextField label="Amount (₹) *" type="number" value={payForm.amount} size="small"
            onChange={e => setPayForm(f => ({ ...f, amount:e.target.value }))} />
          <TextField select label="Payment Method" value={payForm.method} size="small"
            onChange={e => setPayForm(f => ({ ...f, method:e.target.value }))}>
            {PAYMENT_METHODS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
          <TextField label="Remarks (optional)" value={payForm.remarks} size="small"
            onChange={e => setPayForm(f => ({ ...f, remarks:e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => { setPayDialog(false); setSelStudent(null); }}>Cancel</Button>
          <Button variant="contained" onClick={recordPayment} sx={{ bgcolor:'#2E7D32', borderRadius:2 }}>
            ✅ Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Chip, Alert, Avatar, InputAdornment, Tabs, Tab, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { useAppSettings } from '../../context/AppSettingsContext';

const GENRES = ['Mathematics','Science','English','Hindi','History','Geography','Computer','Story','Encyclopedia','Reference'];
const LS_KEY = 'vm_library';

const loadLib = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{"books":[],"issues":[]}'); } catch { return { books:[], issues:[] }; }};
const saveLib = d => localStorage.setItem(LS_KEY, JSON.stringify(d));

const SAMPLE_BOOKS = [
  { id:1, title:'NCERT Mathematics Class 5', author:'NCERT', genre:'Mathematics', copies:5, available:3, isbn:'978-81-7450-001' },
  { id:2, title:'Science Around Us', author:'Oxford Press', genre:'Science', copies:8, available:6, isbn:'978-0-19-001' },
  { id:3, title:'English Grammar & Composition', author:'Wren & Martin', genre:'English', copies:10, available:8, isbn:'978-81-219-001' },
  { id:4, title:'Champak Stories', author:'Various', genre:'Story', copies:15, available:12, isbn:'978-93-001' },
];

export default function LibraryManagement() {
  const { isDark } = useAppSettings();
  const user = useSelector(selectUser);
  const isAdmin = ['SUPER_ADMIN','SCHOOL_ADMIN','CLASS_TEACHER'].includes(user?.role);

  const [data, setData]     = useState(() => {
    const d = loadLib();
    if (d.books.length === 0) return { ...d, books: SAMPLE_BOOKS };
    return d;
  });
  const [tab, setTab]       = useState(0);
  const [search, setSearch] = useState('');
  const [bookDialog, setBookDialog] = useState(false);
  const [issueDialog, setIssueDialog] = useState(false);
  const [selBook, setSelBook] = useState(null);
  const [bookForm, setBookForm] = useState({ title:'', author:'', genre:'Mathematics', copies:1, isbn:'' });
  const [issueForm, setIssueForm] = useState({ borrowerName:'', borrowerClass:'', returnDate:'' });

  const card = isDark ? '#161b27' : '#fff';
  const bord = isDark ? '#2d3348' : '#e8eaf6';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub  = isDark ? '#8892a4' : '#64748b';

  const persist = d => { setData(d); saveLib(d); };

  const addBook = () => {
    if (!bookForm.title) { toast.error('Title zaroori hai'); return; }
    const book = { id: Date.now(), ...bookForm, copies: Number(bookForm.copies), available: Number(bookForm.copies) };
    persist({ ...data, books: [...data.books, book] });
    setBookDialog(false); setBookForm({ title:'', author:'', genre:'Mathematics', copies:1, isbn:'' });
    toast.success('Book added!');
  };

  const issueBook = () => {
    if (!selBook || !issueForm.borrowerName) { toast.error('Details zaroori hain'); return; }
    if (selBook.available <= 0) { toast.error('No copies available!'); return; }
    const issue = { id: Date.now(), bookId: selBook.id, bookTitle: selBook.title,
      ...issueForm, issueDate: new Date().toISOString().split('T')[0], status: 'ISSUED' };
    const books = data.books.map(b => b.id === selBook.id ? { ...b, available: b.available - 1 } : b);
    persist({ books, issues: [...data.issues, issue] });
    setIssueDialog(false); setIssueForm({ borrowerName:'', borrowerClass:'', returnDate:'' });
    toast.success(`📚 "${selBook.title}" issued!`);
  };

  const returnBook = (issueId) => {
    const issue = data.issues.find(i => i.id === issueId);
    const issues = data.issues.map(i => i.id === issueId ? { ...i, status:'RETURNED', returnedDate: new Date().toISOString().split('T')[0] } : i);
    const books = data.books.map(b => b.id === issue.bookId ? { ...b, available: b.available + 1 } : b);
    persist({ books, issues });
    toast.success('Book returned!');
  };

  const filteredBooks = data.books.filter(b =>
    !search || `${b.title} ${b.author} ${b.genre}`.toLowerCase().includes(search.toLowerCase()));

  const activeIssues = data.issues.filter(i => i.status === 'ISSUED');

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={text}>📚 Library</Typography>
          <Typography fontSize={13} color={sub}>{data.books.length} books • {activeIssues.length} currently issued</Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setBookDialog(true)}
            sx={{ bgcolor:'#4E342E', borderRadius:2, fontWeight:700 }}>
            Add Book
          </Button>
        )}
      </Box>

      <Grid container spacing={2} sx={{ mb:3 }}>
        {[
          { label:'Total Books', val:data.books.reduce((s,b)=>s+b.copies,0), color:'#4E342E' },
          { label:'Available', val:data.books.reduce((s,b)=>s+b.available,0), color:'#2E7D32' },
          { label:'Issued', val:activeIssues.length, color:'#E65100' },
          { label:'Titles', val:data.books.length, color:'#1565C0' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:2, textAlign:'center' }}>
              <CardContent sx={{ py:1.5 }}>
                <Typography variant="h5" fontWeight={800} sx={{ color:s.color }}>{s.val}</Typography>
                <Typography fontSize={11} color={sub}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb:2 }}>
        <Tab label="Books Catalog" />
        <Tab label={`Issued (${activeIssues.length})`} />
        <Tab label="All Issues" />
      </Tabs>

      {tab === 0 && (
        <>
          <TextField fullWidth placeholder="Search books..." value={search}
            onChange={e => setSearch(e.target.value)} size="small" sx={{ mb:2 }}
            InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment> }}/>
          <Grid container spacing={2}>
            {filteredBooks.map(book => (
              <Grid item xs={12} sm={6} md={4} key={book.id}>
                <Card sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3, transition:'all .2s',
                  '&:hover':{ transform:'translateY(-2px)', boxShadow:6 } }}>
                  <Box sx={{ height:4, background:`linear-gradient(90deg,#4E342E,#6D4C41)` }}/>
                  <CardContent>
                    <Box sx={{ display:'flex', gap:1.5, mb:1 }}>
                      <Avatar sx={{ bgcolor:'#4E342E', width:44, height:44 }}>
                        <MenuBookIcon fontSize="small"/>
                      </Avatar>
                      <Box sx={{ flex:1 }}>
                        <Typography fontWeight={700} color={text} fontSize={13} noWrap>{book.title}</Typography>
                        <Typography fontSize={11} color={sub}>{book.author}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display:'flex', gap:.5, mb:1.5, flexWrap:'wrap' }}>
                      <Chip label={book.genre} size="small" sx={{ fontSize:10 }}/>
                      {book.isbn && <Chip label={book.isbn} size="small" variant="outlined" sx={{ fontSize:9, fontFamily:'monospace' }}/>}
                    </Box>
                    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <Typography fontSize={12} color={sub}>
                        Available: <strong style={{ color: book.available>0?'#2E7D32':'#C62828' }}>{book.available}/{book.copies}</strong>
                      </Typography>
                      {isAdmin && book.available > 0 && (
                        <Button size="small" variant="outlined" onClick={() => { setSelBook(book); setIssueDialog(true); }}
                          sx={{ fontSize:10, borderRadius:2, borderColor:'#4E342E', color:'#4E342E' }}>
                          Issue
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {(tab === 1 || tab === 2) && (
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor:card, border:`1px solid ${bord}`, borderRadius:3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: isDark?'#1e2a3e':'#4E342E' }}>
                {['Book','Borrower','Class','Issue Date','Due Date','Status'].map(h => (
                  <TableCell key={h} sx={{ color:'#fff', fontWeight:700, fontSize:12 }}>{h}</TableCell>
                ))}
                {isAdmin && <TableCell sx={{ color:'#fff', fontWeight:700, fontSize:12 }}>Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {(tab === 1 ? activeIssues : data.issues).length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ textAlign:'center', py:4, color:sub }}>No records</TableCell></TableRow>
              ) : (tab === 1 ? activeIssues : data.issues).map((issue, i) => {
                const overdue = issue.returnDate && issue.returnDate < new Date().toISOString().split('T')[0] && issue.status==='ISSUED';
                return (
                  <TableRow key={issue.id || i} sx={{ bgcolor: overdue?'#FFEBEE':(i%2===0?(isDark?'#1e2a3e22':'#f8f9ff'):'transparent') }}>
                    <TableCell sx={{ color:text, fontSize:13 }}>{issue.bookTitle}</TableCell>
                    <TableCell sx={{ color:text, fontSize:13 }}>{issue.borrowerName}</TableCell>
                    <TableCell sx={{ color:sub, fontSize:12 }}>{issue.borrowerClass}</TableCell>
                    <TableCell sx={{ color:sub, fontSize:12 }}>{issue.issueDate}</TableCell>
                    <TableCell sx={{ color: overdue?'#C62828':sub, fontSize:12, fontWeight: overdue?700:400 }}>
                      {issue.returnDate}{overdue?' ⚠️':''}
                    </TableCell>
                    <TableCell>
                      <Chip label={issue.status} size="small"
                        color={issue.status==='RETURNED'?'success': overdue?'error':'warning'}
                        sx={{ fontWeight:700, fontSize:10 }}/>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {issue.status === 'ISSUED' && (
                          <Button size="small" variant="outlined" onClick={() => returnBook(issue.id)}
                            sx={{ fontSize:10, borderRadius:2 }}>
                            Return
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Book Dialog */}
      <Dialog open={bookDialog} onClose={() => setBookDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle sx={{ background:'linear-gradient(135deg,#4E342E,#6D4C41)', color:'#fff', fontWeight:700 }}>📚 Add Book</DialogTitle>
        <DialogContent sx={{ pt:2.5, display:'flex', flexDirection:'column', gap:2 }}>
          <TextField label="Title *" value={bookForm.title} size="small" onChange={e => setBookForm(f => ({ ...f, title:e.target.value }))}/>
          <TextField label="Author" value={bookForm.author} size="small" onChange={e => setBookForm(f => ({ ...f, author:e.target.value }))}/>
          <TextField select label="Genre" value={bookForm.genre} size="small" onChange={e => setBookForm(f => ({ ...f, genre:e.target.value }))}>
            {GENRES.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </TextField>
          <TextField label="No. of Copies" type="number" value={bookForm.copies} size="small" onChange={e => setBookForm(f => ({ ...f, copies:e.target.value }))}/>
          <TextField label="ISBN (optional)" value={bookForm.isbn} size="small" onChange={e => setBookForm(f => ({ ...f, isbn:e.target.value }))}/>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setBookDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={addBook} sx={{ bgcolor:'#4E342E', borderRadius:2 }}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Issue Dialog */}
      <Dialog open={issueDialog} onClose={() => setIssueDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx:{ bgcolor:card, borderRadius:3 } }}>
        <DialogTitle fontWeight={700} color={text}>📖 Issue: {selBook?.title}</DialogTitle>
        <DialogContent sx={{ pt:1.5, display:'flex', flexDirection:'column', gap:2 }}>
          <TextField label="Borrower Name *" value={issueForm.borrowerName} size="small" onChange={e => setIssueForm(f => ({ ...f, borrowerName:e.target.value }))}/>
          <TextField label="Class/Section" value={issueForm.borrowerClass} size="small" onChange={e => setIssueForm(f => ({ ...f, borrowerClass:e.target.value }))}/>
          <TextField label="Return Date" type="date" value={issueForm.returnDate} size="small" InputLabelProps={{ shrink:true }} onChange={e => setIssueForm(f => ({ ...f, returnDate:e.target.value }))}/>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setIssueDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={issueBook} sx={{ bgcolor:'#4E342E', borderRadius:2 }}>Issue Book</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

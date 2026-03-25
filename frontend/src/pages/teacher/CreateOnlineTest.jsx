import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Grid, Alert, Snackbar, IconButton, Divider, Chip, Paper
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import QuizIcon from '@mui/icons-material/Quiz';
import { testApi } from '../../api/services';

const emptyQuestion = () => ({
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
  marks: 1,
});

const CreateOnlineTest = () => {
  const [form, setForm] = useState({
    title: '',
    subjectName: '',
    classId: '',
    durationMinutes: 30,
    totalMarks: '',
    passingMarks: '',
    startsAt: '',
    endsAt: '',
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const showMsg = (msg, sev = 'success') => setSnack({ open: true, msg, severity: sev });

  const handleFormChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleQuestionChange = (idx, field) => (e) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: e.target.value };
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const calcTotalMarks = () =>
    questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  const handleSubmit = async () => {
    if (!form.title || !form.classId || !form.durationMinutes) {
      showMsg('Title, Class ID aur Duration zaroori hai!', 'error');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.optionA || !q.optionB || !q.correctOption) {
        showMsg(`Question ${i + 1}: Text, Option A, Option B aur Correct Answer zaroori hai!`, 'error');
        return;
      }
    }

    const totalMarks = calcTotalMarks();
    const payload = {
      title: form.title,
      subjectName: form.subjectName,
      classId: Number(form.classId),
      durationMinutes: Number(form.durationMinutes),
      totalMarks,
      passingMarks: Number(form.passingMarks) || Math.ceil(totalMarks * 0.33),
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      questions: questions.map((q, i) => ({
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        marks: Number(q.marks) || 1,
        orderIndex: i + 1,
      })),
    };

    setLoading(true);
    try {
      await testApi.createTest(payload);
      showMsg('✅ Online Test create ho gaya! Students ab attempt kar sakte hain.');
      setForm({
        title: '', subjectName: '', classId: '', durationMinutes: 30,
        totalMarks: '', passingMarks: '', startsAt: '', endsAt: '',
      });
      setQuestions([emptyQuestion()]);
    } catch (err) {
      showMsg('❌ Error: ' + (err.response?.data?.message || 'Test create nahi hua'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={1} color="#1E3A5F">
        🧪 Online Test Create Karo
      </Typography>
      <Typography color="text.secondary" mb={3}>
        MCQ test banao — students apne portal se attempt karenge aur auto-grading hogi
      </Typography>

      <Grid container spacing={3}>
        {/* Left: Test Details */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2} color="#1565C0">
                📝 Test Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Test Ka Title *"
                    value={form.title} onChange={handleFormChange('title')}
                    placeholder="Jaise: Math Chapter 5 Quiz, Science Weekly Test" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Subject Ka Naam"
                    value={form.subjectName} onChange={handleFormChange('subjectName')}
                    placeholder="Jaise: Mathematics, Science" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Class ID *" type="number"
                    value={form.classId} onChange={handleFormChange('classId')}
                    helperText="Jis class ke liye hai" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Duration (minutes) *" type="number"
                    value={form.durationMinutes} onChange={handleFormChange('durationMinutes')} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Passing Marks"
                    type="number" value={form.passingMarks}
                    onChange={handleFormChange('passingMarks')}
                    helperText="Blank chhodo = 33%" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Chip label={`Total Marks: ${calcTotalMarks()}`}
                    color="primary" sx={{ mt: 1, fontSize: 14, py: 2 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Start Time (optional)" type="datetime-local"
                    value={form.startsAt} onChange={handleFormChange('startsAt')}
                    InputLabelProps={{ shrink: true }}
                    helperText="Kab se available hoga" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="End Time (optional)" type="datetime-local"
                    value={form.endsAt} onChange={handleFormChange('endsAt')}
                    InputLabelProps={{ shrink: true }}
                    helperText="Kab tak attempt kar sakte hain" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Questions */}
          <Typography variant="h6" fontWeight="bold" mb={2} color="#1565C0">
            ❓ Questions ({questions.length})
          </Typography>

          {questions.map((q, idx) => (
            <Paper key={idx} elevation={1} sx={{
              p: 2.5, mb: 2, borderRadius: 2,
              borderLeft: '4px solid #1565C0',
              position: 'relative'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography fontWeight="bold" color="#1E3A5F">
                  Question {idx + 1}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField size="small" type="number" label="Marks"
                    value={q.marks} onChange={handleQuestionChange(idx, 'marks')}
                    sx={{ width: 80 }} />
                  {questions.length > 1 && (
                    <IconButton color="error" onClick={() => removeQuestion(idx)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>

              <TextField fullWidth multiline rows={2} label="Question Text *"
                value={q.questionText} onChange={handleQuestionChange(idx, 'questionText')}
                placeholder="Yahan question likho..." sx={{ mb: 2 }} />

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Option A *"
                    value={q.optionA} onChange={handleQuestionChange(idx, 'optionA')}
                    InputProps={{
                      startAdornment: <Chip label="A" size="small" sx={{ mr: 1 }}
                        color={q.correctOption === 'A' ? 'success' : 'default'} />,
                    }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Option B *"
                    value={q.optionB} onChange={handleQuestionChange(idx, 'optionB')}
                    InputProps={{
                      startAdornment: <Chip label="B" size="small" sx={{ mr: 1 }}
                        color={q.correctOption === 'B' ? 'success' : 'default'} />,
                    }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Option C"
                    value={q.optionC} onChange={handleQuestionChange(idx, 'optionC')}
                    InputProps={{
                      startAdornment: <Chip label="C" size="small" sx={{ mr: 1 }}
                        color={q.correctOption === 'C' ? 'success' : 'default'} />,
                    }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Option D"
                    value={q.optionD} onChange={handleQuestionChange(idx, 'optionD')}
                    InputProps={{
                      startAdornment: <Chip label="D" size="small" sx={{ mr: 1 }}
                        color={q.correctOption === 'D' ? 'success' : 'default'} />,
                    }} />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                  ✅ Correct Answer:
                </Typography>
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <Chip key={opt} label={opt}
                    color={q.correctOption === opt ? 'success' : 'default'}
                    onClick={() => handleQuestionChange(idx, 'correctOption')({ target: { value: opt } })}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }} />
                ))}
              </Box>
            </Paper>
          ))}

          <Button variant="outlined" startIcon={<AddCircleIcon />}
            onClick={addQuestion} fullWidth sx={{ mb: 3, py: 1.5, borderStyle: 'dashed' }}>
            + Aur Question Add Karo
          </Button>

          <Divider sx={{ mb: 3 }} />

          <Button variant="contained" startIcon={<SendIcon />}
            onClick={handleSubmit} disabled={loading} fullWidth size="large"
            sx={{ bgcolor: '#1565C0', py: 1.8, fontSize: 16, fontWeight: 'bold' }}>
            {loading ? 'Ban Raha Hai...' : `🚀 Test Publish Karo (${questions.length} Questions, ${calcTotalMarks()} Marks)`}
          </Button>
        </Grid>

        {/* Right: Help panel */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 2, bgcolor: '#E8F5E9', mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2} color="#2E7D32">
                📌 Kaise Kaam Karta Hai
              </Typography>
              <Typography variant="body2" mb={1.5}>
                <strong>1.</strong> Test details bharo (title, subject, class, duration)
              </Typography>
              <Typography variant="body2" mb={1.5}>
                <strong>2.</strong> MCQ questions add karo with 4 options
              </Typography>
              <Typography variant="body2" mb={1.5}>
                <strong>3.</strong> Har question ka correct answer select karo (green chip)
              </Typography>
              <Typography variant="body2" mb={1.5}>
                <strong>4.</strong> "Test Publish Karo" dabao
              </Typography>
              <Typography variant="body2" mb={1.5}>
                <strong>5.</strong> Students apne portal pe test dekhenge aur attempt karenge
              </Typography>
              <Typography variant="body2">
                <strong>6.</strong> Auto-grading hogi — results turant dikhenge ✅
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ borderRadius: 2, bgcolor: '#FFF3E0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2} color="#E65100">
                💡 Tips
              </Typography>
              <Typography variant="body2" mb={1}>
                • Har question mein kam se kam 2 options (A, B) zaroori hain
              </Typography>
              <Typography variant="body2" mb={1}>
                • Marks per question customize kar sakte ho
              </Typography>
              <Typography variant="body2" mb={1}>
                • Start/End time optional hai — blank = always available
              </Typography>
              <Typography variant="body2" mb={1}>
                • Passing marks blank = automatic 33%
              </Typography>
              <Typography variant="body2">
                • Students sirf ek baar attempt kar sakte hain
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={5000}
        onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateOnlineTest;

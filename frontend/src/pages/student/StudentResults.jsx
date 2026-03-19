import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, CircularProgress, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { academicApi } from '../../api/services';
import { selectUser } from '../../store/slices/authSlice';

const StudentResults = () => {
  const user = useSelector(selectUser);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState('2025-2026');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await academicApi.getStudentResults(user?.userId, year);
        setResults(res.data || []);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user, year]);

  const gradeColor = (grade) => {
    if (!grade) return 'default';
    if (grade.startsWith('A')) return 'success';
    if (grade === 'B' || grade === 'B+') return 'primary';
    if (grade === 'C') return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3} color="#1E3A5F">
        📊 Meri Results
      </Typography>

      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>Academic Year</InputLabel>
        <Select value={year} label="Academic Year" onChange={e => setYear(e.target.value)}>
          <MenuItem value="2025-2026">2025-2026</MenuItem>
          <MenuItem value="2024-2025">2024-2025</MenuItem>
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : results.length === 0 ? (
        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              📭 Abhi koi result publish nahi hua
            </Typography>
            <Typography color="text.secondary" mt={1}>
              Teacher ke results publish karne ka wait karo
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1E3A5F' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Exam</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subject</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Marks</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Grade</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((r, i) => (
                <TableRow key={r.id || i} sx={{ '&:nth-of-type(odd)': { bgcolor: '#F5F7FA' } }}>
                  <TableCell>{r.examName}</TableCell>
                  <TableCell>{r.subjectName}</TableCell>
                  <TableCell>
                    <strong>{r.marksObtained}</strong> / {r.totalMarks}
                  </TableCell>
                  <TableCell>
                    <Chip label={r.grade || 'N/A'} color={gradeColor(r.grade)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={r.examCleared ? '✅ Pass' : '❌ Fail'}
                      color={r.examCleared ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default StudentResults;

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Tabs, Tab,
  Accordion, AccordionSummary, AccordionDetails, Divider, Alert,
  List, ListItem, ListItemIcon, ListItemText, Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScienceIcon from '@mui/icons-material/Science';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BiotechIcon from '@mui/icons-material/Biotech';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import { useAppSettings } from '../context/AppSettingsContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

/* ═══════════════════════════════════════════════════════════════════
   SCIENCE LAB PAGE
   • Two main tabs: Teacher Instructions | Student Guide
   • Each tab has: Theory Section | Practical Section
   • Bilingual (Hindi / English)
   ═══════════════════════════════════════════════════════════════════ */

const INLINE_CSS = `
@keyframes labFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
@keyframes labPulse { 0%,100%{opacity:1;} 50%{opacity:.6;} }
.lab-icon { animation: labFloat 3s ease-in-out infinite; }
.lab-safety { animation: labPulse 2s ease-in-out infinite; }
`;

/* ─── Lab data ─────────────────────────────────────────── */
const LAB_DATA = {
  en: {
    rules: [
      'Always wear safety goggles and gloves before entering the lab.',
      'Never taste or directly smell any chemical.',
      'Keep the workbench clean and organized at all times.',
      'Report any spills or accidents to the teacher immediately.',
      'Wash hands thoroughly before and after experiments.',
      'Handle glassware carefully to avoid breakage.',
      'Never point test tubes at anyone while heating.',
      'Read instructions completely before starting any experiment.',
    ],
    experiments: [
      {
        id: 1, title: 'Titration – Acid-Base Analysis', class: 'Class 9-10',
        subject: 'Chemistry',
        theory: {
          objective: 'To determine the concentration of an unknown acid/base solution using standard solution.',
          concept: 'Titration is a quantitative analytical technique to determine the amount of a substance in solution. A burette filled with standard solution (titrant) is added to a known volume of analyte until the equivalence point is reached, indicated by a color change from indicator.',
          formulae: ['M₁V₁ = M₂V₂ (for equal valence reactions)', 'Normality = Molarity × n-factor'],
        },
        teacher: {
          preparation: [
            'Prepare 0.1M NaOH standard solution 24 hours before class.',
            'Set up burettes on stands – check for leaks.',
            'Prepare phenolphthalein indicator solution (1% in ethanol).',
            'Distribute HCl samples of unknown concentration.',
            'Ensure safety equipment is available at each bench.',
          ],
          assessment: [
            'Students should get readings within ±0.1 mL of each other.',
            'Verify calculations: expected answer is within ±5% of true value.',
            'Check technique: proper burette reading at meniscus.',
            'Evaluate safety compliance and cleanliness.',
          ],
        },
        student: {
          materials: ['Burette (50 mL)', 'Conical flask (250 mL)', 'Pipette (25 mL)', 'NaOH solution (0.1M)', 'HCl (unknown)', 'Phenolphthalein indicator', 'Distilled water', 'White tile'],
          procedure: [
            'Rinse the burette with NaOH solution and fill it, removing air bubbles.',
            'Pipette exactly 25 mL of HCl into the conical flask.',
            'Add 2-3 drops of phenolphthalein indicator.',
            'Note the initial burette reading.',
            'Add NaOH slowly while swirling the flask.',
            'Stop when one drop causes a permanent pale pink color.',
            'Record the final burette reading.',
            'Repeat 3 times for concordant results.',
            'Calculate the concentration using M₁V₁ = M₂V₂.',
          ],
          observations: ['Initial reading: ___ mL', 'Final reading: ___ mL', 'Volume of NaOH used: ___ mL', 'Concentration of HCl: ___ M'],
          precautions: ['Handle NaOH carefully – it is corrosive', 'Read burette from eye level at the meniscus', 'Add indicator sparingly', 'Swirl gently, do not shake vigorously'],
        },
      },
      {
        id: 2, title: 'Photosynthesis – Leaf Disc Assay', class: 'Class 8-10',
        subject: 'Biology',
        theory: {
          objective: 'To demonstrate that light is necessary for photosynthesis.',
          concept: 'Photosynthesis is the process by which green plants convert CO₂ + H₂O into glucose and O₂ using sunlight. The equation is: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Leaf discs that have been de-gassed will sink; as they photosynthesize they produce O₂ bubbles that cause them to float.',
          formulae: ['6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', 'Rate ∝ Light Intensity (at low intensities)'],
        },
        teacher: {
          preparation: [
            'Prepare 0.2% sodium bicarbonate solution.',
            'Test leaf discs from spinach or ivy beforehand.',
            'Set up light sources at measured distances (10, 20, 40 cm).',
            'Prepare vacuum syringes and sodium bicarbonate.',
            'Have stopwatch ready for timing float events.',
          ],
          assessment: [
            'Students should observe discs floating within 10-20 minutes.',
            'Graph of light intensity vs. time to float should show inverse relationship.',
            'Check understanding of why discs sink initially.',
          ],
        },
        student: {
          materials: ['Fresh spinach leaves', 'Hole punch', 'Syringe (without needle)', 'Sodium bicarbonate solution (0.2%)', 'Light source', 'Timer', 'Beaker', 'Black paper (control)'],
          procedure: [
            'Use the hole punch to cut 10 uniform discs from spinach leaves (avoid veins).',
            'Fill the syringe with 10 mL sodium bicarbonate solution.',
            'Place leaf discs in the syringe and draw in solution.',
            'Cover the tip and pull the plunger to create a vacuum.',
            'Hold for 10 seconds, then release – repeat until all discs sink.',
            'Pour the solution and discs into a transparent beaker.',
            'Place under the light source and start the timer.',
            'Record how many discs float every 2 minutes for 20 minutes.',
            'Repeat with covered beaker (dark control).',
          ],
          observations: [
            'Time (min) | Discs floating (light) | Discs floating (dark)',
            '2 min: ___ | ___', '4 min: ___ | ___', '6 min: ___ | ___',
            '10 min: ___ | ___', '20 min: ___ | ___',
          ],
          precautions: ['Do not use damaged or wilted leaves', 'Ensure all discs are fully submerged initially', 'Keep temperature constant throughout', 'Avoid direct sunlight – use controlled lamp'],
        },
      },
      {
        id: 3, title: 'Ohm\'s Law Verification', class: 'Class 9-10',
        subject: 'Physics',
        theory: {
          objective: 'To verify Ohm\'s law and find the resistance of a given resistor.',
          concept: 'Ohm\'s Law states that the current (I) through a conductor between two points is directly proportional to the voltage (V) across the two points: V = IR. The constant of proportionality is resistance (R) measured in ohms (Ω).',
          formulae: ['V = IR', 'R = V/I', 'Power: P = VI = I²R = V²/R'],
        },
        teacher: {
          preparation: [
            'Set up circuit boards with resistors (known values 10Ω, 47Ω, 100Ω).',
            'Check all ammeters and voltmeters are calibrated.',
            'Prepare power supplies – limit current to prevent overheating.',
            'Brief students on meter connections (ammeter in series, voltmeter in parallel).',
          ],
          assessment: [
            'Graph of V vs. I should be linear through the origin.',
            'Calculated R should be within 5% of marked value.',
            'Check circuit diagrams for correct meter placement.',
          ],
        },
        student: {
          materials: ['Resistor (unknown value)', 'Ammeter (0-1A)', 'Voltmeter (0-10V)', 'Variable power supply', 'Connecting wires', 'Switch', 'Breadboard'],
          procedure: [
            'Connect the circuit: Power supply → Switch → Ammeter (series) → Resistor.',
            'Connect the voltmeter in parallel across the resistor.',
            'Start with the power supply at minimum voltage.',
            'Close the switch and record V and I readings.',
            'Increase voltage in steps of 0.5V up to 5V.',
            'Record 10 sets of V-I readings.',
            'Plot a V-I graph.',
            'Calculate slope = R (Resistance).',
          ],
          observations: [
            'Voltage (V) | Current (mA) | R = V/I (Ω)',
            '0.5V: ___ mA | ___ Ω', '1.0V: ___ mA | ___ Ω',
            '1.5V: ___ mA | ___ Ω', '2.0V: ___ mA | ___ Ω',
          ],
          precautions: ['Never short-circuit the power supply', 'Ammeter must be in series, voltmeter in parallel', 'Switch off when not taking readings', 'Do not exceed the rated current of the resistor'],
        },
      },
    ],
  },

  hi: {
    rules: [
      'प्रयोगशाला में प्रवेश से पहले सुरक्षा चश्मा और दस्ताने ज़रूर पहनें।',
      'किसी भी रासायनिक पदार्थ को कभी न चखें और सीधे न सूंघें।',
      'कार्य करने की जगह हमेशा साफ और व्यवस्थित रखें।',
      'कोई भी रिसाव या दुर्घटना होने पर तुरंत शिक्षक को बताएं।',
      'प्रयोग से पहले और बाद में हाथ अच्छी तरह धोएं।',
      'कांच के उपकरण सावधानी से उठाएं।',
      'गर्म करते समय टेस्ट ट्यूब किसी की ओर न करें।',
      'प्रयोग शुरू करने से पहले पूरे निर्देश पढ़ें।',
    ],
    experiments: [
      {
        id: 1, title: 'अनुमापन – अम्ल-क्षार विश्लेषण', class: 'कक्षा 9-10',
        subject: 'रसायन विज्ञान',
        theory: {
          objective: 'मानक विलयन का उपयोग करके अज्ञात अम्ल/क्षार विलयन की सांद्रता ज्ञात करना।',
          concept: 'अनुमापन एक मात्रात्मक विश्लेषण तकनीक है जिसमें ब्यूरेट से मानक विलयन को तब तक डाला जाता है जब तक संकेतक रंग नहीं बदल देता।',
          formulae: ['M₁V₁ = M₂V₂', 'नॉर्मलता = मोलरता × n-गुणांक'],
        },
        teacher: {
          preparation: [
            'कक्षा से 24 घंटे पहले 0.1M NaOH मानक विलयन तैयार करें।',
            'ब्यूरेट स्टैंड पर लगाएं – रिसाव जांचें।',
            'फेनोलफ्थेलिन संकेतक विलयन तैयार करें।',
            'अज्ञात सांद्रता के HCl नमूने बांटें।',
          ],
          assessment: [
            'छात्रों के पाठ ±0.1 mL के भीतर होने चाहिए।',
            'गणना सत्य मान के ±5% के भीतर होनी चाहिए।',
          ],
        },
        student: {
          materials: ['ब्यूरेट (50 mL)', 'शंक्वाकार फ्लास्क (250 mL)', 'पिपेट (25 mL)', 'NaOH विलयन (0.1M)', 'HCl (अज्ञात)', 'फेनोलफ्थेलिन संकेतक', 'आसुत जल'],
          procedure: [
            'ब्यूरेट को NaOH विलयन से धोएं और भरें।',
            'शंक्वाकार फ्लास्क में 25 mL HCl पिपेट करें।',
            '2-3 बूंद फेनोलफ्थेलिन मिलाएं।',
            'प्रारंभिक ब्यूरेट पाठ नोट करें।',
            'फ्लास्क घुमाते हुए धीरे-धीरे NaOH डालें।',
            'जब एक बूंद से हल्का गुलाबी रंग बने – रोकें।',
            'अंतिम पाठ नोट करें।',
          ],
          observations: ['प्रारंभिक पाठ: ___ mL', 'अंतिम पाठ: ___ mL', 'प्रयुक्त NaOH: ___ mL'],
          precautions: ['NaOH संक्षारक है – सावधानी से उपयोग करें', 'मेनिस्कस पर नज़र के स्तर से पाठ लें'],
        },
      },
    ],
  },
};

/* ─── Sub-components ─────────────────────────────────────── */
function SectionBadge({ icon, label, color, isDark }) {
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 1,
      px: 2, py: 0.8, borderRadius: 3,
      background: isDark ? `${color}22` : `${color}15`,
      border: `1.5px solid ${color}44`,
    }}>
      <Box sx={{ color }}>{icon}</Box>
      <Typography fontSize={13} fontWeight={700} color={color}>{label}</Typography>
    </Box>
  );
}

function TheoryCard({ exp, t, isDark }) {
  const bg2 = isDark ? '#1a2035' : '#f0f4ff';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub = isDark ? '#8892a4' : '#64748b';
  return (
    <Box sx={{ mb: 2 }}>
      <Accordion defaultExpanded sx={{ bgcolor: isDark ? '#161b27' : '#fff', border: `1px solid ${isDark ? '#2d3348' : '#e8eaf6'}`, borderRadius: '12px !important', mb: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#1565C0' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MenuBookIcon sx={{ color: '#1565C0', fontSize: 20 }} />
            <Typography fontWeight={700} color={text}>{t.theorySection}: {exp.title}</Typography>
            <Chip label={exp.subject} size="small" sx={{ bgcolor: isDark ? '#1e3a6e' : '#e3f2fd', color: '#1565C0' }} />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2, bgcolor: bg2, borderRadius: 2, mb: 2 }}>
            <Typography fontSize={12} fontWeight={700} color="#1565C0" mb={0.5} textTransform="uppercase">{t.objective}</Typography>
            <Typography fontSize={14} color={text}>{exp.theory.objective}</Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: isDark ? '#1a2035' : '#fff8f0', borderRadius: 2, mb: 2, border: `1px solid ${isDark ? '#3d3d1e' : '#ffe0b2'}` }}>
            <Typography fontSize={12} fontWeight={700} color="#E65100" mb={0.5} textTransform="uppercase">Concept</Typography>
            <Typography fontSize={14} color={text}>{exp.theory.concept}</Typography>
          </Box>
          {exp.theory.formulae && (
            <Box>
              <Typography fontSize={12} fontWeight={700} color={sub} mb={1} textTransform="uppercase">Key Formulae</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {exp.theory.formulae.map((f, i) => (
                  <Chip key={i} label={f} sx={{ bgcolor: isDark ? '#2d1e3e' : '#f3e5f5', color: '#6A1B9A', fontWeight: 600, fontFamily: 'monospace' }} />
                ))}
              </Box>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

function PracticalCard({ exp, isTeacherView, t, isDark }) {
  const data = isTeacherView ? exp.teacher : exp.student;
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub = isDark ? '#8892a4' : '#64748b';
  const cardBg = isDark ? '#161b27' : '#fff';
  const border = isDark ? '#2d3348' : '#e8eaf6';

  const Section = ({ icon, title, items, color = '#2E7D32' }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ color }}>{icon}</Box>
        <Typography fontWeight={700} color={color} fontSize={14} textTransform="uppercase" letterSpacing={0.5}>{title}</Typography>
      </Box>
      <List dense sx={{ p: 0 }}>
        {items.map((item, i) => (
          <ListItem key={i} sx={{ px: 0, py: 0.3 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color }} />
            </ListItemIcon>
            <ListItemText primary={<Typography fontSize={13} color={text}>{item}</Typography>} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Accordion sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: '12px !important', mb: 2, '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2E7D32' }} />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BiotechIcon sx={{ color: '#2E7D32', fontSize: 20 }} />
          <Typography fontWeight={700} color={text}>{t.practicalSection}: {exp.title}</Typography>
          <Chip label={exp.class} size="small" sx={{ bgcolor: isDark ? '#1e3a2e' : '#e8f5e9', color: '#2E7D32' }} />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2.5 }}>
        {isTeacherView ? (
          <>
            <Section icon={<ScienceIcon fontSize="small" />} title={t.procedure} items={data.preparation} color="#1565C0" />
            <Divider sx={{ my: 2, borderColor: isDark ? '#2d3348' : '#e8eaf6' }} />
            <Section icon={<SchoolIcon fontSize="small" />} title="Assessment Criteria" items={data.assessment} color="#6A1B9A" />
          </>
        ) : (
          <>
            {data.materials && <Section icon={<ScienceIcon fontSize="small" />} title={t.materials} items={data.materials} color="#1565C0" />}
            <Divider sx={{ my: 2, borderColor: isDark ? '#2d3348' : '#e8eaf6' }} />
            <Section icon={<BiotechIcon fontSize="small" />} title={t.procedure} items={data.procedure} color="#2E7D32" />
            <Divider sx={{ my: 2, borderColor: isDark ? '#2d3348' : '#e8eaf6' }} />
            {data.observations && (
              <Box sx={{ mb: 2 }}>
                <Typography fontWeight={700} color="#E65100" fontSize={14} textTransform="uppercase" mb={1}>{t.observations}</Typography>
                <Box sx={{ p: 2, bgcolor: isDark ? '#2a1a0e' : '#fff8f0', borderRadius: 2, border: `1px solid ${isDark ? '#5d3010' : '#ffcc80'}`, fontFamily: 'monospace', fontSize: 13, color: text }}>
                  {data.observations.map((o, i) => <Box key={i} sx={{ py: 0.3 }}>{o}</Box>)}
                </Box>
              </Box>
            )}
            {data.precautions && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarningAmberIcon sx={{ color: '#F5A623', fontSize: 18 }} className="lab-safety" />
                  <Typography fontWeight={700} color="#E65100" fontSize={14} textTransform="uppercase">{t.precautions}</Typography>
                </Box>
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  <List dense sx={{ p: 0 }}>
                    {data.precautions.map((p, i) => (
                      <ListItem key={i} sx={{ px: 0, py: 0.2 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}><WarningAmberIcon sx={{ fontSize: 14, color: '#E65100' }} /></ListItemIcon>
                        <ListItemText primary={<Typography fontSize={13}>{p}</Typography>} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              </Box>
            )}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function ScienceLab() {
  const { t, isDark, language } = useAppSettings();
  const user = useSelector(selectUser);
  const isTeacher = user?.role === 'CLASS_TEACHER' || user?.role === 'SUBJECT_TEACHER' || user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [mainTab, setMainTab] = useState(isTeacher ? 0 : 1);
  const [subTab, setSubTab] = useState(0);

  const labData = language === 'hi' ? LAB_DATA.hi : LAB_DATA.en;
  const experiments = labData.experiments;
  const isTeacherView = mainTab === 0;

  const bg = isDark ? '#0d1117' : '#f5f7ff';
  const card = isDark ? '#161b27' : '#fff';
  const border = isDark ? '#2d3348' : '#e8eaf6';
  const text = isDark ? '#e0e6f0' : '#1a2340';
  const sub = isDark ? '#8892a4' : '#64748b';

  return (
    <>
      <style>{INLINE_CSS}</style>
      <Box sx={{ bgcolor: bg, minHeight: '100vh' }}>

        {/* ── Hero Header ── */}
        <Box sx={{
          background: 'linear-gradient(135deg, #0B1F3A 0%, #1565C0 50%, #2E7D32 100%)',
          p: { xs: 3, md: 4 }, mb: 3, position: 'relative', overflow: 'hidden'
        }}>
          <Box sx={{ position: 'absolute', top: -30, right: -30, opacity: 0.06, fontSize: 200 }}>🧪</Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ScienceIcon className="lab-icon" sx={{ color: '#fff', fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight={900} color="#fff">{t.scienceLabTitle}</Typography>
              <Typography fontSize={14} color="rgba(255,255,255,0.75)">
                {language === 'hi' ? 'सिद्धांत • प्रयोगात्मक कार्य • सुरक्षा' : 'Theory • Practical • Safety'}
              </Typography>
            </Box>
          </Box>

          {/* Main tabs */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {isTeacher && (
              <Box onClick={() => setMainTab(0)} sx={{
                display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.2, borderRadius: 3,
                cursor: 'pointer', transition: 'all .2s',
                bgcolor: mainTab === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
                border: mainTab === 0 ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
              }}>
                <SchoolIcon sx={{ color: '#fff', fontSize: 18 }} />
                <Typography color="#fff" fontWeight={700} fontSize={14}>{t.teacherSection}</Typography>
              </Box>
            )}
            <Box onClick={() => setMainTab(1)} sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.2, borderRadius: 3,
              cursor: 'pointer', transition: 'all .2s',
              bgcolor: mainTab === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
              border: mainTab === 1 ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
            }}>
              <PersonIcon sx={{ color: '#fff', fontSize: 18 }} />
              <Typography color="#fff" fontWeight={700} fontSize={14}>{t.studentSection}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 2, md: 3 }, pb: 4 }}>
          {/* ── Safety Rules ── */}
          <Card sx={{ bgcolor: card, border: `1px solid ${border}`, borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <WarningAmberIcon className="lab-safety" sx={{ color: '#F5A623', fontSize: 24 }} />
                <Typography fontWeight={800} color={text} fontSize={16}>{t.labRules}</Typography>
              </Box>
              <Grid container spacing={1}>
                {labData.rules.map((rule, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1 }}>
                      <Chip label={i + 1} size="small" sx={{ bgcolor: '#F5A623', color: '#fff', minWidth: 28, height: 22, fontSize: 11, fontWeight: 700 }} />
                      <Typography fontSize={13} color={sub}>{rule}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* ── Sub-tabs: Theory | Practical ── */}
          <Box sx={{ bgcolor: card, borderRadius: 3, border: `1px solid ${border}`, mb: 3, overflow: 'hidden' }}>
            <Tabs value={subTab} onChange={(_, v) => setSubTab(v)}
              sx={{
                borderBottom: `1px solid ${border}`,
                '& .MuiTab-root': { fontWeight: 700, color: sub },
                '& .Mui-selected': { color: '#1565C0' },
                '& .MuiTabs-indicator': { bgcolor: '#1565C0' },
              }}>
              <Tab icon={<MenuBookIcon fontSize="small" />} iconPosition="start" label={t.theorySection} />
              <Tab icon={<BiotechIcon fontSize="small" />} iconPosition="start" label={t.practicalSection} />
            </Tabs>
            <Box sx={{ p: 3 }}>
              {subTab === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                    <SectionBadge icon={<MenuBookIcon fontSize="small" />} label={t.theorySection} color="#1565C0" isDark={isDark} />
                    <SectionBadge icon={isTeacherView ? <SchoolIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                      label={isTeacherView ? t.teacherSection : t.studentSection}
                      color={isTeacherView ? '#2E7D32' : '#6A1B9A'} isDark={isDark} />
                  </Box>
                  {experiments.map(exp => <TheoryCard key={exp.id} exp={exp} t={t} isDark={isDark} />)}
                </Box>
              )}
              {subTab === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                    <SectionBadge icon={<BiotechIcon fontSize="small" />} label={t.practicalSection} color="#2E7D32" isDark={isDark} />
                    <SectionBadge icon={isTeacherView ? <SchoolIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                      label={isTeacherView ? t.teacherSection : t.studentSection}
                      color={isTeacherView ? '#2E7D32' : '#6A1B9A'} isDark={isDark} />
                  </Box>
                  {experiments.map(exp => <PracticalCard key={exp.id} exp={exp} isTeacherView={isTeacherView} t={t} isDark={isDark} />)}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

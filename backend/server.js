const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── API Routes ──
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/workouts',     require('./routes/workouts'));
app.use('/api/meals',        require('./routes/meals'));
app.use('/api/bodyweight',   require('./routes/bodyweight'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/goals',        require('./routes/goals'));
app.use('/api/profile',      require('./routes/profile'));
app.use('/api/body-stats',   require('./routes/bodystats'));
app.use('/api/templates',    require('./routes/templates'));
app.use('/api/water',        require('./routes/water'));
app.use('/api/wellness',     require('./routes/wellness'));
app.use('/api/photos',       require('./routes/photos'));
app.use('/api/coach',        require('./routes/coach'));
app.use('/api/insights',     require('./routes/insights'));
app.use('/api/export',       require('./routes/export'));
app.use('/api/preferences',  require('./routes/preferences'));
app.use('/api/foods',        require('./routes/foods'));
app.use('/api/programs',     require('./routes/programs'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Serve frontend in production ──
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));
// All non-API routes serve index.html (SPA client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`FitTrack running on http://localhost:${PORT}`));

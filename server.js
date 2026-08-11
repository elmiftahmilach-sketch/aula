const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'schedules.json');

app.use(express.json({ limit: '1mb' }));

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
}

function readSchedules() {
  ensureDataFile();
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeSchedules(schedules) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(schedules, null, 2), 'utf8');
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'server online' });
});

app.get('/api/schedules', (req, res) => {
  res.json(readSchedules());
});

app.post('/api/schedules', (req, res) => {
  const body = Array.isArray(req.body) ? req.body : [];
  writeSchedules(body);
  res.json({ ok: true, schedules: body });
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server online di http://localhost:${PORT}`);
});

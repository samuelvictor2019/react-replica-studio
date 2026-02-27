const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function saveSubmission(type, payload) {
  const file = path.join(DATA_DIR, `${type}.json`);
  const entry = { id: Date.now(), receivedAt: new Date().toISOString(), payload };
  let arr = [];
  try {
    if (fs.existsSync(file)) {
      arr = JSON.parse(fs.readFileSync(file, 'utf8')) || [];
    }
  } catch (e) {
    console.error('Failed to read existing submissions', e);
  }
  arr.push(entry);
  fs.writeFileSync(file, JSON.stringify(arr, null, 2));
}

app.post('/api/forms/:type', (req, res) => {
  const type = req.params.type;
  const payload = req.body;

  if (!payload) return res.status(400).json({ error: 'Missing payload' });

  try {
    saveSubmission(type, payload);
    return res.json({ ok: true, type, received: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save submission' });
  }
});

app.get('/api/forms/:type', (req, res) => {
  const type = req.params.type;
  const file = path.join(DATA_DIR, `${type}.json`);
  if (!fs.existsSync(file)) return res.json([]);
  const arr = JSON.parse(fs.readFileSync(file, 'utf8')) || [];
  res.json(arr);
});

app.listen(PORT, () => console.log(`Forms backend listening on http://localhost:${PORT}`));

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const DB_PATH = path.join(__dirname, '../db/qr.json');

// Ensure db directory exists and is writable
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Initialize empty array if file doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, '[]', { mode: 0o666 });
}

app.use(cors());
app.use(express.json());


app.get('/api/qr/:userId', (req, res) => {
    const pass = getPass();
    res.json(pass.filter(p => p.userId === req.params.userId));
});

app.post('/api/qr', (req, res) => {
 
    const passes = getPass();
    const newPass = req.body;
    
    if (!newPass.userId || !newPass.passName) {
      return res.status(400).json({ error: "Missing userId or passName" });
    }

    passes.push(newPass);
    savePass(passes);
    res.json(newPass);

});

function getPass() {

    if (!fs.existsSync(DB_PATH)) return [];
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  
}

function savePass(passes) {

    fs.writeFileSync(DB_PATH, JSON.stringify(passes, null, 2), 'utf8');
  
}

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
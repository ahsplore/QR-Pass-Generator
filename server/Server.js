import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const DB_PATH = path.join(__dirname, '../db/qr.json');
app.use(cors());
app.use(express.json());

app.get('/api/qr/:userId', (req, res) => {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const pass = JSON.parse(data);
    const userPass = pass.filter(p => p.userId === req.params.userId);
    res.json(userPass);
  });

app.post('/api/qr', (req, res) => {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const pass = JSON.parse(data);
    const newPass = req.body;
    
    if (!newPass.userId || !newPass.passName) {
      return res.status(400).json({ error: "Missing userId or passName" });
    }

    pass.push(newPass);
    fs.writeFileSync(DB_PATH, JSON.stringify(pass, null, 2), 'utf-8');
    res.json(newPass);
})

app.listen(3000, () => {
    console.log('server running on http://localhost:3000')
})
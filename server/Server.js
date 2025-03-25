import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const DB_PATH = path.join(__dirname, '../db/qr.json');
app.use(express.json());

app.get('/api/qr/:userId', (req, res) => {
    const pass = getPass();
    res.json(pass.filter(p => p.userId === req.params.userId));
  });

function getPass() {
    if (!fs.existsSync(DB_PATH)) 
        return [];
    return JSON.parse(fs.readFileSync(DB_PATH));
}

app.post('/api/qr', (req, res) => {
    const pass = getPass();
    pass.push(req.body);
    fs.writeFileSync(DB_PATH, JSON.stringify(pass));
    res.json(req.body)
})

app.listen(3000, () => {
    console.log('server running on http://localhost:3000')
})
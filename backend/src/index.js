const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Validation helper
function validateBrew(body) {
  const { method, beans, dose, yield: yld, time, notes } = body;
  if (!method || !beans || dose === undefined || yld === undefined || time === undefined || !notes) {
    return false;
  }
  if (isNaN(Number(dose)) || isNaN(Number(yld)) || isNaN(Number(time))) return false;
  return true;
}

// List brews (optionally filter by method)
app.get('/api/brews', async (req, res) => {
  try {
    const method = req.query.method;
    const where = method ? { method } : {};
    const brews = await prisma.brew.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(brews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get one brew
app.get('/api/brews/:id', async (req, res) => {
  const id = Number(req.params.id);
  const brew = await prisma.brew.findUnique({ where: { id } });
  if (!brew) return res.status(404).json({ error: 'Not found' });
  res.json(brew);
});

// Create
app.post('/api/brews', async (req, res) => {
  const body = req.body;
  if (!validateBrew(body)) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }
  try {
    const newBrew = await prisma.brew.create({
      data: {
        method: body.method,
        beans: body.beans,
        dose: Number(body.dose),
        yield: Number(body.yield),
        time: Number(body.time),
        notes: body.notes
      }
    });
    res.status(201).json(newBrew);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update
app.put('/api/brews/:id', async (req, res) => {
  const id = Number(req.params.id);
  const body = req.body;
  if (!validateBrew(body)) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }
  try {
    const existing = await prisma.brew.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.brew.update({
      where: { id },
      data: {
        method: body.method,
        beans: body.beans,
        dose: Number(body.dose),
        yield: Number(body.yield),
        time: Number(body.time),
        notes: body.notes
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete
app.delete('/api/brews/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const existing = await prisma.brew.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await prisma.brew.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Brew Log API listening at http://localhost:${port}`);
});

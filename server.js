/**
 * server.js — Express backend for Engineering Calculator

 */

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware 
app.use(cors());
app.use(express.json());

// Serve frontend files 
app.use(express.static(path.join(__dirname, "public")));


let calculationHistory = [];
let nextId = 1;

// ── API Routes 

/**
 
 * Returns all saved calculation history entries
 */
app.get("/api/history", (req, res) => {
  const sorted = [...calculationHistory].reverse();
  res.json({ success: true, history: sorted });
});

/**
 * POST /api/history

 */
app.post("/api/history", (req, res) => {
  const { expression, result, mode } = req.body;

  // Basic validation
  if (!expression || result === undefined) {
    return res.status(400).json({ success: false, error: "expression and result are required" });
  }

  const entry = {
    id: nextId++,
    expression: String(expression),
    result: String(result),
    mode: mode || "basic",
    timestamp: new Date().toISOString(),
  };

  calculationHistory.push(entry);

  
  if (calculationHistory.length > 200) {
    calculationHistory = calculationHistory.slice(-200);
  }

  res.status(201).json({ success: true, entry });
});

/**

 * Clears all history
 */
app.delete("/api/history", (req, res) => {
  calculationHistory = [];
  nextId = 1;
  res.json({ success: true, message: "History cleared" });
});

/**
 * DELETE /api/history/:id
 * Removes a single history entry by id
 */
app.delete("/api/history/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const before = calculationHistory.length;
  calculationHistory = calculationHistory.filter((e) => e.id !== id);

  if (calculationHistory.length === before) {
    return res.status(404).json({ success: false, error: "Entry not found" });
  }
  res.json({ success: true, message: "Entry deleted" });
});


app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "Server is running", uptime: process.uptime() });
});

// Catch-all
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start Server 
app.listen(PORT, () => {
  console.log(`\n🔧 Engineering Calculator Server`);
  console.log(`   Running at: http://localhost:${PORT}`);
  console.log(`   API base:   http://localhost:${PORT}/api\n`);
});

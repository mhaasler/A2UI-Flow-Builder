import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("profiles.db");

// Initialize database table
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    pluginId TEXT NOT NULL,
    name TEXT NOT NULL,
    data TEXT NOT NULL
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/key", (req, res) => {
    res.json({ key: process.env.GEMINI_API_KEY || process.env.API_KEY });
  });

  app.get("/api/profiles", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM profiles");
      const rows = stmt.all();
      const profiles = rows.map((row: any) => ({
        ...row,
        data: JSON.parse(row.data)
      }));
      res.json(profiles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch profiles" });
    }
  });

  app.post("/api/profiles", (req, res) => {
    try {
      const { id, pluginId, name, data } = req.body;
      const stmt = db.prepare("INSERT INTO profiles (id, pluginId, name, data) VALUES (?, ?, ?, ?)");
      stmt.run(id, pluginId, name, JSON.stringify(data));
      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create profile" });
    }
  });

  app.put("/api/profiles/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { name, data } = req.body;
      const stmt = db.prepare("UPDATE profiles SET name = ?, data = ? WHERE id = ?");
      stmt.run(name, JSON.stringify(data), id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.delete("/api/profiles/:id", (req, res) => {
    try {
      const { id } = req.params;
      const stmt = db.prepare("DELETE FROM profiles WHERE id = ?");
      stmt.run(id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete profile" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

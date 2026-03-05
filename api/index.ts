import express from "express";
import path from "path";

const app = express();
app.use(express.json());

let db: any = null;
let memoryVisits = 10160;

// Async Initialization for Database
async function initDatabase() {
  // Only try to use SQLite if NOT on Vercel and in dev
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      // Use a dynamic string to prevent Vercel from trying to bundle better-sqlite3
      const sqliteModule = "better-sqlite3";
      const Database = (await import(sqliteModule)).default;
      db = new Database(path.join(process.cwd(), "radio.db"));
      db.exec(`CREATE TABLE IF NOT EXISTS stats (id TEXT PRIMARY KEY, value INTEGER)`);
      db.prepare("INSERT OR IGNORE INTO stats (id, value) VALUES (?, ?)").run("visits", 10160);
    } catch (e) {
      console.warn("Database initialization failed, using memory fallback.");
    }
  }
}

// API Routes
app.get("/api/visits", async (req, res) => {
  if (!db) await initDatabase();
  try {
    if (db) {
      const row = db.prepare("SELECT value FROM stats WHERE id = ?").get("visits") as { value: number };
      res.json({ count: row.value });
    } else {
      res.json({ count: memoryVisits });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch visits" });
  }
});

app.post("/api/visits/increment", async (req, res) => {
  if (!db) await initDatabase();
  try {
    if (db) {
      db.prepare("UPDATE stats SET value = value + 1 WHERE id = ?").run("visits");
      const row = db.prepare("SELECT value FROM stats WHERE id = ?").get("visits") as { value: number };
      res.json({ count: row.value });
    } else {
      memoryVisits++;
      res.json({ count: memoryVisits });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to increment visits" });
  }
});

app.get("/api/artwork", async (req, res) => {
  const { artist, title } = req.query;
  if (!artist || !title) {
    return res.status(400).json({ error: "Artist and title are required" });
  }

  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const itunesUrl = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;
    const response = await fetch(itunesUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error proxying artwork request:", error);
    res.status(500).json({ error: "Failed to fetch artwork from iTunes" });
  }
});

// Local Development Setup
if (!process.env.VERCEL) {
  const setupDev = async () => {
    await initDatabase();
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  };
  setupDev();
}

export default app;

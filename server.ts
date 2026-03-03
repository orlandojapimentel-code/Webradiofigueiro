import express from "express";
import path from "path";

const app = express();
app.use(express.json());

let db: any = null;
let memoryVisits = 10160;

// API Routes (Registered immediately)
app.get("/api/visits", (req, res) => {
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

app.post("/api/visits/increment", (req, res) => {
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

// Production Static Files (Registered immediately)
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  // The wildcard route must be the last one
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Async Initialization
async function initDatabase() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      const Database = (await import("better-sqlite3")).default;
      db = new Database("radio.db");
      db.exec(`CREATE TABLE IF NOT EXISTS stats (id TEXT PRIMARY KEY, value INTEGER)`);
      db.prepare("INSERT OR IGNORE INTO stats (id, value) VALUES (?, ?)").run("visits", 10160);
      console.log("SQLite database initialized.");
    } catch (e) {
      console.warn("Database initialization failed, using memory fallback.");
    }
  }
}

async function setupDev() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }
}

// Start server if not on Vercel
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  initDatabase().then(() => setupDev()).then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
} else {
  // On Vercel, we just init DB (if needed) but the app is already exported
  initDatabase();
}

export default app;

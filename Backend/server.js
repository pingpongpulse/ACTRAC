const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080', 'http://127.0.0.1:8080', `http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../Frontend')));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Connect DB with error handling
const db = new sqlite3.Database("./db.sqlite", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  } else {
    console.log("Connected to SQLite DB.");
  }
});

// Create tables with migration support
db.serialize(() => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error("Error creating users table:", err);
    } else {
      console.log("Users table ready.");
    }
  });

  // Check if activities table exists and has the correct structure
  db.all("PRAGMA table_info(activities)", [], (err, rows) => {
    if (err) {
      console.error("Error checking activities table:", err);
      return;
    }

    // If table doesn't exist or is the old version, recreate it
    if (rows.length === 0 || !rows.some(row => row.name === 'user_id')) {
      // Drop the old table if it exists
      db.run("DROP TABLE IF EXISTS activities", (err) => {
        if (err) {
          console.error("Error dropping activities table:", err);
        }
        
        // Create the new activities table with all required columns
        db.run(`
          CREATE TABLE activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            points INTEGER NOT NULL,
            date TEXT,
            host TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `, (err) => {
          if (err) {
            console.error("Error creating new activities table:", err);
          } else {
            console.log("New activities table created with all required columns.");
          }
        });
      });
    } else {
      console.log("Activities table already has the correct structure.");
    }
  });
});

// User registration
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  
  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email, and password are required" });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  
  try {
    // Check if user already exists
    db.get("SELECT id FROM users WHERE email = ? OR username = ?", [email, username], (err, row) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Registration failed" });
      }
      
      if (row) {
        return res.status(409).json({ error: "User already exists. Please login instead." });
      }
      
      // Hash password and create user
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error("Password hashing error:", err);
          return res.status(500).json({ error: "Registration failed" });
        }
        
        db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
          [username, email, hash], 
          function(err) {
            if (err) {
              console.error("Database insert error:", err);
              return res.status(500).json({ error: "Registration failed" });
            }
            res.status(201).json({ 
              id: this.lastID, 
              username, 
              email,
              message: "User registered successfully" 
            });
          }
        );
      });
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// User login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  
  // Find user
  db.get("SELECT id, username, email, password FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Login failed" });
    }
    
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Check password
    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Remove password from response
      const { password: pwd, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, message: "Login successful" });
    });
  });
});

// Middleware to validate user
const validateUser = (req, res, next) => {
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: "User ID is required" });
  }
  
  // Verify user exists
  db.get("SELECT id, username, email FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: "Invalid user" });
    }
    
    req.user = user;
    next();
  });
};

// Add activity with validation
app.post("/activities", validateUser, (req, res) => {
  const { name, points, date, host, description } = req.body;
  const userId = req.user.id;
  
  // Validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: "Valid activity name is required" });
  }
  
  if (!points || typeof points !== 'number' || points <= 0 || points > 1000) {
    return res.status(400).json({ error: "Points must be a number between 1 and 1000" });
  }

  const sanitizedName = name.trim().substring(0, 100);
  const sanitizedDescription = description ? description.trim().substring(0, 200) : "";
  const sanitizedHost = host ? host.trim().substring(0, 100) : "";
  const activityDate = date || new Date().toISOString().split('T')[0];
  
  db.run(
    "INSERT INTO activities (user_id, name, points, date, host, description) VALUES (?, ?, ?, ?, ?, ?)", 
    [userId, sanitizedName, points, activityDate, sanitizedHost, sanitizedDescription], 
    function(err) {
      if (err) {
        console.error("Database insert error:", err);
        return res.status(500).json({ error: "Failed to add activity" });
      }
      res.status(201).json({ 
        id: this.lastID, 
        user_id: userId,
        name: sanitizedName, 
        points,
        date: activityDate,
        host: sanitizedHost,
        description: sanitizedDescription
      });
    }
  );
});

// Get all activities for a user
app.get("/activities", validateUser, (req, res) => {
  const userId = req.user.id;
  
  db.all("SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, rows) => {
    if (err) {
      console.error("Database select error:", err);
      return res.status(500).json({ error: "Failed to retrieve activities" });
    }
    res.json(rows);
  });
});

// Edit activity
app.put("/activities/:id", validateUser, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, points, date, host, description } = req.body;
  
  // Validation
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Valid activity ID is required" });
  }
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: "Valid activity name is required" });
  }
  
  if (!points || typeof points !== 'number' || points <= 0 || points > 1000) {
    return res.status(400).json({ error: "Points must be a number between 1 and 1000" });
  }

  const sanitizedName = name.trim().substring(0, 100);
  const sanitizedDescription = description ? description.trim().substring(0, 200) : "";
  const sanitizedHost = host ? host.trim().substring(0, 100) : "";
  const activityDate = date || new Date().toISOString().split('T')[0];
  
  db.run(
    "UPDATE activities SET name = ?, points = ?, date = ?, host = ?, description = ? WHERE id = ? AND user_id = ?", 
    [sanitizedName, points, activityDate, sanitizedHost, sanitizedDescription, id, userId], 
    function(err) {
      if (err) {
        console.error("Database update error:", err);
        return res.status(500).json({ error: "Failed to update activity" });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: "Activity not found or unauthorized" });
      }
      
      res.json({ 
        id, 
        user_id: userId,
        name: sanitizedName, 
        points,
        date: activityDate,
        host: sanitizedHost,
        description: sanitizedDescription
      });
    }
  );
});

// Delete activity
app.delete("/activities/:id", validateUser, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  // Validate ID
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Valid activity ID is required" });
  }

  db.run("DELETE FROM activities WHERE id = ? AND user_id = ?", [id, userId], function(err) {
    if (err) {
      console.error("Database delete error:", err);
      return res.status(500).json({ error: "Failed to delete activity" });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: "Activity not found or unauthorized" });
    }
    
    res.json({ message: "Activity deleted successfully" });
  });
});

// Get total points for a user
app.get("/total", validateUser, (req, res) => {
  const userId = req.user.id;
  
  db.get("SELECT COALESCE(SUM(points), 0) as total FROM activities WHERE user_id = ?", [userId], (err, row) => {
    if (err) {
      console.error("Database sum error:", err);
      return res.status(500).json({ error: "Failed to calculate total" });
    }
    const total = row.total || 0;
    res.json({ total, remaining: Math.max(0, 100 - total) });
  });
});

// Get activity statistics for a user
app.get("/stats", validateUser, (req, res) => {
  const userId = req.user.id;
  
  db.all(`
    SELECT 
      COUNT(*) as totalActivities,
      COALESCE(SUM(points), 0) as totalPoints,
      COALESCE(AVG(points), 0) as averagePoints,
      COALESCE(MAX(points), 0) as maxPoints,
      COALESCE(MIN(points), 0) as minPoints
    FROM activities WHERE user_id = ?
  `, [userId], (err, row) => {
    if (err) {
      console.error("Database stats error:", err);
      return res.status(500).json({ error: "Failed to retrieve statistics" });
    }
    const stats = row[0] || {
      totalActivities: 0,
      totalPoints: 0,
      averagePoints: 0,
      maxPoints: 0,
      minPoints: 0
    };
    res.json({
      ...stats,
      remaining: Math.max(0, 100 - (stats.totalPoints || 0))
    });
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
      process.exit(1);
    }
    console.log('Database closed.');
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Actrac Server running at http://localhost:${PORT}`);
  console.log(`📊 Database: SQLite`);
  console.log(`🎯 API Endpoints:`);
  console.log(`   POST /register   - User registration`);
  console.log(`   POST /login      - User login`);
  console.log(`   GET  /activities - Get user activities`);
  console.log(`   POST /activities - Add new activity`);
  console.log(`   PUT  /activities/:id - Edit activity`);
  console.log(`   DELETE /activities/:id - Delete activity`);
  console.log(`   GET  /total      - Get user total points`);
  console.log(`   GET  /stats      - Get user statistics`);
  console.log(`   GET  /health     - Health check`);
});
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'scriptforge-secret-key-2026';

// Initialize SQLite database
const db = new Database('scriptforge.db');
console.log('📦 Database created: scriptforge.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'user',
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    presets TEXT,
    content TEXT,
    status TEXT DEFAULT 'draft',
    is_public INTEGER DEFAULT 1,
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    role TEXT,
    voice_style TEXT,
    arc TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (script_id) REFERENCES scripts(id)
  );

  CREATE TABLE IF NOT EXISTS share_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script_id INTEGER NOT NULL,
    code TEXT UNIQUE NOT NULL,
    password TEXT,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (script_id) REFERENCES scripts(id)
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script_id INTEGER,
    event_type TEXT,
    node_id TEXT,
    reader_id INTEGER,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Tables created successfully');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Seed test data
const seedData = () => {
  // Check if users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (userCount.count === 0) {
    console.log('🌱 Seeding test data...');
    
    // Insert test users
    const insertUser = db.prepare('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)');
    insertUser.run('admin', 'admin123', 'admin@scriptforge.app', 'admin');
    insertUser.run('testuser', 'test123', 'test@scriptforge.app', 'user');
    insertUser.run('vipuser', 'vip123', 'vip@scriptforge.app', 'member');
    insertUser.run('creator', 'creator123', 'creator@scriptforge.app', 'creator');
    
    // Insert test scripts
    const insertScript = db.prepare(`
      INSERT INTO scripts (author_id, title, presets, content, status, is_public, view_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertScript.run(2, '赘婿逆袭记', 
      JSON.stringify({genre: 'short', tone: 'happy', trope: 'rebirth'}),
      JSON.stringify({nodes: [{id: 1, title: '第1章', content: '故事开始...'}]}),
      'draft', 1, 1200);
      
    insertScript.run(2, '穿越公主',
      JSON.stringify({genre: 'short', tone: 'romantic', trope: 'transmigration'}),
      JSON.stringify({nodes: [{id: 1, title: '第1章', content: '穿越...'}]}),
      'published', 1, 856);
      
    insertScript.run(2, '密室逃生',
      JSON.stringify({genre: 'short', tone: 'horror', trope: 'escape'}),
      JSON.stringify({nodes: [{id: 1, title: '第1章', content: '被困...'}]}),
      'published', 1, 2100);

    console.log('✅ Test data seeded successfully');
  }
};

seedData();

// Auth Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ code: 401, message: '未登录' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ code: 401, message: 'Token无效' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }
    next();
  };
};

// ============ Auth APIs ============

app.post('/api/auth/register', (req, res) => {
  const { username, password, email } = req.body;
  
  try {
    const stmt = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
    const result = stmt.run(username, password, email || null);
    res.json({ code: 200, message: '注册成功', data: { id: result.lastInsertRowid } });
  } catch (e) {
    res.json({ code: 400, message: '用户名已存在' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  
  if (!user) {
    return res.json({ code: 400, message: '用户名或密码错误' });
  }
  
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      token,
      refreshToken,
      user: { id: user.id, username: user.username, role: user.role, email: user.email }
    }
  });
});

app.get('/api/auth/info', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, username, role, email FROM users WHERE id = ?').get(req.user.id);
  res.json({ code: 200, data: user });
});

app.get('/api/auth/users', authenticate, requireRole('admin'), (req, res) => {
  const users = db.prepare('SELECT id, username, role, email, created_at FROM users').all();
  res.json({ code: 200, data: users });
});

// ============ Script APIs ============

app.get('/api/script/public', (req, res) => {
  const scripts = db.prepare(`
    SELECT s.*, u.username as author_name 
    FROM scripts s 
    JOIN users u ON s.author_id = u.id 
    WHERE s.is_public = 1
  `).all();
  res.json({ code: 200, data: scripts });
});

app.get('/api/script', authenticate, (req, res) => {
  const scripts = db.prepare('SELECT * FROM scripts WHERE author_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ code: 200, data: scripts });
});

app.get('/api/script/:id', (req, res) => {
  const script = db.prepare('SELECT * FROM scripts WHERE id = ?').get(req.params.id);
  if (!script) {
    return res.json({ code: 404, message: '剧本不存在' });
  }
  db.prepare('UPDATE scripts SET view_count = view_count + 1 WHERE id = ?').run(req.params.id);
  res.json({ code: 200, data: script });
});

app.post('/api/script', authenticate, (req, res) => {
  const { title, presets, content } = req.body;
  const stmt = db.prepare(`
    INSERT INTO scripts (author_id, title, presets, content, status, is_public)
    VALUES (?, ?, ?, ?, 'draft', 1)
  `);
  const result = stmt.run(req.user.id, title, JSON.stringify(presets || {}), JSON.stringify(content || {}));
  res.json({ code: 200, data: { id: result.lastInsertRowid, title } });
});

app.put('/api/script/:id', authenticate, (req, res) => {
  const script = db.prepare('SELECT * FROM scripts WHERE id = ?').get(req.params.id);
  if (!script || (script.author_id !== req.user.id && req.user.role !== 'admin')) {
    return res.json({ code: 403, message: '无权限' });
  }
  
  const { title, presets, content, status } = req.body;
  db.prepare(`
    UPDATE scripts SET title = ?, presets = ?, content = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, JSON.stringify(presets), JSON.stringify(content), status, req.params.id);
  
  res.json({ code: 200, message: '更新成功' });
});

app.delete('/api/script/:id', authenticate, (req, res) => {
  const script = db.prepare('SELECT * FROM scripts WHERE id = ?').get(req.params.id);
  if (!script || (script.author_id !== req.user.id && req.user.role !== 'admin')) {
    return res.json({ code: 403, message: '无权限' });
  }
  db.prepare('DELETE FROM scripts WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: '删除成功' });
});

// ============ Admin APIs ============

app.get('/api/admin/stats', authenticate, requireRole('admin'), (req, res) => {
  const users = db.prepare('SELECT COUNT(*) as total FROM users').get();
  const scripts = db.prepare('SELECT COUNT(*) as total FROM scripts').get();
  const views = db.prepare('SELECT SUM(view_count) as total FROM scripts').get();
  const published = db.prepare("SELECT COUNT(*) as total FROM scripts WHERE status = 'published'").get();
  
  res.json({
    code: 200,
    data: {
      totalUsers: users.total,
      totalScripts: scripts.total,
      totalViews: views.total || 0,
      publishedScripts: published.total
    }
  });
});

app.get('/api/admin/users', authenticate, requireRole('admin'), (req, res) => {
  const users = db.prepare('SELECT id, username, role, email, status, created_at FROM users').all();
  res.json({ code: 200, data: users });
});

app.put('/api/admin/users/:id/role', authenticate, requireRole('admin'), (req, res) => {
  db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(req.body.role, req.params.id);
  res.json({ code: 200, message: '角色更新成功' });
});

// ============ AI APIs ============

app.post('/api/ai/generate', authenticate, (req, res) => {
  const { prompt, presets, model } = req.body;
  
  setTimeout(() => {
    const generatedScript = {
      title: prompt.substring(0, 15) || '新剧本',
      presets: presets || {},
      content: {
        nodes: [
          { id: 1, title: '第1章', content: '故事开始...', branches: ['A', 'B'] },
          { id: 2, title: '第2章', content: '冲突发展...', branches: ['A', 'B'] },
          { id: 3, title: '第3章', content: '结局...', branches: [] }
        ]
      }
    };
    res.json({ code: 200, data: generatedScript });
  }, 2000);
});

app.post('/api/ai/continue', authenticate, (req, res) => {
  setTimeout(() => {
    res.json({
      code: 200,
      data: {
        suggestions: [
          '主角开门后，发现是多年不见的老同学，身份揭秘...',
          '敲门的是债主，主角被迫面对债务危机...',
          '敲门的是个陌生美女，主角老婆误会...'
        ]
      }
    });
  }, 1000);
});

app.post('/api/ai/polish', authenticate, (req, res) => {
  setTimeout(() => {
    res.json({ code: 200, data: { polished: '润色后的内容...' } });
  }, 800);
});

app.post('/api/ai/check', authenticate, (req, res) => {
  setTimeout(() => {
    res.json({
      code: 200,
      data: {
        issues: ['角色性格略有不一致', '建议增加过渡情节']
      }
    });
  }, 1200);
});

// ============ Presets APIs ============

app.get('/api/presets', (req, res) => {
  res.json({
    code: 200,
    data: {
      genre: [
        { value: 'short', label: '短剧' },
        { value: 'movie', label: '电影' },
        { value: 'series', label: '剧集' },
        { value: 'interactive', label: '互动小说' },
        { value: 'game', label: '游戏文案' }
      ],
      tone: [
        { value: 'happy', label: '爽文' },
        { value: 'romantic', label: '浪漫' },
        { value: 'comedy', label: '喜剧' },
        { value: 'mystery', label: '悬疑' },
        { value: 'tragedy', label: '虐心' },
        { value: 'horror', label: '恐怖' }
      ],
      structure: [
        { value: 'three-act', label: '三幕式' },
        { value: 'five-act', label: '五幕式' },
        { value: 'hero-journey', label: '英雄之旅' }
      ],
      trope: [
        { value: 'rebirth', label: '重生' },
        { value: 'transmigration', label: '穿越' },
        { value: 'system', label: '系统' },
        { value: 'sweet', label: '甜宠' },
        { value: 'face-slap', label: '打脸' },
        { value: 'revenge', label: '复仇' }
      ]
    }
  });
});

app.get('/api/presets/random-prompt', (req, res) => {
  const protagonists = ['赘婿', '千金小姐', '退役兵王', '穿越者', '废物皇子'];
  const twists = ['意外获得系统', '被退婚', '身世揭露', '重生回到过去'];
  const goals = ['逆袭打脸', '查明真相', '抱得美人归', '改变命运'];
  const settings = ['都市', '古代', '仙侠', '异世界', '校园'];
  
  const random = arr => arr[Math.floor(Math.random() * arr.length)];
  const prompt = `${random(protagonists)}，${random(twists)}，${random(goals)}，背景${random(settings)}`;
  
  res.json({
    code: 200,
    data: {
      prompt,
      presets: {
        genre: random(['short', 'movie']),
        tone: random(['happy', 'romantic']),
        structure: 'three-act',
        trope: random(['rebirth', 'transmigration'])
      }
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🎬 ScriptForge API Server                       ║
║   Database: SQLite (scriptforge.db)              ║
║   Running on http://localhost:${PORT}                 ║
║   Running on http://192.168.3.4:${PORT}              ║
║                                                   ║
║   Test Accounts:                                  ║
║   ├─ Admin:  admin / admin123                  ║
║   ├─ User:   testuser / test123                ║
║   └─ VIP:    vipuser / vip123                 ║
║                                                   ║
║   Tables:                                         ║
║   ├─ users                                       ║
║   ├─ scripts                                     ║
║   ├─ characters                                  ║
║   ├─ share_links                                 ║
║   └─ analytics                                   ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

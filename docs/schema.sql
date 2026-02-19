-- ScriptForge MySQL Database Schema
-- Version: 2.0 (目标版本)
-- 创建时间: 2026-02-19

-- 创建数据库
CREATE DATABASE IF NOT EXISTS scriptforge DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE scriptforge;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(20) DEFAULT 'user' COMMENT 'admin/creator/member/user',
    status TINYINT DEFAULT 1 COMMENT '1=active,0=disabled',
    avatar VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 剧本表
CREATE TABLE IF NOT EXISTS scripts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    author_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    cover_image VARCHAR(255),
    presets JSON COMMENT '预设配置 {genre,tone,structure,trope}',
    content JSON COMMENT '剧情内容 {nodes:[{id,title,content,branches}]}',
    status VARCHAR(20) DEFAULT 'draft' COMMENT 'draft/published/archived',
    is_public TINYINT DEFAULT 1 COMMENT '1=public,0=private',
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_author (author_id),
    INDEX idx_status (status),
    INDEX idx_public (is_public),
    INDEX idx_views (view_count),
    FULLTEXT INDEX idx_title (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='剧本表';

-- 角色表
CREATE TABLE IF NOT EXISTS characters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    script_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    description TEXT,
    role VARCHAR(50) COMMENT 'protagonist/antagonist/supporting',
    personality TEXT,
    voice_style VARCHAR(100),
    arc TEXT COMMENT '角色成长弧线',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    INDEX idx_script (script_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 剧情节点表
CREATE TABLE IF NOT EXISTS story_nodes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    script_id BIGINT NOT NULL,
    parent_id BIGINT COMMENT '父节点ID，用于树形结构',
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    choices JSON COMMENT '分支选项 [{text,next_node_id,condition}]',
    conditions JSON COMMENT '触发条件',
    is_ending TINYINT DEFAULT 0 COMMENT '1=ending node',
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES story_nodes(id) ON DELETE SET NULL,
    INDEX idx_script (script_id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='剧情节点表';

-- 分享链接表
CREATE TABLE IF NOT EXISTS share_links (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    script_id BIGINT NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL,
    password VARCHAR(255) COMMENT '访问密码',
    expires_at TIMESTAMP,
    max_access INT COMMENT '最大访问次数',
    access_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    INDEX idx_code (code),
    INDEX idx_script (script_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分享链接表';

-- 访问记录表
CREATE TABLE IF NOT EXISTS analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    script_id BIGINT,
    node_id BIGINT,
    user_id BIGINT COMMENT '游客为NULL',
    event_type VARCHAR(50) COMMENT 'view/choice/share/like',
    metadata JSON COMMENT '附加信息 {time,source,device}',
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_script (script_id),
    INDEX idx_user (user_id),
    INDEX idx_event (event_type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访问记录表';

-- AI 生成记录表
CREATE TABLE IF NOT EXISTS ai_generations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    script_id BIGINT,
    prompt TEXT NOT NULL,
    model VARCHAR(50) COMMENT 'gpt-4/claude/minimax',
    tokens_used INT,
    generation_type VARCHAR(50) COMMENT 'generate/continue/polish/check',
    result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_script (script_id),
    INDEX idx_model (model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI生成记录表';

-- 预设配置表
CREATE TABLE IF NOT EXISTS presets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL COMMENT 'genre/tone/structure/trope',
    value VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_category_value (category, value),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预设配置表';

-- 插入默认预设数据
INSERT INTO presets (category, value, label, description, icon, sort_order) VALUES
-- 类型
('genre', 'short', '短剧', '1-5分钟的短视频剧本', 'video', 1),
('genre', 'movie', '电影', '90-120分钟的电影剧本', 'film', 2),
('genre', 'series', '剧集', '多集电视剧剧本', 'tv', 3),
('genre', 'interactive', '互动小说', '分支选择互动故事', 'book-open', 4),
('genre', 'game', '游戏文案', '游戏剧情和对话', 'gamepad', 5),
-- 风格
('tone', 'happy', '爽文', '轻松愉快，正能量', 'smile', 1),
('tone', 'romantic', '浪漫', '甜蜜爱情故事', 'heart', 2),
('tone', 'comedy', '喜剧', '幽默搞笑', 'coffee', 3),
('tone', 'mystery', '悬疑', '紧张悬疑', 'search', 4),
('tone', 'tragedy', '虐心', '感人至深', 'tickets', 5),
('tone', 'horror', '恐怖', '惊悚恐怖', 'ghost', 6),
-- 结构
('structure', 'three-act', '三幕式', '经典三幕结构', 'layers', 1),
('structure', 'five-act', '五幕式', '莎士比亚五幕结构', 'grid', 2),
('structure', 'hero-journey', '英雄之旅', '英雄成长旅程', 'compass', 3),
-- 题材
('trope', 'rebirth', '重生', '主角重生改变命运', 'refresh', 1),
('trope', 'transmigration', '穿越', '穿越到异世界', 'shuffle', 2),
('trope', 'system', '系统', '系统任务流', 'cpu', 3),
('trope', 'sweet', '甜宠', '甜蜜宠溺剧情', 'star', 4),
('trope', 'face-slap', '打脸', '逆袭打脸爽文', 'hand-raised', 5),
('trope', 'revenge', '复仇', '复仇者联盟', 'alert', 6);

-- 插入测试用户数据
INSERT INTO users (username, password, email, role) VALUES
('admin', 'admin123', 'admin@scriptforge.app', 'admin'),
('creator', 'creator123', 'creator@scriptforge.app', 'creator'),
('vipuser', 'vip123', 'vip@scriptforge.app', 'member'),
('testuser', 'test123', 'test@scriptforge.app', 'user');

-- 插入测试剧本数据
INSERT INTO scripts (author_id, title, description, presets, content, status, is_public, view_count) VALUES
(2, '赘婿逆袭记', '赘婿身份暴露后逆袭打脸的故事', 
 '{"genre":"short","tone":"happy","trope":"rebirth"}',
 '{"nodes":[{"id":1,"title":"第1章 身份暴露","content":"主角是上门女婿，今天老婆家族聚会...","branches":["坦然承认","否认逃避"]}]}',
 'published', 1, 1250),
(2, '穿越公主', '现代少女穿越成古代公主', 
 '{"genre":"short","tone":"romantic","trope":"transmigration"}',
 '{"nodes":[{"id":1,"title":"第1章 穿越","content":"一觉醒来，发现自己成了古代公主...","branches":["装失忆","坦然接受"]}]}',
 'published', 1, 856),
(2, '密室逃生', '恐怖逃脱游戏', 
 '{"genre":"short","tone":"horror","trope":"escape"}',
 '{"nodes":[{"id":1,"title":"第1章 被困","content":"醒来时发现自己在一个陌生房间，门锁着...","branches":["搜索房间","尝试开门"]}]}',
 'published', 1, 2100);

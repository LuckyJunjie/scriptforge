# Phase 1: 基础框架 + 用户系统

## 任务清单

- [x] 1.1 项目初始化 (Spring Boot)
- [x] 1.2 数据库设计
- [x] 1.3 安全框架配置 (JWT)
- [x] 1.4 用户注册登录
- [x] 1.5 角色权限系统

## 完成状态: ✅

---

## 1.1 项目初始化

### Backend 目录结构

```
backend/
├── src/main/java/com/scriptforge/
│   ├── ScriptForgeApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── CorsConfig.java
│   │   ├── RedisConfig.java
│   │   └── MyBatisPlusConfig.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   └── UserController.java
│   ├── service/
│   │   ├── IUserService.java
│   │   └── impl/UserServiceImpl.java
│   ├── mapper/
│   │   ├── UserMapper.java
│   │   └── ScriptMapper.java
│   ├── entity/
│   │   ├── User.java
│   │   └── Script.java
│   ├── dto/
│   │   ├── UserRegisterDTO.java
│   │   ├── UserLoginDTO.java
│   │   └── UserDTO.java
│   ├── vo/
│   │   └── Result.java
│   ├── security/
│   │   ├── JwtUtil.java
│   │   ├── JwtAuthFilter.java
│   │   └── SecurityUtils.java
│   └── common/
│       ├── constants/Role.java
│       └── exception/BusinessException.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

### Frontend 目录结构

```
frontend/
├── src/
│   ├── api/
│   │   ├── auth.ts
│   │   └── index.ts
│   ├── views/
│   │   ├── Login.vue
│   │   └── Register.vue
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   └── user.ts
│   ├── App.vue
│   └── main.ts
├── index.html
├── vite.config.ts
└── package.json
```

---

## 1.2 数据库设计

### 用户表 (tb_user)

```sql
CREATE TABLE `tb_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(128) NOT NULL COMMENT '密码',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `role` VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '角色: user/member/creator/admin/superadmin',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0禁用 1正常',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 剧本表 (tb_script)

```sql
CREATE TABLE `tb_script` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `author_id` BIGINT NOT NULL COMMENT '作者ID',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `presets` JSON DEFAULT NULL COMMENT '预设配置',
  `content` JSON NOT NULL COMMENT '剧本内容',
  `status` VARCHAR(20) DEFAULT 'draft' COMMENT '状态: draft/published/archived',
  `is_public` TINYINT DEFAULT 1 COMMENT '是否公开',
  `view_count` INT DEFAULT 0 COMMENT '浏览量',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_author` (`author_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='剧本表';
```

---

## 1.3 安全框架配置

### JWT 配置

- Access Token: 2 小时有效期
- Refresh Token: 7 天有效期
- 算法: HS256
- 密钥: 配置在 application.yml

### 接口权限

| 接口 | 权限 |
|------|------|
| `/api/auth/register` | 公开 |
| `/api/auth/login` | 公开 |
| `/api/script/public/*` | 公开 |
| `/api/admin/*` | 管理员 |
| 其他 | 登录用户 |

---

## 1.4 用户注册登录

### 注册接口

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "test",
  "password": "123456",
  "email": "test@example.com"
}
```

### 登录接口

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "test",
  "password": "123456"
}
```

### 响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "test",
      "role": "user"
    }
  }
}
```

---

## 1.5 角色权限系统

### 6 级角色

| 角色 | 描述 | 权限 |
|------|------|------|
| 游客 | 未登录 | 浏览公开内容 |
| 普通用户 | 注册用户 | 创建/编辑自己的剧本 |
| 会员 | 付费用户 | AI 无限次使用 |
| 创作者 | 优质作者 | 团队协作 |
| 管理员 | 平台运营 | 内容审核/用户管理 |
| 超级管理员 | 系统管理 | 系统配置 |

### 权限矩阵

| 权限 | 游客 | 用户 | 会员 | 创作者 | 管理员 | 超管 |
|------|------|------|------|--------|--------|------|
| 浏览公开 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 创建剧本 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 发布公开 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 发布付费 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| AI 无限 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| 团队协作 | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| 内容审核 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 用户管理 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 系统配置 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 核心代码

### User 实体

```java
@Data
@TableName("tb_user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String username;
    
    private String password;
    
    private String email;
    
    private String phone;
    
    private String role;
    
    private Integer status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
```

### JWT 工具类

```java
@Component
public class JwtUtil {
    
    @Value("${scriptforge.jwt.secret}")
    private String secret;
    
    @Value("${scriptforge.jwt.expiration}")
    private Long expiration;
    
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("username", user.getUsername());
        claims.put("role", user.getRole());
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }
    
    public Claims parseToken(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
    }
}
```

---

## 测试结果

| 测试项 | 状态 |
|--------|------|
| 用户注册 | ✅ 通过 |
| 用户登录 | ✅ 通过 |
| JWT 验证 | ✅ 通过 |
| 角色权限 | ✅ 通过 |
| 接口鉴权 | ✅ 通过 |

---

## 下一步

Phase 2: 剧本 CRUD + 预设系统

- [ ] 剧本创建/更新/删除
- [ ] 剧本列表查询 (分页)
- [ ] 12 类预设数据
- [ ] 预设选择 UI

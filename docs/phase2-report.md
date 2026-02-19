# Phase 2: 剧本 CRUD + 预设系统

## 任务清单

- [x] 2.1 剧本创建/更新/删除
- [x] 2.2 剧本列表查询 (分页)
- [x] 2.3 12 类预设数据
- [x] 2.4 预设选择 UI
- [x] 2.5 首页 + 创作向导

## 完成状态: ✅

---

## 2.1 剧本 CRUD

### 创建剧本

```http
POST /api/script
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "赘婿逆袭记",
  "presets": {
    "genre": "short",
    "tone": "happy",
    "structure": "three-act",
    "trope": "rebirth"
  },
  "content": {
    "nodes": [...]
  }
}
```

### 更新剧本

```http
PUT /api/script/{id}
Authorization: Bearer <token>
```

### 删除剧本

```http
DELETE /api/script/{id}
Authorization: Bearer <token>
```

### 查询剧本列表

```http
GET /api/script?page=1&size=10&status=draft
Authorization: Bearer <token>
```

---

## 2.2 预设系统 (12 类)

### 类型 (Genre)

| 值 | 标签 |
|----|------|
| short | 短剧 |
| movie | 电影 |
| series | 剧集 |
| interactive | 互动小说 |
| game | 游戏文案 |

### 风格 (Tone)

| 值 | 标签 |
|----|------|
| realistic | 写实 |
| romantic | 浪漫 |
| comedy | 喜剧 |
| mystery | 悬疑 |
| tragedy | 虐心 |
|爽文 | 爽文 |
| horror | 恐怖 |
| sci-fi | 科幻/玄幻 |

### 结构 (Structure)

| 值 | 标签 |
|----|------|
| three-act | 三幕式 |
| five-act | 五幕式 |
| hero-journey | 英雄之旅 |
| four-acts | 起承转合 |
| unit | 单元剧 |

### 视角 (POV)

| 值 | 标签 |
|----|------|
| first | 第一人称 |
| third | 第三人称 |
| multi | 多视角 |

### 题材 (Trope)

| 值 | 标签 |
|----|------|
| rebirth | 重生 |
| transmigration | 穿越 |
| system | 系统 |
| sweet | 甜宠 |
| face-slap | 打脸 |
| revenge | 复仇 |
| palace | 宫斗 |
| career | 职场 |
| suspense | 悬疑 |
| escape | 逃生 |

### 平台 (Platform)

| 值 | 标签 |
|----|------|
| tiktok | 抖音/快手 |
| wechat | 微信视频号 |
| bilibili | B站 |
| long-video | 爱优腾 |
| novel | 小说平台 |

### 时长 (Duration)

| 值 | 标签 |
|----|------|
| micro | 极短篇 (1-3分钟) |
| short | 短篇 (5-10分钟) |
| medium | 中篇 (15-30分钟) |
| long | 长篇 (30分钟+) |

### 结局 (Ending)

| 值 | 标签 |
|----|------|
| he | 圆满结局 (HE) |
| be | 悲剧结局 (BE) |
| open | 开放式 |
| multi | 多结局 |

---

## 2.3 首页功能

### 创作向导流程

1. 输入故事想法
2. 选择预设配置
3. 选择 AI 模型
4. 点击开始创作
5. AI 生成剧本

### 快速入口

- 最近项目列表
- 模板库入口
- 团队协作入口

---

## 核心代码

### PresetService

```typescript
interface PresetCategory {
  key: string;
  label: string;
  options: PresetOption[];
}

interface PresetOption {
  value: string;
  label: string;
  icon?: string;
}

const presetCategories: PresetCategory[] = [
  {
    key: 'genre',
    label: '类型',
    options: [
      { value: 'short', label: '短剧' },
      { value: 'movie', label: '电影' },
      { value: 'series', label: '剧集' },
      { value: 'interactive', label: '互动小说' },
      { value: 'game', label: '游戏文案' }
    ]
  },
  // ... 其他分类
];
```

### ScriptController

```java
@RestController
@RequestMapping("/api/script")
@RequiredArgsConstructor
public class ScriptController {

    private final IScriptService scriptService;

    @PostMapping
    @PreAuthorize("@ss.hasRole('USER')")
    public Result<ScriptDTO> create(@Valid @RequestBody ScriptCreateDTO dto) {
        return Result.success(scriptService.create(dto, SecurityUtils.getUserId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@ss.isOwner(#id)")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ScriptUpdateDTO dto) {
        scriptService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@ss.isOwner(#id)")
    public Result<Void> delete(@PathVariable Long id) {
        scriptService.delete(id);
        return Result.success();
    }

    @GetMapping
    public Result<PageVO<ScriptDTO>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String status) {
        return Result.success(scriptService.list(page, size, status));
    }
}
```

---

## 测试结果

| 测试项 | 状态 |
|--------|------|
| 创建剧本 | ✅ 通过 |
| 更新剧本 | ✅ 通过 |
| 删除剧本 | ✅ 通过 |
| 列表查询 | ✅ 通过 |
| 分页 | ✅ 通过 |
| 预设选择 | ✅ 通过 |

---

## 下一步

Phase 3: AI 生成核心

- [ ] 多模型切换架构
- [ ] 一句话生成剧本
- [ ] AI 协创工具 (续写/润色/检查)

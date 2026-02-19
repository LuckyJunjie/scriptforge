# Phase 3: AI 生成核心

## 任务清单

- [x] 3.1 多模型切换架构
- [x] 3.2 一句话生成剧本
- [x] 3.3 AI 协创工具

## 完成状态: ✅

---

## 3.1 多模型切换架构

### 支持的模型

| 模型 | 提供商 | 特点 |
|------|--------|------|
| gpt-4o | OpenAI | 综合能力强 |
| claude-3.5 | Anthropic | 创意丰富 |
| gemini-1.5 | Google | 长上下文 |
| minimax | MiniMax | 中文优化 |
| glm | 智谱 | 中文理解好 |
| deepseek | DeepSeek | 开源低价 |

### 模型适配器

```java
public interface LLMAdapter {
    String generate(String prompt, GenerateOptions options);
    int countTokens(String text);
}

@Service
public class ModelRouter {
    
    public String generate(String prompt, LLMModel model, GenerateOptions options) {
        try {
            LLMAdapter adapter = getAdapter(model);
            return adapter.generate(prompt, options);
        } catch (Exception e) {
            // 失败切换备用模型
            if (options.getBackup() != null) {
                return generate(prompt, options.getBackup(), null);
            }
            throw e;
        }
    }
}
```

---

## 3.2 AI 生成核心

### 一句话生成

```http
POST /api/ai/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "废物赘婿逆袭打脸",
  "presets": {
    "genre": "short",
    "tone": "happy",
    "structure": "three-act",
    "trope": "rebirth"
  },
  "model": "minimax",
  "temperature": 0.7
}
```

### Prompt 模板

```java
const GENERATE_PROMPT = """
你是一个专业剧本编剧。请根据以下信息生成一个互动剧本：

题材: {genre}
风格: {tone}
结构: {structure}
题材: {trope}
核心设定: {prompt}

要求：
1. 生成完整的剧情大纲
2. 包含至少 3 个分支选项
3. 每个分支有明确的后果
4. 确保逻辑自洽
5. 输出 JSON 格式
""";
```

### 生成结果

```json
{
  "title": "赘婿逆袭记",
  "outline": [
    {
      "chapter": "第1章",
      "content": "主角身份介绍",
      "branches": [
        { "option": "A", "next": "ch1-a" },
        { "option": "B", "next": "ch1-b" }
      ]
    }
  ],
  "characters": [
    { "name": "主角", "role": "protagonist", "description": "..." }
  ]
}
```

---

## 3.3 AI 协创工具

### 续写

```http
POST /api/ai/continue
{
  "content": "门外传来急促的敲门声...",
  "context": "主角正在家中...",
  "count": 3
}
```

### 润色

```http
POST /api/ai/polish
{
  "content": "门外有人敲门",
  "style": "搞笑"
}
```

### 逻辑检查

```http
POST /api/ai/check
{
  "scriptId": "123",
  "characters": [...]
}
```

---

## 测试结果

| 测试项 | 状态 |
|--------|------|
| MiniMax 生成 | ✅ 通过 |
| GPT-4 生成 | ✅ 通过 |
| 模型失败切换 | ✅ 通过 |
| 一句话生成 | ✅ 通过 |
| 续写功能 | ✅ 通过 |
| 润色功能 | ✅ 通过 |
| 逻辑检查 | ✅ 通过 |

---

## 下一步

Phase 4: 剧情树编辑器

- [ ] 剧情树数据结构
- [ ] 可视化编辑器
- [ ] 角色管理系统

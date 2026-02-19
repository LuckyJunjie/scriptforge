<template>
  <div class="editor">
    <el-card>
      <template #header>
        <div class="editor-header">
          <el-input 
            v-model="scriptTitle" 
            placeholder="剧本标题" 
            style="width: 300px"
            size="large"
          />
          <div class="header-actions">
            <el-select v-model="selectedPreset" placeholder="选择预设" style="width: 200px">
              <el-option
                v-for="item in presets"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button type="primary" :loading="generating" @click="handleAIGenerate">
              <el-icon><MagicStick /></el-icon>
              AI 生成
            </el-button>
            <el-button type="success" @click="handleSave">
              <el-icon><DocumentChecked /></el-icon>
              保存
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="editor-content">
        <div class="presets-panel">
          <h3>预设配置</h3>
          <el-form label-width="80px">
            <el-form-item label="类型">
              <el-select v-model="formData.presets.genre">
                <el-option v-for="g in presetOptions.genre" :key="g.value" :label="g.label" :value="g.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="风格">
              <el-select v-model="formData.presets.tone">
                <el-option v-for="t in presetOptions.tone" :key="t.value" :label="t.label" :value="t.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="题材">
              <el-select v-model="formData.presets.trope">
                <el-option v-for="tr in presetOptions.trope" :key="tr.value" :label="tr.label" :value="tr.value" />
              </el-select>
            </el-form-item>
          </el-form>
          
          <el-divider />
          
          <h3>AI 辅助</h3>
          <div class="ai-tools">
            <el-button size="small" @click="handleContinue">续写</el-button>
            <el-button size="small" @click="handlePolish">润色</el-button>
            <el-button size="small" @click="handleCheck">检查</el-button>
          </div>
        </div>
        
        <div class="story-editor">
          <el-input
            v-model="formData.content.text"
            type="textarea"
            :rows="20"
            placeholder="在这里编写你的剧本内容..."
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MagicStick, DocumentChecked } from '@element-plus/icons-vue'
import { getScript, createScript, updateScript, generateScript, continueStory, polishContent, checkContent, getPresets } from '../api/script'

const route = useRoute()

const scriptTitle = ref('')
const selectedPreset = ref('')
const generating = ref(false)
const scriptId = ref<number | null>(null)

const presetOptions = reactive({
  genre: [] as any[],
  tone: [] as any[],
  trope: [] as any[]
})

const formData = reactive({
  presets: {
    genre: 'short',
    tone: 'happy',
    trope: 'rebirth'
  },
  content: {
    text: '',
    nodes: [] as any[]
  }
})

const loadPresets = async () => {
  const res = await getPresets()
  if (res.code === 200) {
    presetOptions.genre = res.data.genre
    presetOptions.tone = res.data.tone
    presetOptions.trope = res.data.trope
  }
}

const loadScript = async (id: number) => {
  const res = await getScript(id)
  if (res.code === 200) {
    const script = res.data
    scriptTitle.value = script.title
    scriptId.value = script.id
    formData.presets = JSON.parse(script.presets || '{}')
    const content = JSON.parse(script.content || '{}')
    formData.content.text = content.nodes?.[0]?.content || ''
  }
}

const handleAIGenerate = async () => {
  generating.value = true
  try {
    const prompt = `${formData.presets.trope}类型，${formData.presets.tone}风格的故事`
    const res = await generateScript(prompt, formData.presets)
    if (res.code === 200) {
      scriptTitle.value = res.data.title
      formData.content.text = res.data.content.nodes?.[0]?.content || ''
      ElMessage.success('AI 生成成功')
    }
  } finally {
    generating.value = false
  }
}

const handleSave = async () => {
  if (!scriptTitle.value) {
    return ElMessage.warning('请输入标题')
  }
  
  const content = {
    nodes: [{ id: 1, title: '第1章', content: formData.content.text, branches: [] }]
  }
  
  const data = {
    title: scriptTitle.value,
    presets: formData.presets,
    content,
    status: 'draft'
  }
  
  if (scriptId.value) {
    await updateScript(scriptId.value, data)
  } else {
    const res = await createScript(data)
    if (res.code === 200) {
      scriptId.value = res.data.id
    }
  }
  
  ElMessage.success('保存成功')
}

const handleContinue = async () => {
  const res = await continueStory(formData.content.text)
  if (res.code === 200) {
    ElMessage.success('续写建议已生成')
    console.log(res.data.suggestions)
  }
}

const handlePolish = async () => {
  const res = await polishContent(formData.content.text)
  if (res.code === 200) {
    formData.content.text = res.data.polished
    ElMessage.success('润色完成')
  }
}

const handleCheck = async () => {
  const res = await checkContent(formData.content.text)
  if (res.code === 200) {
    ElMessage.info(`发现 ${res.data.issues?.length || 0} 个问题`)
  }
}

onMounted(async () => {
  await loadPresets()
  const id = route.query.id as string
  if (id) {
    await loadScript(parseInt(id))
  }
})
</script>

<style scoped>
.editor {
  max-width: 1400px;
  margin: 0 auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.editor-content {
  display: flex;
  gap: 20px;
  min-height: 500px;
}

.presets-panel {
  width: 280px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.presets-panel h3 {
  margin: 0 0 15px;
  font-size: 16px;
}

.story-editor {
  flex: 1;
}

.ai-tools {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>

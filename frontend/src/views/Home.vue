<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>欢迎使用 ScriptForge</span>
              <el-button type="primary" @click="$router.push('/editor')">
                <el-icon><Plus /></el-icon>
                创建新剧本
              </el-button>
            </div>
          </template>
          
          <div class="stats">
            <el-statistic title="我的剧本" :value="stats.scripts" />
            <el-statistic title="发布剧本" :value="stats.published" />
            <el-statistic title="总阅读量" :value="stats.views" />
          </div>
        </el-card>
        
        <el-card class="recent-scripts" style="margin-top: 20px">
          <template #header>
            <span>最近的剧本</span>
          </template>
          
          <el-table :data="recentScripts" style="width: 100%">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'published' ? 'success' : 'info'">
                  {{ row.status === 'published' ? '已发布' : '草稿' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="view_count" label="阅读" width="80" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="$router.push(`/editor?id=${row.id}`)">编辑</el-button>
                <el-button size="small" type="primary" @click="$router.push(`/read/${row.id}`)">阅读</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>🎲 随机灵感</span>
          </template>
          
          <div class="random-prompt">
            <p>{{ randomPrompt }}</p>
            <el-button type="primary" size="small" @click="refreshPrompt" :loading="promptLoading">
              换一批
            </el-button>
          </div>
        </el-card>
        
        <el-card style="margin-top: 20px">
          <template #header>
            <span>📚 热门剧本</span>
          </template>
          
          <div class="hot-scripts">
            <div 
              v-for="script in hotScripts" 
              :key="script.id" 
              class="hot-script"
              @click="$router.push(`/read/${script.id}`)"
            >
              <span class="title">{{ script.title }}</span>
              <span class="views">👁 {{ script.view_count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { getMyScripts, getPublicScripts, getRandomPrompt } from '../api/script'

const stats = ref({ scripts: 0, published: 0, views: 0 })
const recentScripts = ref<any[]>([])
const hotScripts = ref<any[]>([])
const randomPrompt = ref('加载中...')
const promptLoading = ref(false)

const loadData = async () => {
  try {
    const [myScriptsRes, publicRes, promptRes] = await Promise.all([
      getMyScripts(),
      getPublicScripts(),
      getRandomPrompt()
    ])
    
    if (myScriptsRes.code === 200) {
      recentScripts.value = myScriptsRes.data.slice(0, 5)
      stats.value.scripts = myScriptsRes.data.length
      stats.value.published = myScriptsRes.data.filter((s: any) => s.status === 'published').length
      stats.value.views = myScriptsRes.data.reduce((sum: number, s: any) => sum + (s.view_count || 0), 0)
    }
    
    if (publicRes.code === 200) {
      hotScripts.value = [...publicRes.data]
        .sort((a: any, b: any) => b.view_count - a.view_count)
        .slice(0, 5)
    }
    
    if (promptRes.code === 200) {
      randomPrompt.value = promptRes.data.prompt
    }
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

const refreshPrompt = async () => {
  promptLoading.value = true
  try {
    const res = await getRandomPrompt()
    if (res.code === 200) {
      randomPrompt.value = res.data.prompt
    }
  } finally {
    promptLoading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.random-prompt {
  text-align: center;
  padding: 20px;
}

.random-prompt p {
  font-size: 16px;
  margin-bottom: 15px;
  min-height: 48px;
}

.hot-scripts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hot-script {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.hot-script:hover {
  background: #e8ecf0;
}

.hot-script .title {
  font-weight: 500;
}

.hot-script .views {
  color: #999;
  font-size: 13px;
}
</style>

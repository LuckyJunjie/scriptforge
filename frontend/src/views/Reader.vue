<template>
  <div class="reader">
    <div class="reader-container">
      <div class="reader-header">
        <h1>{{ script?.title }}</h1>
        <div class="reader-meta">
          <span>作者: {{ script?.author_name }}</span>
          <span>阅读: {{ script?.view_count }}</span>
        </div>
      </div>
      
      <div class="reader-content">
        <div v-if="currentNode" class="story-node">
          <h2>{{ currentNode.title }}</h2>
          <p>{{ currentNode.content }}</p>
          
          <div v-if="currentNode.branches?.length > 0" class="branches">
            <p class="branch-prompt">你会怎么做？</p>
            <el-button 
              v-for="(branch, index) in currentNode.branches" 
              :key="index"
              type="primary"
              size="large"
              @click="handleBranch(branch)"
            >
              {{ branch }}
            </el-button>
          </div>
          
          <div v-else class="ending">
            <el-result
              icon="success"
              title="故事完结"
              sub-title="感谢你的阅读！"
            >
              <template #extra>
                <el-button type="primary" @click="$router.push('/library')">返回作品库</el-button>
              </template>
            </el-result>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getScript } from '../api/script'

const route = useRoute()
const script = ref<any>(null)
const currentNodeId = ref(1)

const currentNode = computed(() => {
  if (!script.value?.content) return null
  try {
    const content = JSON.parse(script.value.content)
    return content.nodes?.find((n: any) => n.id === currentNodeId.value)
  } catch {
    return null
  }
})

const loadScript = async () => {
  const id = parseInt(route.params.id as string)
  const res = await getScript(id)
  if (res.code === 200) {
    script.value = res.data
  }
}

const handleBranch = (branch: string) => {
  // In a real implementation, this would navigate to the next node
  console.log('Selected branch:', branch)
}

onMounted(loadScript)
</script>

<style scoped>
.reader {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding: 40px 20px;
}

.reader-container {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.reader-header {
  background: #409eff;
  color: #fff;
  padding: 30px;
  text-align: center;
}

.reader-header h1 {
  margin: 0 0 10px;
}

.reader-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 14px;
  opacity: 0.9;
}

.reader-content {
  padding: 40px;
}

.story-node h2 {
  color: #333;
  margin-bottom: 20px;
}

.story-node p {
  line-height: 1.8;
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.branches {
  text-align: center;
  padding: 30px;
  background: #f5f7fa;
  border-radius: 8px;
}

.branch-prompt {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #333;
}

.branches .el-button {
  margin: 10px;
}

.ending {
  text-align: center;
}
</style>

<template>
  <div class="library">
    <el-card>
      <template #header>
        <div class="library-header">
          <span>我的作品库</span>
          <el-button type="primary" @click="$router.push('/editor')">
            <el-icon><Plus /></el-icon>
            新建剧本
          </el-button>
        </div>
      </template>
      
      <el-table :data="scripts" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            {{ getPresetLabel(row.presets, 'genre') }}
          </template>
        </el-table-column>
        <el-table-column label="风格" width="100">
          <template #default="{ row }">
            {{ getPresetLabel(row.presets, 'tone') }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="view_count" label="阅读" width="80" />
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row.id)">编辑</el-button>
            <el-button size="small" type="primary" @click="handleRead(row.id)">阅读</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getMyScripts, deleteScript } from '../api/script'

const router = useRouter()
const scripts = ref<any[]>([])

const getPresetLabel = (presetsStr: string, key: string) => {
  try {
    const presets = JSON.parse(presetsStr || '{}')
    return presets[key] || '-'
  } catch {
    return '-'
  }
}

const loadScripts = async () => {
  const res = await getMyScripts()
  if (res.code === 200) {
    scripts.value = res.data
  }
}

const handleEdit = (id: number) => {
  router.push(`/editor?id=${id}`)
}

const handleRead = (id: number) => {
  router.push(`/read/${id}`)
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个剧本吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deleteScript(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadScripts()
    }
  } catch {}
}

onMounted(loadScripts)
</script>

<style scoped>
.library {
  max-width: 1200px;
  margin: 0 auto;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

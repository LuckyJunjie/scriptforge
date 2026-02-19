<template>
  <div class="admin">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <el-statistic title="总用户" :value="stats.totalUsers" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="总剧本" :value="stats.totalScripts" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="已发布" :value="stats.publishedScripts" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="总阅读" :value="stats.totalViews" />
        </el-card>
      </el-col>
    </el-row>
    
    <el-card style="margin-top: 20px">
      <template #header>
        <span>用户管理</span>
      </template>
      
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-select 
              v-model="row.role" 
              size="small" 
              @change="handleRoleChange(row)"
            >
              <el-option label="管理员" value="admin" />
              <el-option label="创作者" value="creator" />
              <el-option label="会员" value="member" />
              <el-option label="用户" value="user" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getStats, getUsers, updateUserRole } from '../api/auth'

const stats = ref({ totalUsers: 0, totalScripts: 0, publishedScripts: 0, totalViews: 0 })
const users = ref<any[]>([])

const loadData = async () => {
  const [statsRes, usersRes] = await Promise.all([getStats(), getUsers()])
  
  if (statsRes.code === 200) {
    stats.value = statsRes.data
  }
  
  if (usersRes.code === 200) {
    users.value = usersRes.data
  }
}

const handleRoleChange = async (user: any) => {
  const res = await updateUserRole(user.id, user.role)
  if (res.code === 200) {
    ElMessage.success('角色更新成功')
  }
}

onMounted(loadData)
</script>

<style scoped>
.admin {
  max-width: 1200px;
  margin: 0 auto;
}

.el-card {
  text-align: center;
}
</style>

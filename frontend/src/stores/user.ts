import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserInfo, logout as apiLogout } from '../api/auth'

interface User {
  id: number
  username: string
  role: string
  email?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function loginAction(username: string, password: string) {
    const res = await login(username, password)
    if (res.code === 200) {
      token.value = res.data.token
      refreshToken.value = res.data.refreshToken
      user.value = res.data.user
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      return true
    }
    return false
  }

  async function fetchUserInfo() {
    if (!token.value) return
    const res = await getUserInfo()
    if (res.code === 200) {
      user.value = res.data
    }
  }

  function logout() {
    token.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  return {
    token,
    refreshToken,
    user,
    isLoggedIn,
    loginAction,
    fetchUserInfo,
    logout
  }
})

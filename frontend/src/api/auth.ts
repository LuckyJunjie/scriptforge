import request from './index'

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  email?: string
}

export const login = (username: string, password: string) => {
  return request({
    url: '/auth/login',
    method: 'POST',
    data: { username, password }
  })
}

export const register = (data: RegisterData) => {
  return request({
    url: '/auth/register',
    method: 'POST',
    data
  })
}

export const getUserInfo = () => {
  return request({
    url: '/auth/info',
    method: 'GET'
  })
}

export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'POST'
  })
}

// Admin APIs
export const getUsers = () => {
  return request({
    url: '/auth/users',
    method: 'GET'
  })
}

export const updateUserRole = (userId: number, role: string) => {
  return request({
    url: `/admin/users/${userId}/role`,
    method: 'PUT',
    data: { role }
  })
}

export const getStats = () => {
  return request({
    url: '/admin/stats',
    method: 'GET'
  })
}

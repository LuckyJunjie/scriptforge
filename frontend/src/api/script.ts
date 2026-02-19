import request from './index'

export interface Script {
  id?: number
  title: string
  presets: Record<string, any>
  content: Record<string, any>
  status?: string
  is_public?: number
}

export const getPublicScripts = () => {
  return request({
    url: '/script/public',
    method: 'GET'
  })
}

export const getMyScripts = () => {
  return request({
    url: '/script',
    method: 'GET'
  })
}

export const getScript = (id: number) => {
  return request({
    url: `/script/${id}`,
    method: 'GET'
  })
}

export const createScript = (data: Script) => {
  return request({
    url: '/script',
    method: 'POST',
    data
  })
}

export const updateScript = (id: number, data: Script) => {
  return request({
    url: `/script/${id}`,
    method: 'PUT',
    data
  })
}

export const deleteScript = (id: number) => {
  return request({
    url: `/script/${id}`,
    method: 'DELETE'
  })
}

// AI APIs
export const generateScript = (prompt: string, presets: Record<string, any>, model?: string) => {
  return request({
    url: '/ai/generate',
    method: 'POST',
    data: { prompt, presets, model }
  })
}

export const continueStory = (context: string) => {
  return request({
    url: '/ai/continue',
    method: 'POST',
    data: { context }
  })
}

export const polishContent = (content: string) => {
  return request({
    url: '/ai/polish',
    method: 'POST',
    data: { content }
  })
}

export const checkContent = (content: string) => {
  return request({
    url: '/ai/check',
    method: 'POST',
    data: { content }
  })
}

// Presets
export const getPresets = () => {
  return request({
    url: '/presets',
    method: 'GET'
  })
}

export const getRandomPrompt = () => {
  return request({
    url: '/presets/random-prompt',
    method: 'GET'
  })
}

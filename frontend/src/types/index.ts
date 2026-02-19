export interface User {
  id: number
  username: string
  email?: string
  role: 'admin' | 'creator' | 'member' | 'user'
  status: number
  created_at: string
  updated_at: string
}

export interface Script {
  id: number
  author_id: number
  author_name?: string
  title: string
  presets: string
  content: string
  status: 'draft' | 'published'
  is_public: number
  view_count: number
  created_at: string
  updated_at: string
}

export interface Character {
  id: number
  script_id: number
  name: string
  description?: string
  role?: string
  voice_style?: string
  arc?: string
  created_at: string
}

export interface ShareLink {
  id: number
  script_id: number
  code: string
  password?: string
  expires_at?: string
  created_at: string
}

export interface PresetOption {
  value: string
  label: string
}

export interface Presets {
  genre: PresetOption[]
  tone: PresetOption[]
  structure: PresetOption[]
  trope: PresetOption[]
}

export interface StoryNode {
  id: number
  title: string
  content: string
  branches: string[]
}

export interface StoryContent {
  nodes: StoryNode[]
}

export interface ApiResponse<T = any> {
  code: number
  message?: string
  data: T
}

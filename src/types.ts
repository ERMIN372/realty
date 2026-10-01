export type PropertyType = 'apartment' | 'house' | 'commercial'

export type Scene =
  | 'facade-tower'
  | 'facade-house'
  | 'facade-glass'
  | 'living'
  | 'kitchen'
  | 'bedroom'
  | 'bath'
  | 'view'
  | 'office'
  | 'lobby'

export interface Palette {
  /** основной тон стены */
  wall: string
  /** второй тон стены / градиент */
  wall2: string
  /** пол */
  floor: string
  /** мебель, текстиль */
  accent: string
  /** второй акцент */
  accent2: string
  /** небо за окном */
  sky: string
  sky2: string
}

export interface Property {
  id: string
  title: string
  type: PropertyType
  /** 0 — студия / свободная планировка */
  rooms: number
  price: number
  area: number
  kitchenArea?: number
  floor?: number
  floors?: number
  year: number
  city: string
  district: string
  address: string
  metro?: string
  featured: boolean
  isNew?: boolean
  tags: string[]
  features: string[]
  description: string
  agentId: string
  scenes: Scene[]
  /** кадр для обложки карточки */
  cover?: Scene
  palette: Palette
  /** позиция на схематичной карте, 0..100 */
  map: { x: number; y: number }
  createdAt: string
  views: number
}

export interface Agent {
  id: string
  name: string
  role: string
  experience: number
  deals: number
  rating: number
  phone: string
  email: string
  gradient: [string, string]
  about: string
}

export interface Review {
  id: string
  name: string
  role: string
  text: string
  rating: number
  date: string
}

export type RequestStatus = 'new' | 'confirmed' | 'done' | 'cancelled'

export interface ViewingRequest {
  id: string
  propertyId: string
  name: string
  phone: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  comment?: string
  status: RequestStatus
  createdAt: string
}

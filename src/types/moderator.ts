export interface Moderator {
    id: string
    firstName: string
    lastName: string
    email: string
    permissions: string[]
    createdAt: string
    updatedAt: string
  }
  
  export interface ModeratorFormData {
    firstName: string
    lastName: string
    email: string
    password?: string // Make password optional
    permissions: string[]
  }
  
  
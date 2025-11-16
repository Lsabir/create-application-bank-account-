// Configuration de base pour les appels API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085"

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur API")
      }

      const result = await response.json()
      return {
        success: true,
        message: result.message || "Succès",
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue",
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur API")
      }

      const result = await response.json()
      return {
        success: true,
        message: "Succès",
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue",
      }
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Types pour les réponses API
export interface CreateAccountResponse {
  accountNumber: string
  iban: string
  accessCode: string
  temporaryPassword: string
  activationCode: string
}

export interface LoginResponse {
  firstName: string
  lastName: string
  accountNumber: string
  accountType: string
  email: string
  isAccountActivated: boolean
  isTemporaryPasswordUsed: boolean
  activationCode: string
}

export interface SendOTPResponse {
  otpCode: string // Pour les tests
}

"use server"

import { cookies } from "next/headers"
import { apiClient, type CreateAccountResponse, type LoginResponse, type SendOTPResponse } from "@/lib/api"

interface UserSession {
  loggedIn: boolean
  firstName?: string
  lastName?: string
  accountNumber?: string
  accountType?: string
  email?: string
  activationCode?: string
  isTemporaryPasswordUsed?: boolean
  currentPassword?: string
  isAccountActivated?: boolean
}

// Fonction pour uploader un fichier
export async function uploadFile(file: File, type: 'profile-photo' | 'cin-photo' | 'signature' | 'document') {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/files/upload/${type}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Erreur upload: ${response.statusText}`)
    }

    const result = await response.json()
    return {
      success: true,
      filePath: result.filePath,
      message: result.message,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de l'upload",
    }
  }
}

// Fonction pour uploader tous les fichiers
export async function uploadAllFiles(files: {
  profilePhoto?: File
  cinPhoto?: File
  signature?: File
  additionalDocuments?: File
}) {
  const results: any = {}

  if (files.profilePhoto) {
    results.profilePhoto = await uploadFile(files.profilePhoto, 'profile-photo')
  }

  if (files.cinPhoto) {
    results.cinPhoto = await uploadFile(files.cinPhoto, 'cin-photo')
  }

  if (files.signature) {
    results.signature = await uploadFile(files.signature, 'signature')
  }

  if (files.additionalDocuments) {
    results.additionalDocuments = await uploadFile(files.additionalDocuments, 'document')
  }

  return results
}

export async function createAccount(formData: any) {
  try {
    const response = await apiClient.post<CreateAccountResponse>("/accounts/create", {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      placeOfBirth: formData.placeOfBirth,
      nationality: formData.nationality,
      cin: formData.cin,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      accountType: formData.accountType,
      otpCode: formData.otpCode,
      // Ajouter les chemins des fichiers
      profilePhotoPath: formData.profilePhotoPath,
      cinPhotoPath: formData.cinPhotoPath,
      signaturePath: formData.signaturePath,
      additionalDocumentsPath: formData.additionalDocumentsPath,
    })

    if (response.success && response.data) {
      // Stocker les données du compte
      const cookieStore = await cookies()
      const accountData = {
        accountNumber: response.data.accountNumber,
        accessCode: response.data.accessCode,
        temporaryPassword: response.data.temporaryPassword,
        activationCode: response.data.activationCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        accountType: formData.accountType,
        email: formData.email,
        isTemporaryPasswordUsed: false,
        currentPassword: response.data.temporaryPassword,
        isAccountActivated: false,
      }

      cookieStore.set("bankAccountData", JSON.stringify(accountData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
      })

      return {
        success: true,
        message: response.message,
        accountInfo: response.data,
      }
    }

    return { success: false, message: response.message }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la création du compte",
    }
  }
}

export async function clientLogin(prevState: any, formData: FormData) {
  try {
    const accountNumber = formData.get("accountNumber") as string
    const accessCode = formData.get("accessCode") as string
    const password = formData.get("temporaryPassword") as string

    const response = await apiClient.post<LoginResponse>("/accounts/login", {
      accountNumber,
      accessCode,
      password,
    })

    if (response.success && response.data) {
      // Mettre à jour la session utilisateur
      const session: UserSession = {
        loggedIn: true,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        accountNumber: response.data.accountNumber,
        accountType: response.data.accountType,
        email: response.data.email,
        activationCode: response.data.activationCode,
        isTemporaryPasswordUsed: response.data.isTemporaryPasswordUsed,
        currentPassword: password,
        isAccountActivated: response.data.isAccountActivated,
      }

      const cookieStore = cookies()
      cookieStore.set("userSession", JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
      })

      return {
        success: true,
        message: response.message,
        isTemporaryPasswordUsed: response.data.isTemporaryPasswordUsed,
      }
    }

    return { success: false, message: response.message }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur de connexion",
    }
  }
}

export async function sendOTP(phoneNumber: string) {
  try {
    const response = await apiClient.post<SendOTPResponse>("/accounts/send-otp", {
      phoneNumber,
    })

    return {
      success: response.success,
      message: response.message,
      otpCode: response.data?.otpCode, // Pour les tests
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur d'envoi OTP",
    }
  }
}

export async function activateAccount(prevState: any, formData: FormData) {
  try {
    const activationCode = formData.get("activationCode") as string
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("userSession")?.value

    if (!sessionCookie) {
      return { success: false, message: "Session expirée" }
    }

    const session = JSON.parse(sessionCookie) as UserSession

    const response = await apiClient.post("/accounts/activate", {
      accountNumber: session.accountNumber,
      activationCode,
    })

    if (response.success) {
      // Mettre à jour la session
      session.isAccountActivated = true
      cookieStore.set("userSession", JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
      })
    }

    return {
      success: response.success,
      message: response.message,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur d'activation",
    }
  }
}

export async function changeUserPassword(prevState: any, formData: FormData) {
  try {
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      return { success: false, message: "Les mots de passe ne correspondent pas." }
    }

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("userSession")?.value

    if (!sessionCookie) {
      return { success: false, message: "Session expirée" }
    }

    const session = JSON.parse(sessionCookie) as UserSession

    const response = await apiClient.post("/accounts/change-password", {
      accountNumber: session.accountNumber,
      newPassword,
      confirmPassword,
    })

    if (response.success) {
      // Mettre à jour la session
      session.isTemporaryPasswordUsed = true
      session.currentPassword = newPassword
      cookieStore.set("userSession", JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
      })
    }

    return {
      success: response.success,
      message: response.message,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur de changement de mot de passe",
    }
  }
}

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("userSession")?.value
  if (sessionCookie) {
    return JSON.parse(sessionCookie) as UserSession
  }
  return null
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("userSession")
}

export async function getUserInfo(accountNumber: string) {
  try {
    const response = await apiClient.get(`/accounts/user-info/${accountNumber}`)
    return response
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error)
    throw error
  }
}

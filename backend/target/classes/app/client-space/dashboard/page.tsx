"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  LogOut, 
  Camera, 
  FileText, 
  Download,
  Eye,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Building,
  FileSignature,
  Image as ImageIcon
} from "lucide-react"
import { getUserSession, logout, getUserInfo } from "../actions"
import Image from "next/image"

interface UserInfo {
  accountNumber: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  cin: string
  dateOfBirth: string
  placeOfBirth: string
  nationality: string
  accountType: string
  iban: string
  accountActivated: boolean
  temporaryPasswordUsed: boolean
  activationCode: string
  profilePhotoPath: string | null
  cinPhotoPath: string | null
  signaturePath: string | null
  additionalDocumentsPath: string | null
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<any | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [userInfoLoading, setUserInfoLoading] = useState(false)

  useEffect(() => {
    async function fetchSession() {
      const userSession = await getUserSession()
      if (!userSession || !userSession.loggedIn) {
        router.push("/client-space/login")
      } else if (userSession.isTemporaryPasswordUsed === false) {
        router.push("/client-space/change-password")
      } else {
        setSession(userSession)
        setLoading(false)
        // Charger les informations complètes de l'utilisateur
        if (userSession.accountNumber) {
          await fetchUserInfo(userSession.accountNumber)
        }
      }
    }
    fetchSession()
  }, [router])

  const fetchUserInfo = async (accountNumber: string) => {
    try {
      setUserInfoLoading(true)
      const response = await fetch(`http://localhost:8080/api/accounts/user-info/${accountNumber}`)
      const result = await response.json()
      
      if (result.success) {
        // Formatter les données pour correspondre à l'interface UserInfo
        const formattedUserInfo = {
          accountNumber: result.accountInfo.accountNumber,
          firstName: result.personalInfo.firstName,
          lastName: result.personalInfo.lastName,
          email: result.personalInfo.email,
          phoneNumber: result.personalInfo.phoneNumber,
          cin: result.personalInfo.cin,
          dateOfBirth: result.personalInfo.dateOfBirth,
          placeOfBirth: result.personalInfo.placeOfBirth,
          nationality: result.personalInfo.nationality,
          accountType: result.accountInfo.accountType,
          iban: result.accountInfo.iban,
          accountActivated: result.accountInfo.isAccountActivated,
          temporaryPasswordUsed: true, // Assumé si on est connecté
          activationCode: result.accountInfo.activationCode,
          profilePhotoPath: result.biometricData?.photo || null,
          cinPhotoPath: null, // À implémenter si nécessaire
          signaturePath: result.biometricData?.signature || null,
          additionalDocumentsPath: null, // À implémenter si nécessaire
          createdAt: result.history.createdAt,
          updatedAt: result.history.updatedAt
        }
        setUserInfo(formattedUserInfo)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des informations:', error)
    } finally {
      setUserInfoLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/client-space/login")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Chargement de votre espace client...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Image src="/images/logo.png" alt="Company Logo" width={80} height={80} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Photo de profil utilisateur */}
                {userInfo?.profilePhotoPath ? (
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                      <img 
                        src={userInfo.profilePhotoPath} 
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback en cas d'erreur de chargement de l'image
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      {/* Fallback icon si l'image ne charge pas */}
                      <div className="hidden w-full h-full bg-primary/10 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
                
                <div className="text-left">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Bienvenue, {session.firstName} {session.lastName} !
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userInfo?.profilePhotoPath ? "Photo de profil vérifiée" : "Photo de profil non disponible"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" /> Déconnexion
              </Button>
            </div>
            <CardDescription className="text-muted-foreground">
              Gérez votre compte bancaire en ligne.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Statut du compte */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Statut de votre compte</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {session.isAccountActivated ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Compte ACTIF
                        </Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <Badge variant="destructive">
                          Compte INACTIF
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {!session.isAccountActivated && (
                <Button
                  onClick={() => router.push("/client-space/activate-account")}
                  className="bg-primary hover:bg-primary/90"
                >
                  Activer mon compte
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Informations du compte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Informations du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Numéro de compte</p>
                <p className="font-mono bg-muted/20 px-2 py-1 rounded text-sm">
                  {session.accountNumber}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">IBAN</p>
                <p className="font-mono bg-muted/20 px-2 py-1 rounded text-sm">
                  {session.iban || "Non disponible"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type de compte</p>
                <Badge variant="outline" className="capitalize">
                  {session.accountType}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Code d'activation</p>
                <p className="font-mono bg-muted/20 px-2 py-1 rounded text-sm">
                  {session.activationCode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{session.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{session.phoneNumber}</span>
              </div>
              {userInfo && (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(userInfo.dateOfBirth)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{userInfo.placeOfBirth}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{userInfo.nationality}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Documents et photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents et photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userInfoLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Chargement...</span>
                </div>
              ) : userInfo ? (
                <>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {userInfo.profilePhotoPath ? "Photo de profil ✓" : "Photo de profil ✗"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {userInfo.cinPhotoPath ? "Photo CIN ✓" : "Photo CIN ✗"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {userInfo.signaturePath ? "Signature ✓" : "Signature ✗"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {userInfo.additionalDocumentsPath ? "Documents ✓" : "Documents ✗"}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Informations non disponibles</span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Onglets détaillés */}
        {userInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Détails complets</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="account">Compte bancaire</TabsTrigger>
                  <TabsTrigger value="history">Historique</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                      <p className="font-medium">{userInfo.firstName} {userInfo.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">CIN</p>
                      <p className="font-mono">{userInfo.cin}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
                      <p>{formatDate(userInfo.dateOfBirth)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Lieu de naissance</p>
                      <p>{userInfo.placeOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nationalité</p>
                      <p>{userInfo.nationality}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{userInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                      <p>{userInfo.phoneNumber}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photo de profil */}
                    {userInfo.profilePhotoPath ? (
                      <div className="border-2 border-primary/20 rounded-lg p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Camera className="w-5 h-5 text-primary" />
                          Photo de profil (Selfie)
                        </h4>
                        <div className="mb-3">
                          <div className="w-full max-w-xs mx-auto rounded-lg overflow-hidden border border-border shadow-md">
                            <img 
                              src={userInfo.profilePhotoPath} 
                              alt="Photo de profil"
                              className="w-full h-auto object-cover"
                              style={{ maxHeight: '200px' }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Photo vérifiée et stockée</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            Agrandir
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Aucune photo de profil</p>
                      </div>
                    )}
                    
                    {/* Signature électronique */}
                    {userInfo.signaturePath ? (
                      <div className="border-2 border-accent/20 rounded-lg p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <FileSignature className="w-5 h-5 text-accent" />
                          Signature électronique
                        </h4>
                        <div className="mb-3">
                          <div className="w-full max-w-xs mx-auto rounded-lg overflow-hidden border border-border shadow-md bg-white">
                            <img 
                              src={userInfo.signaturePath} 
                              alt="Signature électronique"
                              className="w-full h-auto object-contain p-2"
                              style={{ maxHeight: '120px' }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Signature vérifiée et stockée</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            Agrandir
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <FileSignature className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Aucune signature</p>
                      </div>
                    )}
                    
                    {/* Documents CIN */}
                    {userInfo.cinPhotoPath && (
                      <div className="border-2 border-info/20 rounded-lg p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-info" />
                          Documents CIN
                        </h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir CIN Recto
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir CIN Verso
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Documents additionnels */}
                    {userInfo.additionalDocumentsPath && (
                      <div className="border-2 border-secondary/20 rounded-lg p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-secondary" />
                          Justificatifs
                        </h4>
                        <div className="space-y-2">
                          <Button size="sm" variant="outline" className="w-full">
                            <FileText className="w-4 h-4 mr-2" />
                            Justificatif de domicile
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <FileText className="w-4 h-4 mr-2" />
                            Justificatif de revenus
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Statut global des documents */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                      <Shield className="w-5 h-5" />
                      Statut de vérification
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          userInfo.profilePhotoPath ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm">Photo profil</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          userInfo.signaturePath ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm">Signature</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          userInfo.cinPhotoPath ? 'bg-green-500' : 'bg-orange-500'
                        }`}></div>
                        <span className="text-sm">CIN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          userInfo.additionalDocumentsPath ? 'bg-green-500' : 'bg-orange-500'
                        }`}></div>
                        <span className="text-sm">Justificatifs</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="account" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Numéro de compte</p>
                      <p className="font-mono bg-muted/20 px-2 py-1 rounded">{userInfo.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">IBAN</p>
                      <p className="font-mono bg-muted/20 px-2 py-1 rounded">{userInfo.iban}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type de compte</p>
                      <Badge variant="outline" className="capitalize">{userInfo.accountType}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Statut</p>
                      <Badge variant={userInfo.accountActivated ? "default" : "destructive"}>
                        {userInfo.accountActivated ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Mot de passe temporaire utilisé</p>
                      <Badge variant={userInfo.temporaryPasswordUsed ? "default" : "secondary"}>
                        {userInfo.temporaryPasswordUsed ? "Oui" : "Non"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Code d'activation</p>
                      <p className="font-mono bg-muted/20 px-2 py-1 rounded">{userInfo.activationCode}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                      <p>{formatDate(userInfo.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Dernière mise à jour</p>
                      <p>{formatDate(userInfo.updatedAt)}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Message d'activation si nécessaire */}
        {!session.isAccountActivated && (
          <Card className="mt-6 border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <Alert className="border-destructive/50 bg-destructive/10">
                <XCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive-foreground">
                  Votre compte est inactif. Veuillez l'activer pour accéder à toutes les fonctionnalités.
                  <Button
                    variant="link"
                    onClick={() => router.push("/client-space/activate-account")}
                    className="text-destructive p-0 h-auto ml-2"
                  >
                    Activer mon compte
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

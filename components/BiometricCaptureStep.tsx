"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, CheckCircle, X } from "lucide-react"
import type { FormData } from "@/app/page"
import { useState, useRef } from "react"

interface BiometricCaptureStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onPrev: () => void
}

export default function BiometricCaptureStep({ formData, updateFormData, onNext, onPrev }: BiometricCaptureStepProps) {
  const [photoTaken, setPhotoTaken] = useState(false)
  const [signatureCaptured, setSignatureCaptured] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Vraie photo avec caméra
  const takeRealPhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

      // Créer un élément vidéo temporaire
      const video = document.createElement("video")
      video.srcObject = stream
      video.autoplay = true
      video.muted = true

      // Attendre que la vidéo soit prête
      video.onloadedmetadata = () => {
        setTimeout(() => {
          // Créer un canvas pour capturer
          const canvas = document.createElement("canvas")
          canvas.width = video.videoWidth || 640
          canvas.height = video.videoHeight || 480

          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(video, 0, 0)
            const imageData = canvas.toDataURL("image/jpeg", 0.8)

            setCapturedPhoto(imageData)
            updateFormData({
              biometricData: {
                ...formData.biometricData,
                photo: imageData,
              },
            })

            setPhotoTaken(true)
            alert("✅ PHOTO PRISE ET SAUVEGARDÉE !")
          }

          // Arrêter la caméra
          stream.getTracks().forEach((track) => track.stop())
        }, 1000)
      }
    } catch (error) {
      console.error("Erreur caméra:", error)
      alert("❌ Erreur d'accès à la caméra. Vérifiez les permissions.")
    }
  }

  // Fonctions signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.strokeStyle = "#000000"
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    const canvas = signatureCanvasRef.current
    if (canvas) {
      const signatureData = canvas.toDataURL()
      updateFormData({
        biometricData: {
          ...formData.biometricData,
          signature: signatureData,
        },
      })
      setSignatureCaptured(true)
    }
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setSignatureCaptured(false)
        updateFormData({
          biometricData: {
            ...formData.biometricData,
            signature: undefined,
          },
        })
      }
    }
  }

  const canProceed = photoTaken && signatureCaptured

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-foreground" />
          Capture biométrique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-info/20 border-info text-info-foreground">
          <Camera className="h-4 w-4 text-info-foreground" />
          <AlertDescription className="text-info-foreground">
            <strong>Instructions :</strong>
            <br />
            1. Cliquez "PRENDRE PHOTO" et autorisez l'accès à la caméra
            <br />
            2. Signez avec votre souris dans l'espace prévu
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Photo Capture */}
          <div className="space-y-4">
            <h3 className="font-semibold text-xl">📸 PHOTO D'IDENTITÉ</h3>

            {!photoTaken ? (
              <div className="space-y-3">
                <Button
                  onClick={takeRealPhoto}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6"
                >
                  <Camera className="w-6 h-6 mr-2" />📷 PRENDRE PHOTO
                </Button>

                <div className="bg-muted/20 border border-border rounded-lg p-8 text-center">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Cliquez sur le bouton ci-dessus pour prendre votre photo</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-success/50 rounded-lg p-2">
                  <img
                    src={capturedPhoto || "/placeholder.svg"}
                    alt="Photo capturée"
                    className="w-full rounded-lg"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
                <div className="bg-success/10 border border-success/50 rounded-lg p-3 text-center">
                  <p className="text-success-foreground font-bold">✅ PHOTO SAUVEGARDÉE AVEC SUCCÈS !</p>
                </div>
                <Button
                  onClick={() => {
                    setPhotoTaken(false)
                    setCapturedPhoto(null)
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  🔄 Reprendre une photo
                </Button>
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="space-y-4">
            <h3 className="font-semibold text-xl">✍️ SIGNATURE ÉLECTRONIQUE</h3>

            <div className="border-2 border-border rounded-lg p-4 bg-card">
              <canvas
                ref={signatureCanvasRef}
                width={300}
                height={150}
                className="w-full border border-border rounded cursor-crosshair bg-background"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />

              <div className="flex justify-between items-center mt-3">
                <Button variant="outline" size="sm" onClick={clearSignature}>
                  <X className="w-4 h-4 mr-1" />
                  Effacer
                </Button>
                {signatureCaptured && (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-bold">✅ SIGNATURE OK</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-muted-foreground">Signez avec votre souris dans l'espace gris ci-dessus</p>
          </div>
        </div>

        {/* Progression globale */}
        <div className="bg-info/20 border border-info rounded-lg p-4">
          <h4 className="font-bold text-lg mb-2 text-info-foreground">📊 PROGRESSION :</h4>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-3 rounded-lg text-center font-bold ${photoTaken ? "bg-success/20 text-success-foreground" : "bg-destructive/20 text-destructive-foreground"}`}
            >
              📸 Photo: {photoTaken ? "✅ TERMINÉ" : "❌ À FAIRE"}
            </div>
            <div
              className={`p-3 rounded-lg text-center font-bold ${signatureCaptured ? "bg-success/20 text-success-foreground" : "bg-destructive/20 text-destructive-foreground"}`}
            >
              ✍️ Signature: {signatureCaptured ? "✅ TERMINÉ" : "❌ À FAIRE"}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev} size="lg">
            ← Précédent
          </Button>
          <Button
            onClick={onNext}
            disabled={!canProceed}
            size="lg"
            className={`font-bold ${canProceed ? "bg-success hover:bg-success/90 text-success-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {canProceed ? "✅ CONTINUER →" : "❌ Complétez photo et signature"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

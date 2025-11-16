import type React from "react"

export default function ClientSpaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex flex-col flex-1">
      {/* Le Header est déjà dans app/layout.tsx, donc pas besoin ici */}
      <main className="flex-1 flex flex-col items-center justify-center py-8">{children}</main>
    </div>
  )
}

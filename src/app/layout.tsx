import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import RootProvider from "./rootProvider"

export const metadata: Metadata = {
  title: "Employee Voice | Naturub",
  description: "Build and manage forms with ease using our intuitive form builder",
  generator: "kamrul24.official@gmail.com",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <title>Employee Voice | Naturub</title>
      </head>
      <body>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}

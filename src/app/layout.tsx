import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Sigmania | Personal File Manager',
  description: 'Fast and Simple Personal File Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans`}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}

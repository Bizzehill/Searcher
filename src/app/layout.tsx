import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: "Santa's Helper",
  description: 'A joyful, family-friendly goodness-based Christmas list.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <header className="site-header">
            <div className="container">
              <h1 className="brand">🎄 Santa's Helper</h1>
              <nav>
                <Link href="/">Home</Link>
                <Link href="/santa">Santa View</Link>
                <Link href="/parent">Parent</Link>
                <Link href="/login">Login</Link>
              </nav>
            </div>
          </header>
          <main className="container">{children}</main>
          <footer className="site-footer">Made with love and stewardship.</footer>
        </AuthProvider>
      </body>
    </html>
  )
}

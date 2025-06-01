import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import GlobalNotifications from '../components/GlobalNotifications'
import EventBusDebug from '../components/EventBusDebug'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Restaurant Financial Management System',
  description: 'Comprehensive financial management system for restaurants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        {children}
        <GlobalNotifications />
        <EventBusDebug />
      </body>
    </html>
  )
} 
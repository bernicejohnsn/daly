import type { Metadata } from 'next'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'

export const metadata: Metadata = {
  title: 'Daly',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <DialRoot />
      </body>
    </html>
  )
}

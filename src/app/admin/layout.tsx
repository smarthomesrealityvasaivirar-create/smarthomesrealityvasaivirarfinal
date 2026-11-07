import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } }

/** No public Navbar/Footer/door here: admin has its own shell. */
export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#f4f3f0]">{children}</div>
}

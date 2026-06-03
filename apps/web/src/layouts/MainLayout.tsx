import { Outlet } from 'react-router-dom'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-800 px-6 py-4">
        <span className="text-xl font-bold tracking-tight">Anama</span>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

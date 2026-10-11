import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import NavBar from './NavBar'
import Footer from './Footer'
import NewsTicker from './NewsTicker'

export default function Layout({ children }) {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0 }) }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <NewsTicker />
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

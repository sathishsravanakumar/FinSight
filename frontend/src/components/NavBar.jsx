import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const links = [
    { to: '/',         label: 'Home' },
    { to: '/about',    label: 'About' },
    { to: '/services', label: 'Services' },
    { to: '/rates',    label: 'Rates' },
    { to: '/contact',  label: 'Contact' },
    { to: '/forecast', label: 'Forecast' },
    { to: '/exchange', label: 'Exchange' },
    ...(user ? [{ to: '/history', label: 'History' }] : []),
  ]

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <>
      <nav className="site-hdr">
        <Link to="/" className="hdr-logo">
          <img src="/logo.png" alt="Venus Forex" />
          <span className="hdr-tag">RBI Authorized<br />Full Fledged Money Changer</span>
        </Link>
        <div className="hnav">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `hn${isActive ? ' on' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </div>
        <div className="hauth">
          {user ? (
            <>
              <span className="hauth-name">{user.name}</span>
              <button className="hn" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hn">Sign in</Link>
              <Link to="/register" className="hreg">Register</Link>
            </>
          )}
        </div>
        <button className={`ham${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div className={`mobile-nav${open ? ' open' : ''}`}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `mn${isActive ? ' on' : ''}`}>
            {l.label}
          </NavLink>
        ))}
        {user ? (
          <button className="mn" onClick={handleLogout}>Sign out ({user.name})</button>
        ) : (
          <>
            <NavLink to="/login" onClick={() => setOpen(false)} className="mn">Sign in</NavLink>
            <NavLink to="/register" onClick={() => setOpen(false)} className="mn">Register</NavLink>
          </>
        )}
      </div>
    </>
  )
}

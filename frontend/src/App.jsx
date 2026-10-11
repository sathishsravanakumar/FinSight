import { Routes, Route, Link } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Rates from './pages/Rates'
import Forecast from './pages/Forecast'
import Exchange from './pages/Exchange'
import History from './pages/History'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"         element={<Home />}     />
        <Route path="/about"    element={<About />}    />
        <Route path="/services" element={<Services />} />
        <Route path="/contact"  element={<Contact />}  />
        <Route path="/rates"    element={<Rates />}    />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/exchange" element={<Exchange />} />
        <Route path="/history"  element={<History />}  />
        <Route path="/login"    element={<Login />}    />
        <Route path="/register" element={<Register />} />
        <Route path="*"         element={
          <>
            <div className="phero"><div><div className="phero-t">Page not found</div><div className="phero-s">The page you&rsquo;re looking for doesn&rsquo;t exist.</div></div></div>
            <div className="sec" style={{ textAlign: 'center' }}><Link to="/" className="bp">Go Home</Link></div>
          </>
        } />
      </Routes>
    </Layout>
  )
}

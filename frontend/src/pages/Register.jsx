import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import OTPModal from '../components/OTPModal'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [registered, setRegistered] = useState(null)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const user = await authApi.register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      })
      setRegistered(user)
      setShowOTP(true)
      toast.success('Account created! Please verify your email.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerified = () => {
    setShowOTP(false)
    toast.success('Email verified! Please sign in.')
    navigate('/login')
  }

  return (
    <>
    <div className="phero"><div><div className="phero-t">Create Account</div><div className="phero-s">Join Venus Forex — free, takes 2 minutes</div></div></div>
    <div className="flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                name="name"
                autoComplete="name"
                type="text"
                value={form.name}
                onChange={handle}
                placeholder="Your full name"
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                placeholder="you@example.com"
                className="input"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Phone (optional)</label>
              <input
                name="phone"
                autoComplete="tel"
                type="tel"
                value={form.phone}
                onChange={handle}
                placeholder="+91 9876543210"
                className="input"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handle}
                  placeholder="Min. 8 characters"
                  className="input pr-10"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                name="confirm"
                type={showPwd ? 'text' : 'password'}
                value={form.confirm}
                onChange={handle}
                placeholder="Repeat your password"
                className="input"
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-blue font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {showOTP && registered && (
        <OTPModal
          email={registered.email}
          purpose="register"
          onVerified={handleOTPVerified}
          onClose={() => setShowOTP(false)}
        />
      )}
    </div>
    </>
  )
}

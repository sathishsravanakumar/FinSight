import { useState, useRef, useEffect } from 'react'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

export default function OTPModal({ email, purpose, onVerified, onClose, onSubmitCode }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    refs[0].current?.focus()
    const t = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  const handleChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) refs[i + 1].current?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus()
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      refs[5].current?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { toast.error('Enter all 6 digits'); return }
    setLoading(true)
    try {
      if (onSubmitCode) await onSubmitCode(code)
      else await authApi.verifyOtp(email, code, purpose)
      toast.success('OTP verified!')
      onVerified()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const res = await authApi.sendOtp(email, purpose)
      toast.success(res.message || 'OTP resent!')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
      refs[0].current?.focus()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-xl font-bold text-brand-text">Verify OTP</h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter the 6-digit code sent to<br />
            <span className="font-semibold text-brand-text">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={refs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl
                           focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20
                           border-gray-200 transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className="btn-primary w-full"
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          {countdown > 0 ? (
            <span className="text-gray-400">Resend in {countdown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-brand-blue font-semibold hover:underline"
            >
              {resending ? 'Sending…' : 'Resend OTP'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

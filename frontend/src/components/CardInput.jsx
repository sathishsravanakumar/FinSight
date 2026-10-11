import { useState } from 'react'
import { cardsApi } from '../api/cards'
import { CreditCard, CheckCircle, XCircle } from 'lucide-react'

// Network logo colors
const NETWORK_COLORS = {
  Visa:       'text-blue-700',
  Mastercard: 'text-red-600',
  Amex:       'text-blue-500',
  RuPay:      'text-green-700',
  Discover:   'text-orange-600',
  Maestro:    'text-red-500',
  UnionPay:   'text-red-700',
  Unknown:    'text-gray-400',
}

function formatDisplay(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

export default function CardInput({ value, onChange, onValidation }) {
  const [display, setDisplay] = useState('')
  const [result, setResult] = useState(null)
  const [checking, setChecking] = useState(false)

  const handleChange = (e) => {
    const formatted = formatDisplay(e.target.value)
    setDisplay(formatted)
    const raw = formatted.replace(/\s/g, '')
    onChange(raw)
    setResult(null)

    // Auto-validate once we have enough digits
    if (raw.length >= 13) {
      debounceValidate(raw)
    }
  }

  let debounceTimer = null
  const debounceValidate = (raw) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => validate(raw), 600)
  }

  const validate = async (raw) => {
    setChecking(true)
    try {
      const res = await cardsApi.validate(raw)
      setResult(res)
      onValidation?.(res)
    } catch (err) {
      setResult({ is_valid: false, message: err.message })
      onValidation?.({ is_valid: false })
    } finally {
      setChecking(false)
    }
  }

  return (
    <div>
      <label className="label">Card Number</label>
      <div className="relative">
        <CreditCard
          size={18}
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            result ? (result.is_valid ? 'text-emerald-500' : 'text-red-500') : 'text-gray-400'
          }`}
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="1234 5678 9012 3456"
          value={display}
          onChange={handleChange}
          maxLength={23} // 19 digits + 4 spaces
          className={`input pl-10 pr-10 font-mono tracking-wider ${
            result
              ? result.is_valid
                ? 'border-emerald-400 focus:ring-emerald-300'
                : 'border-red-400 focus:ring-red-300'
              : ''
          }`}
        />
        {checking && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
          </div>
        )}
        {!checking && result && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {result.is_valid
              ? <CheckCircle size={18} className="text-emerald-500" />
              : <XCircle    size={18} className="text-red-500" />
            }
          </div>
        )}
      </div>

      {result && (
        <div className={`mt-1.5 text-xs flex items-center gap-1.5 ${
          result.is_valid ? 'text-emerald-600' : 'text-red-500'
        }`}>
          <span className={`font-semibold ${NETWORK_COLORS[result.card_network || 'Unknown']}`}>
            {result.card_network || 'Unknown'}
          </span>
          <span>·</span>
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ratesApi } from '../api/rates'
import { txApi } from '../api/transactions'
import CardInput from '../components/CardInput'
import OTPModal from '../components/OTPModal'
import toast from 'react-hot-toast'
import { ArrowLeftRight, AlertTriangle } from 'lucide-react'

const CURRENCIES = [
  { code: 'USD', flag: '🇺🇸', name: 'US Dollar'        },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro'              },
  { code: 'GBP', flag: '🇬🇧', name: 'British Pound'    },
  { code: 'SGD', flag: '🇸🇬', name: 'Singapore Dollar' },
  { code: 'AED', flag: '🇦🇪', name: 'UAE Dirham'       },
  { code: 'SAR', flag: '🇸🇦', name: 'Saudi Riyal'      },
  { code: 'JPY', flag: '🇯🇵', name: 'Japanese Yen'     },
  { code: 'CAD', flag: '🇨🇦', name: 'Canadian Dollar'  },
  { code: 'CHF', flag: '🇨🇭', name: 'Swiss Franc'      },
  { code: 'AUD', flag: '🇦🇺', name: 'Australian Dollar'},
]

export default function Exchange() {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [txType, setTxType] = useState('buy')
  const [currency, setCurrency] = useState('USD')
  const [amount, setAmount] = useState('')
  const [card, setCard] = useState('')
  const [cardValid, setCardValid] = useState(false)
  const [rates, setRates] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [pendingTxn, setPendingTxn] = useState(null)
  const [showOTP, setShowOTP] = useState(false)

  useEffect(() => {
    ratesApi.live().then(d => setRates(d)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!rates || !amount || isNaN(amount) || Number(amount) <= 0) {
      setPreview(null); return
    }
    const curr = rates.currencies?.find(c => c.code === currency)
    if (!curr) return
    const rate = txType === 'buy' ? curr.buy_rate : curr.sell_rate
    const spread = curr.spread_pct
    const inrAmt = Number(amount) * rate
    const gst = inrAmt * (spread / 100) * 0.0018
    const tcs = inrAmt > 700000 ? inrAmt * 0.005 : 0
    setPreview({ rate, inrAmt, gst, tcs, spread, curr })
  }, [rates, amount, currency, txType])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!cardValid) { toast.error('Please enter a valid card number'); return }
    setSubmitting(true)
    try {
      const txn = await txApi.create({
        transaction_type: txType,
        currency_code: currency,
        foreign_amount: Number(amount),
        card_number: card,
      })
      setPendingTxn(txn)
      setShowOTP(true)
      toast.success('OTP sent to your email!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOTPVerified = () => {
    setShowOTP(false)
    toast.success('Transaction completed!')
    navigate('/history')
  }

  const selectedCurr = CURRENCIES.find(c => c.code === currency)

  return (
    <>
    <div className="phero"><div><div className="phero-t">Exchange Currency</div><div className="phero-s">Live rates &middot; Luhn card validation &middot; OTP-secured transactions</div></div></div>
    <div className="max-w-2xl mx-auto px-4 py-8">
      {!user && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            You need to <a href="/login" className="font-semibold underline">sign in</a> to complete a transaction.
            You can preview rates without signing in.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction type */}
        <div>
          <label className="label">Transaction Type</label>
          <div className="grid grid-cols-2 gap-3">
            {['buy', 'sell'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTxType(t)}
                className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                  txType === t
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue'
                }`}
              >
                {t === 'buy' ? '🛒 Buy Foreign Currency' : '💵 Sell Foreign Currency'}
                <span className="block text-xs font-normal opacity-70">
                  {t === 'buy' ? 'You pay INR, get forex' : 'You give forex, get INR'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Currency + Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="input">
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Amount ({currency})</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 100"
              className="input"
            />
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-brand-bg border border-brand-blue/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeftRight size={16} className="text-brand-blue" />
              <p className="font-semibold text-brand-text text-sm">Transaction Preview</p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div>
                <p className="text-gray-400">Rate ({txType === 'buy' ? 'buy' : 'sell'})</p>
                <p className="font-bold text-brand-text">₹{preview.rate.toFixed(4)}/{currency}</p>
              </div>
              <div>
                <p className="text-gray-400">INR Amount</p>
                <p className="font-bold text-brand-text text-lg">₹{preview.inrAmt.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">GST (on spread)</p>
                <p className="font-semibold">₹{preview.gst.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">TCS {preview.inrAmt > 700000 ? '(0.5%)' : '(waived)'}</p>
                <p className="font-semibold">{preview.tcs > 0 ? `₹${preview.tcs.toFixed(2)}` : '—'}</p>
              </div>
            </div>
            <div className="border-t border-brand-blue/20 mt-3 pt-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">Total payable</span>
              <span className="text-xl font-bold text-brand-text">
                ₹{(preview.inrAmt + preview.gst + preview.tcs).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Card input */}
        <CardInput
          value={card}
          onChange={setCard}
          onValidation={r => setCardValid(r?.is_valid || false)}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !amount || !card || !cardValid}
          className="btn-primary w-full text-base py-3"
        >
          {submitting ? 'Processing…' : `${txType === 'buy' ? 'Buy' : 'Sell'} ${currency} — Send OTP`}
        </button>
      </form>

      {showOTP && user && (
        <OTPModal
          email={user.email}
          purpose="transaction"
          onSubmitCode={code => txApi.verifyOtp(pendingTxn.id, code, user.email)}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTP(false)}
        />
      )}
    </div>
    </>
  )
}

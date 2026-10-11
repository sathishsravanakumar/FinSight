import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { txApi } from '../api/transactions'
import toast from 'react-hot-toast'
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_STYLES = {
  completed:    'bg-emerald-50 text-emerald-700',
  pending:      'bg-amber-50 text-amber-700',
  otp_verified: 'bg-blue-50 text-blue-700',
  cancelled:    'bg-gray-100 text-gray-500',
  failed:       'bg-red-50 text-red-600',
}

const TYPE_LABELS = { buy: '🛒 Buy', sell: '💵 Sell' }

const FLAGS = { USD:'🇺🇸',EUR:'🇪🇺',GBP:'🇬🇧',SGD:'🇸🇬',AED:'🇦🇪',SAR:'🇸🇦',JPY:'🇯🇵',CAD:'🇨🇦',CHF:'🇨🇭',AUD:'🇦🇺',HKD:'🇭🇰',NZD:'🇳🇿' }

export default function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    load()
  }, [user, page])

  const load = async () => {
    setLoading(true)
    try {
      const d = await txApi.list({ page, page_size: 10 })
      setData(d)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this transaction?')) return
    try {
      await txApi.cancel(id)
      toast.success('Transaction cancelled')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const totalPages = data ? Math.ceil(data.total / 10) : 1

  return (
    <>
    <div className="phero"><div><div className="phero-t">Transaction History</div><div className="phero-s">Full record of your forex transactions</div></div></div>
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: '#666688' }}>{data ? `${data.total} total transactions` : ''}</p>
        <button onClick={load} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading && !data && (
        <div className="card text-center py-12 text-gray-400">
          <div className="w-8 h-8 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto mb-3" />
          Loading transactions…
        </div>
      )}

      {data && data.transactions.length === 0 && (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🗒️</p>
          <p className="font-semibold">No transactions yet</p>
          <p className="text-sm mt-1">Your exchange history will appear here.</p>
        </div>
      )}

      {data && data.transactions.length > 0 && (
        <>
          <div className="card p-0 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-brand-bg border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-500 font-semibold">Date</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-semibold">Type</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-semibold">Currency</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-semibold">Foreign</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-semibold">INR</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-semibold">Rate</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-semibold">Card</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-semibold">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.transactions.map(t => (
                    <tr key={t.id} className="hover:bg-brand-bg/50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(t.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                        <br />
                        <span className="text-gray-400">{new Date(t.created_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold">{TYPE_LABELS[t.transaction_type]}</td>
                      <td className="px-5 py-3.5">
                        <span className="mr-1">{FLAGS[t.currency_code] || '🌐'}</span>
                        <span className="font-semibold">{t.currency_code}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold">
                        {t.foreign_amount.toFixed(2)} {t.currency_code}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold">₹{t.inr_amount.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-right text-gray-500">₹{t.rate_used.toFixed(4)}</td>
                      <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                        {t.card_type && <span className="font-semibold text-gray-700 font-sans">{t.card_type}</span>}
                        {t.card_last4 && <span className="ml-1">…{t.card_last4}</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[t.status] || ''}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {t.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(t.id)}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 hover:border-brand-blue disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:border-brand-blue disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
    </>
  )
}

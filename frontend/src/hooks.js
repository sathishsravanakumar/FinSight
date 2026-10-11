import { useEffect, useState, useCallback } from 'react'
import { ratesApi } from './api/rates'

// Venus quotes: "we buy" = what the customer receives when selling forex (API sell_rate),
// "we sell" = what the customer pays when buying forex (API buy_rate).
export function useLiveRates() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await ratesApi.live())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { data, error, loading, reload: load }
}

export const fmt2 = n => Number(n).toFixed(2)
export const CARD_RATE_FACTOR = 1.005

export function updatedLabel(lastUpdate) {
  if (!lastUpdate) return 'Today'
  const d = new Date(lastUpdate)
  return isNaN(d)
    ? lastUpdate
    : d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

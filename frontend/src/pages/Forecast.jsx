import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ratesApi } from '../api/rates'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const CODES = ['USD', 'EUR', 'GBP', 'SGD', 'AED', 'JPY']
const REGIME_CLS = { Tight: 'regime-tight', Standard: 'regime-std', Wide: 'regime-wide' }
const INV_CLS = { Accumulate: 'inv-acc', Hold: 'inv-hold', Reduce: 'inv-red' }

const dp = code => (code === 'JPY' ? 3 : 4)

export default function Forecast() {
  const [params, setParams] = useSearchParams()
  const initial = CODES.includes(params.get('currency')) ? params.get('currency') : 'USD'
  const [code, setCode] = useState(initial)
  const cache = useRef({})
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [overview, setOverview] = useState(null)

  const fetchOne = async c => {
    if (!cache.current[c]) cache.current[c] = ratesApi.forecast(c)
    try {
      return await cache.current[c]
    } catch (e) {
      delete cache.current[c]
      throw e
    }
  }

  useEffect(() => {
    let alive = true
    setParams({ currency: code }, { replace: true })
    setLoading(true)
    setError('')
    fetchOne(code)
      .then(d => { if (alive) setData(d) })
      .catch(e => { if (alive) { setData(null); setError(`Could not load data for ${code}. Error: ${e.message}`) } })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [code])

  useEffect(() => {
    let alive = true
    Promise.allSettled(CODES.map(fetchOne)).then(res => {
      if (alive) setOverview(res.map((r, i) => ({ code: CODES[i], d: r.status === 'fulfilled' ? r.value : null })))
    })
    return () => { alive = false }
  }, [])

  const chart = useMemo(() => {
    if (!data) return null
    const hist = (data.historical || []).slice(-60)
    const ma7 = hist.map((_, i) => (i < 6 ? null : hist.slice(i - 6, i + 1).reduce((s, p) => s + p.rate, 0) / 7))
    const n = hist.length
    return {
      labels: [...hist.map(p => p.date), 'Forecast'],
      datasets: [
        { label: `${code}/INR mid rate`, data: [...hist.map(p => p.rate), null], borderColor: '#2D2E8F', borderWidth: 2, pointRadius: 0, tension: 0.2, fill: false },
        { label: '7-day MA', data: [...ma7, null], borderColor: '#E03535', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0, tension: 0.2, fill: false },
        { label: 'Forecast', data: [...Array(n).fill(null), data.forecast_rate], borderColor: '#2e7d32', backgroundColor: '#2e7d32', pointRadius: 7, pointHoverRadius: 9, pointStyle: 'triangle', showLine: false },
      ],
    }
  }, [data])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 14 } },
      tooltip: {
        filter: item => item.raw !== null && item.raw !== undefined,
        callbacks: { label: c => ` ${c.dataset.label}: ${Number(c.raw).toFixed(dp(code))}` },
      },
    },
    scales: {
      x: { ticks: { font: { size: 10 }, maxTicksLimit: 8, maxRotation: 0 } },
      y: { ticks: { font: { size: 10 } }, title: { display: true, text: `${code}/INR`, font: { size: 11 } } },
    },
  }), [code])

  const d = data
  const p = d ? dp(code) : 4
  const arrow = d?.direction === 'UP' ? '▲' : d?.direction === 'DOWN' ? '▼' : '↔'
  const col = d?.direction === 'UP' ? '#2e7d32' : d?.direction === 'DOWN' ? '#CC2222' : '#888'

  return (
    <>
      <div className="fcast-hero">
        <div className="fcast-hero-badge">FinSight</div>
        <h1 className="fcast-hero-title">Rate Forecast &amp; Spread Engine</h1>
        <p className="fcast-hero-sub">Short-horizon exchange-rate analysis for cash-positioning &amp; spread management &mdash; powered by rolling time-series features &amp; signal-based regression on ECB data.</p>
      </div>

      <div className="fcast-cbar">
        <span className="fcast-cbar-lbl">Select currency vs INR:</span>
        {CODES.map(c => (
          <button key={c} className={`fbtn${code === c ? ' on' : ''}`} onClick={() => setCode(c)}>
            {c === 'JPY' ? 'JPY ×100' : c}
          </button>
        ))}
      </div>

      <div className="fcast-main">
        <div className="fcast-metrics">
          <div className="fcard">
            <div className="fcard-lbl">Next-day forecast rate</div>
            <div className="fcard-val">{d ? d.forecast_rate.toFixed(p) : '—'}</div>
            <div className="fcard-sub">
              {d ? <><span style={{ color: col }}>{arrow} {d.forecast_pct >= 0 ? '+' : ''}{d.forecast_pct.toFixed(3)}%</span> vs today</> : 'vs today’s mid'}
            </div>
          </div>
          <div className="fcard">
            <div className="fcard-lbl">Spread regime</div>
            <div className="fcard-val" style={{ fontSize: 17 }}>{d ? `${d.spread_regime} ±${d.spread_pct}%` : '—'}</div>
            {d ? <div className={`ftag ${REGIME_CLS[d.spread_regime]}`}>Buy {d.sell_rate.toFixed(p)} / Sell {d.buy_rate.toFixed(p)}</div>
               : <div className="fcard-sub">Volatility-adaptive &plusmn;%</div>}
          </div>
          <div className="fcard">
            <div className="fcard-lbl">Inventory signal</div>
            <div className="fcard-val" style={{ fontSize: 17 }}>{d ? d.inventory_signal : '—'}</div>
            {d ? <div className={`ftag ${INV_CLS[d.inventory_signal]}`}>{d.forecast_pct >= 0 ? '+' : ''}{d.forecast_pct.toFixed(3)}%</div>
               : <div className="fcard-sub">Cash position recommendation</div>}
          </div>
        </div>

        <div className="fcast-chartbox">
          <div className="fcast-chart-hdr">
            <span>{d ? `60-day ${code}/INR history & next-day forecast` : '60-day rate history & forecast'}</span>
            <span style={{ fontSize: 10, color: '#888', fontWeight: 400 }}>Source: ECB via Frankfurter API</span>
          </div>
          {loading && <div className="fcast-overlay"><div className="fcast-spin"></div><span>Loading historical data&hellip;</span></div>}
          {error && <div className="fcast-err">{error}</div>}
          <div className="fcast-cv">{chart && !error && <Line data={chart} options={options} />}</div>
        </div>

        <div className="sec alt" style={{ borderRadius: 12, padding: 16, marginBottom: 4 }}>
          <div className="sh">All-currency spread overview <span className="sub">Indicative buy/sell spreads based on current vol regime</span></div>
          {!overview ? (
            <div style={{ textAlign: 'center', padding: 18, color: '#888', fontSize: 12 }}><div className="fcast-spin" style={{ display: 'inline-block', width: 20, height: 20 }}></div>&nbsp;Loading&hellip;</div>
          ) : (
            <div className="spread-tbl-wrap">
              <table className="spread-tbl">
                <thead><tr><th>Currency</th><th>Mid (INR)</th><th>Buy (Venus)</th><th>Sell (Venus)</th><th>Spread&nbsp;%</th><th>Regime</th><th>Inventory</th></tr></thead>
                <tbody>
                  {overview.map(({ code: c, d: o }) => o ? (
                    <tr key={c}>
                      <td><strong>{c === 'JPY' ? 'JPY ×100' : c}</strong></td>
                      <td>{o.current_rate.toFixed(dp(c))}</td>
                      <td>{o.sell_rate.toFixed(dp(c))}</td>
                      <td>{o.buy_rate.toFixed(dp(c))}</td>
                      <td>{o.spread_pct.toFixed(1)}%</td>
                      <td><span className={`rpill ${REGIME_CLS[o.spread_regime]}`}>{o.spread_regime}</span></td>
                      <td><span className={`rpill ${INV_CLS[o.inventory_signal]}`}>{o.inventory_signal}</span></td>
                    </tr>
                  ) : (
                    <tr key={c}><td><strong>{c}</strong></td><td colSpan={6} style={{ color: '#aaa' }}>Data unavailable</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="fcast-how">
          <h3>How FinSight works</h3>
          <div className="fcast-how-grid">
            <div className="fcast-how-item"><h4>Time-series features</h4><p>Uses 120 days of ECB historical data to compute lagged returns, 7-day &amp; 21-day rolling means, and rolling standard deviation as a volatility proxy.</p></div>
            <div className="fcast-how-item"><h4>Signal-based forecast</h4><p>Blends a mean-reversion signal (35% weight) with a momentum signal (15% weight) to estimate next-day direction and magnitude of rate change.</p></div>
            <div className="fcast-how-item"><h4>Volatility-adaptive spreads</h4><p>Spread regime is set dynamically: <strong>Tight</strong> (vol &lt; 30th pct), <strong>Standard</strong>, or <strong>Wide</strong> (vol &gt; 70th pct).</p></div>
            <div className="fcast-how-item"><h4>Inventory signals</h4><p><strong>Accumulate</strong> if rate forecast to rise &gt;0.20%; <strong>Reduce</strong> if forecast to fall &lt;&minus;0.20%; <strong>Hold</strong> otherwise &mdash; guides daily cash-positioning decisions.</p></div>
          </div>
        </div>
        <div className="fcast-disc"><strong>&#9888; Disclaimer:</strong> FinSight Rate Forecast is an analytical tool for <strong>indicative purposes only</strong>. Forecasts are generated from statistical signal models applied to ECB historical data and do not constitute financial advice. Exchange rates are inherently unpredictable. All actual transactions are subject to Venus Forex&rsquo;s live rates at the time of dealing. Past performance does not guarantee future results.</div>
      </div>
    </>
  )
}

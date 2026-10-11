import { useState } from 'react'
import { useLiveRates, fmt2, updatedLabel, CARD_RATE_FACTOR } from '../hooks'

export default function Rates() {
  const { data, error, loading } = useLiveRates()
  const [dir, setDir] = useState('buy')
  const [amt, setAmt] = useState('10000')
  const [cur, setCur] = useState('USD')

  const list = data?.currencies || []
  const sel = list.find(c => c.code === cur)
  const a = parseFloat(amt) || 0

  let out = '—'
  let lbl = 'Loading live rates…'
  if (error) {
    lbl = 'Rate data unavailable — please refresh'
  } else if (sel) {
    if (dir === 'buy') {
      out = (a / sel.buy_rate).toFixed(2)
      lbl = `${cur} you will receive (rate: ₹${fmt2(sel.buy_rate)} per ${cur})`
    } else {
      out = '₹' + (a * sel.sell_rate).toLocaleString('en-IN', { maximumFractionDigits: 2 })
      lbl = `Indian Rupees you will receive (rate: ₹${fmt2(sel.sell_rate)} per ${cur})`
    }
  }

  const updated = data ? `Updated: ${updatedLabel(data.last_update)}` : ''

  return (
    <>
      <div className="phero">
        <div><div className="phero-t">Exchange rates</div><div className="phero-s">Live rates updated daily from global markets</div></div>
        <div className="phero-b">Live &middot; Auto-updates on load</div>
      </div>
      <div className="notice">Rates are indicative only. Final rate confirmed at time of transaction. Spread applied over mid-market rate. GST &amp; TCS applicable.</div>

      <div className="sec"><div className="sec-in">
        <div className="sh">Currency converter</div>
        <div className="cbox">
          <div className="crow"><label>I want to</label>
            <select value={dir} onChange={e => setDir(e.target.value)}>
              <option value="buy">Buy forex (I pay &#8377;)</option>
              <option value="sell">Sell forex (I receive &#8377;)</option>
            </select>
          </div>
          <div className="crow"><label>{dir === 'buy' ? 'Amount (₹)' : `Amount (${cur})`}</label>
            <input type="number" value={amt} min="1" step="any" onChange={e => setAmt(e.target.value)} />
          </div>
          <div className="crow"><label>Currency</label>
            <select value={cur} onChange={e => setCur(e.target.value)}>
              {list.length === 0 && <option value={cur}>{cur}</option>}
              {list.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} &mdash; {c.name}</option>)}
            </select>
          </div>
          <div className="cres"><div className="cresn">{out}</div><div className="cresl">{lbl}</div></div>
        </div>
      </div></div>

      <div className="sec alt"><div className="sec-in">
        <div className="sh">Full rates table <span className="lbadge"><span className="ldot"></span>LIVE</span><span className="sub">{updated}</span></div>
        <div className="tbl-wrap">
          {loading && !data && <div className="rloading"><span className="rspinner"></span>Fetching live rates&hellip;</div>}
          {error && <div className="rerror">&#9888; Could not load live rates. Please refresh or contact us.</div>}
          {data && (
            <>
              <table className="rt" style={{ minWidth: 500 }}>
                <thead><tr><th>Currency</th><th>We buy (&#8377;)</th><th>We sell (&#8377;)</th><th>Card rate (&#8377;)</th></tr></thead>
                <tbody>
                  {list.map(c => (
                    <tr key={c.code}>
                      <td>{c.flag} {c.code} &mdash; {c.name}</td>
                      <td className="buy">{fmt2(c.sell_rate)}</td>
                      <td className="sell">{fmt2(c.buy_rate)}</td>
                      <td className="crate">{fmt2(c.mid_rate * CARD_RATE_FACTOR)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 10, fontSize: 11, color: '#aaa' }}>We buy = Venus Forex purchases from you &middot; We sell = Venus Forex sells to you &middot; Card rate = for prepaid forex card loads</div>
            </>
          )}
        </div>
      </div></div>

      <div className="sec"><div className="sec-in">
        <div className="sh">Applicable taxes</div>
        <div className="g2">
          <div className="card" style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: '#2D2E8F' }}>GST on forex transactions</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <tbody>
                <tr><td style={{ color: '#888', padding: '6px 0', borderBottom: '1px solid #f0f0f6' }}>Up to &#8377;1,00,000</td><td style={{ textAlign: 'right', padding: '6px 0', borderBottom: '1px solid #f0f0f6' }}>0.18% (min &#8377;45)</td></tr>
                <tr><td style={{ color: '#888', padding: '6px 0', borderBottom: '1px solid #f0f0f6' }}>&#8377;1 lakh &ndash; &#8377;10 lakh</td><td style={{ textAlign: 'right', padding: '6px 0', borderBottom: '1px solid #f0f0f6' }}>&#8377;180 + 0.09% of excess</td></tr>
                <tr><td style={{ color: '#888', padding: '6px 0' }}>Above &#8377;10 lakh</td><td style={{ textAlign: 'right', padding: '6px 0' }}>Maximum &#8377;990</td></tr>
              </tbody>
            </table>
          </div>
          <div className="card" style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#2D2E8F' }}>TCS on outward remittances</div>
            <div style={{ color: '#555', lineHeight: 1.7 }}>TCS at <strong style={{ color: '#CC2222' }}>20%</strong> is collected on LRS remittances above &#8377;7 lakh per financial year (Finance Act 2023). Fully creditable when filing your income tax return.</div>
          </div>
        </div>
      </div></div>
    </>
  )
}

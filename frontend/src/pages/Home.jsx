import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveRates, fmt2, updatedLabel } from '../hooks'
import { submitEnquiry } from '../enquiry'

const TOP = ['USD', 'EUR', 'GBP', 'AED', 'SGD']

function Icon({ children }) {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none">{children}</svg>
}

export default function Home() {
  const navigate = useNavigate()
  const { data, error, loading } = useLiveRates()
  const [msg, setMsg] = useState({ cls: 'fmsg', text: '' })
  const [sending, setSending] = useState(false)

  const rows = data ? TOP.map(code => data.currencies.find(c => c.code === code)).filter(Boolean) : []

  const onSubmit = async e => {
    e.preventDefault()
    const form = e.currentTarget
    setSending(true)
    setMsg({ cls: 'fmsg', text: '' })
    const res = await submitEnquiry(form)
    setMsg(res.ok
      ? { cls: 'fmsg ok', text: '✓ Message sent! We will call you back within 1 hour during business hours.' }
      : { cls: 'fmsg err', text: res.error })
    if (res.ok) form.reset()
    setSending(false)
  }

  return (
    <>
      <div className="hero">
        <div className="hero-h">Chennai&rsquo;s trusted forex partner since 2005</div>
        <div className="hero-p">RBI licensed Full Fledged Money Changer. Competitive rates, zero hidden charges, and doorstep delivery across Chennai.</div>
        <div className="hero-btns">
          <button className="bp" onClick={() => navigate('/rates')}>Today&rsquo;s live rates</button>
          <a className="bs" href="https://wa.me/919444170065" target="_blank" rel="noopener noreferrer">WhatsApp us now</a>
        </div>
      </div>

      <div className="tbar">
        <div className="ti"><div className="tdot"></div>RBI FFMC licensed</div>
        <div className="ti"><div className="tdot"></div>Established 2005</div>
        <div className="ti"><div className="tdot"></div>4.6 &#9733; on Justdial</div>
        <div className="ti"><div className="tdot"></div>2 office locations</div>
        <div className="ti"><div className="tdot"></div>Doorstep delivery</div>
      </div>

      <div className="sec"><div className="sec-in">
        <div className="sh">What we offer</div>
        <div className="g4">
          <Link to="/services" className="scard"><div className="sicon"><Icon><rect x="2" y="5" width="16" height="10" rx="2" stroke="#2D2E8F" strokeWidth="1.5" /><line x1="2" y1="9" x2="18" y2="9" stroke="#CC2222" strokeWidth="1.5" /></Icon></div><div className="stitle">Foreign currency</div><div className="sdesc">Buy &amp; sell 30+ currencies at best daily rates</div></Link>
          <Link to="/services" className="scard"><div className="sicon"><Icon><rect x="2" y="4" width="16" height="12" rx="2" stroke="#2D2E8F" strokeWidth="1.5" /><line x1="5" y1="10" x2="15" y2="10" stroke="#CC2222" strokeWidth="1.4" /><line x1="10" y1="7" x2="10" y2="13" stroke="#CC2222" strokeWidth="1.4" /></Icon></div><div className="stitle">Forex travel card</div><div className="sdesc">Prepaid multi-currency card, accepted worldwide</div></Link>
          <Link to="/services" className="scard"><div className="sicon"><Icon><circle cx="10" cy="10" r="7" stroke="#2D2E8F" strokeWidth="1.5" /><path d="M7 10h6M10 7l3 3-3 3" stroke="#CC2222" strokeWidth="1.4" strokeLinecap="round" /></Icon></div><div className="stitle">Send money abroad</div><div className="sdesc">TT &amp; drafts for education, medical, travel</div></Link>
          <Link to="/services" className="scard"><div className="sicon"><Icon><circle cx="10" cy="10" r="7" stroke="#2D2E8F" strokeWidth="1.5" /><path d="M13 10H7M10 13l-3-3 3-3" stroke="#CC2222" strokeWidth="1.4" strokeLinecap="round" /></Icon></div><div className="stitle">Receive remittance</div><div className="sdesc">Western Union &amp; MoneyGram payouts</div></Link>
          <Link to="/forecast" className="scard" style={{ borderTop: '2px solid #2D2E8F' }}><div className="sicon"><Icon><polyline points="2,15 6,9 10,12 14,5 18,8" stroke="#2D2E8F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /><circle cx="18" cy="8" r="1.5" fill="#CC2222" /></Icon></div><div className="stitle">Rate forecast</div><div className="sdesc">ML-powered next-day outlook &amp; spread regime</div></Link>
        </div>
      </div></div>

      <div className="sec alt"><div className="sec-in">
        <div className="sh">Today&rsquo;s live rates <span className="lbadge"><span className="ldot"></span>LIVE</span><span className="sub">{data ? `Updated: ${updatedLabel(data.last_update)}` : ''}</span></div>
        {loading && !data && <div className="rloading"><span className="rspinner"></span>Fetching live rates&hellip;</div>}
        {error && <div className="rerror">&#9888; Could not load live rates. Please refresh or contact us.</div>}
        {data && (
          <div className="tbl-wrap">
            <table className="rt">
              <thead><tr><th>Currency</th><th>We buy (&#8377;)</th><th>We sell (&#8377;)</th></tr></thead>
              <tbody>
                {rows.map(c => (
                  <tr key={c.code}>
                    <td>{c.flag} {c.code} &mdash; {c.name}</td>
                    <td className="buy">{fmt2(c.sell_rate)}</td>
                    <td className="sell">{fmt2(c.buy_rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop: 14, textAlign: 'center' }}><button className="bp" onClick={() => navigate('/rates')}>View all currencies &amp; converter</button></div>
      </div></div>

      <div className="sec"><div className="sec-in">
        <div className="sh">Why Venus Forex?</div>
        <div className="g4">
          <div className="stat"><div className="stn">20+</div><div className="stl">Years in business</div></div>
          <div className="stat"><div className="stn">RBI</div><div className="stl">FFMC licensed</div></div>
          <div className="stat"><div className="stn">4.6&#9733;</div><div className="stl">Justdial rating</div></div>
          <div className="stat"><div className="stn">2</div><div className="stl">Office locations</div></div>
        </div>
      </div></div>

      <div className="sec alt"><div className="sec-in">
        <div className="sh">How it works</div>
        <div className="card">
          <div className="step"><div className="snum">1</div><div><div className="stxt">Check live exchange rates</div><div className="ssub">View today&rsquo;s rates or WhatsApp us for a quick quote</div></div></div>
          <div className="step"><div className="snum">2</div><div><div className="stxt">Walk in or book doorstep delivery</div><div className="ssub">Visit Adambakkam or Mamallapuram office, or we come to you across Chennai</div></div></div>
          <div className="step"><div className="snum">3</div><div><div className="stxt">Bring your KYC documents</div><div className="ssub">PAN + passport + air ticket + visa. We handle all the paperwork.</div></div></div>
          <div className="step"><div className="snum">4</div><div><div className="stxt">Pay &amp; collect</div><div className="ssub">Cash up to &#8377;49,999 &middot; NEFT/UPI for higher amounts &middot; Currency in hand instantly</div></div></div>
        </div>
      </div></div>

      <div className="sec"><div className="sec-in">
        <div className="sh">What our customers say</div>
        <div className="g2">
          <div className="tcard"><div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><div className="ttext">&ldquo;Best forex rates in Chennai. Got my USD on the same day. Staff was very helpful with all the paperwork.&rdquo;</div><div className="tauth">&mdash; Rajesh K., Adambakkam</div></div>
          <div className="tcard"><div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><div className="ttext">&ldquo;Used doorstep delivery for my daughter&rsquo;s education remittance to the US. Smooth process, great rates.&rdquo;</div><div className="tauth">&mdash; Meena S., Velachery</div></div>
        </div>
      </div></div>

      <div className="sec alt"><div className="sec-in">
        <div className="sh">Quick enquiry</div>
        <div className="g2r">
          <div>
            <form onSubmit={onSubmit}>
              <div className="ff"><label>Your name *</label><input type="text" name="name" placeholder="Full name" required /></div>
              <div className="ff"><label>Mobile number *</label><input type="tel" name="phone" placeholder="+91 xxxxxxxxxx" required /></div>
              <div className="ff"><label>Service needed</label>
                <select name="service"><option>Foreign currency</option><option>Forex travel card</option><option>Outward remittance</option><option>Receive money (WU/MG)</option><option>Other</option></select>
              </div>
              <button type="submit" className="bp" disabled={sending} style={{ width: '100%', marginTop: 4 }}>{sending ? 'Sending…' : 'Request callback'}</button>
              <div className={msg.cls}>{msg.text}</div>
            </form>
          </div>
          <div className="cinfo">
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2D2E8F', marginBottom: 12 }}>Reach us directly</div>
            <a href="tel:+919444170065" style={{ display: 'block', fontSize: 13, color: '#2D2E8F', fontWeight: 600, marginBottom: 8 }}>&#128222; +91 9444170065</a>
            <a href="mailto:venusforex2005@gmail.com" style={{ display: 'block', fontSize: 13, color: '#2D2E8F', marginBottom: 14 }}>&#9993; venusforex2005@gmail.com</a>
            <a href="https://wa.me/919444170065" target="_blank" rel="noopener noreferrer" className="wabtn">&#128172; Chat on WhatsApp</a>
            <div style={{ fontSize: 12, color: '#666688', marginTop: 12, paddingTop: 10, borderTop: '1px solid #c0c0e0' }}>Mon &ndash; Sat &middot; 9:30 AM &ndash; 6:00 PM</div>
          </div>
        </div>
      </div></div>
    </>
  )
}

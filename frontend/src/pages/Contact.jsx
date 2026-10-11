import { useState } from 'react'
import { submitEnquiry } from '../enquiry'

const FAQS = [
  ['What documents do I need to buy forex?', 'PAN card, valid passport, confirmed air ticket (travel within 60 days), and a valid visa for your destination country.'],
  ['How far in advance can I buy foreign currency?', 'Up to 60 days before your travel date, as per RBI guidelines.'],
  ['Is doorstep delivery available?', 'Yes, across Chennai. Book at least 24 hours in advance by calling or WhatsApp-ing us at +91 9444170065.'],
  ['What is TCS and does it apply to me?', 'TCS at 20% applies on outward remittances above ₹7 lakh per financial year. Fully creditable against your income tax when you file your ITR.'],
  ['Can I sell back unused foreign currency?', 'Yes. Bring unspent notes or your forex card balance to our office within 180 days of return and we convert them back to INR at the prevailing rate.'],
  ['What is the maximum cash payment allowed?', 'Cash payments are accepted only up to ₹49,999 per transaction as per RBI guidelines. Above that, payment must be via NEFT, RTGS, UPI, or cheque.'],
]

function Pin({ main }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1C5.5 1 3 3 3 6c0 3.5 5 9 5 9s5-5.5 5-9c0-3-2.5-5-5-5z" stroke={main ? '#2D2E8F' : '#CC2222'} strokeWidth="1.3" />
      <circle cx="8" cy="6" r="1.6" stroke={main ? '#CC2222' : '#2D2E8F'} strokeWidth="1.1" />
    </svg>
  )
}

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(-1)
  const [msg, setMsg] = useState({ cls: 'fmsg', text: '' })
  const [sending, setSending] = useState(false)

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
      <div className="phero"><div><div className="phero-t">Contact us</div><div className="phero-s">Monday to Saturday &middot; 9:30 AM &ndash; 6:00 PM &middot; We reply within 1 hour</div></div></div>

      <div className="sec"><div className="sec-in"><div className="g2r">
        <div>
          <div className="sh">Our offices</div>
          <div className="ocard">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, background: '#EEEEF8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pin main /></div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2D2E8F' }}>Main office &mdash; Adambakkam</div>
            </div>
            <div className="orow"><span className="ol">Address</span><span className="ov" style={{ fontSize: 12 }}>No. 64 Kakkan Nagar Main Rd,<br />Adambakkam, Chennai &ndash; 600 088</span></div>
            <div className="orow"><span className="ol">Phone</span><span className="ov"><a href="tel:+919444170065" style={{ color: '#CC2222', fontWeight: 700 }}>+91 9444170065</a></span></div>
            <div className="orow"><span className="ol">WhatsApp</span><span className="ov"><a href="https://wa.me/919444170065" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 700 }}>+91 9444170065</a></span></div>
            <div className="orow"><span className="ol">Email</span><span className="ov"><a href="mailto:venusforex2005@gmail.com" style={{ color: '#2D2E8F', fontSize: 12 }}>venusforex2005@gmail.com</a></span></div>
            <div className="orow"><span className="ol">Hours</span><span className="ov">Mon &ndash; Sat &middot; 9:30 AM &ndash; 6:00 PM</span></div>
            <div className="mbox"><iframe src="https://maps.google.com/maps?q=No.+64+Kakkan+Nagar+Main+Road+Adambakkam+Chennai+600088&output=embed" allowFullScreen loading="lazy" title="Adambakkam map"></iframe></div>
          </div>
          <div className="ocard">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, background: '#FCEAEA', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pin /></div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2D2E8F' }}>Franchisee &mdash; Mamallapuram</div>
            </div>
            <div className="orow"><span className="ol">Address</span><span className="ov" style={{ fontSize: 12 }}>Mamallapuram (Mahabalipuram),<br />Tamil Nadu</span></div>
            <div className="orow"><span className="ol">Phone</span><span className="ov"><a href="tel:+919444170065" style={{ color: '#CC2222', fontWeight: 700 }}>+91 9444170065</a></span></div>
            <div className="orow"><span className="ol">Hours</span><span className="ov">Mon &ndash; Sat &middot; 9:30 AM &ndash; 6:00 PM</span></div>
            <div className="mbox"><iframe src="https://maps.google.com/maps?q=Mamallapuram+Tamil+Nadu&output=embed" allowFullScreen loading="lazy" title="Mamallapuram map"></iframe></div>
          </div>
        </div>

        <div>
          <div className="sh">Send us a message</div>
          <div className="card" style={{ marginBottom: 18 }}>
            <form onSubmit={onSubmit}>
              <div className="ff"><label>Full name *</label><input type="text" name="name" placeholder="Your name" required /></div>
              <div className="ff"><label>Mobile number *</label><input type="tel" name="phone" placeholder="+91 xxxxxxxxxx" required /></div>
              <div className="ff"><label>Email address</label><input type="email" name="email" placeholder="your@email.com" /></div>
              <div className="ff"><label>Service needed</label>
                <select name="service"><option>Foreign currency</option><option>Forex travel card</option><option>Outward remittance (TT)</option><option>Receive money &mdash; Western Union</option><option>Receive money &mdash; MoneyGram</option><option>Doorstep delivery</option><option>Other</option></select>
              </div>
              <div className="ff"><label>Message</label><textarea name="message" placeholder="Tell us how we can help…"></textarea></div>
              <button type="submit" className="bp" disabled={sending} style={{ width: '100%' }}>{sending ? 'Sending…' : 'Send message'}</button>
              <div className={msg.cls}>{msg.text}</div>
            </form>
            <a href="https://wa.me/919444170065" target="_blank" rel="noopener noreferrer" className="wabtn" style={{ marginTop: 14 }}>&#128172; Chat on WhatsApp &mdash; fastest response</a>
          </div>

          <div className="sh">Frequently asked questions</div>
          <div className="card">
            {FAQS.map(([q, a], i) => (
              <div key={q} className={`faq${openFaq === i ? ' open' : ''}`}>
                <button type="button" className="faq-hdr" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <span className="faq-q">{q}</span><span className="faq-icon">+</span>
                </button>
                <div className="faq-a">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </div></div></div>
    </>
  )
}

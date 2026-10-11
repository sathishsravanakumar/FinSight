function Kyc({ items, note }) {
  return (
    <div className="kyc">
      <div className="kyc-t">Documents required</div>
      {items.map(t => (
        <div key={t} className="kyc-r"><span className="kyc-x">&#10003;</span><span>{t}</span></div>
      ))}
      {note && <div className="kyc-n">{note}</div>}
    </div>
  )
}

const tile = (color) => ({ background: '#F8F8FC', borderRadius: 8, padding: 10, fontSize: 12, borderLeft: `2px solid ${color}` })
const tileHead = (color) => ({ fontWeight: 700, marginBottom: 3, color })
const bigTitle = { fontWeight: 700, color: '#2D2E8F', marginBottom: 8, fontSize: 14 }
const para = { color: '#555', lineHeight: 1.7, marginBottom: 14 }

function MiniIcon({ children }) {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none">{children}</svg>
}

export default function Services() {
  return (
    <>
      <div className="phero"><div><div className="phero-t">Our services</div><div className="phero-s">Complete foreign exchange solutions for every need</div></div></div>

      <div className="sec"><div className="sec-in">
        <div className="sh">Foreign currency exchange</div>
        <div className="g2r">
          <div className="card" style={{ fontSize: 13 }}>
            <div style={bigTitle}>Buy &amp; sell foreign currency notes</div>
            <div style={para}>Exchange Indian Rupees for 30+ foreign currencies or sell your unspent foreign currency back to us. Rates updated every morning. Competitive pricing with no hidden charges.</div>
            <div className="g2" style={{ gap: 10 }}>
              <div style={tile('#2D2E8F')}><div style={tileHead('#2D2E8F')}>Cash carry limit</div><div style={{ color: '#666' }}>Up to USD 3,000 in cash abroad</div></div>
              <div style={tile('#2D2E8F')}><div style={tileHead('#2D2E8F')}>LRS annual limit</div><div style={{ color: '#666' }}>USD 2,50,000 per year per person</div></div>
            </div>
          </div>
          <Kyc
            items={['PAN card — mandatory for all transactions', 'Valid passport with 6+ months remaining validity', 'Confirmed air ticket — travel within 60 days', 'Valid visa for destination country']}
            note="Cash payments accepted up to ₹49,999 only. Above that, pay via NEFT / UPI / cheque."
          />
        </div>
      </div></div>

      <div className="sec alt"><div className="sec-in">
        <div className="sh">Prepaid forex travel card</div>
        <div className="g2r">
          <div className="card" style={{ fontSize: 13 }}>
            <div style={bigTitle}>Multi-currency card for international travel</div>
            <div style={para}>Load multiple currencies on a single card before you travel. Use at ATMs and POS terminals worldwide. Safer than carrying cash.</div>
            <div className="g3" style={{ gap: 10 }}>
              {[['15+', 'Currencies'], ['Global', 'ATM access'], ['Online', 'Top-up']].map(([n, l]) => (
                <div key={l} style={{ background: '#F8F8FC', borderRadius: 8, padding: 10, textAlign: 'center', fontSize: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#CC2222' }}>{n}</div><div style={{ color: '#666' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <Kyc
            items={['PAN card', 'Valid passport', 'Confirmed air ticket (within 60 days)', 'Valid visa']}
            note="Unused card balance can be converted back to INR within 180 days of return."
          />
        </div>
      </div></div>

      <div className="sec"><div className="sec-in">
        <div className="sh">Outward remittance &mdash; send money abroad</div>
        <div className="g2r">
          <div className="card" style={{ fontSize: 13 }}>
            <div style={bigTitle}>Telegraphic Transfer (TT) &amp; Demand Draft</div>
            <div style={para}>Send money internationally through our authorized dealer bank partners. Covers education fees, medical expenses, tour costs, family maintenance, and more.</div>
            <div className="g3" style={{ gap: 10 }}>
              {[['Education', 'University tuition & living costs'], ['Medical', 'Hospital payments abroad'], ['Travel', 'Tour cost, visa & hotel payments']].map(([h, d]) => (
                <div key={h} style={tile('#CC2222')}><div style={tileHead('#CC2222')}>{h}</div><div style={{ color: '#666' }}>{d}</div></div>
              ))}
            </div>
            <div className="warn">LRS limit: USD 2,50,000/year &middot; TCS at 20% on remittances above &#8377;7 lakh</div>
          </div>
          <Kyc
            items={['PAN card + valid passport', 'Form A2 — outward remittance declaration', 'Education: admission letter / fee demand from university', 'Medical: hospital estimate or doctor’s letter', 'Travel: confirmed itinerary & air ticket']}
            note="Payment must be via bank transfer (NEFT / RTGS). No cash for remittances."
          />
        </div>
      </div></div>

      <div className="sec alt"><div className="sec-in">
        <div className="sh">Receive money &mdash; Western Union &amp; MoneyGram</div>
        <div className="g2r">
          <div className="card" style={{ fontSize: 13 }}>
            <div style={bigTitle}>Instant inward remittance payout</div>
            <div style={{ color: '#555', lineHeight: 1.7 }}>Receive money sent by family or friends from abroad through Western Union or MoneyGram. Fast, secure, and paid out in Indian Rupees on the spot at our office.</div>
          </div>
          <Kyc items={['MTCN / Reference number from the sender', 'Valid government photo ID — Aadhaar, passport, or voter ID', 'Mobile number linked to the transfer']} />
        </div>
      </div></div>

      <div className="sec"><div className="sec-in">
        <div className="sh">Additional services</div>
        <div className="g3">
          <div className="scard"><div className="sicon"><MiniIcon><rect x="4" y="3" width="12" height="14" rx="2" stroke="#2D2E8F" strokeWidth="1.4" /><line x1="7" y1="8" x2="13" y2="8" stroke="#CC2222" strokeWidth="1.2" /><line x1="7" y1="11" x2="13" y2="11" stroke="#CC2222" strokeWidth="1.2" /></MiniIcon></div><div className="stitle">Traveler&rsquo;s cheques</div><div className="sdesc">Purchase &amp; encashment. Certificate issued on request.</div></div>
          <div className="scard"><div className="sicon"><MiniIcon><rect x="5" y="3" width="10" height="14" rx="2" stroke="#2D2E8F" strokeWidth="1.4" /><circle cx="10" cy="12" r="2.5" stroke="#CC2222" strokeWidth="1.2" /></MiniIcon></div><div className="stitle">International SIM cards</div><div className="sdesc">Stay connected in 100+ countries. Pre-activate before departure.</div></div>
          <div className="scard"><div className="sicon"><MiniIcon><path d="M10 2C6.7 2 4 4.7 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6z" stroke="#2D2E8F" strokeWidth="1.4" /><circle cx="10" cy="8" r="2" stroke="#CC2222" strokeWidth="1.2" /></MiniIcon></div><div className="stitle">Travel insurance</div><div className="sdesc">Medical, trip cancellation &amp; baggage coverage for international travel.</div></div>
        </div>
      </div></div>
    </>
  )
}

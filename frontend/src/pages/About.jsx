const MILESTONES = [
  ['2005 — Founded & RBI licensed', 'Incorporated under the Companies Act. Obtained FFMC authorization from the Reserve Bank of India, Chennai regional office.'],
  ['2007 — Franchisee in Mamallapuram', 'Expanded to serve foreign tourists along the heritage Coromandel Coast corridor.'],
  ['2010 — Western Union & MoneyGram', 'Became an authorized channel partner for inward remittance services.'],
  ['2015 — Full service portfolio', 'Added prepaid forex travel cards, international SIM cards, and travel insurance.'],
  ['2026 — Present', 'Serving thousands of customers each year across travel, education, medical, and business forex needs.'],
]

const DIRECTORS = [
  ['SR', 'Swaminathan Raja', '#EEEEF8', '#2D2E8F'],
  ['SS', 'Srinivasan Sathish', '#FCEAEA', '#CC2222'],
  ['SM', 'Sundaram Manoharan', '#EEEEF8', '#2D2E8F'],
]

const cell = { padding: '8px 0', borderBottom: '1px solid #f0f0f6' }

export default function About() {
  return (
    <>
      <div className="phero"><div><div className="phero-t">About Venus Forex</div><div className="phero-s">Trusted foreign exchange services in Chennai since 2005</div></div></div>

      <div className="sec"><div className="sec-in">
        <div className="sh">Our story</div>
        <div className="card" style={{ fontSize: 13, color: '#555', lineHeight: 1.85 }}>
          Venus Forex Private Limited was founded in 2005 by a team of experienced forex professionals in Chennai. Authorized by the Reserve Bank of India as a Full Fledged Money Changer (FFMC) under Section 10 of FEMA 1999, we have spent over two decades making foreign exchange simple, transparent, and accessible for every traveler, student, patient, and business in Chennai. From our main office in Adambakkam and our franchisee location in Mamallapuram, we serve individuals and families across Tamil Nadu with competitive rates and genuinely personal service.
        </div>
      </div></div>

      <div className="sec alt"><div className="sec-in">
        <div className="sh">Our milestones</div>
        <div className="card">
          {MILESTONES.map(([yr, desc], i) => (
            <div key={yr} className="tl-item" style={i === MILESTONES.length - 1 ? { paddingBottom: 0 } : undefined}>
              <div className="tl-dot" style={i === MILESTONES.length - 1 ? { background: '#ccc' } : undefined}></div>
              <div><div className="tl-yr">{yr}</div><div className="tl-desc">{desc}</div></div>
            </div>
          ))}
        </div>
      </div></div>

      <div className="sec"><div className="sec-in">
        <div className="sh">Mission &amp; vision</div>
        <div className="g2">
          <div className="card accent"><div style={{ fontSize: 13, fontWeight: 700, color: '#2D2E8F', marginBottom: 6 }}>Mission</div><div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>To simplify foreign exchange for every customer &mdash; making it safe, transparent, and affordable with no hidden charges.</div></div>
          <div className="card accent"><div style={{ fontSize: 13, fontWeight: 700, color: '#2D2E8F', marginBottom: 6 }}>Vision</div><div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>To be the most trusted forex partner in Chennai, known for integrity, competitive rates, and a customer-first approach.</div></div>
        </div>
      </div></div>

      <div className="sec alt"><div className="sec-in">
        <div className="sh">Board of directors</div>
        <div className="g3">
          {DIRECTORS.map(([ini, name, bg, fg]) => (
            <div key={ini} className="dcard">
              <div className="avt" style={{ background: bg, color: fg }}>{ini}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2D2E8F' }}>{name}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Director</div>
            </div>
          ))}
        </div>
      </div></div>

      <div className="sec"><div className="sec-in">
        <div className="sh">Company credentials</div>
        <div className="card">
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ ...cell, color: '#888', fontWeight: 600 }}>RBI licence type</td><td style={{ ...cell, textAlign: 'right', color: '#2D2E8F', fontWeight: 700 }}>Full Fledged Money Changer (FFMC)</td></tr>
              <tr><td style={{ ...cell, color: '#888', fontWeight: 600 }}>CIN</td><td style={{ ...cell, textAlign: 'right', fontFamily: 'monospace', fontSize: 12 }}>U67190TN2005PTC055410</td></tr>
              <tr><td style={{ ...cell, color: '#888', fontWeight: 600 }}>Incorporated</td><td style={{ ...cell, textAlign: 'right' }}>17 February 2005</td></tr>
              <tr><td style={{ ...cell, color: '#888', fontWeight: 600 }}>Governing act</td><td style={{ ...cell, textAlign: 'right' }}>FEMA 1999, Section 10</td></tr>
              <tr><td style={{ padding: '8px 0', color: '#888', fontWeight: 600 }}>Paid-up capital</td><td style={{ padding: '8px 0', textAlign: 'right' }}>&#8377;50,00,000</td></tr>
            </tbody>
          </table>
        </div>
      </div></div>
    </>
  )
}

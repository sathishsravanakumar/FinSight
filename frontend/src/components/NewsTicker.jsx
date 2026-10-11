import { useEffect, useState } from 'react'
import { ratesApi } from '../api/rates'

export default function NewsTicker() {
  const [items, setItems] = useState([])

  useEffect(() => {
    let alive = true
    ratesApi.news()
      .then(d => { if (alive) setItems(d.items || []) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const content = items.map((h, i) => (
    <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <a className="ticker-item" href={h.link} target="_blank" rel="noopener noreferrer">&#9642; {h.title}</a>
      <span className="ticker-sep">|</span>
    </span>
  ))

  return (
    <div className="ticker-wrap">
      <div className="ticker-label">&#128202; Forex news</div>
      <div className="ticker-mask">
        {items.length === 0 ? (
          <div className="ticker-track"><span className="ticker-loading">Loading live forex news&hellip;</span></div>
        ) : (
          <div className="ticker-track" style={{ animationDuration: `${Math.max(40, items.length * 9)}s` }}>
            {content}{content}
          </div>
        )}
      </div>
    </div>
  )
}

// Enquiry / contact forms are delivered by email through formsubmit.co (same as the original design).
const ENDPOINT = 'https://formsubmit.co/ajax/sravanakumarsathish02@gmail.com'

export async function submitEnquiry(form) {
  const payload = {}
  new FormData(form).forEach((v, k) => { payload[k] = v })
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    const j = await res.json()
    if (j.success === 'true' || j.success === true) return { ok: true }
    throw new Error('failed')
  } catch {
    return { ok: false, error: '✗ Could not send. Please call us at +91 9444170065' }
  }
}

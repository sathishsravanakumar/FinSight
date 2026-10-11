import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div className="footer">
      <div className="flogo"><img src="/logo.png" alt="Venus Forex" /></div>
      <div className="fg">
        <div>
          <div className="fh">Venus Forex Pvt Ltd</div>
          <span className="fl">No. 64, Kakkan Nagar Main Road</span>
          <span className="fl">Adambakkam, Chennai &ndash; 600 088</span>
          <a href="tel:+919444170065" className="fl">+91 9444170065</a>
          <a href="mailto:venusforex2005@gmail.com" className="fl">venusforex2005@gmail.com</a>
          <span className="fl">Mon &ndash; Sat &middot; 9:30 AM &ndash; 6:00 PM</span>
        </div>
        <div>
          <div className="fh">Quick links</div>
          <Link to="/" className="fl">Home</Link>
          <Link to="/about" className="fl">About us</Link>
          <Link to="/services" className="fl">Services</Link>
          <Link to="/rates" className="fl">Exchange rates</Link>
          <Link to="/contact" className="fl">Contact us</Link>
          <Link to="/forecast" className="fl">Rate forecast</Link>
        </div>
        <div>
          <div className="fh">Registration details</div>
          <span className="rlabel">CIN</span><span className="rval">U67190TN2005PTC055410</span>
          <span className="rlabel">RBI FFMC Licence No.</span><span className="rval">[XXXXXXX]</span>
          <span className="rlabel">Incorporated</span><span className="fl" style={{ fontFamily: 'inherit', cursor: 'default' }}>17 February 2005</span>
        </div>
        <div>
          <div className="fh">Legal</div>
          <span className="fl">Privacy policy</span>
          <span className="fl">Terms of use</span>
          <span className="fl">Disclaimer</span>
        </div>
      </div>
      <div className="fbot">
        &copy; 2026 Venus Forex Private Limited &middot; Authorized by Reserve Bank of India under FEMA 1999<br />
        Rates are indicative and subject to change &middot; All transactions subject to applicable GST &amp; TCS
      </div>
    </div>
  )
}

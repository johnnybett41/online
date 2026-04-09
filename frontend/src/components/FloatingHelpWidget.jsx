import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, PhoneCall, X } from 'lucide-react';
import './FloatingHelpWidget.css';

const whatsappUrl = 'https://wa.me/254111487078';

const FloatingHelpWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`help-widget ${open ? 'open' : ''}`}>
      {open && (
        <div className="help-widget__panel" role="dialog" aria-label="Quick help options">
          <div className="help-widget__header">
            <div>
              <strong>Need a hand?</strong>
              <span>We’re here for checkout, delivery, and product questions.</span>
            </div>
            <button type="button" className="help-widget__close" onClick={() => setOpen(false)} aria-label="Close help widget">
              <X size={16} />
            </button>
          </div>

          <a href={whatsappUrl} className="help-widget__action help-widget__action--primary" target="_blank" rel="noreferrer noopener">
            <MessageCircle size={16} />
            Chat on WhatsApp
          </a>
          <Link to="/contact" className="help-widget__action">
            <PhoneCall size={16} />
            Contact support
          </Link>
        </div>
      )}

      <button type="button" className="help-widget__toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <MessageCircle size={18} />
        <span>Help</span>
      </button>
    </div>
  );
};

export default FloatingHelpWidget;

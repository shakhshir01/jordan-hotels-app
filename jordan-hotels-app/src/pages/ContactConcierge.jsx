import React, { useState } from 'react';

export default function ContactConcierge() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    priority: 'normal',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Concierge request:', formData);

    // Track contact form submission
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'contact_submit', {
        event_category: 'engagement',
        event_label: 'Concierge Form'
      });
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '', priority: 'normal' });
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-black gradient-text mb-2">Concierge Service</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">Get personalized assistance for your Jordan trip</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="card-modern p-8 mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Available 24/7</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">📞</span>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-slate-100">Call Us</p>
                  <p className="text-slate-600 dark:text-slate-400">+962 6 465 1234</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">✉️</span>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-slate-100">Email</p>
                  <p className="text-slate-600 dark:text-slate-400">concierge@VISIT-JO.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">💬</span>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-slate-100">WhatsApp</p>
                  <p className="text-slate-600 dark:text-slate-400">+962 79 5555 1234</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Services Include:</h4>
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <li>✓ Restaurant reservations</li>
              <li>✓ Tour bookings</li>
              <li>✓ Transportation arrangements</li>
              <li>✓ Special event planning</li>
              <li>✓ Emergency assistance</li>
              <li>✓ Local recommendations</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-modern p-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Request Assistance</h3>

          {submitted && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-xl">
              Thank you! Our concierge team will contact you shortly.
            </div>
          )}

          <div className="mb-4">
            <label className="label-premium">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-premium"
              placeholder="Your name"
            />
          </div>

          <div className="mb-4">
            <label className="label-premium">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-premium"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-4">
            <label className="label-premium">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="input-premium"
              placeholder="+962"
            />
          </div>

          <div className="mb-4">
            <label className="label-premium">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input-premium"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="label-premium">Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="input-premium"
              placeholder="Tell us how we can help..."
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 font-bold"
          >
            Send Request
          </button>
        </form>
      </div>
    </div>
  );
}

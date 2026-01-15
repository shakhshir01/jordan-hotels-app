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
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '', priority: 'normal' });
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Concierge Service</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Get personalized assistance for your Jordan trip</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-2xl font-bold mb-4">Available 24/7</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">📞</span>
                <div>
                  <p className="font-bold">Call Us</p>
                  <p className="text-gray-600 dark:text-gray-300">+962 6 465 1234</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">✉️</span>
                <div>
                  <p className="font-bold">Email</p>
                  <p className="text-gray-600 dark:text-gray-300">concierge@visitjo.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">💬</span>
                <div>
                  <p className="font-bold">WhatsApp</p>
                  <p className="text-gray-600 dark:text-gray-300">+962 79 5555 1234</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-bold mb-3">Services Include:</h4>
            <ul className="space-y-2 text-sm">
              <li>✓ Restaurant reservations</li>
              <li>✓ Tour bookings</li>
              <li>✓ Transportation arrangements</li>
              <li>✓ Special event planning</li>
              <li>✓ Emergency assistance</li>
              <li>✓ Local recommendations</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-6">Request Assistance</h3>

          {submitted && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              Thank you! Our concierge team will contact you shortly.
            </div>
          )}

          <div className="mb-4">
            <label className="block font-bold mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Your name"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold mb-2">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2"
              placeholder="+962"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block font-bold mb-2">Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Tell us how we can help..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold"
          >
            Send Request
          </button>
        </form>
      </div>
    </div>
  );
}

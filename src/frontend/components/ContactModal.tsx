import React, { useState } from 'react';
import { Modal } from './Modal';
import { Mail, MessageCircle, Send, CheckCircle2, Globe } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  supportEmail?: string;
  supportPhone?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  supportEmail = 'hello@reviewscore.ai',
  supportPhone = '+91 99309 52947'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    subject: 'Sales Inquiry',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  const whatsappClean = supportPhone.replace(/[^0-9]/g, '') || '919930952947';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact ReviewScore AI Team"
      subtitle="Have questions about agency plans, custom onboarding, or enterprise white-label solutions?"
      maxWidth="max-w-3xl"
    >
      {submitted ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#EEF2F7] text-[#22C55E] border border-[#DCE3EC] flex items-center justify-center mx-auto shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
            <CheckCircle2 className="w-10 h-10 text-[#22C55E]" />
          </div>
          <h3 className="text-xl font-extrabold text-[#1E293B]">Message Received!</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
            Thank you for reaching out. Our enterprise customer success manager will contact you within 2 business hours.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Form (7 cols) */}
          <form onSubmit={handleSubmit} className="md:col-span-7 space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 clay-input text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@clinic.com"
                  className="w-full px-3.5 py-2.5 clay-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  pattern="^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$"
                  title="Please enter a valid phone number (e.g., +91 98765 43210)"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 clay-input text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Business Name</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Smile Dental Clinic"
                  className="w-full px-3.5 py-2.5 clay-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#1E293B] mb-1">Inquiry Type</label>
              <select
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 clay-input text-xs cursor-pointer"
              >
                <option value="Sales Inquiry">Sales & Custom Agency Plans</option>
                <option value="Technical Support">Technical & API Support</option>
                <option value="White Label Agency">White-Label Partner Program</option>
                <option value="Enterprise Customization">Enterprise Customization</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#1E293B] mb-1">Message *</label>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your business goals and number of locations..."
                className="w-full px-3.5 py-2.5 clay-input text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 clay-btn-primary text-xs cursor-pointer flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>

          {/* Contact Details Column (5 cols) */}
          <div className="md:col-span-5 clay-card bg-[#EEF2F7] border border-[#DCE3EC] p-5 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]">Direct Support Channels</span>
              <h4 className="text-base font-extrabold mt-1 text-[#1E293B]">Get In Touch Immediately</h4>
              <p className="text-xs text-[#64748B] mt-1">We respond instantly on WhatsApp and within 2 hours on email.</p>
            </div>

            <div className="space-y-3 text-xs">
              <a
                href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent('Hi! I am reaching out from your website contact form.')}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-white rounded-2xl border border-[#DCE3EC] flex items-center space-x-3 hover:border-[#2563EB] transition-colors shadow-[2px_2px_6px_rgba(100,116,139,0.06)]"
              >
                <MessageCircle className="w-5 h-5 text-[#2563EB] shrink-0" />
                <div>
                  <span className="font-extrabold text-[#1E293B] block">WhatsApp Sales Desk</span>
                  <span className="text-[10px] text-[#64748B]">{supportPhone}</span>
                </div>
              </a>

              <div className="p-3 bg-white rounded-2xl border border-[#DCE3EC] flex items-center space-x-3 shadow-[2px_2px_6px_rgba(100,116,139,0.06)]">
                <Mail className="w-5 h-5 text-[#2563EB] shrink-0" />
                <div>
                  <span className="font-extrabold text-[#1E293B] block">Email Support</span>
                  <span className="text-[10px] text-[#64748B]">{supportEmail}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#DCE3EC] flex items-center space-x-3 shadow-[2px_2px_6px_rgba(100,116,139,0.06)]">
                <Globe className="w-5 h-5 text-[#2563EB] shrink-0" />
                <div>
                  <span className="font-extrabold text-[#1E293B] block">Global Headquarters</span>
                  <span className="text-[10px] text-[#64748B]">San Francisco, CA & Mumbai, MH</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-[#64748B] text-center font-bold">
              Available 24/7 for Enterprise SLA clients.
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

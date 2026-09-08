'use client';
import React from 'react';
import { Phone, Mail, MessageCircle, HelpCircle } from 'lucide-react';
import MlmMemberLayout from '@/components/features/mlm/MlmMemberLayout';
export default function NextViewSupportPage() {
    const faqs = [
        {
            q: 'How does the 3×15 Network placement work?',
            a: 'When new members register with your referral link, they are automatically placed top-to-bottom, left-to-right in your 3×15 network hierarchy. You can personally sponsor up to 3 direct members in Level 1; further members spill over into your downline.',
        },
        {
            q: 'When are Level rewards credited?',
            a: 'Level rewards are generated instantly upon eligible FD or FD-Card product bookings completed by members in your 15-level network hierarchy.',
        },
        {
            q: 'What is the minimum withdrawal limit?',
            a: 'The standard minimum wallet withdrawal is ₹500. Payouts are transferred via Direct Bank Transfer (NEFT/IMPS) or UPI within 24 to 48 working hours.',
        },
        {
            q: 'Why is KYC required?',
            a: 'KYC compliance (PAN, Aadhaar, and Bank verification) ensures regulatory adherence and secures your payout destination before funds are disbursed.',
        },
    ];
    return (<MlmMemberLayout activePath="/nextview/support">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">Member Support Desk</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Get prompt assistance for KYC, network positions, wallet payouts, and FD products.
          </p>
        </div>

        {/* Contact Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="tel:+918031492661" className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2 block hover:border-amber-300 transition">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Phone className="w-5 h-5"/>
            </div>
            <h3 className="text-xs font-extrabold text-slate-900">Member Helpline</h3>
            <p className="text-xs font-bold text-amber-700">+91 8031492661</p>
            <p className="text-[10px] text-slate-400">Mon–Sat, 10:00 AM – 6:00 PM</p>
          </a>

          <a href="https://wa.me/918031492661" target="_blank" rel="noopener noreferrer" className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2 block hover:border-emerald-300 transition">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5"/>
            </div>
            <h3 className="text-xs font-extrabold text-slate-900">WhatsApp Support</h3>
            <p className="text-xs font-bold text-emerald-700">+91 8031492661</p>
            <p className="text-[10px] text-slate-400">Instant query resolution</p>
          </a>

          <a href="mailto:info@sakhihub.com" className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2 block hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5"/>
            </div>
            <h3 className="text-xs font-extrabold text-slate-900">Email Desk</h3>
            <p className="text-xs font-bold text-blue-700">info@sakhihub.com</p>
            <p className="text-[10px] text-slate-400">Response within 24 business hours</p>
          </a>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <HelpCircle className="w-5 h-5 text-amber-600"/>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (<div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <h4 className="text-xs font-extrabold text-slate-900">{faq.q}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>))}
          </div>
        </div>
      </div>
    </MlmMemberLayout>);
}

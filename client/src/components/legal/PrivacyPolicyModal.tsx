import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Server, Database, Phone, MapPin, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 to-teal-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#167D73] text-white flex items-center justify-center shadow-md shadow-teal-700/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Evalipie Privacy Policy
                </h2>
                <span className="bg-[#E9F7F3] text-[#105B55] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  DPDP Act 2023 Compliant
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Effective Date: November 2026 · Bengaluru Hyperlocal Commerce
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-sm text-gray-700 leading-relaxed font-sans">
          
          {/* Section 1: Overview */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#167D73]" />
              1. Our Foundational Privacy Promise
            </h3>
            <p>
              Evalipie Technologies Inc. (<b>"Evalipie"</b>, <b>"we"</b>, or <b>"us"</b>) is built to champion independent neighborhood kirana stores, electronics retailers, and local merchants across Bengaluru. We operate with a strict principle: <b>We do not monetize, sell, or rent your personal browsing data or phone number to third-party ad networks.</b>
            </p>
            <p>
              Your data is collected solely to verify store inventory, calculate real walking and 30-minute delivery distances, route orders to local shops, and deliver reliable customer support.
            </p>
          </div>

          {/* Section 2: Localized Data We Collect */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#167D73]" />
              2. Information We Collect & Why
            </h3>
            <ul className="space-y-2 list-disc pl-5 text-gray-600 text-xs sm:text-sm">
              <li>
                <b>Contact Information:</b> Your name, mobile phone number, and delivery address (e.g. Indiranagar, Jayanagar, Koramangala) to fulfill orders and provide instant SMS/WhatsApp delivery updates.
              </li>
              <li>
                <b>Hyperlocal Location Data:</b> Approximate postal code or neighbourhood geolocation strictly used to display store proximity (e.g. "0.8 km away") and verify in-stock delivery radiuses. We do not track continuous background GPS location.
              </li>
              <li>
                <b>Order & Transaction Records:</b> Order items, merchant listing IDs, payment timestamps, and fulfillment preferences (Store Pickup or 30-Min Local Delivery).
              </li>
            </ul>
          </div>

          {/* Section 3: Voice & Speech Privacy */}
          <div className="bg-[#E9F7F3] border border-[#167D73]/20 rounded-2xl p-5 space-y-2 text-[#105B55]">
            <h3 className="text-sm font-black flex items-center gap-2 text-[#0D6258]">
              <EyeOff className="w-4 h-4" />
              3. Voice & Audio Processing (Local & Offline-First)
            </h3>
            <p className="text-xs leading-relaxed">
              When utilizing voice search or Kirana ledger features:
            </p>
            <ul className="space-y-1.5 list-disc pl-5 text-xs text-[#105B55]">
              <li><b>Speech parsing runs locally</b> in your browser using modern Web Speech APIs whenever available.</li>
              <li><b>Raw audio files are never stored</b> on our servers. Full voice recordings are never retained or archived.</li>
              <li><b>No third-party training:</b> Your voice inputs are never used to train public commercial AI foundation models.</li>
              <li>Offline copies on merchant devices are encrypted with AES-GCM in IndexedDB and sync only with explicit user consent.</li>
            </ul>
          </div>

          {/* Section 4: Self-Hosted AI System */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#167D73]" />
              4. Self-Hosted AI Intelligence Disclosures
            </h3>
            <p>
              The Evalipie Intelligence Engine operates on <b>self-hosted, open-weight foundation models (Qwen2.5-3B)</b> hosted on our own dedicated server infrastructure. 
            </p>
            <p className="text-xs text-gray-600">
              When you ask Evalipie AI for recommendations (e.g. <i>"I need a laptop for programming under ₹60,000"</i>), your prompt is processed internally without forwarding requests to external commercial LLM APIs like OpenAI, TrueFoundry, or Google Gemini. Product suggestions are strictly grounded in verified catalogue database listings.
            </p>
          </div>

          {/* Section 5: Security & Anti-Overselling */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#167D73]" />
              5. Row-Level Inventory Security & Safe Checkout
            </h3>
            <p>
              Evalipie uses atomic row-level database locks during order reservation. This guarantees that your selected inventory is physically allocated to your order in real-time, preventing phantom inventory or duplicate overselling across retail counters.
            </p>
          </div>

          {/* Section 6: User Rights */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#167D73]" />
              6. Your Rights under India's DPDP Act 2023
            </h3>
            <p>
              In full compliance with the Digital Personal Data Protection Act (DPDP Act 2023) and international data privacy benchmarks, you maintain:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <b>Right to Access & Portability:</b> Request an export of your order history and account details at any time.
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <b>Right to Erasure:</b> Request permanent deletion of your customer profile and stored addresses.
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <b>Right to Withdraw Consent:</b> Opt-out of non-essential SMS updates or merchant marketing alerts with 1-click.
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <b>Grievance Redressal:</b> Direct access to our designated Data Protection Officer with 48-hour SLA.
              </div>
            </div>
          </div>

          {/* Section 7: Contact & DPO */}
          <div className="border-t border-gray-100 pt-5 space-y-2 text-xs text-gray-500">
            <h4 className="font-extrabold text-gray-800 text-sm">Data Protection Officer & Contact</h4>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#167D73]" />
              Evalipie Technologies Inc., 42, 100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#167D73]" />
              Privacy & Legal Desk: <span className="text-[#167D73] font-bold">privacy@evalipie.in</span> · +91 (080) 4567-8900
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium hidden sm:block">
            Your trust is the foundation of local commerce.
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-[#167D73] hover:bg-[#105B55] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};

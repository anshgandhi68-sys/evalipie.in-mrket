import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, EyeOff, Server, Database, Phone, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-gray-900 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#167D73] hover:text-[#105B55] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#167D73] text-white flex items-center justify-center shadow-md shadow-teal-700/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="bg-[#E9F7F3] text-[#105B55] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                DPDP Act 2023 Compliant
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mt-1">
                Evalipie Privacy Policy
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed max-w-2xl">
            How Evalipie Technologies Inc. protects customer, merchant, and neighborhood store data across our hyperlocal e-commerce marketplace and voice discovery systems.
          </p>
          <div className="text-xs text-gray-400 font-semibold pt-2 border-t border-gray-100 flex flex-wrap gap-4">
            <span>Last Updated: November 2026</span>
            <span>·</span>
            <span>Version: 2.4</span>
            <span>·</span>
            <span>Jurisdiction: Bengaluru, Karnataka, India</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xs space-y-10 text-sm sm:text-base text-gray-700 leading-relaxed">
          
          {/* 1. Core Commitment */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#167D73]" />
              1. Our Foundational Privacy Promise
            </h2>
            <p>
              Evalipie Technologies Inc. (<b>"Evalipie"</b>, <b>"we"</b>, <b>"our"</b>, or <b>"us"</b>) operates <code>evalipie.in</code>, India's real-time hyperlocal marketplace connecting shoppers directly to physical neighbourhood shops.
            </p>
            <div className="bg-[#E9F7F3] border border-[#167D73]/20 rounded-2xl p-5 text-sm text-[#105B55] font-medium">
              <b>Zero Data Selling Guarantee:</b> We never sell, rent, or trade your personal information, search queries, or phone numbers to advertising networks, data brokers, or third parties.
            </div>
          </section>

          {/* 2. Information We Collect */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#167D73]" />
              2. Information We Collect
            </h2>
            <p>
              We collect only the minimum information necessary to discover items in physical neighborhood stores, process purchases, and arrange 30-minute doorstep deliveries or store walk-in pickups:
            </p>
            <ul className="space-y-3 list-disc pl-5 text-sm text-gray-600">
              <li>
                <b>Personal Identifiers:</b> Name, mobile phone number (for SMS/WhatsApp order confirmations and store pickup codes), and delivery street address.
              </li>
              <li>
                <b>Hyperlocal Geolocation:</b> Your approximate locality or postal code (e.g. Indiranagar 560038, Jayanagar 560041) strictly used to calculate store proximity (e.g. "0.8 km away") and verify physical stock availability. We do not track continuous background location.
              </li>
              <li>
                <b>Order & Cart Records:</b> Product listing IDs, quantity, store allocation, and payment timestamps.
              </li>
            </ul>
          </section>

          {/* 3. Local Voice & Audio Processing */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-[#167D73]" />
              3. Voice & Speech Privacy (Local & Offline-First)
            </h2>
            <p>
              Evalipie supports speech-to-text queries and Voice Khata ledger interactions designed with strict privacy boundaries:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1.5">
                <h4 className="font-bold text-gray-900">Local Browser Processing</h4>
                <p className="text-gray-600">Speech is transcribed directly on your device via standard browser Web Speech APIs without sending raw audio to centralized servers.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1.5">
                <h4 className="font-bold text-gray-900">No Audio Archival</h4>
                <p className="text-gray-600">We do not store, record, or retain raw audio clips. Our servers receive only validated text transcripts required for catalogue search.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1.5">
                <h4 className="font-bold text-gray-900">Zero Model Training on Voice</h4>
                <p className="text-gray-600">Your spoken queries are never used to train public commercial AI models.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1.5">
                <h4 className="font-bold text-gray-900">Encrypted Local Storage</h4>
                <p className="text-gray-600">Offline store records and customer balances are encrypted using client-side AES-GCM in IndexedDB.</p>
              </div>
            </div>
          </section>

          {/* 4. Self-Hosted AI Intelligence Engine Disclosures */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-[#167D73]" />
              4. Self-Hosted AI Engine Disclosures
            </h2>
            <p>
              Evalipie AI operates an <b>independent, self-hosted open-weight foundation model (Qwen2.5-3B)</b> running on our controlled infrastructure with Metal GPU acceleration:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-sm text-gray-600">
              <li><b>Zero Cloud AI Leaks:</b> When you search (e.g. <i>"programming laptop under ₹60,000"</i>), your prompts are never forwarded to third-party hosted commercial APIs like OpenAI, Google, or TrueFoundry.</li>
              <li><b>Anti-Hallucination Grounding:</b> The AI is restricted by deterministic database tools to recommend only verified physical products and in-stock listings.</li>
            </ul>
          </section>

          {/* 5. Inventory & Concurrency Safety */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#167D73]" />
              5. Row-Level Inventory Locks & Zero Phantom Stock
            </h2>
            <p>
              Unlike traditional marketplaces that show unverified warehouse estimates, Evalipie integrates directly with physical store POS systems using atomic row-level database locks. When you confirm checkout, the item is locked exclusively for your order, guaranteeing you never arrive at a store only to find the item was sold minutes earlier.
            </p>
          </section>

          {/* 6. User Rights under India's DPDP Act 2023 */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#167D73]" />
              6. Your Rights under India's DPDP Act 2023
            </h2>
            <p>
              As a data principal under the Digital Personal Data Protection Act (DPDP Act 2023), you hold the following rights:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="border border-gray-200 rounded-2xl p-4">
                <b className="text-gray-900 block mb-1">Right to Access Information</b>
                <span className="text-gray-600">View all personal data, active orders, and store transaction logs linked to your phone number.</span>
              </div>
              <div className="border border-gray-200 rounded-2xl p-4">
                <b className="text-gray-900 block mb-1">Right to Correction & Erasure</b>
                <span className="text-gray-600">Request updating incorrect details or permanent removal of your address and shopping records.</span>
              </div>
              <div className="border border-gray-200 rounded-2xl p-4">
                <b className="text-gray-900 block mb-1">Right of Grievance Redressal</b>
                <span className="text-gray-600">Direct escalation to our Data Protection Officer with mandatory 48-hour acknowledgment.</span>
              </div>
              <div className="border border-gray-200 rounded-2xl p-4">
                <b className="text-gray-900 block mb-1">Right to Nominate</b>
                <span className="text-gray-600">Designate a representative to exercise your data rights in event of incapacity.</span>
              </div>
            </div>
          </section>

          {/* 7. Contact Details */}
          <section className="border-t border-gray-200 pt-8 space-y-3">
            <h3 className="text-lg font-black text-gray-900">
              Data Protection Officer & Redressal Desk
            </h3>
            <p className="text-sm text-gray-600">
              If you have any questions, requests for data deletion, or grievances regarding this Privacy Policy, please reach out directly:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#167D73] shrink-0" />
                <b>Evalipie Technologies Inc.</b> — 42, 100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#167D73] shrink-0" />
                <b>Email:</b> <a href="mailto:privacy@evalipie.in" className="text-[#167D73] underline font-bold">privacy@evalipie.in</a> · <b>Helpline:</b> +91 (080) 4567-8900
              </p>
            </div>
          </section>

        </div>

        {/* Bottom Back Button */}
        <div className="text-center pt-4">
          <Link
            to="/"
            className="inline-block bg-[#167D73] hover:bg-[#105B55] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            Return to Marketplace
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

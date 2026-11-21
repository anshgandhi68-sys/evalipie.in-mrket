import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Database, ArrowLeft } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#111111] font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#111111] hover:text-[#B84A27] uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>RETURN TO STOREFRONT</span>
        </Link>

        {/* Header Card */}
        <div className="bg-[#FFFFFF] p-8 sm:p-12 border border-[#111111] shadow-architectural space-y-4 rounded-[0px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#111111] text-white flex items-center justify-center rounded-[0px]">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <span className="bg-[#F6F5F0] border border-[#111111] text-[#111111] text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-[0px]">
                DPDP ACT 2023 COMPLIANT
              </span>
              <h1 className="font-display font-bold text-2xl sm:text-4xl text-[#111111] uppercase tracking-tight mt-1.5">
                EVALIPIE PRIVACY POLICY
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#5A5852] font-sans leading-relaxed max-w-2xl">
            How Evalipie Technologies Inc. safeguards shopper, merchant, and inventory telemetry across our real-time retail synchronization infrastructure.
          </p>
          <div className="text-[11px] font-mono text-[#5A5852] pt-3 border-t border-[#E4E2DA] flex flex-wrap gap-4">
            <span>LAST AUDITED: NOVEMBER 2026</span>
            <span>:</span>
            <span>SPEC: VERSION 3.1</span>
            <span>:</span>
            <span>JURISDICTION: BENGALURU, INDIA</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-[#FFFFFF] p-8 sm:p-12 border border-[#E4E2DA] shadow-architectural space-y-8 text-xs sm:text-sm text-[#111111] leading-relaxed rounded-[0px]">
          
          <section className="space-y-3">
            <h2 className="font-mono font-bold text-base text-[#111111] uppercase tracking-wide flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#B84A27] stroke-[1.5]" />
              1. FOUNDATIONAL PRIVACY PROTOCOL
            </h2>
            <p className="text-[#5A5852]">
              Evalipie Technologies Inc. operates with an uncompromised architectural principle: We do not monetize, sell, or rent your browsing patterns or contact details to third-party ad networks.
            </p>
            <p className="text-[#5A5852]">
              Your telemetry is processed exclusively to verify physical store inventory, compute localized route proximity across Indian metros, allocate atomic checkout locks in Aiven PostgreSQL, and confirm delivery fulfillment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-mono font-bold text-base text-[#111111] uppercase tracking-wide flex items-center gap-2">
              <Database className="w-4 h-4 text-[#B84A27] stroke-[1.5]" />
              2. INFORMATION WE PROCESS & RETENTION
            </h2>
            <ul className="space-y-2 list-disc pl-5 text-[#5A5852]">
              <li><b>Coarse Proximity Data:</b> Nearest neighborhood retail hub coordinates (Indiranagar, Jayanagar, Whitefield, etc.).</li>
              <li><b>Order Dispatch Metadata:</b> Customer name, phone number, and delivery street address retained solely for fulfillment.</li>
              <li><b>ACID Inventory Lock Tokens:</b> Ephemeral transaction reservation identifiers dispatched over Aiven Kafka.</li>
            </ul>
          </section>

          <div className="p-4 bg-[#F6F5F0] border border-[#E4E2DA] font-mono text-xs text-[#5A5852] rounded-[0px]">
            <p className="font-bold text-[#111111] uppercase mb-1">DATA PROTECTION OFFICER</p>
            <p>EVALIPIE LEGAL & COMPLIANCE DIVISION : INDIRANAGAR 100FT ROAD, BENGALURU, 560038 : PRIVACY@EVALIPIE.IN</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

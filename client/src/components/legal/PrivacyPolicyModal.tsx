import React from 'react';
import { X, ShieldCheck, Lock, Database } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#FFFFFF] border border-[#111111] shadow-architectural max-w-3xl w-full max-h-[88vh] flex flex-col rounded-[0px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#E4E2DA] flex items-center justify-between bg-[#F6F5F0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#111111] text-white flex items-center justify-center rounded-[0px]">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-[#111111] uppercase tracking-wide">
                  EVALIPIE PRIVACY POLICY
                </h2>
                <span className="bg-[#FFFFFF] border border-[#111111] text-[#111111] text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-[0px]">
                  DPDP ACT 2023 COMPLIANT
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#5A5852] mt-0.5">
                EFFECTIVE DATE: NOVEMBER 2026 : NATIONWIDE RETAIL PROTOCOL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#5A5852] hover:text-[#111111] p-1 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#111111] leading-relaxed font-sans">
          
          <div className="space-y-2">
            <h3 className="font-mono font-bold text-sm text-[#111111] uppercase flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#B84A27] stroke-[1.5]" />
              1. Foundational Privacy Commitment
            </h3>
            <p className="text-[#5A5852]">
              Evalipie Technologies Inc. operates with a strict mandate: We do not monetize, sell, or rent your personal browsing telemetry or phone number to third-party ad networks.
            </p>
            <p className="text-[#5A5852]">
              Your data is collected solely to verify store inventory, calculate real walking and dispatch distances, route orders to local shops, and deliver reliable customer support.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-mono font-bold text-sm text-[#111111] uppercase flex items-center gap-2">
              <Database className="w-4 h-4 text-[#B84A27] stroke-[1.5]" />
              2. Information We Process
            </h3>
            <ul className="space-y-1.5 list-disc pl-5 text-[#5A5852]">
              <li><b>Store Proximity Coordinates:</b> Coarse location data to match nearest retail hubs across Indian metros.</li>
              <li><b>Order Delivery Information:</b> Name, mobile number, and street address required strictly for local dispatch fulfillment.</li>
              <li><b>ACID Inventory Locks:</b> Ephemeral transaction locks in Aiven PostgreSQL to prevent double-selling of low-stock items.</li>
            </ul>
          </div>

          <div className="p-4 bg-[#F6F5F0] border border-[#E4E2DA] space-y-1 font-mono text-[11px] rounded-[0px]">
            <p className="font-bold text-[#111111] uppercase">DATA SECURITY & ENCRYPTION</p>
            <p className="text-[#5A5852] font-sans">
              All in-flight communications are secured over TLS 1.3 with AES-256 encryption at rest across Aiven PostgreSQL and Kafka storage layers.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E4E2DA] bg-[#F6F5F0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#111111] hover:bg-[#B84A27] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-[0px] transition-colors"
          >
            I UNDERSTAND
          </button>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyModal;

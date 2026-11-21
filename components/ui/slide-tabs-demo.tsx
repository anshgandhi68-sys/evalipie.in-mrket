"use client";

import React, { useState } from "react";
import SlideTabs from "./slide-tabs.js";

export default function SlideTabsDemo() {
  const [selectedTab, setSelectedTab] = useState("FEATURES");

  const demoItems = [
    { label: "Home", id: "HOME" },
    { label: "Pricing", id: "PRICING" },
    { label: "Features", id: "FEATURES" },
    { label: "Docs", id: "DOCS" },
    { label: "Blog", id: "BLOG" },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-xl text-center space-y-6">
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
            21st.dev Component Showcase
          </span>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Slide Tabs
          </h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Fluid animated pill tab switcher inspired by Le Thanh (@minhxthanh). Hover across tabs or click to activate.
          </p>
        </div>

        {/* The Exact Component Preview from the screen recording */}
        <div className="py-12 flex justify-center">
          <SlideTabs
            items={demoItems}
            activeId={selectedTab}
            onChange={(id) => setSelectedTab(id)}
            borderColor="border-black"
            pillColor="bg-black"
            className="py-1 px-1.5"
          />
        </div>

        <div className="text-xs text-gray-500 font-mono bg-gray-50 p-4 rounded-2xl border border-gray-200">
          Selected Tab: <strong className="text-black font-bold">{selectedTab}</strong>
        </div>
      </div>
    </div>
  );
}

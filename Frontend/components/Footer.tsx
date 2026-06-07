"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  X,
  Shield,
  FileText,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Lock,
  Users,
  HandHeart,
  GraduationCap,
  Activity
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const [modal, setModal] = useState<"privacy" | "terms" | null>(null);

  // Prevent scrolling when modal is open
  if (typeof document !== "undefined") {
    document.body.style.overflow = modal ? "hidden" : "unset";
  }

  return (
    <>
      <footer className="bg-[#071f2f] text-slate-300 border-t border-[#0c3149] font-sans">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            
            {/* BRANDING & ABOUT */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm">
                  <Heart size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight leading-none">CMDI</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400 mt-1">
                    South Sudan
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-400 mb-6">
                Children's Mission For Development Initiative is a registered non-profit dedicated to protecting vulnerable children and building resilient communities through education, health, and inclusive support.
              </p>

              <div className="flex gap-4 mt-auto">
                <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors" aria-label="LinkedIn">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>

            {/* CORE PROGRAMS */}
            <div>
              <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
                Our Programs
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/education" className="group flex items-center gap-3 text-sm text-slate-400 transition-colors hover:text-white">
                    <GraduationCap size={16} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
                    Education & Learning
                  </Link>
                </li>
                <li>
                  <Link href="/child-protection" className="group flex items-center gap-3 text-sm text-slate-400 transition-colors hover:text-white">
                    <Users size={16} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
                    Child Protection
                  </Link>
                </li>
                <li>
                  <Link href="/wash" className="group flex items-center gap-3 text-sm text-slate-400 transition-colors hover:text-white">
                    <HandHeart size={16} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
                    WASH Initiatives
                  </Link>
                </li>
                <li>
                  <Link href="/emergency-response" className="group flex items-center gap-3 text-sm text-slate-400 transition-colors hover:text-white">
                    <Activity size={16} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
                    Emergency Response
                  </Link>
                </li>
              </ul>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
                Organization
              </h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-sm text-slate-400 transition-colors hover:text-white">About CMDI</Link></li>
                <li><Link href="/impact" className="text-sm text-slate-400 transition-colors hover:text-white">Our Impact</Link></li>
                <li><Link href="/news" className="text-sm text-slate-400 transition-colors hover:text-white">News & Reports</Link></li>
                <li><Link href="/partners" className="text-sm text-slate-400 transition-colors hover:text-white">Partner With Us</Link></li>
                <li><Link href="/donate" className="text-sm font-medium text-sky-400 transition-colors hover:text-sky-300">Make a Donation</Link></li>
              </ul>
            </div>

            {/* CONTACT INFO */}
            <div>
              <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
                Contact HQ
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-slate-400">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-sky-500" />
                  <span>Juba, South Sudan<br/><span className="text-slate-500">Field Office: Fangak County</span></span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="shrink-0 text-sky-500" />
                  <a href="mailto:cmdi67768@gmail.com" className="text-slate-400 hover:text-white transition-colors">
                    cmdi67768@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="shrink-0 text-sky-500" />
                  <a href="tel:+211929045655" className="text-slate-400 hover:text-white transition-colors">
                    +211 929 045 655
                  </a>
                </li>
              </ul>
              
              <div className="mt-5 pt-5 border-t border-slate-700/50">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Executive Director</p>
                <p className="text-sm text-slate-300">Jal Bhap Biel</p>
              </div>
            </div>

          </div>

          {/* BOTTOM BAR */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#0c3149] pt-6 md:flex-row text-xs font-medium text-slate-500">
            <p>© {year} CMDI. Registered NGO in South Sudan. All rights reserved.</p>

            <div className="flex items-center gap-6">
              <button onClick={() => setModal("privacy")} className="hover:text-slate-300 transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => setModal("terms")} className="hover:text-slate-300 transition-colors">
                Terms of Use
              </button>
              <span className="hidden md:inline text-slate-700">|</span>
              <Link href="/admin/login" className="flex items-center gap-1.5 hover:text-sky-400 transition-colors">
                <Lock size={12} /> Staff Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {modal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50">
              <div className="flex items-center gap-3">
                {modal === "privacy" ? (
                  <div className="bg-sky-100 p-2 rounded-lg text-sky-600"><Shield size={20} /></div>
                ) : (
                  <div className="bg-sky-100 p-2 rounded-lg text-sky-600"><FileText size={20} /></div>
                )}
                <h2 className="text-xl font-bold text-slate-900">
                  {modal === "privacy" ? "Privacy Policy" : "Terms of Use"}
                </h2>
              </div>
              <button 
                onClick={() => setModal(null)} 
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 sm:p-8 text-slate-600 text-sm leading-relaxed">
              {modal === "privacy" ? (
                <div className="space-y-6">
                  <p>Children's Mission For Development Initiative (CMDI) respects your privacy and is committed to protecting your personal data in accordance with humanitarian standards.</p>
                  
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">1. Information We Collect</h3>
                    <p>We may collect necessary information submitted voluntarily through donation forms, contact forms, volunteer applications, and basic website analytics.</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">2. How We Use Information</h3>
                    <p>Collected information is used exclusively to facilitate charitable donations, improve our humanitarian services, communicate effectively with our supporters, and fulfill organizational legal obligations.</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">3. Data Protection & Security</h3>
                    <p>CMDI implements strict organizational and technical security measures to protect personal data from unauthorized access, alteration, disclosure, or destruction. We do not sell or trade personal data to third parties.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p>By accessing and using the CMDI website, you accept and agree to be bound by the terms and provisions of this agreement.</p>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">1. Website Usage</h3>
                    <p>Users agree to use this website only for lawful purposes. You are prohibited from using the site to post or transmit any material which is or may be infringing, threatening, false, misleading, or otherwise legally actionable.</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">2. Intellectual Property</h3>
                    <p>All content, logos, graphics, and text published on this website are the property of CMDI unless explicitly stated otherwise, and are protected by applicable copyright laws.</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">3. Limitation of Liability</h3>
                    <p>CMDI assumes no responsibility or liability for any errors or omissions in the content of this site. The information is provided on an "as is" basis with no guarantees of completeness, accuracy, usefulness, or timeliness.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-5 bg-slate-50 text-right">
              <button 
                onClick={() => setModal(null)} 
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
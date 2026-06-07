"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  Heart,
  Phone,
  Mail,
  MapPin,
  HandHeart,
  Users,
  GraduationCap,
  ShieldCheck,
  Droplets,
  Activity,
  ArrowRight
} from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Mobile accordion states
  const [mobAboutOpen, setMobAboutOpen] = useState(false);
  const [mobProgramsOpen, setMobProgramsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    }
  }, [mobileOpen]);

  const closeAll = () => {
    setMobileOpen(false);
    setMobAboutOpen(false);
    setMobProgramsOpen(false);
  };

  return (
    <>
      {/* TOP CONTACT BAR */}
      <div className="hidden lg:block bg-[#071f2f] text-slate-300 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 text-xs font-medium tracking-wide">
          <div className="flex items-center gap-6">
            <a href="tel:+211929045655" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
              <Phone size={14} className="text-sky-500" />
              +211 929 045 655
            </a>
            <a href="mailto:cmdi67768@gmail.com" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
              <Mail size={14} className="text-sky-500" />
              cmdi67768@gmail.com
            </a>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-sky-500" />
              Juba, South Sudan
            </div>
          </div>
          <div className="text-sky-400/80 font-semibold uppercase tracking-wider">
            Empowering Children • Transforming Communities
          </div>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <header
        className={`fixed left-0 z-[1000] w-full transition-all duration-300 ${
          scrolled
            ? "top-0 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md"
            : "top-0 lg:top-[36px] bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-[80px] max-w-7xl items-center justify-between px-5 lg:px-8">
          
          {/* BRAND LOGO */}
          <Link href="/" className="group flex items-center gap-3" onClick={closeAll}>
            <div className="relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-105">
              <Image
                src="/images/branding/CMDI_Logo.jpeg"
                alt="CMDI Logo"
                width={48}
                height={48}
                className="object-cover"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                CMDI
              </h2>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky-600 mt-0.5">
                South Sudan
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-1 lg:flex lg:ml-8">
            <Link href="/" className="rounded-md px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-sky-600">
              Home
            </Link>

            {/* ABOUT DROPDOWN */}
            <div className="group relative">
              <button className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-sky-600">
                About
                <ChevronDown size={14} className="transition-transform duration-200 group-hover:-rotate-180" />
              </button>
              
              {/* Invisible Bridge to keep dropdown open when hovering gap */}
              <div className="absolute top-full left-0 h-4 w-full" />
              
              <div className="absolute left-1/2 top-[calc(100%+0.5rem)] w-[300px] -translate-x-1/2 translate-y-2 invisible opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-2">
                  <Link href="/about" className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-sky-50">
                    <div className="bg-sky-100 p-2 rounded-lg text-sky-600 mt-0.5"><Users size={18} /></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Who We Are</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Vision, mission, and core values.</p>
                    </div>
                  </Link>
                  <Link href="/team" className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-sky-50">
                    <div className="bg-sky-100 p-2 rounded-lg text-sky-600 mt-0.5"><Activity size={18} /></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Leadership Team</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Meet our management and staff.</p>
                    </div>
                  </Link>
                  <Link href="/partners" className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-sky-50">
                    <div className="bg-sky-100 p-2 rounded-lg text-sky-600 mt-0.5"><HandHeart size={18} /></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Partners & Donors</h4>
                      <p className="text-xs text-slate-500 mt-0.5">The organizations supporting our cause.</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* PROGRAMS DROPDOWN */}
            <div className="group relative">
              <button className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-sky-600">
                Programs
                <ChevronDown size={14} className="transition-transform duration-200 group-hover:-rotate-180" />
              </button>
              
              <div className="absolute top-full left-0 h-4 w-full" />
              
              <div className="absolute left-1/2 top-[calc(100%+0.5rem)] w-[500px] -translate-x-1/2 translate-y-2 invisible opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2">
                  <Link href="/education" className="group/item flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-sky-50">
                    <div className="bg-slate-50 p-2 rounded-lg text-slate-500 group-hover/item:bg-sky-100 group-hover/item:text-sky-600 transition-colors"><GraduationCap size={18} /></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Education</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Inclusive learning and school support.</p>
                    </div>
                  </Link>
                  <Link href="/child-protection" className="group/item flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-sky-50">
                    <div className="bg-slate-50 p-2 rounded-lg text-slate-500 group-hover/item:bg-sky-100 group-hover/item:text-sky-600 transition-colors"><ShieldCheck size={18} /></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Child Protection</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Safety, rights, and wellbeing services.</p>
                    </div>
                  </Link>
                  <Link href="/wash" className="group/item flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-sky-50">
                    <div className="bg-slate-50 p-2 rounded-lg text-slate-500 group-hover/item:bg-sky-100 group-hover/item:text-sky-600 transition-colors"><Droplets size={18} /></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">WASH</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Safe water and community sanitation.</p>
                    </div>
                  </Link>
                  <Link href="/emergency-response" className="group/item flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-sky-50">
                    <div className="bg-slate-50 p-2 rounded-lg text-slate-500 group-hover/item:bg-sky-100 group-hover/item:text-sky-600 transition-colors"><Heart size={18} /></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Emergency Response</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Rapid humanitarian aid & relief.</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/impact-news" className="rounded-md px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-sky-600">
              Impact & News
            </Link>

            <Link href="/contact" className="rounded-md px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-sky-600">
              Contact
            </Link>
          </nav>

          {/* DESKTOP CTA */}
          <div className="hidden lg:flex items-center">
            <Link
              href="/donate"
              className="group flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition-all hover:-translate-y-0.5 hover:bg-sky-500 hover:shadow-lg hover:shadow-sky-500/30"
            >
              <Heart size={16} className="fill-white/20" />
              Donate Now
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Open Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`fixed inset-0 z-[1200] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={closeAll}
      >
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* MOBILE HEADER */}
          <div className="flex h-[80px] items-center justify-between border-b border-slate-100 px-6">
            <span className="text-xl font-black text-slate-900 tracking-tight">CMDI</span>
            <button
              onClick={closeAll}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* MOBILE LINKS */}
          <div className="h-[calc(100vh-80px)] overflow-y-auto px-6 py-8">
            <div className="flex flex-col space-y-2 text-slate-900">
              
              <Link href="/" onClick={closeAll} className="rounded-xl px-4 py-3 text-base font-bold transition-colors hover:bg-slate-50">
                Home
              </Link>

              {/* MOBILE ABOUT ACCORDION */}
              <div className="rounded-xl bg-slate-50/50">
                <button 
                  onClick={() => setMobAboutOpen(!mobAboutOpen)}
                  className="flex w-full items-center justify-between px-4 py-3 text-base font-bold transition-colors hover:bg-slate-50 rounded-xl"
                >
                  About
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${mobAboutOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${mobAboutOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden flex flex-col pl-4 pr-2 pb-2">
                    <Link href="/about" onClick={closeAll} className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-600 hover:text-sky-600">
                      <ArrowRight size={14} className="text-sky-500 opacity-50" /> Who We Are
                    </Link>
                    <Link href="/team" onClick={closeAll} className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-600 hover:text-sky-600">
                      <ArrowRight size={14} className="text-sky-500 opacity-50" /> Leadership Team
                    </Link>
                    <Link href="/partners" onClick={closeAll} className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-600 hover:text-sky-600">
                      <ArrowRight size={14} className="text-sky-500 opacity-50" /> Partners & Donors
                    </Link>
                  </div>
                </div>
              </div>

              {/* MOBILE PROGRAMS ACCORDION */}
              <div className="rounded-xl bg-slate-50/50">
                <button 
                  onClick={() => setMobProgramsOpen(!mobProgramsOpen)}
                  className="flex w-full items-center justify-between px-4 py-3 text-base font-bold transition-colors hover:bg-slate-50 rounded-xl"
                >
                  Programs
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${mobProgramsOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${mobProgramsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden flex flex-col pl-4 pr-2 pb-2">
                    <Link href="/education" onClick={closeAll} className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-600 hover:text-sky-600">
                      <ArrowRight size={14} className="text-sky-500 opacity-50" /> Education
                    </Link>
                    <Link href="/child-protection" onClick={closeAll} className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-600 hover:text-sky-600">
                      <ArrowRight size={14} className="text-sky-500 opacity-50" /> Child Protection
                    </Link>
                    <Link href="/wash" onClick={closeAll} className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-600 hover:text-sky-600">
                      <ArrowRight size={14} className="text-sky-500 opacity-50" /> WASH
                    </Link>
                    <Link href="/emergency-response" onClick={closeAll} className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-600 hover:text-sky-600">
                      <ArrowRight size={14} className="text-sky-500 opacity-50" /> Emergency Response
                    </Link>
                  </div>
                </div>
              </div>

              <Link href="/impact-news" onClick={closeAll} className="rounded-xl px-4 py-3 text-base font-bold transition-colors hover:bg-slate-50">
                Impact & News
              </Link>

              <Link href="/contact" onClick={closeAll} className="rounded-xl px-4 py-3 text-base font-bold transition-colors hover:bg-slate-50">
                Contact
              </Link>

              <div className="pt-8">
                <Link
                  href="/donate"
                  onClick={closeAll}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-sky-600/20 active:scale-[0.98] transition-all"
                >
                  <Heart size={18} className="fill-white/20" />
                  Donate Now
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* INVISIBLE SPACER TO PREVENT CONTENT JUMP */}
      <div className="h-[80px] lg:h-[116px]" />
    </>
  );
}
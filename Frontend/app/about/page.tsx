'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  Globe,
  Heart,
  Handshake,
  Mail,
  MapPin,
  Phone,
  Shield,
  Target,
  Users,
  X,
  TrendingUp
} from 'lucide-react';

type LeadershipKey =
  | 'executiveDirector'
  | 'programManager'
  | 'adminFinance'
  | 'fieldCoordinator';

type LeadershipMember = {
  key: LeadershipKey;
  name: string;
  title: string;
  image: string;
  blurb: string;
  responsibilities: string[];
};

export default function AboutPage() {
  // --- Enhanced Reveal-on-Scroll Animations ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            entry.target.classList.add('opacity-100', 'translate-y-0');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const nodes = document.querySelectorAll('.reveal-target');
    nodes.forEach((n) => observer.observe(n));

    return () => observer.disconnect();
  }, []);

  const leadership: LeadershipMember[] = useMemo(
    () => [
      {
        key: 'executiveDirector',
        name: 'Jal Bhap Biel',
        title: 'Founder & Executive Director',
        image: '/images/about/JalBhap.jpeg',
        blurb:
          'Provides overall leadership and strategic direction for CMDI, ensuring inclusive programming that protects vulnerable children and children with disabilities.',
        responsibilities: [
          'Sets organizational strategy and priorities',
          'Leads partnerships and representation',
          'Drives resource mobilization and donor engagement',
          'Ensures accountable and effective program delivery',
        ],
      },
      {
        key: 'programManager',
        name: 'Bateah Bilieu wang',
        title: 'Program Manager',
        image: '/images/team/BateahBilieuwang.jpeg',
        blurb:
          'Oversees planning, implementation, and monitoring to ensure CMDI services are inclusive, safe, and aligned with child protection and disability inclusion standards.',
        responsibilities: [
          'Plans and coordinates program implementation',
          'Monitors results, quality, and compliance',
          'Works with field teams and partners for delivery',
          'Supports reporting and learning for improvement',
        ],
      },
      {
        key: 'adminFinance',
        name: 'James Kuoch Wal Keat',
        title: 'Admin & Finance Manager',
        image: '/images/team/JamesKuochwalkeat.jpeg',
        blurb:
          'Manages financial, administrative, and operational systems to ensure transparency, efficiency, and compliance across CMDI operations.',
        responsibilities: [
          'Manages budgeting and financial controls',
          'Ensures compliance and documentation',
          'Oversees procurement and administration systems',
          'Strengthens operational efficiency and accountability',
        ],
      },
      {
        key: 'fieldCoordinator',
        name: 'Michael Taban Wanjang',
        title: 'Field Coordinator (Fangak County)',
        image: '/images/team/MichaelTabanWanjang.jpeg',
        blurb:
          'Oversees day-to-day field operations and coordinates community-level implementation to ensure activities are delivered safely, on time, and to standard.',
        responsibilities: [
          'Coordinates field teams and daily operations',
          'Liaises with local authorities and communities',
          'Ensures safety, timeliness, and quality in delivery',
          'Tracks field progress and escalates challenges',
        ],
      },
    ],
    []
  );

  const coreValues = useMemo(
    () => [
      'Child centeredness',
      'Integrity',
      'Community empowerment',
      'Equity',
      'Partnership',
      'Compassion',
      'Inclusiveness',
    ],
    []
  );

  const [openKey, setOpenKey] = useState<LeadershipKey | null>(null);
  const activeMember = leadership.find((m) => m.key === openKey) ?? null;

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (activeMember) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeMember]);

  // Utility to help with transition classes
  const revealClass = "reveal-target opacity-0 translate-y-8 transition-all duration-[800ms] ease-out";

  return (
    <main className="bg-slate-50 text-slate-800 font-sans pt-20 overflow-hidden">
      {/* HERO SECTION - Institutional & Humanized */}
      <section className="relative bg-[#071f2f] text-white py-20 lg:py-32">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #0c74a5 0%, transparent 50%), radial-gradient(circle at 80% 100%, #0284c7 0%, transparent 50%)' }} />
        
        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={revealClass}>
              <p className="text-sky-400 font-bold tracking-widest uppercase text-sm mb-4">
                Children’s Mission For Development Initiative
              </p>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Standing with the Children of South Sudan
              </h1>
              <div className="border-l-4 border-sky-500 pl-4 mb-8">
                <p className="text-xl lg:text-2xl font-medium text-slate-200">
                  Empowering generations. Transforming communities.
                </p>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-xl">
                We believe every child deserves a safe, nurturing environment to grow, learn, and thrive. Born from a deep commitment to under-served communities, CMDI works hand-in-hand with families to break cycles of poverty and build sustainable resilience.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/donate" className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:shadow-lg hover:shadow-sky-600/30">
                  Support Our Mission <ArrowRight size={18} />
                </Link>
                <Link href="/partner-with-us" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white font-semibold px-8 py-3.5 rounded-full transition-all">
                  Partner With Us
                </Link>
              </div>
            </div>

            <div className={`${revealClass} relative h-[400px] lg:h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10`} style={{ transitionDelay: '200ms' }}>
              <Image
                src="/images/about/story-image.jpeg"
                alt="CMDI supporting vulnerable children"
                fill
                className="object-cover hover:scale-105 transition-transform duration-1000"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute bottom-6 left-6 bg-[#071f2f]/80 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold">
                <BadgeCheck size={18} className="text-sky-400" />
                Registered NGO • South Sudan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFILE OVERVIEW - Clean Data Presentation */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, label: 'Entity Type', value: 'Non-Profit, NGO' },
              { icon: Calendar, label: 'Established', value: 'Founded 2022 • Reg. 2025' },
              { icon: BadgeCheck, label: 'Registration', value: 'No: 5899,/NGO//2025' },
              { icon: MapPin, label: 'Operations', value: 'HQ: Juba • Field: Fangak' },
            ].map((fact, i) => (
              <div key={i} className={`${revealClass} bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-sky-600">
                  <fact.icon size={26} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">{fact.label}</p>
                  <p className="text-slate-600 leading-snug">{fact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE CMDI STORY - Editorial Humanized Focus */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={revealClass}>
              <p className="text-sky-600 font-bold uppercase tracking-widest text-sm mb-3">Our Story</p>
              <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">Led by the community, driven by compassion.</h3>
              <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                In regions heavily affected by crisis and underdevelopment, children often face the highest risks of exclusion. CMDI was founded to bridge this gap. We are more than an organization; we are a community-driven response to ensure that vulnerability does not dictate a child's future.
              </p>
              <p className="text-slate-600 leading-relaxed text-lg mb-8">
                Operating primarily in Fangak County, Jonglei State, we bring protection, inclusive education, and vital health services directly to the frontlines. As we look to the future, our goal is to expand this lifeline to other under-served areas across the Upper Nile Region.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Shield, text: 'Child Safeguarding' },
                  { icon: Users, text: 'Community Ownership' },
                  { icon: Heart, text: 'Holistic Care' }
                ].map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
                    <tag.icon size={16} className="text-sky-600" /> {tag.text}
                  </span>
                ))}
              </div>
            </div>

            <div className={`${revealClass} bg-[#0c74a5] rounded-3xl p-8 lg:p-12 shadow-xl text-white relative overflow-hidden`} style={{ transitionDelay: '200ms' }}>
              <div className="absolute -bottom-10 -right-10 opacity-10">
                <Target size={250} />
              </div>
              <div className="relative z-10">
                <h4 className="text-2xl font-bold mb-6">Our Core Values</h4>
                <p className="text-sky-100 mb-8 leading-relaxed">
                  These principles form the bedrock of every decision we make and every program we deliver in the field.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {coreValues.map((v, i) => (
                    <div key={i} className="flex items-center gap-3 text-sky-50 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-300" />
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRATEGIC FRAMEWORK */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className={`${revealClass} text-center max-w-3xl mx-auto mb-16`}>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">Our Guiding Compass</h2>
            <div className="w-20 h-1 bg-sky-500 mx-auto mb-6 rounded-full" />
            <p className="text-lg text-slate-600">The vision and mission that define our humanitarian approach and keep us focused on what truly matters: the children.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'Our Vision', icon: Globe, text: '“A South Sudan where every child grows up healthy, educated, protected, and empowered—supported by resilient communities with access to peace, safe water, livelihoods, and essential services.”' },
              { title: 'Our Mission', icon: Target, text: 'To empower children and communities through education, improved nutrition, safe water and sanitation, and protection services—enabling every child to grow, learn, and thrive.' },
            ].map((item, i) => (
              <div key={i} className={`${revealClass} flex gap-6 p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="shrink-0">
                  <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-xl flex items-center justify-center text-[#0c74a5]">
                    <item.icon size={28} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENHANCED PARTNERSHIPS & IMPACT */}
      <section className="py-24 bg-slate-800 text-white border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className={revealClass}>
              <div className="flex items-center gap-3 text-sky-400 font-bold uppercase tracking-widest text-sm mb-4">
                <Handshake size={20} /> Partnerships & Impact
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Collective action for lasting change.</h2>
              <p className="text-slate-300 leading-relaxed text-lg mb-6">
                Complex humanitarian challenges cannot be solved in isolation. CMDI actively aligns with national frameworks, UN clusters, and international humanitarian standards to ensure our interventions are timely, effective, and free from duplication.
              </p>
              <p className="text-slate-300 leading-relaxed text-lg mb-8">
                By forging strong alliances with local government agencies, international donors, and peer NGOs, we amplify our reach. Together, we are building systems that outlast our immediate interventions, focusing on long-term resilience and community self-reliance.
              </p>

              <Link href="/partners" className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-8 py-3.5 rounded-full transition-all">
                Become a Strategic Partner <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Users, stat: '500+', label: 'Vulnerable children and families directly supported.' },
                { icon: Shield, stat: '100+', label: 'Community health workers trained in hygiene protocols.' },
                { icon: Building2, stat: 'Local', label: 'Deeply integrated with grassroots leadership networks.' },
                { icon: TrendingUp, stat: 'Scalable', label: 'Preparing to expand across the Upper Nile Region.' }
              ].map((item, idx) => (
                <div key={idx} className={`${revealClass} bg-slate-700/50 border border-slate-600 rounded-2xl p-6 hover:bg-slate-700 transition-colors`} style={{ transitionDelay: `${idx * 100}ms` }}>
                  <item.icon size={32} className="text-sky-400 mb-4" />
                  <h4 className="text-3xl font-bold text-white mb-2">{item.stat}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* LEADERSHIP - Interactive Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className={`${revealClass} text-center max-w-3xl mx-auto mb-16`}>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">Our Leadership Team</h2>
            <div className="w-20 h-1 bg-sky-500 mx-auto mb-6 rounded-full" />
            <p className="text-lg text-slate-600">
              Guided by lived experience and professional expertise, our team is wholly committed to protecting dignity and championing inclusion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((member, idx) => (
              <button
                key={member.key}
                type="button"
                className={`${revealClass} text-left group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col`}
                style={{ transitionDelay: `${idx * 100}ms` }}
                onClick={() => setOpenKey(member.key)}
              >
                <div className="relative h-64 w-full bg-slate-200">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-sky-700 text-sm font-semibold mb-4 flex-1">{member.title}</p>
                  <p className="text-slate-400 text-sm font-semibold inline-flex items-center gap-1 group-hover:text-sky-600 transition-colors mt-auto">
                    View Profile <ArrowRight size={14} />
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GET INVOLVED / CONTACT BLOCK */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
          <div className="bg-[#071f2f] rounded-3xl p-8 lg:p-16 shadow-2xl flex flex-col lg:flex-row gap-12 items-center justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Globe size={300} /></div>
            
            <div className="relative z-10 max-w-2xl">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">Ready to make a difference?</h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Whether you want to fund a child's education, partner on a community project, or volunteer your skills, there is a place for you in our mission.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/donate" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full transition-colors flex items-center gap-2">
                  Donate Today
                </Link>
                <Link href="/contact" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-8 rounded-full transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full lg:w-auto min-w-[300px]">
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2 border-b border-white/20 pb-4">
                <Mail size={20} className="text-sky-400" /> Direct Inquiries
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">Executive Director</p>
                  <p className="font-medium">Jal Bhap Biel</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-slate-400" /> 
                  <a href="mailto:jalbhap@gmail.com" className="hover:text-sky-400 transition-colors">jalbhap@gmail.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-slate-400" /> 
                  <span>+211 929 045 655</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP MODAL */}
      {activeMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm transition-opacity">
          <div 
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex items-start justify-between z-10">
              <div className="flex items-center gap-5">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
                  <Image src={activeMember.image} alt={activeMember.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{activeMember.name}</h3>
                  <p className="text-sky-600 font-semibold">{activeMember.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setOpenKey(null)} 
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors shrink-0"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8">
                <p className="text-slate-700 text-lg leading-relaxed">{activeMember.blurb}</p>
              </div>

              <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target size={20} className="text-sky-500" /> Key Focus Areas
              </h4>
              <ul className="space-y-3 mb-10">
                {activeMember.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                    <span className="mt-1 w-2 h-2 bg-sky-400 rounded-full shrink-0" />
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
                <Link href="/contact" onClick={() => setOpenKey(null)} className="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                  Contact CMDI
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
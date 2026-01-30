'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

import styles from './Navbar.module.css';

type DropdownKey = 'about' | 'impact' | null;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<DropdownKey>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navRef = useRef<HTMLElement | null>(null);

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setDropdownOpen(null);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen((v) => {
      const next = !v;
      if (!next) setDropdownOpen(null);
      return next;
    });
  }, []);

  const toggleDropdown = useCallback((key: Exclude<DropdownKey, null>) => {
    setDropdownOpen((cur) => (cur === key ? null : key));
  }, []);

  // Detect mobile (for hover behavior)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  // Shrink on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = navRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        setDropdownOpen(null);
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeAll]);

  const aboutOpen = dropdownOpen === 'about';
  const impactOpen = dropdownOpen === 'impact';

  const navbarClass = useMemo(() => {
    const base = [styles.navbar];
    if (scrolled) base.push(styles.shrink);
    return base.join(' ');
  }, [scrolled]);

  const navClass = useMemo(() => {
    const base = [styles.nav];
    if (menuOpen) base.push(styles.open);
    return base.join(' ');
  }, [menuOpen]);

  const backdropClass = useMemo(() => {
    const base = [styles.backdrop];
    if (menuOpen) base.push(styles.backdropShow);
    return base.join(' ');
  }, [menuOpen]);

  const onNavLinkClick = () => {
    // Close drawer + dropdown after navigation (especially on mobile)
    setMenuOpen(false);
    setDropdownOpen(null);
  };

  return (
    <>
      {/* Backdrop for mobile drawer */}
      <div className={backdropClass} onClick={closeAll} aria-hidden="true" />

      <header className={navbarClass} ref={(el) => (navRef.current = el)}>
        <a className={styles.skipLink} href="#main-content">
          Skip to content
        </a>

        <div className={styles.container}>
          {/* Logo */}
          <Link href="/" className={styles.logo} onClick={onNavLinkClick} aria-label="Go to homepage">
            <Image
              src="/images/branding/CMDI_Logo.jpeg"
              alt="CMDI"
              width={44}
              height={44}
              className={styles.logoImg}
              priority
            />
            <span className={styles.logoText}>
              <span className={styles.brand}>CMDI</span>
              <span className={styles.tagline}>SUPPORTING CHILDREN</span>
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className={`${styles.menuBtn} ${menuOpen ? styles.menuOpen : ''}`}
            onClick={toggleMenu}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
          >
            <span />
            <span />
            <span />
          </button>

          {/* Nav */}
          <nav id="primary-nav" className={navClass} aria-label="Primary navigation">
            {/* ABOUT */}
            <div
              className={styles.navItem}
              onMouseEnter={() => !isMobile && setDropdownOpen('about')}
              onMouseLeave={() => !isMobile && setDropdownOpen(null)}
            >
              <button
                type="button"
                className={styles.navLink}
                onClick={() => toggleDropdown('about')}
                aria-expanded={aboutOpen}
                aria-controls="about-dropdown"
              >
                About
                <ChevronDown size={18} className={aboutOpen ? styles.rotate : ''} />
              </button>

              <div
                id="about-dropdown"
                className={`${styles.dropdown} ${aboutOpen ? styles.show : ''}`}
                role="menu"
                aria-label="About menu"
              >
                <Link href="/about" onClick={onNavLinkClick} role="menuitem">
                  Our Story
                </Link>
                <Link href="/partners" onClick={onNavLinkClick} role="menuitem">
                  Partners
                </Link>
                <Link href="/news" onClick={onNavLinkClick} role="menuitem">
                  News &amp; Updates
                </Link>
              </div>
            </div>

            {/* IMPACT */}
            <div
              className={styles.navItem}
              onMouseEnter={() => !isMobile && setDropdownOpen('impact')}
              onMouseLeave={() => !isMobile && setDropdownOpen(null)}
            >
              <button
                type="button"
                className={styles.navLink}
                onClick={() => toggleDropdown('impact')}
                aria-expanded={impactOpen}
                aria-controls="impact-dropdown"
              >
                Impact
                <ChevronDown size={18} className={impactOpen ? styles.rotate : ''} />
              </button>

              <div
                id="impact-dropdown"
                className={`${styles.dropdown} ${impactOpen ? styles.show : ''}`}
                role="menu"
                aria-label="Impact menu"
              >
                <Link href="/programs" onClick={onNavLinkClick} role="menuitem">
                  Programs
                </Link>
                <Link href="/projects" onClick={onNavLinkClick} role="menuitem">
                  Projects
                </Link>
              </div>
            </div>

            {/* CONTACT */}
            <div className={styles.navItem}>
              <Link href="/contact" className={styles.navLink as unknown as string} onClick={onNavLinkClick}>
                Contact
              </Link>
            </div>

            {/* DONATE CTA */}
            <Link href="/donate" className={styles.donateBtn} onClick={onNavLinkClick}>
              Donate Now
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

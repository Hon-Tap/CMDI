'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navId = useId();
  const drawerRef = useRef<HTMLElement | null>(null);

  const closeMenu = () => {
    setOpen(false);
    setActiveDropdown(null);
  };

  const toggleMenu = () => {
    setOpen((v) => !v);
    // When opening the drawer, default to no dropdown expanded (clean)
    if (!open) setActiveDropdown(null);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  // Scroll behavior (floating dock)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape + close dropdowns when resizing to desktop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    const onResize = () => {
      // If we leave the mobile breakpoint, close the drawer and dropdowns
      if (window.innerWidth > 960) {
        setOpen(false);
        setActiveDropdown(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Focus first link in drawer when it opens (nice UX, accessibility)
  useEffect(() => {
    if (!open) return;
    // Let the drawer render before focusing
    const t = window.setTimeout(() => {
      const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 30);

    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.shrink : ''}`}>
      {/* Backdrop (dims the rest + click closes) */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropShow : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div className={styles.container}>
        {/* LOGO */}
        <Link href="/" className={styles.logo} onClick={closeMenu} aria-label="Go to homepage">
          <Image
            src="/images/branding/CMDI_Logo.jpeg"
            alt="CMDI Logo"
            width={40}
            height={40}
            className={styles.logoImg}
            priority
          />
          <div className={styles.logoText}>
            <span className={styles.brand}>CMDI</span>
            <span className={styles.tagline}>Empowering Children</span>
          </div>
        </Link>

        {/* NAV / DRAWER */}
        <nav
          id={navId}
          ref={drawerRef}
          className={`${styles.nav} ${open ? styles.open : ''}`}
          aria-label="Primary navigation"
          aria-hidden={open ? undefined : undefined}
        >
          {/* ABOUT DROPDOWN */}
          <div
            className={styles.navItem}
            onMouseEnter={() => {
              // Desktop hover only (drawer closed)
              if (!open) setActiveDropdown('about');
            }}
            onMouseLeave={() => {
              if (!open) setActiveDropdown(null);
            }}
          >
            <button
              type="button"
              className={styles.navLink}
              onClick={() => toggleDropdown('about')}
              aria-expanded={activeDropdown === 'about'}
              aria-controls={`${navId}-about`}
            >
              About
              <ChevronDown
                size={14}
                className={activeDropdown === 'about' ? styles.rotate : ''}
                aria-hidden="true"
              />
            </button>

            <div
              id={`${navId}-about`}
              className={`${styles.dropdown} ${activeDropdown === 'about' ? styles.show : ''}`}
              role="menu"
            >
              <Link href="/about" onClick={closeMenu} role="menuitem">
                Our Story
              </Link>
              <Link href="/partners" onClick={closeMenu} role="menuitem">
                Partners
              </Link>
              <Link href="/news" onClick={closeMenu} role="menuitem">
                News & Updates
              </Link>
            </div>
          </div>

          {/* IMPACT DROPDOWN */}
          <div
            className={styles.navItem}
            onMouseEnter={() => {
              if (!open) setActiveDropdown('impact');
            }}
            onMouseLeave={() => {
              if (!open) setActiveDropdown(null);
            }}
          >
            <button
              type="button"
              className={styles.navLink}
              onClick={() => toggleDropdown('impact')}
              aria-expanded={activeDropdown === 'impact'}
              aria-controls={`${navId}-impact`}
            >
              Impact
              <ChevronDown
                size={14}
                className={activeDropdown === 'impact' ? styles.rotate : ''}
                aria-hidden="true"
              />
            </button>

            <div
              id={`${navId}-impact`}
              className={`${styles.dropdown} ${activeDropdown === 'impact' ? styles.show : ''}`}
              role="menu"
            >
              <Link href="/programs" onClick={closeMenu} role="menuitem">
                Programs
              </Link>
              <Link href="/projects" onClick={closeMenu} role="menuitem">
                Projects
              </Link>
            </div>
          </div>

          {/* CONTACT */}
          <Link href="/contact" className={styles.navLink} onClick={closeMenu}>
            Contact
          </Link>

          {/* CTA */}
          <Link href="/donate" className={styles.donateBtn} onClick={closeMenu}>
            Donate Now
          </Link>
        </nav>

        {/* MOBILE TOGGLE */}
        <button
          type="button"
          className={`${styles.menuBtn} ${open ? styles.menuOpen : ''}`}
          onClick={toggleMenu}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-controls={navId}
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

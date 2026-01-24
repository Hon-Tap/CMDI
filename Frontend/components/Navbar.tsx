'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navId = useId();
  const drawerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  const closeMenu = useCallback(() => {
    setOpen(false);
    setActiveDropdown(null);
  }, []);

  const toggleMenu = () => {
    setOpen((v) => !v);
    if (!open) setActiveDropdown(null);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  // Close menu + start every page from top on route change
  useEffect(() => {
    closeMenu();
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, closeMenu]);

  // Scroll behavior (shrink)
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

  // Close on Escape + close drawer when resizing to desktop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    const onResize = () => {
      if (window.innerWidth > 960) closeMenu();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [closeMenu]);

  // Focus first item in drawer when it opens (a11y)
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 30);
    return () => window.clearTimeout(t);
  }, [open]);

  // For all links
  const onNavClick = () => closeMenu();

  // Desktop hover should not affect mobile drawer state
  const onEnter = (name: string) => {
    if (!open) setActiveDropdown(name);
  };
  const onLeave = () => {
    if (!open) setActiveDropdown(null);
  };

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.shrink : ''}`}>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropShow : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div className={styles.container}>
        {/* LOGO */}
        <Link href="/" className={styles.logo} onClick={onNavClick} aria-label="Go to homepage" scroll>
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
            <span className={styles.tagline}>Supporting Children</span>
          </div>
        </Link>

        {/* NAV / DRAWER */}
        <nav
          id={navId}
          ref={drawerRef}
          className={`${styles.nav} ${open ? styles.open : ''}`}
          aria-label="Primary navigation"
        >
          {/* ABOUT */}
          <div className={styles.navItem} onMouseEnter={() => onEnter('about')} onMouseLeave={onLeave}>
            <button
              type="button"
              className={styles.navLink}
              onClick={() => toggleDropdown('about')}
              aria-expanded={activeDropdown === 'about'}
              aria-controls={`${navId}-about`}
              aria-haspopup="menu"
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
              <Link href="/about" onClick={onNavClick} role="menuitem" scroll>
                Our Story
              </Link>
              <Link href="/partners" onClick={onNavClick} role="menuitem" scroll>
                Partners
              </Link>
              <Link href="/news" onClick={onNavClick} role="menuitem" scroll>
                News & Updates
              </Link>
            </div>
          </div>

          {/* IMPACT */}
          <div className={styles.navItem} onMouseEnter={() => onEnter('impact')} onMouseLeave={onLeave}>
            <button
              type="button"
              className={styles.navLink}
              onClick={() => toggleDropdown('impact')}
              aria-expanded={activeDropdown === 'impact'}
              aria-controls={`${navId}-impact`}
              aria-haspopup="menu"
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
              <Link href="/programs" onClick={onNavClick} role="menuitem" scroll>
                Programs
              </Link>
              <Link href="/projects" onClick={onNavClick} role="menuitem" scroll>
                Projects
              </Link>
            </div>
          </div>

          {/* CONTACT */}
          <Link href="/contact" className={styles.navLink} onClick={onNavClick} scroll>
            Contact
          </Link>

          {/* CTA */}
          <Link href="/donate" className={styles.donateBtn} onClick={onNavClick} scroll>
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

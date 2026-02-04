'use client';

import Link from 'next/link';
import {
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
  Send,
  Lock,
} from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.container}>
          {/* BRAND */}
          <div className={styles.brandCol}>
            <div className={styles.logoRow}>
              <span className={styles.logoMark} aria-hidden="true">
                <Heart className={styles.logoIcon} fill="currentColor" />
              </span>
              <span className={styles.logoText}>CMDI</span>
            </div>

            <p className={styles.missionText}>
              Empowering the next generation in South Sudan through holistic development and
              child-centered initiatives.
            </p>

            <div className={styles.socialLinks}>
              <a href="#" aria-label="Facebook" className={styles.socialBtn}>
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Twitter" className={styles.socialBtn}>
                <Twitter size={18} />
              </a>
              <a href="#" aria-label="Instagram" className={styles.socialBtn}>
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="LinkedIn" className={styles.socialBtn}>
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* LINKS */}
          <nav className={styles.linksGrid} aria-label="Footer navigation">
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>About CMDI</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/about" className={styles.link}>
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/partners" className={styles.link}>
                    Partners
                  </Link>
                </li>
                <li>
                  <Link href="/news" className={styles.link}>
                    News &amp; Updates
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={styles.link}>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>Our Impact</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/programs" className={styles.link}>
                    Programs
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className={styles.link}>
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/donate" className={styles.link}>
                    Donate Now
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer" className={styles.link}>
                    Volunteer
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          {/* NEWSLETTER + CONTACT */}
          <div className={styles.contactCol}>
            <h4 className={styles.groupTitle}>Stay Updated</h4>
            <p className={styles.subText}>Join our newsletter for latest impact stories.</p>

            <form
              className={styles.newsletter}
              onSubmit={(e) => e.preventDefault()}
              aria-label="Newsletter signup"
            >
              <input
                className={styles.input}
                type="email"
                name="email"
                placeholder="Email address"
                autoComplete="email"
              />
              <button className={styles.sendBtn} type="submit" aria-label="Subscribe">
                <Send size={18} />
              </button>
            </form>

            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <MapPin size={18} className={styles.contactIcon} />
                <span>Juba, South Sudan</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={18} className={styles.contactIcon} />
                <a className={styles.mailLink} href="mailto:info@cmdi-ss.org">
                  info@cmdi-ss.org
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p className={styles.copyright}>
            © <span suppressHydrationWarning>{year}</span> CMDI. All rights reserved.
          </p>

          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.legalLink}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={styles.legalLink}>
              Terms of Service
            </Link>

            {/* Admin-only: subtle/blur, becomes clear on hover/focus */}
            <Link
              href="/admin/login"
              className={styles.staffLink}
              prefetch={false}
              aria-label="Staff login (admin only)"
              title="Staff only"
            >
              <Lock size={16} />
              <span className={styles.staffText}>Staff Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  X,
  Shield,
  FileText,
} from 'lucide-react';
import styles from './Footer.module.css';

type LegalDoc = 'privacy' | 'terms';

function getFocusable(root: HTMLElement | null) {
  if (!root) return [];
  const nodes = root.querySelectorAll<HTMLElement>(
    [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')
  );
  return Array.from(nodes).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
}

function LegalContent({ type }: { type: LegalDoc }) {
  const updated = useMemo(() => new Date().toISOString().slice(0, 10), []);

  if (type === 'privacy') {
    return (
      <div className={styles.legalDoc}>
        <p className={styles.legalMeta}>
          <strong>Last updated:</strong> {updated}
        </p>

        <p>
          This Privacy Policy explains how <strong>CMDI</strong> collects, uses, and protects information when you visit
          our website, contact us, volunteer, donate, or subscribe to updates. We are committed to respecting your
          privacy and handling personal data responsibly.
        </p>

        <h3>1. Who we are</h3>
        <p>
          <strong>CMDI</strong> is a child-focused organization working in South Sudan. For privacy questions, contact
          us using the details in the “Contact” section below.
        </p>

        <h3>2. What we collect</h3>
        <ul>
          <li>
            <strong>Contact form information:</strong> your name, email, subject, and message content.
          </li>
          <li>
            <strong>Volunteer information:</strong> details you submit (e.g., skills, availability) if you choose to
            volunteer.
          </li>
          <li>
            <strong>Newsletter signup:</strong> your email address (and optionally your name if you provide it).
          </li>
          <li>
            <strong>Donation information:</strong> if you donate, payment processing is handled by third-party payment
            providers. We typically do not store full card details on our servers.
          </li>
          <li>
            <strong>Technical data:</strong> IP address, device/browser info, and basic usage analytics (e.g., pages
            visited, approximate location derived from IP).
          </li>
          <li>
            <strong>Cookies:</strong> small files used for site functionality, preferences, and basic measurement (if
            enabled).
          </li>
        </ul>

        <h3>3. How we use your information</h3>
        <ul>
          <li>To respond to inquiries and provide support.</li>
          <li>To process volunteer requests and coordinate participation.</li>
          <li>To send newsletters and impact updates if you opt in.</li>
          <li>To improve website performance, security, and user experience.</li>
          <li>To meet legal obligations and prevent abuse/fraud.</li>
        </ul>

        <h3>4. Legal basis (where applicable)</h3>
        <p>Depending on the context, we may process personal data based on:</p>
        <ul>
          <li>
            <strong>Consent</strong> (e.g., newsletter subscription).
          </li>
          <li>
            <strong>Legitimate interests</strong> (e.g., website security, improving our services).
          </li>
          <li>
            <strong>Contractual necessity</strong> (e.g., responding to your request, coordinating volunteering).
          </li>
          <li>
            <strong>Legal obligation</strong> (e.g., compliance requirements).
          </li>
        </ul>

        <h3>5. Sharing of information</h3>
        <p>We do not sell your personal data. We may share limited information with:</p>
        <ul>
          <li>
            <strong>Service providers</strong> (hosting, email delivery, analytics) strictly to operate the website.
          </li>
          <li>
            <strong>Payment processors</strong> to handle donations and receipts.
          </li>
          <li>
            <strong>Authorities</strong> if required by law or to protect rights and safety.
          </li>
        </ul>

        <h3>6. International transfers</h3>
        <p>
          Some services we use (e.g., hosting/email) may process data outside South Sudan. Where this happens, we take
          reasonable steps to ensure appropriate safeguards.
        </p>

        <h3>7. Data retention</h3>
        <p>
          We keep information only as long as needed to respond to you, operate services, comply with legal obligations,
          and maintain records. We periodically review and delete data that is no longer necessary.
        </p>

        <h3>8. Security</h3>
        <p>
          We use reasonable technical and organizational measures to protect information. However, no website or system
          is 100% secure. If you suspect misuse, contact us immediately.
        </p>

        <h3>9. Your choices & rights</h3>
        <ul>
          <li>
            <strong>Newsletter:</strong> you can unsubscribe at any time using the link in emails (if provided) or by
            contacting us.
          </li>
          <li>
            <strong>Access/updates:</strong> you can request access to or correction of your data.
          </li>
          <li>
            <strong>Deletion:</strong> you can request deletion where appropriate and legally permissible.
          </li>
        </ul>

        <h3>10. Children’s privacy</h3>
        <p>
          Our website is intended for a general audience. We do not knowingly collect personal information from children
          without appropriate consent. If you believe a child has provided personal data, contact us so we can address it.
        </p>

        <h3>11. Third-party links</h3>
        <p>
          Our site may link to third-party websites. We are not responsible for their privacy practices. Please review
          their policies directly.
        </p>

        <h3>12. Changes to this policy</h3>
        <p>
          We may update this Privacy Policy to reflect improvements or legal changes. Updates will be posted here with a
          revised “Last updated” date.
        </p>

        <h3>13. Contact</h3>
        <p>
          Email us at <a className={styles.inlineLink} href="mailto:info@cmdi-ss.org">info@cmdi-ss.org</a> with “Privacy”
          in the subject line.
        </p>

        <p className={styles.legalNote}>
          <strong>Note:</strong> This policy is provided for transparency and general guidance and does not constitute
          legal advice.
        </p>
      </div>
    );
  }

  // terms
  return (
    <div className={styles.legalDoc}>
      <p className={styles.legalMeta}>
        <strong>Last updated:</strong> {updated}
      </p>

      <p>
        These Terms of Service govern your access to and use of the <strong>CMDI</strong> website and services. By using
        this website, you agree to these Terms.
      </p>

      <h3>1. Using our website</h3>
      <ul>
        <li>You may use the website for lawful purposes only.</li>
        <li>You agree not to interfere with the website’s security, operation, or availability.</li>
        <li>You agree not to submit false, misleading, or abusive messages or content.</li>
      </ul>

      <h3>2. Content and intellectual property</h3>
      <p>
        Unless otherwise stated, website content (text, images, branding, design) is owned by or licensed to CMDI and is
        protected by applicable intellectual property laws. You may share links and short excerpts with attribution.
        You may not copy, redistribute, or commercially exploit our content without permission.
      </p>

      <h3>3. User submissions (contact/volunteer forms)</h3>
      <p>
        When you submit a message or information through our forms, you confirm that:
      </p>
      <ul>
        <li>The information is accurate to the best of your knowledge.</li>
        <li>You have the right to share it.</li>
        <li>You understand we will use it to respond to you and to manage our operations.</li>
      </ul>

      <h3>4. Donations</h3>
      <p>
        If you choose to donate, donations may be processed by third-party payment providers. Donation processing,
        receipts, and any applicable fees are subject to the provider’s terms. Where permitted and practical, CMDI may
        issue refunds at its discretion based on the circumstances.
      </p>

      <h3>5. Third-party links and services</h3>
      <p>
        Our website may contain links to third-party sites or services. We do not control these sites and are not
        responsible for their content, availability, or policies.
      </p>

      <h3>6. Availability and changes</h3>
      <p>
        We aim to keep the website available and accurate, but we do not guarantee uninterrupted operation. We may
        update, change, or remove parts of the website at any time.
      </p>

      <h3>7. Disclaimer</h3>
      <p>
        The website is provided “as is” and “as available.” We do not guarantee that information on the site is always
        complete, current, or error-free. Any reliance on site content is at your own risk.
      </p>

      <h3>8. Limitation of liability</h3>
      <p>
        To the fullest extent permitted by law, CMDI will not be liable for indirect, incidental, special, or
        consequential damages arising from your use of (or inability to use) this website.
      </p>

      <h3>9. Indemnity</h3>
      <p>
        You agree to indemnify and hold CMDI harmless from claims arising out of your misuse of the website or breach of
        these Terms.
      </p>

      <h3>10. Privacy</h3>
      <p>
        Your use of the site is also governed by our Privacy Policy (available in this same footer modal).
      </p>

      <h3>11. Governing law</h3>
      <p>
        These Terms are governed by the laws applicable in South Sudan, without regard to conflict-of-law principles.
      </p>

      <h3>12. Contact</h3>
      <p>
        Questions about these Terms? Email{' '}
        <a className={styles.inlineLink} href="mailto:info@cmdi-ss.org">info@cmdi-ss.org</a> with “Terms” in the subject
        line.
      </p>

      <p className={styles.legalNote}>
        <strong>Note:</strong> These terms are general website terms and do not constitute legal advice.
      </p>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  const [legal, setLegal] = useState<LegalDoc | null>(null);
  const [closing, setClosing] = useState(false);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  function openLegal(type: LegalDoc) {
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    setClosing(false);
    setLegal(type);
  }

  function closeLegal() {
    // animate out
    setClosing(true);
    window.setTimeout(() => {
      setLegal(null);
      setClosing(false);
      // restore focus
      lastActiveRef.current?.focus?.();
    }, 180);
  }

  // body scroll lock + focus management
  useEffect(() => {
    if (!legal) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // focus close button (first focusable inside modal)
    const t = window.setTimeout(() => {
      const focusables = getFocusable(modalRef.current);
      focusables[0]?.focus?.();
    }, 0);

    function onKeyDown(e: KeyboardEvent) {
      if (!legal) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeLegal();
        return;
      }

      // Basic focus trap (Tab cycles within modal)
      if (e.key === 'Tab') {
        const focusables = getFocusable(modalRef.current);
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (active === first || !modalRef.current?.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [legal]);

  const legalTitle = legal === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  const legalIcon = legal === 'privacy' ? <Shield size={18} /> : <FileText size={18} />;

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
              Empowering the next generation in South Sudan through holistic development and child-centered initiatives.
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
            {/* ✅ MODAL TRIGGERS (no routing, no 404) */}
            <button
              type="button"
              className={styles.legalLink}
              onClick={() => openLegal('privacy')}
            >
              Privacy Policy
            </button>

            <button
              type="button"
              className={styles.legalLink}
              onClick={() => openLegal('terms')}
            >
              Terms of Service
            </button>

            {/* Admin-only */}
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

      {/* ✅ LEGAL MODAL */}
      {legal && (
        <div
          className={`${styles.modalOverlay} ${closing ? styles.modalOverlayClosing : styles.modalOverlayOpen}`}
          onMouseDown={(e) => {
            // Close only if user clicks the overlay itself (not inside modal)
            if (e.target === e.currentTarget) closeLegal();
          }}
          aria-hidden={closing ? 'true' : 'false'}
        >
          <div
            ref={modalRef}
            className={`${styles.modal} ${closing ? styles.modalClosing : styles.modalOpen}`}
            role="dialog"
            aria-modal="true"
            aria-label={legalTitle}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <span className={styles.modalIcon} aria-hidden="true">
                  {legalIcon}
                </span>
                <div className={styles.modalTitles}>
                  <h2 className={styles.modalTitle}>{legalTitle}</h2>
                  <p className={styles.modalSubtitle}>
                    Please read carefully. This is a general policy for our NGO website.
                  </p>
                </div>
              </div>

              <button type="button" className={styles.modalClose} onClick={closeLegal} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div ref={contentRef} className={styles.modalBody}>
              <LegalContent type={legal} />
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.modalPrimary} onClick={closeLegal}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { 
  FolderKanban, 
  Newspaper, 
  CalendarRange, 
  Image as ImageIcon, 
  Inbox, 
  Settings, 
  ArrowRight 
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default function AdminHomePage() {
  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Welcome Section */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 16, color: '#64748b', maxWidth: 600, lineHeight: 1.6 }}>
          Welcome back. Manage your projects, programs, and news updates from here. 
          Select a module below to get started.
        </p>
      </div>

      {/* Grid */}
      <div style={styles.grid}>
        <DashboardCard 
          href="/admin/content/projects" 
          title="Projects" 
          desc="Manage core projects. Create drafts, publish updates, and edit details." 
          icon={FolderKanban}
          color="blue"
        />
        <DashboardCard 
          href="/admin/content/programs" 
          title="Programs" 
          desc="Control how programs appear on the public site structure." 
          icon={CalendarRange}
          color="indigo"
        />
        <DashboardCard 
          href="/admin/content/news" 
          title="News" 
          desc="Write and schedule news posts and press releases." 
          icon={Newspaper}
          color="emerald"
        />
        <DashboardCard 
          href="/admin/media" 
          title="Media Library" 
          desc="Upload and organize images and documents." 
          icon={ImageIcon}
          color="purple"
        />
        <DashboardCard 
          href="/admin/inbox" 
          title="Inbox" 
          desc="View form submissions and contact requests." 
          icon={Inbox}
          color="amber"
        />
        <DashboardCard 
          href="/admin/settings" 
          title="Settings" 
          desc="Configure site preferences and admin roles." 
          icon={Settings}
          color="slate"
        />
      </div>
    </div>
  );
}

// --- Components ---

function DashboardCard({ 
  href, 
  title, 
  desc, 
  icon: Icon,
  color 
}: { 
  href: string; 
  title: string; 
  desc: string; 
  icon: any;
  color: 'blue' | 'indigo' | 'emerald' | 'purple' | 'amber' | 'slate';
}) {
  
  // Mapping colors to hex for inline styles
  const colors = {
    blue: { bg: '#eff6ff', text: '#2563eb' },
    indigo: { bg: '#eef2ff', text: '#4f46e5' },
    emerald: { bg: '#ecfdf5', text: '#059669' },
    purple: { bg: '#f5f3ff', text: '#7c3aed' },
    amber: { bg: '#fffbeb', text: '#d97706' },
    slate: { bg: '#f8fafc', text: '#475569' },
  };

  const theme = colors[color];

  return (
    <Link href={href} style={styles.card}>
      <div style={{ ...styles.iconBox, background: theme.bg, color: theme.text }}>
        <Icon size={24} />
      </div>
      <div>
        <div style={styles.cardTitle}>
          {title}
        </div>
        <p style={styles.cardDesc}>{desc}</p>
      </div>
      <div style={styles.cardFooter}>
        <span style={styles.linkText}>Open Module</span>
        <ArrowRight size={14} />
      </div>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 24,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 20,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 24,
    textDecoration: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.5,
    margin: 0,
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
    color: '#0ea5e9',
    fontSize: 13,
    fontWeight: 600,
  },
  linkText: {
    position: 'relative',
    top: 1,
  }
};
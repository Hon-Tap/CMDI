'use client';

import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';
import styles from '../app/page.module.css';

interface ProgramCardProps {
  title: string;
  summary: string;
  // Using LucideIcon type ensures we pass the component itself, not JSX
  icon: LucideIcon; 
  color?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};

export default function ProgramCard({ title, summary, icon: Icon, color = '#00aeef' }: ProgramCardProps) {
  return (
    <motion.div 
      className={styles.programCard}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover="hover"
    >
      {/* Soft Glow: Replaces the 'broken' circle look */}
      <div 
        className={styles.cardGlow} 
        style={{ background: `radial-gradient(circle at center, ${color}33 0%, transparent 70%)` }} 
      />

      <div 
        className={styles.programIconWrapper} 
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <Icon size={28} strokeWidth={2.5} />
      </div>

      <div className={styles.programContent}>
        <h3 className={styles.programTitle}>{title}</h3>
        <p className={styles.programSummary}>{summary}</p>
        
        <div className={styles.programLink} style={{ color: color }}>
          <span>Learn more</span>
          <motion.div
            variants={{
              hover: { x: 5 }
            }}
          >
            <ArrowRight size={18} strokeWidth={2.5} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
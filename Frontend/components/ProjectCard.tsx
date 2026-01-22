'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from '../app/page.module.css';

interface ProjectCardProps {
  title: string;
  summary: string;
  status: 'Active' | 'Completed' | 'Planned'; // Strict typing for better control
  image: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function ProjectCard({ title, summary, status, image }: ProjectCardProps) {
  return (
    <motion.div 
      className={styles.projectCard}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover="hover"
    >
      <div className={styles.projectImageWrapper}>
        <span className={`${styles.statusBadge} ${status === 'Active' ? styles.badgeActive : styles.badgeDone}`}>
          {status}
        </span>
        
        <motion.div 
          className={styles.imgContainer}
          variants={{
            hover: { scale: 1.1 }
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image 
            src={image} 
            alt={title} 
            fill 
            className={styles.projectImg}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
        
        {/* Dark gradient overlay for text readability if needed, or purely aesthetic */}
        <div className={styles.imgOverlay} />
      </div>

      <div className={styles.projectContent}>
        <h3 className={styles.projectTitle}>{title}</h3>
        <p className={styles.projectSummary}>{summary}</p>
      </div>
    </motion.div>
  );
}
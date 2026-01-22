import { ArrowRight, type LucideIcon } from "lucide-react";
import styles from "../app/page.module.css";

interface ProgramCardProps {
  title: string;
  summary: string;
  icon: LucideIcon;
  color?: string;
}

export default function ProgramCard({
  title,
  summary,
  icon: Icon,
  color = "#00aeef",
}: ProgramCardProps) {
  return (
    <div className={styles.programCard}>
      {/* Soft Glow */}
      <div
        className={styles.cardGlow}
        style={{
          background: `radial-gradient(circle at center, ${color}33 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div
        className={styles.programIconWrapper}
        style={{ backgroundColor: `${color}15`, color }}
      >
        <Icon size={28} strokeWidth={2.5} />
      </div>

      <div className={styles.programContent}>
        <h3 className={styles.programTitle}>{title}</h3>
        <p className={styles.programSummary}>{summary}</p>

        <div className={styles.programLink} style={{ color }}>
          <span>Learn more</span>
          <span className={styles.programArrow} aria-hidden="true">
            <ArrowRight size={18} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </div>
  );
}

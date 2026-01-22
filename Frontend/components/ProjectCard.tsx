import Image from "next/image";
import styles from "../app/page.module.css";

interface ProjectCardProps {
  title: string;
  summary: string;
  status: "Active" | "Completed" | "Planned";
  image: string;
}

export default function ProjectCard({
  title,
  summary,
  status,
  image,
}: ProjectCardProps) {
  const badgeClass =
    status === "Active"
      ? styles.badgeActive
      : status === "Planned"
      ? styles.badgePlanned
      : styles.badgeDone;

  return (
    <div className={styles.projectCard}>
      <div className={styles.projectImageWrapper}>
        <span className={`${styles.statusBadge} ${badgeClass}`}>{status}</span>

        <div className={styles.imgContainer}>
          <Image
            src={image}
            alt={title}
            fill
            className={styles.projectImg}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className={styles.imgOverlay} aria-hidden="true" />
      </div>

      <div className={styles.projectContent}>
        <h3 className={styles.projectTitle}>{title}</h3>
        <p className={styles.projectSummary}>{summary}</p>
      </div>
    </div>
  );
}

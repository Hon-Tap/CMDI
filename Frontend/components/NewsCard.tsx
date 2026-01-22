import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Cards.module.css';

type NewsCardProps = {
  title: string;
  excerpt: string;
  image: string;
  date: string;
};

export default function NewsCard({
  title,
  excerpt,
  image,
  date,
}: NewsCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
         <Image 
            src={image} 
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.cardImage}
          />
      </div>

      <div className={styles.content}>
        <small className={styles.date}>{date}</small>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.summary}>{excerpt}</p>
        <Link href="/news" className={styles.link}>
          Read more &rarr;
        </Link>
      </div>
    </article>
  );
}
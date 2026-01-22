import Image from 'next/image';
import styles from './gallery.module.css';

const images = [
  { id: 1, src: '/images/g1.jpg', tag: 'Education' },
  { id: 2, src: '/images/g2.jpg', tag: 'WASH' },
  { id: 3, src: '/images/g3.jpg', tag: 'Community' },
  { id: 4, src: '/images/g4.jpg', tag: 'Health' },
  // Add more as needed
];

export default function GalleryPage() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <h1 style={{ zIndex: 1, fontSize: '3.5rem', fontWeight: 800 }}>CMDI in Pictures</h1>
      </section>
      
      <div className="container">
        <div className={styles.galleryGrid}>
          {images.map((img) => (
            <div key={img.id} className={styles.galleryItem}>
              <Image src={img.src} alt="Gallery" fill className={styles.galleryImg} />
              <div className={styles.imgCaption}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00aeef' }}>{img.tag}</span>
                <p>Capturing the transformation in Fangak County</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
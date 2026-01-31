import Topbar from "@/components/admin/Topbar";
import styles from "./dashboard.module.css";

export default function AdminDashboardPage() {
  return (
    <div className={styles.page}>
      <Topbar title="Dashboard" />

      <section className={styles.grid}>
        <Card title="Inbox: Contact Messages" value="—" hint="New messages from contact form" />
        <Card title="Inbox: Partner Requests" value="—" hint="New partner submissions" />
        <Card title="Content: Projects" value="—" hint="Total projects" />
        <Card title="Content: News" value="—" hint="Total news posts" />
      </section>

      <section className={styles.panel}>
        <h2>Next steps</h2>
        <ul>
          <li>Wire the Inbox → Contacts list page to the API</li>
          <li>Wire the Inbox → Partners list page to the API</li>
          <li>Then Projects CRUD (list/new/edit)</li>
        </ul>
      </section>
    </div>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardValue}>{value}</div>
      <div className={styles.cardHint}>{hint}</div>
    </div>
  );
}

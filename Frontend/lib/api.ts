const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function getProjects() {
  const res = await fetch(`${API_BASE}/api/projects`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch projects: ${res.status}`);
  }

  return res.json();
}

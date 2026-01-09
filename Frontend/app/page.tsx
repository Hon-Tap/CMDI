import { query } from '../lib/api';

// This function runs on the server to get your PostgreSQL data
async function getProjects() {
  try {
    const result = await query('SELECT * FROM projects ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Database Fetch Error:', error);
    return [];
  }
}

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ borderBottom: '2px solid #0070f3', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ color: '#0070f3', fontSize: '2.5rem', margin: '0' }}>CMDI Portal</h1>
        <p style={{ color: '#555', fontSize: '1.1rem' }}>Community Development Management Initiative</p>
      </header>

      <main>
        <h2 style={{ borderLeft: '5px solid #0070f3', paddingLeft: '15px', marginBottom: '20px' }}>
          Current Projects
        </h2>

        {projects.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#888' }}>No projects found in the database.</p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {projects.map((project: any) => (
              <div 
                key={project.id} 
                style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '12px', 
                  padding: '20px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <h3 style={{ marginTop: '0', color: '#333' }}>{project.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.5' }}>{project.description}</p>
                <div style={{ marginTop: '15px' }}>
                  <span style={{ 
                    backgroundColor: '#0070f3', 
                    color: 'white', 
                    padding: '5px 12px', 
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase'
                  }}>
                    {project.status || 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
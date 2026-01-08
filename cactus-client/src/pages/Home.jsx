import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>🌵 Cactus</h1>
        <p style={styles.subtitle}>A fast-paced card game of memory and strategy</p>
        <Link to="/play" style={styles.playButton}>
          Play Now
        </Link>
      </div>
    </div>
  );
}

export default Home;

const styles = {
  container: {
    minHeight: 'calc(100vh - 60px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.06), transparent 35%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.06), transparent 40%), #0b1220',
  },
  hero: {
    textAlign: 'center',
    padding: '40px',
  },
  title: {
    fontSize: '4rem',
    margin: '0 0 16px 0',
    color: 'rgba(34,197,94,0.95)',
    fontWeight: 800,
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: '32px',
  },
  playButton: {
    display: 'inline-block',
    padding: '14px 32px',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'white',
    background: 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.15))',
    border: '1px solid rgba(34,197,94,0.4)',
    borderRadius: 12,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 8px 24px rgba(34,197,94,0.2)',
  },
};



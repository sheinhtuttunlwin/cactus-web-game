import { Link } from "react-router-dom";

function NavBar() {
    return(
        <nav style={styles.nav}>
            <h2 style={styles.logo}>🌵 Cactus</h2>

            <div style={styles.links}>
                <Link to="/" style={styles.link}>Home</Link>
                <Link to="/game" style={styles.link}>Play</Link>
                <Link to="/lobby" style={styles.link}>Lobby</Link>
            </div>
        </nav>
    );
}

export default NavBar

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 28px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        boxShadow: '0 8px 24px rgba(2,6,23,0.6)',
        backdropFilter: 'blur(6px)',
        color: 'rgba(255,255,255,0.9)'
    },
    links: {
        display: 'flex',
        gap: '18px',
        alignItems: 'center'
    },
    logo: {
        margin: 0,
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: 0.4,
        color: 'rgba(34,197,94,0.95)'
    },
    link: {
        color: 'rgba(255,255,255,0.9)',
        textDecoration: 'none',
        fontWeight: 600,
        padding: '8px 12px',
        borderRadius: 8,
        transition: 'all 0.12s ease'
    },
    linkHover: {
        background: 'rgba(255,255,255,0.02)'
    }
};
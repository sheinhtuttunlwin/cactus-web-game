import { Link } from "react-router-dom";

function NavBar() {
    return(
        <nav style={styles.nav}>
            <h2 style={styles.logo}></h2>

            <div style={styles.links}>
                <Link to="/">Home</Link>
                <Link to="/cards">Card Test</Link>
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
        padding: '16px 32px',
        borderBottom: '1px solid #ddd',
    },
    links: {
        display: 'flex',
        gap: '16px',
    },
    logo: {
        margin: 0,
    },
};
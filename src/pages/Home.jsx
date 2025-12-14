import { Link } from "react-router-dom";

function Home() {
    return(
      <>
        <div style={styles.mainTitle}>
          <h1>Cactus 🌵</h1>

          <p>Choose a page:</p>

          <Link to='/cards'>Card Test Page</Link>
        </div>
      </>
    );
}

export default Home;

const styles = {
    mainTitle: {
        padding: 40,
        color: 'white',
    },
};



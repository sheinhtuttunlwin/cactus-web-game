import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NavBar from './components/NavBar';
import Match from './pages/Match';
import Game from './pages/Game';

function App() {
  return (
    <BrowserRouter>
      <NavBar />  {/* Global Navigation Bar*/}
      <Routes>
        <Route path='/' element={<Home />} /> 
        <Route path='/game' element={<Match />} />
        <Route path='/play' element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

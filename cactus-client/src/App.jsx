import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NavBar from './components/NavBar';
import Game from './pages/Game';

function App() {
  return (
    <BrowserRouter>
      <NavBar />  {/* Global Navigation Bar*/}
      <Routes>
        <Route path='/' element={<Home />} /> 
        <Route path='/game' element={<Game />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;

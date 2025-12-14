import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CardTest from './pages/CardTest';
import NavBar from './components/NavBar';

function App() {
  return (
    <BrowserRouter>
      <NavBar />  {/* Global Navigation Bar*/}
      <Routes>
        <Route path='/' element={<Home />} /> 
        <Route path='/cards' element={<CardTest />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './components/Home';
import Ayuda from './components/Ayuda';
import RegistroValidar from './components/RegistroValidar';

import './css/App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  return (

    <Router>

      <div className="App">
        <Nav />

        <Routes>
          <Route path="/" element={ <Home /> }/>
          <Route path="/ayuda" element={ <Ayuda /> }/>
          <Route path="/validar/:id" element={ <RegistroValidar /> }/>

        </Routes>

        <Footer />  
      </div>
      
    </Router>
  );

}

export default App;

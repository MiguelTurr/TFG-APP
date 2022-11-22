import Nav from './components/Nav';
import Home from './components/Home';
import Ayuda from './components/Ayuda';
import Buscar from './components/Buscar';
import RegistroValidar from './components/RegistroValidar';
import RecordarPassword from './components/RecordarPassword';
import Perfil from './components/Perfil';
import Cookies from './components/Cookies';

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
          <Route path="/nopassword" element={ <RecordarPassword /> }/>
          <Route path="/perfil" element={ <Perfil /> }/>


          <Route path="/buscar" element={ <Buscar /> }/>

        </Routes>
        
        <Cookies/>
      </div>
      
    </Router>
  );

}

export default App;

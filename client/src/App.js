import Nav from './components/Nav';
import Home from './components/Home';

import Ayuda from './components/General/Ayuda';
import Condiciones from './components/General/Condiciones';
import Privacidad from './components/General/Privacidad';

import Buscar from './components/Buscar';
import RegistroValidar from './components/RegistroValidar';
import RecordarPassword from './components/RecordarPassword';
import Perfil from './components/User/Perfil';
import UserAlojamientos from './components/User/UserAlojamientos';
import Cookies from './components/Cookies';

import './css/App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  return (

    <Router>

      <div className="App">

        <div className="toast-container position-absolute top-50 start-50 translate-middle" id="alertasInfo"></div>
        <Nav />

        <Routes>
          <Route path="/" element={ <Home /> }/>

          <Route path="/ayuda" element={ <Ayuda /> }/>
          <Route path="/condiciones" element={ <Condiciones /> }/>
          <Route path="/privacidad" element={ <Privacidad /> }/>


          <Route path="/validar/:id" element={ <RegistroValidar /> }/>
          <Route path="/nopassword" element={ <RecordarPassword /> }/>
          <Route path="/perfil" element={ <Perfil /> }/>
          <Route path="/perfil/mis-alojamientos" element={ <UserAlojamientos /> }/>


          <Route path="/buscar" element={ <Buscar /> }/>

          <Route path="*" element={<Home />} />

        </Routes>
        
        <Cookies/>
      </div>
      
    </Router>
  );

}

export default App;

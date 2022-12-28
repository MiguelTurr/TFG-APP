import { Navigate } from "react-router-dom";

import Nav from './components/Navegacion/Nav';
import Footer from './components/Home/Footer';
import Home from './components/Home';

import Ayuda from './components/General/Ayuda';
import Condiciones from './components/General/Condiciones';
import Privacidad from './components/General/Privacidad';

import Cookies from './components/General/Cookies';

import Buscar from './components/Buscar/Buscar';
import VerAlojamiento from './components/Alojamiento/VerAlojamiento';
import Comparar from './components/Comparar/Comparar';
import PerfilPublico from './components/Usuario/PerfilPublico';

import ReservarAlojamiento from './components/Reservas/ReservarAlojamiento';
import UserReservas from './components/User/UserReservas';
import UserChats from './components/Mensajes/UserChats';

import RegistroValidar from './components/Sesion/RegistroValidar';
import RecordarPassword from './components/Sesion/RecordarPassword';
import Perfil from './components/User/Perfil';
import UserAlojamientos from './components/User/UserAlojamientos';
import UserValoraciones from './components/User/UserValoraciones';
import Favoritos from './components/User/Favoritos';
import Recomendaciones from './components/User/Recomendados';

import useToken from './js/autorizado';
import './css/App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  var { autorizado, setAutorizado } = useToken();

  //

  return (

    <Router>

      <div className="App">

        <div className="toast-container position-absolute top-50 start-50 translate-middle" id="alertasInfo"></div>
        <Nav isLogged={autorizado} changeLogged={setAutorizado}/>

        <Routes>
          <Route path="/" element={ <Home /> }/>
          <Route path="/home" element={ <Home /> }/>

          <Route path="/ayuda" element={ <Ayuda /> }/>
          <Route path="/condiciones" element={ <Condiciones /> }/>
          <Route path="/privacidad" element={ <Privacidad /> }/>

          {autorizado === false && <>
            <Route path="/validar/:id" element={ <RegistroValidar /> }/>
            <Route path="/nopassword" element={ <RecordarPassword /> }/>
          </>}

          {autorizado === true && <>
            <Route path="/perfil" element={ <Perfil changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/mis-alojamientos" element={ <UserAlojamientos changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/mis-valoraciones" element={ <UserValoraciones changeLogged={setAutorizado} /> }/>
            <Route path='/perfil/mis-reservas' element={ <UserReservas changeLogged={setAutorizado} /> }/>
            <Route path='/perfil/mis-chats' element={ <UserChats changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/favoritos" element={ <Favoritos changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/recomendados" element={ <Recomendaciones changeLogged={setAutorizado} /> }/>
          </>}

          <Route path="/alojamiento/buscar" element={ <Buscar /> }/>
          <Route path="/alojamiento/ver" element={ <VerAlojamiento /> }/>
          <Route path="/alojamiento/reservar/:id" element={ <ReservarAlojamiento changeLogged={setAutorizado} /> }/>
          <Route path="/alojamiento/comparar/:id" element={ <Comparar /> }/>
          <Route path="/usuario/ver/:id" element={ <PerfilPublico isLogged={autorizado} /> }/>

          <Route path="*" element={ <Navigate to='/home' /> } />

        </Routes>

        <Footer />
        <Cookies/>
      </div>
      
    </Router>
  );

}

export default App;

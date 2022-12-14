import Nav from './components/Nav';
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
          <Route path="/home" element={ <Home /> }/>

          <Route path="/ayuda" element={ <Ayuda /> }/>
          <Route path="/condiciones" element={ <Condiciones /> }/>
          <Route path="/privacidad" element={ <Privacidad /> }/>

          <Route path="/validar/:id" element={ <RegistroValidar /> }/>
          <Route path="/nopassword" element={ <RecordarPassword /> }/>
          <Route path="/perfil" element={ <Perfil /> }/>
          <Route path="/perfil/mis-alojamientos" element={ <UserAlojamientos /> }/>
          <Route path="/perfil/mis-valoraciones" element={ <UserValoraciones /> }/>
          <Route path='/perfil/mis-reservas' element={ <UserReservas /> }/>
          <Route path='/perfil/mis-chats' element={ <UserChats /> }/>
          <Route path="/perfil/favoritos" element={ <Favoritos /> }/>
          <Route path="/perfil/recomendados" element={ <Recomendaciones /> }/>

          <Route path="/alojamiento/buscar" element={ <Buscar /> }/>
          <Route path="/alojamiento/ver" element={ <VerAlojamiento /> }/>
          <Route path="/alojamiento/reservar/:id" element={ <ReservarAlojamiento /> }/>
          <Route path="/alojamiento/comparar/:id" element={ <Comparar /> }/>
          <Route path="/usuario/ver/:id" element={ <PerfilPublico /> }/>

          <Route path="*" element={<Home />} />

        </Routes>

        <Footer />
        <Cookies/>
      </div>
      
    </Router>
  );

}

export default App;

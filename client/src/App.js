import { useState } from 'react';
import { Navigate } from "react-router-dom";
import NoProfileImg from './img/no-profile-img.png';

import Nav from './views/Navegacion/Nav';
import Footer from './views/Home/Footer';
import Home from './views/Home';

import Ayuda from './views/General/Ayuda';
import Condiciones from './views/General/Condiciones';
import Privacidad from './views/General/Privacidad';

import Cookies from './views/General/Cookies';

import Buscar from './views/Buscar/Buscar';
import VerAlojamiento from './views/Alojamiento/VerAlojamiento';
import PerfilPublico from './views/Usuario/PerfilPublico';

import ReservarAlojamiento from './views/Reservas/ReservarAlojamiento';

import UserReservas from './views/User/UserReservas';
import UserReservasAlojamientos from './views/User/UserReservasAlojamientos';
import UserReservasGanancias from './views/User/UserReservasGanancias';

import ChatList from './views/Mensajes/ChatList';

import RegistroValidar from './views/Sesion/RegistroValidar';
import RecordarPassword from './views/Sesion/RecordarPassword';
import Perfil from './views/User/Perfil';

import UserAlojamientos from './views/User/UserAlojamientos';
import EditarAlojamiento from './views/User/EditarAlojamiento';
import CrearAlojamiento from './views/User/CrearAlojamiento';

import ValoracionesAlojamientos from './views/User/ValoracionesAlojamientos';
import ValoracionesUsuarios from './views/User/ValoracionesUsuarios';
import ValoracionesRecibidasAlojamientos from './views/User/ValoracionesRecibidasAlojamientos';
import ValoracionesRecibidasUsuarios from './views/User/ValoracionesRecibidasUsuarios';

import Favoritos from './views/User/Favoritos';
import Recomendaciones from './views/User/Recomendados';

import Admin from './views/Administracion/Admin';
import AdminAlojamientos from './views/Administracion/AdminAlojamientos';
import AdminReportes from './views/Administracion/AdminReportes';
import AdminUsuarios from './views/Administracion/AdminUsuarios';

import useToken from './js/autorizado';
import './css/App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  var { isLogged, setAutorizado } = useToken();

  var isAdmin = window.localStorage.getItem('isAdmin');
  isAdmin = (isAdmin === null || isAdmin === '0') ? false : true;
  
  //

  const [fotoPerfil, setFotoPerfil] = useState(NoProfileImg);

  //

  return (

    <Router>

      <div className="App">

        <div className="alerta-style" id="alertasInfo"></div>

        <Nav isLogged={isLogged} changeLogged={setAutorizado} isAdmin={isAdmin} fotoPerfil={fotoPerfil} setFotoPerfil={setFotoPerfil}/>

        <Routes>
          <Route path="/" element={ <Home /> }/>
          <Route path="/home" element={ <Home /> }/>

          <Route path="/ayuda" element={ <Ayuda /> }/>
          <Route path="/condiciones" element={ <Condiciones /> }/>
          <Route path="/privacidad" element={ <Privacidad /> }/>

          {isLogged === false && <>
            <Route path="/validar/:id" element={ <RegistroValidar /> }/>
            <Route path="/nopassword" element={ <RecordarPassword /> }/>
          </>}

          {isLogged === true && <>
            <Route path="/perfil" element={ <Perfil changeLogged={setAutorizado} setFotoPerfil={setFotoPerfil} /> }/>

            <Route path="/perfil/mis-alojamientos" element={ <UserAlojamientos changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/mis-alojamientos/editar/:id" element={ <EditarAlojamiento changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/mis-alojamientos/crear" element={ <CrearAlojamiento changeLogged={setAutorizado} /> }/>

            <Route path='/perfil/mis-reservas' element={ <UserReservas changeLogged={setAutorizado} /> }/>
            <Route path='/perfil/mis-reservas/alojamientos' element={ <UserReservasAlojamientos changeLogged={setAutorizado} /> }/>
            <Route path='/perfil/mis-reservas/ganancias' element={ <UserReservasGanancias changeLogged={setAutorizado} /> }/>

            <Route path="/perfil/mis-valoraciones/alojamientos" element={ <ValoracionesAlojamientos changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/mis-valoraciones/usuarios" element={ <ValoracionesUsuarios changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/mis-valoraciones/recibidas-alojamientos" element={ <ValoracionesRecibidasAlojamientos changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/mis-valoraciones/recibidas-usuarios" element={ <ValoracionesRecibidasUsuarios changeLogged={setAutorizado} /> }/>

            <Route path='/perfil/mis-chats' element={ <ChatList changeLogged={setAutorizado} /> }/>
            <Route path='/perfil/mis-chats/:id' element={ <ChatList changeLogged={setAutorizado} /> }/>

            <Route path="/perfil/favoritos" element={ <Favoritos changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/recomendados" element={ <Recomendaciones changeLogged={setAutorizado} /> }/>

            <Route path="/admin" element={ <Admin changeLogged={setAutorizado} /> }/>
            <Route path="/admin/alojamientos" element={ <AdminAlojamientos changeLogged={setAutorizado} /> }/>
            <Route path="/admin/usuarios" element={ <AdminUsuarios changeLogged={setAutorizado} /> }/>
            <Route path="/admin/reportes" element={ <AdminReportes changeLogged={setAutorizado} /> }/>

          </>}

          <Route path="/alojamiento/buscar" element={ <Buscar /> }/>
          <Route path="/alojamiento/ver" element={ <VerAlojamiento isLogged={isLogged} changeLogged={setAutorizado} /> }/>
          <Route path="/alojamiento/reservar/:id" element={ <ReservarAlojamiento changeLogged={setAutorizado} /> }/>
          <Route path="/usuario/ver/:id" element={ <PerfilPublico isLogged={isLogged} changeLogged={setAutorizado} /> }/>

          <Route path="*" element={ <Navigate to='/home' /> } />

        </Routes>

        <Footer />
        <Cookies/>
      </div>
      
    </Router>
  );

}

export default App;

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
import PerfilPublico from './components/Usuario/PerfilPublico';

import ReservarAlojamiento from './components/Reservas/ReservarAlojamiento';
import UserReservas from './components/User/UserReservas';
import UserChats from './components/Mensajes/UserChats';

import RegistroValidar from './components/Sesion/RegistroValidar';
import RecordarPassword from './components/Sesion/RecordarPassword';
import Perfil from './components/User/Perfil';

import UserAlojamientos from './components/User/UserAlojamientos';
import EditarAlojamiento from './components/User/EditarAlojamiento';
import CrearAlojamiento from './components/User/CrearAlojamiento';

import UserValoraciones from './components/User/UserValoraciones';
import Favoritos from './components/User/Favoritos';
import Recomendaciones from './components/User/Recomendados';

import Admin from './components/Administracion/Admin';
import AdminAlojamientos from './components/Administracion/AdminAlojamientos';
import AdminReportes from './components/Administracion/AdminReportes';
import AdminUsuarios from './components/Administracion/AdminUsuarios';

import useToken from './js/autorizado';
import './css/App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  var { isLogged, setAutorizado } = useToken();

  var isAdmin = window.localStorage.getItem('isAdmin');
  isAdmin = isAdmin === null || isAdmin === 0 ? false : true;

  //

  return (

    <Router>

      <div className="App">

        <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000000000 }} id="alertasInfo"></div>

        <Nav isLogged={isLogged} changeLogged={setAutorizado} isAdmin={isAdmin} />

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
            <Route path="/perfil" element={ <Perfil changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/mis-alojamientos" element={ <UserAlojamientos changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/mis-alojamientos/editar/:id" element={ <EditarAlojamiento changeLogged={setAutorizado} /> }/>
            <Route path="/perfil/mis-alojamientos/crear" element={ <CrearAlojamiento changeLogged={setAutorizado} /> }/>

            <Route path="/perfil/mis-valoraciones" element={ <UserValoraciones changeLogged={setAutorizado} /> }/>
            <Route path='/perfil/mis-reservas' element={ <UserReservas changeLogged={setAutorizado} /> }/>
            <Route path='/perfil/mis-chats' element={ <UserChats changeLogged={setAutorizado} /> }/>
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

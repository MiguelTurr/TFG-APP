import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './components/Home';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  return (

    <Router>

      <div className="App">
        <Nav />

        <Routes>
          <Route path="/" element={ <Home /> }/>

        </Routes>

        <Footer />
      </div>
      
    </Router>
  );

}

export default App;

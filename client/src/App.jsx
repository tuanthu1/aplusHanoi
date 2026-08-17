import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import Home from './pages/Home';
import Menu from './pages/Menu';
import Events from './pages/Events';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import MenuVoucher from './pages/MenuVoucher';
import MenuNormal from './pages/MenuNormal';
import GiftBox from './components/GiftBox';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <Router>
      <ToastContainer 
                position="top-right"
                autoClose={3000} 
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
      <Routes>
        <Route path="/" element={
          <div className="App">
            <Navbar />
            <Home />
            <GiftBox />
            <Footer />
          </div>
        } />
        <Route path="/menu" element={
          <div className="App">
            <Navbar />
            <Menu />
            <Footer />
          </div>
        } />
        
        <Route path="/events" element={
          <div className="App">
            <Navbar />
            <Events />
            <Footer />
          </div>
        } />
        <Route path="/menu-voucher" element={
          <div className="App">
            <Navbar />
            <MenuVoucher />
            <Footer />
          </div>
        } />
        <Route path="/menu-normal" element={
          <div className="App">
            <Navbar />
            <MenuNormal />
            <Footer />
          </div>
        } />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
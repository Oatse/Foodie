import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import History from './pages/History/History';
import Footer from "./components/Footer/Footer";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";


const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
      {/* {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>} */}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/history" element={<History />} />
          <Route path="/order" element={<PlaceOrder />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};





export default App;

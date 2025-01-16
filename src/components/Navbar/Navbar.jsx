import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";


// import { history } from "../../App";

const Navbar = ({ setShowLogin }) => {
  const { getTotalQuantity } = useContext(StoreContext);
  const totalQuantity = getTotalQuantity();
  const navigate = useNavigate();
  const [menu, setMenu] = useState("home");

  const handleHistoryClick = (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    setMenu("history");
    navigate("/history"); // Use navigate function to go to history page
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="logo" className="logo" />
      </Link>
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          Home
        </Link>
        <Link
          to="/history"
          onClick={() => {
            setMenu("history");
          }}
          className={menu === "history" ? "active" : ""}
        >
          Riwayat Pesanan
        </Link>

      </ul>
      <div className="navbar-right">
        <img src={assets.search_icon} alt="search_icon" />
        <div className="navbar-basket-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="basket_icon" />
          </Link>
          <div className={totalQuantity === 0 ? "dotHidden" : "dot"}>
            <p>{totalQuantity}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

import React from "react";
import "./Header.css";

const Header = () => {
  const scrollToMenu = (e) => {
    e.preventDefault();
    const element = document.getElementById('food-display');
    element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header>
      <div className="header-contents">
        <h2>NIKMATI SAJIAN KULINER <span>NUSANTARA</span></h2>
        <p>
          Nikmati kekayaan kuliner Nusantara yang autentik, siap memanjakan 
          selera Anda dengan berbagai pilihan makanan lezat yang dibuat 
          dengan cinta dan tradisi.
        </p>
        <a href="#food-display" onClick={scrollToMenu}>
          <button>Lihat Menu</button>
        </a>
      </div>
      <div className="scroll-indicator" onClick={scrollToMenu}>
        <svg 
          width="35" 
          height="35" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </header>
  );
};

export default Header;
import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} alt="logo" />
          <p>
            Nikmati kekayaan kuliner Nusantara yang autentik, siap memanjakan selera Anda dengan berbagai pilihan makanan lezat.
          </p>
          <div className="footer-social-icons">
            <a href="https://www.facebook.com">
              <img src={assets.facebook_icon} alt="facebook" />
            </a>
            <a href="https://www.twitter.com">
              <img src={assets.twitter_icon} alt="twitter" />
            </a>
            <a href="https://www.linkedin.com">
              <img src={assets.linkedin_icon} alt="linkedin" />
            </a>
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li onClick={() => navigate("/")}>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>HUBUNGI KAMI</h2>
          <ul>
            <li>+62-822-2535-889</li>
            <li>contact@Nigafoodie.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">Copyright 2025 © Foodie.com</p>
    </footer>
  );
};

export default Footer;

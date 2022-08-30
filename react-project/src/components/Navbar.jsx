
import React, { useState } from "react";
import { NavLink, Link } from 'react-router-dom';
import "./Navbar.css";

export default function NavBar() {
  const [open, setOpen] = useState("false");
  return (
    <div>
      <nav>
        <div className="logo">CO:WE:DE</div>
        <ul className="nav-links" style={{transform: open ? "translateX(0px)" : ""}}>
          <li>
            <a><NavLink to={'/'}>HOME</NavLink></a>
          </li>
          <li>
            <a><Link to={'/Guide'}>GUIDE</Link></a>
          </li>
          <li>
            <a><Link to={'/Matching'}>MATCHING</Link></a>
          </li>
        </ul>
        <i className="fas fa-bars burger" onClick={() => setOpen(!open)}></i>
      </nav>
    </div>
  );
}

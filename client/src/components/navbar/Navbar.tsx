import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';

export const Navbar: React.FC = () => {
  const { totalCount, openCart } = useCart();
  const location = useLocation();

  const handleScrollTo = (id: string, e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="hd">
      <Link className="logo" to="/">
        <i>e</i>Evalipie
      </Link>
      <nav>
        <a href="#ai" onClick={(e) => handleScrollTo('ai', e)}>Evalipie AI</a>
        <a href="#cats" onClick={(e) => handleScrollTo('cats', e)}>Categories</a>
        <a href="#trend" onClick={(e) => handleScrollTo('trend', e)}>Trending</a>
        <Link to="/business/dashboard">Become a Seller</Link>
        <button className="cart" onClick={openCart} id="cartBtn" type="button">
          Cart · <span id="cc">{totalCount}</span>
        </button>
      </nav>
    </header>
  );
};

export default Navbar;

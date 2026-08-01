import React from 'react';
import logoPng from '../assets/logo.png';

const Logo = ({ size = 32 }) => {
  return (
    <img
      src={logoPng}
      alt="MakeMyTrip"
      className="brand-logo-img"
      style={{ height: size, width: 'auto' }}
    />
  );
};

export default Logo;

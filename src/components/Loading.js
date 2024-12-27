import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="overlay">
      <div className="container">
        <div className="cargando">
          <div className="pelotas"></div>
          <div className="pelotas"></div>
          <div className="pelotas"></div>
          <span className="texto-cargando">Cargando...</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;

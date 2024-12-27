// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { PlaneacionProvider } from './context/PlaneacionContext';
import { ProduccionProvider } from './context/ProduccionContext';
import About from './pages/About';
import Login from './pages/Login';
import Menu from './pages/Menu';

import SeriesLotesReciboProd from './pages/SeriesLotesReciboProd';
import DetalleArticulos from './pages/DetalleArticulos';
import Layout from './pages/Layout';
//PLANEACION
import OrdenDeVenta from './pages/Planeacion/OrdenDeVenta';
import OrdenDeProduccion from './pages/Planeacion/OrdenDeProduccion';
import Inventario from './pages/Planeacion/Inventario';
import DetalleOrdenDeVenta from './pages/Planeacion/DetalleOrdenDeVenta';
import DetalleOrdenDeProduccion from './pages/Planeacion/DetalleOrdenDeProduccion';
import Autorizaciones from './pages/Planeacion/Autorizaciones';
//PRODUCCION
import OrdenProduccionComponentes from './pages/Produccion/OrdenProduccionComponentes';
import OrdenProduccionWps from './pages/Produccion/OrdenProduccionWps';
import OrdenProduccionPage from './pages/Produccion/OrdenProduccionPage';

const App = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthProvider>
      <PlaneacionProvider>
        <ProduccionProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" />} />
              <Route path="/" element={isAuthenticated ? <Layout><Navigate to="/menu" /></Layout> : <Navigate to="/login" />} />
              <Route path="/menu" element={<PrivateRoute><Layout><Menu /></Layout></PrivateRoute>} />
              <Route path="/series-lotes-recibo-prod" element={<PrivateRoute><Layout><SeriesLotesReciboProd /></Layout></PrivateRoute>} />
              <Route path="/detalle-articulos" element={<PrivateRoute><Layout><DetalleArticulos /></Layout></PrivateRoute>} />
              {/*** PLANEACION ***/}
              <Route path="/orden-de-venta" element={<PrivateRoute><Layout><OrdenDeVenta /></Layout></PrivateRoute>} />
              <Route path="/orden-de-produccion" element={<PrivateRoute><Layout><OrdenDeProduccion /></Layout></PrivateRoute>} />
              <Route path="/inventario" element={<PrivateRoute><Layout><Inventario /></Layout></PrivateRoute>} />
              <Route path="/detalle-orden-de-venta/:docEntry" element={<PrivateRoute><Layout><DetalleOrdenDeVenta /></Layout></PrivateRoute>} />
              <Route path="/detalle-orden-de-produccion/:docEntry" element={<PrivateRoute><Layout><DetalleOrdenDeProduccion /></Layout></PrivateRoute>} />
              <Route path="/autorizaciones" element={<PrivateRoute><Layout><Autorizaciones /></Layout></PrivateRoute>} />
              {/*** PRODUCCION ***/}
              <Route path="/orden-de-produccion-page/:docEntry" element={<PrivateRoute><Layout><OrdenProduccionPage /></Layout></PrivateRoute>} />
              <Route path="/orden-produccion-componentes/:docEntry" element={<PrivateRoute><Layout><OrdenProduccionComponentes /></Layout></PrivateRoute>} />
              <Route path="/orden-produccion-wps/:docEntry" element={<PrivateRoute><Layout><OrdenProduccionWps /></Layout></PrivateRoute>} />
              
              {/*** ALMACEN ***/}
              {/*** PRODUCCION ***/}
            </Routes>
          </Router>
        </ProduccionProvider>
      </PlaneacionProvider>
    </AuthProvider>
  );
};

export default App;

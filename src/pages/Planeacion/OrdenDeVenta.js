import React, { useContext, useState, useEffect } from 'react';
import { PlaneacionContext } from "../../context/PlaneacionContext";
import './OrdenDeVenta.css';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ToastMessage from '../../components/ToastMessage';
import { FaSortUp, FaSortDown } from 'react-icons/fa';
import Loading from '../../components/Loading';

const OrdenDeVenta = () => {
  const { loading, setLoading, salesOrders, fetchSalesOrders, dispathItem, toast, setToast, enviarEnRuta } = useContext(PlaneacionContext);
  const [searchTerms, setSearchTerms] = useState({
    cliente: '',
    referencia: '',
    fechaDeOV: '',
    fechaDeEntrega: '',
    ov: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8;
  const navigate = useNavigate();
  const [totales, setTotales] = useState({
    numeroOV: 0,
    totalCantidad: 0,
    totalPendiente: 0,
    stocktotal: 0
  })

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    fetchSalesOrders();
    setTotales({
      numeroOV: 0,
      totalCantidad: 0,
      totalPendiente: 0,
      stocktotal: 0
    })
  }, []);

  useEffect(() => {
    calcularTotales();
  }, [salesOrders]);

  const calcularTotales = () => {
    const nuevosTotales = filteredOrders.reduce((acumulador, order) => {
      return {
        numeroOV: acumulador.numeroOV + Number(order.DocNum),
        totalCantidad: acumulador.totalCantidad + Number(order.Quantity),
        totalPendiente: acumulador.totalPendiente + Number(order.OpenQty),
        stocktotal: acumulador.stocktotal + Number(order.StockDisp),
      };
    }, { numeroOV: 0, totalCantidad: 0, totalPendiente: 0, stocktotal: 0 });

    setTotales(nuevosTotales);
  };

  const sortedOrders = React.useMemo(() => {
    if (!salesOrders || salesOrders.length === 0) return [];
    const sortableOrders = [...salesOrders];
    if (sortConfig !== null) {
      sortableOrders.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [salesOrders, sortConfig]);


  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredOrders = sortedOrders.filter(order => {
    const clienteMatch = order.CardName.toLowerCase().includes(searchTerms.cliente.toLowerCase());
    const referenciaMatch = order.Referencia.toLowerCase().includes(searchTerms.referencia.toLowerCase());
    const fechaDeOVMatch = new Date(order.DocDate).toLocaleDateString().includes(searchTerms.fechaDeOV);
    const fechaDeEntregaMatch = new Date(order.DocDueDate).toLocaleDateString().includes(searchTerms.fechaDeEntrega);
    const ovMatch = order.DocNum.toString().includes(searchTerms.ov);
    return clienteMatch && referenciaMatch && fechaDeOVMatch && fechaDeEntregaMatch && ovMatch;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEntregar = (e, DocEntry, LineNum) => {
    e.stopPropagation();
    e.preventDefault();
    dispathItem(DocEntry, LineNum);
  };

  const handleEnviarEnRuta = (e, order) => {
    e.stopPropagation();
    e.preventDefault();
    enviarEnRuta(order.DocEntry, order.LineNum)
  }

  return (
    <div className="ordenes-container">
      <div className='row mb-3'>
        <div className='col-md-4'>
          <h2>Órdenes de Venta</h2>
        </div>
        <div className="col-md-8 d-sm-flex totales-container">
          <div className="total-item bg-primary">
            <strong>Numero de OV:</strong> <span>{totales.numeroOV}</span>
          </div>
          <div className="total-item bg-secondary">
            <strong>Total Cantidad:</strong> <span>{totales.totalCantidad}</span>
          </div>
          <div className="total-item bg-success">
            <strong>Total Pendiente:</strong> <span>{totales.totalPendiente}</span>
          </div>
          <div className="total-item bg-warning">
            <strong>Total Stock:</strong> <span>{totales.stocktotal}</span>
          </div>
        </div>
      </div>

      <div className="filter-container">
        <h4 className="filter-title mb-3">Filtros de Búsqueda</h4>
        <div className="filter-inputs">
          <input
            type="text"
            placeholder="Buscar por Cliente"
            value={searchTerms.cliente}
            onChange={(e) => setSearchTerms({ ...searchTerms, cliente: e.target.value })}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Buscar por Referencia"
            value={searchTerms.referencia}
            onChange={(e) => setSearchTerms({ ...searchTerms, referencia: e.target.value })}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Buscar por Fecha OV"
            value={searchTerms.fechaDeOV}
            onChange={(e) => setSearchTerms({ ...searchTerms, fechaDeOV: e.target.value })}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Buscar por Fecha Entrega"
            value={searchTerms.fechaDeEntrega}
            onChange={(e) => setSearchTerms({ ...searchTerms, fechaDeEntrega: e.target.value })}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Buscar por OV"
            value={searchTerms.ov}
            onChange={(e) => setSearchTerms({ ...searchTerms, ov: e.target.value })}
            className="filter-input"
          />
        </div>
        <Button variant="secondary" className="mt-3 clear-filters-btn" onClick={() => setSearchTerms({ cliente: '', referencia: '', fechaDeOV: '', fechaDeEntrega: '', ov: '' })}>
          Limpiar filtros
        </Button>
      </div>


      <div className="table-wrapper">
        <table className="ordenes-table">
          <thead>
            <tr>
              <th>#</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('ItemCode')}>Código {sortConfig.key === 'ItemCode' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('ItemName')}>Descripción {sortConfig.key === 'ItemName' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('Presentacion')}>Presentación {sortConfig.key === 'Presentacion' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('Quantity')}>Cantidad {sortConfig.key === 'Quantity' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('OpenQty')}>Cantidad <br /> Pendiente {sortConfig.key === 'OpenQty' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('StockDisp')}>Stock <br /> Disp(ALMPT) {sortConfig.key === 'StockDisp' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('DocNum')}>Ov {sortConfig.key === 'DocNum' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('CardName')}>Cliente {sortConfig.key === 'CardName' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('Referencia')}>Referencia {sortConfig.key === 'Referencia' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('DocDate')}>Fecha <br /> De OV {sortConfig.key === 'DocDate' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('DocDueDate')}>Fecha <br /> De Entrega {sortConfig.key === 'DocDueDate' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('StatusRuta')}>Enviar <br /> a Entrega {sortConfig.key === 'StatusRuta' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('StatusOP')}>WPS {sortConfig.key === 'StatusOP' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order, index) => (
                <tr key={index + 1 + (currentPage - 1) * ordersPerPage} onClick={() => { }}>
                  <td>{index + 1 + (currentPage - 1) * ordersPerPage}</td>
                  <td>{order.ItemCode}</td>
                  <td>{order.ItemName}</td>
                  <td>{order.Presentacion}</td>
                  <td>{order.Quantity}</td>
                  <td>{order.OpenQty}</td>
                  <td>{order.StockDisp}</td>
                  <td>{order.DocNum}</td>
                  <td>{order.CardName}</td>
                  <td>{order.Referencia}</td>
                  <td>{new Date(order.DocDate).toLocaleDateString()}</td>
                  <td>{new Date(order.DocDueDate).toLocaleDateString()}</td>
                  <td>
                    <Button variant={order.StatusRuta === 'L' ? 'success' : 'warning'} size="sm" className="w-100" onClick={(e) => handleEnviarEnRuta(e, order)}>
                      {order.StatusRuta === 'L' ? 'En Ruta' : 'Pendiente'}
                    </Button>
                  </td>
                  <td>
                    {order.StatusOP > 0 ? 'Creada/Planificada' : 'Pendiente'}
                  </td>
                  <td>
                    {order.StatusOP === 0 ? (
                      <Button variant="primary" size="sm" className="w-100" onClick={(e) => handleEntregar(e, order.DocEntry, order.LineNum)}>
                        Entregar
                      </Button>
                    ) : ''}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="14">No hay órdenes de venta disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination">
        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index}
            onClick={() => paginate(index + 1)}
            variant={currentPage === index + 1 ? "primary" : "secondary"}
            className="ms-1"
          >
            {index + 1}
          </Button>
        ))}
      </div>

      <ToastMessage
        show={toast.show}
        onClose={() => setToast({ show: false })}
        message={toast.message}
        title={toast.title}
        type={toast.type}
      />

      {loading && <Loading />}
    </div>
  );
};

export default OrdenDeVenta;

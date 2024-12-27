import React, { useContext, useState, useEffect } from 'react';
import { PlaneacionContext } from "../../context/PlaneacionContext";
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading';
import ToastMessage from '../../components/ToastMessage';
import './OrdenDeProduccion.css';
import { Button } from 'react-bootstrap';

const OrdenDeProduccion = () => {
  const { loading, prodOrders, fetchProdOrders, toast, setToast } = useContext(PlaneacionContext);
  const [filters, setFilters] = useState({
    docNum: '',
    orderDate: '',
    status: '',
    customerOrder: '',
    customerName: '',
    productCode: '',
    productName: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchProdOrders();
  }, []);

  const filteredOrders = prodOrders.filter(order => {
    const docNumMatch = order.DocNum.toString().includes(filters.docNum);

    // Convierte ambas fechas a formato YYYY-MM-DD para una comparación precisa
    const orderDateFormatted = new Date(order.Fecha_Fabricacion).toISOString().split('T')[0];
    const orderDateMatch = filters.orderDate ? orderDateFormatted === filters.orderDate : true;

    const statusMatch = order.StatusTexto.toLowerCase().includes(filters.status.toLowerCase());
    const customerOrderMatch = (order.OV ? order.OV.toString() : '').toLowerCase().includes(filters.customerOrder.toLowerCase());
    const customerNameMatch = (order.CardName || '').toLowerCase().includes(filters.customerName.toLowerCase());
    const productCodeMatch = (order.ItemCode || '').toLowerCase().includes(filters.productCode.toLowerCase());
    const productNameMatch = (order.ProdName || '').toLowerCase().includes(filters.productName.toLowerCase());

    return (
      docNumMatch &&
      orderDateMatch &&
      statusMatch &&
      customerOrderMatch &&
      customerNameMatch &&
      productCodeMatch &&
      productNameMatch
    );
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calcula los totales de peso bruto y peso neto
  const totalPesoBruto = filteredOrders.reduce((acc, order) => acc + (order.WeightB || 0), 0);
  const totalPesoNeto = filteredOrders.reduce((acc, order) => acc + (order.WeightN || 0), 0);

  return (
    <div className="ordenes-produccion-container">
      <div className="header-row">
        <h2>Órdenes de Producción</h2>
        <div className="totals">
          <span style={{ width: '25px', backgroundColor: '#000' }}></span><span>Planificado (KG.): {totalPesoBruto.toFixed(2)}</span>
          <span style={{ width: '25px', backgroundColor: '#FFA500' }}></span><span>Planificado (PZ.): {totalPesoBruto.toFixed(2)}</span>
          <span style={{ width: '25px', backgroundColor: '#87CEEB' }}></span><span>Peso Bruto: {totalPesoBruto.toFixed(2)}</span>
          <span style={{ width: '25px', backgroundColor: '#A18262' }}></span><span>Peso Neto: {totalPesoNeto.toFixed(2)}</span>
        </div>
      </div>

      {/* Filtros de búsqueda */}
      <div className="filter-container">
        <h4 className="filter-title mb-3">Filtros de Búsqueda</h4>
        <div className="filter-inputs">
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar por OP"
            value={filters.docNum}
            onChange={e => setFilters({ ...filters, docNum: e.target.value })}
          />
          <input
            type="date"
            className="filter-input"
            placeholder="Buscar por Fecha de Orden"
            value={filters.orderDate}
            onChange={e => setFilters({ ...filters, orderDate: e.target.value })}
          />
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar por Estatus"
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
          />
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar por Pedido del Cliente"
            value={filters.customerOrder}
            onChange={e => setFilters({ ...filters, customerOrder: e.target.value })}
          />
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar por Cliente"
            value={filters.customerName}
            onChange={e => setFilters({ ...filters, customerName: e.target.value })}
          />
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar por N° de Producto"
            value={filters.productCode}
            onChange={e => setFilters({ ...filters, productCode: e.target.value })}
          />
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar por Producto"
            value={filters.productName}
            onChange={e => setFilters({ ...filters, productName: e.target.value })}
          />
          <Button variant="secondary" onClick={() => setFilters({
            docNum: '',
            orderDate: '',
            status: '',
            customerOrder: '',
            customerName: '',
            productCode: '',
            productName: ''
          })}>
            Limpiar filtros
          </Button>
        </div>
      </div>

      <table className="ordenes-produccion-table">
        <thead>
          <tr>
            <th>#</th>
            <th>OP</th>
            <th>Fecha De Orden</th>
            <th>Estatus</th>
            <th>Pedido Del Cliente</th>
            <th>Cliente</th>
            <th>N° De Producto</th>
            <th>Producto</th>
            <th>Presentacion</th>
            <th>Cantidad Planificada</th>
            <th>Peso Bruto</th>
            <th>Peso Neto</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order, index) => (
            <tr style={{ cursor: 'pointer' }} key={order.DocEntry} onClick={() => {
              const storedSubMenus = localStorage.getItem("subMenus");
              const subMenusArray = JSON.parse(storedSubMenus);
              /* if (subMenusArray.permisos[0].name === 'Crear') {
                navigate(`${subMenusArray.permisos[0].url}/${order.DocEntry}`)
              } else {
                navigate(`/detalle-orden-de-produccion/${order.DocEntry}`)
              } */
              console.log('navigate...', subMenusArray.permisos[0].url)
              navigate(`${subMenusArray.permisos[0].url}/${order.DocEntry}`)
            }}>
              <td>{index + 1 + (currentPage - 1) * ordersPerPage}</td>
              <td>{order.DocNum}</td>
              <td>{new Date(order.Fecha_Fabricacion).toLocaleDateString()}</td>
              <td>
                <span
                  style={{
                    backgroundColor: order.StatusTexto === 'Planificado' ? '#ffca2c' : '#157347',
                    padding: 5,
                    marginLeft: '10px',
                    color: order.StatusTexto === 'Planificado' ? '#000' : '#fff',
                    borderRadius: 5
                  }}
                >
                  {order.StatusTexto}
                </span>
              </td>
              <td>{order.OV}</td>
              <td>{order.CardName}</td>
              <td>{order.ItemCode}</td>
              <td>{order.ProdName}</td>
              <td>{order.Uom}</td>
              <td>{order.PlannedQty}</td>
              <td>{order.WeightB}</td>
              <td>{order.WeightN}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="paginationOP">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => paginate(index + 1)}
          >
            {index + 1}
          </button>
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

export default OrdenDeProduccion;

// src/pages/Home.js
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Produccion.css";
import Table from "react-bootstrap/Table";
import { useDocuments } from "../context/DocumentsContext";
import SearchBar from "../components/SearchBar";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faPlus,
  faMinus,
  faPaperPlane,
  faHandPointRight,
  faSignOut,
  faPlusCircle,
  faTable,
  faFrown
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { Link } from "react-router-dom";
import Modal from "../components/Recibo_Produccion/Modal_Conteo_Articulo";
import NoResults from "../components/Recibo_Produccion/NoResults"
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSeriesLotes } from "../context/SeriesLotesContext";
import ModalConteo from "../components/Recibo_Produccion/Modal_Conteo_Articulo";

const Produccion = () => {
  const { logout } = useContext(AuthContext);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const navigate = useNavigate();
  const {
    documents,
    error,
    filteredDocuments,
    warehouses,
    locations,
    selectedWarehouse,
    showLocationSelect,
    handleWarehouseChange,
    fetchWarehouses,
    handleActionTypeChange,
    selectedActionType,
    setSelectedActionType,
    selectedLocation,
    setSelectedLocation,
    handleLocationChange,
    quantity,
    setQuantity,
    handleQuantityChange,
    incrementQuantity,
    decrementQuantity,
    docSeleccionado,
    setDocSeleccionado,
    fetchDocuments,
    verDetalle,
    loading,
    setLoading,
  } = useDocuments();

  const {
    filteredSeriesLotes,
    fetchSeriesLotes,
    setFilteredSeriesLotes,
    CrearItem,
    currentItemsDefinidos,
    setCurrentItemsDefinidos,
    filteredItemsDefinidos,
    setFilteredItemsDefinidos,
    eliminarElemento,
    agregarElemento,
    isModalOpen,
    setIsModalOpen,
    handleDeleteClick,
    alertMessage,
    confirmDelete,
    showConfirm,
    setShowConfirm,
    showAlert,
    setShowAlert,
    elementoEliminar,
    setElementoEliminar,
    cerrarDocReciboProd,
    alertType,
    setAlertType,
    setAlertMessage,
  } = useSeriesLotes();

  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Calcular los datos a mostrar en la página actual
  const offset = currentPage * itemsPerPage;
  const currentDocuments = filteredDocuments.slice(
    offset,
    offset + itemsPerPage
  );
  const pageCount = Math.ceil(filteredDocuments.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Resetear a la primera página al realizar una nueva búsqueda
  };

  const openModal = (doc) => {
    setIsModalOpen(true);
    setDocSeleccionado(doc);
    fetchWarehouses();
    setQuantity(0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDocSeleccionado([]);
  };

  const handleSeriesLotes = (doc, gestionItem) => {
    setDocSeleccionado(doc);
    localStorage.setItem("docSeleccionado", JSON.stringify(doc));
    navigate(`/series-lotes-recibo-prod?tipo=${gestionItem}`);
  };

  const handleAddNew = () => {
    // Lógica para conteo de articulo gestionItem = I
    agregarElemento(
      null,
      selectedActionType,
      selectedWarehouse,
      selectedLocation,
      quantity,
      docSeleccionado
    );
  };

  const handleVerDetalles = (doc) => {
    setDocSeleccionado(doc);
    localStorage.setItem("docSeleccionado", JSON.stringify(doc));
    navigate(`/detalle-articulos`);
  };

  const comboTipoAccion = (
    <div className="modal-combo">
      <select
        id="action-select"
        className="modal-select"
        onChange={(e) => handleActionTypeChange(e.target.value)}
        style={styles.select}
        value={selectedActionType}
      >
        <option value="Completar">Completar</option>
        <option value="Rechazar">Rechazar</option>
      </select>
    </div>
  );

  const comboAlmacen = (
    <div>
      <select
        id="warehouse-select"
        onChange={(e) => handleWarehouseChange(e.target.value)}
        value={selectedWarehouse}
        className="modal-select"
        style={styles.select}
      >
        <option value="">Seleccionar Almacén</option>
        {warehouses.map((wh) => (
          <option key={wh.whsCode} value={wh.whsCode}>
            {wh.whsName}
          </option>
        ))}
      </select>
    </div>
  );

  const comboUbicacion = (
    <div>
      <select
        id="location-select"
        className="modal-select"
        onChange={(e) => handleLocationChange(e.target.value)}
        style={styles.select}
      >
        <option value="">Seleccionar Ubicación</option>
        {(locations || []).map((bin) => (
          <option key={bin.absEntry} value={bin.absEntry}>
            {bin.sL1Code || "Sin Descripción"}
          </option>
        ))}
      </select>
    </div>
  );

  const Input = ({ valor }) => (
    <input
      type="text"
      className="form-control"
      placeholder={valor}
      style={{
        width: "100%",
        padding: "10px",
        marginTop: "10px",
        marginBottom: "30px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "16px",
      }}
    />
  );

  return (
    <div>
      <div className="row">
        <div class="col-sm-12 col-md-6">
          <h1>Ordenes De Fabricacion</h1>
        </div>
        <div class="col-sm-12 col-md-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearch={handleSearch}
            placeholder={"Buscar por documento o descripcion"}
          />
        </div>
      </div>

      <div className="table-container">
        {filteredDocuments.length === 0 &&
          error === null &&
          loading === false ? (
          <NoResults Texto='No se encontraron resultados' />
        ) : error != null ? (
          <Alert
            variant={alertType}
            onClose={() => setShowAlert(false)}
            dismissible
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: "1000",
              width: "80%",
              maxWidth: "400px",
            }}
          >
            {alertMessage}
          </Alert>
        ) : (
          <Table striped bordered hover className="mt-4 styled-table">
            <thead>
              <tr className="text-center">
                <th>N°</th>
                <th>Descripcion</th>
                <th>Estado</th>
                <th>Gestion del Articulo</th>
                <th>Contados</th>
                <th>Total</th>
                <th>Fecha de fabricacion</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {currentDocuments.map((doc, index) => (
                <tr key={doc.id} className="align-middle" onClick={() => { }}>
                  <td>{doc.docNum}</td>
                  <td>{doc.prodName}</td>
                  <td>{doc.status}</td>
                  <td>
                    {doc.gestionItem == "S"
                      ? "Series"
                      : doc.gestionItem == "L"
                        ? "Lotes"
                        : "Articulo"}
                  </td>
                  <td>{doc.countedQty}</td>
                  <td>{doc.plannedQty}</td>
                  <td>
                    {moment(doc.fecha_fabricacion).utc().format("DD/MM/YYYY")}
                  </td>
                  <td className="d-flex justify-content-center align-items-center">
                    <Button
                      variant="danger"
                      type="submit"
                      className="mx-2"
                      onClick={() => cerrarDocReciboProd(doc.docEntry)}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                      Cerrar
                    </Button>
                    <Button
                      variant="warning"
                      type="submit"
                      className="mx-2"
                      onClick={() => handleVerDetalles(doc.docEntry)}
                    >
                      <FontAwesomeIcon icon={faTable} className="me-2" />
                      Detalles
                    </Button>

                    {doc.gestionItem === "L" ? (
                      <Button
                        variant="secondary"
                        type="submit"
                        className="mx-2"
                        onClick={() => {
                          handleSeriesLotes(doc, "Lotes");
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faHandPointRight}
                          className="me-2"
                        />
                        Lotes
                      </Button>
                    ) : doc.gestionItem === "S" ? (
                      <Button
                        variant="secondary"
                        type="submit"
                        className="mx-2"
                        onClick={() => {
                          handleSeriesLotes(doc, "Series");
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faHandPointRight}
                          className="me-2"
                        />
                        Series
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        type="submit"
                        className="mx-2"
                        onClick={() => openModal(doc)}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Contar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          activeClassName={"active"}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} >
        <h2>Conteo de Artículo</h2>
        <div
          style={{ display: "flex", flexDirection: "row", gap: "20px" }}
          className="mt-4"
        >
          {/* Primera columna */}
          <div style={{ flex: 1 }}>
            {comboTipoAccion}
            {/* ComboBox para Almacenes */}
            {comboAlmacen}
            {/* ComboBox para Ubicaciones, sólo si hay bins */}
            {showLocationSelect && comboUbicacion}
            {/* Formulario de Incrementar/Decrementar Cantidad */}
            <div style={styles.counterContainer}>
              <button onClick={decrementQuantity} style={styles.button}>
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <input
                value={quantity}
                onChange={handleQuantityChange}
                style={styles.input}
              />
              <button onClick={incrementQuantity} style={styles.button}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <div className="d-flex justify-content-end my-3">
              <Button
                variant="danger"
                onClick={closeModal}
                className="d-flex align-items-center"
              >
                <FontAwesomeIcon icon={faSignOut} className="me-2" />
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="ms-3 d-flex align-items-center"
                onClick={() => handleAddNew()}
              >
                <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
                Agregar
              </Button>
            </div>
          </div>
          {/* Segunda columna */}
          <div style={{ flex: 1 }}>
            <Input valor={"Peso"} />
            <Input valor={"Cantidad de rollo"} />
            <Input valor={"Etiquetar"} />
            <Input valor={"Pallet"} />
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmación */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar este elemento?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Alerta de Éxito */}
      {showAlert && (
        <Alert
          variant={alertType}
          onClose={() => setShowAlert(false)}
          dismissible
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: "1000",
            width: "80%",
            maxWidth: "400px",
          }}
        >
          {alertMessage}
        </Alert>
      )}
    </div>
  );
};

// Estilos CSS mejorados
const styles = {
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "29px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  counterContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#007BFF",
    border: "none",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "60px",
    textAlign: "center",
    margin: "0 10px",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  quantityText: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

export default Produccion;

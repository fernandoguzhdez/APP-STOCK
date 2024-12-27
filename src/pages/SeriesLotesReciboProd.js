import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useSeriesLotes } from "../context/SeriesLotesContext";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Table from "react-bootstrap/Table";
import SearchBar from "../components/SearchBar";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faPlus,
  faSignOut,
  faEdit,
  faTrash,
  faPaperPlane,
  faPlusCircle,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import ModalConteo from "../components/Recibo_Produccion/Modal_Conteo_Articulo";
import { Button, Modal, Alert } from "react-bootstrap";
import { useDocuments } from "../context/DocumentsContext";
import Loading from "../components/Loading";

const SeriesLotesReciboProd = () => {
  const {
    filteredSeriesLotes,
    fetchSeriesLotes,
    loading,
    setLoading,
    setFilteredSeriesLotes,
    CrearItem,
    currentItemsDefinidos,
    setCurrentItemsDefinidos,
    filteredItemsDefinidos,
    setFilteredItemsDefinidos,
    eliminarElemento,
    agregarElemento,
    openModal,
    closeModal,
    isModalOpen,
    setIsModalOpen,
    handleDeleteClick,
    confirmDelete,
    showConfirm,
    setShowConfirm,
    showAlert,
    setShowAlert,
    elementoEliminar,
    setElementoEliminar,
    alertType,
    setAlertType,
    alertMessage,
    setAlertMessage,
    cerrarDocReciboProd,
  } = useSeriesLotes();

  const {
    fetchWarehouses,
    warehouses,
    locations,
    selectedWarehouse,
    selectedLocation,
    showLocationSelect,
    handleWarehouseChange,
    handleLocationChange,
    handleActionTypeChange,
    selectedActionType,
    quantity,
    setQuantity,
    handleQuantityChange,
    incrementQuantity,
    decrementQuantity,
    guardarConteo,
    docSeleccionado,
    setDocSeleccionado,
  } = useDocuments();

  const { isAuthenticated } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  const [newItemName, setNewItemName] = useState("");
  const [actionType, setActionType] = useState("completar");
  const navigate = useNavigate();
  const location = useLocation();
  const offset = currentPage * itemsPerPage;
  const currentSeriesLotes = filteredItemsDefinidos.slice(
    offset,
    offset + itemsPerPage
  );
  const pageCount = Math.ceil(filteredItemsDefinidos.length / itemsPerPage);

  useEffect(() => {
    const docSelec = JSON.parse(localStorage.getItem("docSeleccionado"));
    setDocSeleccionado(docSelec)
    fetchSeriesLotes(docSelec);
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleSearch = (e) => {
    /* setSearchTerm(e.target.value);
        setCurrentPage(0); */
  };

  const handleAddNew = () => {
    agregarElemento(
      newItemName,
      selectedActionType,
      selectedWarehouse,
      selectedLocation,
      quantity,
      docSeleccionado
    );
  };

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const params = new URLSearchParams(location.search);
  const tipo = params.get("tipo");

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

  const botonesHeader = (
    <div className="d-flex justify-content-between my-3">
      <Button
        variant="success"
        className="me-3"
        onClick={() => cerrarDocReciboProd(docSeleccionado.docEntry)}
      >
        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
        Enviar Recibo
      </Button>

      <Button
        variant="primary"
        className="ms-3"
        onClick={() => setIsModalOpen(true)}
      >
        <FontAwesomeIcon icon={faPlus} className="me-2" />
        Agregar Nuevo
      </Button>
    </div>
  );

  const formIncrementarDecrementar = (
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
  );

  const Input = ({ valor }) => (
    <input
      type="text"
      className="form-control"
      placeholder={valor}
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "29px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "16px",
      }}
    />
  );

  return (
    <div>
      <div className="row">
        <div className="col-sm-12 col-md-6">
          <h1>Definición De Lotes</h1>
        </div>
        <div className="col-sm-12 col-md-6">
          <SearchBar
            searchTerm={{}}
            onSearch={{}}
            placeholder={`Buscar por ${
              docSeleccionado.gestionItem == "S" ? "Serie" : "Lote"
            }  o codigo de articulo `}
          />
        </div>
      </div>

      <div className="table-container">
        {loading === false && filteredItemsDefinidos.length === 0 ? (
          <div>
            {botonesHeader}
            <div className="no-results">
              <FontAwesomeIcon icon={faExclamationCircle} size="3x" />
              <p>No se encontraron resultados</p>
            </div>
          </div>
        ) : (
          <div>
            {botonesHeader}
            <Table striped bordered hover className="mt-4 styled-table">
              <thead>
                <tr className="text-center">
                  <th>{tipo === "Series" ? "N° Serie" : "N° Lote"}</th>
                  <th>Articulo</th>
                  <th>Almacen</th>
                  <th>Ubicacion</th>
                  <th>Tipo De Clase</th>
                  <th>Fecha Creacion</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {currentSeriesLotes.map((doc, index) => (
                  <tr
                    key={doc.index}
                    className="align-middle"
                    onClick={() => {}}
                  >
                    <td>{doc.idCode}</td>
                    <td>{doc.itemCode}</td>
                    <td>{doc.whsCode}</td>
                    <td>{doc.binEntry}</td>
                    <td>{doc.ClaseOp === "C" ? "Completado" : "Rechazado"}</td>
                    <td>{moment(doc.update).utc().format("DD/MM/YYYY")}</td>
                    <td className="d-flex flex-row justify-content-center">
                      <Button
                        variant="primary"
                        type="submit"
                        className="mx-3"
                        onClick={() => openModal()}
                      >
                        <FontAwesomeIcon icon={faEdit} className="me-2" />
                        Editar
                      </Button>

                      <Button
                        variant="danger"
                        type="submit"
                        className="mx-3"
                        onClick={() => {
                          handleDeleteClick();
                          setElementoEliminar({
                            index: index,
                            docSeleccionado: docSeleccionado,
                            doc: doc,
                          });
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
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

      <ModalConteo isOpen={isModalOpen} onClose={closeModal}>
        <h2>Agregar Nuevo</h2>
        <div style={{ display: "flex", flexDirection: "row", gap: "20px" }} className="mt-4">
          <div style={{ flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Ingresar Nombre"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            />

            {comboTipoAccion}
            {/* ComboBox para Almacenes */}
            {comboAlmacen}
            {/* ComboBox para Ubicaciones, sólo si hay bins */}
            {showLocationSelect && comboUbicacion}
            {/* Formulario de Incrementar/Decrementar Cantidad */}
            {docSeleccionado.gestionItem === "L"
              ? formIncrementarDecrementar
              : ""}
            <div className="d-flex justify-content-end my-3">
              <Button variant="danger" onClick={closeModal} className="d-flex align-items-center">
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
      </ModalConteo>

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

      <div>{loading && <Loading />}</div>
    </div>
  );
};

// Estilos CSS mejorados
const styles = {
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
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

export default SeriesLotesReciboProd;

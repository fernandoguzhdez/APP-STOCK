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
  faPaperPlane,
  faHandPointRight,
  faTable,
  faPrint,
  faBalanceScale,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { Button } from "react-bootstrap";
import Loading from "../components/Loading";

const DetalleArticulos = () => {
  const {
    docSeleccionado,
    setDocSeleccionado,
    verDetalle,
    filterDetalleArticulos,
    setFilterDetalleArticulos,
    detalleArticulos,
    setDetalleArticulos,
    loading,
  } = useDocuments();

  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const offset = currentPage * itemsPerPage;
  const currentDetalleArticulo = filterDetalleArticulos.slice(
    offset,
    offset + itemsPerPage
  );
  const pageCount = Math.ceil(filterDetalleArticulos.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  useEffect(() => {
    const docSelec = JSON.parse(localStorage.getItem("docSeleccionado"));
    setDocSeleccionado(docSelec);
    verDetalle(docSelec);
  }, []);

  return (
    <div>
      <div className="row">
        <div class="col-sm-12 col-md-6">
          <h1>Detalle Articulos</h1>
        </div>
        <div class="col-sm-12 col-md-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearch={handleSearch}
            placeholder={"Buscar por codigo o descripcion"}
          />
        </div>
      </div>

      <div className="table-container">
        {loading === false && filterDetalleArticulos.length === 0 ? (
          <div className="no-results">
            <FontAwesomeIcon icon={faExclamationCircle} size="3x" />
            <p>No se encontraron resultados</p>
          </div>
        ) : (
          <Table striped bordered hover className="mt-4 styled-table">
            <thead>
              <tr className="text-center">
                <th>Codigo</th>
                <th>Descripcion</th>
                <th>Almacen</th>
                <th>Ubicacion</th>
                <th>Gestion Item</th>
                <th>Cant. Enviada</th>
                <th>Cant. Planificada</th>
                <th>Empleado</th>
                <th>Turno</th>
                <th>Hora</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentDetalleArticulo.map((detalle, index) => (
                <tr key={index} className="align-middle" onClick={() => {}}>
                  <td>{detalle.itemCode}</td>
                  <td>{detalle.itemDesc}</td>
                  <td>{detalle.whsCode}</td>
                  <td>{detalle.binEntry}</td>
                  <td>
                    {detalle.gestionItem === "S"
                      ? "Series"
                      : detalle.gestionItem === "L"
                      ? "Lotes"
                      : "Articulo"}
                  </td>
                  <td>{detalle.countQty}</td>
                  <td>{detalle.totalQty}</td>
                  <td>{detalle.empleado}</td>
                  <td>{detalle.turno}</td>
                  <td>{detalle.hora}</td>
                  <td className="d-flex justify-content-center align-items-center">
                    <Button
                      variant="success"
                      type="submit"
                      className="mx-2"
                      onClick={() => {}}
                    >
                      <FontAwesomeIcon icon={faPrint} />
                    </Button>
                    <Button
                      variant="warning"
                      type="submit"
                      className="mx-2"
                      onClick={() => {}}
                    >
                      <FontAwesomeIcon icon={faBalanceScale} />
                    </Button>
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

      <div>{loading && <Loading />}</div>
    </div>
  );
};

export default DetalleArticulos;

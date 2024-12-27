import React, { useContext, useEffect, useState } from 'react';
import { PlaneacionContext } from '../../context/PlaneacionContext';
import { Button } from 'react-bootstrap';
import ToastMessage from '../../components/ToastMessage';
import ConfirmModal from '../../components/ConfirmModal';
import Loading from '../../components/Loading';
import ReactPaginate from 'react-paginate';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import './Autorizaciones.css';

const Autorizaciones = () => {
    const { autorizaciones, fetchAutorizaciones, loading, error, handleDocumentsAuthorize, toast, setToast } = useContext(PlaneacionContext);
    const [showModal, setShowModal] = useState(false);
    const [documento, setDocumento] = useState([]);
    const [permiso, setPermiso] = useState(0);
    const [tituloConfirm, setTituloConfirm] = useState(null)
    const [mensajeConfirm, setMensajeConfirm] = useState(null)

    // Estados para los filtros y ordenamiento
    const [filters, setFilters] = useState({
        nombreSolicitante: '',
        fechaCreacion: '',
        fechaNecesaria: '',
        estatus: '',
        codigoArticulo: '',
        codigoSN: '',
    });

    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchAutorizaciones();
    }, []);

    // Función para manejar la actualización de los filtros
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    // Función para manejar el ordenamiento de las columnas
    const handleSort = (column) => {
        let direction = 'asc';
        if (sortConfig.key === column && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: column, direction });
    };

    // Función para ordenar los datos
    const sortedAutorizaciones = [...autorizaciones].sort((a, b) => {
        if (sortConfig.key) {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }
        return 0;
    });

    // Filtrar los datos según los filtros activos
    const filteredAutorizaciones = sortedAutorizaciones.filter((doc) => {
        const createDate = new Date(doc.CreateDate).toISOString().split('T')[0];
        const reqDate = new Date(doc.ReqDate).toISOString().split('T')[0];

        return (
            doc.Name.toLowerCase().includes(filters.nombreSolicitante.toLowerCase()) &&
            (!filters.fechaCreacion || createDate === filters.fechaCreacion) &&
            (!filters.fechaNecesaria || reqDate === filters.fechaNecesaria) &&
            doc.Status.toLowerCase().includes(filters.estatus.toLowerCase()) &&
            doc.ItemCode.toLowerCase().includes(filters.codigoArticulo.toLowerCase()) &&
            doc.CardCode.toLowerCase().includes(filters.codigoSN.toLowerCase())
        );
    });

    // Paginación
    const pageCount = Math.ceil(filteredAutorizaciones.length / itemsPerPage);
    const displayAutorizaciones = filteredAutorizaciones.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    const handleOpenModal = (doc, permiso, titulo, mensaje) => {
        setShowModal(true);
        setDocumento(doc);
        setPermiso(permiso);
        setTituloConfirm(titulo)
        setMensajeConfirm(mensaje)
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirm = () => {
        handleDocumentsAuthorize(documento, permiso);
        setShowModal(false);
    };

    return (
        <div className="autorizaciones">
            <div className="mb-3 mt-3">
                <h2>Autorizaciones</h2>
            </div>

            {/* Filtros */}
            <div className="filter-container p-3 rounded shadow-sm">
                <h4 className="filter-title mb-3">Filtros de Búsqueda</h4>
                <div className='filter-inputs'>
                    <input type="text" className="filter-input" name="nombreSolicitante" placeholder="Nombre Solicitante" value={filters.nombreSolicitante} onChange={handleFilterChange} />
                    <input type="date" className="filter-input" name="fechaCreacion" placeholder="Fecha De Creacion" value={filters.fechaCreacion} onChange={handleFilterChange} />
                    <input type="date" className="filter-input" name="fechaNecesaria" placeholder="Fecha Necesaria" value={filters.fechaNecesaria} onChange={handleFilterChange} />
                    <input type="text" className="filter-input" name="estatus" placeholder="Estatus" value={filters.estatus} onChange={handleFilterChange} />
                    <input type="text" className="filter-input" name="codigoArticulo" placeholder="Codigo Articulo" value={filters.codigoArticulo} onChange={handleFilterChange} />
                    <input type="text" className="filter-input" name="codigoSN" placeholder="Codigo SN" value={filters.codigoSN} onChange={handleFilterChange} />
                    <Button variant="secondary" className="mt-3 clear-filters-btn" onClick={() => setFilters({
                        nombreSolicitante: '',
                        fechaCreacion: '',
                        fechaNecesaria: '',
                        estatus: '',
                        codigoArticulo: '',
                        codigoSN: ''
                    })}>
                        Limpiar filtros
                    </Button>
                </div>
            </div>

            {/* Tabla */}
            <div className="table-wrapper">
                <table className="autorizaciones-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('Code')}>
                                N° Autorizacion
                                {sortConfig.key === 'Code' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('Name')}>
                                Nombre Solicitante
                                {sortConfig.key === 'Name' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('CreateDate')}>
                                Fecha De Creacion
                                {sortConfig.key === 'CreateDate' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('ReqDate')}>
                                Fecha Necesaria
                                {sortConfig.key === 'ReqDate' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('Status')}>
                                Estatus
                                {sortConfig.key === 'Status' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('ItemCode')}>
                                Codigo Articulo
                                {sortConfig.key === 'ItemCode' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('ItemName')}>
                                Nombre Articulo
                                {sortConfig.key === 'ItemName' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('CardCode')}>
                                Codigo SN
                                {sortConfig.key === 'CardCode' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('CardName')}>
                                Nombre SN
                                {sortConfig.key === 'CardName' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('Quantity')}>
                                Cantidad
                                {sortConfig.key === 'Quantity' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('DocOP')}>
                                DocOP
                                {sortConfig.key === 'DocOP' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('ObjType')}>
                                ObjType
                                {sortConfig.key === 'ObjType' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('NameObjType')}>
                                Documento
                                {sortConfig.key === 'NameObjType' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('U_LineNumOP')}>
                                U_LineNumOP
                                {sortConfig.key === 'U_LineNumOP' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th onClick={() => handleSort('U_Pathfile')}>
                                U_Pathfile
                                {sortConfig.key === 'U_Pathfile' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                            </th>
                            <th>
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayAutorizaciones.map((doc) => (
                            <tr key={doc.Code}>
                                <td>{doc.Code}</td>
                                <td>{doc.Name}</td>
                                <td>{new Date(doc.CreateDate).toLocaleDateString()}</td>
                                <td>{new Date(doc.ReqDate).toLocaleDateString()}</td>
                                <td>{doc.Status}</td>
                                <td>{doc.ItemCode}</td>
                                <td>{doc.ItemName}</td>
                                <td>{doc.CardCode}</td>
                                <td>{doc.CardName}</td>
                                <td>{doc.Quantity}</td>
                                <td>{doc.DocOP}</td>
                                <td>{doc.ObjType}</td>
                                <td>{doc.NameObjType}</td>
                                <td>{doc.U_LineNumOP}</td>
                                <td>{doc.U_PathFile}</td>
                                <td>
                                    <Button
                                        variant="primary"
                                        onClick={() => handleOpenModal(doc, 1, 'Aprobar', '¿Esta seguro de aprobar la solicitud?')}
                                    >
                                        Aprobar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleOpenModal(doc, 2, 'Rechazar', '¿Esta seguro de rechazar la solicitud?')}
                                    >
                                        Rechazar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Paginación */}
            <ReactPaginate
                previousLabel={'Anterior'}
                nextLabel={'Siguiente'}
                breakLabel={'...'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageChange}
                containerClassName={'pagination'}
                activeClassName={'active'}
            />

            <ConfirmModal
                show={showModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirm}
                documento={documento}
                permiso={permiso}
                title={tituloConfirm}
                message={mensajeConfirm}
            />
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

export default Autorizaciones;

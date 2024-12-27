import React, { useEffect, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlaneacionContext } from '../../context/PlaneacionContext';
import { Collapse, Button, Modal, Form, OverlayTrigger, Tooltip, Alert, Table } from 'react-bootstrap';
import './DetalleOrdenDeProduccion.css';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import Dropdown from 'react-dropdown-select';
import ToastMessage from '../../components/ToastMessage';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/ConfirmModal'

const DetalleOrdenDeProduccion = () => {
    const { docEntry } = useParams();
    const { fetchProdOrderDetails, prodOrderDetails, loading, fetchProviders, providers, addPurchaseOrder, toast, setToast, handleChangeStatus, fetchGetMachines,
        machines, addMachine, actualizarCampos, cargarListadoTarimasLinners, tarimasLinners, showModalConfirm, setShowModalConfirm, tituloConfirm, setTituloConfirm, mensajeConfirm, setMensajeConfirm, updateMachine, addTarimaLinner, updateTarimaLinner } = useContext(PlaneacionContext);
    const [openLines, setOpenLines] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showModalMachines, setShowModalMachines] = useState(false);
    const [showModalTarimaLinner, setShowModalTarimaLinner] = useState(false);
    const [cantidadRequerida, setCantidadRequerida] = useState(0);
    const [selectedProvider, setSelectedProvider] = useState([]);
    const [fechaNecesaria, setFechaNecesaria] = useState('');
    const [cantidadSolicitar, setCantidadSolicitar] = useState(cantidadRequerida);
    const [documentoAdjunto, setDocumentoAdjunto] = useState(null);
    const [lineNum, setLineNum] = useState(null)
    const [showAlert, setShowAlert] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState([]);
    const [tarimas, setTarimas] = useState(0)
    const [rollos, setRollos] = useState(0)
    const [metodoImpresion, setMetodoImpresion] = useState('')
    const [selectedTarimaLinner, setSelectedTarimaLinner] = useState([])
    const [groupCode, setGroupCode] = useState(0)
    const [elementoActualizar, setElementoActualizar] = useState([])
    const [actualizar, setActualizar] = useState(false)

    useEffect(() => {
        setTarimas(prodOrderDetails?.QtyPallet)
        setRollos(prodOrderDetails?.RolxPallet)
        setMetodoImpresion(prodOrderDetails?.MethodPrint)
    }, [prodOrderDetails]);

    useEffect(() => {
        fetchProdOrderDetails(docEntry);
        fetchProviders();
    }, []);

    const toggleLine = (lineNum) => {
        setOpenLines((prev) => ({
            ...prev,
            [lineNum]: !prev[lineNum],
        }));
    };

    const handleModalOpen = (e, PlannedQty, LineNum) => {
        e.stopPropagation();
        e.preventDefault();
        setShowModal(true);

        setLineNum(LineNum)
        setCantidadRequerida(PlannedQty);
        setCantidadSolicitar(PlannedQty);
        setSelectedProvider([])
        setFechaNecesaria('')
        setDocumentoAdjunto(null)
    };

    const handleModalOpenMachines = (e, machine) => {
        e.stopPropagation();
        e.preventDefault();
        setShowModalMachines(true);
        setElementoActualizar(machine)
        fetchGetMachines(prodOrderDetails?.ItemCode)
    };

    const handleModalOpenTarimaLinner = (e, ItmsGrpCod) => {
        e.stopPropagation();
        e.preventDefault();
        cargarListadoTarimasLinners(ItmsGrpCod)
        setShowModalTarimaLinner(true);
        setGroupCode(ItmsGrpCod)
    };

    const handleModalOpenActualizarTarimaLinner = (e, tarimaLinner) => {
        e.stopPropagation();
        e.preventDefault();
        cargarListadoTarimasLinners(tarimaLinner.ItmsGrpCod)
        setElementoActualizar(tarimaLinner)
        setActualizar(!actualizar)
        setShowModalTarimaLinner(true);
        setGroupCode(tarimaLinner.ItmsGrpCod)
    };

    const handleModalClose = () => setShowModal(false);

    const handleModalCloseMachines = () => {
        setShowModalMachines(false);
        setShowAlert(false);
        setSelectedMachine([])
    };

    const handleModalCloseTarimaLinner = () => {
        setShowModalTarimaLinner(false);
        setShowAlert(false);
        setSelectedTarimaLinner(null)
    };

    const handleConfirm = async () => {
        console.log('datos a enviar...', selectedProvider[0]?.value, fechaNecesaria, cantidadSolicitar, docEntry, lineNum)

        // Estructura los datos para enviar a la API usando FormData
        const formData = new FormData();
        formData.append('cardCode', selectedProvider[0]?.value || "");
        formData.append('docDate', fechaNecesaria);
        formData.append('quantity', cantidadSolicitar);
        formData.append('fileAttch', documentoAdjunto);
        formData.append('DocEntry', docEntry);
        formData.append('LineNum', lineNum);
        await addPurchaseOrder(formData);
        handleModalClose();
    };

    const handleMachineSelection = (machine) => {
        setSelectedMachine(machine);
        setShowAlert(true);
    };

    const handleTarimaLinnerSelection = (tarimaLinner) => {
        setSelectedTarimaLinner(tarimaLinner)
        setShowAlert(true)
    }

    const confirmSelectionMachine = () => {
        setShowAlert(false);
        if (prodOrderDetails?.ActionMachine === 0) {
            addMachine(selectedMachine, docEntry)
        } else {
            updateMachine(selectedMachine, docEntry, elementoActualizar)
        }
        handleModalCloseMachines()
    };

    const confirmSelectionTarimaLinner = () => {
        setShowAlert(false);
        if (actualizar === false) {
            addTarimaLinner(selectedTarimaLinner, docEntry)
        } else {
            updateTarimaLinner(selectedTarimaLinner, docEntry, elementoActualizar)
        }

        handleModalCloseTarimaLinner()
        setActualizar(false)
    }

    const handleChangedTarimas = (e) => {
        setTarimas(e.target.value)
        actualizarCampos(e.target.value, rollos, metodoImpresion, docEntry)
    }

    const handleChangedRollos = (e) => {
        setRollos(e.target.value)
        actualizarCampos(tarimas, e.target.value, metodoImpresion, docEntry)
    }

    const handleChangedMetodoImpresion = (e) => {
        setMetodoImpresion(e.target.value)
        actualizarCampos(tarimas, rollos, e.target.value, docEntry)
    }

    const handleConfirmAction = (e) => {
        handleChangeStatus(e, prodOrderDetails?.DocEntry, prodOrderDetails?.ItemCode, prodOrderDetails?.Status)
        setShowModalConfirm(false);
    };

    const handleOpenModalConfirm = () => {
        setShowModalConfirm(true)
        setTituloConfirm('Advertencia')
        setMensajeConfirm('¿Esta seguro de cambiar el estado?')
    }

    const handleCloseModalConfirm = () => {
        setShowModalConfirm(false)
    }


    return (
        <div className="detalle-orden-container">
            <div className="detalle-cabecera">
                <div className="col mb-3 d-flex gap-3" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className='row'>
                        <strong>Numero De Orden</strong>
                        <p>{prodOrderDetails?.DocNum}</p>
                    </div>
                    <div className='row'>
                        <strong>Fecha De Orden</strong>
                        <p>{new Date(prodOrderDetails?.Fecha_Fabricacion).toLocaleDateString()}</p>
                    </div>
                    <div className='row'>
                        <strong>Numero De Cliente</strong>
                        <p>{prodOrderDetails?.CardCode}</p>
                    </div>
                    <div className='row'>
                        <strong>Cliente</strong>
                        <p>{prodOrderDetails?.CardName}</p>
                    </div>
                    <div className='row'>
                        <strong>Pedido Del Cliente</strong>
                        <p>{prodOrderDetails?.OV}</p>
                    </div>
                </div>
                <div className="col mb-3 d-flex gap-3" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className='row'>
                        <strong>N° De Producto</strong>
                        <p>{prodOrderDetails?.ItemCode}</p>
                    </div>
                    <div className='row'>
                        <strong>Producto</strong>
                        <p>{prodOrderDetails?.ProdName}</p>
                    </div>
                    <div className='row'>
                        <strong>Presentacion</strong>
                        <p>{prodOrderDetails?.Uom}</p>
                    </div>
                    <div className='row'>
                        <strong>Cantidad Planificada</strong>
                        <p>{prodOrderDetails?.PlannedQty}</p>
                    </div>
                    <div className='row'>
                        <strong>Peso Bruto</strong>
                        <p>{prodOrderDetails?.WeightB}</p>
                    </div>
                    <div className='row'>
                        <strong>Peso Neto</strong>
                        <p>{prodOrderDetails?.WeightN}</p>
                    </div>
                </div>
                <div className="col d-flex gap-3" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div class="form-floating row mx-3">
                        <input type="text" className="form-control" id="floatingInput" placeholder="Tarimas a producir" style={{ color: '#000' }} value={tarimas} onChange={(e) => handleChangedTarimas(e)} />
                        <label style={{ color: '#000' }} for="floatingInput">Tarimas a producir</label>
                    </div>
                    <div class="form-floating row mx-3">
                        <input type="text" className="form-control" id="floatingInput" placeholder="Rollos por tarima" style={{ color: '#000' }} value={rollos} onChange={(e) => handleChangedRollos(e)} />
                        <label style={{ color: '#000' }} for="floatingInput">Rollos por tarima</label>
                    </div>
                    <div class="form-floating row mx-3">
                        <input type="text" className="form-control" id="floatingInput" placeholder="Metodo de impresion de etiqueta" value={metodoImpresion} onChange={(e) => handleChangedMetodoImpresion(e)} />
                        <label style={{ color: '#000' }} for="floatingInput">Metodo de impresion de etiqueta</label>
                    </div>
                    <div className='row'>
                        <strong>Estatus</strong>
                        <OverlayTrigger
                            placement="right"
                            overlay={<Tooltip id="tooltip-top">De clic para cambiar el estado</Tooltip>}
                        >
                            <Button
                                className=""
                                style={{ cursor: 'pointer', width: 'auto', backgroundColor: prodOrderDetails?.Colorbutton, color: prodOrderDetails?.ColorTextbtn }}
                                onClick={(e) => handleOpenModalConfirm(e)}
                            >
                                {prodOrderDetails?.StatusTexto}
                            </Button>
                        </OverlayTrigger>
                    </div>

                </div>
            </div>

            <div style={{}} className='d-flex mb-4'>
                <Button
                    size="sm"
                    onClick={(e) => handleModalOpenMachines(e)}
                    disabled={prodOrderDetails?.ActionMachine === 1 ? true : false}
                    style={{ backgroundColor: '#ffbf01', border: 'none', marginRight: '10px' }}
                >
                    Agregar Maquina
                </Button>
                <Button
                    size="sm"
                    disabled={prodOrderDetails?.ActionMachine > 0 ? false : true}
                    onClick={(e) => handleModalOpenTarimaLinner(e, 109)}
                    style={{ backgroundColor: '#747571', border: 'none', marginRight: '10px' }}
                >
                    Agregar Linner
                </Button>
                <Button
                    size="sm"
                    disabled={prodOrderDetails?.ActionMachine > 0 ? false : true}
                    onClick={(e) => handleModalOpenTarimaLinner(e, 108)}
                    style={{ backgroundColor: '#4ca930', border: 'none', marginRight: '10px' }}
                >
                    Agregar Tarima
                </Button>
            </div>
            {prodOrderDetails?.MachineLines?.length > 0 ? (
                <table className="mb-5">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>N°</th>
                            <th>Descripcion</th>
                            <th>Cantidad Base</th>
                            <th>Cantidad Adicional</th>
                            <th>Cantidad Requerida</th>
                            <th>Consumido</th>
                            <th>Disponible</th>
                            <th>Codigo de unidad de medida</th>
                            <th>Nombre de unidad de medida</th>
                            <th>Almacen</th>
                            <th>Metodo emision</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prodOrderDetails.MachineLines.map((machine) => (
                            <React.Fragment key={machine.LineNum}>
                                <tr style={{ opacity: machine.Status === 'P' ? 1 : .3, backgroundColor: machine.Status === 'P' ? '' : '#CDCDCD' }}>
                                    <td>{machine.ItemType}</td>
                                    <td>{machine.ItemCode}</td>
                                    <td>{machine.ItemName}</td>
                                    <td>{machine.BaseQty}</td>
                                    <td>{machine.QtyAd}</td>
                                    <td>{machine.PlannedQty}</td>
                                    <td>{machine.IssuedQty}</td>
                                    <td style={{ whiteSpace: "nowrap" }}>
                                        <span
                                            style={{
                                                backgroundColor: machine.StockDisp > 0 ? '#008080' : '#FF0000',
                                                padding: 3,
                                                borderRadius: 5,
                                                color: '#fff'
                                            }}
                                        >
                                            {machine.StockDisp > 0 ? 'Disponible' : 'No Disponible'}
                                        </span>
                                    </td>
                                    <td>{machine.UgpName}</td>
                                    <td>{machine.NameUom}</td>
                                    <td>{machine.WhsCode}</td>
                                    <td>
                                        <Button
                                            size="sm"
                                            className='mb-2'
                                            onClick={(e) => handleModalOpenMachines(e, machine)}
                                            style={{ backgroundColor: '#ffbf00', border: 'none', width: '100%' }}
                                            disabled={machine.Status === 'P' ? false : true}
                                        >
                                            Cambiar Maquina
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={(e) => handleModalOpen(e, machine.PlannedQty, machine.LineNum)}
                                            style={{ backgroundColor: '#e97132', border: 'none', width: '100%' }}
                                            disabled={machine.Status === 'P' ? false : true}
                                        >
                                            Solicitar (SC)
                                        </Button>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay maquinas existentes.</p>
            )}

            {prodOrderDetails?.OrderLines?.length > 0 ? (
                <table className="">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>N°</th>
                            <th>Descripcion</th>
                            <th>Cantidad Base</th>
                            <th>Cantidad Adicional</th>
                            <th>Cantidad Requerida</th>
                            <th>Consumido</th>
                            <th>Disponible</th>
                            <th>Codigo de unidad de medida</th>
                            <th>Nombre de unidad de medida</th>
                            <th>Almacen</th>
                            <th>Metodo emision</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prodOrderDetails.OrderLines.map((line) => (
                            <React.Fragment key={line.LineNum}>
                                <tr style={{ opacity: line.Status === 'P' ? 1 : .3, backgroundColor: line.Status === 'P' ? '' : '#CDCDCD' }}>
                                    <td>{line.ItemType}</td>
                                    <td>{line.ItemCode}</td>
                                    <td>{line.ItemName}</td>
                                    <td>{line.BaseQty}</td>
                                    <td>{line.QtyAd}</td>
                                    <td>{line.PlannedQty}</td>
                                    <td>{line.IssuedQty}</td>
                                    <td style={{ whiteSpace: "nowrap" }}>
                                        <span
                                            style={{
                                                backgroundColor: line.StockDisp > 0 ? '#008080' : '#FF0000',
                                                padding: 3,
                                                borderRadius: 5,
                                                color: '#fff'
                                            }}
                                        >
                                            {line.StockDisp > 0 ? 'Disponible' : 'No Disponible'}
                                        </span>
                                    </td>
                                    <td>{line.UgpName}</td>
                                    <td>{line.NameUom}</td>
                                    <td>{line.WhsCode}</td>
                                    <td>
                                        <Button
                                            size="sm"
                                            className='mb-2'
                                            onClick={(e) => handleModalOpenActualizarTarimaLinner(e, line)}
                                            style={{ backgroundColor: '#ffbf00', border: 'none', width: '100%' }}
                                            disabled={line.Status === 'P' ? false : true}
                                        >
                                            Cambio de componentes
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={(e) => handleModalOpen(e, line.PlannedQty, line.LineNum)}
                                            style={{ backgroundColor: '#e97132', border: 'none', width: '100%' }}
                                            disabled={line.Status === 'P' ? false : true}
                                        >
                                            Solicitar (SC)
                                        </Button>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay ítems en esta orden de producción.</p>
            )}

            {/* //MODAL PARA SOLICITUD DE COMPRA */}
            <Modal show={showModal} onHide={handleModalClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Solicitud De Compra</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="proveedor">
                            <Form.Label>Proveedor</Form.Label>
                            <Dropdown
                                options={providers.map(provider => ({
                                    value: provider.CardCode,
                                    label: `${provider.CardCode} - ${provider.CardName}`
                                }))}
                                values={selectedProvider}
                                onChange={(values) => setSelectedProvider(values)}
                                searchable
                                placeholder="Selecciona un proveedor"
                                noDataLabel='"No se encontró el proveedor"'
                            />
                        </Form.Group>
                        <Form.Group controlId="fechaNecesaria" className="mt-3">
                            <Form.Label>Fecha Necesaria</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaNecesaria}
                                onChange={(e) => setFechaNecesaria(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="cantidadSolicitar" className="mt-3">
                            <Form.Label>Cantidad a Solicitar</Form.Label>
                            <Form.Control
                                type="number"
                                value={cantidadSolicitar}
                                onChange={(e) => setCantidadSolicitar(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="documentoAdjunto" className="mt-3">
                            <Form.Label>Documento Adjunto</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={(e) => setDocumentoAdjunto(e.target.files[0])}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* //MODAL PARA AGREGAR MAQUINA */}
            <Modal show={showModalMachines} onHide={handleModalCloseMachines} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Máquinas</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showAlert && (
                        <Alert variant="warning" className="d-flex flex-column align-items-start">
                            <span>
                                ¿Está seguro de seleccionar la máquina{" "}
                                <strong>{selectedMachine?.ResName}</strong> con código{" "}
                                <strong>{selectedMachine?.VisResCode}</strong>?
                            </span>
                            <div className="mt-3 d-flex gap-2">
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => setShowAlert(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={confirmSelectionMachine}
                                >
                                    Confirmar
                                </Button>
                            </div>
                        </Alert>
                    )}
                    <Table hover responsive>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Cantidad</th>
                                <th>Almacén</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machines.map((machine, index) => (
                                <tr key={index} onClick={() => handleMachineSelection(machine)} style={{ cursor: "pointer" }}>
                                    <td>{machine.VisResCode}</td>
                                    <td>{machine.ResName}</td>
                                    <td>{machine.Quantity}</td>
                                    <td>{machine.WhareHose}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalCloseMachines}>
                        Salir
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* //MODAL PARA AGREGAR TARIMA O LINNER */}
            <Modal show={showModalTarimaLinner} onHide={handleModalCloseTarimaLinner} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{groupCode === 109 ? 'Linners' : 'Tarimas'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showAlert && (
                        <Alert variant="warning" className="d-flex flex-column align-items-start">
                            <span>
                                ¿Está seguro de seleccionar {groupCode === 109 ? 'el linner' : 'la tarima'} {" "}
                                <strong>{selectedTarimaLinner?.ItemName}</strong> con código{" "}
                                <strong>{selectedTarimaLinner?.ItemCode}</strong>?
                            </span>
                            <div className="mt-3 d-flex gap-2">
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => setShowAlert(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={confirmSelectionTarimaLinner}
                                >
                                    Confirmar
                                </Button>
                            </div>
                        </Alert>
                    )}
                    <Table hover responsive>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Cantidad</th>
                                <th>Almacén</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tarimasLinners.map((tarimaLinner, index) => (
                                <tr key={index} onClick={() => handleTarimaLinnerSelection(tarimaLinner)} style={{ cursor: "pointer" }}>
                                    <td>{tarimaLinner.ItemCode}</td>
                                    <td>{tarimaLinner.ItemName}</td>
                                    <td>{tarimaLinner.Quantity}</td>
                                    <td>{tarimaLinner.WhareHose}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalCloseTarimaLinner}>
                        Salir
                    </Button>
                </Modal.Footer>
            </Modal>

            <ConfirmModal
                show={showModalConfirm}
                handleClose={handleCloseModalConfirm}
                handleConfirm={handleConfirmAction}
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

export default DetalleOrdenDeProduccion;

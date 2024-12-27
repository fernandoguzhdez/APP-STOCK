import React, { useContext, useEffect, useState } from 'react'
import { ProduccionContext } from '../../context/ProduccionContext';
import { useParams } from 'react-router-dom';
import './OrdenProduccionWps.css';
import Loading from '../../components/Loading';
import ToastMessage from '../../components/ToastMessage';
import { Collapse, Button, Table, Modal, Spinner } from 'react-bootstrap';
import { FaPrint, FaRegCheckCircle, FaStopwatch, FaHandPaper, FaTrashRestore, FaPowerOff, FaPlus, FaEdit, FaEye, FaTimes, FaTrash } from 'react-icons/fa';
import api from '../../axiosConfig';
import Select from 'react-select';
import ModalMerma from '../../components/Produccion/Orden_De_Fabricacion/WPS/ModalMerma'
import ParoDeMaquinaNuevo from '../../components/Produccion/Orden_De_Fabricacion/WPS/ParoDeMaquinaNuevo';
import ConfirmModal from '../../components/ConfirmModal';

const OrdenProduccionWps = ({ isActive }) => {

    const { docEntry } = useParams();
    const { loading, prodOrdersComponents, prodOrdersWps, fetchPesoBascula, fetchBasculas, opcionesBasculas, fetchImpresoras, impresoras, opcionesImpresoras, fetchIdPallet,
        orderProdPallet, guardarRegistroLectura, cerrarPallet, fetchListadoMerma, fetchProdOrderWps, fetchTimeStop, incidenciasTimeStop, fetchIncidenciasTimeStop, eliminarIncidencia,
        toast, setToast, setIncidencia, incidencia, eliminarPallet, setFechaFin, setHoraFin, setComentariosFin, setKilosParo, setTiempo } = useContext(ProduccionContext);

    const [show, setShow] = useState(false);
    const [supervisores, setSupervisores] = useState([]);
    const [opcionesSupervisores, setOpcionesSupervisores] = useState([]);
    const [supervisorSeleccionado, setSupervisorSeleccionado] = useState(null);
    const [basculaSeleccionado, setBasculaSeleccionado] = useState(null);
    const [impresoraSeleccionado, setImpresoraSeleccionado] = useState(null);
    const [showModalConfirm, setShowModalConfirm] = useState(false)
    const [showModalMerma, setShowModalMerma] = useState(false)
    const [tituloConfirm, setTituloConfirm] = useState(null)
    const [mensajeConfirm, setMensajeConfirm] = useState(null)
    const [tituloBtnConfirm, setTituloBtnConfirm] = useState(null)
    const [tituloBtnCancel, setTituloBtnCancel] = useState(null)
    const [piezas, setPiezas] = useState(0)
    const [lecturaBascula, setLecturaBascula] = useState(0)
    const [iniciar, setIniciar] = useState(false)
    const [funcion, setFuncion] = useState(null)
    const [paroDeMaquina, setParoDeMaquina] = useState(false)
    const [showModalNuevo, setShowModalNuevo] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleOpenModalNuevo = (e) => {
        setFechaFin(null)
        setHoraFin("00:00")
        setComentariosFin(null)
        setKilosParo(0)
        setTiempo("0.0")
        setShowModalNuevo(true)
    }

    const handleCloseModalNuevo = (e) => {
        setShowModalNuevo(false)
        setIncidencia(null)
    }

    const handleChangeSupervisor = (selectedOption) => {
        setSupervisorSeleccionado(selectedOption);
        console.log('Supervisor seleccionado:', selectedOption);
    };

    const handleChangeBascula = (selectedOption) => {
        setBasculaSeleccionado(selectedOption);
        console.log('Bascula seleccionada:', selectedOption);
    };

    const handleChangeImpresora = (selectedOption) => {
        setImpresoraSeleccionado(selectedOption);
        console.log('Impresora seleccionada:', selectedOption);
    };

    // ORDENES DE PRODUCCION - WPS - CARGA SUPERVISORES
    const fetchSupervisores = async () => {
        try {
            const response = await api.get('/api/MasterData/Get_Employes_Supervisor?Type=S'
            );

            // Convertir datos a formato compatible con react-select
            const opcionesFormateadas = response.data.map((supervisor) => ({
                value: supervisor.Code,
                label: `${supervisor.Code} - ${supervisor.Name}`,
            }));

            setSupervisores(response.data);
            setOpcionesSupervisores(opcionesFormateadas);
        } catch (error) {
            console.error('Error al cargar los supervisores:', error);
        }
    };

    const handleOpenModalConfirm = (e, funcion) => {
        e.preventDefault();
        setShowModalConfirm(true)
        switch (funcion) {
            case 'iniciar':
                setFuncion('iniciar')
                setTituloConfirm('Advertencia')
                setMensajeConfirm('¿Desea iniciar un nuevo pallet?')
                setTituloBtnConfirm('Si')
                setTituloBtnCancel('Conservar Actual')
                break;

            case 'cerrarPallet':
                setFuncion('cerrarPallet')
                setTituloConfirm('Advertencia')
                setMensajeConfirm('¿Esta seguro de cerrar el pallet?')
                setTituloBtnConfirm('Si')
                setTituloBtnCancel('Cancelar')
                break;

            default:
                break;
        }
    }

    const handleOpenModalMerma = () => {
        setShowModalMerma(true)
        fetchListadoMerma(prodOrdersComponents.DocEntry)
    }

    const handleCloseModalMerma = () => {
        setShowModalMerma(false)
    }

    const handleCloseModal = () => {
        setShowModalConfirm(false)
    }

    const handleCancelModal = () => {
        setShowModalConfirm(false)
        setIniciar(true)
        setParoDeMaquina(false)
    }

    const handleConfirmActionWPS = () => {
        setIniciar(true)
        fetchIdPallet()
        setShowModalConfirm(false);

        //OCULTAR LAS DEMAS VENTANAS
        setParoDeMaquina(false)
    };

    const handleGuardarRegistroLectura = () => {
        setIniciar(true)
        guardarRegistroLectura(prodOrdersComponents, lecturaBascula, piezas, supervisorSeleccionado, basculaSeleccionado, impresoraSeleccionado)
        setShowModalConfirm(false);
    }

    const handleCerrarPallet = () => {
        cerrarPallet(docEntry)
        setShowModalConfirm(false);
    }

    //VENTANA PARO DE MAQUINA
    const handleOpenParoDeMaquina = () => {
        fetchTimeStop(docEntry)
        setParoDeMaquina(true)
        setIniciar(false)
    }

    useEffect(() => {
        if (isActive) {
            fetchSupervisores()
            fetchBasculas()
            fetchPesoBascula()
            fetchImpresoras()
            fetchIncidenciasTimeStop(docEntry)
        }
    }, [isActive]); // Ejecutar el efecto cuando cambia isActive

    useEffect(() => {
        setSupervisorSeleccionado(opcionesSupervisores[0])
        setImpresoraSeleccionado(opcionesImpresoras[0])
        setBasculaSeleccionado(opcionesBasculas[0])
    }, [opcionesSupervisores, opcionesImpresoras, opcionesBasculas]);

    const handleOpenConfirm = (incidencia) => {
        setShowConfirm(true)
        setIncidencia(incidencia)
        setMensajeConfirm('¿Esta seguro de eliminar el elemento seleccionado?')
        setTituloConfirm('Incidencia')
    }

    const handleCloseconfirm = () => {
        setShowConfirm(false)
    }

    const handleConfirm = () => {
        setShowConfirm(false)
        eliminarIncidencia(incidencia, docEntry)
    }

    const handleOpenModalEditar = (incidencia) => {
        console.log('incidencia seleccionada...', incidencia)
        setIncidencia(incidencia)
        setShowModalNuevo(true)
    }

    const handleCloseModalEditar = () => {
        setShowModalNuevo(false)
        setIncidencia(null)
    }


    const ConfirmModalIniciar = ({ show, message, title, itemSelected }) => {
        return (
            <Modal show={show} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {message}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancelModal}>
                        {tituloBtnCancel}
                    </Button>
                    <Button variant="primary" onClick={funcion === 'iniciar' ? handleConfirmActionWPS : handleCerrarPallet}>
                        {tituloBtnConfirm}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };

    return (
        <div className='wps-orden-container'>
            <div className="wps-cabecera row mb-2">
                <div className='col-12'>
                    <div className="col mb-3 d-flex gap-3" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className='row'>
                            <strong>Formula</strong>
                            <p>{prodOrdersComponents.Campo_1}</p>
                        </div>
                        <div className='row'>
                            <strong>Core</strong>
                            <p>{prodOrdersComponents.Campo_2}</p>
                        </div>
                        <div className='row'>
                            <strong>Longitud</strong>
                            <p>{prodOrdersComponents.Campo_3}</p>
                        </div>
                        <div className='row'>
                            <strong>Calibre</strong>
                            <p>{prodOrdersComponents.Campo_4}</p>
                        </div>
                        <div className='row'>
                            <strong>Ancho</strong>
                            <p>{prodOrdersComponents.Campo_5}</p>
                        </div>
                        <div className='row'>
                            <strong>Color</strong>
                            <p>{prodOrdersComponents.Campo_6}</p>
                        </div>
                        <div className='row'>
                            <strong>Peso Bruto</strong>
                            <p>{prodOrdersComponents.Campo_7}</p>
                        </div>
                        <div className='row'>
                            <strong>Peso Neto</strong>
                            <p>{prodOrdersComponents.Campo_8}</p>
                        </div>
                        <div className='row'>
                            <strong>Etiqueta por paquete</strong>
                            <p>{prodOrdersComponents.Campo_9}</p>
                        </div>
                        <div className='row'>
                            <strong>Impresora</strong>
                            <p>Icono Impresora</p>
                        </div>
                    </div>
                    <div className="col mb-3 d-flex gap-3" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className='row'>
                            <strong>Maquina</strong>
                            <p>{prodOrdersComponents.Campo_10}</p>
                        </div>
                        <div className='row'>
                            <strong>Tarimas a producir</strong>
                            <p>{prodOrdersComponents.Campo_11}</p>
                        </div>
                        <div className='row'>
                            <strong>Rollos por tarima</strong>
                            <p>{prodOrdersComponents.Campo_12}</p>
                        </div>
                        <div className='row'>
                            <strong>Supervisor</strong>
                            <p>{prodOrdersComponents.Campo_14}</p>
                        </div>
                        <div className='row'>
                            <strong>Etiqueta por pallet</strong>
                            <p>{prodOrdersComponents.Campo_15}</p>
                        </div>
                        <div className='row'>
                            <strong>Impresora</strong>
                            <p>Icono impresora</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="totals-wps m-5" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <span style={{ width: '25px', backgroundColor: '#000' }}></span><span>(KG.) Producidos: 54,788</span>
                <span style={{ width: '25px', backgroundColor: '#FFA500' }}></span><span>(PZ.) Producidas: 6,497</span>
                <span style={{ width: '25px', backgroundColor: '#87CEEB' }}></span><span>Desperdicio: 45,646</span>
                <span style={{ width: '25px', backgroundColor: '#A18262' }}></span><span>Consumido: 58,784</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', gap: 15, marginBottom: 30 }}>
                <Button onClick={(e) => {handleOpenModalConfirm(e, 'iniciar')}} variant='success' className='align-items-center' style={{ width: 'auto', display: 'flex', flexDirection: 'column', border: '1px solid' }}>
                    <FaRegCheckCircle className="icon" size={30} />
                    Iniciar
                </Button>
                <Button onClick={(e) => {}} variant='success' className='align-items-center' style={{ width: 'auto', display: 'flex', flexDirection: 'column', border: '1px solid' }}>
                    <FaStopwatch className="icon" size={30} />
                    Cambio De Turno
                </Button>
                <Button onClick={(e) => handleOpenParoDeMaquina(e)} variant='success' className='align-items-center' style={{ width: 'auto', display: 'flex', flexDirection: 'column', border: '1px solid' }}>
                    <FaHandPaper className="icon" size={30} />
                    Paro De Maquina
                </Button>
                <Button onClick={(e) => handleOpenModalMerma(e)} variant='success' className='align-items-center' style={{ width: 'auto', display: 'flex', flexDirection: 'column', border: '1px solid' }}>
                    <FaTrashRestore className="icon" size={30} />
                    Merma
                </Button>
                <Button onClick={(e) => {}} variant='success' className='align-items-center' style={{ width: 'auto', display: 'flex', flexDirection: 'column', border: '1px solid' }}>
                    <FaPowerOff className="icon" size={30} />
                    Finalizar
                </Button>
            </div>

            {/* VENTANA DE PARO DE MAQUINA */}
            <div className='row' style={{ display: paroDeMaquina ? 'flex' : 'none' }}>
                <div>
                    <div className='mt-4' style={{ height: '450px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: 15, marginBottom: 5 }}>
                            <Button onClick={(e) => handleOpenModalNuevo(e)} variant='primary' className='align-items-center' style={{ width: 'auto', display: 'flex' }}>
                                <FaPlus className="icon mx-2" size={30} />
                                Nuevo
                            </Button>{/* 
                            <Button onClick={(e) => { }} variant='success' className='align-items-center' style={{ width: 'auto', display: 'flex' }}>
                                <FaEdit className="icon mx-2" size={30} />
                                Editar
                            </Button>
                            <Button onClick={(e) => { }} variant='dark' className='align-items-center' style={{ width: 'auto', display: 'flex' }}>
                                <FaEye className="icon mx-2" size={30} />
                                Ver
                            </Button>
                            <Button onClick={(e) => { }} variant='warning' className='align-items-center' style={{ width: 'auto', display: 'flex' }}>
                                <FaTimes className="icon mx-2" size={30} />
                                Cancelar
                            </Button> */}
                        </div>
                        <div style={{ height: '350px', overflowY: 'auto' }}>
                            <table className="ordenes-wps-table mt-2" onScroll={false}>
                                <thead>
                                    <tr>
                                        <th>FOLIO</th>
                                        <th>ELABORADA</th>
                                        {/* <th>ORDEN</th>
                                    <th>O.P SAP.</th> */}
                                        <th>PROCESO</th>
                                        <th>MAQUINA</th>
                                        <th>INICIO</th>
                                        <th>FINAL</th>
                                        <th>MOTIVO</th>
                                        <th>ESTATUS</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidenciasTimeStop.length > 0 ? (
                                        incidenciasTimeStop.map((incidencia, index) => (
                                            <tr key={index} style={{ cursor: "pointer" }} onClick={(e) => { }}>
                                                <td>{incidencia.Folio}</td>
                                                <td>{incidencia.createDate}</td>
                                                <td>{incidencia.IdProcess}</td>
                                                <td>{incidencia.IdMachine}</td>
                                                <td>{incidencia.DateStart}</td>
                                                <td>{incidencia.DateEnd}</td>
                                                <td>{incidencia.NameTime}</td>
                                                <td>{incidencia.Status}</td>
                                                <td style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                                                    <Button onClick={(e) => handleOpenConfirm(incidencia)} variant='danger' className='align-items-center' style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
                                                        <FaTrash className="icon mx-2" size={14} />
                                                        Eliminar
                                                    </Button>
                                                    <Button onClick={(e) => handleOpenModalEditar(incidencia)} variant='primary' className='align-items-center' style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
                                                        <FaEdit className="icon mx-2" size={14} />
                                                        Editar
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                                                No hay datos disponibles
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>

                    {loading && <Loading />}
                </div>
            </div>

            {/* VENTANA DE INICIAR */}
            <div className='row' style={{ display: iniciar === true ? 'flex' : 'none' }}>
                <div className='col-md-6' style={{ height: '450px', overflowY: 'auto' }}>
                    <table className="ordenes-wps-table mt-3" onScroll={false}>
                        <thead>
                            <tr>
                                <th># De Pallet</th>
                                <th># De Paquete</th>
                                <th>Fecha De Ingreso</th>
                                <th>Hora De Ingreso</th>
                                <th>Lote</th>
                                <th>Peso Neto</th>
                                <th>Peso Bruto</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center" }}>Cargando...</td>
                                </tr>
                            ) : prodOrdersWps.length > 0 ? (
                                prodOrdersWps.map((order, index) => (
                                    <tr key={index} style={{ cursor: "pointer" }} onClick={() => console.log(order)}>
                                        <td>{order.Code}</td>
                                        <td>{order.IdPaquete}</td>
                                        <td>{new Date(order.PallDate).toLocaleDateString()}</td>
                                        <td>{order.PalletTime}</td>
                                        <td>{order.SerialAndBatch}</td>
                                        <td>{order.WeightNet}</td>
                                        <td>{order.WeightBrut}</td>
                                        <td>
                                            <FaTrash
                                                className="icon" size={20}
                                                style={{ color: '#ff0000' }}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    eliminarPallet(order)
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center" }}>Sin datos disponibles</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className='col-md-6'>
                    <div class="container">
                        <div class="row row-cols-2 row-gap-md-4">
                            <div class="col-md-12">
                                <div class="form-floating">
                                    <div style={{ width: '500px', position: 'relative', zIndex: 10 }}>
                                        <label htmlFor="dropdown-supervisores" style={{ marginBottom: '8px', display: 'block' }}>
                                            Selecciona un Supervisor:
                                        </label>
                                        <Select
                                            id="dropdown-supervisores"
                                            options={opcionesSupervisores}
                                            value={supervisorSeleccionado}

                                            onChange={handleChangeSupervisor}
                                            placeholder="Buscar o seleccionar..."
                                            isSearchable={true} // Habilitar campo de búsqueda
                                            noOptionsMessage={() => 'No se encontraron supervisores'}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: '#ccc',
                                                }),
                                            }}
                                        />
                                        {/* {supervisorSeleccionado && (
                                            <p style={{ marginTop: '10px' }}>
                                                <strong>Supervisor seleccionado:</strong> {supervisorSeleccionado.label}
                                            </p>
                                        )} */}
                                    </div>
                                </div>
                            </div>
                            <div class="col">
                                <div class="form-floating">
                                    <input type="number" className="form-control" id="floatingInput" placeholder="Bascula" style={{ color: '#000', height: '120px', fontSize: '4rem', textAlign: 'center' }} value={piezas} onChange={(e) => setPiezas(e.target.value)} />
                                    <label style={{ color: '#000' }} for="floatingInput">Piezas</label>
                                </div>
                            </div>
                            <div class="col">
                                <div class="form-floating">
                                    <input type="number" className="form-control" id="floatingInput" placeholder="Bascula" style={{ color: '#000', height: '120px', fontSize: '4rem', textAlign: 'center' }} value={lecturaBascula} onChange={(e) => setLecturaBascula(e.target.value)} />
                                    <label style={{ color: '#000' }} for="floatingInput">Lectura De Bascula (KG.)</label>
                                </div>
                            </div>

                            <div class="col-md-12">
                                <div style={{ position: 'relative', zIndex: 9 }}>
                                    <label htmlFor="dropdown-basculas" style={{ marginBottom: '8px', display: 'block' }}>
                                        Bascula Habilitada:
                                    </label>
                                    <Select
                                        id="dropdown-basculas"
                                        options={opcionesBasculas}
                                        value={basculaSeleccionado}
                                        onChange={handleChangeBascula}
                                        placeholder="Buscar o seleccionar..."
                                        isSearchable={true} // Habilitar campo de búsqueda
                                        noOptionsMessage={() => 'No se encontraron basculas'}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: '#ccc',
                                            }),
                                        }}
                                    />
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div style={{ position: 'relative', zIndex: 8 }}>
                                    <label htmlFor="dropdown-impresoras" style={{ marginBottom: '8px', display: 'block' }}>
                                        Impresion De Etiqueta:
                                    </label>
                                    <Select
                                        id="dropdown-impresoras"
                                        options={opcionesImpresoras}
                                        value={impresoraSeleccionado}
                                        onChange={handleChangeImpresora}
                                        placeholder="Buscar o seleccionar..."
                                        isSearchable={true} // Habilitar campo de búsqueda
                                        noOptionsMessage={() => 'No se encontraron impresoras'}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: '#ccc',
                                            }),
                                        }}
                                    />
                                </div>
                            </div>
                            <div class="col-md-7">
                                <FaPrint className="icon" size={30} />
                                <label style={{ color: '#000', marginLeft: 10 }} for="floatingInput">Metodo Impresion De Etiqueta</label>
                            </div>
                            <div class="col-md-3">
                                <Button variant="warning" onClick={(e) => handleOpenModalConfirm(e, 'cerrarPallet')}>
                                    Cerrar Pallet
                                </Button>
                            </div>
                            <div class="col-md-2">
                                <Button variant="primary" onClick={handleGuardarRegistroLectura} disabled={loading ? true : false}>
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModalIniciar
                show={showModalConfirm}
                handleCloseModal={handleCloseModal}
                handleCancelModal={handleCancelModal}
                title={tituloConfirm}
                message={mensajeConfirm}
                tituloBtnConfirm={tituloBtnConfirm}
                tituloBtnCancel={tituloBtnCancel}
            />

            <ModalMerma
                showModalMerma={showModalMerma}
                handleCloseMerma={handleCloseModalMerma}
                docEntry={docEntry}
            />

            <ParoDeMaquinaNuevo
                showModalNuevo={showModalNuevo}
                handleCloseModalNuevo={handleCloseModalNuevo}
                handleCloseModalEditar={handleCloseModalEditar}
                docEntry={docEntry}
            />

            <ConfirmModal
                show={showConfirm}
                handleClose={handleCloseconfirm}
                title={tituloConfirm}
                message={mensajeConfirm}
                handleConfirm={handleConfirm}
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
    )
}

export default OrdenProduccionWps
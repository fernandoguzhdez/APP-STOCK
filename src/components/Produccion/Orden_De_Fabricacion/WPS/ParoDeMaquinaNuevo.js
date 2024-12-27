import React, { useContext, useEffect, useState } from 'react'
import { Collapse, Button, Table, Modal, Spinner } from 'react-bootstrap';
import { ProduccionContext } from "../../../../context/ProduccionContext";
import Select from 'react-select';
import api from '../../../../axiosConfig';
import './ParoDeMaquinaNuevo.css';
import Loading from '../../../Loading';
import { FaPlus, FaEdit, FaEye, FaTimes } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import ConfirmModal from '../../../ConfirmModal';


const ParoDeMaquinaNuevo = ({ showModalNuevo, handleCloseModalNuevo, docEntry, handleCloseModalEditar }) => {
    const { loading, guardarTiempoMuerto, incidencia, actualizarTiempoMuerto, fechaInicio, setFechaInicio, fechaFin, setFechaFin, horaInicio,
        setHoraInicio, horaFin, setHoraFin, comentariosInicio, setComentariosInicio, comentariosFin, setComentariosFin, kiloPorHora, setKiloPorHora,
        tiempo, setTiempo, kilosParo, setKilosParo } = useContext(ProduccionContext);
    const [selectedProcess, setSelectedProcess] = useState("01");
    const [motivoTM, setMotivoTM] = useState([]);
    const [opcionesMotivoTM, setOpcionesMotivoTM] = useState([]);
    const [motivoTMSeleccionado, setMotivoTMSeleccionado] = useState(null);
    const [maquinasTM, setMaquinasTM] = useState([])
    const [opcionesMaquinasTM, setOpcionesMaquinasTM] = useState([])
    const [maquinaTMSeleccionada, setMaquinaTMSeleccionada] = useState(null)
    const [toast, setToast] = useState({ show: false, message: '', title: '', type: '' });
    const [showConfirm, setShowConfirm] = useState(false)
    const [tituloConfirm, setTituloConfirm] = useState(null)
    const [mensajeConfirm, setMensajeConfirm] = useState(null)

    useEffect(() => {
        fetchMotivosTM()
        fetchMaquinasTM()
    }, []);

    useEffect(() => {
        if (!incidencia || !incidencia.DateStart) {
            console.warn("incidencia o DateStart no están definidos");
            return;
        }

        setKiloPorHora(incidencia.WeightForHour)
        setSelectedProcess(incidencia.IdProcess)
        opcionesMotivoTM.map((motivo, index) => {
            if (motivo.value === incidencia.IdTime) {
                setMotivoTMSeleccionado(opcionesMotivoTM[index])
            }
        })
        opcionesMaquinasTM.map((maquina, index) => {
            if (maquina.value === incidencia.IdMachine) {
                setMaquinaTMSeleccionada(opcionesMaquinasTM[index])
            }
        })
        setComentariosInicio(incidencia.RemarksStart)
        setComentariosFin(incidencia.RemarksEnd)
        setHoraInicio(incidencia.TimeStart)
        setHoraFin(incidencia.TimeEnd)

        const fechaInicioSplit = incidencia.DateStart.split("T")[0]
        setFechaInicio(fechaInicioSplit)

        const fechaFinSplit = incidencia.DateEnd.split("T")[0]
        setFechaFin(fechaFinSplit)

        setTiempo(incidencia.TotalTime)
        
        setKilosParo(incidencia.WeightStop)

    }, [incidencia]);

    useEffect(() => {
        console.log('Sumar tiempo...', fechaInicio + 'y el tiempo' + horaInicio)

        // Función auxiliar para convertir fecha y hora a un objeto Date
        const convertirFechaYHora = (fechaStr, horaStr) => {
            if (!fechaStr || !horaStr) return null;
            const fechaCompleta = `${fechaStr}T${horaStr}:00`; // Agregar ":00" para segundos
            const fecha = new Date(fechaCompleta);

            if (isNaN(fecha)) {
                throw new Error(`Fecha inválida: ${fechaCompleta}`);
            }

            return fecha;
        };

        // Convertir las fechas y horas a objetos Date
        const inicio = convertirFechaYHora(fechaInicio, horaInicio);
        const fin = fechaFin ? convertirFechaYHora(fechaFin, horaFin) : null;

        let diferenciaHoras = 0;
        let diferenciaMinutos = 0;

        if (fin) {

            // Calcular la diferencia en milisegundos
            const diferenciaMilisegundos = fin.getTime() - inicio.getTime();

            // Validar si la diferencia es negativa
            if (diferenciaMilisegundos < 0) {
                console.log("La fecha y hora de fin no puede ser anterior a la fecha y hora de inicio.");
            }

            // Calcular las horas y minutos exactos
            const diferenciaHoras = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60)); // Horas completas
            const diferenciaMinutos = Math.round((diferenciaMilisegundos % (1000 * 60 * 60)) / (1000 * 60)); // Minutos restantes
            console.log("Suma total del tiemo....", diferenciaHoras + '.' + diferenciaMinutos)
            setTiempo(diferenciaHoras + '.' + diferenciaMinutos)
            // Si los minutos llegan a 60, los redondeamos a la siguiente hora
            if (diferenciaMinutos === 60) {
                diferenciaHoras += 1;
                diferenciaMinutos = 0;
            }
        }


    }, [fechaFin, horaFin]);

    useEffect(() => {
        setMotivoTMSeleccionado(opcionesMotivoTM[0])
        setMaquinaTMSeleccionada(opcionesMaquinasTM[0])
    }, [opcionesMaquinasTM, opcionesMotivoTM]);

    const showToast = (message, type) => {
        const title = type === "error" ? "Error" : "Éxito";
        setToast({ show: true, message, title, type });
        setTimeout(() => setToast({ show: false, message: '', title: '', type: '' }), 6000);
    };

    const handleChangeProceso = (e) => {
        e.preventDefault();
        setSelectedProcess(e.target.id);
    };

    const handlechangeMotivoTM = (selectedOption) => {
        setMotivoTMSeleccionado(selectedOption);
    }

    const handleHoraFinSeleccionada = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setHoraFin(e.target.value)
    }

    // LISTADO MAQUINAS
    const fetchMaquinasTM = async () => {
        try {
            const response = await api.get('/api/MasterData/Get_Machine');

            // Convertir datos a formato compatible con react-select
            const opcionesFormateadas = response.data.map((maquina) => ({
                value: maquina.VisResCode,
                label: `${maquina.VisResCode}-${maquina.ResName}`,
            }));
            console.log('Maquinas...', response.data)
            setMaquinasTM(response.data);
            setOpcionesMaquinasTM(opcionesFormateadas);
        } catch (error) {
            console.log('Maquinas Error...', error)
            showToast("Error al cargar las maquinas de tiempo muerto", "error");
        }
    };

    const handleChangeMaquinaTM = (selectedOption) => {
        setMaquinaTMSeleccionada(selectedOption)
    }

    // LISTADO MOTIVOS
    const fetchMotivosTM = async () => {
        try {
            const response = await api.get('/api/MasterData/Get_StopTime_Motivos');

            // Convertir datos a formato compatible con react-select
            const opcionesFormateadas = response.data.map((motivo) => ({
                value: motivo.Code,
                label: `${motivo.Code}-${motivo.Name}`,
            }));
            console.log('Motivos...', response.data)
            setMotivoTM(response.data);
            setOpcionesMotivoTM(opcionesFormateadas);
        } catch (error) {
            console.log('Motivos Error...', error)
            showToast("Error al cargar los motivos de tiempo muerto", "error");
        }
    };

    const handleShowconfirm = () => {
        setShowConfirm(true)
        setTituloConfirm(incidencia ? 'Actualizar' : 'Nuevo')
        setMensajeConfirm(incidencia ? 'Confirme para actualizar' : '¿Confirme para agregar nuevo?')
    }

    const handleClose = () => {
        setShowConfirm(false)
    }

    const handleConfirm = () => {
        handleCloseModalNuevo()
        handleClose()
        if (incidencia) {
            actualizarTiempoMuerto(docEntry, selectedProcess, maquinaTMSeleccionada, kiloPorHora, motivoTMSeleccionado, fechaInicio, fechaFin, horaInicio, horaFin, comentariosInicio, comentariosFin, tiempo, kilosParo)
        } else {
            guardarTiempoMuerto(docEntry, selectedProcess, maquinaTMSeleccionada, kiloPorHora, motivoTMSeleccionado, fechaInicio, fechaFin, horaInicio, horaFin, comentariosInicio, comentariosFin, tiempo, kilosParo)
        }
    }

    return (
        <>
            <Modal show={showModalNuevo} onHide={handleCloseModalNuevo || handleCloseModalEditar} centered size='lg' animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Informacion Tiempo Muerto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex">
                        <strong className="fw-bold me-3">Proceso:</strong>
                        <div className="d-flex gap-4">
                            {/* Radio 01: Extrusión */}
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="process"
                                    id="01"
                                    value="01"
                                    checked={selectedProcess === "01"}
                                    onChange={(e) => setSelectedProcess('01')}
                                />
                                <label className="form-check-label" htmlFor="01">
                                    Extrusión
                                </label>
                            </div>

                            {/* Radio 02: Co-Extrusión */}
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="process"
                                    id="02"
                                    value="02"
                                    checked={selectedProcess === "02"}
                                    onChange={(e) => setSelectedProcess('02')}
                                />
                                <label className="form-check-label" htmlFor="02">
                                    Co-Extrusión
                                </label>
                            </div>

                            {/* Radio 03: Embobinado */}
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="process"
                                    id="03"
                                    value="03"
                                    checked={selectedProcess === "03"}
                                    onChange={(e) => setSelectedProcess('03')}
                                />
                                <label className="form-check-label" htmlFor="03">
                                    Embobinado
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div class="col-md-5">
                            <div style={{ position: 'relative', zIndex: 9 }}>
                                <strong htmlFor="dropdown-maquinas" style={{ marginBottom: '8px', display: 'block' }}>
                                    Maquina:
                                </strong>
                                <Select
                                    id="dropdown-maquinas"
                                    options={opcionesMaquinasTM}
                                    value={maquinaTMSeleccionada}
                                    onChange={handleChangeMaquinaTM}
                                    placeholder="Buscar o seleccionar..."
                                    isSearchable={true} // Habilitar campo de búsqueda
                                    noOptionsMessage={() => 'No se encontraron maquinas'}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderColor: '#ccc',
                                        }),
                                    }}
                                />
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div style={{ position: 'relative', zIndex: 9 }}>
                                <strong htmlFor="dropdown-maquinas" style={{ marginBottom: '8px', display: 'block' }}>
                                    KG x HR:
                                </strong>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="floatingInput"
                                    placeholder="Tarimas a producir"
                                    style={{ color: '#000' }}
                                    value={kiloPorHora}
                                    onChange={(e) => setKiloPorHora(e.target.value)} />
                            </div>
                        </div>
                        <div class="col-md-5">
                            <div style={{ position: 'relative', zIndex: 8 }}>
                                <strong htmlFor="dropdown-motivo" style={{ marginBottom: '8px', display: 'block' }}>
                                    Motivo:
                                </strong>
                                <Select
                                    id="dropdown-motivo"
                                    options={opcionesMotivoTM}
                                    value={motivoTMSeleccionado}
                                    onChange={handlechangeMotivoTM}
                                    placeholder="Buscar o seleccionar..."
                                    isSearchable={true} // Habilitar campo de búsqueda
                                    noOptionsMessage={() => 'No se encontraron motivos'}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderColor: '#ccc',
                                        }),
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='row mt-1' style={{ padding: '1rem' }}>
                        <div className="col-md-6" style={{ border: '2px solid #cecece', padding: '8px' }}>
                            {/* Título */}
                            <h5
                                style={{
                                    backgroundColor: "#3b5998",
                                    color: "#fff",
                                    padding: ".5rem",
                                    textAlign: "center",
                                }}
                            >
                                Fecha y hora de inicio de paro
                            </h5>

                            {/* Selector de Fecha y Hora */}
                            <div className="d-flex gap-3 my-3">
                                {/* Selector de Fecha */}
                                <div className="flex-grow-1">
                                    <label htmlFor="fechaInicio" className="form-label">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="fechaInicio"
                                        name="fechaInicio"
                                        value={fechaInicio}
                                        onChange={(e) => { setFechaInicio(e.target.value); console.log('fecha seleccionada...', e.target.value) }}
                                    />
                                </div>
                                {/* Selector de Hora */}
                                <div className="flex-grow-1">
                                    <label htmlFor="horaInicio" className="form-label">
                                        Hora
                                    </label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        id="horaInicio"
                                        name="horaInicio"
                                        value={horaInicio}
                                        onChange={(e) => { setHoraInicio(e.target.value) }}
                                    />
                                </div>
                            </div>

                            {/* Campo de Observaciones */}
                            <div className="my-3">
                                <label htmlFor="observacionesInicio" className="form-label">
                                    Observaciones:
                                </label>
                                <textarea
                                    className="form-control"
                                    id="observacionesInicio"
                                    name="observacionesInicio"
                                    rows="2"
                                    placeholder="Escribe tus observaciones aquí..."
                                    value={comentariosInicio}
                                    onChange={(e) => setComentariosInicio(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className='col-md-6' style={{ border: '2px solid #cecece', padding: '8px' }}>
                            <h5 style={{ backgroundColor: '#3b5998', color: '#fff', padding: '.5rem', textAlign: 'center' }}>Fecha y hora de fin de paro</h5>

                            {/* Selector de Fecha y Hora */}
                            <div className="d-flex gap-3 my-3">
                                {/* Selector de Fecha */}
                                <div className="flex-grow-1">
                                    <label htmlFor="fechaFin" className="form-label">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="fechaFin"
                                        name="fechaFin"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        disabled={incidencia ? false : true}
                                    />
                                </div>
                                {/* Selector de Hora */}
                                <div className="flex-grow-1">
                                    <label htmlFor="horaFin" className="form-label">
                                        Hora
                                    </label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        id="horaFin"
                                        name="horaFin"
                                        value={horaFin}
                                        onChange={(e) => setHoraFin(e.target.value)}
                                        disabled={incidencia ? false : true}
                                    />
                                </div>
                            </div>

                            {/* Campo de Observaciones */}
                            <div className="my-3">
                                <label htmlFor="observacionesFin" className="form-label">
                                    Observaciones:
                                </label>
                                <textarea
                                    className="form-control"
                                    id="observacionesFin"
                                    name="observacionesFin"
                                    rows="2"
                                    placeholder="Escribe tus observaciones aquí..."
                                    value={comentariosFin}
                                    onChange={(e) => setComentariosFin(e.target.value)}
                                    disabled={incidencia ? false : true}
                                ></textarea>
                            </div>

                            {/* Campos Tiempo (Hrs.) y Kgs. Paro */}
                            <div className="d-flex gap-3 my-3">
                                {/* Tiempo (Hrs.) */}
                                <div class="form-floating">
                                    <input disabled={true} type="text" className="form-control" id="floatingInput" placeholder="Tiempo (Hrs.)" style={{ color: '#000' }} value={tiempo} onChange={(e) => setTiempo(e.target.value)} />
                                    <label style={{ color: '#000' }} for="floatingInput">Tiempo (Hrs.)</label>
                                </div>

                                <div class="form-floating">
                                    <input type="text" className="form-control" id="floatingInput" placeholder="Kgs. Paro" style={{ color: '#000' }} value={kilosParo} onChange={(e) => setKilosParo(e.target.value)} />
                                    <label style={{ color: '#000' }} for="floatingInput">Kgs. Paro</label>
                                </div>
                            </div>
                        </div>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModalNuevo}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={(e) => handleShowconfirm(e)}>
                        {incidencia ? 'Actualizar' : 'Guardar'}
                    </Button>
                </Modal.Footer>


            </Modal>
            <ConfirmModal
                show={showConfirm}
                handleClose={handleClose}
                title={tituloConfirm}
                message={mensajeConfirm}
                handleConfirm={handleConfirm}
            />
        </>
    );
}

export default ParoDeMaquinaNuevo
import React, { useContext, useEffect, useState } from 'react'
import { Collapse, Button, Table, Modal, Spinner } from 'react-bootstrap';
import { ProduccionContext } from "../../../../context/ProduccionContext";
import Select from 'react-select';
import api from '../../../../axiosConfig';
import './ModalMerma.css';
import Loading from '../../../Loading';


const ModalMerma = ({ showModalMerma, handleCloseMerma, docEntry }) => {

    const { mermas, agregarMerma, loading } = useContext(ProduccionContext);
    const [supervisores, setSupervisores] = useState([]);
    const [opcionesSupervisores, setOpcionesSupervisores] = useState([]);
    const [supervisorSeleccionado, setSupervisorSeleccionado] = useState(null);
    const [tipoMerma, setTipoMerma] = useState([]);
    const [opcionesTipoMerma, setOpcionesTipoMerma] = useState([]);
    const [tipoMermaSeleccionada, setTipoMermaSeleccionada] = useState(null);
    const totalWeight = mermas.reduce((sum, item) => sum + item.Weight, 0);
    const [pesoMerma, setPesoMerma] = useState(0)
    const [showModalConfirm, setShowModalConfirm] = useState(false)

    useEffect(() => {
        fetchSupervisores()
        fetchTipoMerma()
    }, []);

    useEffect(() => {
        setSupervisorSeleccionado(opcionesSupervisores[0])
        setTipoMermaSeleccionada(opcionesTipoMerma[0])
    }, [opcionesSupervisores, opcionesTipoMerma]);

    const handleChangeSupervisor = (selectedOption) => {
        setSupervisorSeleccionado(selectedOption);
    };

    const handleChangeTipoMerma = (selectedOption) => {
        setTipoMermaSeleccionada(selectedOption);
    };

    //OBTENER LISTADO TIPO DE MERMA
    const fetchTipoMerma = async () => {
        try {
            const response = await api.get('/api/Decrease/Type_Decrease');

            // Convertir datos a formato compatible con react-select
            const opcionesFormateadas = response.data.map((tipoMerma) => ({
                value: tipoMerma.Code,
                label: `${tipoMerma.Code} - ${tipoMerma.Name}`,
            }));

            setTipoMerma(response.data);
            setOpcionesTipoMerma(opcionesFormateadas);
        } catch (error) {
            console.error('Error al cargar tipo merma:', error);
        }
    }

    //CARGA SUPERVISORES
    const fetchSupervisores = async () => {
        try {
            const response = await api.get('/api/MasterData/Get_Employes_Supervisor?Type=S');

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
    }

    const handleCloseModalConfirm = () => {
        setShowModalConfirm(false)
    }

    const handleConfirm = (e) => {
        e.preventDefault()
        setShowModalConfirm(false);
        agregarMerma(supervisorSeleccionado, tipoMermaSeleccionada, docEntry, pesoMerma)
    }

    const ConfirmModal = ({ show, handleClose }) => {
        return (
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Agregar Merma</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Esta seguro de agregar merma?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={(e) => handleConfirm(e)}>
                        Aceptar
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };

    return (
        <div>
            <Modal show={showModalMerma} onHide={handleCloseMerma} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Acumulado De Merma</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <div className='row'>
                            <Select
                                className='col-md-5'
                                id="dropdown-supervisores"
                                options={opcionesSupervisores}
                                value={supervisorSeleccionado}
                                onChange={handleChangeSupervisor}
                                placeholder="Supervisor"
                                isSearchable={true} // Habilitar campo de búsqueda
                                noOptionsMessage={() => 'No se encontraron supervisores'}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: "#ccc",
                                        height: "58px", // Altura fija del componente
                                        minHeight: "58px", // Asegura que no se reduzca por debajo de este tamaño
                                    }),
                                    valueContainer: (base) => ({
                                        ...base,
                                        height: "58px", // Ajusta la altura del contenedor del valor
                                        display: "flex",
                                        alignItems: "center", // Centra verticalmente el contenido
                                    }),
                                    input: (base) => ({
                                        ...base,
                                        margin: 0, // Evita márgenes que puedan alterar la altura
                                    }),
                                }}
                            />
                            <Select
                                className='col-md-4'
                                id="dropdown-supervisores"
                                options={opcionesTipoMerma}
                                value={tipoMermaSeleccionada}
                                onChange={handleChangeTipoMerma}
                                placeholder="Tipo De Merma"
                                isSearchable={true} // Habilitar campo de búsqueda
                                noOptionsMessage={() => 'No se encontraron tipos de merma'}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: "#ccc",
                                        height: "58px", // Altura fija del componente
                                        minHeight: "58px", // Asegura que no se reduzca por debajo de este tamaño
                                    }),
                                    valueContainer: (base) => ({
                                        ...base,
                                        height: "58px", // Ajusta la altura del contenedor del valor
                                        display: "flex",
                                        alignItems: "center", // Centra verticalmente el contenido
                                    }),
                                    input: (base) => ({
                                        ...base,
                                        margin: 0, // Evita márgenes que puedan alterar la altura
                                    }),
                                }}
                            />
                            <div class="col-md-3">
                                <div class="form-floating">
                                    <input type="number" className="form-control" id="floatingInput" placeholder="Bascula" style={{}} value={pesoMerma} onChange={(e) => setPesoMerma(e.target.value)} />
                                    <label style={{ color: '#000' }} for="floatingInput">Peso Merma</label>
                                </div>
                            </div>
                        </div>
                        <div className='mt-4' style={{ height: '350px', overflowY: 'auto' }}>
                            <table className="ordenes-wps-table mt-2" onScroll={false}>
                                <thead>
                                    <tr>
                                        <th>Tipo De Merma</th>
                                        <th>Acumulado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mermas.map((merma) => (
                                        <tr key={merma.Code} style={{ cursor: "pointer" }} onClick={(e) => { }}>
                                            <td>{merma.Name}</td>
                                            <td>{merma.Weight}</td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>
                        <div className='row'>
                            <strong className='col-md-6 text-end'>Acumulado De Desperdicio:</strong>
                            <p className='col-md-6 text-start' style={{ paddingLeft: 8, backgroundColor: '#4CAF50', width: '43.3%', marginLeft: '41px', color: '#fff' }}>{totalWeight}</p>
                        </div>
                    </div>
                    {loading && <Loading />}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleCloseMerma}>
                        Salir
                    </Button>
                    <Button variant="primary" onClick={(e) => handleOpenModalConfirm(e)}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>

            <ConfirmModal
                show={showModalConfirm}
                handleClose={handleCloseModalConfirm}
            />

        </div>
    )
}

export default ModalMerma
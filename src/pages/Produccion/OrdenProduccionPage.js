import React, { useContext, useEffect, useState } from 'react';
import { ProduccionContext } from '../../context/ProduccionContext';
import { PlaneacionContext } from '../../context/PlaneacionContext';
import { useParams } from 'react-router-dom';
import { Collapse, Button, Table, Tab, Tabs } from 'react-bootstrap'; // Importar Tabs
import { FaPrint } from 'react-icons/fa';
import './OrdenProduccionPage.css';
import ConfirmModal from '../../components/ConfirmModal';
import Loading from '../../components/Loading';
import ToastMessage from '../../components/ToastMessage';

const OrdenProduccionPage = () => {
    const { docEntry } = useParams();
    const {
        loading,
        prodOrdersComponents,
        fetchProdOrderComponents,
        showModalConfirm,
        setShowModalConfirm,
        tituloConfirm,
        setTituloConfirm,
        mensajeConfirm,
        setMensajeConfirm,
        ProdOrderComponentsTraslado,
        ProdOrderComponentsMezcla,
        toast,
        setToast,
    } = useContext(ProduccionContext);
    const [expandedLine, setExpandedLine] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [orderLineSelected, setOrderLineSelected] = useState([]);
    const [activeTab, setActiveTab] = useState('componentes'); // Estado para los tabs

    useEffect(() => {
        fetchProdOrderComponents(docEntry);
    }, []);

    if (loading) {
        return (
            <div>
                {loading && <Loading />}
            </div>
        );
    }

    const toggleLine = (lineNum) => {
        setExpandedLine((prevLine) => (prevLine === lineNum ? null : lineNum)); // Alternar entre abrir y cerrar
    };

    const handleCloseModalConfirm = () => {
        setShowModalConfirm(false);
    };

    const handleConfirmAction = () => {
        setShowModalConfirm(false);
        if (tituloConfirm === 'Solicitud de traslado') {
            ProdOrderComponentsTraslado(orderLineSelected, docEntry);
        } else {
            ProdOrderComponentsMezcla(orderLineSelected, docEntry);
        }
    };

    return (
        <div className="detalle-orden-container">
            <div className="detalle-cabecera row">
                <div className='col-11'>
                    <div className="col mb-3 d-flex gap-3" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className='row'>
                            <strong>Numero De Orden</strong>
                            <p>{prodOrdersComponents?.DocNum}</p>
                        </div>
                        <div className='row'>
                            <strong>Fecha De Orden</strong>
                            <p>{new Date(prodOrdersComponents?.Fecha_Fabricacion).toLocaleDateString()}</p>
                        </div>
                        <div className='row'>
                            <strong>Numero De Cliente</strong>
                            <p>{prodOrdersComponents?.CardCode}</p>
                        </div>
                        <div className='row'>
                            <strong>Cliente</strong>
                            <p>{prodOrdersComponents?.CardName}</p>
                        </div>
                        <div className='row'>
                            <strong>Pedido Del Cliente</strong>
                            <p>{prodOrdersComponents?.OV}</p>
                        </div>
                    </div>
                    <div className="col mb-3 d-flex gap-3" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className='row'>
                            <strong>Estatus</strong>
                            <Button
                                style={{ width: 'auto', backgroundColor: prodOrdersComponents?.Colorbutton, color: prodOrdersComponents?.ColorTextbtn }}
                            >
                                {prodOrdersComponents?.StatusTexto}
                            </Button>
                        </div>
                        <div className='row'>
                            <strong>N° De Producto</strong>
                            <p>{prodOrdersComponents?.ItemCode}</p>
                        </div>
                        <div className='row'>
                            <strong>Producto</strong>
                            <p>{prodOrdersComponents?.ProdName}</p>
                        </div>
                        <div className='row'>
                            <strong>Presentacion</strong>
                            <p>{prodOrdersComponents?.Uom}</p>
                        </div>
                        <div className='row'>
                            <strong>Cantidad Planificada</strong>
                            <p>{prodOrdersComponents?.PlannedQty}</p>
                        </div>
                        <div className='row'>
                            <strong>Peso Bruto</strong>
                            <p>{prodOrdersComponents?.WeightB}</p>
                        </div>
                        <div className='row'>
                            <strong>Peso Neto</strong>
                            <p>{prodOrdersComponents?.WeightN}</p>
                        </div>
                    </div>
                </div>
                <div className='col-1' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                    <FaPrint className="icon" size={50} />
                </div>

            </div>
            {/* Tabs encima de la tabla */}
            <Tabs
                id="controlled-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
            >
                <Tab eventKey="componentes" title="Componentes">
                    {/* Sección de componentes */}
                </Tab>
                <Tab eventKey="wps" title="WPS">
                    {/* Sección de WPS */}
                </Tab>
            </Tabs>

            {/* Contenido condicional basado en el tab seleccionado */}
            {activeTab === 'componentes' && (
                <div>
                    {/* Tabla y contenido actual */}
                    <table bordered hover className="ordenesComponentes-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>N° De Producto</th>
                                <th>Descripcion</th>
                                <th>Ctd. Requerida</th>
                                <th>Consumido</th>
                                <th>Ctd. Necesaria</th>
                                <th>Almacén</th>
                                <th>Estatus De Linea</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {prodOrdersComponents?.OrderLines?.map((line, index) => (
                                <React.Fragment key={line.LineNum}>
                                    <tr
                                        className={
                                            expandedLine === line.LineNum
                                                ? 'expanded-row'
                                                : ''
                                        }
                                        style={{
                                            backgroundColor:
                                                expandedLine === line.LineNum
                                                    ? '#f5f5a6'
                                                    : 'transparent',
                                            borderLeft:
                                                expandedLine === line.LineNum
                                                    ? '5px solid #ffc107'
                                                    : 'none',
                                            cursor: 'pointer',
                                            opacity: line.Status === 'P' ? 1 : 0.2,
                                        }}
                                        onClick={(e) => {
                                            toggleLine(line.LineNum);
                                            e.stopPropagation(); // Evitar que el clic se propague al `tr`
                                        }}
                                    >
                                        <td>
                                            {line.LineDocs && (
                                                <span
                                                    style={{
                                                        marginRight: '8px',
                                                        color: '#007bff',
                                                    }}
                                                >
                                                    ▼ {/* Ícono o flecha */}
                                                </span>
                                            )}
                                        </td>
                                        <td>{line.ItemCode}</td>
                                        <td>{line.ItemName}</td>
                                        <td>{line.PlannedQty}</td>
                                        <td>{line.QtyAd}</td>
                                        <td>{line.IssuedQty}</td>
                                        <td>{line.WhsCode}</td>
                                        <td style={{}}>
                                            <p
                                                style={{
                                                    backgroundColor:
                                                        line.Status === 'P'
                                                            ? '#008000'
                                                            : '#FF0000',
                                                    width: '100%',
                                                    height: '30px',
                                                    margin: 0,
                                                    textAlign: 'center',
                                                    alignContent: 'center',
                                                    color: '#fff',
                                                }}
                                            >
                                                {line.Status === 'P'
                                                    ? 'Abierto'
                                                    : 'Cerrado'}
                                            </p>
                                        </td>
                                        <td>
                                            <Button
                                                variant="warning"
                                                style={{
                                                    width: '100%',
                                                    display:
                                                        line.BtnSol === 1
                                                            ? 'none'
                                                            : 'block',
                                                }}
                                                className="mb-1"
                                                onClick={(e) => {
                                                    if (line.Status === 'P') {
                                                        e.stopPropagation();
                                                        setShowModalConfirm(true);
                                                        setTituloConfirm(
                                                            'Solicitud de traslado'
                                                        );
                                                        setOrderLineSelected(line);
                                                        setMensajeConfirm(
                                                            'Confirme para realizar la solicitud de traslado'
                                                        );
                                                    }
                                                }}
                                            >
                                                Solicitud de traslado
                                            </Button>
                                            <Button
                                                variant="info"
                                                style={{
                                                    width: '100%',
                                                    display:
                                                        line.BtnMix === 1
                                                            ? 'none'
                                                            : 'block',
                                                }}
                                                onClick={(e) => {
                                                    if (line.Status === 'P') {
                                                        e.stopPropagation();
                                                        setShowModalConfirm(true);
                                                        setTituloConfirm('Mezcla');
                                                        setOrderLineSelected(line);
                                                        setMensajeConfirm(
                                                            '¿Confirme para generar la orden de produccion en sap?'
                                                        );
                                                    }
                                                }}
                                            >
                                                Mezcla
                                            </Button>
                                        </td>
                                    </tr>
                                    {/* Contenido expandible */}
                                    <tr>
                                        <td
                                            colSpan="10"
                                            style={{ padding: 0, border: 0 }}
                                        >
                                            <Collapse
                                                in={
                                                    expandedLine === line.LineNum
                                                }
                                            >
                                                <div
                                                    style={{
                                                        padding: '10px',
                                                        backgroundColor:
                                                            '#f8f9fa',
                                                    }}
                                                >
                                                    {line.LineDocs ? (
                                                        <Table
                                                            size="sm"
                                                            bordered
                                                        >
                                                            <thead>
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>
                                                                        N° De
                                                                        Documento
                                                                    </th>
                                                                    <th>
                                                                        Fecha De
                                                                        Documento
                                                                    </th>
                                                                    <th>
                                                                        Estatus
                                                                    </th>
                                                                    <th>
                                                                        Tipo De
                                                                        Documento
                                                                    </th>
                                                                    <th>
                                                                        N° De
                                                                        Producto
                                                                    </th>
                                                                    <th>
                                                                        Producto
                                                                    </th>
                                                                    <th>
                                                                        Cantidad
                                                                    </th>
                                                                    <th>UM</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {line.LineDocs.map(
                                                                    (
                                                                        doc,
                                                                        docIndex
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                docIndex
                                                                            }
                                                                        >
                                                                            <td>
                                                                                {
                                                                                    docIndex
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    doc.LineNum
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {new Date(
                                                                                    doc.DocDate
                                                                                ).toLocaleDateString()}
                                                                            </td>
                                                                            <td>
                                                                                <span
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            doc.TagColor,
                                                                                        color: doc.TagText,
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        doc.Status
                                                                                    }
                                                                                </span>
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    doc.TypeName
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    doc.ItemCode
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    doc.ItemName
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    doc.Quantity
                                                                                }
                                                                                {
                                                                                    doc.NameUom
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                <FaPrint
                                                                                    className="icon"
                                                                                    size={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                )}
                                                            </tbody>
                                                        </Table>
                                                    ) : (
                                                        <p>
                                                            No hay documentos
                                                            relacionados.
                                                        </p>
                                                    )}
                                                </div>
                                            </Collapse>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            {!loading && prodOrdersComponents?.OrderLines?.length === 0 && <p>No hay datos disponibles.</p>}

            <ConfirmModal
                show={showModalConfirm}
                handleClose={handleCloseModalConfirm}
                handleConfirm={handleConfirmAction}
                title={tituloConfirm}
                message={mensajeConfirm}
                itemSelected={orderLineSelected}
            />

            <ToastMessage
                show={toast.show}
                onClose={() => setToast({ show: false })}
                message={toast.message}
                title={toast.title}
                type={toast.type}
            />

        </div>
    )
}

export default OrdenProduccionPage;

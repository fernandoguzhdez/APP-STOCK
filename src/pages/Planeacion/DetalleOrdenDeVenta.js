import React, { useEffect, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlaneacionContext } from '../../context/PlaneacionContext';
import { Collapse, Button } from 'react-bootstrap';
import './DetalleOrdenDeVenta.css';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import ToastMessage from '../../components/ToastMessage';
import Loading from '../../components/Loading';

const DetalleOrdenDeVenta = () => {
    const { docEntry } = useParams();
    const { fetchOrderDetails, orderDetails, loading, dispathItem, toast, setToast } = useContext(PlaneacionContext);
    const [openLines, setOpenLines] = useState({});

    useEffect(() => {
        fetchOrderDetails(docEntry);
    }, []);

    if (loading) {
        return <div>
            {loading && (
                <Loading />
            )}
        </div>;
    }

    if (!orderDetails) {
        return <div>No se encontraron detalles para esta orden.</div>;
    }

    const { CardCode, CardName, DocDate, DocDueDate, DocTotal, OrderLines, ObjType, Comments = [] } = orderDetails;

    const toggleLine = (lineNum) => {
        setOpenLines((prev) => ({
            ...prev,
            [lineNum]: !prev[lineNum],
        }));
    };

    const handleEntregarClick = (e, LineNum) => {
        e.stopPropagation();
        e.preventDefault();
        dispathItem(docEntry, LineNum)
    };

    const commentsToDisplay = Array.isArray(Comments) ? Comments : [];

    return (
        <div className="detalle-orden-container">
            <div className="detalle-cabecera">
                <div className="row mb-3">
                    <h4>{CardCode} - {CardName}</h4>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <p><strong>Referencia:</strong> {ObjType}</p>
                        <p><strong>Comentarios:</strong> {commentsToDisplay.length > 0 ? commentsToDisplay.join(', ') : 'Sin Comentarios'}</p>
                    </div>
                    <div className="col-md-6">
                        <p><strong>Fecha de la Orden:</strong> {new Date(DocDate).toLocaleDateString()}</p>
                        <p><strong>Fecha de Vencimiento:</strong> {new Date(DocDueDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
            {OrderLines.length > 0 ? (
                OrderLines.map((line) => (
                    <div key={line.LineNum} className="item-line border rounded mb-3 p-3">
                        <div className="row" onClick={() => toggleLine(line.LineNum)} style={{ cursor: 'pointer' }}>
                            <div className="col-md-8">
                                <h4>{line.ItemCode} - {line.ItemName}</h4>
                                <div className="row">
                                    <p className="col-md-4"><strong>Almacen:</strong> {line.WhsCode} - Almacen General</p>
                                    <p className="col-md-4"><strong>Stock:</strong> {line.LineTotal}</p>
                                    <p className="col-md-4"><strong>Disponible:</strong> {line.StockDisp}</p>
                                </div>
                            </div>
                            <div className="col-md-2" style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ backgroundColor: line.StockDisp > 0 ? '#008080' : '#FF0000', padding: '.2rem', borderRadius: 5, color: '#fff' }}>
                                    {line.StockDisp > 0 ? 'Disponible' : 'No Disponible'}
                                </span>
                                {/* Botón Entregar */}
                                {line.StatusOF < 1 ?
                                    <Button variant="primary" size="sm" className="ms-2" onClick={(e) => handleEntregarClick(e, line.LineNum)}>
                                        Entregar
                                    </Button> :
                                    ''
                                }
                            </div>
                            <div className="col-md-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {openLines[line.LineNum] ? (
                                    <FaAngleDown className="icon" size={40} />
                                ) : (
                                    <FaAngleRight className="icon" size={40} />
                                )}
                            </div>
                        </div>
                        <Collapse in={openLines[line.LineNum]}>
                            <div className="items-lines-container border-top mt-2 pt-2">
                                {line.ItemsLines && line.ItemsLines.length > 0 ? (
                                    line.ItemsLines.map((item) => (
                                        <div key={item.ChildNum} className="item-detail row border rounded mb-2 p-2">
                                            <div className="col-md-12">
                                                <div className="row">
                                                    <h5>{item.ChildItemCode} - {item.ChilItemName}</h5>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <p><strong>Almacen:</strong> {item.ChilWhareHouse}</p>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <p><strong>Stock:</strong> {item.ChilQuantity}</p>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <p><strong>Disponible:</strong> {item.StockDisp}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay detalles disponibles para este ítem.</p>
                                )}
                            </div>
                        </Collapse>
                    </div>
                ))
            ) : (
                <p>No hay ítems en esta orden.</p>
            )}

            {/* Componente ToastMessage */}
            <ToastMessage
                show={toast.show}
                onClose={() => setToast({ show: false })}
                message={toast.message}
                title={toast.title}
                type={toast.type}
            />
        </div>
    );
};

export default DetalleOrdenDeVenta;

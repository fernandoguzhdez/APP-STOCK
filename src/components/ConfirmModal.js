import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmModal = ({ show, handleClose, handleConfirm, message, title, itemSelected }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message}
                <br />
                <br />
                {title === 'Solicitud de traslado' ?
                    <div>
                        <strong>Almacen de origen: </strong>{itemSelected.WhsCode}
                        <br />
                        <br />
                        <strong>Almacen de destino: </strong>{itemSelected.ToWhsCode}
                        <br />
                        <br />
                        <strong>Cantidad a transferir: </strong>{itemSelected.IssuedQty}
                    </div> : ''
                }

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    Confirmar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;

// src/componentes/ToastMessage.js
import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import './ToastMessage.css';

const ToastMessage = ({ show, onClose, message, title = "Notificación", delay = 6000, type = "success" }) => {
    const headerClass = type === "error" ? "bg-danger text-white" : "bg-success text-white";

    return (
        <ToastContainer className="toast-container p-3">
            <Toast onClose={onClose} show={show} delay={delay} autohide>
                <Toast.Header className={headerClass}>
                    <strong className="me-auto">{title}</strong>
                </Toast.Header>
                <Toast.Body>{message}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default ToastMessage;

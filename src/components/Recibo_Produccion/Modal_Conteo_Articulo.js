import React, { useState, useEffect } from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Modal = ({ isOpen, onClose, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [animationClass, setAnimationClass] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => {
                setAnimationClass('open');
            }, 10); // Pequeño delay para que la clase 'open' se aplique después de montar el modal
        } else {
            setAnimationClass('close');
            setTimeout(() => setIsVisible(false), 300); // Duración de la animación
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div style={modalStyles.overlay}>
            <div className={`modal-content ${animationClass}`} style={modalStyles.modal}>
                <FontAwesomeIcon
                    icon={faTimes}
                    style={modalStyles.closeButton}
                    onClick={onClose}
                />
                {children}
            </div>
            <style jsx>{`
        .modal-content {
          opacity: 0;
          transform: scale(0.7) translateY(-100px);
          transition: opacity 300ms ease, transform 300ms ease;
        }

        .modal-content.open {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .modal-content.close {
          opacity: 0;
          transform: scale(0.7) translateY(-100px);
        }
      `}</style>
        </div>
    );
};

const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px', // Similar a las ventanas de macOS con bordes redondeados
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)', // Sombra suave para dar la sensación de elevación
        maxWidth: '500px',
        width: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#333',
    },
};

export default Modal;

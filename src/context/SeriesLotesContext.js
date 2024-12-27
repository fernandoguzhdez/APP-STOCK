import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import api from '../axiosConfig';

const SeriesLotesContext = createContext();

export const useSeriesLotes = () => {
    return useContext(SeriesLotesContext);
};

export const SeriesLotesProvider = ({ children }) => {
    const [filteredSeriesLotes, setFilteredSeriesLotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedActionType, setSelectedActionType] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [showLocationSelect, setShowLocationSelect] = useState(false);
    const [docSeleccionado, setDocSeleccionado] = useState([])
    const [quantity, setQuantity] = useState(1);
    const [currentItemsDefinidos, setCurrentItemsDefinidos] = useState([]);
    const [filteredItemsDefinidos, setFilteredItemsDefinidos] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [elementoEliminar, setElementoEliminar] = useState({
        index: null,
        docSeleccionado: [],
        doc: null
    })

    const fetchSeriesLotes = async (item) => {
        setCurrentItemsDefinidos([])
        setFilteredItemsDefinidos([])
        setLoading(true)
        try {
            const response = await axios.get(`http://15.204.32.185:900/api/ReciboProduction/Get_SerAndBatchs?IdDocumentCnt=${item.docEntry}&LineNum=${item.docNum}&ItemCode=${item.itemCode}&GestionItem=${item.gestionItem}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // Verifica que response.data.SerialxManbach sea una matriz
            const data = Array.isArray(response.data.SerialxManbach) ? response.data.SerialxManbach : [];
            setCurrentItemsDefinidos(data);
            setFilteredItemsDefinidos(data);
            setLoading(false)
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    const agregarElemento = (newItemName, actionType, selectedWarehouse, selectedLocation, quantity, articulo) => {
        setLoading(true);
        setError(null);

        currentItemsDefinidos.push({
            "baseLineNum": 0,
            "serManLineNum": 0,
            "gestionItem": articulo.gestionItem,
            "itemCode": articulo.itemCode,
            "idCode": newItemName,
            "sysNumber": 0,
            "quantityCounted": Number(quantity),
            "whsCode": selectedWarehouse || articulo.warehouse,
            "binEntry": selectedLocation || articulo.binEntry,
            "binCode": 0,
            "updateDate": articulo.createDate,
            "status": "R",
            "ClaseOp": actionType.slice(0, 1)
        })

        axios
            .put('http://15.204.32.185:900/api/ReciboProduction/Update_RecProduction', {
                "docEntry": articulo.docEntry,
                "itemCode": articulo.itemCode,
                "barCode": articulo.barCode,
                "itemDesc": articulo.prodName,
                "gestionItem": articulo.gestionItem,
                "whsCode": selectedWarehouse || articulo.warehouse,
                "binEntry": selectedLocation || articulo.binEntry,
                "binCode": 0,
                "quantityCounted": articulo.gestionItem == 'I' ? Number(quantity) : Number(articulo.countedQty) + Number(quantity),
                "claseOp": actionType.slice(0, 1),
                "serialandManbach": articulo.gestionItem == 'I' ? [] : currentItemsDefinidos
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then((response) => {
                setShowConfirm(false);
                setAlertType('success');
                setAlertMessage('¡Elemento agregado con éxito!')
                setShowAlert(true);
                setTimeout(() => {
                    setShowAlert(false);
                }, 3000);
                closeModal();
                setLoading(false);
            })
            .catch(error => {
                setShowConfirm(false);
                setAlertType('danger');
                setAlertMessage('Ocurrió un error al intentar agregar el elemento.');
                setShowAlert(true);
                setTimeout(() => {
                    setShowAlert(false);
                }, 3000);
                closeModal();
                setLoading(false);
            });
    }

    const eliminarElemento = (id, articulo) => {
        const newArray = currentItemsDefinidos.filter((elemento, index) => index !== id);
        console.log('ID a eliminar...', articulo)

        axios
            .put('http://15.204.32.185:900/api/ReciboProduction/Update_RecProduction', {
                "docEntry": articulo.docEntry,
                "itemCode": articulo.itemCode,
                "barCode": articulo.barCode,
                "itemDesc": articulo.prodName,
                "gestionItem": articulo.gestionItem,
                "whsCode": articulo.warehouse,
                "binEntry": articulo.binEntry,
                "binCode": 0,
                "claseOp": "",
                "quantityCounted": 1,
                "serialandManbach": newArray
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then((response) => {
                setShowConfirm(false);
                setAlertType('success');
                setAlertMessage('¡Elemento eliminado con éxito!')
                setShowAlert(true);
                setTimeout(() => {
                    setShowAlert(false);
                }, 3000);
                fetchSeriesLotes(articulo)
            })
            .catch(error => {
                setShowConfirm(false);
                setAlertType('danger');
                setAlertMessage('Ocurrió un error al intentar eliminar el elemento.');
                setShowAlert(true);
                setTimeout(() => {
                    setShowAlert(false);
                }, 3000);
            })
    };

    const openModal = () => {
        setIsModalOpen(true);
        setQuantity(0);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    const confirmDelete = () => {
        eliminarElemento(elementoEliminar.index, elementoEliminar.docSeleccionado, elementoEliminar.doc)
    };

    const cerrarDocReciboProd = async (docEntry) => {
        try {
            const response = await axios.post(`http://15.204.32.185:900/api/ReciboProduction/Close?IdCounted=${docEntry}`, { docEntry }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setShowConfirm(false);
            setAlertType('success');
            setAlertMessage('¡Enviado con éxito!')
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        } catch (error) {
            setShowConfirm(false);
            setAlertType('danger');
            setAlertMessage('Ocurrió un error al intentar enviar el documento');
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        } finally {
        }
    }

    return (
        <SeriesLotesContext.Provider value={{
            filteredSeriesLotes,
            setFilteredSeriesLotes,
            fetchSeriesLotes,
            loading,
            setLoading,
            warehouses,
            locations,
            selectedWarehouse,
            showLocationSelect,
            selectedActionType,
            setSelectedActionType,
            selectedLocation,
            setSelectedLocation,
            docSeleccionado,
            setDocSeleccionado,
            quantity,
            setQuantity,
            currentItemsDefinidos,
            setCurrentItemsDefinidos,
            filteredItemsDefinidos,
            setFilteredItemsDefinidos,
            eliminarElemento,
            agregarElemento,
            openModal,
            closeModal,
            isModalOpen,
            setIsModalOpen,
            handleDeleteClick,
            confirmDelete,
            showConfirm,
            setShowConfirm,
            showAlert,
            setShowAlert,
            elementoEliminar,
            setElementoEliminar,
            alertType,
            setAlertType,
            alertMessage,
            setAlertMessage,
            cerrarDocReciboProd
        }}>
            {children}
        </SeriesLotesContext.Provider>
    );
};

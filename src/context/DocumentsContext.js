import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const DocumentsContext = createContext();

export const useDocuments = () => {
    return useContext(DocumentsContext);
};

export const DocumentsProvider = ({ children }) => {
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedActionType, setSelectedActionType] = useState('Completar');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [showLocationSelect, setShowLocationSelect] = useState(false);
    const [actionType, setActionType] = useState();
    const [quantity, setQuantity] = useState(1);
    const [docSeleccionado, setDocSeleccionado] = useState([])
    const [detalleArticulos, setDetalleArticulos] = useState([])
    const [filterDetalleArticulos, setFilterDetalleArticulos] = useState([])
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState(''); // 'success' o 'danger'

    const fetchDocuments = async () => {
        setLoading(true)
        setError(null)
        setDocuments([])
        setFilteredDocuments([])
        try {
            const response = await axios.get('http://15.204.32.185:900/api/ReciboProduction/Get_OrdersProductions', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setLoading(false)
            setDocuments(response.data.owor);
            setFilteredDocuments(response.data.owor);
        } catch (error) {
            setError(error);
            setAlertType('danger');
            setAlertMessage('Ocurrió un error al intentar obtener los datos' + ' ---> ' + error.message);
            console.log('error', error)
        } finally {
            setLoading(false)
        }
    };

    const filterDocuments = (searchTerm) => {
        if (!searchTerm) {
            setFilteredDocuments(documents);
        } else {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            const filtered = documents.filter(doc =>
                (doc.docNum && String(doc.docNum).toLowerCase().includes(lowercasedSearchTerm)) ||
                (doc.prodName && doc.prodName.toLowerCase().includes(lowercasedSearchTerm))
            );
            setFilteredDocuments(filtered);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const response = await axios.get('http://15.204.32.185:900/api/Inventory/Get_WhareHouse', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = response.data.owhs;
            setWarehouses(data);

            // Determina si hay bins y muestra el ComboBox de ubicaciones
            const hasBins = data.some(wh => wh.bins);
            setShowLocationSelect(hasBins);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    const handleWarehouseChange = (whCode) => {
        setSelectedWarehouse(whCode);
        const warehouse = warehouses.find(wh => wh.whsCode === whCode);
        setLocations(warehouse ? warehouse.bins : []);
    };

    const handleActionTypeChange = (ActionType) => {
        setSelectedActionType(ActionType);
    };

    const handleLocationChange = (location) => {
        setSelectedLocation(location)
        console.log('Ubicacion...', location)
    }

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            setQuantity(value);
        }
    };

    const incrementQuantity = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    const decrementQuantity = () => {
        setQuantity(prevQuantity => (prevQuantity > 0 ? prevQuantity - 1 : 0));
    };

    const verDetalle = async (docEntry) => {
        setFilterDetalleArticulos([])
        setDetalleArticulos([])
        setLoading(true)
        try {
            const response = await axios.get(`http://15.204.32.185:900/api/Production/Get_Details?IdDocumentCnt=${docEntry}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Datos de los detalles...', response.data.owor[0].items)
            setFilterDetalleArticulos(response.data.owor[0].items)
            setDetalleArticulos(response.data.owor[0].items)
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false)
        }
    }


    return (
        <DocumentsContext.Provider value={{
            fetchDocuments,
            documents,
            filteredDocuments,
            loading,
            setLoading,
            error,
            filterDocuments,
            fetchWarehouses,
            warehouses,
            locations,
            selectedWarehouse,
            showLocationSelect,
            handleWarehouseChange,
            handleActionTypeChange,
            selectedActionType,
            setSelectedActionType,
            selectedLocation,
            setSelectedLocation,
            handleLocationChange,
            quantity,
            setQuantity,
            handleQuantityChange,
            incrementQuantity,
            decrementQuantity,
            docSeleccionado,
            setDocSeleccionado,
            verDetalle,
            filterDetalleArticulos,
            setFilterDetalleArticulos,
            detalleArticulos,
            setDetalleArticulos,
            alertMessage,
            setAlertMessage,
            alertType,
            setAlertType,
        }}>
            {children}
        </DocumentsContext.Provider>
    );
};

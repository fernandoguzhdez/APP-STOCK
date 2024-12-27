// src/context/PlaneacionContext.js
import React, { createContext, useState } from 'react';
import api from '../axiosConfig';

export const PlaneacionContext = createContext();

export const PlaneacionProvider = ({ children }) => {
    // VARIABLES GLOBALES
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', title: '', type: '' });
    const [showModalConfirm, setShowModalConfirm] = useState(false)
    const [tituloConfirm, setTituloConfirm] = useState(null)
    const [mensajeConfirm, setMensajeConfirm] = useState(null)
    // ORDENES DE VENTA
    const [salesOrders, setSalesOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState(null);
    // ORDENES DE PRODUCCION
    const [prodOrders, setProdOrders] = useState([]);
    const [prodOrderDetails, setProdOrderDetails] = useState(null);
    const [tarimasLinners, setTarimasLinners] = useState([])
    // PROVEEDORES
    const [providers, setProviders] = useState([]);
    //AUTORIZACIONES
    const [autorizaciones, setAutorizaciones] = useState([])
    //MACHINES
    const [machines, setMachines] = useState([])

    const showToast = (message, type) => {
        const title = type === "error" ? "Error" : "Éxito";
        setToast({ show: true, message, title, type });
        setTimeout(() => setToast({ show: false, message: '', title: '', type: '' }), 6000);
    };

    // ORDENES DE VENTA - DOCUMENTOS
    const fetchSalesOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/SalesOrder/GetSalesOrders_Details');
            setSalesOrders(response.data);
        } catch (error) {
            console.error("Error al cargar las órdenes de venta:", error);
        } finally {
            setLoading(false);
        }
    };

    // ORDENES DE VENTA - ENTREGAR
    const dispathItem = async (DocEntry, LineNum) => {
        console.log('dispath...', DocEntry, LineNum)
        setLoading(true)
        try {
            const response = await api.post(`/api/SalesOrder/Update_Order_DeliberyOrProduction?DocEntry=${DocEntry}&LineNum=${LineNum}`);
            if (response.data.isError === true) return showToast(response.data.message, "success")
            if (response.data.isError === false) return showToast(response.data.message, "error")
            console.log(response.data)
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al obtener los detalles de la orden.";
            console.log("Error:", errorMessage);
            showToast(errorMessage, "error");
        } finally {
            fetchSalesOrders()
            setLoading(false)
        }
    };

    // ORDENES DE VENTA - ARTICULOS
    const fetchOrderDetails = async (docEntry) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/SalesOrder/Get_SalesOrder_Lines?DocEntry=${docEntry}`);
            setOrderDetails(response.data);
        } catch (error) {
            console.error("Error fetching order details:", error);
            setOrderDetails(null);
        } finally {
            setLoading(false);
        }
    };

    //ORDENES DE VENTA - ENVIAR A RUTA
    const enviarEnRuta = async (DocEntry, LineNum) => {
        setLoading(true);
        try {
            const response = await api.post(`/api/SalesOrder/Update_Order_Delivery?DocEntry=${DocEntry}&LineNum=${LineNum}&Status=L`);
            if (response.data.isError) {
                showToast(response.data.message, "error");
            } else {
                showToast(response.data.message, "success");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al enviar a ruta.";
            console.error("Error:", errorMessage);
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
            fetchSalesOrders()
        }
    }

    // ORDENES DE PRODUCCION - DOCUMENTOS
    const fetchProdOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/ProductionOrders/Get_Production_Orders');
            setProdOrders(response.data);
            console.log(response.data)
        } catch (error) {
            console.error("Error al cargar las órdenes de produccion:", error);
        } finally {
            setLoading(false);
        }
    };

    // ORDENES DE PRODUCCION - ARTICULOS
    const fetchProdOrderDetails = async (docEntry) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/ProductionOrders/Get_Production_Orders_Lines?DocEntry=${docEntry}`);
            setProdOrderDetails(response.data);
            console.log('Get_Production_Orders_Lines', response.data)
        } catch (error) {
            console.error("Error fetching order details:", error);
            setProdOrderDetails(null);
        } finally {
            setLoading(false);
        }
    };

    // ORDENES DE PRODUCCION - DOCUMENTOS - CAMBIAR ESTADO
    const handleChangeStatus = async (e, DocEntry, ItemCode, Status) => {
        console.log('Estado.....',Status === 'P' ? 'R' : Status === 'R' ? 'L' : Status === 'L' ? 'R' : '')
        setLoading(true)
        try {
            const response = await api.patch(`/api/ProductionOrders/Status_OrderProduction?DocEntry=${DocEntry}&Satus=${Status === 'P' ? 'R' : Status === 'R' ? 'L' : Status === 'L' ? 'R' : ''}&ItemCode=${ItemCode}`);
            showToast("Se cambió el estado exitosamente", "success");
            console.log(response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al cambiar el estado.";
            console.log("Error:", errorMessage);
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
            fetchProdOrders();
            fetchProdOrderDetails(DocEntry)
        }
    };

    // PROVEEDORES - CARGAR LISTA DE PROVEEDORES
    const fetchProviders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/MasterData/Get_BusinessPartners?Type=S');
            setProviders(response.data);
        } catch (error) {
            console.error("Error al cargar los proveedores:", error);
            showToast("Error al cargar los proveedores", "error");
        } finally {
            setLoading(false);
        }
    };

    // En src/context/PlaneacionContext.js
    const addPurchaseOrder = async (formData) => {
        setLoading(true);
        try {
            const response = await api.post('/api/PurchaseOrders/Add_DrafPurchaseRequest', formData);
            if (response.data.isError) {
                showToast(response.data.message, "error");
            } else {
                showToast("Solicitud de compra creada exitosamente", "success");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al agregar la solicitud de compra.";
            console.error("Error:", errorMessage);
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    // Método para obtener documentos para autorizaciones
    const fetchAutorizaciones = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/Get_Auth_Documents');
            setAutorizaciones(response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al cargar las autorizaciones.";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    //Metodo para autorizar o rechazar documentos
    const handleDocumentsAuthorize = async (doc, permiso) => {
        console.log('datos...', {
            "Code": doc.Code,
            "U_ItemCode": doc.ItemCode,
            "U_CardCode": doc.CardCode,
            "U_Quantity": doc.Quantity,
            "U_DocOP": doc.DocOP,
            "U_PathFile": doc.U_PathFile,
            "U_LineNumOP": doc.U_LineNumOP,
            "U_ObjType": doc.ObjType,
            "StatusAut": permiso
        })
        setLoading(true);
        try {
            const response = await api.post('/api/PurchaseOrders/DocumentsAuthorize',
                {
                    "Code": doc.Code,
                    "U_ItemCode": doc.ItemCode,
                    "U_CardCode": doc.CardCode,
                    "U_Quantity": doc.Quantity,
                    "U_DocOP": doc.DocOP,
                    "U_PathFile": doc.U_PathFile,
                    "U_LineNumOP": doc.U_LineNumOP,
                    "U_ObjType": doc.ObjType,
                    "StatusAut": permiso
                }
            );
            if (response.data.isError) {
                showToast(response.data.message, "error");
            } else {
                showToast(response.data.message, "success");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al enviar a ruta.";
            console.error("Error:", errorMessage);
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    }

    // METODO PARA OBTENER LAS MAQUINAS
    const fetchGetMachines = async (itemCode) => {
        console.log('itemCode para obtener maquinas...', itemCode)
        setLoading(true);
        try {
            const response = await api.get(`/api/MasterData/Get_Machine?ItemCode=${itemCode}`);
            setMachines(response.data);
            console.log('Machines...', machines)
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al cargar las maquinas.";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    // ORDENES DE PRODUCCION - AGREGAR MAQUINA
    const addMachine = async (machineSelected, docEntry) => {
        console.log('agregar...', {
            "ItemNo": machineSelected.VisResCode,
            "ItemType": "290",
            "PlannedQuantity": machineSelected.Quantity,
            "Warehouse": machineSelected.WhareHose
        })
        setLoading(true)
        try {
            const response = await api.patch(`/api/ProductionOrders/Add_MachineOrUpdate?DocEntry=${docEntry}&Status=0`,
                {
                    "ItemNo": machineSelected.VisResCode,
                    "ItemType": "290",
                    "PlannedQuantity": machineSelected.Quantity,
                    "Warehouse": machineSelected.WhareHose
                }
            );
            showToast("Se agrego exitosamente", "success");
            console.log(response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al agregar elemento";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
            fetchProdOrderDetails(docEntry)
        }
    };

    // ORDENES DE PRODUCCION - AGREGAR TARIMA O LINNER
    const addTarimaLinner = async (machineSelected, docEntry) => {
        console.log('agregar...', {
            "ItemNo": machineSelected.VisResCode,
            "ItemType": "290",
            "PlannedQuantity": machineSelected.Quantity,
            "Warehouse": machineSelected.WhareHose
        })
        setLoading(true)
        try {
            const response = await api.patch(`/api/ProductionOrders/Add_MachineOrUpdate?DocEntry=${docEntry}&Status=0`,
                {
                    "ItemNo": machineSelected.ItemCode,
                    "ItemType": "4",
                    "PlannedQuantity": machineSelected.Quantity,
                    "Warehouse": machineSelected.WhareHose
                }
            );
            showToast("Se agrego exitosamente", "success");
            console.log(response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al agregar elemento";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
            fetchProdOrderDetails(docEntry)
        }
    };

    // ORDENES DE PRODUCCION - ACTUALIZAR MAQUINA
    const updateMachine = async (machineSelected, docEntry, maquinaActualizar) => {
        console.log('actualizar maquina...', machineSelected, docEntry)
        setLoading(true)
        try {
            const response = await api.patch(`/api/ProductionOrders/Add_componentsOrUpdate?DocEntry=${docEntry}&Status=1`,
                {
                    "ItemNo": machineSelected.VisResCode,
                    "ItemType": "290",
                    "PlannedQuantity": machineSelected.Quantity,
                    "Warehouse": machineSelected.WhareHose,
                    "LineNumReplace": maquinaActualizar.LineNum
                }
            );
            showToast("Se actualizo exitosamente", "success");
            console.log(response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al actualizar elemento";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
            fetchProdOrderDetails(docEntry)
        }
    };

    // ORDENES DE PRODUCCION - ACTUALIZAR TARIMA Y LINNER
    const updateTarimaLinner = async (machineSelected, docEntry, maquinaActualizar) => {
        console.log('actualizar tarima y linner...', machineSelected, docEntry, maquinaActualizar)
        setLoading(true)
        try {
            const response = await api.patch(`/api/ProductionOrders/Add_componentsOrUpdate?DocEntry=${docEntry}&Status=1`,
                {
                    "ItemNo": machineSelected.ItemCode,
                    "ItemType": "4",
                    "PlannedQuantity": machineSelected.Quantity,
                    "Warehouse": machineSelected.WhareHose,
                    "LineNumReplace": maquinaActualizar.LineNum
                }
            );
            showToast("Se actualizo exitosamente", "success");
            console.log(response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al actualizar elemento";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
            fetchProdOrderDetails(docEntry)
        }
    };

    //METODO PARA ACTUALIZAR LOS CAMPOS (TARIMAS, ROLLOS Y METODO DE IMPRESION)
    const actualizarCampos = async (tarimas, rollos, metodoImpresion, docEntry) => {
        console.log('campos...', tarimas, rollos, metodoImpresion, docEntry)
        try {
            const response = await api.patch(`/api/ProductionOrders/PalletOrRollos?DocEntry=${docEntry}&Pallet=${tarimas || 0}&Rollo=${rollos || 0}&Etiqueta=${metodoImpresion || null}`);
        } catch (error) {
            showToast(error, "error al actualizar tarimas, rollos y metodo de impresion");
        } finally {
        }
    }

    //METODO PARA CARGAR TARIMAS Ó LINNER
    const cargarListadoTarimasLinners = async (GroupCode) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/MasterData/Get_Components?GroupCode=${GroupCode}`);
            setTarimasLinners(response.data);
            console.log('GroupCode...', response.data)
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al cargar listado.";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <PlaneacionContext.Provider value={{
            // VARIABLES GLOBALES
            loading,
            toast,
            setToast,
            showModalConfirm,
            setShowModalConfirm,
            tituloConfirm,
            setTituloConfirm,
            mensajeConfirm,
            setMensajeConfirm,
            // ORDENES DE VENTA
            fetchSalesOrders,
            fetchOrderDetails,
            salesOrders,
            orderDetails,
            dispathItem,
            enviarEnRuta,
            // ORDENES DE PRODUCCION
            fetchProdOrders,
            fetchProdOrderDetails,
            prodOrders,
            prodOrderDetails,
            handleChangeStatus,
            actualizarCampos,
            cargarListadoTarimasLinners,
            tarimasLinners,
            // PROVEEDORES
            fetchProviders,
            providers,
            addPurchaseOrder,
            //AUTHORIZACIONES
            fetchAutorizaciones,
            autorizaciones,
            handleDocumentsAuthorize,
            //MACHINES
            fetchGetMachines,
            machines,
            addMachine,
            addTarimaLinner,
            updateMachine,
            updateTarimaLinner
        }}>
            {children}
        </PlaneacionContext.Provider>
    );
};

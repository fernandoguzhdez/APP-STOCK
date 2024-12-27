import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import api from '../axiosConfig';
import * as signalR from "@microsoft/signalr";

export const ProduccionContext = createContext();

export const ProduccionProvider = ({ children }) => {
    //VARIABLES GLOBALES
    const [loading, setLoading] = useState(false);
    const currentDate = new Date();
    const [toast, setToast] = useState({ show: false, message: '', title: '', type: '' });
    const [showModalConfirm, setShowModalConfirm] = useState(false)
    const [tituloConfirm, setTituloConfirm] = useState(null)
    const [mensajeConfirm, setMensajeConfirm] = useState(null)
    const [loadingSimple, setLoadingSimple] = useState(false)
    //VARIABLES ORDENES DE PRODUCCION - COMPONENTES
    const [prodOrdersComponents, setProdOrdersComponents] = useState([])
    //VARIABLES ORDENES DE PRODUCCION - WPS
    const [prodOrdersWps, setProdOrdersWps] = useState([])
    const [weight, setWeight] = useState(null); // Estado para el peso actual.
    const [connection, setConnection] = useState(null);
    const [error, setError] = useState(null);
    const [basculas, setBasculas] = useState([])
    const [opcionesBasculas, setOpcionesBasculas] = useState([]);
    const [impresoras, setImpresoras] = useState([])
    const [opcionesImpresoras, setOpcionesImpresoras] = useState([]);
    const [orderProdPallet, setOrderProdPallet] = useState([])
    const [mermas, setMermas] = useState([])
    const [timeStop, setTimeStop] = useState([])
    const [incidenciasTimeStop, setIncidenciasTimeStop] = useState([])
    const [incidencia, setIncidencia] = useState(null)
    const [fechaInicio, setFechaInicio] = useState(null)
    const [fechaFin, setFechaFin] = useState(null)
    const [horaInicio, setHoraInicio] = useState("00:00")
    const [horaFin, setHoraFin] = useState("00:00")
    const [comentariosInicio, setComentariosInicio] = useState(null)
    const [comentariosFin, setComentariosFin] = useState(null)
    const [kiloPorHora, setKiloPorHora] = useState(0)
    const [tiempo, setTiempo] = useState("0.0")
    const [kilosParo, setKilosParo] = useState(0)


    const showToast = (message, type) => {
        const title = type === "error" ? "Error" : "Éxito";
        setToast({ show: true, message, title, type });
        setTimeout(() => setToast({ show: false, message: '', title: '', type: '' }), 6000);
    };

    // ORDENES DE PRODUCCION - COMPONENTES
    const fetchProdOrderComponents = async (docEntry) => {
        console.log('fetchProdOrderComponents...', docEntry)
        setLoading(true);
        try {
            const response = await api.get(`/api/ProductionOrders/Production_Orders_Components?DocEntry=${docEntry}`);
            setProdOrdersComponents(response.data);
        } catch (error) {
            setProdOrdersComponents(null);
        } finally {
            setLoading(false);
        }
    };

    //ORDENES DE PRODUCCION - COMPONENTES - SOLICITUD DE TRASLADO
    const ProdOrderComponentsTraslado = async (orderLineSelected, docEntry) => {
        setLoading(true);
        console.log({
            "ItemCode": orderLineSelected.ItemCode,
            "Quantity": orderLineSelected.IssuedQty,
            "FromWhsCode": orderLineSelected.WhsCode,
            "ToWhsCode": orderLineSelected.ToWhsCode,
            "DocDate": currentDate.toLocaleDateString("en-CA"),
            "EntryOP": orderLineSelected.DocEntry
        });
        try {
            const response = await api.post('/api/SolStockTrasfer/Add_SolStockTransfer', {
                "ItemCode": orderLineSelected.ItemCode,
                "Quantity": orderLineSelected.IssuedQty,
                "FromWhsCode": orderLineSelected.WhsCode,
                "ToWhsCode": orderLineSelected.ToWhsCode,
                "DocDate": currentDate.toLocaleDateString("en-CA"),
                "EntryOP": orderLineSelected.DocEntry
            });
            console.log(response)
            if (response.data.isError === false) return showToast(response.data.message, "success")
            if (response.data.isError === true) return showToast(response.data.message, "error")
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al realizar la solicitud de traslado.";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
            fetchProdOrderComponents(docEntry)
        }
    };

    //ORDENES DE PRODUCCION - COMPONENTES - MEZCLA
    const ProdOrderComponentsMezcla = async (orderLineSelected, docEntry) => {
        setLoading(true);
        try {
            const response = await api.post('/api/ProductionOrders/Production_Order_Mix', {
                "ItemCode": orderLineSelected.ItemCode,
                "Quantity": orderLineSelected.IssuedQty,
                "WhsCode": orderLineSelected.WhsCode,
                "DocDate": currentDate.toLocaleDateString("es-MX"),
                "EntryFthOP": orderLineSelected.DocEntry
            });
            if (response.data.isError === true) return showToast(response.data.message, "success")
            if (response.data.isError === false) return showToast(response.data.message, "error")
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error en mezcla";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
            fetchProdOrderComponents(docEntry)
            setTituloConfirm(null)
        }
    };

    //ORDENES DE PRODUCCION - WPS
    const fetchProdOrderWps = async (docEntry) => {
        try {
            const response = await api.get(`/api/ProductionOrders/WPS_Pallets?DocEntry=${docEntry}`);
            console.log('Pallets...', response.data)
            setProdOrdersWps(response.data || []);
        } catch (error) {
            setProdOrdersWps([]); // Manejo de errores: estado vacío.
            const errorMessage = error.response?.data?.message || "Error al obtener WPS";
            showToast(errorMessage, "error");
        } finally {
        }
    };

    const fetchPesoBascula = () => {
        const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://15.204.32.185:8069/basculahub") // URL del hub SignalR.
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setConnection(hubConnection);

        hubConnection
            .start()
            .then(() => {
                console.log("Conexión establecida con SignalR.");

                // Suscripción al evento de peso.
                hubConnection.on("ReceiveWeight", (newWeight) => {
                    console.log("Peso recibido:", newWeight);
                    setWeight(newWeight); // Actualizar estado.
                });

                setLoading(false); // Marcar como cargado.
            })
            .catch((err) => {
                console.error("Error al conectar con SignalR:", err);
                setError(err.message);
            });
    }

    const fetchBasculas = async () => {
        try {
            const response = await api.get('/api/basculas/PesosPorBascula');

            // Convertir datos a formato compatible con react-select
            const opcionesFormateadas = response.data.map((bascula) => ({
                value: bascula.IdBascula,
                label: `${bascula.IdBascula} - ${bascula.Name}`,
            }));
            setBasculas(response.data);
            setOpcionesBasculas(opcionesFormateadas);
        } catch (error) {
            showToast(error, "error");
        }
    };

    const fetchImpresoras = async () => {
        try {
            const response = await api.get('/api/basculas/Impresoras');
            console.log('impresoras...', response.data)

            const opcionesFormateadas = response.data.map((impresora) => ({
                value: impresora.PrintCode,
                label: `${impresora.PrintCode} - ${impresora.PrintName}`,
            }));

            setImpresoras(response.data);
            setOpcionesImpresoras(opcionesFormateadas);

        } catch (error) {
            showToast(error, "error");
        }
    };

    const fetchIdPallet = async () => {
        try {
            const response = await api.get('/api/pallets/Pallets');
            showToast(`Pallet: ${response.data.entryObject}`, "success")
            setOrderProdPallet(response.data);
            localStorage.setItem('IdPallet', response.data.entryObject);
        } catch (error) {
            setOrderProdPallet(null);
            showToast(error, "error");
        } finally {
        }
    }

    const guardarRegistroLectura = async (prodOrdersComponents, lecturaBascula, piezas, supervisorSeleccionado, basculaSeleccionado, impresoraSeleccionado) => {
        setLoading(true)
        const fechaActual = new Date();
        const fecha = fechaActual.toLocaleDateString('en-CA');
        const hora = fechaActual.toLocaleTimeString('es-ES');

        console.log('Guardando.....', {
            "itemCode": prodOrdersComponents.ItemCode,
            "fechaIncome": fecha,
            "timeIncome": hora,
            "quantity": Number(piezas),
            "unitMsr": "KG",
            "numPack": 0,
            "serialOrBatch": "",
            "netWeight": Number(lecturaBascula),
            "grossWeight": Number(lecturaBascula),
            "employe": Number(supervisorSeleccionado.value),
            "idScales": basculaSeleccionado.value,
            "print": impresoraSeleccionado.value,
            "entryOf": Number(prodOrdersComponents.DocEntry),
            "IdPallet": localStorage.getItem('IdPallet')
        })

        try {
            const response = await api.post('/api/pallets/PalletsLines', {
                "itemCode": prodOrdersComponents.ItemCode,
                "fechaIncome": fecha,
                "timeIncome": hora,
                "quantity": Number(piezas),
                "unitMsr": "KG",
                "numPack": 0,
                "serialOrBatch": "",
                "netWeight": Number(lecturaBascula),
                "grossWeight": Number(lecturaBascula),
                "employe": Number(supervisorSeleccionado.value),
                "idScales": basculaSeleccionado.value,
                "print": impresoraSeleccionado.value,
                "entryOf": Number(prodOrdersComponents.DocEntry),
                "IdPallet": localStorage.getItem('IdPallet')
            });

            showToast(response.data.message, "success")
        } catch (error) {

            showToast(error.message, "error");
        } finally {
            fetchProdOrderWps(prodOrdersComponents.DocEntry)
            setLoading(false)
        }
    }

    const cerrarPallet = async (docEntry) => {
        const idPallet = localStorage.getItem('IdPallet');
        try {
            const response = await api.put(`/api/pallets/Close_Pallets?IdPallet=${idPallet}`);
            showToast(response.data.message, "success")
            imprimirPallet(idPallet, docEntry)
        } catch (error) {
            showToast(error.message, "error");
        } finally {
        }
    }

    const imprimirPallet = async (idPallet, docEntry) => {
        try {
            const response = await api.post(`/api/ProductionOrders/Print_Pallet?EntryOf=${docEntry}&xPallet=${idPallet}`);
        } catch (error) {
            showToast(error.message, "error");
        } finally {
        }
    }

    const eliminarPallet = async (order) => {
        setLoading(true)
        try {
            const response = await api.get(`/api/ProductionOrders/WPS_DeleteLine_Pallet?EntryOf=${order.U_EntryOf}&DocEntry=${order.DocEntry}&IdLine=${order.IdLine}`);
            showToast(response.data.message, "error");
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setLoading(false)
            fetchProdOrderWps(order.DocEntry)
        }
    }

    const fetchListadoMerma = async (DocEntry) => {
        try {
            const response = await api.get(`/api/Decrease/Decrease?DocEntry=${DocEntry}`);
            setMermas(response.data)
        } catch (error) {
            showToast("Error al cargar listado de merma", "error");
        } finally {
        }
    }

    const agregarMerma = async (supervisorSeleccionado, tipoMermaSeleccionada, docEntry, pesoMerma) => {
        setLoading(true)
        const usuario = JSON.parse(localStorage.getItem('authorization'));
        try {
            const response = await api.post('/api/Decrease/Decrease', {
                "employe": supervisorSeleccionado.value,
                "dreaseType": tipoMermaSeleccionada.value,
                "userId": usuario.idUsuario,
                "entryOf": docEntry,
                "weight": pesoMerma
            });

            showToast(response.data.message, "success")
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setLoading(false)
            fetchListadoMerma(docEntry)
        }
    }

    const fetchTimeStop = async (docEntry) => {
        console.log('time Stop...', docEntry)
        try {
            const response = await api.get(`/api/ProductionOrders/WPS_TimeStop?DocEntry=${docEntry}`);
            console.log('Listado de timeStop...', response.data)
            setTimeStop(response.data)
        } catch (error) {
            showToast("Error al cargar el timeStop", "error");
        } finally {
        }
    }

    const guardarTiempoMuerto = async (docEntry, selectedProcess, maquinaTMSeleccionada, kiloPorHora, motivoTMSeleccionado, fechaInicio, fechaFin, horaInicio, horaFin, comentariosInicio, comentariosFin, tiempo, kilosParo) => {
        setLoading(true)

        const usuario = JSON.parse(localStorage.getItem('authorization'));

        console.log('Guardando tiempo muerto...', {
            "EntryOf": Number(docEntry),
            "u_IdTime": motivoTMSeleccionado.value,
            "u_NameTime": motivoTMSeleccionado.label,
            "u_IdProcess": selectedProcess,
            "u_Machine": maquinaTMSeleccionada.value,
            "u_WeightForHour": kiloPorHora,
            "u_DateStart": fechaInicio,
            "u_TimeStart": horaInicio,
            "u_DateEnd": fechaFin,
            "u_TimeEnd": horaFin,
            "U_RemarksStart": comentariosInicio,
            "U_RemarksEnd": comentariosFin,
            "u_TotalTime": tiempo,
            "u_WeightStop": kilosParo,
            "u_Status": "O",
            "u_UserId": usuario.idUsuario,
        })

        try {
            const response = await api.post('/api/ProductionOrders/WPS_TimeStop',
                {
                    "EntryOf": docEntry,
                    "u_IdTime": motivoTMSeleccionado.value,
                    "u_NameTime": motivoTMSeleccionado.label,
                    "u_IdProcess": selectedProcess,
                    "u_Machine": maquinaTMSeleccionada.value,
                    "u_WeightForHour": kiloPorHora,
                    "u_DateStart": fechaInicio,
                    "u_TimeStart": horaInicio,
                    "u_DateEnd": fechaFin,
                    "u_TimeEnd": horaFin,
                    "U_RemarksStart": comentariosInicio,
                    "U_RemarksEnd": comentariosFin,
                    "u_TotalTime": tiempo,
                    "u_WeightStop": kilosParo,
                    "u_Status": "O",
                    "u_UserId": usuario.idUsuario,
                })
            showToast(response.data.message, "success")
            console.log('Exito...', response.data)
            fetchIncidenciasTimeStop(docEntry)
        } catch (error) {
            console.log('Error...', error)
            setLoading(false)
            showToast(error.message, "error");
        } finally {
            setLoading(false)
            setIncidencia(null)
        }
    }

    const fetchIncidenciasTimeStop = async (DocEntry) => {
        console.log('cargar tabla de incidencias...', DocEntry)
        setIncidenciasTimeStop([])
        try {
            const response = await api.get(`/api/ProductionOrders/WPS_TimeStop?DocEntry=${DocEntry}`);
            console.log('Listado de paro de maquina...', response.data)
            setIncidenciasTimeStop(response.data)
        } catch (error) {
            showToast("Error al cargar el listado de paro de maquina", "error");
        } finally {
        }
    }

    const eliminarIncidencia = async (incidencia, docEntry) => {
        setLoading(true)
        try {
            const response = await api.patch(`/api/ProductionOrders/WPS_Line_UpdateStatus?DocEntry=${incidencia.DocEntry}&IdLine=${incidencia.LineId}`);
            console.log('Eliminado con exito...', response.data)
            showToast('Registro eliminado exitosamente', "success")

        } catch (error) {
            showToast('Error al intentar eliminar registro', "error");
        } finally {
            setLoading(false)
            fetchIncidenciasTimeStop(docEntry)
            setIncidencia(null)
        }
    }

    const actualizarTiempoMuerto = async (docEntry, selectedProcess, maquinaTMSeleccionada, kiloPorHora, motivoTMSeleccionado, fechaInicio, fechaFin, horaInicio, horaFin, comentariosInicio, comentariosFin, tiempo, kilosParo) => {
        const usuario = JSON.parse(localStorage.getItem('authorization'));
        setLoading(true)
        console.log('Actualizando...', {
            "DocEntry": incidencia.DocEntry,
            "EntryOf": incidencia.EntryOf,
            "LineId": incidencia.LineId,
            "u_IdTime": motivoTMSeleccionado.value,
            "u_IdProcess": selectedProcess,
            "u_Machine": maquinaTMSeleccionada.value,
            "u_WeightForHour": kiloPorHora,
            "u_DateStart": fechaInicio,
            "u_TimeStart": horaInicio,
            "u_DateEnd": fechaFin,
            "u_TimeEnd": horaFin,
            "U_RemarksStart": comentariosInicio,
            "U_RemarksEnd": comentariosFin,
            "u_TotalTime": tiempo,
            "u_WeightStop": kilosParo,
            "u_Status": "O",
            "u_UserId": usuario.idUsuario
        })
        try {
            const response = await api.patch(`/api/ProductionOrders/WPS_TimeStop`, {
                "DocEntry": docEntry,
                "EntryOf": incidencia.EntryOf,
                "LineId": incidencia.LineId,
                "u_IdTime": motivoTMSeleccionado.value,
                "u_IdProcess": selectedProcess,
                "u_Machine": maquinaTMSeleccionada.value,
                "u_WeightForHour": kiloPorHora,
                "u_DateStart": fechaInicio,
                "u_TimeStart": horaInicio,
                "u_DateEnd": fechaFin,
                "u_TimeEnd": horaFin,
                "U_RemarksStart": comentariosInicio,
                "U_RemarksEnd": comentariosFin,
                "u_TotalTime": tiempo,
                "u_WeightStop": kilosParo,
                "u_Status": "O",
                "u_UserId": usuario.idUsuario
            })

            console.log('Actualizado con exito...', response.data)
            showToast('Registro actualizado exitosamente', "success")
            fetchIncidenciasTimeStop(docEntry)

        } catch (error) {
            showToast(`Error al intentar actualizar: ${error.response?.data?.message || error.message}`, "error");
            console.log('Error al actualizar incidencia...', error)
        } finally {
            setLoading(false)
            fetchIncidenciasTimeStop(docEntry)
            setIncidencia(null)
        }
    }


    return (
        <ProduccionContext.Provider value={{
            toast,
            setToast,
            loading,
            loadingSimple,
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
            guardarRegistroLectura,
            //WPS
            fetchProdOrderWps,
            prodOrdersWps,
            fetchPesoBascula,
            fetchBasculas,
            basculas,
            opcionesBasculas,
            setOpcionesBasculas,
            fetchImpresoras,
            impresoras,
            opcionesImpresoras,
            fetchIdPallet,
            orderProdPallet,
            setOrderProdPallet,
            cerrarPallet,
            fetchListadoMerma,
            mermas,
            agregarMerma,
            fetchTimeStop,
            timeStop,
            guardarTiempoMuerto,
            incidenciasTimeStop,
            fetchIncidenciasTimeStop,
            eliminarIncidencia,
            incidencia,
            setIncidencia,
            eliminarPallet,
            actualizarTiempoMuerto,
            fechaInicio,
            setFechaInicio,
            fechaFin,
            setFechaFin,
            horaInicio,
            setHoraInicio,
            horaFin,
            setHoraFin,
            comentariosInicio,
            setComentariosInicio,
            comentariosFin,
            setComentariosFin,
            kiloPorHora,
            setKiloPorHora,
            tiempo,
            setTiempo,
            kilosParo,
            setKilosParo
        }}>
            {children}
        </ProduccionContext.Provider>
    );
};

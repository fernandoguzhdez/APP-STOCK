import React, { useContext, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import './Produccion.css';
import Table from 'react-bootstrap/Table';
import '../pages/About.css';

const About = () => {
    const { logout } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const [tareas, setTareas] = useState([
        { id: 1, text: 'Hacer la tarea numero 1', completed: false },
        { id: 2, text: 'Hacer la tarea numero 2', completed: false },
        { id: 3, text: 'Hacer la tarea numero 3', completed: true },
        { id: 4, text: 'Hacer la tarea numero 4', completed: true },
        { id: 5, text: 'Hacer la tarea numero 5', completed: false },
        { id: 6, text: 'Hacer la tarea numero 6', completed: true },
        { id: 7, text: 'Hacer la tarea numero 7', completed: false },
    ]);
    const [tarea, setTarea] = useState('');

    const crearTarea = () => {
        setTareas([...tareas, {
            id: tareas.length + 1,
            text: tarea,
            completed: false
        }]);
        setTarea('');
    };

    const eliminarTarea = (id) => {
        const tareaIndex = tareas.findIndex(t => t.id === id);
        
        const newTareas = [...tareas];
        newTareas[tareaIndex].isDeleting = true;

        setTareas(newTareas);

        setTimeout(() => {
            setTareas(tareas.filter(t => t.id !== id));
        }, 500);
    };

    return (
        <div>
            <div className="table-container">
                <h1>Recibo de Producción</h1>
                <div className="form-group w-25 mx-3">
                    <input 
                        type="text" 
                        className="form-control" 
                        value={tarea} 
                        placeholder="Ingresa una nueva tarea" 
                        onChange={(text) => setTarea(text.target.value)} 
                    />
                </div>
                <button type="submit" className="btn btn-primary w-auto" onClick={crearTarea}>Agregar</button>
                <Table striped bordered hover className="mt-4 styled-table">
                    <thead style={{backgroundColor: 'red'}}>
                        <tr>
                            <th style={{backgroundColor: 'lightseagreen', color: '#ffff'}}>N° Tarea</th>
                            <th style={{backgroundColor: 'lightseagreen', color: '#ffff'}}>Descripcion de la tarea</th>
                            <th style={{backgroundColor: 'lightseagreen', color: '#ffff'}}>Estado</th>
                            <th style={{backgroundColor: 'lightseagreen', color: '#ffff'}}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tareas.map((tarea) => (
                            <tr 
                                key={tarea.id} 
                                className={`${tarea.completed ? 'tareaCompletada' : ''} ${tarea.isDeleting ? 'slide-out' : ''}`}
                            >
                                <td className={tarea.completed ? "tareaCompletada" : "tareaPendiente"}>{tarea.id}</td>
                                <td className={tarea.completed ? "tareaCompletada" : "tareaPendiente"}>{tarea.text}</td>
                                <td className={tarea.completed ? "tareaCompletada" : "tareaPendiente"}>{tarea.completed ? 'Completada' : 'Pendiente'}</td>
                                <td className={tarea.completed ? "tareaCompletada" : "tareaPendiente"}>
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={tarea.completed}
                                            onChange={() => {
                                                setTareas(tareas.map(t =>
                                                    t.id === tarea.id ? { ...t, completed: !t.completed } : t
                                                ));
                                            }}
                                        />
                                        <label className="form-check-label">Marcar para completar</label>
                                    </div>
                                    <button type="button" className="btn btn-danger w-auto" onClick={() => eliminarTarea(tarea.id)}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default About;

import { Container, Card, Form, Button } from 'react-bootstrap';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';
import { AuthContext } from '../context/AuthContext';
import Loading from '../components/Loading';

const Login = () => {
    const [username, setUsername] = useState('DispJose');
    const [password, setPassword] = useState('5dK.1wA&B');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { loading, setLoading, error, setError } = useContext(AuthContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(async () => {
            setLoading(false);
            await login(username, password);
            navigate('/menu');
        }, 2000);
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="background">
            <Card className="login-card">
                <Card.Body>
                    <div className="text-center mb-4">
                        <img src="/logo.png" alt="Logo" className="login-logo" />
                    </div>
                    <h2 className="text-center mb-4">Software de Control de Piso</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formBasicUsername">
                            <Form.Label>Nombre de usuario</Form.Label>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text" style={{ borderRadius: 0 }}>
                                        <FaUser className="icon" size={30} />
                                    </span>
                                </div>
                                <Form.Control
                                    type="text"
                                    placeholder="Ingrese su usuario"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text" style={{ borderRadius: 0 }}>
                                        <FaLock className="icon" size={30} />
                                    </span>
                                </div>
                                <Form.Control
                                    type={passwordVisible ? "text" : "password"}
                                    placeholder="Ingrese su contraseña"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div className="input-group-append">
                                    <Button variant="outline-secondary" onClick={togglePasswordVisibility} style={{ borderRadius: 0 }}>
                                        {passwordVisible ? <FaEye className="icon" /> : <FaEyeSlash className="icon" />}
                                    </Button>
                                </div>
                            </div>
                        </Form.Group>
                        <Button variant="primary" type="submit" block className='mt-3'>
                            Login
                        </Button>
                        {error && (
                            <div className="error-message">
                                <div className="blink-error">Error!!</div>
                                <div>{error}</div>
                            </div>
                        )}
                    </Form>
                </Card.Body>
            </Card>

            <div>
                {loading && (
                    <Loading />
                )}
            </div>
        </div>
    );
};

export default Login;

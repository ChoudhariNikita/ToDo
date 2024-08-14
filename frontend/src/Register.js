import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await axios.post('http://localhost:5000/register', { username, password });
            alert('Registration successful! You can now log in.');
            navigate('/login');
        } catch (err) {
            alert(err.response.data.message);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h1 className="text-center">Register</h1>
                    <Form>
                        <Form.Group controlId="formUsername">
                            <Form.Control
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formPassword" className="mt-3">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>
                        <Button className="mt-4" variant="primary" onClick={handleRegister} block>
                            Register
                        </Button>
                        <Button
                            className="mt-4"
                            variant="success"
                            onClick={() => navigate('/login')}
                            block
                        >
                            Already have an account? Login
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;

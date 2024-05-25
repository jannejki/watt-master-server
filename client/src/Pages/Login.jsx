import '../stylesheets/login.css';

import React, { useRef, useState } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';


export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');


    async function handleSubmit(e) {
        e.preventDefault();
        const response = await login(emailRef.current.value, passwordRef.current.value);
        if (response.success) {
            navigate('/');
            return;
        } else {
            setError(response.message);
            emailRef.current.value = '';
            passwordRef.current.value = '';
        }
    }
    

    return (
        <Container fluid className="d-flex vh-100">
            <Row className="m-auto">
                <Form className="m-auto p-3 col- text-center" id="loginForm" onSubmit={handleSubmit}>
                    <h1>Watt-Master</h1>
                    {error && <p className="text-danger m-0">{error}</p>}
                    <Form.Group className="py-3 col-lg mx-auto" controlId="formBasicEmail">
                        <Form.Label>Sähköpostiosoite</Form.Label>
                        <Form.Control type="email" ref={emailRef} />
                    </Form.Group>

                    <Form.Group className="py-3 col-lg mx-auto" controlId="formBasicPassword">
                        <Form.Label>Salasana</Form.Label>
                        <Form.Control type="password" ref={passwordRef} />
                    </Form.Group>
                    <Form.Group className="py-3 col-lg mx-auto">
                        <Button variant="primary" className="col-12" type="submit">
                            Kirjaudu sisään
                        </Button>
                    </Form.Group>
                </Form>
            </Row>
        </Container>
    );
}
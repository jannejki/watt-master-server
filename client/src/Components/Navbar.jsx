import "../stylesheets/navbar.css";

import React from 'react';
import { useAuth } from '../Contexts/AuthContext';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { Link, Navigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

export default function Navigation(props) {
    const { currentUser } = useAuth();
    const { logout } = useAuth();
    if (!currentUser) return (null);

    async function handleLogout() {
        try {
            if (!window.confirm("Haluatko varmasti kirjautua ulos?")) return;
            await logout();
            Navigate('/login');
        } catch (error) {

        }
    }

    return (
        <Navbar className="bg-body-tertiary d-flex" sticky="top" id="navbar">
            <Container>
                <Navbar.Brand as={Link} to="/">Etusivu</Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Text className="text-muted m-auto">Hinta: {props.price} snt/kWh</Navbar.Text>
                <Navbar.Collapse className="justify-content-end">
                    <Button variant="primary" className="btn-danger" onClick={handleLogout}>Kirjaudu ulos</Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};
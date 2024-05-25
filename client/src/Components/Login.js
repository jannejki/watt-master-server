import React, { useRef } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();
    const { login } = useAuth();


    async function handleSubmit(e) {
        e.preventDefault();
        const success = await login(emailRef.current.value, passwordRef.current.value);
        console.log(success);
        if (success) navigate('/');
        else navigate('/login');
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" name="email" id="email" placeholder="email" ref={emailRef} />
            <input type="password" name="password" id="password" placeholder="password" ref={passwordRef} />
            <input type="submit" value="Login" />
        </form>
    );
}
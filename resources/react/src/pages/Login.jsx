import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Container, Row, Col, Card, Form, FloatingLabel, Button } from 'react-bootstrap'
import { URL_API } from '../utils/Index'
import bgLogin from '../assets/images/bg-login.svg'

export const Login = () => {
    const [formData, setFormData] = useState({ 'email': null, 'pwd': null })
    const [validated, setValidated] = useState(false)
    const [validation, setValidation] = useState([])
    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    useEffect(() => {
        if (token) {
            navigate('/home', { replace: true })
        }
    }, [token])

    const handleChange = (e) => {
        const data = formData
        data[e.target.name] = e.target.value

        setFormData(data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setValidated(false)
        setValidation([])

        const form = e.currentTarget

        if (form.checkValidity() === false) {
            setValidated(true)
            return
        }

        try {
            const res = await axios.post(URL_API + 'login', formData)
            console.log(res)
            if (res.data.status !== 200) {
                setValidation(res.data.errors)
            } else {
                setValidated(true)

                localStorage.setItem('token', res.data.token)
                localStorage.setItem('userName', res.data.user.nama)

                navigate('/home', { replace: true })
            }
        } catch (error) {
            console.log(error.response.data)
            //setValidation(error.response.data.errors)
        }

    }

    return (
        <Container>
            <Row className='justify-content-center my-5'>
                <Col md={8} className="shadow-lg border rounded">
                    <Row>
                        <Col md={6} className='bg-primary rounded-start'>
                            <img className='w-100 h-auto my-5' src={bgLogin} />
                        </Col>

                        <Col md={6} className="text-center p-5">
                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <h5 className='mb-3'>Login</h5>
                                <FloatingLabel controlId="floatingInput" label="Email address" className="mb-3">
                                    <Form.Control type="email" placeholder="name@example.com" name='email' onChange={(e) => handleChange(e)} className={validation.email ? 'is-invalid' : null} required />
                                    {validation.email &&
                                        <Form.Control.Feedback type="invalid">
                                            {validation.email[0]}
                                        </Form.Control.Feedback>
                                    }
                                </FloatingLabel>

                                <FloatingLabel controlId="floatingPassword" label="Password" className='mb-4'>
                                    <Form.Control type="password" placeholder="Password" name='password' onChange={(e) => handleChange(e)} className={validation.password ? 'is-invalid' : null} required />
                                    {validation.password &&
                                        <Form.Control.Feedback type="invalid">
                                            {validation.password[0]}
                                        </Form.Control.Feedback>
                                    }
                                </FloatingLabel>

                                <Button type='submit' variant='primary' className='mb-3 w-100'>Login</Button>

                                <div className='text-center'><Link to='/register'>Belum punya akun ? Register</Link></div>
                                <div className='text-center'><Link to='/forgot'>Lupa password ?</Link></div>

                            </Form>

                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    )
}
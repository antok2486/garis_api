import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Container, Row, Col, Card, Form, FloatingLabel, Button } from 'react-bootstrap'
import { URL_API } from '../utils/Index'
import bgForgot from '../assets/images/bg-forgot.svg'

export const Register = () => {
    const [formData, setFormData] = useState({ 'email': null, 'pwd': null })
    const [validated, setValidated] = useState(false)
    const [validation, setValidation] = useState([])
    const navigate = useNavigate()

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
            const res = await axios.post(URL_API + 'register', formData)
            console.log(res)
            if (res.data.status === 200) {
                setValidated(true)

                navigate('/login', { replace: true })

            } else {
                setValidation(res.data.errors)

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
                            <img className='w-100 h-auto my-5' src={bgForgot} />
                        </Col>

                        <Col md={6} className="text-center p-5">
                            <h5 className='mb-3'>Register</h5>
                            
                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <FloatingLabel controlId="floatingInputNama" label="Nama Lengkap" className="mb-3">
                                    <Form.Control type="text" placeholder="Nama Lengkap" name='nama' onChange={(e) => handleChange(e)} className={validation.nama ? 'is-invalid' : null} required />
                                    {validation.length !== 0 && validation.nama &&
                                        <Form.Control.Feedback type="invalid">
                                            {validation.nama[0]}
                                        </Form.Control.Feedback>
                                    }
                                </FloatingLabel>

                                <FloatingLabel controlId="floatingInputEmail" label="Email address" className="mb-3">
                                    <Form.Control type="email" placeholder="name@example.com" name='email' onChange={(e) => handleChange(e)} className={validation.email ? 'is-invalid' : null} required />
                                    {validation && validation.email &&
                                        <Form.Control.Feedback type="invalid">
                                            {validation.email[0]}
                                        </Form.Control.Feedback>
                                    }
                                </FloatingLabel>

                                <FloatingLabel controlId="floatingInputTlp" label="No. Hp" className="mb-3">
                                    <Form.Control type="text" placeholder="08xxxx" name='tlp' onChange={(e) => handleChange(e)} className={validation.tlp ? 'is-invalid' : null} required />
                                    {validation && validation.tlp &&
                                        <Form.Control.Feedback type="invalid">
                                            {validation.tlp[0]}
                                        </Form.Control.Feedback>
                                    }
                                </FloatingLabel>

                                <FloatingLabel controlId="floatingPassword1" label="Password" className='mb-4'>
                                    <Form.Control type="password" placeholder="Password" name='password1' onChange={(e) => handleChange(e)} className={validation.password1 ? 'is-invalid' : null} required />
                                    {validation && validation.password1 &&
                                        <Form.Control.Feedback type="invalid">
                                            {validation.password1[0]}
                                        </Form.Control.Feedback>
                                    }
                                </FloatingLabel>

                                <FloatingLabel controlId="floatingPassword2" label="Ulangi Password" className='mb-4'>
                                    <Form.Control type="password" placeholder="Password" name='password2' onChange={(e) => handleChange(e)} className={validation.password2 ? 'is-invalid' : null} required />
                                    {validation && validation.password2 &&
                                        <Form.Control.Feedback type="invalid">
                                            {validation.password2[0]}
                                        </Form.Control.Feedback>
                                    }
                                </FloatingLabel>

                                <Button type='submit' variant='primary' className='mb-3 w-100'>Register</Button>

                                <div className='text-center'><Link to='/login'>Sudah punya akun ? Login</Link></div>
                                <div className='text-center'><Link to='/forgot'>Lupa password ?</Link></div>

                            </Form>

                        </Col>

                    </Row>

                </Col>
            </Row>
        </Container>
    )
}
import React, { useEffect } from 'react'
import { Modal, Button } from 'react-bootstrap'

export const GModal = ({ type = 'question', title, body, show, onHide, buttons }) => {
    const handleOnClick = (onClick) => {
        if (typeof onClick === 'function') { onClick() }
        onHide()
    }

    return (
        <Modal show={show} onHide={() => onHide()}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {type === 'question' &&
                        <i className="fa-solid fa-question"></i>
                    }
                    {type === 'information' &&
                        <i className="fa-solid fa-info"></i>
                    }
                    &nbsp;{title}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {body}
            </Modal.Body>

            <Modal.Footer>
                {buttons && buttons.map(btn => (
                    <Button type='button' variant='primary' onClick={() => handleOnClick(btn.onClick)} key={btn.text}>{btn.text}</Button>
                ))}
            </Modal.Footer>
        </Modal>
    )
}

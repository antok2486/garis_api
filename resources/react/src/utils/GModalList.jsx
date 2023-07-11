import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Modal, Button, Table, Row, Col, Form } from 'react-bootstrap'
import { URL_API } from './Index'

export const GModalList = ({ show, title, columns, tableName, onHide, onClickOk, multiple, arrData }) => {
    const [dataSelected, setDataSelected] = useState([])
    const [rowClassName, setRowClassName] = useState([])
    const [start, setStart] = useState(0)
    const [end, setEnd] = useState(10)
    const [data, setData] = useState([])
    const [oldData, setOldData] = useState([])
    const token = localStorage.getItem('token')

    useEffect(() => {
        const fetchData = async () => {
            let headers = {
                accept: 'application/json',
                Authorization: 'Bearer ' + token
            }

            let res = await axios.get(URL_API + tableName, { headers: headers })

            if (res.data.status === 200) {
                let tableName_ = tableName

                if (tableName.indexOf("?") !== -1) {
                    tableName_ = tableName.substr(0, tableName.indexOf("?"))
                }
                //console.log(res.data[tableName_])
                setData(res.data[tableName_])
                setOldData([])
            }
        }
        
        setStart(0)
        setEnd(10)

        if (tableName) {
            fetchData()
        }

        if (arrData) {
            setData(arrData)
        }

    }, [setData, setOldData, setStart, setEnd, tableName, arrData])

    const isRowMatch = (key, text) => {
        if (key[columns[0]['name']] && key[columns[0]['name']].toString().toLowerCase().match(text.toLowerCase())) {
            return true
        } else if (columns[1]) {
            if (key[columns[1]['name']] && key[columns[1]['name']].toString().toLowerCase().match(text.toLowerCase())) {
                return true
            } else if (columns[2]) {
                if (key[columns[2]['name']] && key[columns[2]['name']].toString().toLowerCase().match(text.toLowerCase())) {
                    return true
                }
            }
        }

        return false

    }

    const handleFilter = (e) => {
        e.preventDefault()

        let text = e.target.value
        let toFilter = oldData

        setStart(0)
        setEnd(10)

        if (!text) {
            setData(oldData)
            setOldData([])
            return false
        }

        if (!oldData || oldData.length === 0) {
            setOldData(data)
            toFilter = data
        }

        let dataToFilter = toFilter.filter((key) => {
            return isRowMatch(key, text)
        })

        setData(dataToFilter)
    }

    const handleOnHide = () => {
        setRowClassName({})
        onHide()
    }

    const handleOnClickOk = () => {
        let dataSelected_ = dataSelected

        setDataSelected([])
        setRowClassName({})

        onClickOk(dataSelected_)
        onHide()
    }

    const handleRowClick = (row, index) => {
        if (!multiple) {
            setRowClassName({ [index]: 'selected' })
            setDataSelected(row)

        } else {
            if (rowClassName[index] === 'selected') {
                let dataSelected_ = dataSelected
                setDataSelected(dataSelected_.filter(row_ => row_ !== row))

                let rowClassName_ = rowClassName
                delete rowClassName_[index]
                setRowClassName(rowClassName_)
            } else {
                setDataSelected(dataSelected => [...dataSelected, row])
                setRowClassName({ ...rowClassName, [index]: 'selected' })
            }
        }

    }

    const next = () => {
        const start_ = start + 10
        const end_ = end + 10

        setStart(start_)
        setEnd(end_)
    }

    const prev = () => {
        const start_ = start - 10
        const end_ = end - 10

        setStart(start_)
        setEnd(end_)
    }

    return (
        <Modal show={show} onHide={handleOnHide}>
            <Modal.Header closeButton>
                <Modal.Title><i className="fa-solid fa-magnifying-glass"></i> {title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className='mb-2'>
                    <Col>
                        <Form.Control key="textGSearch" type="text" name="filter" placeholder="Pencarian" onChange={(e) => handleFilter(e)} autoFocus={true} />
                    </Col>
                </Row>
                <Table responsive className="table table-bordered data-table" cellSpacing="0">
                    <thead className="bg-primary text-light">
                        <tr>
                            {columns && columns.map(col => (
                                <th key={col.text}>{col.text}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.slice(start, end).map((row, index) => (
                            <tr key={index} className={rowClassName[index]} onClick={() => handleRowClick(row, index)}>
                                {columns && columns.map((col) => (
                                    <td key={col.name + index}>{row[col.name]}</td>
                                ))}
                            </tr>
                        ))
                        }
                    </tbody>
                </Table>

                <Row>
                    <Col className='text-center'>
                        {data && data.length > 10 &&
                            <>
                                <Button variant="primary" className='mr-1' disabled={start === 0 ? 'disabled' : null} onClick={() => prev()}><i className="fa-solid fa-angle-left"></i></Button>&nbsp;
                                <Button variant="primary" disabled={end >= data.length ? 'disabled' : null} onClick={() => next()}><i className="fa-solid fa-angle-right"></i></Button>
                            </>
                        }
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                {!onClickOk &&
                    <Button variant="primary" onClick={handleOnHide}>
                        Ok
                    </Button>
                }
                {onClickOk &&
                    <>
                        <Button variant="primary" onClick={handleOnHide}>Cancel</Button>
                        <Button variant="primary" onClick={handleOnClickOk}>Ok</Button>
                    </>
                }
            </Modal.Footer>
        </Modal>

    )
}
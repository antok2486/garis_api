import axios from 'axios'
import React, { useState } from 'react'
import { URL_API, GModal, GModalList } from './Index'
import { Card, Table, Button, Form, Row, Col, InputGroup, Accordion } from 'react-bootstrap'
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { read, utils, writeFile } from 'xlsx'

export const GReportV1 = ({ tableName, filterColumns, columns, handleSummary }) => {
    const token = localStorage.getItem('token')
    const [data, setData] = useState([])
    const [totals, setTotals] = useState({})
    const [page, setPage] = useState({ start: 0, end: 20 })
    const [sortColumn, setSortColumn] = useState()
    const [sortOrder, setSortOrder] = useState(true)
    const [filter, setFilter] = useState({})
    const [gModal, setGModal] = useState({
        type: 'question',
        title: 'Konfirmasi',
        body: null,
        show: false,
        buttons: [],
    })

    const [gModalList, setGModalList] = useState({
        show: false,
        title: 'Pilih',
        columns: [],
        tableName: null,
        onHide: () => { setGModalList({ show: false }) },
        onClickOk: null,
        multiple: false

    })

    const getReport = async () => {
        let filterStr = ''

        for (let key in filter) {
            filterStr += key + '=' + filter[key].value + '&'
        }

        try {
            const headers = {
                accept: 'application/json',
                Authorization: 'Bearer ' + token
            }

            const res = await axios.get(URL_API + tableName + '?' + filterStr, { headers: headers })

            if (res.data.status === 200) {
                //console.log(res);

                //get totals
                let totals_ = {}
                res.data[tableName].map(row => {
                    columns.map(col => {
                        if (col.total) {
                            totals_[col.name] ? totals_[col.name] += parseFloat(row[col.name]) : totals_[col.name] = parseFloat(row[col.name])
                        } else {
                            totals_[col.name] = null
                        }
                    })
                })

                setTotals(totals_)
                setData(res.data[tableName])

                if (handleSummary) {
                    handleSummary(res.data[tableName])
                }

            } else {
                setGModal({
                    show: true,
                    type: 'information',
                    title: 'Error' + (res.data.status ? ' ' + res.data.status : ''),
                    body: res.data.message ? res.data.message : 'Gagal mendapatkan data',
                    buttons: [{ text: 'Ok', onClick: null }]
                })
            }

        } catch (error) {
            setGModal({
                show: true,
                type: 'information',
                title: 'Error',
                body: error.response.data.message,
                buttons: [{ text: 'Ok', onClick: null }]
            })
        }

    }

    const handleClickExport = () => {
        //generate heading
        const colExport = []

        columns.forEach(col => {
            //colExport.push(col.name)
            colExport.push(col.text)
        })

        const headings = [colExport];

        //generate data
        const arr = []
        data.forEach(row => {
            const row_ = {}

            columns.forEach(col => {
                if (col.type === 'modal') {
                    row_[col.name] = row[col.ref]

                } else if (col.type === 'number') {
                    row_[col.name] = parseFloat(row[col.name])

                } else {
                    row_[col.name] = row[col.name]

                }

            })

            arr.push(row_)

        })

        const wb = utils.book_new();
        const ws = utils.json_to_sheet([]);

        utils.sheet_add_aoa(ws, headings);
        utils.sheet_add_json(ws, arr, { origin: 'A2', skipHeader: true });
        utils.book_append_sheet(wb, ws, 'Report');

        writeFile(wb, tableName + '.xlsx');
    }

    const handleFilterChange = (e, col) => {
        let temp = Object.assign({}, filter)

        temp[col.name] = { value: e.target.value, text: e.target.value }

        setFilter(temp)

    }

    const handleShowModalList = (col) => {
        setGModalList({
            show: true,
            title: col.modalTitle,
            columns: col.refColumns,
            tableName: col.refTable,
            arrData: col.refArr,
            onHide: () => { setGModalList({ show: false }) },
            onClickOk: (row) => {
                let temp = Object.assign({}, filter)

                temp[col.name] = { value: row[col.refValue], text: row[col.refText] }

                setFilter(temp)
            },
            multiple: false

        })
    }

    const handleSort = (col) => {
        setSortColumn(col)
        setSortOrder(!sortOrder)

        data.sort((a, b) => {
            if (sortOrder) {
                if (a[col] < b[col]) { return -1 }
                if (a[col] > b[col]) { return 1 }
            }

            if (!sortOrder) {
                if (a[col] > b[col]) { return -1 }
                if (a[col] < b[col]) { return 1 }
            }
        })

    }

    const next = () => {
        const start_ = page.start + 20
        const end_ = page.end + 20

        setPage({ start: start_, end: end_ })
    }

    // Create our number formatter.
    const numberFormat = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        // These options are needed to round to whole numbers if that's what you want.
        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    });

    const prev = () => {
        const start_ = page.start - 20
        const end_ = page.end - 20

        setPage({ start: start_, end: end_ })
    }

    const CustomToggle = ({ children, eventKey }) => {
        const [collapse, setCollapse] = useState(true)

        const decoratedOnClick = useAccordionButton(eventKey, () =>
            //console.log('totally custom!'),
            setCollapse(!collapse)
        )

        return (
            <button type="button" className={collapse ? 'custom-toggle collapsed' : 'custom-toggle'} onClick={decoratedOnClick}>{children}</button>
        );
    }

    return (
        <React.Fragment>
            <Accordion defaultActiveKey={['0', '1']} alwaysOpen className='report'>
                <Card>
                    <Card.Header>
                        <CustomToggle eventKey="0">Filter</CustomToggle>
                    </Card.Header>

                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <Row>
                                {[...Array(3)].map((i, x) => (
                                    <Col md={4} key={'filter_col' + x}>
                                        {filterColumns.filter(el => el.col === x).map(col => (
                                            <Row className="mb-3" key={col.name}>
                                                <Form.Label as={Col} md={4}>{col.text}</Form.Label>
                                                <Col md={7}>
                                                    {col.type === 'text' &&
                                                        <Form.Control type="text" name={col.name} defaultValue={filter[col.name] ? filter[col.name].text : null} onChange={(e) => handleFilterChange(e, col)} />
                                                    }
                                                    {col.type === 'modal' &&
                                                        <InputGroup>
                                                            <Form.Control type="text" name={col.ref} readOnly required defaultValue={filter[col.name] ? filter[col.name].text : null} />
                                                            <Form.Control type="hidden" name={col.name} defaultValue={filter[col.name] ? filter[col.name].value : null} />
                                                            <Button variant='primary' onClick={() => handleShowModalList(col)} ><i className="fa-solid fa-magnifying-glass"></i></Button>
                                                        </InputGroup>
                                                    }
                                                    {col.type === 'summary' &&
                                                        <Form.Control type="text" name={col.name} defaultValue={col.value} className='text-end' readOnly />
                                                    }
                                                </Col>
                                            </Row>
                                        ))}

                                    </Col>
                                ))}
                            </Row>

                        </Card.Body>
                    </Accordion.Collapse>

                    <Card.Header>
                        <CustomToggle eventKey="1">Report</CustomToggle>
                        <Button variant='primary' className='ms-2 me-1' onClick={() => getReport()}><i className="fa-solid fa-check" />&nbsp;Tampilkan</Button>
                        <Button variant='primary' onClick={() => handleClickExport()} ><i className="fa-solid fa-file-excel" />&nbsp;Download xls</Button>

                    </Card.Header>

                    <Accordion.Collapse eventKey="1">
                        <Card.Body>
                            <Table bordered hover>
                                <thead className='bg-primary text-light'>
                                    <tr>
                                        {columns && columns.map(col => (
                                            <th
                                                key={col.name}
                                                className={(col.type === 'number' ? 'text-end' : 'text-start') + (sortColumn === col.name ? (!sortOrder ? ' sorted-asc' : ' sorted-desc') : '')}
                                                onClick={() => handleSort(col.name)}
                                            >
                                                {col.text}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {data && data.map((row, index) => (
                                        <tr key={index}>
                                            {columns && columns.map(col => (
                                                <td key={col.name + index} className={col.type === 'number' ? 'text-end' : 'text-start'} >
                                                    {col.type === 'number' ? numberFormat.format(row[col.name]) : row[col.name]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>

                                <tfoot>
                                    <tr className='bg-primary text-light'>
                                        {columns && columns.map(col => (
                                            <td key={col.name} className='text-end' >{totals[col.name]}</td>
                                        ))}
                                    </tr>
                                </tfoot>
                            </Table>

                        </Card.Body>
                    </Accordion.Collapse>

                    <Card.Footer>
                        <Row>
                            <Col><span>Result : {(page.end >= data.length ? data.length : page.end) + ' of ' + data.length} rows </span></Col>

                            <Col className="text-center">
                                {data.length > 10 &&
                                    <>
                                        <Button variant="primary" className='me-1' disabled={page.start === 0 ? 'disabled' : null} onClick={() => prev()}><i className="fa-solid fa-angle-left" /></Button>
                                        <Button variant="primary" disabled={page.end >= data.length ? 'disabled' : null} onClick={() => next()}><i className="fa-solid fa-angle-right" /></Button>
                                    </>
                                }
                            </Col>

                            <Col className="text-end"><span>Page {(page.start / 20) + 1} / {Math.ceil(data.length / 20)}</span></Col>
                        </Row>
                    </Card.Footer>

                </Card>
            </Accordion>

            <GModal
                show={gModal.show}
                type={gModal.type}
                title={gModal.title}
                body={gModal.body}
                buttons={gModal.buttons}
                onHide={() => setGModal({ show: false })}
            />

            <GModalList
                show={gModalList.show}
                title={gModalList.title}
                columns={gModalList.columns}
                tableName={gModalList.tableName}
                arrData={gModalList.arrData}
                onHide={gModalList.onHide}
                onClickOk={gModalList.onClickOk}
                multiple={false}
            />

        </React.Fragment >
    )
}

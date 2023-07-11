import React, { useRef, useState } from 'react'
import axios from 'axios'
import { GFormEdit } from '../../utils/GFormEdit'
import { GInputNumber, GListEdit, numberFormat } from "../../utils/Index"
import { Button, Row, Col, Form, InputGroup, Card, Table } from "react-bootstrap"

export const TrivPw = () => {
    const ref = useRef()
    const [dataTrivpw1, setDataTrivpw1] = useState({})
    const [dataTrivpw2, setDataTrivpw2] = useState([])
    const [validated, setValidated] = useState(false)
    const [formState, setFormState] = useState('new')
    const [view, setView] = useState('list')
    const [params, setParams] = useState({ id_jenissuplbrg: null, id_tipegudangpo: null })
    const modalColumns = [{ name: 'kode', text: 'Kode' }, { name: 'nama', text: 'Nama' }]
    const modalColumnsRef = [{ name: 'nogr', text: 'No. Penerimaan' }, { name: 'nama_supplier', text: 'Supplier' }]

    const fetchData = async (e) => {
        e.preventDefault()

        let resData = await ref.current.axiosGet('trivpw?no_pw=' + dataTrivpw1['no_pw'])

        if (resData.status === 200) {
            let temp = Object.assign({}, dataTrivpw1)
            let trivpw1 = resData['trivpw1'][0]

            temp['id'] = trivpw1['id']
            temp['no_pw'] = trivpw1['no_pw']
            temp['nama_gudang'] = trivpw1['nama_gudang']
            temp['no_reff'] = trivpw1['no_reff']
            temp['jenis_penerimaana'] = trivpw1['jenis_penerimaana']
            temp['note'] = trivpw1['note']

            setDataTrivpw1(temp)
            setDataTrivpw2(resData['trivpw2'])
        }

    }

    const handleClickAdd = async () => {
        const resData = await ref.current.axiosGet('trivparam')
        const params = resData.params

        setParams(params)

        setDataTrivpw1({
            id: '', no_pw: '', id_gudang: '', id_reff: '', jenis_penerimaana: '',
            note: '', status: '', nama_gudang: '', no_reff: '',
        })

        setDataTrivpw2([])

        setFormState('edit')
        setValidated(false)
        setView('edit')

    }

    const handleClickEdit = async (id) => {
        let resData = await ref.current.axiosGet('trivpw?id=' + id)

        if (resData.status === 200) {
            // let temp = Object.assign({}, dataTrivpw1)
            // let trivpw1 = resData['trivpw1'][0]

            // temp['id'] = trivpw1['id']
            // temp['no_pw'] = trivpw1['no_pw']
            // temp['nama_gudang'] = trivpw1['nama_gudang']
            // temp['no_reff'] = trivpw1['no_reff']
            // temp['jenis_penerimaana'] = trivpw1['jenis_penerimaana']
            // temp['note'] = trivpw1['note']
            // temp['status'] = trivpw1['status']

            setDataTrivpw1(resData['trivpw1'][0])
            setDataTrivpw2(resData['trivpw2'])

            setFormState('edit')
            setValidated(false)
            setView('edit')

        }

    }

    const handleDataDetailChange = (e, id) => {
        let temp = dataTrivpw2.map(l => Object.assign({}, l))

        temp.forEach(el => {
            if(el['id'] === id){
                el['qty_put'] = e.target.value
            }
        })

        setDataTrivpw2(temp)
    }

    const handleSave = async () => {
        let arrTrivpw2 = dataTrivpw2.map(l => Object.assign({}, l))

        //remove comma
        arrTrivpw2.forEach(el => {
            el.qty_put = el.qty_put ? parseFloat(el.qty_put.toString().replace(/,/g, '')) : 0
        })

        let payload = JSON.stringify({ 'trivpw1': dataTrivpw1, 'trivpw2': arrTrivpw2 })

        let resData = await ref.current.axiosPut('trivpw?', payload)

        if (resData.status === 200) {
            setView('list')
        }

    }

    const ViewEdit = () => (
        <Form noValidate autoComplete="off" validated={validated} onSubmit={(e) => ref.current.handleSubmit(e, handleSave)}>
            <Card>
                <Card.Header>
                    <Button type='button' variant='primary' className='me-1' onClick={() => setView('list')}><i className="fa-solid fa-caret-left"></i>&nbsp;Kembali</Button>
                    {dataTrivpw1['status'] === 1 &&
                        <Button type='submit' variant='primary' className='me-1'><i className="fa-solid fa-floppy-disk"></i>&nbsp;Simpan</Button>
                    }
                </Card.Header>

                <Card.Body>
                    <Row>
                        <Col md={5}>
                            <Row className="mb-3">
                                <Form.Label as={Col} md={4}>No. Putaway</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="no_pw" defaultValue={dataTrivpw1.no_pw} onChange={(e) => ref.current.handleChangeDataHeader(e)} onKeyDown={(e) => e.key === 'Enter' ? fetchData(e, '123') : null} placeholder='Scan atau ketik No. Putaway' />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={4}>Gudang</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="nama_gudang" value={dataTrivpw1.nama_gudang} onChange={(e) => e.preventDefault()} required />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={4}>Jenis Transaksi</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="jenis_penerimaana" value={dataTrivpw1.jenis_penerimaana} onChange={(e) => e.preventDefault()} required />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={4}>No. Reff</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="no_reff" value={dataTrivpw1.no_reff} onChange={(e) => e.preventDefault()} required />
                                </Col>
                            </Row>

                        </Col>

                        <Col md={5}>
                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>Note</Form.Label>
                                <Col md={7}>
                                    <Form.Control as="textarea" name='note' rows={2} defaultValue={dataTrivpw1.note} onChange={(e) => handleChange(e)} />
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                </Card.Body>

                <Card.Header>
                    <span className='d-inline-block col-md-2 border-end'>Detail Lokasi Putaway</span>
                    <Form.Control type="text" name="scan_lokasi" className='d-inline-block ms-1' placeholder='Lokasi' style={{ width: '80px' }} />
                    <Form.Control type="text" name="scan_qty" className='d-inline-block ms-1' placeholder='Qty' style={{ width: '60px' }} defaultValue={1} />
                    <Form.Control type="text" name="scan_skuproduk" className='d-inline-block ms-1' placeholder='Scan atau ketik SKU Produk' style={{ width: '250px' }} />
                </Card.Header>

                <Card.Body>
                    <Table responsive bordered hover style={{ minWidth: 'max-content' }}>
                        <thead className='bg-primary text-light'>
                            <tr>
                                <th>Lokasi</th>
                                <th>Nama Produk</th>
                                <th>SKU Produk</th>
                                <th width='100px' className='text-end'>Qty Order</th>
                                <th width='100px' className='text-end'>Qty Putaway</th>
                            </tr>
                        </thead>

                        <tbody>
                            {dataTrivpw2.map((row, index) => (
                                <tr key={index}>
                                    <td>{row['kode_lokasi']}</td>
                                    <td>{row['nama_produk']}</td>
                                    <td>{row['kode_skuproduk']}</td>
                                    <td align='right' width='100px'>{numberFormat.format(row['qty_order'])}</td>
                                    <td className='text-center px-1' align='right' width="100px">
                                        <GInputNumber name={''} initialValue={0} onChange={(e) => handleDataDetailChange(e, row['id'])} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </Table>
                </Card.Body>

            </Card>
        </Form>
    )

    const ViewList = () => (
        <GListEdit
            tableName='trivpw'
            btnImportExport={false}
            btnShowActive={false}
            btnShowStatus={true}
            onClickAdd={() => handleClickAdd()}
            onClickEdit={(id) => handleClickEdit(id)}
            columns={{ id: null, kode: '', nama: '' }}
            displayColumns={[
                { name: 'no_pw', text: 'No. Putaway', type: 'text', updatable: false },
                { name: 'no_reff', text: 'No. Penerimaan', type: 'text', updatable: false },
                { name: 'jenis_penerimaana', text: 'Jenis Penerimaan', type: 'text', updatable: false },
                { name: 'nama_gudang', text: 'Gudang', type: 'text', updatable: false },
                { name: 'note', text: 'Note', type: 'text', updatable: false },
                { name: 'statusa', text: 'Status', type: 'text', updatable: false },
                { name: 'user_update', text: 'User Update', type: 'text', updatable: false },
                { name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false },
            ]}
        />

    )

    return (
        <GFormEdit ref={ref} setValidated={setValidated} dataHeader={dataTrivpw1} setDataHeader={setDataTrivpw1}>
            {view === 'list' &&
                ViewList()
            }
            {view === 'edit' &&
                ViewEdit()
            }
        </GFormEdit>
    )
}

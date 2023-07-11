import React, { useState } from "react"
import axios from 'axios'
import { Button, Card, Row, Col, Form, Tabs, Tab, Table, InputGroup, Container } from 'react-bootstrap'
import { URL_API, GModal, GModalList, GInputNumber, GListEdit } from '../../utils/Index'

export const SyGrup = () => {
    const [view, setView] = useState('list')
    const [data, setData] = useState({})
    const [dataAuth, setDataAuth] = useState([])
    const [dataAutg, setDataAutg] = useState([])
    const [validated, setValidated] = useState(false)
    const [tabKey, setTabKey] = useState(0)
    const token = localStorage.getItem('token')
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

    const fetchData = async (id) => {
        const headers = {
            accept: 'application/json',
            Authorization: 'Bearer ' + token
        }

        const res = await axios.get(URL_API + 'sygrup?id=' + id, { headers: headers })

        if (res.data.status === 200) {
            if (res.data['sygrup']) {
                //replace null with empty string
                for (let col in res.data['sygrup'][0]) {
                    if (!res.data['sygrup'][0][col]) { res.data['sygrup'][0][col] = '' }
                }

                setData(res.data['sygrup'][0])
                setDataAuth(res.data['syauth'])
                setDataAutg(res.data['syautg'])

            } else {
                setGModal({
                    show: true,
                    type: 'question',
                    title: 'Error',
                    body: 'Gagal mendapatkan data',
                    buttons: [{ text: 'Ok', onClick: null }]
                })

            }
        }
    }

    const handleChange = (e) => {
        let temp = Object.assign({}, data)

        if (e.target.className === 'form-check-input') {  //switches
            if (e.target.checked) {
                temp[e.target.name] = 1
            } else {
                temp[e.target.name] = 0
            }
        } else {
            temp[e.target.name] = e.target.value
        }

        setData(temp)
    }

    const handleClickAdd = () => {
        setData({
            id: '', nama: '', is_aktif: ''
        })

        setView('edit')

    }

    const handleClickEdit = async (id_) => {
        await fetchData(id_)

        setView('edit')
    }

    const handleSave = async () => {
        const arr = data

        //remove commas from input number
        arr['plafon'] = arr['plafon'] ? arr['plafon'].toString().replace(/,/g, '') : 0
        arr['hari_bayar'] = arr['hari_bayar'] ? arr['hari_bayar'].toString().replace(/,/g, '') : 0

        var config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }

        var payload = JSON.stringify({ 'sygrup': arr })

        const res = await axios.put(URL_API + 'sygrup?', payload, config)

        if (res.data.status === 200) {
            setView('list')

        } else {
            console.log(res)
            setGModal({
                show: true,
                type: 'information',
                title: 'Simpan data gagal',
                body: res.data.message.errorInfo ? res.data.message.errorInfo[2] : res.data.message,
                buttons: [
                    { text: 'Ok', onClick: null }
                ]
            })
        }

    }

    const handleSubmit = (e) => {
        e.preventDefault()

        setValidated(false)

        const form = e.currentTarget

        if (form.checkValidity() === false) {
            setValidated(true)
            return
        }

        setGModal({
            show: true,
            type: 'question',
            title: 'Konfirmasi',
            body: 'Apakah data yang diinput sudah benar ?',
            buttons: [
                { text: 'Ya', onClick: () => handleSave() },
                { text: 'Tidak', onClick: null }
            ]
        })

    }

    const ViewEdit = () => (
        <React.Fragment>
            <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
                <Card>
                    <Card.Header>
                        <Button type='button' variant='primary' className='me-1' onClick={() => setView('list')}><i className="fa-solid fa-caret-left"></i>&nbsp;Kembali</Button>
                        <Button type='submit' variant='primary' className='me-1'><i className="fa-solid fa-floppy-disk"></i>&nbsp;Simpan</Button>
                    </Card.Header>

                    <Card.Body>
                        <Row>
                            <Col md={5}>
                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Nama</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="nama" defaultValue={data.nama} onChange={(e) => handleChange(e)} readOnly required />
                                    </Col>
                                </Row>

                                <Row className='mb-4'>
                                    <Form.Label as={Col} md={3}>Status Aktif</Form.Label>
                                    <Col md={7}>
                                        <Form.Check type="switch" name="is_aktif" label={data.is_aktif === 1 ? 'Aktif' : 'Tidak Aktif'} checked={data.is_aktif === 1 ? true : false} onChange={(e) => handleChange(e)} />
                                    </Col>
                                </Row>

                            </Col>
                        </Row>
                    </Card.Body>

                    <Card.Header><span className='d-inline-block col-md-2 border-end'>Akses Grup Pengguna</span></Card.Header>

                    <Card.Body>
                        <Tabs id="controlled" activeKey={tabKey} onSelect={(k) => setTabKey(k)}>
                            <Tab eventKey={0} title="Menu" className='shadow p-2'>
                                {ViewEditAuth()}
                            </Tab>
                            <Tab eventKey={1} title="Gudang / Counter" className='shadow p-2'>
                                {ViewEditAutg()}
                            </Tab>
                        </Tabs>

                    </Card.Body>

                </Card>

            </Form>

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

            <GModal
                show={gModal.show}
                type={gModal.type}
                title={gModal.title}
                body={gModal.body}
                buttons={gModal.buttons}
                onHide={() => setGModal({ show: false })}
            />

        </React.Fragment>
    )

    const ViewEditAutg = () => (
        <GListEdit
            arrData={dataAutg}
            onClickAdd={(id) => handleClickEdit(id)}
            btnImportExport={false}
            btnShowActive={false}
            columns={{ urut: '', grup1: '', grup2: '', nama: '' }}
            displayColumns={[
                { name: 'kode_gudang', text: 'Kode', type: 'text', updatable: false },
                { name: 'nama_gudang', text: 'Nama Gudang', type: 'text', updatable: false },
            ]}
        />

    )
    
    const ViewEditAuth = () => (
        <GListEdit
            arrData={dataAuth}
            onClickAdd={(id) => handleClickEdit(id)}
            btnImportExport={false}
            btnShowActive={false}
            columns={{ urut: '', grup1: '', grup2: '', nama: '' }}
            displayColumns={[
                { name: 'urut', text: 'Urut', type: 'text', updatable: false },
                { name: 'grup1', text: 'Grup', type: 'text', updatable: false },
                { name: 'grup2', text: 'Sub Menu', type: 'text', updatable: false },
                { name: 'nama', text: 'Nama Menu', type: 'text', updatable: false },
            ]}
        />

    )

    const ViewList = () => (
        <GListEdit
            tableName='sygrup'
            onClickEdit={(id) => handleClickEdit(id)}
            columns={{ id: null, kode: '', nama: '' }}
            displayColumns={[
                { name: 'nama', text: 'Nama', type: 'text', updatable: true },
                { name: 'user_update', text: 'User Update', type: 'text', updatable: false },
                { name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false },
            ]}
        />

    )

    return (
        <React.Fragment>
            {view === 'list' &&
                ViewList()
            }
            {view === 'edit' &&
                ViewEdit()
            }
        </React.Fragment>
    )
}

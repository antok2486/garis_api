import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Button, Card, Row, Col, Form, InputGroup, Container } from 'react-bootstrap'
import { URL_API, GListEdit, GModal, GModalList, GInputNumber } from '../../utils/Index'

export const MdSupl = () => {
    const [view, setView] = useState('list')
    const [data, setData] = useState({})
    const [validated, setValidated] = useState(false)
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

        const res = await axios.get(URL_API + 'mdsupl?id=' + id, { headers: headers })

        if (res.data.status === 200) {
            if (res.data['mdsupl']) {
                //replace null with empty string
                for(let col in res.data['mdsupl'][0]){
                    if(!res.data['mdsupl'][0][col]){res.data['mdsupl'][0][col] = ''}
                }

                setData(res.data['mdsupl'][0])
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

    const handleClickAdd = () => {
        setData({
            id: null, kode: null, nama: null, foto: null, alamat: null,
            provinsi: null, id_kota: null, kecamatan: null, kelurahan: null, kodepos: null,
            npwp: null, tlp_1: null, tlp_2: null, lng: null, lat: null,
            email: null, cara_bayar: 1, hari_bayar: null, id_merk: null, id_jenissupl: null, is_aktif: 1,
            user_update: null, updated_at: null
        })

        setView('edit')
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

    const handleClickEdit = async (id_) => {
        await fetchData(id_)

        setView('edit')
    }

    const handleSave = async () => {
        const arr = data

        //remove commas from input number
        arr['hari_bayar'] = arr['hari_bayar'] ? arr['hari_bayar'].toString().replace(/,/g, '') : 0

        var config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }

        var payload = JSON.stringify({ 'mdsupl': arr })

        const res = await axios.put(URL_API + 'mdsupl?', payload, config)

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

    const handleShowModalList = (tableName, cols, title) => {
        setGModalList({
            show: true,
            title: title,
            columns: [{ name: 'kode', text: 'Kode' }, { name: 'nama', text: 'Nama' }],
            tableName: tableName,
            onHide: () => { setGModalList({ show: false }) },
            onClickOk: (row) => {
                let temp = Object.assign({}, data)

                temp[cols.id] = row['id']
                temp[cols.nama] = row['nama']

                if (cols.id === 'id_jenissupl') {
                    temp['kode_jenissupl'] = row['kode']
                } else if (cols.id === 'id_merk') {
                    temp['kode_merk'] = row['kode']
                }

                if (!temp['id']) {
                    temp['kode'] = (temp['kode_jenissupl'] ? temp['kode_jenissupl'] : '') +
                        (temp['kode_merk'] ? temp['kode_merk'] : '')
                }

                setData(temp)
            },
            multiple: false

        })

    }

    const handleShowModalKota = () => {
        setGModalList({
            show: true,
            title: 'Pilih Kota',
            columns: [{ name: 'kode', text: 'Kode' }, { name: 'nama', text: 'Nama Kota' }],
            tableName: 'mrkota?provinsi=' + data['provinsi'] + '&is_aktif=1',
            onHide: () => { setGModalList({ show: false }) },
            onClickOk: (row) => {
                let temp = Object.assign({}, data)

                temp['id_kota'] = row['id']
                temp['nama_kota'] = row['nama']

                //kosongkan kecamatan, dll
                temp['kecamatan'] = ''
                temp['kelurahan'] = ''
                temp['kodepos'] = ''

                setData(temp)
            },
            multiple: false

        })

    }

    const handleShowModalKotp = () => {
        setGModalList({
            show: true,
            title: 'Pilih Kode Pos',
            columns: [{ name: 'kodepos', text: 'Kode Pos' }, { name: 'kecamatan', text: 'Kecamatan' }, { name: 'kelurahan', text: 'Kelurahan' }],
            tableName: 'mrkotp?id_kota=' + data['id_kota'] + '&is_aktif=1',
            onHide: () => { setGModalList({ show: false }) },
            onClickOk: (row) => {
                let temp = Object.assign({}, data)

                temp['kodepos'] = row['kodepos']
                temp['kecamatan'] = row['kecamatan']
                temp['kelurahan'] = row['kelurahan']

                setData(temp)
            },
            multiple: false

        })

    }

    const handleShowModalProvinsi = () => {
        setGModalList({
            show: true,
            title: 'Pilih Provinsi',
            columns: [{ name: 'provinsi', text: 'Provinsi' }],
            tableName: 'mrprovinsi?is_aktif=1',
            onHide: () => { setGModalList({ show: false }) },
            onClickOk: (row) => {
                let temp = Object.assign({}, data)
                
                temp['provinsi'] = row['provinsi']

                //kosongkan kota, kecamatan, dll
                temp['id_kota'] = ''
                temp['nama_kota'] = ''
                temp['kecamatan'] = ''
                temp['kelurahan'] = ''
                temp['kodepos'] = ''
                
                setData(temp)
            },
            multiple: false

        })

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
                                    <Form.Label as={Col} md={3}>Kode</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="kode" defaultValue={data.kode} onChange={(e) => handleChange(e)} readOnly required />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Nama</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="nama" defaultValue={data.nama} onChange={(e) => handleChange(e)} required />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Alamat</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="alamat" defaultValue={data.alamat} onChange={(e) => handleChange(e)} required />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Provinsi</Form.Label>
                                    <Col md={7}>
                                        <InputGroup>
                                            <Form.Control type="text" name="provinsi" value={data.provinsi} readOnly required />
                                            <Button variant='primary' onClick={() => handleShowModalProvinsi()}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                        </InputGroup>
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Kota</Form.Label>
                                    <Col md={7}>
                                        <InputGroup>
                                            <Form.Control type="text" name="nama_kota" value={data.nama_kota} readOnly required />
                                            <Form.Control type='hidden' name='id_kota' value={data.id_kota}  />
                                            <Button variant='primary' onClick={() => handleShowModalKota()}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                        </InputGroup>
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Kecamatan</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="kecamatan" value={data.kecamatan} readOnly required />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Kelurahan</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="kelurahan" value={data.kelurahan} readOnly required />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Kode Pos</Form.Label>
                                    <Col md={7}>
                                        <InputGroup>
                                            <Form.Control type="text" name="kodepos" value={data.kodepos} readOnly required />
                                            <Button variant='primary' onClick={() => handleShowModalKotp()}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                        </InputGroup>
                                    </Col>
                                </Row>

                                <Row className='mb-4'>
                                    <Form.Label as={Col} md={3}>Status Aktif</Form.Label>
                                    <Col md={7}>
                                        <Form.Check type="switch" name="is_aktif" label={data.is_aktif === 1 ? 'Aktif' : 'Tidak Aktif'} checked={data.is_aktif === 1 ? true : false} onChange={(e) => handleChange(e)} />
                                    </Col>
                                </Row>

                            </Col>

                            <Col md={5}>
                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Email</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="email" defaultValue={data.email} onChange={(e) => handleChange(e)} />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Tlp 1</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="tlp_1" defaultValue={data.tlp_1} onChange={(e) => handleChange(e)} />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Tlp 2</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="tlp_2" defaultValue={data.tlp_2} onChange={(e) => handleChange(e)} />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Longitude</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="lng" defaultValue={data.lng} onChange={(e) => handleChange(e)} />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Latitude</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="lat" defaultValue={data.lat} onChange={(e) => handleChange(e)} />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>User Update</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="lat" defaultValue={data.user_update} readOnly />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>TGL Update</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="lat" defaultValue={data.updated_ata} readOnly />
                                    </Col>
                                </Row>

                            </Col>
                        </Row>
                    </Card.Body>

                    <Card.Header><span className='d-inline-block col-md-2 border-end'>Transaksi Supplier</span></Card.Header>

                    <Card.Body>
                        <Row>
                            <Col md={5}>
                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Cara Bayar</Form.Label>
                                    <Col md={7}>
                                        <Form.Select name='cara_bayar' value={data.cara_bayar} onChange={(e) => handleChange(e)} required>
                                            <option value={0}>Tunai</option>
                                            <option value={1}>Piutang</option>
                                        </Form.Select>
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Hari Bayar</Form.Label>
                                    <Col md={7}>
                                        <GInputNumber name='hari_bayar' initialValue={data.hari_bayar} onChange={(e) => handleChange(e)} />
                                    </Col>
                                </Row>

                            </Col>

                            <Col md={5}>
                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Jenis Supplier</Form.Label>
                                    <Col md={7}>
                                        <InputGroup>
                                            <Form.Control type="text" name="nama_jenissupl" value={data.nama_jenissupl} readOnly required />
                                            <Form.Control type='hidden' name='id_jenissupl' value={data.id_jenissupl} required />
                                            <Button variant='primary' onClick={() => handleShowModalList('mdsupj?is_aktif=1', { id: 'id_jenissupl', nama: 'nama_jenissupl' }, 'Pilih Jenis Supplier')}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                        </InputGroup>
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Merk</Form.Label>
                                    <Col md={7}>
                                        <InputGroup>
                                            <Form.Control type="text" name="nama_merk" value={data.nama_merk} readOnly required />
                                            <Form.Control type='hidden' name='id_merk' value={data.id_merk} required />
                                            <Button variant='primary' onClick={() => handleShowModalList('mrmerk?is_aktif=1', { id: 'id_merk', nama: 'nama_merk' }, 'Pilih Jenis Customer')}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                        </InputGroup>
                                    </Col>
                                </Row>

                            </Col>

                        </Row>
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

    const ViewList = () => (
        <GListEdit
            tableName='mdsupl'
            onClickAdd={() => handleClickAdd()}
            onClickEdit={(id) => handleClickEdit(id)}
            columns={{ id: null, kode: '', nama: '' }}
            displayColumns={[
                { name: 'kode', text: 'Kode', type: 'text', updatable: false },
                { name: 'nama', text: 'Nama', type: 'text', updatable: false },
                { name: 'tlp_1', text: 'Tlp', type: 'text', updatable: false },
                { name: 'nama_kota', text: 'Kota', type: 'text', updatable: false },
                { name: 'nama_jenissupl', text: 'Jenis Supplier', type: 'text', updatable: false },
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

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, Form, Button, InputGroup, Row, Col } from 'react-bootstrap'
import { URL_API, GModal, GModalList, GInputNumber } from '../../utils/Index'

export const SyParm = () => {
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

    useEffect(() => {
        const fetchData = async () => {
            const headers = {
                accept: 'application/json',
                Authorization: 'Bearer ' + token
            }

            const res = await axios.get(URL_API + 'syparm?', { headers: headers })

            if (res.data.status === 200) {
                if (res.data['syparm']) {
                    setData(res.data['syparm'][0])
                } else {
                    setGModal({
                        show: true,
                        type: 'information',
                        title: 'Error',
                        body: 'Gagal mendapatkan data',
                        buttons: [{ text: 'Ok', onClick: null }]
                    })

                }
            }
        }

        fetchData()

    }, [])

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

        var payload = JSON.stringify({ 'syparm': arr })

        const res = await axios.put(URL_API + 'syparm?', payload, config)

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

    const handleShowModalKota = () => {
        setGModalList({
            show: true,
            title: 'Pilih Kota',
            columns: [{ name: 'kode', text: 'Kode' }, { name: 'nama', text: 'Nama Kota' }],
            tableName: 'mrkota?provinsi=' + data['provinsi'] + '&is_aktif=1',
            onHide: () => { setGModalList({ show: false }) },
            onClickOk: (row) => {
                let temp = { ...data }

                temp['id_kota'] = row['id']
                temp['nama_kota'] = row['nama']

                //kosongkan kecamatan, dll
                temp['kecamatan'] = null
                temp['kelurahan'] = null
                temp['kodepos'] = null

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
                let temp = { ...data }

                temp['kodepos'] = row['kodepos']
                temp['kecamatan'] = row['kecamatan']
                temp['kelurahan'] = row['kelurahan']

                setData(temp)
            },
            multiple: false

        })

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
                let temp = { ...data }
                temp['provinsi'] = row['provinsi']

                //kosongkan kota, kecamatan, dll
                temp['id_kota'] = null
                temp['nama_kota'] = null
                temp['kecamatan'] = null
                temp['kelurahan'] = null
                temp['kodepos'] = null

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

    return (
        <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
            <Card>
                <Card.Header>
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
                                        <Form.Control type="text" name="provinsi" defaultValue={data.provinsi} onChange={(e) => handleChange(e)} readOnly required />
                                        <Button variant='primary' onClick={() => handleShowModalProvinsi()}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kota</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_kota" defaultValue={data.nama_kota} onChange={(e) => handleChange(e)} readOnly required />
                                        <Form.Control type='hidden' name='id_kota' defaultValue={data.id_kota} onChange={(e) => handleChange(e)} />
                                        <Button variant='primary' onClick={() => handleShowModalKota()}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kecamatan</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="kecamatan" defaultValue={data.kecamatan} onChange={(e) => handleChange(e)} readOnly required />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kelurahan</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="kelurahan" defaultValue={data.kelurahan} onChange={(e) => handleChange(e)} readOnly required />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kode Pos</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="kodepos" defaultValue={data.kodepos} onChange={(e) => handleChange(e)} readOnly required />
                                        <Button variant='primary' onClick={() => handleShowModalKotp()}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
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

                <Card.Header><span className='d-inline-block col-md-2 border-end'>Parameter</span></Card.Header>

                <Card.Body>
                    <Row>
                        <Col md={5}>
                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Supplier Barang</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_jenissuplbrg" defaultValue={data.nama_jenissuplbrg} onChange={(e) => handleChange(e)} readOnly required />
                                        <Form.Control type='hidden' name='id_jenissuplbrg' defaultValue={data.id_jenissuplbrg} onChange={(e) => handleChange(e)} />
                                        <Button variant='primary' onClick={() => handleShowModalList('mdsupj?is_aktif=1', { id: 'id_jenissuplbrg', nama: 'nama_jenissuplbrg' }, 'Pilih Jenis Supplier')}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Tipe Gudang PO Barang</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_tipegudangpo" defaultValue={data.nama_tipegudangpo} onChange={(e) => handleChange(e)} readOnly required />
                                        <Form.Control type='hidden' name='id_tipegudangpo' defaultValue={data.id_tipegudangpo} onChange={(e) => handleChange(e)} />
                                        <Button variant='primary' onClick={() => handleShowModalList('mdgudt?is_aktif=1', { id: 'id_tipegudangpo', nama: 'nama_tipegudangpo' }, 'Pilih Tipe Gudang')}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                        </Col>

                        <Col md={5}>
                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Penempatan produk</Form.Label>
                                <Col md={7}>
                                    <Form.Select name='lokasi_produk' value={data.lokasi_produk} onChange={(e) => handleChange(e)} required>
                                        <option value={1}>Produk per Lokasi</option>
                                        <option value={2}>Varian per Lokasi</option>
                                    </Form.Select>
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                </Card.Body>

                <Card.Header><span className='d-inline-block col-md-2 border-end'>Penomoran Transaksi</span></Card.Header>

                <Card.Body>
                    <Row>
                        <Col md={5}>
                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>ID / No. Purchase Order</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="id_po" defaultValue={data.id_po} onChange={(e) => handleChange(e)} />
                                        <Form.Control type='text' name='no_po' defaultValue={data.no_po} onChange={(e) => handleChange(e)} />
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>ID / No. Penerimaan Brg</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="id_gr" defaultValue={data.id_gr} onChange={(e) => handleChange(e)} />
                                        <Form.Control type='text' name='no_gr' defaultValue={data.no_gr} onChange={(e) => handleChange(e)} />
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>ID / No. Putaway</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="id_pw" defaultValue={data.id_pw} onChange={(e) => handleChange(e)} />
                                        <Form.Control type='text' name='no_pw' defaultValue={data.no_pw} onChange={(e) => handleChange(e)} />
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Col>

                        <Col md={5}>
                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>ID / No. Retur PO</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="id_rtpo" defaultValue={data.id_rtpo} onChange={(e) => handleChange(e)} />
                                        <Form.Control type='text' name='no_rtpo' defaultValue={data.no_rtppo} onChange={(e) => handleChange(e)} />
                                    </InputGroup>
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                </Card.Body>
            </Card>

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

        </Form>
    )
}

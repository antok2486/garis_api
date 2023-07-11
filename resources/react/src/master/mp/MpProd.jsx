import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Button, Card, Row, Col, Form, InputGroup, Table } from 'react-bootstrap'
import { URL_API, GListEdit, GModal, GModalList, GInputNumber } from '../../utils/Index'
import '../../assets/css/mpprod.css'

export const MpProd = () => {
    const [id, setId] = useState()
    const [view, setView] = useState('list')
    const [data, setData] = useState({})
    const [dataProvLevel, setDataProvLevel] = useState([])
    const [dataProv, setDataProv] = useState([])
    const [dataSku, setDataSku] = useState([])
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

        const res = await axios.get(URL_API + 'mpprod?id=' + id, { headers: headers })

        if (res.data.status === 200) {
            //console.log(res.data)
            if (res.data['mpprod']) {
                //replace null with empty string
                for (let col in res.data['mpprod'][0]) {
                    if (!res.data['mpprod'][0][col]) { res.data['mpprod'][0][col] = '' }
                }

                for (let col in res.data['mpprov']) {
                    if (!res.data['mpprov'][col]) { res.data['mpprov'][col] = '' }
                }

                for (let col in res.data['mppros']) {
                    if (!res.data['mppros'][col]) { res.data['mppros'][col] = '' }
                }

                setData(res.data['mpprod'][0])
                setDataProv(res.data['mpprov'])

                const arrLevel = []
                res.data.mpprov.forEach(row => {
                    if (!arrLevel.find(key => key.id_jenisvarian === row.id_jenisvarian)) {
                        arrLevel.push({ nama_jenisvarian: row.nama_jenisvarian, id_jenisvarian: row.id_jenisvarian, level: row.level })
                    }
                })

                setDataProvLevel(arrLevel)
                setDataSku(res.data['mppros'])

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

    const handleChangeSku = (e, row) => {
        var name = e.target.name
        var value = e.target.value

        var temp = dataSku

        temp.forEach((el, index) => {
            if (el === row) {
                temp[index][name] = value
            }
        })

        setDataSku(temp)
    }

    const handleClickAdd = () => {
        setData({
            id: null, kode: null, nama: null, deskripsi: null, gambar: null, id_merk: null,
            id_subkategori: null, id_bahan: null, tgl_produksi: null, tgl_beli: null, hrg_beli: null,
            hrg_inv: null, is_aktif: 1, user_update: null
        })

        setDataProvLevel([])
        setDataProv([])
        setDataSku([])
        
        setView('edit')
    }

    const handleClickEdit = async (id_) => {
        await fetchData(id_)

        setView('edit')
    }

    const handleSave = async () => {
        var temp = dataSku

        //remove commas
        temp.forEach((el, index) => {
            temp[index]['berat'] = temp[index]['berat'] ? temp[index]['berat'].toString().replace(/,/g, '') : 0
            temp[index]['panjang'] = temp[index]['panjang'] ? temp[index]['panjang'].toString().replace(/,/g, '') : 0
            temp[index]['lebar'] = temp[index]['lebar'] ? temp[index]['lebar'].toString().replace(/,/g, '') : 0
            temp[index]['tinggi'] = temp[index]['tinggi'] ? temp[index]['tinggi'].toString().replace(/,/g, '') : 0
            temp[index]['hrg_jual'] = temp[index]['hrg_jual'] ? temp[index]['hrg_jual'].toString().replace(/,/g, '') : 0
            temp[index]['hrg_beli'] = temp[index]['hrg_beli'] ? temp[index]['hrg_beli'].toString().replace(/,/g, '') : 0
        })

        setDataSku(temp)
        var config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }

        var payload = JSON.stringify({ 'mpprod': data, 'mpprov': dataProv, 'mppros': dataSku })
        console.log(dataProv)

        const res = await axios.put(URL_API + 'mpprod?', payload, config)

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

                if (cols.id === 'id_merk') {
                    temp['kode_merk'] = row['kode']
                } else if (cols.id === 'id_koleksi') {
                    temp['kode_koleksi'] = row['kode']
                } else if (cols.id === 'id_kategori') {
                    temp['kode_kategori'] = row['kode']
                } else if (cols.id === 'id_subkategori') {
                    temp['kode_subkategori'] = row['kode']
                } else if (cols.id === 'id_bahan') {
                    temp['kode_bahan'] = row['kode']
                } else if (cols.id === 'id_jenisvarian') {
                    var dataProvLevel_ = dataProvLevel
                    var level = dataProvLevel_.length ? dataProvLevel_.length : 0

                    dataProvLevel_.push({ nama_jenisvarian: row.nama, id_jenisvarian: row.id, level: level })

                    setDataProvLevel(dataProvLevel_)

                    //level added =>reseting all sku's
                    setDataSku([])
                }

                if (!temp['id']) {
                    temp['kode'] = (temp['kode_merk'] ? temp['kode_merk'] : '') +
                        (temp['kode_koleksi'] ? temp['kode_koleksi'] : '') +
                        (temp['kode_kategori'] ? temp['kode_kategori'] : '') +
                        (temp['kode_subkategori'] ? temp['kode_subkategori'] : '') +
                        (temp['kode_bahan'] ? temp['kode_bahan'] : '')
                }

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

    const handleVarsChanged = (data_, add = true) => {
        var dataProv_ = []

        if (add) {
            dataProv_ = dataProv

            dataProv_.push({
                id_jenisvarian: data_.id_jenisvarian,
                id_produk: id,
                id_varian: data_.id,
                is_aktif: 1,
                kode_varian: data_.kode,
                level: data_.level,
                nama_jenisvarian: data_.nama_jenisvarian,
                nama_varian: data_.nama
            })
        } else {
            dataProv.forEach(row => {
                if (row !== data_) {
                    dataProv_.push(row)
                }
            })
        }

        const arrLevel = []
        dataProv_.forEach(row => {
            if (!arrLevel.find(key => key.id_jenisvarian === row.id_jenisvarian)) {
                arrLevel.push({ nama_jenisvarian: row.nama_jenisvarian, id_jenisvarian: row.id_jenisvarian, level: row.level })
            }
        })

        /*create SKU*/
        var kode = data['kode']
        var dataSku_ = []

        if (add) {
            dataSku_ = dataSku

            dataProv_.filter(key1 => key1.level === 0).forEach(lvl1 => {
                if (arrLevel.length === 1) {
                    if (!dataSku_.find(key2 => key2.id_varian_1 === lvl1.id_varian)) {
                        dataSku_.push({
                            id: null,
                            id_produk: id,
                            created_at: null,
                            updated_at: null,
                            id_varian_1: lvl1.id_varian,
                            id_varian_2: null,
                            nama_varian_1: lvl1.nama_varian,
                            nama_varian_2: null,
                            kode: kode + lvl1.kode_varian,
                            kode_varian_1: lvl1.kode_varian,
                            kode_varian_2: null,
                            berat: 0,
                            panjang: 0,
                            lebar: 0,
                            tinggi: 0,
                            is_aktif: 1
                        })
                    }

                } else {
                    dataProv_.filter(key2 => key2.level === 1).forEach(lvl2 => {
                        if (!dataSku_.find(key3 => key3.id_varian_1 === lvl1.id_varian && key3.id_varian_2 === lvl2.id_varian)) {
                            dataSku_.push({
                                id: null,
                                id_produk: id,
                                created_at: null,
                                updated_at: null,
                                id_varian_1: lvl1.id_varian,
                                id_varian_2: lvl2.id_varian,
                                nama_varian_1: lvl1.nama_varian,
                                nama_varian_2: lvl2.nama_varian,
                                kode: kode + lvl1.kode_varian + lvl2.kode_varian,
                                kode_varian_1: lvl1.kode_varian,
                                kode_varian_2: lvl2.kode_varian,
                                berat: 0,
                                panjang: 0,
                                lebar: 0,
                                tinggi: 0,
                                is_aktif: 1
                            })
                        }
                    })
                }
            })
        } else {
            dataSku_ = []
            dataProv_.filter(key1 => key1.level === 0).forEach(lvl1 => {
                if (arrLevel.length === 1) {
                    var arr = dataSku.filter(key2 => key2.id_varian_1 === lvl1.id_varian && !key2.id_varian_2)
                    if (!arr || arr.length === 0) {
                        dataSku_.push({
                            id_varian_1: lvl1.id_varian,
                            id_varian_2: null,
                            nama_varian_1: lvl1.nama_varian,
                            nama_varian_2: null,
                            kode_varian_1: lvl1.kode_varian,
                            kode_varian_2: null,
                            berat: 0,
                            panjang: 0,
                            lebar: 0,
                            tinggi: 0
                        })
                    } else {
                        dataSku_.push(...new Set(arr))
                    }

                } else {
                    dataProv_.filter(key2 => key2.level === 1).forEach(lvl2 => {
                        var arr = dataSku.filter(key3 => key3.id_varian_1 === lvl1.id_varian && key3.id_varian_2 === lvl2.id_varian)
                        dataSku_.push(...new Set(arr))
                    })
                }
            })

        }

        setDataProv(dataProv_)
        setDataProvLevel(arrLevel)
        setDataSku(dataSku_)

    }

    const openModalVarian = async (provL) => {
        const headers = {
            accept: 'application/json',
            Authorization: 'Bearer ' + token
        }

        const res = await axios.get(URL_API + 'mpvars?is_aktif=1&id_jenisvarian=' + provL.id_jenisvarian, { headers: headers })

        if (res.data.status == 200) {
            var arrData = []

            //filter not selected vars only
            res.data['mpvars'].filter(key => key.id_jenisvarian === provL.id_jenisvarian).forEach(row => {
                if (!dataProv.find(key => key.id_varian === row.id)) {
                    row['level'] = provL.level
                    arrData.push(row)
                }
            })

            //open modal list
            setGModalList({
                show: true,
                title: 'Pilih Varian',
                columns: [{ name: 'kode', text: 'Kode' }, { name: 'nama', text: 'Nama' }],
                //tableName: 'mpvars?is_aktif=1&id_jenisvarian=' + provL.id_jenisvarian,
                arrData: arrData,
                onHide: () => { setGModalList({ show: false }) },
                onClickOk: (row) => handleVarsChanged(row),
                multiple: false

            })

        }
    }

    const MpprosTable = () => (
        <Table responsive className="table-bordered" cellSpacing="0">
            <thead className="bg-primary text-light">
                <tr>
                    <th>Variasi</th>
                    <th className="text-end">Berat (gr)</th>
                    <th className="text-end">Panjang (cm)</th>
                    <th className="text-end">Lebar</th>
                    <th className="text-end">Tinggi</th>
                    <th className="text-end">Harga Jual (Rp)</th>
                    <th className="text-end">Harga Beli (Rp)</th>
                    <th>SKU</th>
                </tr>
            </thead>

            <tbody>
                {dataSku && dataSku.map(row => (
                    <tr key={row.id ? row.id : row.id_varian_1 + ' / ' + row.id_varian_2}>
                        <td>{(row.nama_varian_1 ? row.nama_varian_1 : '') + (row.nama_varian_2 ? (' / ' + row.nama_varian_2) : '')}</td>
                        <td><GInputNumber name="berat" initialValue={row.berat} className="text-end" onChange={(e) => handleChangeSku(e, row)} /></td>
                        <td><GInputNumber name="panjang" initialValue={row.panjang} className="text-end" onChange={(e) => handleChangeSku(e, row)} /></td>
                        <td><GInputNumber name="lebar" initialValue={row.lebar} className="text-end" onChange={(e) => handleChangeSku(e, row)} /></td>
                        <td><GInputNumber name="tinggi" initialValue={row.tinggi} className="text-end" onChange={(e) => handleChangeSku(e, row)} /></td>
                        <td><GInputNumber name="hrg_jual" initialValue={row.hrg_jual} className="text-end" onChange={(e) => handleChangeSku(e, row)} /></td>
                        <td><GInputNumber name="hrg_beli" initialValue={row.hrg_beli} className="text-end" readOnly={true} onChange={(e) => handleChangeSku(e, row)} /></td>
                        <td><Form.Control type="text" name="kode" defaultValue={row.kode} readOnly onChange={(e) => handleChangeSku(e, row)} /></td>
                    </tr>
                ))}
            </tbody>
        </Table>

    )

    const Mpprov = ({ provL }) => {
        return (
            <Row className="mb-4">
                <Col md={2}>
                    <Button className="btn-varj" onClick={() => openModalVarian(provL)}>
                        {provL.nama_jenisvarian}
                    </Button>
                </Col>

                <Col md={7}>
                    {dataProv && dataProv.filter(key => key.level === provL.level).map(prov => {
                        return (
                            <div key={prov.level + prov.id_varian} className="d-inline-block me-3">
                                <span className="mpprov-selected">{prov.nama_varian}</span>
                                <Button className="mpprov-selected-btn" onClick={() => handleVarsChanged(prov, false)}>
                                    <i className="fa-solid fa-xmark"></i>
                                </Button>
                                <Form.Control type="hidden" name="id_varian" value={prov.id_varian} />
                                <Form.Control type="hidden" name="level" value={provL.level} />
                            </div>
                        )
                    })}
                </Col>
            </Row>

        )
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
                                    <Form.Label as={Col} md={3}>Deskripsi</Form.Label>
                                    <Col md={7}>
                                        <Form.Control as="textarea" name="deskripsi" defaultValue={data.deskripsi} onChange={(e) => handleChange(e)} required />
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
                                    <Form.Label as={Col} md={3}>TGL Produksi</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="tgl_produksi" defaultValue={data.tgl_produksi} readOnly />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>TGL Beli</Form.Label>
                                    <Col md={7}>
                                        <Form.Control type="text" name="tgl_beli" defaultValue={data.tgl_beli} readOnly />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Harga Beli</Form.Label>
                                    <Col md={7}>
                                        <GInputNumber name='hrg_beli' initialValue={data.hrg_beli} readOnly />
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>HPP</Form.Label>
                                    <Col md={7}>
                                        <GInputNumber name='hrg_inv' initialValue={data.hrg_inv} readOnly />
                                    </Col>
                                </Row>

                            </Col>
                        </Row>
                    </Card.Body>

                    <Card.Header>
                        <span className='d-inline-block col-md-2 border-end'>Atribut</span>
                    </Card.Header>

                    <Card.Body>
                        <Row>
                            <Col md={5}>
                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Merk</Form.Label>
                                    <Col md={7}>
                                        <InputGroup>
                                            <Form.Control type="text" name="nama_merk" value={data.nama_merk} readOnly required />
                                            <Form.Control type='hidden' name='id_merk' value={data.id_merk} required />
                                            <Button variant='primary' onClick={() => handleShowModalList('mrmerk?is_aktif=1', { id: 'id_merk', nama: 'nama_merk' }, 'Pilih Merk')}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                        </InputGroup>
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Koleksi Produk</Form.Label>
                                    <Col md={7}>
                                        <InputGroup>
                                            <Form.Control type="text" name="nama_koleksi" value={data.nama_koleksi} readOnly required />
                                            <Form.Control type='hidden' name='id_koleksi' value={data.id_koleksi} required />
                                            <Button variant='primary' onClick={() => handleShowModalList('mpcolc?is_aktif=1', { id: 'id_koleksi', nama: 'nama_koleksi' }, 'Pilih Koleksi')}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                        </InputGroup>
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Kategori Produk</Form.Label>
                                    <Col md={7}>
                                        <InputGroup>
                                            <Form.Control type="text" name="nama_kategori" value={data.nama_kategori} readOnly required />
                                            <Form.Control type='hidden' name='id_kategori' value={data.id_kategori} required />
                                            <Button variant='primary' onClick={() => handleShowModalList('mpcatg?is_aktif=1', { id: 'id_kategori', nama: 'nama_kategori' }, 'Pilih Kategori')}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                        </InputGroup>
                                    </Col>
                                </Row>

                            </Col>

                            <Col md={5}>
                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Sub Kategori Produk</Form.Label>
                                    <Col md={7}>
                                        <InputGroup>
                                            <Form.Control type="text" name="nama_subkategori" value={data.nama_subkategori} readOnly required />
                                            <Form.Control type='hidden' name='id_subkategori' value={data.id_subkategori} required />
                                            <Button variant='primary' onClick={() => handleShowModalList('mpcats?is_aktif=1&id_kategori=' + data.id_kategori, { id: 'id_subkategori', nama: 'nama_subkategori' }, 'Pilih Sub Kategori')}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                        </InputGroup>
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Form.Label as={Col} md={3}>Bahan Utama</Form.Label>
                                    <Col md={7}>
                                        <InputGroup>
                                            <Form.Control type="text" name="nama_bahan" value={data.nama_bahan} readOnly required />
                                            <Form.Control type='hidden' name='id_bahan' value={data.id_bahan} required />
                                            <Button variant='primary' onClick={() => handleShowModalList('mpbahn?is_aktif=1', { id: 'id_bahan', nama: 'nama_bahan' }, 'Pilih Bahan Utama')}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                        </InputGroup>
                                    </Col>
                                </Row>

                            </Col>
                        </Row>
                    </Card.Body>

                    <Card.Header>
                        <span className='d-inline-block col-md-2 border-end'>Varian</span>
                        {dataProvLevel.length < 2 &&
                            <Button variant="primary" onClick={() => handleShowModalList('mpvarj?is_aktif=1', { id: 'id_jenisvarian', nama: 'nama_jenisvarian' }, 'Pilih Jenis Varian')}>Tambah Varian</Button>
                        }
                    </Card.Header>

                    <Card.Body>
                        <Row>
                            <Col>
                                {dataProvLevel && dataProvLevel.map(provL => (
                                    <Mpprov provL={provL} key={provL.id_jenisvarian} />
                                ))}
                            </Col>
                        </Row>
                    </Card.Body>

                    <Card.Header><span className='d-inline-block col-md-2 border-end'>Spesifikasi</span></Card.Header>

                    <Card.Body>
                        <MpprosTable />
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
            tableName='mpprod'
            onClickAdd={() => handleClickAdd()}
            onClickEdit={(id) => handleClickEdit(id)}
            columns={{ id: null, kode: '', nama: '' }}
            displayColumns={[
                { name: 'kode', text: 'Kode', type: 'text', updatable: false },
                { name: 'nama', text: 'Nama', type: 'text', updatable: false },
                { name: 'nama_merk', text: 'Merk', type: 'text', updatable: false },
                { name: 'nama_koleksi', text: 'Koleksi', type: 'text', updatable: false },
                { name: 'nama_golproduk', text: 'Gol Produk', type: 'text', updatable: false },
                { name: 'nama_kategori', text: 'Kategori Produk', type: 'text', updatable: false },
                { name: 'nama_subkategori', text: 'Sub Kategori Produk', type: 'text', updatable: false },
                { name: 'nama_bahan', text: 'Bahan Utama', type: 'text', updatable: false },
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

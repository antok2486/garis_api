import React, { useRef, useState } from 'react'
import { GFormEdit, GListEdit, GInputNumber } from "../../utils/Index"
import { Button, Row, Col, Form, InputGroup, Card, Table } from "react-bootstrap"

export const MdGudg = () => {
    const [dataGudg, setDataGudg] = useState({})
    const [dataGudk, setDataGudk] = useState([])
    const [formState, setFormState] = useState('new')
    const [validated, setValidated] = useState(false)
    const [view, setView] = useState('list')
    const modalColumns = [{ name: 'kode', text: 'Kode' }, { name: 'nama', text: 'Nama' }]
    const modalColumnsProv = [{ name: 'provinsi', text: 'Provinsi' }]
    const modalColumnsKotp = [{ name: 'kodepos', text: 'Kode Pos' }, { name: 'kecamatan', text: 'Kecamatan' }, { name: 'kelurahan', text: 'Kelurahan' }]
    const ref = useRef()

    const handleChangeKapasitas = (e, index) => {
        let temp = dataGudk.map(l => Object.assign({}, l))

        if (e.target.name === 'mdgudk_kapasitas') {
            temp[index]['kapasitas'] = e.target.value
        }

        setDataGudk(temp)
    }

    const handleClickAdd = () => {
        setDataGudg({
            id: '', kode: '', nama: '', alamat: '', provinsi: '',
            id_kota: '', kecamatan: '', kelurahan: '', kodepos: '', lng: '',
            lat: '', tlp_1: '', tlp_2: '', nik_1: '', nik_2: '',
            nik_3: '', nik_4: '', nik_5: '', id_merk: '', id_customer: '', id_tipegudang: '',
            jenis_gudang: 1, flag_alamat: 1, kapasitas: '', flag_kapasitas: 1, is_aktif: 1,
            user_update: '',
            nama_kota: '', nama_tipegudang: '', nama_merk: '', nama_customer: '',
            kode_tipegudang: '', kode_merk: ''
        })

        setDataGudk([])

        setValidated(false)
        setFormState('new')
        setView('edit')

    }

    const handleClickAddKapasitas = (row) => {
        let temp = dataGudk.map(l => Object.assign({}, l))
        let idGudang = dataGudg['id']
        let cols = { 'id': '', 'id_gudang': idGudang, 'id_merk': row['id'], 'nama_merk': row['nama'], 'kapasitas': 0 }

        if (!temp.find(key => key.id_merk === row['id'])) {
            //temp.unshift(cols)
            temp.push(cols)
        }

        setDataGudk(temp)
    }

    const handleClickEdit = async (id) => {
        let resData = await ref.current.axiosGet('mdgudg?id=' + id)

        if (resData.status === 200) {
            //replace null with empty string
            if (resData['mdgudg'][0]) {
                for (let col in resData['mdgudg'][0]) {
                    if (!resData['mdgudg'][0][col]) { resData['mdgudg'][0][col] = '' }
                }

                setDataGudg(resData['mdgudg'][0])
            }

            if (resData['mdgudk']) {
                for (let row in resData['mdgudk']) {
                    for (let col in resData['mdgudk'][row]) {
                        if (!resData['mdgudk'][row][col]) { resData['mdgudk'][row][col] = '' }
                    }
                }

                setDataGudk(resData['mdgudk'])
            }

            setValidated(false)
            setFormState('edit')
            setView('edit')

        }
    }

    const handleModalCustSelected = (row) => {
        let temp = Object.assign({}, dataGudg)

        temp['id_customer'] = row['id']
        temp['nama_customer'] = row['nama']

        setDataGudg(temp)
    }

    const handleModalGudtSelected = (row) => {
        let temp = Object.assign({}, dataGudg)

        temp['id_tipegudang'] = row['id']
        temp['nama_tipegudang'] = row['nama']
        temp['kode_tipegudang'] = row['kode']

        if (!temp['id']) {
            temp['kode'] = (temp['kode_tipegudang'] ? temp['kode_tipegudang'] : '') +
                (temp['kode_merk'] ? temp['kode_merk'] : '')
        }

        setDataGudg(temp)

    }

    const handleModalKotaSelected = (row) => {
        let temp = Object.assign({}, dataGudg)

        temp['id_kota'] = row['id']
        temp['nama_kota'] = row['nama']

        //kosongkan kecamatan, dll
        temp['kecamatan'] = ''
        temp['kelurahan'] = ''
        temp['kodepos'] = ''

        setDataGudg(temp)

    }

    const handleModalKotpSelected = (row) => {
        let temp = Object.assign({}, dataGudg)

        temp['kodepos'] = row['kodepos']
        temp['kecamatan'] = row['kecamatan']
        temp['kelurahan'] = row['kelurahan']

        setDataGudg(temp)

    }

    const handleModalMerkSelected = (row) => {
        let temp = Object.assign({}, dataGudg)

        temp['id_merk'] = row['id']
        temp['nama_merk'] = row['nama']
        temp['kode_merk'] = row['kode']

        if (!temp['id']) {
            temp['kode'] = (temp['kode_tipegudang'] ? temp['kode_tipegudang'] : '') +
                (temp['kode_merk'] ? temp['kode_merk'] : '')
        }

        setDataGudg(temp)

    }

    const handleModalProvSelected = (row) => {
        let temp = Object.assign({}, dataGudg)

        temp['provinsi'] = row['provinsi']

        //kosongkan kota, kecamatan, dll
        temp['id_kota'] = ''
        temp['nama_kota'] = ''
        temp['kecamatan'] = ''
        temp['kelurahan'] = ''
        temp['kodepos'] = ''

        setDataGudg(temp)

    }

    const handleSave = async () => {
        let arrGudg = Object.assign({}, dataGudg)
        let arrGudk = dataGudk.map(l => Object.assign({}, l))

        //remove commas from input number
        arrGudg['kapasitas'] = arrGudg['kapasitas'] ? arrGudg['kapasitas'].toString().replace(/,/g, '') : 0

        for (let index in arrGudk) {
            arrGudk[index]['kapasitas'] = arrGudk[index]['kapasitas'] ? arrGudk[index]['kapasitas'].toString().replace(/,/g, '') : 0
        }

        let payload = JSON.stringify({ 'mdgudg': arrGudg, 'mdgudk': arrGudk })

        let resData = await ref.current.axiosPut('mdgudg', payload)

        if (resData.status === 200) {
            setView('list')
        }

    }

    const ViewEdit = () => (
        <Form noValidate autoComplete='off' validated={validated} onSubmit={(e) => ref.current.handleSubmit(e, handleSave)}>
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
                                    <Form.Control type="text" name="kode" defaultValue={dataGudg.kode} onKeyDown={(e) => e.preventDefault()} required />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Nama</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="nama" defaultValue={dataGudg.nama} onChange={(e) => ref.current.handleChangeDataHeader(e)} required />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Alamat</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="alamat" defaultValue={dataGudg.alamat} onChange={(e) => ref.current.handleChangeDataHeader(e)} required />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Provinsi</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="provinsi" value={dataGudg.provinsi} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mrprovinsi?is_aktif=1', modalColumnsProv, 'Pilih Provinsi', handleModalProvSelected)}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kota</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_kota" value={dataGudg.nama_kota} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Form.Control type='hidden' name='id_kota' value={dataGudg.id_kota} />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mrkota?provinsi=' + dataGudg['provinsi'] + '&is_aktif=1', modalColumns, 'Pilih Kota', handleModalKotaSelected)}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kecamatan</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="kecamatan" value={dataGudg.kecamatan} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kelurahan</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="kelurahan" value={dataGudg.kelurahan} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kode Pos</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="kodepos" value={dataGudg.kodepos} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mrkotp?id_kota=' + dataGudg['id_kota'] + '&is_aktif=1', modalColumnsKotp, 'Pilih Kode Pos', handleModalKotpSelected)}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className='mb-4'>
                                <Form.Label as={Col} md={3}>Status Aktif</Form.Label>
                                <Col md={7}>
                                    <Form.Check type="switch" name="is_aktif" label={dataGudg.is_aktif === 1 ? 'Aktif' : 'Tidak Aktif'} checked={dataGudg.is_aktif === 1 ? true : false} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                        </Col>

                        <Col md={5}>
                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Tlp 1</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="tlp_1" defaultValue={dataGudg.tlp_1} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Tlp 2</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="tlp_2" defaultValue={dataGudg.tlp_2} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Longitude</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="lng" defaultValue={dataGudg.lng} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Latitude</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="lat" defaultValue={dataGudg.lat} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>User Update</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="lat" defaultValue={dataGudg.user_update} readOnly />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>TGL Update</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="lat" defaultValue={dataGudg.updated_ata} readOnly />
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                </Card.Body>

                <Card.Header><span className='d-inline-block col-md-2 border-end'>Transaksi Gudang</span></Card.Header>

                <Card.Body>
                    <Row>
                        <Col md={5}>
                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Tipe Gudang</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_tipegudang" value={dataGudg.nama_tipegudang} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Form.Control type='hidden' name='id_tipegudang' value={dataGudg.id_tipegudang} />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mdgudt?is_aktif=1', modalColumns, 'Pilih Tipe Gudang', handleModalGudtSelected)}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Jenis Gudang</Form.Label>
                                <Col md={7}>
                                    <Form.Select name='jenis_gudang' value={dataGudg.jenis_gudang} onChange={(e) => ref.current.handleChangeDataHeader(e)} required>
                                        <option value={1}>Gudang</option>
                                        <option value={2}>Counter</option>
                                    </Form.Select>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kapasitas</Form.Label>
                                <Col md={7}>
                                    <GInputNumber name="kapasitas" initialValue={dataGudg.kapasitas} onChange={(e) => ref.current.handleChangeDataHeader(e)} required />
                                </Col>
                            </Row>

                            <Row className='mb-4'>
                                <Form.Label as={Col} md={3}>Kontrol Kapasitas</Form.Label>
                                <Col md={7}>
                                    <Form.Check type="switch" name="flag_kapasitas" label={dataGudg.flag_kapasitas === 1 ? 'Aktif' : 'Tidak Aktif'} checked={dataGudg.flag_kapasitas === 1 ? true : false} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                        </Col>

                        <Col md={5}>
                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Customer (Konsinyasi)</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_customer" value={dataGudg.nama_customer} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} />
                                        <Form.Control type='hidden' name='id_customer' value={dataGudg.id_customer} />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mdcust?is_aktif=1', modalColumns, 'Pilih Customer', handleModalCustSelected)}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className='mb-4'>
                                <Form.Label as={Col} md={3}>Alamat Customer</Form.Label>
                                <Col md={7}>
                                    <Form.Check type="switch" name="flag_alamat" label={dataGudg.flag_alamat === 1 ? 'Ya' : 'Tidak'} checked={dataGudg.flag_alamat === 1 ? true : false} onChange={(e) => handleChange(e)} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Merk</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_merk" value={dataGudg.nama_merk} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} />
                                        <Form.Control type='hidden' name='id_merk' value={dataGudg.id_merk} />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mrmerk?is_aktif=1', modalColumns, 'Pilih Jenis Customer', handleModalMerkSelected)}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Col>

                    </Row>
                </Card.Body>

                <Card.Header>
                    <span className='d-inline-block col-md-2 border-end'>Kapasitas per Merk</span>
                    <Button type='button' variant='primary' className='ms-2' onClick={() => ref.current.showModalList('mrmerk?is_aktif=1', modalColumns, 'Pilih Merk', handleClickAddKapasitas)}>
                        Tambah Kapasitas
                    </Button>
                </Card.Header>

                <Card.Body>{ViewEditKapasitas()}</Card.Body>

            </Card>
        </Form>
    )

    const ViewEditKapasitas = () => (
        <Table responsive className="table-bordered" cellSpacing="0" style={{ 'minWidth': 'max-content' }}>
            <thead className="bg-primary text-light">
                <tr>
                    <th width='60px'></th>
                    <th>Merk</th>
                    <th className='text-end'>Kapasitas</th>
                </tr>
            </thead>

            <tbody>
                {dataGudk.map((row, index) =>
                    <tr key={index}>
                        <td width='60px'></td>
                        <td>
                            <Form.Control type='text' name='mdgudk_nama_merk' value={row['nama_merk'] ? row['nama_merk'] : ''} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} />
                        </td>
                        <td>
                            <GInputNumber name='mdgudk_kapasitas' initialValue={row['kapasitas']} onChange={(e) => handleChangeKapasitas(e, index)} />
                        </td>
                    </tr>
                )}

            </tbody>
        </Table>
    )

    const ViewList = () => (
        <GListEdit
            tableName='mdgudg'
            onClickAdd={() => handleClickAdd()}
            onClickEdit={(id) => handleClickEdit(id)}
            columns={{ id: null, kode: '', nama: '' }}
            displayColumns={[
                { name: 'kode', text: 'Kode', type: 'text', updatable: false },
                { name: 'nama', text: 'Nama', type: 'text', updatable: false },
                { name: 'tlp_1', text: 'Tlp', type: 'text', updatable: false },
                { name: 'nama_kota', text: 'Kota', type: 'text', updatable: false },
                { name: 'nama_tipegudang', text: 'Tipe Gudang/Counter', type: 'text', updatable: false },
                { name: 'nama_jenisgudang', text: 'Jenis Gudang', type: 'text', updatable: false },
                { name: 'kapasitas', text: 'Kapasitas', type: 'number', updatable: false },
                { name: 'user_update', text: 'User Update', type: 'text', updatable: false },
                { name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false },
            ]}
        />

    )

    return (
        <GFormEdit ref={ref} setValidated={setValidated} dataHeader={dataGudg} setDataHeader={setDataGudg} >
            {view === 'edit' &&
                ViewEdit()
            }
            {view === 'list' &&
                ViewList()
            }
        </GFormEdit>
    )
}

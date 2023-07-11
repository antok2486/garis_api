import React, { useRef, useState } from 'react'
import { GFormEdit, GListEdit, GInputNumber } from "../../utils/Index"
import { Button, Row, Col, Form, InputGroup, Card, Table } from "react-bootstrap"

export const MdCust = () => {
    const [dataCust, setDataCust] = useState({})
    const [dataCusp, setDataCusp] = useState([])
    const [formState, setFormState] = useState('new')
    const [params, setParams] = useState({})
    const [validated, setValidated] = useState(false)
    const [view, setView] = useState('list')
    const modalColumns = [{ name: 'kode', text: 'Kode' }, { name: 'nama', text: 'Nama' }]
    const modalColumnsProv = [{ name: 'provinsi', text: 'Provinsi' }]
    const modalColumnsKotp = [{ name: 'kodepos', text: 'Kode Pos' }, { name: 'kecamatan', text: 'Kecamatan' }, { name: 'kelurahan', text: 'Kelurahan' }]
    const ref = useRef()

    const handleChangePlafon = (e, index) => {
        let temp = dataCusp.map(l => Object.assign({}, l))
        
        if(e.target.name === 'mdcusp_plafon'){
            temp[index]['plafon'] = e.target.value
        }

        setDataCusp(temp)
    }

    const handleClickAdd = () => {
        setDataCust({
            id: '', kode: '', nama: '', foto: '', alamat: '',
            provinsi: '', id_kota: '', kecamatan: '', kelurahan: '', kodepos: '',
            tlp_1: '', tlp_2: '', email: '', lng: '', lat: '',
            cara_bayar: 1, plafon: '', is_plafon: 1, hari_bayar: '', id_merk: '', id_grupcust: '',
            id_jeniscust: '', jenis_transaksi: '2', site_transaksi: '1', nik_1: '', nik_2: '', nik_3: '',
            nik_4: '', nik_5: '', is_aktif: 1, user_update: '', updated_at: '',
            nama_kota: '', nama_jeniscust: '', nama_grupcust: '', nama_merk: '',
            kode_jeniscust: '', kode_grupcust: '', kode_merk: ''
        })

        setDataCusp([])

        setValidated(false)
        setFormState('new')
        setView('edit')

    }

    const handleClickAddPlafon = (row) => {
        let temp = dataCusp.map(l => Object.assign({}, l))
        let idCustomer = dataCust['id']
        let cols = {'id': '', 'id_customer': idCustomer, 'id_merk' : row['id'], 'nama_merk': row['nama'], 'plafon': 0}

        if(!temp.find(key => key.id_merk === row['id'])){
            //temp.unshift(cols)
            temp.push(cols)
        }

        setDataCusp(temp)
    }

    const handleClickEdit = async (id) => {
        const resData = await ref.current.axiosGet('mdcust?id=' + id)

        if (resData.status === 200) {
            if (resData['mdcust'][0]) {
                //replace null with empty string
                for (let col in resData['mdcust'][0]) {
                    if (!resData['mdcust'][0][col]) { resData['mdcust'][0][col] = '' }
                }

                for (let row in resData['mdcusp']) {
                    for (let col in resData['mdcusp'][row]) {
                        if (!resData['mdcusp'][row][col]) { resData['mdcusp'][row][col] = '' }
                    }
                }

                setDataCust(resData['mdcust'][0])
                setDataCusp(resData['mdcusp'])
                setValidated(false)
                setFormState('edit')
                setView('edit')

            }
        }
    }

    const handleModalCustGSelected = (row) => {
        let temp = Object.assign({}, dataCust)

        temp['id_grupcust'] = row['id']
        temp['nama_grupcust'] = row['nama']
        temp['kode_grupcust'] = row['kode']

        if (!temp['id']) {
            temp['kode'] = (temp['kode_grupcust'] ? temp['kode_grupcust'] : '') +
                (temp['kode_jeniscust'] ? temp['kode_jeniscust'] : '') +
                (temp['kode_merk'] ? temp['kode_merk'] : '')

        }

        setDataCust(temp)

    }

    const handleModalCustJSelected = (row) => {
        let temp = Object.assign({}, dataCust)

        temp['id_jeniscust'] = row['id']
        temp['nama_jeniscust'] = row['nama']
        temp['kode_jeniscust'] = row['kode']

        if (!temp['id']) {
            temp['kode'] = (temp['kode_grupcust'] ? temp['kode_grupcust'] : '') +
                (temp['kode_jeniscust'] ? temp['kode_jeniscust'] : '') +
                (temp['kode_merk'] ? temp['kode_merk'] : '')

        }

        setDataCust(temp)

    }

    const handleModalKotaSelected = (row) => {
        let temp = Object.assign({}, dataCust)

        temp['id_kota'] = row['id']
        temp['nama_kota'] = row['nama']

        //kosongkan kecamatan, dll
        temp['kecamatan'] = ''
        temp['kelurahan'] = ''
        temp['kodepos'] = ''

        setDataCust(temp)

    }

    const handleModalKotpSelected = (row) => {
        let temp = Object.assign({}, dataCust)

        temp['kodepos'] = row['kodepos']
        temp['kecamatan'] = row['kecamatan']
        temp['kelurahan'] = row['kelurahan']

        setDataCust(temp)

    }

    const handleModalMerkSelected = (row) => {
        let temp = Object.assign({}, dataCust)

        temp['id_merk'] = row['id']
        temp['nama_merk'] = row['nama']
        temp['kode_merk'] = row['kode']

        if (!temp['id']) {
            temp['kode'] = (temp['kode_grupcust'] ? temp['kode_grupcust'] : '') +
                (temp['kode_jeniscust'] ? temp['kode_jeniscust'] : '') +
                (temp['kode_merk'] ? temp['kode_merk'] : '')

        }

        setDataCust(temp)

    }

    const handleModalProvSelected = (row) => {
        let temp = Object.assign({}, dataCust)

        temp['provinsi'] = row['provinsi']

        //kosongkan kota, kecamatan, dll
        temp['id_kota'] = ''
        temp['nama_kota'] = ''
        temp['kecamatan'] = ''
        temp['kelurahan'] = ''
        temp['kodepos'] = ''

        setDataCust(temp)

    }

    const handleSave = async () => {
        let arrCust = Object.assign({}, dataCust)
        let arrCusp = dataCusp.map(l => Object.assign({}, l))

        //remove commas from input number
        arrCust['plafon'] = arrCust['plafon'] ? arrCust['plafon'].toString().replace(/,/g, '') : 0
        arrCust['hari_bayar'] = arrCust['hari_bayar'] ? arrCust['hari_bayar'].toString().replace(/,/g, '') : 0
        
        for(let index in arrCusp){
            arrCusp[index]['plafon'] = arrCusp[index]['plafon'] ? arrCusp[index]['plafon'].toString().replace(/,/g, '') : 0
        }

        let payload = JSON.stringify({ 'mdcust': arrCust, 'mdcusp': arrCusp })

        let resData = await ref.current.axiosPut('mdcust', payload)

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
                                    <Form.Control type="text" name="kode" defaultValue={dataCust.kode} onKeyDown={(e) => e.preventDefault()} required />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Nama</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="nama" defaultValue={dataCust.nama} onChange={(e) => ref.current.handleChangeDataHeader(e)} required />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Alamat</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="alamat" defaultValue={dataCust.alamat} onChange={(e) => ref.current.handleChangeDataHeader(e)} required />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Provinsi</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="provinsi" value={dataCust.provinsi} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mrprovinsi?is_aktif=1', modalColumnsProv, 'Pilih Provinsi', handleModalProvSelected)}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kota</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_kota" value={dataCust.nama_kota} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Form.Control type='hidden' name='id_kota' value={dataCust.id_kota} />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mrkota?provinsi=' + dataCust['provinsi'] + '&is_aktif=1', modalColumns, 'Pilih Kota', handleModalKotaSelected)}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kecamatan</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="kecamatan" value={dataCust.kecamatan} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kelurahan</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="kelurahan" value={dataCust.kelurahan} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Kode Pos</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="kodepos" value={dataCust.kodepos} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mrkotp?id_kota=' + dataCust['id_kota'] + '&is_aktif=1', modalColumnsKotp, 'Pilih Kode Pos', handleModalKotpSelected)}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className='mb-4'>
                                <Form.Label as={Col} md={3}>Status Aktif</Form.Label>
                                <Col md={7}>
                                    <Form.Check type="switch" name="is_aktif" label={dataCust.is_aktif === 1 ? 'Aktif' : 'Tidak Aktif'} checked={dataCust.is_aktif === 1 ? true : false} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                        </Col>

                        <Col md={5}>
                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Email</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="email" defaultValue={dataCust.email} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Tlp 1</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="tlp_1" defaultValue={dataCust.tlp_1} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Tlp 2</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="tlp_2" defaultValue={dataCust.tlp_2} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Longitude</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="lng" defaultValue={dataCust.lng} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Latitude</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="lat" defaultValue={dataCust.lat} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>User Update</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="lat" defaultValue={dataCust.user_update} readOnly />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>TGL Update</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="lat" defaultValue={dataCust.updated_ata} readOnly />
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                </Card.Body>

                <Card.Header><span className='d-inline-block col-md-2 border-end'>Transaksi Customer</span></Card.Header>

                <Card.Body>
                    <Row>
                        <Col md={5}>
                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Grup Customer</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_grupcust" value={dataCust.nama_grupcust} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Form.Control type='hidden' name='id_grupcust' value={dataCust.id_grupcust} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mdcusg?is_aktif=1', modalColumns, 'Pilih Grup Customer', handleModalCustGSelected)}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Jenis Customer</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_jeniscust" value={dataCust.nama_jeniscust} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Form.Control type='hidden' name='id_jeniscust' value={dataCust.id_jeniscust} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mdcusj?is_aktif=1', modalColumns, 'Pilih Jenis Customer', handleModalCustJSelected)}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Merk</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_merk" value={dataCust.nama_merk} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} />
                                        <Form.Control type='hidden' name='id_merk' value={dataCust.id_merk} />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mrmerk?is_aktif=1', modalColumns, 'Pilih Merk', handleModalMerkSelected)}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Jenis Transaksi</Form.Label>
                                <Col md={7}>
                                    <Form.Select name='jenis_transaksi' value={dataCust.jenis_transaksi} onChange={(e) => ref.current.handleChangeDataHeader(e)} required>
                                        <option value={1}>Putus</option>
                                        <option value={2}>Konsinyasi</option>
                                    </Form.Select>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Site Transaksi</Form.Label>
                                <Col md={7}>
                                    <Form.Select name='site_transaksi' value={dataCust.site_transaksi} onChange={(e) => ref.current.handleChangeDataHeader(e)} required>
                                        <option value={1}>Offline</option>
                                        <option value={2}>E Commerce</option>
                                    </Form.Select>
                                </Col>
                            </Row>

                        </Col>

                        <Col md={5}>
                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Cara Bayar</Form.Label>
                                <Col md={7}>
                                    <Form.Select name='cara_bayar' value={dataCust.cara_bayar} onChange={(e) => ref.current.handleChangeDataHeader(e)} required>
                                        <option value={0}>Tunai</option>
                                        <option value={1}>Piutang</option>
                                    </Form.Select>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Plafon Piutang</Form.Label>
                                <Col md={7}>
                                    <GInputNumber name='plafon' initialValue={dataCust.plafon} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Hari Bayar</Form.Label>
                                <Col md={7}>
                                    <GInputNumber name='hari_bayar' initialValue={dataCust.hari_bayar} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Form.Label as={Col} md={3}>Control Plafon</Form.Label>
                                <Col md={7}>
                                    <Form.Check type="switch" name="is_plafon" label={dataCust.is_plafon === 1 ? 'Aktif' : 'Tidak Aktif'} checked={dataCust.is_plafon === 1 ? true : false} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>

                        </Col>

                    </Row>
                </Card.Body>

                <Card.Header>
                    <span className='d-inline-block col-md-2 border-end'>Plafon Customer per Merk</span>
                    <Button type='button' variant='primary' className='ms-2' onClick={() => ref.current.showModalList('mrmerk?is_aktif=1', modalColumns, 'Pilih Merk', handleClickAddPlafon)}>
                        Tambah Plafon
                    </Button>
                </Card.Header>

                <Card.Body>{ViewEditPlafon()}</Card.Body>

            </Card>
        </Form>
    )

    const ViewEditPlafon = () => (
        <Table responsive className="table-bordered" cellSpacing="0" style={{ 'minWidth': 'max-content' }}>
            <thead className="bg-primary text-light">
                <tr>
                    <th width='60px'></th>
                    <th>Merk</th>
                    <th className='text-end'>Plafon</th>
                </tr>
            </thead>

            <tbody>
                {dataCusp.map((row, index) =>
                    <tr key={index}>
                        <td width='60px'></td>
                        <td>
                            <Form.Control type='text' name='mdcusp_nama_merk' value={row['nama_merk'] ? row['nama_merk'] : ''} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} />
                        </td>
                        <td>
                            <GInputNumber name='mdcusp_plafon' initialValue={row['plafon']} onChange={(e) => handleChangePlafon(e, index)} />
                        </td>
                    </tr>
                )}

            </tbody>
        </Table>
    )

    const ViewList = () => (
        <GListEdit
            tableName='mdcust'
            onClickAdd={() => handleClickAdd()}
            onClickEdit={(id) => handleClickEdit(id)}
            columns={{ id: null, kode: '', nama: '' }}
            displayColumns={[
                { name: 'kode', text: 'Kode', type: 'text', updatable: false },
                { name: 'nama', text: 'Nama', type: 'text', updatable: false },
                { name: 'tlp_1', text: 'Tlp', type: 'text', updatable: false },
                { name: 'nama_kota', text: 'Kota', type: 'text', updatable: false },
                { name: 'nama_grupcust', text: 'Grup Customer', type: 'text', updatable: false },
                { name: 'nama_jeniscust', text: 'Jenis Customer', type: 'text', updatable: false },
                { name: 'user_update', text: 'User Update', type: 'text', updatable: false },
                { name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false },
            ]}
        />
    )

    return (
        <GFormEdit ref={ref} setValidated={setValidated} dataHeader={dataCust} setDataHeader={setDataCust} >
            {view === 'edit' &&
                ViewEdit()
            }
            {view === 'list' &&
                ViewList()
            }
        </GFormEdit>
    )
}

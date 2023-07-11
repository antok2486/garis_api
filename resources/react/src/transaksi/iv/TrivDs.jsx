import React, { useRef, useState } from 'react'
import { GFormEdit, GListEdit, GInputSkuV1 } from "../../utils/Index"
import { Button, Row, Col, Form, InputGroup, Card } from "react-bootstrap"

export const TrivDs = () => {
    const [dataTrivds1, setDataTrivds1] = useState({})
    const [dataTrivds2, setDataTrivds2] = useState([])
    const [formState, setFormState] = useState('new')
    const [params, setParams] = useState({})
    const [validated, setValidated] = useState(false)
    const [showStock, setShowStock] = useState(true)
    const [view, setView] = useState('list')
    const modalColumns = [{ name: 'kode', text: 'Kode' }, { name: 'nama', text: 'Nama' }]
    const modalColumnsProduk = [{ name: 'kode_produk', text: 'Kode' }, { name: 'nama_produk', text: 'Nama' }, { name: 'nama_varian_1', text: 'Varian' }]
    const ref = useRef()

    const handleClickAdd = async () => {
        //get params
        let resData = await ref.current.axiosGet('trivparam')
        let no_ds

        if (resData.status === 200) {
            no_ds = resData.params.no_prefix + 'DSC'

        } else {
            console.log(res)
        }

        setParams(resData.params)
        setDataTrivds1({
            id: '', no_ds: no_ds, id_merk: '', jenis_dist: 1, id_gudangdr: '', id_gudangke: '',
            note: '', status: '', user_update: '', updated_at: '',
            nama_merk: '', nama_gudangdr: '', nama_gudangke: '',
        })

        setDataTrivds2([])
        setShowStock(true)

        setFormState('new')
        setValidated(false)
        setView('edit')

    }

    const handleClickEdit = () => {

    }

    const handleModalGudangDrSelected = (row) => {
        let temp = Object.assign({}, dataTrivds1)

        temp['id_gudangdr'] = row['id']
        temp['nama_gudangdr'] = row['nama']

        setDataTrivds1(temp)

    }

    const handleModalGudangKeSelected = (row) => {
        let temp = Object.assign({}, dataTrivds1)

        temp['id_gudangke'] = row['id']
        temp['nama_gudangke'] = row['nama']

        setDataTrivds1(temp)

    }

    const handleModalMerkSelected = (row) => {
        let temp = Object.assign({}, dataTrivds1)

        temp['id_merk'] = row['id']
        temp['nama_merk'] = row['nama']

        setDataTrivds1(temp)
    }

    const handleSave = async () => {

    }

    const ViewEdit = () => (
        <Form noValidate autoComplete="off" validated={validated} onSubmit={(e) => ref.current.handleSubmit(e, handleSave)}>
            <Card>
                <Card.Header>
                    <Button type='button' variant='primary' className='me-1' onClick={() => setView('list')}><i className="fa-solid fa-caret-left"></i>&nbsp;Kembali</Button>
                    {formState === 'new' &&
                        <Button type='submit' variant='primary' className='me-1'><i className="fa-solid fa-floppy-disk"></i>&nbsp;Simpan</Button>
                    }

                    {formState === 'edit' &&
                        <Button type='button' variant='primary' className='me-1' onClick={() => handleClickCancel()}><i className="fa-solid fa-ban"></i>&nbsp;Batalkan</Button>
                    }
                </Card.Header>

                <Card.Body>
                    <Row>
                        <Col md={5}>
                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>No. Distribusi</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="no_ds" defaultValue={dataTrivds1.no_ds} onKeyDown={(e) => e.preventDefault()} required />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>Merk</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_merk" value={dataTrivds1.nama_merk} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Form.Control type="hidden" name="id_merk" value={dataTrivds1.id_merk} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('syautr?', modalColumns, 'Pilih Merk', handleModalMerkSelected)} disabled={formState === 'edit' ? true : false}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>Jenis Distribusi</Form.Label>
                                <Col md={7}>
                                    <Form.Select name='jenis_dist' value={dataTrivds1.jenis_dist} onChange={(e) => ref.current.handleChangeDataHeader(e)} required>
                                        <option value={1}>Kirim ke Counter</option>
                                        <option value={2}>Retur Counter</option>
                                        <option value={3}>Transfer Counter</option>
                                        <option value={4}>Transfer Gudang</option>
                                    </Form.Select>
                                </Col>
                            </Row>

                        </Col>

                        <Col md={5}>
                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>Asal</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_gudangdr" value={dataTrivds1.nama_gudangdr} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Form.Control type="hidden" name="id_gudangdr" value={dataTrivds1.id_gudangdr} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('syautg?jenis_gudang=2', modalColumns, 'Pilih Gudang', handleModalGudangDrSelected)} disabled={formState === 'edit' ? true : false}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>Tujuan</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_gudangke" value={dataTrivds1.nama_gudangke} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Form.Control type="hidden" name="id_gudangke" value={dataTrivds1.id_gudangke} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('syautg?jenis_gudang=2', modalColumns, 'Pilih Gudang', handleModalGudangKeSelected)} disabled={formState === 'edit' ? true : false}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>Note</Form.Label>
                                <Col md={7}>
                                    <Form.Control as="textarea" name='note' rows={2} defaultValue={dataTrivds1.note} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>

                <Card.Header>
                    <span className='d-inline-block col-md-2 border-end'>Detail</span>
                    {formState === 'new' &&
                        <Button type='button' variant='primary' className='ms-2 me-1' onClick={() => ref.current.showModalList('mpprod_varian?id_merk=' + dataTrivds1.id_merk, modalColumnsProduk, 'Pilih Produk', handleModalProdukSelected)}><i className="fa-solid fa-cart-plus"></i>&nbsp;Tambah</Button>
                    }
                </Card.Header>

                <Card.Body>
                    <GInputSkuV1 data={dataTrivds2} setData={setDataTrivds2} showPrice={false} showStock={showStock} />
                </Card.Body>

            </Card>
        </Form>
    )

    const ViewList = () => (
        <GListEdit
            tableName='trivds'
            btnImportExport={false}
            btnShowActive={false}
            btnShowStatus={true}
            onClickAdd={() => handleClickAdd()}
            onClickEdit={(id) => handleClickEdit(id)}
            columns={{ id: null, kode: '', nama: '' }}
            displayColumns={[
                { name: 'no_ds', text: 'No. Distribusi', type: 'text', updatable: false },
                { name: 'jenis_dista', text: 'Jenis Distribusi', type: 'text', updatable: false },
                { name: 'nama_merk', text: 'Merk', type: 'text', updatable: false },
                { name: 'nama_gudangdr', text: 'Asal', type: 'text', updatable: false },
                { name: 'nama_gudangke', text: 'Tujuan', type: 'text', updatable: false },
                { name: 'note', text: 'Note', type: 'text', updatable: false },
                { name: 'statusa', text: 'Status', type: 'text', updatable: false },
            ]}
        />

    )

    return (
        <GFormEdit ref={ref} setValidated={setValidated} dataHeader={dataTrivds1} setDataHeader={setDataTrivds1}>
            {view === 'edit' &&
                ViewEdit()
            }
            {view === 'list' &&
                ViewList()
            }
        </GFormEdit>
    )
}

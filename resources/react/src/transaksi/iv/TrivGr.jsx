import React, { useRef, useState } from 'react'
import { GFormEdit, GListEdit, GInputSkuV1 } from "../../utils/Index"
import { Button, Row, Col, Form, InputGroup, Card } from "react-bootstrap"

export const TrivGr = () => {
    const [dataTrivgr1, setDataTrivgr1] = useState({})
    const [dataTrivgr2, setDataTrivgr2] = useState([])
    const [formState, setFormState] = useState('new')
    const [params, setParams] = useState({})
    const [validated, setValidated] = useState(false)
    const [showStock, setShowStock] = useState(true)
    const [view, setView] = useState('list')
    const modalColumns = [{ name: 'no_po', text: 'No. Purchase Order' }, { name: 'nama_merk', text: 'Merk' }, { name: 'nama_supplier', text: 'Nama Supplier' }, { name: 'nama_gudang', text: 'Gudang' }]
    const modalColumnsProduk = [{ name: 'kode_produk', text: 'Kode' }, { name: 'nama_produk', text: 'Nama' }, { name: 'nama_varian_1', text: 'Varian' }]
    const ref = useRef()

    const handleClickAdd = async () => {
        //get params
        let resData = await ref.current.axiosGet('trivparam')
        let no_gr

        if (resData.status === 200) {
            no_gr = resData.params.no_prefix + 'GRB'

        } else {
            console.log(res)
        }

        setParams(resData.params)
        setDataTrivgr1({
            id: '', no_gr: no_gr, id_po: '', no_po: '', id_merk: '', id_supplier: '',
            id_gudang: '', note: '', status: 1,
            nama_merk: '', nama_supplier: '', nama_gudang: '', jenis_transaksia: '', site_transaksia: ''
        })

        setDataTrivgr2([])
        setShowStock(true)

        setFormState('new')
        setValidated(false)
        setView('edit')

    }

    const handleClickEdit = async (id) => {
        let resData = await ref.current.axiosGet('trivgr?id=' + id)

        if (resData.status === 200) {
            // console.log(res.data)
            setDataTrivgr1(resData['trivgr1'][0])
            setDataTrivgr2(resData['trivgr2'])
            setShowStock(false)

            setFormState('edit')
            setValidated(false)
            setView('edit')

        } else {
            console.log(res)

        }

    }

    const handleClickPutaway = async (id) => {
        let temp = Object.assign({}, dataTrivgr1)

        if (temp['status'] === 2) {
            window.open('/cetak?toprint=TrivGrCtkPutaway&id=' + dataTrivgr1.id, '_blank', 'rel=noopener noreferrer')
            return
        }

        let payload = JSON.stringify({ 'id_gr': id })
        let resData = await ref.current.axiosPut('trivgrputaway?', payload)

        if (resData.status === 200) {
            //update status valid
            temp['status'] = 2

            setDataTrivgr1(temp)

            window.open('/cetak?toprint=TrivGrCtkPutaway&id=' + dataTrivgr1.id, '_blank', 'rel=noopener noreferrer')

        }

    }

    const handleModalNopoSelected = (row) => {
        let temp = Object.assign({}, dataTrivgr1)

        temp['id_po'] = row['id']
        temp['no_po'] = row['no_po']
        temp['id_merk'] = row['id_merk']
        temp['nama_merk'] = row['nama_merk']
        temp['id_supplier'] = row['id_supplier']
        temp['nama_supplier'] = row['nama_supplier']
        temp['id_gudang'] = row['id_gudang']
        temp['nama_gudang'] = row['nama_gudang']
        temp['jenis_transaksia'] = row['jenis_transaksia']
        temp['site_transaksia'] = row['site_transaksia']

        setDataTrivgr1(temp)
    }

    const handleModalProdukSelected = (row) => {
        let temp = dataTrivgr2.map(l => Object.assign({}, l))

        row.varian_2.forEach((el, i) => {
            temp.push({
                'urut': i,
                'id_produk': row.id_produk,
                'id_skuproduk': el.id_skuproduk,
                'kode_produk': row.kode_produk,
                'nama_produk': row.nama_produk,
                'kode_varian_1': row.kode_varian_1,
                'nama_varian_1': row.nama_varian_1,
                'kode_varian_2': el.kode_varian_2,
                'nama_varian_2': el.nama_varian_2,
                'qty': 0,
                'stock': el.qty,
                'hrg': el.hrg,
                'disc': el.disc,
                'tax': el.tax,
            })
        })

        setDataTrivgr2(temp)

    }

    const handleSave = async () => {
        //remove comma / thousand separator
        let arrTrivgr2 = dataTrivgr2.map(l => Object.assign({}, l))

        arrTrivgr2.forEach(el => {
            el.qty = el.qty ? parseFloat(el.qty.toString().replace(/,/g, '')) : 0
            el.hrg = el.hrg ? parseFloat(el.hrg.toString().replace(/,/g, '')) : 0
            el.disc = el.disc ? parseFloat(el.disc.toString().replace(/,/g, '')) : 0
            el.tax = el.tax ? parseFloat(el.tax.toString().replace(/,/g, '')) : 0
        })

        let payload = JSON.stringify({ 'trivgr1': dataTrivgr1, 'trivgr2': arrTrivgr2 })

        let resData = await ref.current.axiosPut('trivgr?', payload)

        if (resData.status === 200) {
            setView('list')
        }
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
                        <React.Fragment>
                            <Button type='button' variant='primary' className='me-1' onClick={() => handleClickPutaway(dataTrivgr1.id)}><i className="fa-solid fa-cart-flatbed-suitcase" />&nbsp;Cetak Putaway</Button>
                            <Button type='button' variant='primary' className='me-1' onClick={() => handleClickCancel()}><i className="fa-solid fa-ban"></i>&nbsp;Batalkan</Button>
                        </React.Fragment>
                    }
                </Card.Header>

                <Card.Body>
                    <Row>
                        <Col md={5}>
                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>No. Good Receive</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="no_gr" defaultValue={dataTrivgr1.no_gr} onKeyDown={(e) => e.preventDefault()} required />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>No. Purchase Order</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="no_po" defaultValue={dataTrivgr1.no_po} onKeyDown={(e) => e.preventDefault()} required />
                                        <Form.Control type="hidden" name="id_po" defaultValue={dataTrivgr1.id_po} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('trivpo_no', modalColumns, 'Pilih Purchase Order', handleModalNopoSelected)} disabled={formState === 'edit' ? true : false}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>Note</Form.Label>
                                <Col md={7}>
                                    <Form.Control as="textarea" name='note' rows={2} defaultValue={dataTrivgr1.note} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>
                        </Col>

                        <Col md={5}>
                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>Merk</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="nama_merk" defaultValue={dataTrivgr1.nama_merk} onKeyDown={(e) => e.preventDefault()} required />
                                    <Form.Control type="hidden" name="id_merk" defaultValue={dataTrivgr1.id_merk} />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>Supplier</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="nama_merk" defaultValue={dataTrivgr1.nama_supplier} onKeyDown={(e) => e.preventDefault()} required />
                                    <Form.Control type="hidden" name="id_merk" defaultValue={dataTrivgr1.id_supplier} />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>Gudang</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="nama_gudang" defaultValue={dataTrivgr1.nama_gudang} onKeyDown={(e) => e.preventDefault()} required />
                                    <Form.Control type="hidden" name="id_gudang" defaultValue={dataTrivgr1.id_gudang} />
                                </Col>
                            </Row>

                        </Col>

                        {/*
                        <Col md={4}>
                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>Jenis Transaksi</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="jenis_transaksia" defaultValue={dataTrivgr1.jenis_transaksia} readOnly required />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={5}>Site Transaksi</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="site_transaksia" defaultValue={dataTrivgr1.site_transaksia} readOnly required />
                                </Col>
                            </Row>
                        </Col>
                        */}
                    </Row>

                </Card.Body>

                <Card.Header>
                    <span className='d-inline-block col-md-2 border-end'>Detail</span>
                    {formState === 'new' &&
                        <Button type='button' variant='primary' className='ms-2 me-1' onClick={() => ref.current.showModalList('trivpo_varian?id_po=' + dataTrivgr1.id_po, modalColumnsProduk, 'Pilih Produk', handleModalProdukSelected)}><i className="fa-solid fa-cart-plus"></i>&nbsp;Tambah</Button>
                    }
                </Card.Header>

                <Card.Body>
                    <GInputSkuV1 data={dataTrivgr2} setData={setDataTrivgr2} showPrice={false} showStock={showStock} />
                </Card.Body>
            </Card>
        </Form>
    )

    const ViewList = () => (
        <GListEdit
            tableName='trivgr'
            btnImportExport={false}
            btnShowActive={false}
            btnShowStatus={true}
            onClickAdd={() => handleClickAdd()}
            onClickEdit={(id) => handleClickEdit(id)}
            columns={{ id: null, kode: '', nama: '' }}
            displayColumns={[
                { name: 'no_gr', text: 'No. Good Receive', type: 'text', updatable: false },
                { name: 'no_po', text: 'No. Purchase Order', type: 'text', updatable: false },
                { name: 'nama_supplier', text: 'Supplier', type: 'text', updatable: false },
                { name: 'nama_merk', text: 'Merk', type: 'text', updatable: false },
                { name: 'nama_gudang', text: 'Gudang', type: 'text', updatable: false },
                /*
                { name: 'jenis_transaksia', text: 'Jenis Transaksi', type: 'text', updatable: false },
                { name: 'site_transaksia', text: 'Site Transaksi', type: 'text', updatable: false },
                */
                { name: 'note', text: 'Note', type: 'text', updatable: false },
                { name: 'statusa', text: 'Status', type: 'text', updatable: false },
                { name: 'tgl_delivera', text: 'Tgl Deliver', type: 'text', updatable: false },
                { name: 'user_update', text: 'User Update', type: 'text', updatable: false },
                { name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false },
            ]}
        />
    )

    return (
        <GFormEdit ref={ref} setValidated={setValidated} dataHeader={dataTrivgr1} setDataHeader={setDataTrivgr1}>
            {view === 'edit' &&
                ViewEdit()
            }
            {view === 'list' &&
                ViewList()
            }
        </GFormEdit>
    )
}

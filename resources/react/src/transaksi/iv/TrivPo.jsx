import React, { useRef, useState } from 'react'
import { GFormEdit, GListEdit, GInputDate, GInputSkuV1 } from "../../utils/Index"
import { Button, Row, Col, Form, InputGroup, Card } from "react-bootstrap"

export const TrivPo = ({ approval = false }) => {
    const [dataTrivpo1, setDataTrivpo1] = useState({})
    const [dataTrivpo2, setDataTrivpo2] = useState([])
    const [formState, setFormState] = useState('new')
    const [isAktifA, setIsAktifA] = useState(1)
    const [params, setParams] = useState({})
    const [validated, setValidated] = useState(false)
    const [view, setView] = useState('list')
    const modalColumns = [{ name: 'kode', text: 'Kode' }, { name: 'nama', text: 'Nama' }]
    const modalColumnsProduk = [{ name: 'kode_produk', text: 'Kode' }, { name: 'nama_produk', text: 'Nama' }, { name: 'nama_varian_1', text: 'Varian' }]
    const ref = useRef()

    const handleClickAdd = async () => {
        const resData = await ref.current.axiosGet('trivparam')

        let no_po

        if (resData.status === 200) {
            setParams({
                id_jenissuplbrg: resData.params.id_jenissuplbrg,
                id_tipegudangpo: resData.params.id_tipegudangpo,
            })

            no_po = resData.params.no_prefix + 'POB'

        }

        //default date
        let date = new Date()
        let day = '00' + date.getDate()
        let month = '00' + (date.getMonth() + 1)

        day = day.substring(day.length - 2)
        month = month.substring(month.length - 2)

        let currentDate = day + '/' + month + '/' + date.getFullYear()

        setDataTrivpo1({
            id: '', no_po: no_po, jenis_po: 1, id_merk: '', id_supplier: '',
            id_gudang: '', jenis_transaksi: '', site_transaksi: '',
            tgl_deliver: currentDate, note: '', request_by: '', approve_by: '', status: 1,
            nama_merk: '', nama_supplier: '', nama_gudang: '',
        })

        setDataTrivpo2([])
        setValidated(false)
        setFormState('new')
        setView('edit')
    }

    const handleClickApprove = (id, approve) => {
        let apvText = approve === 2 ? 'MENYETUJUI' : 'MENOLAK'

        ref.current.showModal(
            'question',
            'Konfirmasi',
            'Anda yakin akan ' + apvText + ' Purchase Order ?',
            async () => {
                let payload = JSON.stringify({ 'id': id, 'status': approve })

                let resData = await ref.current.axiosPut('trivpoapv', payload)

                if (resData.status === 200) {
                    setView('list')
                }

            }
        )

    }

    const handleClickCancel = () => {
        ref.current.showModal('question', 'Konfirmasi', 'Anda yakin akan membatalkan transaksi ?', () => { setView('list') })
    }

    const handleClickCetak = (id) => {
        window.open('/cetak?toprint=TrivPoCtk&id=' + id, '_blank', 'rel=noopener noreferrer')
    }

    const handleClickEdit = async (id) => {
        const resData = await ref.current.axiosGet('trivpo?id=' + id)

        if (resData.status === 200) {
            // console.log(res.data)
            setDataTrivpo1(resData['trivpo1'][0])
            setDataTrivpo2(resData['trivpo2'])

            setValidated(false)
            setFormState('edit')
            setView('edit')
        }
    }

    const handleModalGudangSelected = (row) => {
        handleModalSelected(row, 'gudang')
    }

    const handleModalMerkSelected = (row) => {
        handleModalSelected(row, 'merk')
    }

    const handleModalProdukSelected = (row) => {
        let temp = dataTrivpo2.map(l => Object.assign({}, l))
        //console.log(row)
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
                'hrg': el.hrg,
                'disc': el.disc,
                'tax': el.tax,
            })
        })

        setDataTrivpo2(temp)

    }

    const handleModalSelected = (row, col) => {
        let temp = Object.assign({}, dataTrivpo1)

        switch (col) {
            case 'gudang':
                temp['id_gudang'] = row['id']
                temp['nama_gudang'] = row['nama']

                break

            case 'merk':
                temp['id_merk'] = row['id']
                temp['nama_merk'] = row['nama']

                break

            case 'supl':
                temp['id_supplier'] = row['id']
                temp['nama_supplier'] = row['nama']

                break

        }

        setDataTrivpo1(temp)
    }

    const handleModalSuplSelected = (row) => {
        handleModalSelected(row, 'supl')
    }

    const handleSave = async () => {
        let arrTrivpo2 = dataTrivpo2.map(l => Object.assign({}, l))

        arrTrivpo2.forEach(el => {
            el.qty = el.qty ? parseFloat(el.qty.toString().replace(/,/g, '')) : 0
            el.hrg = el.hrg ? parseFloat(el.hrg.toString().replace(/,/g, '')) : 0
            el.disc = el.disc ? parseFloat(el.disc.toString().replace(/,/g, '')) : 0
            el.tax = el.tax ? parseFloat(el.tax.toString().replace(/,/g, '')) : 0
        })

        let payload = JSON.stringify({ 'trivpo1': dataTrivpo1, 'trivpo2': arrTrivpo2 })

        let resData = await ref.current.axiosPut('trivpo', payload)

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

                    {approval && dataTrivpo1['status'] === 1 &&
                        <Button type='button' variant='primary' className='me-1' onClick={() => handleClickApprove(dataTrivpo1['id'], 2)}><i className="fa-solid fa-thumbs-up" />&nbsp;Setuju</Button>
                    }

                    {approval && dataTrivpo1['status'] === 1 &&
                        <Button type='button' variant='primary' className='me-1' onClick={() => handleClickApprove(dataTrivpo1['id'], -1)}><i className="fa-solid fa-thumbs-down" />&nbsp;Tolak</Button>
                    }

                    {dataTrivpo1['status'] === 2 &&
                        <Button type='button' variant='primary' className='me-1' onClick={() => handleClickCetak(dataTrivpo1['id'])}><i className="fa-solid fa-print" />&nbsp;Cetak</Button>
                    }

                    {formState === 'edit' && dataTrivpo1['status'] === 1 && !approval &&
                        <Button type='button' variant='primary' className='me-1' onClick={() => handleClickCancel()}><i className="fa-solid fa-ban" />&nbsp;Batalkan</Button>
                    }
                </Card.Header>

                <Card.Body>
                    <Row>
                        <Col md={5}>
                            <Row className="mb-3">
                                <Form.Label as={Col} md={4}>No. Purchase Order</Form.Label>
                                <Col md={7}>
                                    <Form.Control type="text" name="no_po" defaultValue={dataTrivpo1.no_po} onKeyDown={(e) => e.preventDefault()} required />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={4}>Merk</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_merk" value={dataTrivpo1.nama_merk} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Form.Control type="hidden" name="id_merk" value={dataTrivpo1.id_merk} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('syautr', modalColumns, 'Pilih Merk', handleModalMerkSelected)} disabled={formState === 'edit' ? true : false}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={4}>Supplier</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_supplier" value={dataTrivpo1.nama_supplier} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Form.Control type="hidden" name="id_supplier" value={dataTrivpo1.id_supplier} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('mdsupl?is_aktif=1&id_jenissupl=' + params.id_jenissuplbrg, modalColumns, 'Pilih Supplier', handleModalSuplSelected)} disabled={formState === 'edit' ? true : false}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={4}>Gudang</Form.Label>
                                <Col md={7}>
                                    <InputGroup>
                                        <Form.Control type="text" name="nama_gudang" value={dataTrivpo1.nama_gudang} onChange={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()} required />
                                        <Form.Control type="hidden" name="id_gudang" value={dataTrivpo1.id_gudang} required />
                                        <Button variant='primary' onClick={() => ref.current.showModalList('syautg?id_tipegudang=' + params.id_tipegudangpo +'&jenis_gudang=1', modalColumns, 'Pilih Gudang', handleModalGudangSelected)} disabled={formState === 'edit' ? true : false}><i className="fa-solid fa-magnifying-glass"></i></Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                        </Col>

                        <Col md={5}>
                            {/*
                            <Row className="mb-3">
                                <Form.Label as={Col} md={4}>Jenis Transaksi</Form.Label>
                                <Col md={5}>
                                    {formState === 'new' &&
                                        <React.Fragment>
                                            <Form.Check type='radio' name='jenis_transaksi' id='jenis_transaksi_1' label='Putus' className='w-50 p-0' inline defaultValue={1} defaultChecked={dataTrivpo1.jenis_transaksi === 1 ? true : false} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                            <Form.Check type='radio' name='jenis_transaksi' id='jenis_transaksi_2' label='Konsinyasi' className='w-50 p-0' inline defaultValue={2} defaultChecked={dataTrivpo1.jenis_transaksi === 2 ? true : false} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                        </React.Fragment>
                                    }
                                    {formState === 'edit' &&
                                        <Form.Control type="text" name="jenis_transaksia" defaultValue={dataTrivpo1.jenis_transaksia} readOnly required />
                                    }
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={4}>Site Transaksi</Form.Label>
                                <Col md={5}>
                                    {formState === 'new' &&
                                        <React.Fragment>
                                            <Form.Check type='radio' name='site_transaksi' id='site_transaksi_1' label='Offline' className='w-50 p-0' inline defaultValue={1} defaultChecked={dataTrivpo1.site_transaksi === 1 ? true : false} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                            <Form.Check type='radio' name='site_transaksi' id='site_transaksi_2' label='E Commerce' className='w-50 p-0' inline defaultValue={2} defaultChecked={dataTrivpo1.site_transaksi === 2 ? true : false} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                        </React.Fragment>
                                    }
                                    {formState === 'edit' &&
                                        <Form.Control type="text" name="site_transaksia" defaultValue={dataTrivpo1.site_transaksia} readOnly required />
                                    }
                                </Col>
                            </Row>
                            */}
                            <Row className="mb-3">
                                <Form.Label as={Col} md={4}>Tgl Deliver</Form.Label>
                                <Col md={7}>
                                    <GInputDate name='tgl_deliver' initialValue={dataTrivpo1.tgl_deliver} onChange={(e) => ref.current.handleChangeDataHeader(e)} required />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Form.Label as={Col} md={4}>Note</Form.Label>
                                <Col md={7}>
                                    <Form.Control as="textarea" name='note' rows={2} defaultValue={dataTrivpo1.note} onChange={(e) => ref.current.handleChangeDataHeader(e)} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                </Card.Body>

                <Card.Header>
                    <span className='d-inline-block col-md-2 border-end'>Detail</span>
                    {formState === 'new' &&
                        <Button type='button' variant='primary' className='ms-2 me-1' onClick={() => ref.current.showModalList('mpprod_varian?id_merk=' + dataTrivpo1.id_merk, modalColumnsProduk, 'Pilih Produk', handleModalProdukSelected)}><i className="fa-solid fa-cart-plus"></i>&nbsp;Tambah</Button>
                    }
                </Card.Header>

                <Card.Body>
                    <GInputSkuV1 data={dataTrivpo2} setData={setDataTrivpo2} />
                </Card.Body>
            </Card>
        </Form>
    )

    const ViewList = () => (
        <GListEdit
            tableName='trivpo'
            btnAdd={approval ? false : true}
            btnImportExport={false}
            btnShowActive={false}
            btnShowStatus={true}
            onClickAdd={() => handleClickAdd()}
            onClickEdit={(id) => handleClickEdit(id)}
            onClickCetak={(id) => handleClickCetak(id)}
            columns={{ id: null, kode: '', nama: '' }}
            displayColumns={[
                { name: 'no_po', text: 'No. Purchase order', type: 'text', updatable: false },
                { name: 'nama_supplier', text: 'Supplier', type: 'text', updatable: false },
                { name: 'nama_merk', text: 'Merk', type: 'text', updatable: false },
                { name: 'nama_gudang', text: 'Gudang', type: 'text', updatable: false },
                /*
                { name: 'jenis_transaksia', text: 'Jenis Transaksi', type: 'text', updatable: false },
                { name: 'site_transaksia', text: 'Site Transaksi', type: 'text', updatable: false },
                */
                { name: 'tgl_delivera', text: 'TGL Deliver', type: 'text', updatable: false },
                { name: 'note', text: 'Note', type: 'text', updatable: false },
                { name: 'statusa', text: 'Status', type: 'text', updatable: false },
                { name: 'user_update', text: 'User Update', type: 'text', updatable: false },
                { name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false },
            ]}
            defaultIsAktif={isAktifA}
            setIsAktifA={setIsAktifA}
        />
    )

    return (
        <GFormEdit ref={ref} setValidated={setValidated} dataHeader={dataTrivpo1} setDataHeader={setDataTrivpo1} dataDetail={dataTrivpo2} setDataDetail={setDataTrivpo2}>
            {view === 'edit' &&
                ViewEdit()
            }
            {view === 'list' &&
                ViewList()
            }
        </GFormEdit>
    )
}

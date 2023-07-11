import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { URL_API } from '../utils/Index'
import { Button, Card, Table, Row, Col, Form, InputGroup, Dropdown, Container } from 'react-bootstrap'
import { GInputNumber, GModalList, GModal } from './Index'
import { read, utils, writeFile } from 'xlsx'

export const GListEdit = ({ tableName, columns, displayColumns, filterColumns,
    btnImportExport = true, btnShowActive = true, btnShowStatus = false, btnAdd = true,
    onClickAdd, onClickEdit, onClickCetak,
    arrData, defaultIsAktif = 1, setIsAktifA }) => {
    const [data, setData] = useState([])
    const [oldData, setOldData] = useState([])
    const [filterStr, setFilterStr] = useState('')
    const [sortColumn, setSortColumn] = useState()
    const [sortOrder, setSortOrder] = useState(true)
    const [page, setPage] = useState({ start: 0, end: 10 })
    const [isAktif, setIsAktif] = useState(defaultIsAktif)
    const [refreshKey, setRefreshKey] = useState(0)
    const [btnFilterStatusText, setBtnFilterStatusText] = useState('Status => ' + (isAktif === 1 ? 'Entry' : isAktif === 2 ? 'Valid' : isAktif === '3' ? 'Finish' : isAktif === '0' ? 'Cancel' : 'Na') )
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

    const token = localStorage.getItem('token')

    useEffect(() => {
        const fetchData = async () => {
            try {
                let headers = {
                    accept: 'application/json',
                    Authorization: 'Bearer ' + token
                }

                //default filter gunakan kolom is_aktif
                let filterCol = 'is_aktif'

                //jika bntShowStatus filter gunakan status
                if(!btnShowActive && btnShowStatus){
                    filterCol = 'status'
                }

                let res = await axios.get(URL_API + tableName + '?' + filterCol +'=' + isAktif + filterStr, { headers: headers })

                if (res.data.status === 200) {
                    var arr = []

                    if (res.data[tableName]) {
                        res.data[tableName].forEach(el => {
                            el['readOnly'] = true
                            el['rowState'] = 'notModified'
                            arr.push(el)
                        })

                        setData(arr)
                    } else {
                        setGModal({
                            show: true,
                            type: 'information',
                            title: 'Error',
                            body: 'Gagal mendapatkan data',
                            buttons: [{ text: 'Ok', onClick: null }]
                        })

                    }
                } else {
                    setGModal({
                        show: true,
                        type: 'information',
                        title: 'Error' + (res.data.status ? ' ' + res.data.status : ''),
                        body: res.data.message ? res.data.message : 'Gagal mendapatkan data',
                        buttons: [{ text: 'Ok', onClick: null }]
                    })
            }

            } catch (error) {
                setGModal({
                    show: true,
                    type: 'information',
                    title: 'Error',
                    body: error.response.data.message,
                    buttons: [{ text: 'Ok', onClick: null }]
                })
            }
        }

        if (tableName) {
            fetchData()
        }

        if (arrData) {
            setData(arrData)
        }

    }, [setData, isAktif, refreshKey, filterStr])

    const handleChange = (e, /*id, row,*/ index) => {
        let temp

        if (data.length !== 0) {
            temp = data.map(l => Object.assign({}, l))
        } else {
            temp = []
        }

        temp[index][e.target.name] = e.target.value

        if (temp[index]['rowState'] !== 'new') {
            temp[index]['rowState'] = 'changed'
        }

        setData(temp)

    }

    const handleClickAddRow = () => {
        let cols = columns

        cols['rowState'] = 'new'
        cols['readOnly'] = false

        let temp = data.map(l => Object.assign({}, l))

        temp.unshift(cols)

        setData(temp)
    }

    const handleClickClearFilter = () => {
        setFilterStr('')

        filterColumns.forEach(el => {
            el.value = ''
            el.text = ''
        })
    }

    const handleClickDeleteRow = (id) => {
        setGModal({
            show: true,
            type: 'question',
            title: 'Konfirmasi',
            body: 'Anda yakin akan menghapus / menonaktifkan data ?',
            buttons: [
                { text: 'Ya', onClick: () => handleDelete(id) },
                { text: 'Tidak', onClick: null }
            ]
        })

    }

    const handleClickEdit = (id) => {
        var temp = data.map(l => Object.assign({}, l))

        temp.forEach(el => {
            if (el.id === id) {
                if (el.readOnly) {
                    el['readOnly'] = false
                } else {
                    el['readOnly'] = true
                }
            }
        })

        setData(temp)

    }

    const handleClickExport = () => {
        //generate heading
        const colExport = []

        displayColumns.forEach(col => {
            //colExport.push(col.name)
            colExport.push(col.text)
        })

        const headings = [colExport];

        //generate data
        const arr = []
        data.forEach(row => {
            const row_ = {}

            displayColumns.forEach(col => {
                if (col.type === 'modal') {
                    row_[col.name] = row[col.ref]

                } else if (col.type === 'number') {
                    row_[col.name] = parseFloat(row[col.name])

                } else {
                    row_[col.name] = row[col.name]

                }

            })

            arr.push(row_)

        })

        const wb = utils.book_new();
        const ws = utils.json_to_sheet([]);

        utils.sheet_add_aoa(ws, headings);
        utils.sheet_add_json(ws, arr, { origin: 'A2', skipHeader: true });
        utils.book_append_sheet(wb, ws, 'Report');

        writeFile(wb, tableName + '.xlsx');
    }

    const handleClickFilterStatus = (status, statusText) => {
        setIsAktif(status)
        setBtnFilterStatusText('Status => ' + statusText)

        if(setIsAktifA){
            setIsAktifA(status)
        }
    }

    const handleClickImport = () => {
        setGModal({
            show: true,
            type: 'question',
            title: 'Konfirmasi',
            body: 'Apakah data ingin mendownload template file ?',
            buttons: [
                { text: 'Ya', onClick: () => handleDownloadTemplate() },
                {
                    text: 'Tidak', onClick: () => {
                        const inputFile = document.createElement('input')
                        inputFile.type = 'file'
                        inputFile.accept = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'

                        inputFile.addEventListener('change', (e) => handleImport(e))

                        inputFile.click()
                    }
                }
            ],
        })
    }

    const handleClickRestoreRow = (row) => {
        setGModal({
            show: true,
            type: 'question',
            title: 'Konfirmasi',
            body: 'Anda yakin akan mengaktifkan kembali data ?',
            buttons: [
                { text: 'Ya', onClick: () => handleRestore(row) },
                { text: 'Tidak', onClick: null }
            ]
        })

    }

    const handleClickSave = () => {
        const arr = data.filter(key => key.rowState === 'changed' || key.rowState === 'new')

        if (arr.length === 0) { return }

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

    const handleClickShowActive = () => {
        if (isAktif === 1) {
            setIsAktif(0)
        } else {
            setIsAktif(1)
        }
    }

    const handleDelete = async (id) => {
        try {
            var config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }

            const res = await axios.delete(URL_API + tableName + '?id=' + id, config)

            if (res.data.status === 200) {
                setRefreshKey(refreshKey + 1)
            } else {
                setGModal({
                    show: true,
                    type: 'information',
                    title: 'Hapus data gagal',
                    //body: res.data.message.errorInfo[2],
                    body: res.data.message.toString(),
                    buttons: [
                        { text: 'Ok', onClick: null }
                    ]
                })
            }

        } catch (error) {
            setGModal({
                show: true,
                type: 'information',
                title: 'Error',
                body: error.response.data.message,
                buttons: [{ text: 'Ok', onClick: null }]
            })
        }

    }

    const handleDownloadTemplate = () => {
        //generate heading
        const colExport = []

        displayColumns.forEach(col => {
            colExport.push(col.name)
        })

        const headings = [colExport];

        const wb = utils.book_new();
        const ws = utils.json_to_sheet([]);

        utils.sheet_add_aoa(ws, headings);
        utils.book_append_sheet(wb, ws, 'Report');

        writeFile(wb, 'template_' + tableName + '.xlsx');

    }

    const handleImport = (e) => {
        const files = e.target.files;
        if (files.length) {
            const file = files[0];
            const reader = new FileReader()

            //keys of columns array
            const columnsKey = Object.keys(columns)

            reader.onload = (event) => {
                const wb = read(event.target.result);
                const sheets = wb.SheetNames;

                if (sheets.length) {
                    const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);

                    const temp = data.map(l => Object.assign({}, l))

                    rows.forEach(row => {
                        row['rowState'] = 'new'
                        row['readOnly'] = false
                        temp.unshift(row)
                    })
                    setData(temp)
                }
            }

            reader.readAsArrayBuffer(file);

        }
    }

    const handleModalSelected = (row, col, /*id*/ index) => {
        var temp = data.map(l => Object.assign({}, l))

        // temp.forEach(el => {
        //     if (el.id === id) {
        //         el[col.name] = row[col.refValue]
        //         el[col.ref] = row[col.refText]
        //         el['rowState'] = 'changed'
        //     }
        // })

        temp[index][col.name] = row[col.refValue]
        temp[index][col.ref] = row[col.refText]
        temp[index]['rowState'] = 'changed'

        setData(temp)

    }

    const handleRestore = async (row) => {
        try {
            //set is_aktif to 1
            row['is_aktif'] = 1

            const arr = []
            arr.push(row)

            //remove commas from input number
            arr.forEach(el => {
                const keys = Object.keys(el)
                keys.forEach(key => {
                    if (displayColumns.find(col => col.name === key && col.type === 'number')) {
                        el[key] = el[key] ? el[key].toString().replace(/,/g, '') : 0
                    }
                })
            })

            var config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }

            var payload = JSON.stringify({ [tableName]: arr })

            const res = await axios.put(URL_API + tableName + '?', payload, config)

            if (res.data.status === 200) {
                setRefreshKey(refreshKey + 1)
            } else {
                setGModal({
                    show: true,
                    type: 'information',
                    title: 'Simpan data gagal',
                    //body: res.data.message.errorInfo[2],
                    body: res.data.message.toString(),
                    buttons: [
                        { text: 'Ok', onClick: null }
                    ]
                })
            }

        } catch (error) {
            setGModal({
                show: true,
                type: 'information',
                title: 'Error',
                body: error.response.data.message,
                buttons: [{ text: 'Ok', onClick: null }]
            })
        }

    }

    const handleSave = async () => {
        try {
            const arr = data.filter(key => key.rowState === 'changed' || key.rowState === 'new')

            //remove commas from input number
            arr.forEach(el => {
                const keys = Object.keys(el)
                keys.forEach(key => {
                    if (displayColumns.find(col => col.name === key && col.type === 'number')) {
                        el[key] = el[key] ? el[key].toString().replace(/,/g, '') : 0
                    }
                })
            })

            var config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }

            var payload = JSON.stringify({ [tableName]: arr })

            const res = await axios.put(URL_API + tableName + '?', payload, config)

            if (res.data.status === 200) {
                setRefreshKey(refreshKey + 1)
            } else {
                setGModal({
                    show: true,
                    type: 'information',
                    title: 'Simpan data gagal',
                    //body: res.data.message.errorInfo[2],
                    body: res.data.message.toString(),
                    buttons: [
                        { text: 'Ok', onClick: null }
                    ]
                })
            }

        } catch (error) {
            setGModal({
                show: true,
                type: 'information',
                title: 'Error',
                body: error.response.data.message,
                buttons: [{ text: 'Ok', onClick: null }]
            })
        }

    }

    const handleSearch = (e) => {
        e.preventDefault()
        var text = e.target.value
        var toFilter = oldData

        if (!text) {
            setData(oldData)
            setOldData([])
            return false
        }

        if (!oldData || oldData.length === 0) {
            setOldData(data)
            toFilter = data
        }

        var data_ = toFilter.filter((key) => {
            return key.kode.toLowerCase().match(text) ||
                key.nama.toLowerCase().match(text);
        })

        setData(data_)

    }

    const handleShowModalList = (col, /*id*/ index) => {
        setGModalList({
            show: true,
            title: col.modalTitle,
            columns: col.refColumns,
            tableName: col.refTable,
            arrData: col.refArr,
            onHide: () => { setGModalList({ show: false }) },
            onClickOk: (row) => { handleModalSelected(row, col, /*id*/ index) },
            multiple: false

        })
    }

    const handleShowModalFilter = (filter) => {
        setGModalList({
            show: true,
            title: 'Pilih ' + filter.title,
            columns: filter.refColumns,
            tableName: filter.refTable,
            arrData: null,
            onHide: () => { setGModalList({ show: false }) },
            onClickOk: (row) => {
                filter['value'] = row[filter.refValue]
                filter['text'] = row[filter.refText]

                var filterStr_ = ''
                filterColumns.forEach(el => {
                    filterStr_ = '&' + el.name + '=' + el.value
                })

                setFilterStr(filterStr_)

            },
            multiple: false

        })
    }

    const handleSort = (col) => {
        setSortColumn(col)
        setSortOrder(!sortOrder)

        data.sort((a, b) => {
            if (sortOrder) {
                if (a[col] < b[col]) { return -1 }
                if (a[col] > b[col]) { return 1 }
            }

            if (!sortOrder) {
                if (a[col] > b[col]) { return -1 }
                if (a[col] < b[col]) { return 1 }
            }
        })

    }

    const next = () => {
        const start_ = page.start + 10
        const end_ = page.end + 10

        setPage({ start: start_, end: end_ })
    }

    const prev = () => {
        const start_ = page.start - 10
        const end_ = page.end - 10

        setPage({ start: start_, end: end_ })
    }

    return (
        <Card>
            <Card.Header>
                {btnAdd &&
                    <Button type='button' variant='primary' className='me-1' onClick={() => onClickAdd ? onClickAdd(null) : handleClickAddRow()}><i className="fa-regular fa-square-plus"></i> Tambah</Button>
                }

                {!onClickEdit &&
                    <Button type='button' variant='primary' className='me-1' onClick={() => handleClickSave()}><i className="fa-solid fa-floppy-disk"></i> Simpan</Button>
                }

                {btnShowActive &&
                    <Button type='button' variant='primary' className='me-1' onClick={() => handleClickShowActive()}><i className="fa-solid fa-eye"></i> {isAktif === 1 ? 'Tampil tidak aktif ' : 'Tampil aktif'}</Button>
                }

                {btnImportExport &&
                    <Dropdown className='d-inline-block me-1'>
                        <Dropdown.Toggle variant="success" id="dropdownXls">
                            <i className="fa-solid fa-file-excel" /> Import/Export
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item as='button' onClick={() => handleClickImport()}><i className="fa-solid fa-download" /> Import Excel</Dropdown.Item>
                            <Dropdown.Item as='button' onClick={() => handleClickExport()}><i className="fa-solid fa-upload" /> Export Excel</Dropdown.Item>
                        </Dropdown.Menu>

                    </Dropdown>
                }

                {btnShowStatus &&
                    <Dropdown className='d-inline-block me-1' autoClose={true}>
                        <Dropdown.Toggle variant="success" id="dropdownStatus">
                            <i className="fa-solid fa-filter" /> {btnFilterStatusText}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item as='button' onClick={() => handleClickFilterStatus(1, 'Entry')}><i className="fa-regular fa-pen-to-square" /> Entry</Dropdown.Item>
                            <Dropdown.Item as='button' onClick={() => handleClickFilterStatus(2, 'Valid')}><i className="fa-solid fa-check" /> Valid</Dropdown.Item>
                            <Dropdown.Item as='button' onClick={() => handleClickFilterStatus(3, 'Finish')}><i className="fa-regular fa-square-check" /> Finish</Dropdown.Item>
                            <Dropdown.Item as='button' onClick={() => handleClickFilterStatus(0, 'Cancel')}><i className="fa-regular fa-square-minus" /> Cancel</Dropdown.Item>

                            <Dropdown.Divider />

                            <Dropdown.Item as='button' onClick={() => handleClickFilterStatus(1, 'Entry')}><i className="fa-regular fa-trash-can" /> Clear Filter</Dropdown.Item>
                        </Dropdown.Menu>

                    </Dropdown>
                }

                {filterColumns &&
                    <Dropdown className='d-inline-block me-1'>
                        <Dropdown.Toggle variant="success" id="dropdownXls">
                            <i className="fa-solid fa-filter" /> Filter
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {filterColumns.map(filter => (
                                <Button className='dropdown-item' onClick={() => handleShowModalFilter(filter)} key={filter.name}><i className="fa-solid fa-filter" /> {filter.title + (filter.text ? (' : ' + filter.text) : '')}</Button>
                            ))}

                            <Dropdown.Divider />

                            <Button className='dropdown-item' onClick={() => handleClickClearFilter()}><i className="fa-solid fa-eraser" /> Clear Filter</Button>

                        </Dropdown.Menu>

                    </Dropdown>
                }

                <div className='d-inline-block w-25 float-end text-end'>
                    <Form.Control key="textSearch" type="text" name="filter" placeholder="Pencarian" className='float-end' onChange={(e) => handleSearch(e)} />
                </div>
            </Card.Header>

            <Card.Body>
                <Table responsive bordered hover>
                    <thead className='bg-primary text-light'>
                        <tr>
                            <th width='120px' className='text-center'>Action</th>
                            {displayColumns && displayColumns.map(col => (
                                <th
                                    key={col.name}
                                    className={(col.type === 'number' ? 'text-end' : 'text-start') + (sortColumn === col.name ? (!sortOrder ? ' sorted-asc' : ' sorted-desc') : '')}
                                    onClick={() => handleSort(col.name)}
                                >
                                    {col.text}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {data && data.slice(page.start, page.end).map((row, i) => (
                            <tr key={i} className={row.is_aktif ? (row.is_aktif === 2 ? 'text-warning' : '') : ''}>
                                <td className='text-center'>
                                    {row.rowState !== 'new' &&
                                        <Button type='button' variant='primary' className='me-1' onClick={() => onClickEdit ? onClickEdit(row.id) : handleClickEdit(row.id)}><i className="fa-solid fa-pen-to-square" /></Button>
                                    }
                                    {row.is_aktif === 1 &&
                                        <Button type='button' variant='primary' className='me-1' title='Non Aktifkan' onClick={() => handleClickDeleteRow(row.id)}><i className="fa-solid fa-trash" /></Button>
                                    }
                                    {row.is_aktif === 0 &&
                                        <Button type='button' variant='primary' className='me-1' title='Aktifkan' onClick={() => handleClickRestoreRow(row)}><i className="fa-solid fa-trash-can-arrow-up" /></Button>
                                    }
                                    {row.status && row.status === 2 &&
                                        <Button type='button' variant='primary' className='me-1' title='Cetak' onClick={() => onClickCetak ? onClickCetak(row.id) : null} ><i className="fa-solid fa-print" /></Button>
                                    }
                                </td>

                                {displayColumns && displayColumns.map((col, index) => (
                                    <td key={i + '_' + col.name}>
                                        {col.type === 'text' && col.updatable &&
                                            <Form.Control type='text' name={col.name} value={row[col.name] ? row[col.name] : ''} readOnly={row.readOnly} onChange={(e) => handleChange(e, /*row.id*/ i)} />
                                        }

                                        {col.type === 'number' &&
                                            <GInputNumber name={col.name} initialValue={row[col.name]} onChange={(e) => handleChange(e, /*row.id*/ i)} readOnly={row.readOnly} />
                                        }

                                        {col.type === 'modal' && col.updatable &&
                                            <InputGroup>
                                                <Form.Control type='text' name={col.ref} value={row[col.ref] ? row[col.ref] : ''} readOnly={true} />
                                                <Button variant="outline-primary" id={'btn' + col.name + i} className={row.readOnly ? 'd-none' : 'd-inline-block'} onClick={() => handleShowModalList(col, /*row.id*/ i)}>
                                                    <i className="fa-solid fa-magnifying-glass" />
                                                </Button>
                                                <Form.Control type='hidden' name={col.name} value={row[col.name] ? row[col.name] : ''} />
                                            </InputGroup>
                                        }

                                        {!col.updatable && col.type !== 'number' &&
                                            row[col.name]
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>

            <Card.Footer>
                <Row>
                    <Col><span>Result : {(page.end >= data.length ? data.length : page.end) + ' of ' + data.length} rows </span></Col>

                    <Col className="text-center">
                        {data.length > 10 &&
                            <>
                                <Button variant="primary" className='me-1' disabled={page.start === 0 ? 'disabled' : null} onClick={() => prev()}><i className="fa-solid fa-angle-left" /></Button>
                                <Button variant="primary" disabled={page.end >= data.length ? 'disabled' : null} onClick={() => next()}><i className="fa-solid fa-angle-right" /></Button>
                            </>
                        }
                    </Col>

                    <Col className="text-end"><span>Page {(page.start / 10) + 1} / {Math.ceil(data.length / 10)}</span></Col>
                </Row>
            </Card.Footer>

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

        </Card>
    )
}

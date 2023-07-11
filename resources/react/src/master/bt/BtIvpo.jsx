import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { Card, Button, Dropdown, Table } from 'react-bootstrap'
import { URL_API } from '../../utils/Index'
import { GModal } from '../../utils/Index'
import '../../assets/css/btivpo.css'

export const BtIvpo = () => {
    const [data, setData] = useState([])
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const token = localStorage.getItem('token')
    const [gModal, setGModal] = useState({
        type: 'question',
        title: 'Konfirmasi',
        body: null,
        show: false,
        buttons: [],
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = {
                    accept: 'application/json',
                    Authorization: 'Bearer ' + token
                }

                const res = await axios.get(URL_API + 'btivpo?', { headers: headers })

                if (res.data.status === 200) {
                    setData(res.data['btivpo'])
                } else {
                    console.log(res)
                }

            } catch (error) {
                console.log(error.response)
                setGModal({
                    show: true,
                    type: 'information',
                    title: 'Error',
                    body: error.response.data.message,
                    buttons: [{ text: 'Ok', onClick: null }]
                })
            }
        }

        fetchData()

    }, [setData])

    return (
        <Card>
            <Card.Header>
                <Dropdown className='d-inline-block me-1'>
                    <Dropdown.Toggle variant="success" id="dropdownXls">
                        <i className="fa-solid fa-file-excel" /> Import/Export
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Button className='dropdown-item' onClick={() => handleClickImport()}><i className="fa-solid fa-download" /> Import Excel</Button>
                        <Button className='dropdown-item' onClick={() => handleClickExport()}><i className="fa-solid fa-upload" /> Export Excel</Button>
                    </Dropdown.Menu>

                </Dropdown>
            </Card.Header>

            <Card.Body>
                <Table bordered hover className='d-inline-block table-left'>
                    <thead className='bg-primary text-light'>
                        <tr>
                            <th className='text-center' rowSpan={2} width='120px' >Merk</th>
                            <th className='text-center' rowSpan={2} width='120px'>Koleksi</th>
                            <th className='text-center' rowSpan={2} width='150px'>Kategori</th>
                            <th className='text-center' rowSpan={2} width='250px'>Sub Kategori</th>
                            <th>&nbsp;</th>
                        </tr>

                        <tr>
                            <th>&nbsp;</th>
                        </tr>

                    </thead>

                    <tbody>
                        {data && data.map((row, index) => (
                            <tr key={index}>
                                <td>{row.nama_merk}</td>
                                <td>{row.nama_koleksi}</td>
                                <td>{row.nama_kategori}</td>
                                <td>{row.nama_subkategori}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <div className='d-inline-block table-right'>
                    <Table bordered hover>
                        <thead className='bg-primary text-light'>
                            <tr>
                                {months.map(month => (
                                    <th className='text-center' colSpan={2} key={month}>{month}</th>
                                ))}
                            </tr>

                            <tr>
                                {months.map(month => (
                                    <React.Fragment key={month}>
                                        <th className='text-center' width='80px'>Qty</th>
                                        <th className='text-center' width='120px'>Nilai</th>
                                    </React.Fragment>
                                ))}
                            </tr>

                        </thead>

                        <tbody>
                            {data && data.map((row, index) => (
                                <tr key={index}>
                                    {months.map((month, idx) => (
                                        <React.Fragment key={month}>
                                            <td className='text-end'>{row['qty_' + (idx + 1)]}</td>
                                            <td className='text-end'>{row['nilai_' + (idx + 1)]}</td>
                                        </React.Fragment>
                                    ))}

                                </tr>
                            ))}
                        </tbody>
                    </Table>

                </div>

            </Card.Body>

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

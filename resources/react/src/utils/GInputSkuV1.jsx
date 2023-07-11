import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import { GInputNumber } from './Index'

export const GInputSkuV1 = ({ data, setData, showPrice = true, showStock = false, showLokasi = false }) => {
    const [arrV1, setArrV1] = useState([])

    useEffect(() => {
        const createArr = () => {
            var temp = []
            data.forEach(elV1 => {
                if (!temp.find(keyV1 => keyV1.kode_produk === elV1.kode_produk && keyV1.kode_varian_1 === elV1.kode_varian_1)) {
                    var arrV2 = []
                    var arrQty = []
                    var arrSku = []
                    var arrStock = []

                    data.filter(keyV2 => keyV2.kode_produk === elV1.kode_produk && keyV2.kode_varian_1 === elV1.kode_varian_1).forEach(elV2 => {
                        arrV2.push(elV2.nama_varian_2)
                        arrQty.push(elV2.qty)
                        arrSku.push(elV2.id_skuproduk)
                        arrStock.push(elV2.stock)
                    })

                    temp.push({
                        id_produk: elV1.id_produk,
                        kode_produk: elV1.kode_produk,
                        nama_produk: elV1.nama_produk,
                        kode_varian_1: elV1.kode_varian_1,
                        nama_varian_1: elV1.nama_varian_1,
                        hrg: elV1.hrg,
                        disc: elV1.disc,
                        tax: elV1.tax,
                        varian_2: arrV2,
                        qtyVarian2: arrQty,
                        stockVarian2: arrStock,
                        sku: arrSku,
                    })
                }

            })

            setArrV1(temp)

        }

        const createArrLokasi = () => {
            var temp = []
            data.forEach(elV1 => {
                if (!temp.find(keyV1 => keyV1.kode_produk === elV1.kode_produk &&
                    keyV1.kode_varian_1 === elV1.kode_varian_1 &&
                    keyV1.kode_lokasi === elV1.kode_lokasi
                )) {
                    var arrV2 = []
                    var arrQty = []
                    var arrSku = []
                    var arrStock = []

                    data.filter(keyV2 => keyV2.kode_produk === elV1.kode_produk &&
                        keyV2.kode_varian_1 === elV1.kode_varian_1 &&
                        keyV2.kode_lokasi === elV1.kode_lokasi).forEach(elV2 => {
                            arrV2.push(elV2.nama_varian_2)
                            arrQty.push(elV2.qty)
                            arrSku.push(elV2.id_skuproduk)
                            arrStock.push(elV2.stock)
                        })

                    temp.push({
                        id_produk: elV1.id_produk,
                        kode_lokasi: elV1.kode_lokasi,
                        kode_produk: elV1.kode_produk,
                        nama_produk: elV1.nama_produk,
                        kode_varian_1: elV1.kode_varian_1,
                        nama_varian_1: elV1.nama_varian_1,
                        hrg: elV1.hrg,
                        disc: elV1.disc,
                        tax: elV1.tax,
                        varian_2: arrV2,
                        qtyVarian2: arrQty,
                        stockVarian2: arrStock,
                        sku: arrSku,
                    })
                }

            })

            setArrV1(temp)

        }

        if (showLokasi) {
            createArrLokasi()
        } else {
            createArr()
        }

    }, [data])

    const handleChange = (isSku, idSkuProduk, kodeVarian1, e) => {
        var temp = data.map(l => Object.assign({}, l))

        if (!e.target) {
            return
        }

        var name = e.target.name
        var value = e.target.value

        if (!isSku) {
            temp.forEach((el, i) => {
                if (el.id_produk === idSkuProduk && el.kode_varian_1 === kodeVarian1) {
                    temp[i][name] = value
                }
            })
        } else {
            temp.forEach((el, i) => {
                if (el.id_skuproduk === idSkuProduk) {
                    temp[i]['qty'] = value
                }
            })
        }

        setData(temp)
        //setData(temp)
    }

    // Create our number formatter.
    const numberFormat = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        // These options are needed to round to whole numbers if that's what you want.
        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    });

    // remove comma / thousand
    const removeComma = (value) => {
        return value ? parseFloat(value.toString().replace(/,/g, '')) : 0
    }

    return (
        <Table bordered hover responsive className='ginputsku-v1'>
            <thead className="bg-primary text-light">
                <tr>
                    {showLokasi &&
                        <th>Lokasi</th>
                    }
                    <th>Kode Produk</th>
                    <th>Nama Produk</th>
                    {showPrice &&
                        <React.Fragment>
                            <th className='text-end' width='120px'>Harga [Rp]</th>
                            <th className='text-end' width='120px'>Disc [%]</th>
                            <th className='text-end' width='120px'>Tax [%]</th>
                        </React.Fragment>
                    }
                    <th className='text-center'>Varian 1</th>
                    <th colSpan={10} className='text-center'>Varian 2</th>
                    <th colSpan={showPrice ? 2 : 0} className='text-center'>Total</th>
                </tr>
            </thead>

            <tbody>
                {arrV1.map((row, rowIndex) => {
                    var totQty = 0
                    var discAmt = removeComma(row.hrg) * (removeComma(row.disc) / 100)
                    var taxAmt = removeComma(row.hrg) * (removeComma(row.tax) / 100)
                    return (
                        <React.Fragment key={rowIndex}>
                            <tr>
                                <td colSpan={showLokasi && showPrice ? 7 : !showLokasi && showPrice ? 6 : showLokasi && !showPrice ? 4 : 3}></td>

                                {[...Array(10)].map((i, x) => (
                                    <td key={row.kode_produk + row.kode_varian_2 + x} className='bg-primary text-light text-center' width="60px">{row.varian_2[x]}</td>
                                ))}
                                <td className='bg-primary text-light text-center'>Qty</td>

                                {showPrice &&
                                    <td className='bg-primary text-light text-center'>Harga</td>
                                }
                            </tr>

                            <tr>
                                {showLokasi &&
                                    <td>{row.kode_lokasi}</td>
                                }
                                <td>{row.kode_produk}</td>
                                <td>{row.nama_produk}</td>
                                {showPrice &&
                                    <React.Fragment>
                                        <td>
                                            <GInputNumber name='hrg' initialValue={row.hrg} className="text-end" onChange={(e) => handleChange(false, row.id_produk, row.kode_varian_1, e)} />
                                        </td>
                                        <td>
                                            <GInputNumber name='disc' initialValue={row.disc} className="text-end" onChange={(e) => handleChange(false, row.id_produk, row.kode_varian_1, e)} />
                                        </td>
                                        <td>
                                            <GInputNumber name='tax' initialValue={row.tax} className="text-end" onChange={(e) => handleChange(false, row.id_produk, row.kode_varian_1, e)} />
                                        </td>

                                    </React.Fragment>
                                }
                                <td>{row.nama_varian_1}</td>

                                {[...Array(10)].map((i, x) => {
                                    totQty += row.qtyVarian2[x] ? removeComma(row.qtyVarian2[x]) : 0
                                    return (
                                        <td key={row.kode_produk + row.kode_varian_1 + x} className='text-center px-1' width="60px">
                                            {row.varian_2[x] &&
                                                <GInputNumber name={'qty' + x} initialValue={row.qtyVarian2[x]} className="text-end px-1" onChange={(e) => handleChange(true, row.sku[x], row.kode_varian_1, e)} readOnly={row.varian_2[x] ? false : true} />
                                            }
                                        </td>
                                    )
                                })}

                                <td className='text-end'>{numberFormat.format(totQty)}</td>

                                {showPrice &&
                                    <td className='text-end'>{numberFormat.format((removeComma(row.hrg) - discAmt + taxAmt) * totQty)}</td>
                                }
                            </tr>

                            {showStock &&
                                <tr>
                                    <td colSpan={showLokasi && showPrice ? 7 : !showLokasi && showPrice ? 6 : showLokasi && !showPrice ? 4 : 3}></td>
                                    {[...Array(10)].map((i, x) => (
                                        <td key={row.kode_produk + row.kode_varian_2 + x} className={row.stockVarian2[x] ? 'bg-primary text-light text-center' : ''} width="60px">{row.stockVarian2[x] ? numberFormat.format(row.stockVarian2[x]) : ''}</td>
                                    ))}
                                    <td colSpan={showPrice ? 2 : 1}></td>
                                </tr>
                            }

                        </React.Fragment>

                    )
                })}
            </tbody>

        </Table>
    )
}

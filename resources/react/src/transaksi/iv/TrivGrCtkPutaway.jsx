import axios from 'axios'
import React, { useEffect, useState } from 'react'
import ReactPDF, { Page, Text, View, Document, StyleSheet, PDFViewer, Image, Font } from '@react-pdf/renderer'
import { QRCodeCanvas } from 'qrcode.react'
import { URL_API } from '../../utils/Index'

export const TrivGrCtkPutaway = (props) => {
    const [dataHeader, setDataHeader] = useState({})
    const [dataDetail, setDataDetail] = useState([])
    const [dataParam, setDataParam] = useState({})
    const token = localStorage.getItem('token')

    const styles = StyleSheet.create({
        viewer: {
            width: '100%', //the pdf viewer will take up all of the width and height
            height: window.innerHeight - 5,
        },
        page: {
            padding: '5mm',
            fontSize: '9px',
        },
        qrImage: {
            width: '42px',
            height: 'auto'
        }
    });

    useEffect(() => {
        const createArr = (data) => {
            let temp = []

            data.forEach(elV1 => {
                if (!temp.find(keyV1 => keyV1.kode_produk === elV1.kode_produk
                    && keyV1.kode_varian_1 === elV1.kode_varian_1
                    && keyV1.kode_lokasi === elV1.kode_lokasi)) {
                    let arrV2 = []
                    let arrQty = []
                    let arrSku = []
                    let arrStock = []

                    data.filter(keyV2 => keyV2.kode_produk === elV1.kode_produk
                        && keyV2.kode_varian_1 === elV1.kode_varian_1
                        && keyV2.kode_lokasi === elV1.kode_lokasi).forEach(elV2 => {
                            arrV2.push(elV2.nama_varian_2)
                            arrQty.push(elV2.qty)
                            arrSku.push(elV2.id_skuproduk)
                            // arrStock.push(elV2.stock)
                        })

                    temp.push({
                        id_produk: elV1.id_produk,
                        kode_lokasi: elV1.kode_lokasi,
                        kode_produk: elV1.kode_produk,
                        nama_produk: elV1.nama_produk,
                        kode_varian_1: elV1.kode_varian_1,
                        nama_varian_1: elV1.nama_varian_1,
                        // hrg: elV1.hrg,
                        // disc: elV1.disc,
                        // tax: elV1.tax,
                        varian_2: arrV2,
                        qtyVarian2: arrQty,
                        // stockVarian2: arrStock,
                        sku: arrSku,
                    })
                }

            })
            console.log(temp)
            setDataDetail(temp)

        }

        const fetchData = async () => {
            try {
                const headers = {
                    accept: 'application/json',
                    Authorization: 'Bearer ' + token
                }

                const res = await axios.get(URL_API + 'trivgrctkputaway?id_reff=' + props.id, { headers: headers })

                if (res.data.status === 200) {
                    setDataHeader(res.data['header'][0])
                    setDataParam(res.data['param'][0])
                    //setDataDetail(res.data['detail'])
                    createArr(res.data['detail'])
                } else {
                    alert(JSON.stringify(res))
                }

            } catch (error) {
                alert(JSON.stringify(error))
            }
        }

        fetchData()

    }, [setDataHeader])

    const Detail = () => (
        <React.Fragment>
            <View style={{ display: "flex", flexDirection: "row", marginBottom: "5px", borderTop: '1px', borderBottom: '1px', padding: '2px' }}>
                <Text style={{ flexDirection: 'column', width: '60px', borderRight: '1px', textAlign: 'center' }}>Lokasi</Text>
                <Text style={{ flexDirection: 'column', width: '80px', borderRight: '1px', textAlign: 'center' }}>Produk</Text>
                <Text style={{ flexDirection: 'column', width: '80px', borderRight: '1px', textAlign: 'center' }}>Varian 1</Text>
                <Text style={{ flex: 1, flexDirection: 'column', textAlign: 'center' }}>Varian 2 & Qty</Text>
            </View>

            {dataDetail.map((row, i) => (
                <React.Fragment key={'row_' + i}>
                    <View style={{ display: "flex", flexDirection: "row", marginBottom: "5px", padding: '2px' }}>
                        <Text style={{ flexDirection: 'column', width: '220px', textAlign: 'center' }} />

                        {[...Array(10)].map((i, x) => (
                            <Text key={'varian_' + row.varian_2[x]} style={{ flex: 1, flexDirection: 'column', textAlign: 'center' }}>{row.varian_2[x]}</Text>
                        ))}

                    </View>

                    <View style={{ display: "flex", flexDirection: "row", marginBottom: "5px", padding: '2px' }}>
                        <Text style={{ flexDirection: 'column', width: '60px', textAlign: 'center' }}>{row.kode_lokasi}</Text>
                        <Text style={{ flexDirection: 'column', width: '80px', textAlign: 'center' }}>{row.kode_produk}</Text>
                        <Text style={{ flexDirection: 'column', width: '80px', textAlign: 'center' }}>{row.nama_varian_1}</Text>

                        {[...Array(10)].map((i, x) => (
                            <Text key={'qty_' + row.varian_2[x]} style={{ flex: 1, flexDirection: 'column', textAlign: 'center' }}>{row.qtyVarian2[x] ? numberFormat.format(row.qtyVarian2[x]) : ''}</Text>
                        ))}

                    </View>

                </React.Fragment>
            ))}

        </React.Fragment>
    )

    const Header = () => (
        <React.Fragment>
            <View style={{ display: "flex", flexDirection: "row" }}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={{ fontSize: '12px' }}>{dataParam.nama}</Text>
                    <Text style={{ fontSize: '8px' }}>{dataParam.alamat + ', ' + dataParam.kelurahan + ', ' + dataParam.kecamatan + ', ' + dataParam.nama_kota}</Text>
                    <Text style={{ fontSize: '8px' }}>{dataParam.provinsi + ', ' + dataParam.kodepos}</Text>
                </View>

                <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Image allowDangerousPaths src={document.getElementById('qr_nopw') ? document.getElementById('qr_nopw').toDataURL() : null} style={styles.qrImage} />
                </View>
            </View>

            <View style={{ display: "flex", flexDirection: "row", marginBottom: "5px" }}>
                <Text style={{ fontSize: '12px' }}>Putaway</Text>
            </View>

            <View style={{ display: "flex", flexDirection: "row", marginBottom: "5px" }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text style={{ width: '80px' }}>No. Putaway</Text>
                    <Text>: {dataHeader['no_pw']}</Text>
                </View>

                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text style={{ width: '80px' }}>Gudang</Text>
                    <Text>: {dataHeader['nama_gudang']}</Text>
                </View>

            </View>

            <View style={{ display: "flex", flexDirection: "row", marginBottom: "5px" }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text style={{ width: '80px' }}>No. Penerimaan</Text>
                    <Text>: {dataHeader['no_gr']}</Text>
                </View>

                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text style={{ width: '80px' }}>Tanggal</Text>
                    <Text>: {dataHeader['updated_ata']}</Text>
                </View>
            </View>

            <View style={{ display: "flex", flexDirection: "row", marginBottom: "5px" }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text style={{ width: '80px' }}>Merk</Text>
                    <Text>: {dataHeader['nama_merk']}</Text>
                </View>

            </View>

        </React.Fragment>
    )

    // Create our number formatter.
    const numberFormat = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        // These options are needed to round to whole numbers if that's what you want.
        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    });

    return (
        <React.Fragment>
            <div style={{ 'display': 'none' }}>
                <QRCodeCanvas value={dataHeader.no_pw} id='qr_nopw' />
            </div>

            <PDFViewer style={styles.viewer}>
                <Document title='Cetak Putaway'>
                    <Page size="A5" style={styles.page} orientation='landscape'>
                        {
                            Header()
                        }
                        {
                            Detail()
                        }
                    </Page>
                </Document>
            </PDFViewer>
        </React.Fragment>
    )
}

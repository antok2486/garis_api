import React, { useState } from 'react'
import { GReportV1 } from '../../utils/Index'

export const RiMutg = () => {
    const [summary, setSummary] = useState({})
    const modalColumns = [
        { name: 'kode', text: 'Kode' },
        { name: 'nama', text: 'Nama' }
    ]

    const handleSummary = (data) => {
        //let temp = Object.assign({}, summary)
        let temp = {}
        
        data.map(row => {
            temp['igr'] ? temp['igr'] += parseFloat(row['igr']) : temp['igr'] = parseFloat(row['igr'])
        })

        setSummary(temp)
    }

    return (
        <GReportV1
            tableName='rsmuts'
            filterColumns={[
                { name: 'periode', text: 'Periode', type: 'text', col: 0 },
                { name: 'id_merk', text: 'Merk', type: 'modal', col: 0, ref: 'nama_merk', refTable: 'mrmerk?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Merk' },
                { name: 'id_gudang', text: 'Gudang', type: 'modal', col: 0, ref: 'nama_gudang', refTable: 'mdgudg?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Gudang' },
                { name: 'id_produk', text: 'Produk', type: 'modal', col: 1, ref: 'kode_produk', refTable: 'mpprod?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'kode', modalTitle: 'Pilih Produk' },
                { name: 'id_skuproduk', text: 'SKU Produk', type: 'text', col: 1 },
                { name: 'tot_igr', text: 'Penerimaan PO', type: 'summary', col: 2, value: summary['igr'] },

            ]}
            columns={[
                {name: 'kode_produk', text: 'Kode Produk', type: 'text'},
                {name: 'awal', text: 'Awal', type: 'number', total: true},
                {name: 'igr', text: 'Terima Brg', type: 'number', total: true},
                {name: 'irc', text: 'Retur Counter', type: 'number', total: true},
                {name: 'itf', text: 'Trf Masuk', type: 'number', total: true},
                {name: 'isl', text: 'Retur Jual', type: 'number', total: true},
                {name: 'ogr', text: 'Retur PO', type: 'number', total: true},
                {name: 'odc', text: 'Kirim Counter', type: 'number', total: true},
                {name: 'otf', text: 'Trf Keluar', type: 'number', total: true},
                {name: 'osl', text: 'Penjualan', type: 'number', total: true},
                {name: 'akhir', text: 'Akhir', type: 'number', total: true},
            ]}
            handleSummary={handleSummary}
        />
    )
}

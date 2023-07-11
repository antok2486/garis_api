import { GListEdit } from "../../utils/GListEdit"

export const MpDisc = () => {
    const modalColumns = [
        {name: 'kode', text: 'Kode'},
        {name: 'nama', text: 'Nama'}
        ]
    const arrJenisDic = [
        {id: 'P0', kode: 'P0', nama: 'Persen'},
        {id: 'P1', kode: 'P1', nama: 'Persen Bertingkat'},
        {id: 'N0', kode: 'N0', nama: 'Nominal'},
        {id: 'N1', kode: 'N1', nama: 'Nominal Bertingkat'},
    ]
    return (
        <GListEdit
            tableName='mpdisc'
            columns={{id: null, kode: '', nama: '', id_golbahan: '', id_jenisbahan: '', id_satuan: ''}}
            displayColumns={[
                {name: 'kode', text: 'Kode', type: 'text', updatable: true},
                {name: 'nama', text: 'Nama', type: 'text', updatable: true},
                {name: 'id_tipecounter', text: 'Tipe Counter', type: 'modal', ref: 'nama_tipecounter', refTable:'mdgudt?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Tipe Counter', updatable: true},
                {name: 'jenis_disc', text: 'Jenis Diskon', type: 'modal', ref: 'nama_jenisdisc', refArr:arrJenisDic, refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Jenis Diskon', updatable: true},
                {name: 'min_pembelian', text: 'Min Pembelian [Rp]', type: 'number', updatable: true},
                {name: 'disc_1', text: 'Diskon 1', type: 'number', updatable: true},
                {name: 'disc_2', text: 'Diskon 2', type: 'number', updatable: true},
                {name: 'disc_3', text: 'Diskon 3', type: 'number', updatable: true},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
        />
    )
}

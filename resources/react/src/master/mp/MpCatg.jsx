import { GListEdit } from "../../utils/GListEdit"

export const MpCatg = () => {
    const modalColumns = [
        {name: 'kode', text: 'Kode'},
        {name: 'nama', text: 'Nama'}
        ]
    return (
        <GListEdit
            tableName='mpcatg'
            columns={{id: null, kode: '', nama: '', id_golproduk: ''}}
            displayColumns={[
                {name: 'kode', text: 'Kode', type: 'text', updatable: true},
                {name: 'nama', text: 'Nama', type: 'text', updatable: true},
                {name: 'id_golproduk', text: 'Golongan Produk', type: 'modal', ref: 'nama_golproduk', refTable:'mpcatn?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Golongan Produk', updatable: true},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
        />
    )
}

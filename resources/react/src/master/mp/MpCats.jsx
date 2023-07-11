import { GListEdit } from "../../utils/GListEdit"

export const MpCats = () => {
    const modalColumns = [
        {name: 'kode', text: 'Kode'},
        {name: 'nama', text: 'Nama'}
        ]
    return (
        <GListEdit
            tableName='mpcats'
            columns={{id: null, kode: '', nama: '', id_golproduk: ''}}
            displayColumns={[
                {name: 'kode', text: 'Kode', type: 'text', updatable: true},
                {name: 'nama', text: 'Nama', type: 'text', updatable: true},
                {name: 'id_kategori', text: 'Kategori Produk', type: 'modal', ref: 'nama_kategori', refTable:'mpcatg?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Kategori Produk', updatable: true},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
        />
    )
}

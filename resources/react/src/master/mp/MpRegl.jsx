import { GListEdit } from "../../utils/GListEdit"

export const MpRegl = () => {
    return (
        <GListEdit
            tableName='mpregl'
            columns={{id: null, kode: '', nama: ''}}
            displayColumns={[
                {name: 'kode', text: 'Kode', type: 'text', updatable: true},
                {name: 'nama', text: 'Nama', type: 'text', updatable: true},
                {name: 'umur', text: 'Umur Produk', type: 'number', updatable: true},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
        />
    )
}

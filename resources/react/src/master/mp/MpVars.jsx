import { GListEdit } from "../../utils/GListEdit"

export const MpVars = () => {
    const modalColumns = [
        {name: 'kode', text: 'Kode'},
        {name: 'nama', text: 'Nama'}
        ]
    return (
        <GListEdit
            tableName='mpvars'
            columns={{id: null, kode: '', nama: '', id_golproduk: ''}}
            displayColumns={[
                {name: 'kode', text: 'Kode', type: 'text', updatable: true},
                {name: 'nama', text: 'Nama', type: 'text', updatable: true},
                {name: 'id_jenisvarian', text: 'Jenis Varian', type: 'modal', ref: 'nama_jenisvarian', refTable:'mpvarj?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Jenis Varian', updatable: true},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
        />
    )
}

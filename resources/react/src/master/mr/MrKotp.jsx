import { GListEdit } from "../../utils/GListEdit"

export const MrKotp = () => {
    return (
        <GListEdit
            tableName='mrkotp'
            columns={{id: null, kode: '', nama: ''}}
            displayColumns={[
                {name: 'nama_kota', text: 'Kota', type: 'text', updatable: false},
                {name: 'kecamatan', text: 'Kecamatan', type: 'text', updatable: true},
                {name: 'kelurahan', text: 'Kelurahan', type: 'text', updatable: true},
                {name: 'kodepos', text: 'Kode Pos', type: 'text', updatable: true},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
            filterColumns={[
                {name: 'id_kota', title:'Kota', refTable: 'mrkota?is_aktif=1', refColumns: [{name: 'kode', text:'Kode'}, {name: 'nama', text: 'Nama Kota'}], refValue: 'id', refText: 'nama'},
            ]}
        />
    )
}

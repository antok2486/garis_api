import { GListEdit } from "../../utils/GListEdit"

export const MdCusm = () => {
    const modalColumns = [
        {name: 'kode', text: 'Kode'},
        {name: 'nama', text: 'Nama'}
        ]
    return (
        <GListEdit
            tableName='mdcusm'
            columns={{id: null, kode: '', nama: '', id_grupcust: '', margin_p: 0, margin_rp: 0, nama_grupcust: ''}}
            displayColumns={[
                {name: 'kode', text: 'Kode', type: 'text', updatable: true},
                {name: 'nama', text: 'Nama', type: 'text', updatable: true},
                {name: 'id_grupcust', text: 'Grup Customer', type: 'modal', ref: 'nama_grupcust', refTable:'mdcusg?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Grup Customer', updatable: true},
                {name: 'margin_p', text: 'Margin [%]', type: 'number', updatable: true},
                {name: 'margin_rp', text: 'Margin [Rp]', type: 'number', updatable: true},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
        />
    )
}

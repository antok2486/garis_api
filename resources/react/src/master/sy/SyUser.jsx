import { GListEdit } from "../../utils/GListEdit"

export const SyUser = () => {
    const modalColumns = [
        {name: 'nama', text: 'Nama'}
        ]
    return (
        <GListEdit
            tableName='syuser'
            columns={{id: null, kode: '', nama: ''}}
            displayColumns={[
                {name: 'nama', text: 'Nama', type: 'text', updatable: true},
                {name: 'email', text: 'Email', type: 'text', updatable: true},
                {name: 'tlp', text: 'Tlp', type: 'text', updatable: true},
                {name: 'id_grupuser', text: 'Grup User', type: 'modal', ref: 'nama_grupuser', refTable:'sygrup?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Grup User', updatable: true},
                {name: 'is_aktifa', text: 'Status', type: 'text', updatable: false},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
        />
    )
}

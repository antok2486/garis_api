import { GListEdit } from "../../utils/GListEdit"

export const MpVarj = () => {
    const modalColumns = [
        {name: 'kode', text: 'Kode'},
        {name: 'nama', text: 'Nama'}
        ]
    return (
        <GListEdit
            tableName='mpvarj'
            columns={{id: null, kode: '', nama: ''}}
            displayColumns={[
                {name: 'kode', text: 'Kode', type: 'text', updatable: true},
                {name: 'nama', text: 'Nama', type: 'text', updatable: true},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
        />
    )
}

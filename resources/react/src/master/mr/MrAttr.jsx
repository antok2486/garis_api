import { GListEdit } from "../../utils/GListEdit"

export const MrAttr = () => {
    return (
        <GListEdit
            tableName='mrattr'
            columns={{id: null, kode: '', nama: ''}}
            displayColumns={[
                {name: 'tag_grup', text: 'Attribut', type: 'text', updatable: true},
                {name: 'tag_value', text: 'Value', type: 'text', updatable: true},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
        />
    )
}

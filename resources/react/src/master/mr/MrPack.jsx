import { GListEdit } from "../../utils/GListEdit"

export const MrPack = () => {
    return (
        <GListEdit
            tableName='mrpack'
            columns={{id: null, kode: '', nama: ''}}
            displayColumns={[
                {name: 'kode', text: 'Kode', type: 'text', updatable: true},
                {name: 'nama', text: 'Nama', type: 'text', updatable: true},
                {name: 'panjang', text: 'Panjang [cm]', type: 'number', updatable: true},
                {name: 'lebar', text: 'Lebar [cm]', type: 'number', updatable: true},
                {name: 'tinggi', text: 'Tinggi [cm]', type: 'number', updatable: true},
                {name: 'berat', text: 'Berat [gr]', type: 'number', updatable: true},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
        />
    )
}

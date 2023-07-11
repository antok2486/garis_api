import { GListEdit } from "../../utils/GListEdit"

export const MdGudl = () => {
    const modalColumns = [
        {name: 'kode', text: 'Kode'},
        {name: 'nama', text: 'Nama'}
        ]
    return (
        <GListEdit
            tableName='mdgudl'
            columns={{id: null, kode: '', id_gudang: '', id_rak: '', kapasitas: ''}}
            displayColumns={[
                {name: 'kode', text: 'Kode Lokasi', type: 'text', updatable: true},
                {name: 'id_gudang', text: 'Gudang', type: 'modal', ref: 'nama_gudang', refTable:'mdgudg?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Gudang', updatable: true},
                {name: 'id_rak', text: 'Jenis Rak', type: 'modal', ref: 'nama_rak', refTable:'mrrack?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Jenis Rak', updatable: true},
                {name: 'kapasitas', text: 'Kapasitas', type: 'number', updatable: true},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
        />
    )
}

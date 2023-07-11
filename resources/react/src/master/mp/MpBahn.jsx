import { GListEdit } from "../../utils/GListEdit"

export const MpBahn = () => {
    const modalColumns = [
        {name: 'kode', text: 'Kode'},
        {name: 'nama', text: 'Nama'}
        ]
    return (
        <GListEdit
            tableName='mpbahn'
            columns={{id: null, kode: '', nama: '', id_golbahan: '', id_jenisbahan: '', id_satuan: ''}}
            displayColumns={[
                {name: 'kode', text: 'Kode', type: 'text', updatable: true},
                {name: 'nama', text: 'Nama', type: 'text', updatable: true},
                {name: 'id_golbahan', text: 'Golongan Bahan', type: 'modal', ref: 'nama_golbahan', refTable:'mpbahg?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Golongan Bahan', updatable: true},
                {name: 'id_jenisbahan', text: 'Jenis Bahan', type: 'modal', ref: 'nama_jenisbahan', refTable:'mpbahj?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Jenis Bahan', updatable: true},
                {name: 'id_satuan', text: 'Satuan', type: 'modal', ref: 'nama_satuan', refTable:'mrsatn?is_aktif=1', refColumns: modalColumns, refValue: 'id', refText: 'nama', modalTitle: 'Pilih Satuan', updatable: true},
                {name: 'user_update', text: 'User Update', type: 'text', updatable: false},
                {name: 'updated_ata', text: 'Tgl Update', type: 'text', updatable: false},
            ]}
        />
    )
}

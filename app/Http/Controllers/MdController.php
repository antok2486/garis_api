<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\md\Mdcusg;
use App\Models\md\Mdcusj;
use App\Models\md\Mdcusm;
use App\Models\md\Mdcusp;
use App\Models\md\Mdcust;
use App\Models\md\Mdgudg;
use App\Models\md\Mdgudk;
use App\Models\md\Mdgudl;
use App\Models\md\Mdgudt;
use App\Models\md\Mdsupj;
use App\Models\md\Mdsupl;

class MdController extends Controller
{
    function delete(Request $request)
    {
        $path = explode('/', $request->path());
        $model = app('App\Models\md\\' . ucfirst($path[1]));

        DB::beginTransaction();

        try {
            $model::where('id', '=', $request['id'])
                ->update([
                    'is_aktif' => 0,
                    'user_update' => $request->user()->email
                ]);

            DB::commit();

            return response()->json(array('status' => 200));
        } catch (\Exception $e) {
            DB::rollback();

            return response()->json(array('status' => 501, 'message' => $e->getMessage() . ' at ' . $e->getFile() . ' line: ' . $e->getLine()));
        } catch (\Throwable $e) {
            DB::rollback();

            return response()->json(array('status' => 502, 'message' => $e->getMessage() . ' at ' . $e->getFile() . ' line: ' . $e->getLine()));
        }
    }

    function get(Request $request)
    {
        $path = explode('/', $request->path());
        $method_name = 'get_' . $path[1];

        return $this->$method_name($request);
    }

    function put(Request $request)
    {
        $path = explode('/', $request->path());
        $method_name = 'put_' . $path[1];

        DB::beginTransaction();

        try {
            $this->$method_name($request);

            DB::commit();

            return response()->json(array('status' => 200));
        } catch (\Exception $e) {
            DB::rollback();

            return response()->json(array('status' => 501, 'message' => $e->getMessage() . ' at ' . $e->getFile() . ' line: ' . $e->getLine()));
        } catch (\Throwable $e) {
            DB::rollback();

            return response()->json(array('status' => 502, 'message' => $e->getMessage() . ' at ' . $e->getFile() . ' line: ' . $e->getLine()));
        }
    }

    function get_id($column)
    {
        $select = "
            (coalesce(" . $column . ", 0) +1) as last_id
        ";

        $res = DB::table('syparm')
            ->selectRaw($select)
            ->lockForUpdate()
            ->get();

        $last_id = $res[0]->last_id;

        #update id
        DB::table('syparm')->update([
            $column => $last_id,
        ]);

        return $last_id;
    }

    function get_kode($tableName, $kode)
    {
        $res = DB::table($tableName)
            ->selectRaw('sum(1) max')
            ->where('kode', 'LIKE', $kode . '%')
            ->get();

        $last = $res[0]->max + 1;
        $new_kode = $kode . substr('000' . $last, -3);

        return $new_kode;
    }

    function get_mdcusg(Request $request)
    {
        $res = DB::table('mdcusg')
            ->selectRaw("*, to_char(updated_at, 'DD-MM-YYYY HH24:MI:SS') as updated_ata")
            ->where('is_aktif', '=', $request['is_aktif'])
            ->get();

        return response()->json(array('status' => 200, 'mdcusg' => $res));
    }

    function get_mdcusj(Request $request)
    {
        $res = DB::table('mdcusj')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata")
            ->where('is_aktif', '=', $request['is_aktif'])
            ->get();

        return response()->json(array('status' => 200, 'mdcusj' => $res));
    }

    function get_mdcusm(Request $request)
    {
        $res = DB::table('mdcusm')
            ->leftJoin('mdcusg', 'mdcusm.id_grupcust', '=', 'mdcusg.id')
            ->selectRaw("mdcusm.*, to_char(mdcusm.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata, mdcusg.nama as nama_grupcust")
            ->where('mdcusm.is_aktif', '=', $request['is_aktif'])
            ->get();

        return response()->json(array('status' => 200, 'mdcusm' => $res));
    }

    function get_mdcust(Request $request)
    {
        $select = "
            mdcust.*, to_char(mdcust.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata, 
            mdcusg.nama as nama_grupcust,
            mdcusj.nama as nama_jeniscust,
            mrkota.nama as nama_kota,
            mrmerk.nama as nama_merk
        ";

        if ($request['id']) {
            $res = DB::table('mdcust')
                ->leftJoin('mdcusg', 'mdcust.id_grupcust', '=', 'mdcusg.id')
                ->leftJoin('mdcusj', 'mdcust.id_jeniscust', '=', 'mdcusj.id')
                ->leftJoin('mrkota', 'mdcust.id_kota', '=', 'mrkota.id')
                ->leftJoin('mrmerk', 'mdcust.id_merk', '=', 'mrmerk.id')
                ->selectRaw($select)
                ->where('mdcust.id', '=', $request['id'])
                ->get();

            $select_mdcusp = "
                mdcusp.*,
                mrmerk.nama as nama_merk
            ";

            $res_mdcusp = DB::table('mdcusp')
                ->leftJoin('mrmerk', 'mdcusp.id_merk', '=', 'mrmerk.id')
                ->selectRaw($select_mdcusp)
                ->where('mdcusp.id_customer', '=', $request['id'])
                ->orderBy('mrmerk.nama', 'asc')
                ->get();

            return response()->json(array('status' => 200, 'mdcust' => $res, 'mdcusp' => $res_mdcusp));
        } else {
            $res = DB::table('mdcust')
                ->leftJoin('mdcusg', 'mdcust.id_grupcust', '=', 'mdcusg.id')
                ->leftJoin('mdcusj', 'mdcust.id_jeniscust', '=', 'mdcusj.id')
                ->leftJoin('mrkota', 'mdcust.id_kota', '=', 'mrkota.id')
                ->leftJoin('mrmerk', 'mdcust.id_merk', '=', 'mrmerk.id')
                ->selectRaw($select)
                ->where('mdcust.is_aktif', '=', $request['is_aktif'])
                ->get();

            return response()->json(array('status' => 200, 'mdcust' => $res));
        }
    }

    function get_mdgudg(Request $request)
    {
        $select = "
            case mdgudg.jenis_gudang when 1 then 'Gudang' when 2 then 'Counter' end as nama_jenisgudang,
            mdgudg.*, to_char(mdgudg.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata, 
            mdcust.nama as nama_customer,
            mdgudt.nama as nama_tipegudang,
            mrkota.nama as nama_kota,
            mrmerk.nama as nama_merk
        ";

        $id_tipegudang = '%';
        if ($request['id_tipegudang']) {
            $id_tipegudang = $request['id_tipegudang'];
        }

        if ($request['id']) {
            $res = DB::table('mdgudg')
                ->leftJoin('mdgudt', 'mdgudg.id_tipegudang', '=', 'mdgudt.id')
                ->leftJoin('mdcust', 'mdgudg.id_customer', '=', 'mdcust.id')
                ->leftJoin('mrkota', 'mdgudg.id_kota', '=', 'mrkota.id')
                ->leftJoin('mrmerk', 'mdgudg.id_merk', '=', 'mrmerk.id')
                ->selectRaw($select)
                ->where('mdgudg.id', '=', $request['id'])
                ->get();

            $select_mdgudk = "
                mdgudk.*,
                mrmerk.nama as nama_merk
            ";

            $res_mdgudk = DB::table('mdgudk')
                ->leftJoin('mrmerk', 'mdgudk.id_merk', '=', 'mrmerk.id')
                ->selectRaw($select_mdgudk)
                ->where('mdgudk.id_gudang', '=', $request['id'])
                ->orderBy('mrmerk.nama', 'asc')
                ->get();

            return response()->json(array('status' => 200, 'mdgudg' => $res, 'mdgudk' => $res_mdgudk));
        } else {
            $res = DB::table('mdgudg')
                ->leftJoin('mdgudt', 'mdgudg.id_tipegudang', '=', 'mdgudt.id')
                ->leftJoin('mdcust', 'mdgudg.id_customer', '=', 'mdcust.id')
                ->leftJoin('mrkota', 'mdgudg.id_kota', '=', 'mrkota.id')
                ->leftJoin('mrmerk', 'mdgudg.id_merk', '=', 'mrmerk.id')
                ->selectRaw($select)
                ->where('mdgudg.is_aktif', '=', $request['is_aktif'])
                ->whereRaw("coalesce(cast(mdgudg.id_tipegudang as text), '') LIKE '" . $id_tipegudang . "' ")
                ->get();

            return response()->json(array('status' => 200, 'mdgudg' => $res));
        }
    }

    function get_mdgudl(Request $request)
    {
        $select = "
        mdgudl.*, to_char(mdgudl.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata,
        mdgudg.nama as nama_gudang,
        mrrack.nama as nama_rak
        ";
        $res = DB::table('mdgudl')
            ->leftJoin('mdgudg', 'mdgudl.id_gudang', '=', 'mdgudg.id')
            ->leftJoin('mrrack', 'mdgudl.id_rak', '=', 'mrrack.id')
            ->selectRaw($select)
            ->where('mdgudl.is_aktif', '=', $request['is_aktif'])
            ->get();

        return response()->json(array('status' => 200, 'mdgudl' => $res));
    }

    function get_mdgudt(Request $request)
    {
        $res = DB::table('mdgudt')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata")
            ->where('is_aktif', '=', $request['is_aktif'])
            ->get();

        return response()->json(array('status' => 200, 'mdgudt' => $res));
    }

    function get_mdsupj(Request $request)
    {
        $res = DB::table('mdsupj')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata")
            ->where('is_aktif', '=', $request['is_aktif'])
            ->get();

        return response()->json(array('status' => 200, 'mdsupj' => $res));
    }

    function get_mdsupl(Request $request)
    {
        $select = "
            mdsupl.*, to_char(mdsupl.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata, 
            mdsupj.nama as nama_jenissupl,
            mrkota.nama as nama_kota,
            mrmerk.nama as nama_merk
        ";

        $id_jenissupl = '%';
        if ($request['id_jenissupl']) {
            $id_jenissupl = $request['id_jenissupl'];
        }

        if ($request['id']) {
            $res = DB::table('mdsupl')
                ->leftJoin('mdsupj', 'mdsupl.id_jenissupl', '=', 'mdsupj.id')
                ->leftJoin('mrkota', 'mdsupl.id_kota', '=', 'mrkota.id')
                ->leftJoin('mrmerk', 'mdsupl.id_merk', '=', 'mrmerk.id')
                ->selectRaw($select)
                ->where('mdsupl.id', '=', $request['id'])
                ->get();
        } else {
            $res = DB::table('mdsupl')
                ->leftJoin('mdsupj', 'mdsupl.id_jenissupl', '=', 'mdsupj.id')
                ->leftJoin('mrkota', 'mdsupl.id_kota', '=', 'mrkota.id')
                ->leftJoin('mrmerk', 'mdsupl.id_merk', '=', 'mrmerk.id')
                ->selectRaw($select)
                ->where('mdsupl.is_aktif', '=', $request['is_aktif'])
                ->whereRaw("coalesce(cast(mdsupl.id_jenissupl as text), '') LIKE '" . $id_jenissupl . "' ")
                ->get();
        }

        return response()->json(array('status' => 200, 'mdsupl' => $res));
    }

    function put_mdcusg(Request $request)
    {
        $req_mdcusg = $request['mdcusg'];

        for ($i = 0; $i < count($req_mdcusg); $i++) {
            if (!isset($req_mdcusg[$i]['id']) || $req_mdcusg[$i]['id'] == '') {
                Mdcusg::insert([
                    'kode' => $req_mdcusg[$i]['kode'],
                    'nama' => $req_mdcusg[$i]['nama'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mdcusg::where('id', '=', $req_mdcusg[$i]['id'])
                    ->update([
                        'kode' => $req_mdcusg[$i]['kode'],
                        'nama' => $req_mdcusg[$i]['nama'],
                        'is_aktif' => $req_mdcusg[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mdcusj(Request $request)
    {
        $req_mdcusj = $request['mdcusj'];

        for ($i = 0; $i < count($req_mdcusj); $i++) {
            if (!isset($req_mdcusj[$i]['id']) || $req_mdcusj[$i]['id'] == '') {
                Mdcusj::insert([
                    'kode' => $req_mdcusj[$i]['kode'],
                    'nama' => $req_mdcusj[$i]['nama'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mdcusj::where('id', '=', $req_mdcusj[$i]['id'])
                    ->update([
                        'kode' => $req_mdcusj[$i]['kode'],
                        'nama' => $req_mdcusj[$i]['nama'],
                        'is_aktif' => $req_mdcusj[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mdcusm(Request $request)
    {
        $req_mdcusm = $request['mdcusm'];

        for ($i = 0; $i < count($req_mdcusm); $i++) {
            if (!isset($req_mdcusm[$i]['id']) || $req_mdcusm[$i]['id'] == '') {
                Mdcusm::insert([
                    'kode' => $req_mdcusm[$i]['kode'],
                    'nama' => $req_mdcusm[$i]['nama'],
                    'id_grupcust' => $req_mdcusm[$i]['id_grupcust'],
                    'margin_p' => $req_mdcusm[$i]['margin_p'],
                    'margin_rp' => $req_mdcusm[$i]['margin_rp'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mdcusm::where('id', '=', $req_mdcusm[$i]['id'])
                    ->update([
                        'kode' => $req_mdcusm[$i]['kode'],
                        'nama' => $req_mdcusm[$i]['nama'],
                        'id_grupcust' => $req_mdcusm[$i]['id_grupcust'],
                        'margin_p' => $req_mdcusm[$i]['margin_p'],
                        'margin_rp' => $req_mdcusm[$i]['margin_rp'],
                        'is_aktif' => $req_mdcusm[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mdcust(Request $request)
    {
        $req_mdcust = $request['mdcust'];
        $req_mdcusp = $request['mdcusp'];

        $id_customer = $req_mdcust['id'];

        if (!$id_customer || $id_customer == '') {
            $id_customer = $this->get_id('id_customer');
            $kode = $this->get_kode('mdcust', $req_mdcust['kode']);

            Mdcust::insert([
                "id" => $id_customer,
                "kode" => $kode,
                "nama" => $req_mdcust["nama"],
                "foto" => $req_mdcust["foto"],
                "alamat" => $req_mdcust["alamat"],
                "provinsi" => $req_mdcust["provinsi"],
                "id_kota" => $req_mdcust["id_kota"],
                "kecamatan" => $req_mdcust["kecamatan"],
                "kelurahan" => $req_mdcust["kelurahan"],
                "kodepos" => $req_mdcust["kodepos"],
                "tlp_1" => $req_mdcust["tlp_1"],
                "tlp_2" => $req_mdcust["tlp_2"],
                "email" => $req_mdcust["email"],
                "lng" => $req_mdcust["lng"],
                "lat" => $req_mdcust["lat"],
                "cara_bayar" => $req_mdcust["cara_bayar"],
                "plafon" => $req_mdcust["plafon"],
                "is_plafon" => $req_mdcust["is_plafon"],
                "hari_bayar" => $req_mdcust["hari_bayar"],
                "id_merk" => $req_mdcust["id_merk"],
                "id_grupcust" => $req_mdcust["id_grupcust"],
                "id_jeniscust" => $req_mdcust["id_jeniscust"],
                "jenis_transaksi" => $req_mdcust["jenis_transaksi"],
                "site_transaksi" => $req_mdcust["site_transaksi"],
                "nik_1" => $req_mdcust["nik_1"],
                "nik_2" => $req_mdcust["nik_2"],
                "nik_3" => $req_mdcust["nik_3"],
                "nik_4" => $req_mdcust["nik_4"],
                "nik_5" => $req_mdcust["nik_5"],
                "is_aktif" => $req_mdcust["is_aktif"],
                "user_update" => $request->user()->email
            ]);
        } else {
            Mdcust::where("id", "=", $id_customer)
                ->update([
                    "nama" => $req_mdcust["nama"],
                    "foto" => $req_mdcust["foto"],
                    "alamat" => $req_mdcust["alamat"],
                    "provinsi" => $req_mdcust["provinsi"],
                    "id_kota" => $req_mdcust["id_kota"],
                    "kecamatan" => $req_mdcust["kecamatan"],
                    "kelurahan" => $req_mdcust["kelurahan"],
                    "kodepos" => $req_mdcust["kodepos"],
                    "tlp_1" => $req_mdcust["tlp_1"],
                    "tlp_2" => $req_mdcust["tlp_2"],
                    "email" => $req_mdcust["email"],
                    "lng" => $req_mdcust["lng"],
                    "lat" => $req_mdcust["lat"],
                    "cara_bayar" => $req_mdcust["cara_bayar"],
                    "plafon" => $req_mdcust["plafon"],
                    "is_plafon" => $req_mdcust["is_plafon"],
                    "hari_bayar" => $req_mdcust["hari_bayar"],
                    "id_merk" => $req_mdcust["id_merk"],
                    "id_grupcust" => $req_mdcust["id_grupcust"],
                    "id_jeniscust" => $req_mdcust["id_jeniscust"],
                    "jenis_transaksi" => $req_mdcust["jenis_transaksi"],
                    "site_transaksi" => $req_mdcust["site_transaksi"],
                    "nik_1" => $req_mdcust["nik_1"],
                    "nik_2" => $req_mdcust["nik_2"],
                    "nik_3" => $req_mdcust["nik_3"],
                    "nik_4" => $req_mdcust["nik_4"],
                    "nik_5" => $req_mdcust["nik_5"],
                    "is_aktif" => $req_mdcust["is_aktif"],
                    "user_update" => $request->user()->email
                ]);
        }

        //mdcusp
        for ($i = 0; $i < count($req_mdcusp); $i++) {
            if (!isset($req_mdcusp[$i]['id']) || $req_mdcusp[$i]['id'] == '') {
                Mdcusp::insert([
                    'id_customer' => $id_customer,
                    'id_merk' => $req_mdcusp[$i]['id_merk'],
                    'plafon' => $req_mdcusp[$i]['plafon']
                ]);
            } else {
                Mdcusp::where('id', '=', $req_mdcusp[$i]['id'])
                    ->update([
                        'id_customer' => $id_customer,
                        'id_merk' => $req_mdcusp[$i]['id_merk'],
                        'plafon' => $req_mdcusp[$i]['plafon']
                    ]);
            }
        }
    }

    function put_mdgudg(Request $request)
    {
        $req_mdgudg = $request['mdgudg'];
        $req_mdgudk = $request['mdgudk'];

        $id_gudang = $req_mdgudg['id'];

        if (!$req_mdgudg['id'] || $req_mdgudg['id'] == '') {
            $id_gudang = $this->get_id('id_gudang');
            $kode = $this->get_kode('mdgudg', $req_mdgudg['kode']);

            MdGudg::insert([
                'id' => $id_gudang,
                'kode' => $kode,
                'nama' => $req_mdgudg['nama'],
                'alamat' => $req_mdgudg['alamat'],
                'provinsi' => $req_mdgudg['provinsi'],
                'id_kota' => $req_mdgudg['id_kota'],
                'kecamatan' => $req_mdgudg['kecamatan'],
                'kelurahan' => $req_mdgudg['kelurahan'],
                'kodepos' => $req_mdgudg['kodepos'],
                'lng' => $req_mdgudg['lng'],
                'lat' => $req_mdgudg['lat'],
                'tlp_1' => $req_mdgudg['tlp_1'],
                'tlp_2' => $req_mdgudg['tlp_2'],
                'nik_1' => $req_mdgudg['nik_1'],
                'nik_2' => $req_mdgudg['nik_2'],
                'nik_3' => $req_mdgudg['nik_3'],
                'nik_4' => $req_mdgudg['nik_4'],
                'nik_5' => $req_mdgudg['nik_5'],
                'id_merk' => $req_mdgudg['id_merk'],
                'id_customer' => $req_mdgudg['id_customer'],
                'id_tipegudang' => $req_mdgudg['id_tipegudang'],
                'jenis_gudang' => $req_mdgudg['jenis_gudang'],
                'flag_alamat' => $req_mdgudg['flag_alamat'],
                'kapasitas' => $req_mdgudg['kapasitas'],
                'flag_kapasitas' => $req_mdgudg['flag_kapasitas'],
                'is_aktif' => $req_mdgudg['is_aktif'],
                'user_update' => $request->user()->email,
            ]);
        } else {
            MdGudg::where('id', '=', $id_gudang)
                ->update([
                    'nama' => $req_mdgudg['nama'],
                    'alamat' => $req_mdgudg['alamat'],
                    'provinsi' => $req_mdgudg['provinsi'],
                    'id_kota' => $req_mdgudg['id_kota'],
                    'kecamatan' => $req_mdgudg['kecamatan'],
                    'kelurahan' => $req_mdgudg['kelurahan'],
                    'kodepos' => $req_mdgudg['kodepos'],
                    'lng' => $req_mdgudg['lng'],
                    'lat' => $req_mdgudg['lat'],
                    'tlp_1' => $req_mdgudg['tlp_1'],
                    'tlp_2' => $req_mdgudg['tlp_2'],
                    'nik_1' => $req_mdgudg['nik_1'],
                    'nik_2' => $req_mdgudg['nik_2'],
                    'nik_3' => $req_mdgudg['nik_3'],
                    'nik_4' => $req_mdgudg['nik_4'],
                    'nik_5' => $req_mdgudg['nik_5'],
                    'id_merk' => $req_mdgudg['id_merk'],
                    'id_customer' => $req_mdgudg['id_customer'],
                    'id_tipegudang' => $req_mdgudg['id_tipegudang'],
                    'jenis_gudang' => $req_mdgudg['jenis_gudang'],
                    'flag_alamat' => $req_mdgudg['flag_alamat'],
                    'kapasitas' => $req_mdgudg['kapasitas'],
                    'flag_kapasitas' => $req_mdgudg['flag_kapasitas'],
                    'is_aktif' => $req_mdgudg['is_aktif'],
                    'user_update' => $request->user()->email,
                ]);
        }

        //mdgudk
        for ($i = 0; $i < count($req_mdgudk); $i++) {
            if (!isset($req_mdgudk[$i]['id']) || $req_mdgudk[$i]['id'] == '') {
                Mdgudk::insert([
                    'id_gudang' => $id_gudang,
                    'id_merk' => $req_mdgudk[$i]['id_merk'],
                    'kapasitas' => $req_mdgudk[$i]['kapasitas']
                ]);
            } else {
                Mdgudk::where('id', '=', $req_mdgudk[$i]['id'])
                    ->update([
                        'id_gudang' => $id_gudang,
                        'id_merk' => $req_mdgudk[$i]['id_merk'],
                        'kapasitas' => $req_mdgudk[$i]['kapasitas']
                    ]);
            }
        }
    }

    function put_mdgudl(Request $request)
    {
        $req_mdgudl = $request['mdgudl'];

        for ($i = 0; $i < count($req_mdgudl); $i++) {
            if (!isset($req_mdgudl[$i]['id']) || $req_mdgudl[$i]['id'] == '') {
                Mdgudl::insert([
                    'kode' => $req_mdgudl[$i]['kode'],
                    'id_gudang' => $req_mdgudl[$i]['id_gudang'],
                    'id_rak' => $req_mdgudl[$i]['id_rak'],
                    'kapasitas' => $req_mdgudl[$i]['kapasitas'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mdgudl::where('id', '=', $req_mdgudl[$i]['id'])
                    ->update([
                        'kode' => $req_mdgudl[$i]['kode'],
                        'id_gudang' => $req_mdgudl[$i]['id_gudang'],
                        'id_rak' => $req_mdgudl[$i]['id_rak'],
                        'kapasitas' => $req_mdgudl[$i]['kapasitas'],
                        'is_aktif' => $req_mdgudl[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mdgudt(Request $request)
    {
        $req_mdgudt = $request['mdgudt'];

        for ($i = 0; $i < count($req_mdgudt); $i++) {
            if (!isset($req_mdgudt[$i]['id']) || $req_mdgudt[$i]['id'] == '') {
                Mdgudt::insert([
                    'kode' => $req_mdgudt[$i]['kode'],
                    'nama' => $req_mdgudt[$i]['nama'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mdgudt::where('id', '=', $req_mdgudt[$i]['id'])
                    ->update([
                        'kode' => $req_mdgudt[$i]['kode'],
                        'nama' => $req_mdgudt[$i]['nama'],
                        'is_aktif' => $req_mdgudt[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mdsupj(Request $request)
    {
        $req_mdsupj = $request['mdsupj'];

        for ($i = 0; $i < count($req_mdsupj); $i++) {
            if (!isset($req_mdsupj[$i]['id']) || $req_mdsupj[$i]['id'] == '') {
                Mdsupj::insert([
                    'kode' => $req_mdsupj[$i]['kode'],
                    'nama' => $req_mdsupj[$i]['nama'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mdsupj::where('id', '=', $req_mdsupj[$i]['id'])
                    ->update([
                        'kode' => $req_mdsupj[$i]['kode'],
                        'nama' => $req_mdsupj[$i]['nama'],
                        'is_aktif' => $req_mdsupj[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mdsupl(Request $request)
    {
        $req_mdsupl = $request['mdsupl'];

        if (!$req_mdsupl['id'] || $req_mdsupl['id'] == '') {
            $kode = $this->get_kode('mdsupl', $req_mdsupl['kode']);

            Mdsupl::insert([
                "kode" => $kode,
                "nama" => $req_mdsupl['nama'],
                "foto" => $req_mdsupl['foto'],
                "alamat" => $req_mdsupl['alamat'],
                "provinsi" => $req_mdsupl['provinsi'],
                "id_kota" => $req_mdsupl['id_kota'],
                "kecamatan" => $req_mdsupl['kecamatan'],
                "kelurahan" => $req_mdsupl['kelurahan'],
                "kodepos" => $req_mdsupl['kodepos'],
                "npwp" => $req_mdsupl['npwp'],
                "tlp_1" => $req_mdsupl['tlp_1'],
                "tlp_2" => $req_mdsupl['tlp_2'],
                "lng" => $req_mdsupl['lng'],
                "lat" => $req_mdsupl['lat'],
                "email" => $req_mdsupl['email'],
                "cara_bayar" => $req_mdsupl['cara_bayar'],
                "hari_bayar" => $req_mdsupl['hari_bayar'],
                'id_merk' => $req_mdsupl['id_merk'],
                "id_jenissupl" => $req_mdsupl['id_jenissupl'],
                "is_aktif" => $req_mdsupl['is_aktif'],
                "user_update" => $request->user()->email,
            ]);
        } else {
            Mdsupl::where('id', '=', $req_mdsupl['id'])
                ->update([
                    "nama" => $req_mdsupl['nama'],
                    "foto" => $req_mdsupl['foto'],
                    "alamat" => $req_mdsupl['alamat'],
                    "provinsi" => $req_mdsupl['provinsi'],
                    "id_kota" => $req_mdsupl['id_kota'],
                    "kecamatan" => $req_mdsupl['kecamatan'],
                    "kelurahan" => $req_mdsupl['kelurahan'],
                    "kodepos" => $req_mdsupl['kodepos'],
                    "npwp" => $req_mdsupl['npwp'],
                    "tlp_1" => $req_mdsupl['tlp_1'],
                    "tlp_2" => $req_mdsupl['tlp_2'],
                    "lng" => $req_mdsupl['lng'],
                    "lat" => $req_mdsupl['lat'],
                    "email" => $req_mdsupl['email'],
                    "cara_bayar" => $req_mdsupl['cara_bayar'],
                    "hari_bayar" => $req_mdsupl['hari_bayar'],
                    'id_merk' => $req_mdsupl['id_merk'],
                    "id_jenissupl" => $req_mdsupl['id_jenissupl'],
                    "is_aktif" => $req_mdsupl['is_aktif'],
                    "user_update" => $request->User()->email,
                ]);
        }
    }
}

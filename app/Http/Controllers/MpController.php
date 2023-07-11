<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\mp\Mpbahg;
use App\Models\mp\Mpbahj;
use App\Models\mp\Mpbahn;

use App\Models\mp\Mpcatg;
use App\Models\mp\Mpcatn;
use App\Models\mp\Mpcats;
use App\Models\mp\Mpcolc;

use App\Models\mp\Mpdisc;

use App\Models\mp\Mpprod;
use App\Models\mp\Mppros;
use App\Models\mp\Mpprov;

use App\Models\mp\Mpregl;

use App\Models\mp\Mpvarj;
use App\Models\mp\Mpvars;

class MpController extends Controller
{
    function delete(Request $request){
        $path = explode('/', $request->path());
        $model = app('App\Models\mp\\' .ucfirst($path[1]) );

        DB::beginTransaction();

        try{
            $model::where('id', '=', $request['id'])
                ->update([
                    'is_aktif' => 0,
                    'user_update' => $request->user()->email
                ]);
            DB::commit();

            return response()->json(array('status' => 200));

        }catch(\Exception $e){
            DB::rollback();

            return response()->json(array('status' => 501, 'message' => $e->getMessage() .' at ' .$e->getFile() . ' line: ' .$e->getLine() ));

        }catch(\Throwable $e){
            DB::rollback();

            return response()->json(array('status' => 502, 'message' => $e->getMessage() .' at ' .$e->getFile() . ' line: ' .$e->getLine()));

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

            return response()->json(array('status' => 501, 'message' => $e->getMessage() .' at ' .$e->getFile() . ' line: ' .$e->getLine() ));

        } catch (\Throwable $e) {
            DB::rollback();

            return response()->json(array('status' => 502, 'message' => $e->getMessage() .' at ' .$e->getFile() . ' line: ' .$e->getLine()));
        }
    }

    function get_kode($tableName, $kode){
        $res = DB::table($tableName)
            ->selectRaw('sum(1) max')
            ->where('kode', 'LIKE', $kode .'%')
            ->get();

        $last = $res[0]->max + 1;
        $new_kode = $kode .substr('000' .$last, -3);

        return $new_kode;
    }

    function get_mpbahg(Request $request)
    {
        $res = DB::table('mpbahg')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata")
            ->where('is_aktif', '=', $request['is_aktif'])
            ->orderBy('kode', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mpbahg' => $res));
    }

    function get_mpbahj(Request $request)
    {
        $res = DB::table('mpbahj')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata")
            ->where('is_aktif', '=', $request['is_aktif'])
            ->orderBy('kode', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mpbahj' => $res));
    }

    function get_mpbahn(Request $request)
    {
        $res = DB::table('mpbahn')
            ->leftJoin('mpbahg', 'mpbahn.id_golbahan', '=', 'mpbahg.id')
            ->leftJoin('mpbahj', 'mpbahn.id_jenisbahan', '=', 'mpbahj.id')
            ->leftJoin('mrsatn', 'mpbahn.id_satuan', '=', 'mrsatn.id')
            ->selectRaw("mpbahn.*, to_char(mpbahn.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata, mpbahg.nama as nama_golbahan, mpbahj.nama as nama_jenisbahan, mrsatn.nama nama_satuan")
            ->where('mpbahn.is_aktif', '=', $request['is_aktif'])
            ->orderBy('mpbahn.kode', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mpbahn' => $res));
    }

    function get_mpcatg(Request $request)
    {
        $res = DB::table('mpcatg')
            ->leftJoin('mpcatn', 'mpcatg.id_golproduk', '=', 'mpcatn.id')
            ->selectRaw("mpcatg.*, to_char(mpcatg.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata, mpcatn.nama as nama_golproduk")
            ->where('mpcatg.is_aktif', '=', $request['is_aktif'])
            ->orderBy('mpcatg.kode', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mpcatg' => $res));
    }

    function get_mpcatn(Request $request)
    {
        $res = DB::table('mpcatn')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata")
            ->where('is_aktif', '=', $request['is_aktif'])
            ->orderBy('kode', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mpcatn' => $res));
    }

    function get_mpcats(Request $request)
    {
        $id_kategori = '%';
        if($request['id_kategori']){
            $id_kategori = $request['id_kategori'];
        }

        $res = DB::table('mpcats')
            ->leftJoin('mpcatg', 'mpcatg.id', '=', 'mpcats.id_kategori')
            ->selectRaw("mpcats.*, to_char(mpcatg.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata, mpcatg.nama as nama_kategori")
            ->where('mpcats.is_aktif', '=', $request['is_aktif'])
            ->whereRaw("coalesce(cast(mpcats.id_kategori as text), '') LIKE '".$id_kategori."' ")
            ->orderBy('mpcats.kode', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mpcats' => $res));
    }

    function get_mpcolc(Request $request)
    {
        $res = DB::table('mpcolc')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata")
            ->where('is_aktif', '=', $request['is_aktif'])
            ->orderBy('kode', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mpcolc' => $res));
    }

    function get_mpdisc(Request $request)
    {
        $select = "
            mpdisc.*, 
            to_char(mpdisc.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata, 
            mdgudt.nama as nama_tipecounter,
            case mpdisc.jenis_disc 
                when 'P0' then 'Persen' when 'P1' then 'Persen Bertingkat'
                when 'N0' then 'Nominal' when 'N1' then 'Nominal Bertingkat'
            end nama_jenisdisc
        ";

        $res = DB::table('mpdisc')
            ->leftJoin('mdgudt', 'mdgudt.id', '=', 'mpdisc.id_tipecounter')
            ->selectRaw($select)
            ->where('mpdisc.is_aktif', '=', $request['is_aktif'])
            ->orderBy('mpdisc.kode', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mpdisc' => $res));
    }

    function get_mpprod(Request $request)
    {
        $select = "
            mpprod. *,
            mpcats.id_kategori as id_kategori,
            to_char(mpprod.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata, 
            mrmerk.nama as nama_merk,
            mpcatn.nama as nama_golproduk,
            mpcatg.nama as nama_kategori,
            mpcats.nama as nama_subkategori,
            mpbahn.nama as nama_bahan,
            mpcolc.nama as nama_koleksi
        ";

        if ($request['id']) {
            $res = DB::table('mpprod')
                ->leftJoin('mrmerk', 'mpprod.id_merk', '=', 'mrmerk.id')
                ->leftJoin('mpcats', 'mpprod.id_subkategori', '=', 'mpcats.id')
                ->leftJoin('mpcatg', 'mpcats.id_kategori', '=', 'mpcatg.id')
                ->leftJoin('mpcatn', 'mpcatg.id_golproduk', '=', 'mpcatn.id')
                ->leftJoin('mpbahn', 'mpprod.id_bahan', '=', 'mpbahn.id')
                ->leftJoin('mpcolc', 'mpprod.id_koleksi', '=', 'mpcolc.id')
                ->selectRaw($select)
                ->where('mpprod.id', '=', $request['id'])
                ->orderBy('mpprod.kode', 'asc')
                ->get();

            $select_var = "
                mpprov.*, 
                mpvars.nama as nama_varian, 
                mpvars.kode as kode_varian, 
                mpvarj.nama as nama_jenisvarian, 
                mpvarj.id as id_jenisvarian         
            ";

            $res_var = DB::table('mpprov')
                ->leftJoin('mpvars', 'mpprov.id_varian', '=', 'mpvars.id')
                ->leftJoin('mpvarj', 'mpvars.id_jenisvarian', '=', 'mpvarj.id')
                ->selectRaw($select_var)
                ->where('mpprov.id_produk', '=', $request['id'])
                ->orderBy('mpprov.level', 'asc')
                ->orderBy('mpvars.kode', 'asc')
                ->get();

            $select_sku = "
                mppros.*, 
                a.nama nama_varian_1, 
                b.nama nama_varian_2, 
                a.kode kode_varian_1, 
                b.kode kode_varian_2 
            ";

            $res_sku = DB::table('mppros')
                ->leftJoin('mpvars as a', 'mppros.id_varian_1', '=', 'a.id')
                ->leftJoin('mpvars as b', 'mppros.id_varian_2', '=', 'b.id')
                ->selectRaw($select_sku)
                ->where('mppros.id_produk', '=', $request['id'])
                ->orderBy('a.kode', 'asc')
                ->orderBy('b.kode', 'asc')
                ->get();

            return response()->json(array('status' => 200, 'mpprod' => $res, 'mpprov' => $res_var, 'mppros' => $res_sku));
        } else {
            $res = DB::table('mpprod')
                ->leftJoin('mrmerk', 'mpprod.id_merk', '=', 'mrmerk.id')
                ->leftJoin('mpcats', 'mpprod.id_subkategori', '=', 'mpcats.id')
                ->leftJoin('mpcatg', 'mpcats.id_kategori', '=', 'mpcatg.id')
                ->leftJoin('mpcatn', 'mpcatg.id_golproduk', '=', 'mpcatn.id')
                ->leftJoin('mpbahn', 'mpprod.id_bahan', '=', 'mpbahn.id')
                ->leftJoin('mpcolc', 'mpprod.id_koleksi', '=', 'mpcolc.id')
                ->selectRaw($select)
                ->where('mpprod.is_aktif', '=', $request['is_aktif'])
                ->orderBy('mpprod.kode', 'asc')
                ->get();

            return response()->json(array('status' => 200, 'mpprod' => $res));
        }
    }

    function get_mpprod_varian(Request $request)
    {
        $res = DB::table('v_mpprod_varian_1')
            ->where('id_merk', '=', $request['id_merk'])
            ->orderBy('kode_produk', 'asc')
            ->orderBy('kode_varian_1', 'asc')
            ->get();

        //get varian 2
        for($i=0; $i<count($res); $i++){
            $res_varian2 = DB::table('v_mpprod_varian_2')
                ->where('id_produk', '=', $res[$i]->id_produk)
                ->where('id_varian_1', '=', $res[$i]->id_varian_1)
                ->get();
            $res[$i]->varian_2 = $res_varian2;
        }

        return response()->json(array('status' => 200, 'mpprod_varian' => $res));
    }

    function get_mpregl(Request $request)
    {
        $res = DB::table('mpregl')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata")
            ->where('is_aktif', '=', $request['is_aktif'])
            ->orderBy('kode', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mpregl' => $res));
    }

    function get_mpvarj(Request $request)
    {
        $res = DB::table('mpvarj')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata")
            ->where('is_aktif', '=', $request['is_aktif'])
            ->orderBy('kode', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mpvarj' => $res));
    }

    function get_mpvars(Request $request)
    {
        $id_jenisvarian = '%';
        if ($request['id_jenisvarian']) {
            $id_jenisvarian = $request['id_jenisvarian'];
        }

        $res = DB::table('mpvars')
            ->leftJoin('mpvarj', 'mpvars.id_jenisvarian', '=', 'mpvarj.id')
            ->selectRaw("mpvars.*, to_char(mpvars.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata, mpvarj.nama as nama_jenisvarian")
            ->where('mpvars.is_aktif', '=', $request['is_aktif'])
            ->whereRaw("coalesce(cast(mpvars.id_jenisvarian as text), '') LIKE '" . $id_jenisvarian . "'")
            ->orderBy('mpvars.kode', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mpvars' => $res));
    }

    function put_mpbahg(Request $request)
    {
        $req_mpbahg = $request['mpbahg'];

        for ($i = 0; $i < count($req_mpbahg); $i++) {
            if (!isset($req_mpbahg[$i]['id']) || $req_mpbahg[$i]['id'] == '') {
                Mpbahg::insert([
                    'kode' => $req_mpbahg[$i]['kode'],
                    'nama' => $req_mpbahg[$i]['nama'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mpbahg::where('id', '=', $req_mpbahg[$i]['id'])
                    ->update([
                        'kode' => $req_mpbahg[$i]['kode'],
                        'nama' => $req_mpbahg[$i]['nama'],
                        'is_aktif' => $req_mpbahg[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mpbahj(Request $request)
    {
        $req_mpbahj = $request['mpbahj'];

        for ($i = 0; $i < count($req_mpbahj); $i++) {
            if (!isset($req_mpbahj[$i]['id']) || $req_mpbahj[$i]['id'] == '') {
                mpbahj::insert([
                    'kode' => $req_mpbahj[$i]['kode'],
                    'nama' => $req_mpbahj[$i]['nama'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                mpbahj::where('id', '=', $req_mpbahj[$i]['id'])
                    ->update([
                        'kode' => $req_mpbahj[$i]['kode'],
                        'nama' => $req_mpbahj[$i]['nama'],
                        'is_aktif' => $req_mpbahj[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mpbahn(Request $request)
    {
        $req_mpbahn = $request['mpbahn'];

        for ($i = 0; $i < count($req_mpbahn); $i++) {
            if (!isset($req_mpbahn[$i]['id']) || $req_mpbahn[$i]['id'] == '') {
                Mpbahn::insert([
                    'kode' => $req_mpbahn[$i]['kode'],
                    'nama' => $req_mpbahn[$i]['nama'],
                    'id_golbahan' => $req_mpbahn[$i]['id_golbahan'],
                    'id_jenisbahan' => $req_mpbahn[$i]['id_jenisbahan'],
                    'id_satuan' => $req_mpbahn[$i]['id_satuan'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mpbahn::where('id', '=', $req_mpbahn[$i]['id'])
                    ->update([
                        'kode' => $req_mpbahn[$i]['kode'],
                        'nama' => $req_mpbahn[$i]['nama'],
                        'id_golbahan' => $req_mpbahn[$i]['id_golbahan'],
                        'id_jenisbahan' => $req_mpbahn[$i]['id_jenisbahan'],
                        'id_satuan' => $req_mpbahn[$i]['id_satuan'],
                        'is_aktif' => $req_mpbahn[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mpcatg(Request $request)
    {
        $req_mpcatg = $request['mpcatg'];

        for ($i = 0; $i < count($req_mpcatg); $i++) {
            if (!isset($req_mpcatg[$i]['id']) || $req_mpcatg[$i]['id'] == '') {
                Mpcatg::insert([
                    'kode' => $req_mpcatg[$i]['kode'],
                    'nama' => $req_mpcatg[$i]['nama'],
                    'id_golproduk' => $req_mpcatg[$i]['id_golproduk'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mpcatg::where('id', '=', $req_mpcatg[$i]['id'])
                    ->update([
                        'kode' => $req_mpcatg[$i]['kode'],
                        'nama' => $req_mpcatg[$i]['nama'],
                        'id_golproduk' => $req_mpcatg[$i]['id_golproduk'],
                        'is_aktif' => $req_mpcatg[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mpcatn(Request $request)
    {
        $req_mpcatn = $request['mpcatn'];

        for ($i = 0; $i < count($req_mpcatn); $i++) {
            if (!isset($req_mpcatn[$i]['id']) || $req_mpcatn[$i]['id'] == '') {
                Mpcatn::insert([
                    'kode' => $req_mpcatn[$i]['kode'],
                    'nama' => $req_mpcatn[$i]['nama'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mpcatn::where('id', '=', $req_mpcatn[$i]['id'])
                    ->update([
                        'kode' => $req_mpcatn[$i]['kode'],
                        'nama' => $req_mpcatn[$i]['nama'],
                        'is_aktif' => $req_mpcatn[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mpcats(Request $request)
    {
        $req_mpcats = $request['mpcats'];

        for ($i = 0; $i < count($req_mpcats); $i++) {
            if (!isset($req_mpcats[$i]['id']) || $req_mpcats[$i]['id'] == '') {
                Mpcats::insert([
                    'kode' => $req_mpcats[$i]['kode'],
                    'nama' => $req_mpcats[$i]['nama'],
                    'id_kategori' => $req_mpcats[$i]['id_kategori'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mpcats::where('id', '=', $req_mpcats[$i]['id'])
                    ->update([
                        'kode' => $req_mpcats[$i]['kode'],
                        'nama' => $req_mpcats[$i]['nama'],
                        'id_kategori' => $req_mpcats[$i]['id_kategori'],
                        'is_aktif' => $req_mpcats[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mpcolc(Request $request)
    {
        $req_mpcolc = $request['mpcolc'];

        for ($i = 0; $i < count($req_mpcolc); $i++) {
            if (!isset($req_mpcolc[$i]['id']) || $req_mpcolc[$i]['id'] == '') {
                Mpcolc::insert([
                    'kode' => $req_mpcolc[$i]['kode'],
                    'nama' => $req_mpcolc[$i]['nama'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mpcolc::where('id', '=', $req_mpcolc[$i]['id'])
                    ->update([
                        'kode' => $req_mpcolc[$i]['kode'],
                        'nama' => $req_mpcolc[$i]['nama'],
                        'is_aktif' => $req_mpcolc[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mpdisc(Request $request)
    {
        $req_mpdisc = $request['mpdisc'];

        for ($i = 0; $i < count($req_mpdisc); $i++) {
            if (!isset($req_mpdisc[$i]['id']) || $req_mpdisc[$i]['id'] == '') {
                Mpdisc::insert([
                    'kode' => $req_mpdisc[$i]['kode'],
                    'nama' => $req_mpdisc[$i]['nama'],
                    'id_tipecounter' => $req_mpdisc[$i]['id_tipecounter'],
                    'jenis_disc' => $req_mpdisc[$i]['jenis_disc'],
                    'disc_1' => $req_mpdisc[$i]['disc_1'],
                    'disc_2' => $req_mpdisc[$i]['disc_2'],
                    'disc_3' => $req_mpdisc[$i]['disc_3'],
                    'disc_4' => $req_mpdisc[$i]['disc_4'],
                    'disc_5' => $req_mpdisc[$i]['disc_5'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mpdisc::where('id', '=', $req_mpdisc[$i]['id'])
                    ->update([
                        'kode' => $req_mpdisc[$i]['kode'],
                        'nama' => $req_mpdisc[$i]['nama'],
                        'id_tipecounter' => $req_mpdisc[$i]['id_tipecounter'],
                        'jenis_disc' => $req_mpdisc[$i]['jenis_disc'],
                        'disc_1' => $req_mpdisc[$i]['disc_1'],
                        'disc_2' => $req_mpdisc[$i]['disc_2'],
                        'disc_3' => $req_mpdisc[$i]['disc_3'],
                        'disc_4' => $req_mpdisc[$i]['disc_4'],
                        'disc_5' => $req_mpdisc[$i]['disc_5'],
                        'is_aktif' => $req_mpdisc[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mpprod(Request $request)
    {
        $req_mpprod = $request['mpprod'];
        $req_mpprov = $request['mpprov'];
        $req_mppros = $request['mppros'];

        $id_produk = $req_mpprod['id'];
        $kode_produk = $req_mpprod['kode'];

        if (!$id_produk || $id_produk == '') {  //insert
            //get id
            $id_produk = Mpprod::getId();

            //get kode
            $kode_produk = $this->get_kode('mpprod', $req_mpprod['kode']);

            Mpprod::insert([
                'id' => $id_produk,
                'kode' => $kode_produk,
                'nama' => $req_mpprod['nama'],
                'deskripsi' => $req_mpprod['deskripsi'],
                'gambar' => $req_mpprod['gambar'],
                'id_merk' => $req_mpprod['id_merk'],
                'id_subkategori' => $req_mpprod['id_subkategori'],
                'id_koleksi' => $req_mpprod['id_koleksi'],
                'id_bahan' => $req_mpprod['id_bahan'],
                'tgl_produksi' => $req_mpprod['tgl_produksi'],
                'tgl_beli' => $req_mpprod['tgl_beli'],
                'hrg_beli' => $req_mpprod['hrg_beli'],
                'hrg_inv' => $req_mpprod['hrg_inv'],
                'is_aktif' => $req_mpprod['is_aktif'],
                'user_update' => $request->user()->email
            ]);
        } else {
            Mpprod::where('id', '=', $id_produk)
                ->update([
                    'nama' => $req_mpprod['nama'],
                    'deskripsi' => $req_mpprod['deskripsi'],
                    'gambar' => $req_mpprod['gambar'],
                    'id_merk' => $req_mpprod['id_merk'],
                    'id_subkategori' => $req_mpprod['id_subkategori'],
                    'id_koleksi' => $req_mpprod['id_koleksi'],
                    'id_bahan' => $req_mpprod['id_bahan'],
                    'tgl_produksi' => $req_mpprod['tgl_produksi'],
                    'tgl_beli' => $req_mpprod['tgl_beli'],
                    'hrg_beli' => $req_mpprod['hrg_beli'],
                    'hrg_inv' => $req_mpprod['hrg_inv'],
                    'is_aktif' => $req_mpprod['is_aktif'],
                    'user_update' => $request->user()->email
                ]);
        }

        //update mpprov to not active
        Mpprov::where('id_produk', '=', $id_produk)
            ->update(['is_aktif' => 0]);


        //upsert mpprov
        for($i=0; $i<count($req_mpprov); $i++){
            Mpprov::upsert(
                [
                'id_produk' => $id_produk,
                'id_varian' => $req_mpprov[$i]['id_varian'],
                'level' => $req_mpprov[$i]['level'],
                'is_aktif' => 1,
                ],
                ['level', $req_mpprov[$i]['level'],
                ['is_aktif', 1]
                ]
            );
        }

        //update mppros to not active
        Mppros::where('id_produk', '=', $id_produk)
            ->update(['is_aktif' => 0]);

        //upsert mppros
        for($i=0; $i<count($req_mppros); $i++){
            Mppros::upsert(
                [
                    'id_produk' => $id_produk,
                    'kode' => $kode_produk .$req_mppros[$i]['id_varian_1'] .$req_mppros[$i]['id_varian_2'],
                    'id_varian_1' => $req_mppros[$i]['id_varian_1'],
                    'id_varian_2' => $req_mppros[$i]['id_varian_2'],
                    'berat' => $req_mppros[$i]['berat'],
                    'panjang' => $req_mppros[$i]['panjang'],
                    'lebar' => $req_mppros[$i]['lebar'],
                    'tinggi' => $req_mppros[$i]['tinggi'],
                    'hrg_jual' => $req_mppros[$i]['hrg_jual'],
                    'hrg_beli' => $req_mppros[$i]['hrg_beli'],
                    'is_aktif' => 1
                ],
                ['kode'],
                ['berat', 'panjang', 'lebar', 'tinggi', 'hrg_jual', 'hrg_beli', 'hrg_inv', 'is_aktif']
            );
        }
    }

    function put_mpregl(Request $request)
    {
        $req_mpregl = $request['mpregl'];

        for ($i = 0; $i < count($req_mpregl); $i++) {
            if (!isset($req_mpregl[$i]['id']) || $req_mpregl[$i]['id'] == '') {
                Mpregl::insert([
                    'kode' => $req_mpregl[$i]['kode'],
                    'nama' => $req_mpregl[$i]['nama'],
                    'umur' => $req_mpregl[$i]['umur'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mpregl::where('id', '=', $req_mpregl[$i]['id'])
                    ->update([
                        'kode' => $req_mpregl[$i]['kode'],
                        'nama' => $req_mpregl[$i]['nama'],
                        'umur' => $req_mpregl[$i]['umur'],
                        'is_aktif' => $req_mpregl[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mpvarj(Request $request)
    {
        $req_mpvarj = $request['mpvarj'];

        for ($i = 0; $i < count($req_mpvarj); $i++) {
            if (!isset($req_mpvarj[$i]['id']) || $req_mpvarj[$i]['id'] == '') {
                Mpvarj::insert([
                    'kode' => $req_mpvarj[$i]['kode'],
                    'nama' => $req_mpvarj[$i]['nama'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mpvarj::where('id', '=', $req_mpvarj[$i]['id'])
                    ->update([
                        'kode' => $req_mpvarj[$i]['kode'],
                        'nama' => $req_mpvarj[$i]['nama'],
                        'is_aktif' => $req_mpvarj[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_mpvars(Request $request)
    {
        $req_mpvars = $request['mpvars'];

        for ($i = 0; $i < count($req_mpvars); $i++) {
            if (!isset($req_mpvars[$i]['id']) || $req_mpvars[$i]['id'] == '') {
                Mpvars::insert([
                    'kode' => $req_mpvars[$i]['kode'],
                    'nama' => $req_mpvars[$i]['nama'],
                    'id_jenisvarian' => $req_mpvars[$i]['id_jenisvarian'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Mpvars::where('id', '=', $req_mpvars[$i]['id'])
                    ->update([
                        'kode' => $req_mpvars[$i]['kode'],
                        'nama' => $req_mpvars[$i]['nama'],
                        'id_jenisvarian' => $req_mpvars[$i]['id_jenisvarian'],
                        'is_aktif' => $req_mpvars[$i]['is_aktif'],
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }
}

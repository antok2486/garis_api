<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\sy\Sygrup;
use App\Models\User;

class SyController extends Controller
{
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

    function get_syautg(Request $request)
    {
        $tipe_gudang = '%';
        if($request['id_tipegudang']){
            $tipe_gudang = $request['id_tipegudang'];
        }

        $jenis_gudang = '%';
        if($request['jenis_gudang']){
            $jenis_gudang = $request['jenis_gudang'];
        }

        $res = DB::table('syautg as a')
            ->leftJoin('mdgudg as b', 'a.id_gudang', '=', 'b.id' )
            ->select('b.*')
            ->where('b.id_tipegudang', 'LIKE', $tipe_gudang)
            ->where('b.jenis_gudang', 'LIKE', $jenis_gudang)
            ->where('a.id_grupuser', '=', $request->user()->id_grupuser)
            ->where('b.is_aktif', '=', 1)
            ->get();

        return response()->json(array('status' => 200, 'syautg' => $res));
    }

    function get_syautr(Request $request)
    {
        $res = DB::table('syautr as a')
            ->leftJoin('mrmerk as b', 'a.id_merk', '=', 'b.id' )
            ->select('b.*')
            ->where('a.id_grupuser', '=', $request->user()->id_grupuser)
            ->where('b.is_aktif', '=', 1)
            ->get();

        return response()->json(array('status' => 200, 'syautr' => $res));

    }

    function get_synumb(Request $request)
    {
        $res = null;

        switch ($request['col']) {
            case 'YYMMDD':
                $res = DB::table(DB::raw("to_char(current_date, 'YYMMDD') as rtn"))->get();
                break;
        }

        return response()->json(array('status' => 200, 'synumb' => $res[0]->rtn));
    }

    function get_sygrup(Request $request)
    {
        $select = "*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata";

        if ($request['id']) {
            $res = DB::table('sygrup')
                ->selectRaw($select)
                ->where('id', '=', $request['id'])
                ->orderBy('nama', 'asc')
                ->get();

            $res_auth = DB::table('v_syauth')
                ->where('id_grupuser', '=', $request['id'])
                ->orderBy('grup1', 'asc')
                ->orderBy('grup2', 'asc')
                ->orderBy('urut', 'asc')
                ->get();

            $res_autg = DB::table('syautg')
                ->leftJoin('mdgudg', 'syautg.id_gudang', '=', 'mdgudg.id')
                ->selectRaw('syautg.*, mdgudg.kode as kode_gudang, mdgudg.nama as nama_gudang')
                ->where('syautg.id_grupuser', '=', $request['id'])
                ->get();

            return response()->json(array('status' => 200, 'sygrup' => $res, 'syauth' => $res_auth, 'syautg' => $res_autg));
        } else {
            $res = DB::table('sygrup')
                ->selectRaw($select)
                ->where('is_aktif', '=', $request['is_aktif'])
                ->orderBy('nama', 'asc')
                ->get();

            return response()->json(array('status' => 200, 'sygrup' => $res));
        }
    }

    function get_syparm(Request $request)
    {
        $select = "
            syparm.*,
            mrkota.nama as nama_kota,
            mdsupj.nama as nama_jenissuplbrg,
            mdgudt.nama as nama_tipegudangpo
        ";

        $res = DB::table('syparm')
            ->leftJoin('mrkota', 'syparm.id_kota', '=', 'mrkota.id')
            ->leftJoin('mdsupj', 'syparm.id_jenissuplbrg', '=', 'mdsupj.id')
            ->leftJoin('mdgudt', 'syparm.id_tipegudangpo', '=', 'mdgudt.id')
            ->selectRaw($select)
            ->get();

        return response()->json(array('status' => 200, 'syparm' => $res));
    }

    function get_syuser(Request $request)
    {
        $select = "
            syuser.*, 
            to_char(syuser.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata, 
            sygrup.nama as nama_grupuser,
            case(syuser.is_aktif) when 1 then 'Aktif' when '2' then 'Menunggu' when 0 then 'Tidak Aktif' end as is_aktifa
        ";

        $is_aktif = [0];
        if ($request['is_aktif'] == 1) {
            $is_aktif = [1, 2];
        }

        $res = DB::table('syuser')
            ->leftJoin('sygrup', 'syuser.id_grupuser', '=', 'sygrup.id')
            ->selectRaw($select)
            ->whereIn('syuser.is_aktif', $is_aktif)
            ->orderBy('syuser.nama', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'syuser' => $res));
    }

    function put_sygrup(Request $request)
    {
        $req_sygrup = $request['sygrup'];

        for ($i = 0; $i < count($req_sygrup); $i++) {
            if (!isset($req_sygrup[$i]['id']) || $req_sygrup[$i]['id'] == '') {
                Sygrup::insert([
                    'nama' => $req_sygrup[$i]['nama'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                Sygrup::where('id', '=', $req_sygrup[$i]['id'])
                    ->update([
                        'nama' => $req_sygrup[$i]['nama'],
                        'is_aktif' => 1,
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }

    function put_syuser(Request $request)
    {
        $req_syuser = $request['syuser'];

        for ($i = 0; $i < count($req_syuser); $i++) {
            if (!isset($req_syuser[$i]['id']) || $req_syuser[$i]['id'] == '') {
                User::insert([
                    'nama' => $req_syuser[$i]['nama'],
                    'email' => $req_syuser[$i]['email'],
                    'tlp' => $req_syuser[$i]['tlp'],
                    'id_grupuser' => $req_syuser[$i]['id_grupuser'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);
            } else {
                User::where('id', '=', $req_syuser[$i]['id'])
                    ->update([
                        'nama' => $req_syuser[$i]['nama'],
                        'email' => $req_syuser[$i]['email'],
                        'tlp' => $req_syuser[$i]['tlp'],
                        'id_grupuser' => $req_syuser[$i]['id_grupuser'],
                        'is_aktif' => 1,
                        'user_update' => $request->user()->email,
                    ]);
            }
        }
    }
}

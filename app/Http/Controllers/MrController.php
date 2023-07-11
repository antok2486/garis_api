<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\mr\Mrattr;
use App\Models\mr\Mrmerk;
use App\Models\mr\Mrpack;
use App\Models\mr\Mrrack;
use App\Models\mr\Mrsatn;

class MrController extends Controller
{
    function delete(Request $request){
        $path = explode('/', $request->path());
        $model = app('App\Models\mr\\' .ucfirst($path[1]) );

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

    function get(Request $request){
        $path = explode('/', $request->path());
        $method_name = 'get_' .$path[1];

        return $this->$method_name($request);

    }

    function put(Request $request){
        $path = explode('/', $request->path());
        $method_name = 'put_' .$path[1];

        DB::beginTransaction();

        try{
            $this->$method_name($request);

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
    
    function get_mrattr(Request $request){
        $res = DB::table('mrattr')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata" )
            ->where('is_aktif', '=', $request['is_aktif'])
            ->orderBy('tag_grup', 'asc')
            ->get();
        
        return response()->json(array('status' => 200, 'mrattr' => $res));
    }

    function get_mrkota(Request $request){
        $provinsi = '%';
        if($request['provinsi']){
            $provinsi = $request['provinsi'];
        }

        $res = DB::table('mrkota')
            ->select('*')
            ->where('is_aktif', '=', $request['is_aktif'])
            ->where('provinsi', 'LIKE', $provinsi)
            ->distinct()
            ->orderBy('provinsi', 'asc')
            ->orderBy('kode', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mrkota' => $res));
    }

    function get_mrkotp(Request $request){
        $res = DB::table('mrkotp')
            ->leftJoin('mrkota', 'mrkotp.id_kota', '=', 'mrkota.id')
            ->select('mrkotp.*', 'mrkota.nama as nama_kota')
            ->where('mrkotp.is_aktif', '=', $request['is_aktif'])
            ->whereRaw("coalesce(cast(mrkotp.id_kota as text), '') LIKE '".$request['id_kota']."'")
            ->distinct()
            ->orderBy('mrkotp.kecamatan', 'asc')
            ->orderBy('mrkotp.kelurahan', 'asc')
            ->orderBy('mrkotp.kodepos', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mrkotp' => $res));
    }

    function get_mrmerk(Request $request){
        $res = DB::table('mrmerk')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata" )
            ->where('is_aktif', '=', $request['is_aktif'])
            ->orderBy('kode', 'asc')
            ->get();
        
        return response()->json(array('status' => 200, 'mrmerk' => $res));
    }

    function get_mrpack(Request $request){
        $res = DB::table('mrpack')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata" )
            ->where('is_aktif', '=', $request['is_aktif'])
            ->orderBy('kode', 'asc')
            ->get();
        
        return response()->json(array('status' => 200, 'mrpack' => $res));
    }

    function get_mrrack(Request $request){
        $res = DB::table('mrrack')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata" )
            ->where('is_aktif', '=', $request['is_aktif'])
            ->orderBy('kode', 'asc')
            ->get();
        
        return response()->json(array('status' => 200, 'mrrack' => $res));
    }

    function get_mrsatn(Request $request){
        $res = DB::table('mrsatn')
            ->selectRaw("*, to_char(updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata" )
            ->where('is_aktif', '=', $request['is_aktif'])
            ->orderBy('kode', 'asc')
            ->get();
        
        return response()->json(array('status' => 200, 'mrsatn' => $res));
    }

    function get_mrprovinsi(Request $request){
        $res = DB::table('mrkota')
            ->select('provinsi')
            ->where('is_aktif', '=', $request['is_aktif'])
            ->distinct()
            ->orderBy('provinsi', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'mrprovinsi' => $res));
    }

    function put_mrattr(Request $request){
        $req_mrattr = $request['mrattr'];

        for($i=0; $i<count($req_mrattr); $i++){
            if(!isset($req_mrattr[$i]['id']) || $req_mrattr[$i]['id'] == ''){                
                Mrattr::insert([
                    'tag_grup' => $req_mrattr[$i]['tag_grup'],
                    'tag_value' => $req_mrattr[$i]['tag_value'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);

            }else{
                Mrattr::where('id', '=', $req_mrattr[$i]['id'])
                ->update([
                    'tag_grup' => $req_mrattr[$i]['tag_grup'],
                    'tag_value' => $req_mrattr[$i]['tag_value'],
                    'is_aktif' => $req_mrattr[$i]['is_aktif'],
                    'user_update' => $request->user()->email,
                ]);

            }
        }
    }

    function put_mrmerk(Request $request){
        $req_mrmerk = $request['mrmerk'];

        for($i=0; $i<count($req_mrmerk); $i++){
            if(!isset($req_mrmerk[$i]['id']) || $req_mrmerk[$i]['id'] == ''){                
                Mrmerk::insert([
                    'kode' => $req_mrmerk[$i]['kode'],
                    'nama' => $req_mrmerk[$i]['nama'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);

            }else{
                Mrmerk::where('id', '=', $req_mrmerk[$i]['id'])
                ->update([
                    'kode' => $req_mrmerk[$i]['kode'],
                    'nama' => $req_mrmerk[$i]['nama'],
                    'is_aktif' => $req_mrmerk[$i]['is_aktif'],
                    'user_update' => $request->user()->email,
                ]);

            }
        }
    }

    function put_mrpack(Request $request){
        $req_mrpack = $request['mrpack'];

        for($i=0; $i<count($req_mrpack); $i++){
            if(!isset($req_mrpack[$i]['id']) || $req_mrpack[$i]['id'] == ''){                
                Mrpack::insert([
                    'kode' => $req_mrpack[$i]['kode'],
                    'nama' => $req_mrpack[$i]['nama'],
                    'panjang' => $req_mrpack[$i]['panjang'],
                    'lebar' => $req_mrpack[$i]['lebar'],
                    'tinggi' => $req_mrpack[$i]['tinggi'],
                    'berat' => $req_mrpack[$i]['berat'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);

            }else{
                Mrpack::where('id', '=', $req_mrpack[$i]['id'])
                ->update([
                    'kode' => $req_mrpack[$i]['kode'],
                    'nama' => $req_mrpack[$i]['nama'],
                    'panjang' => $req_mrpack[$i]['panjang'],
                    'lebar' => $req_mrpack[$i]['lebar'],
                    'tinggi' => $req_mrpack[$i]['tinggi'],
                    'berat' => $req_mrpack[$i]['berat'],
                    'is_aktif' => $req_mrpack[$i]['is_aktif'],
                    'user_update' => $request->user()->email,
                ]);

            }
        }
    }
    
    function put_mrrack(Request $request){
        $req_mrrack = $request['mrrack'];

        for($i=0; $i<count($req_mrrack); $i++){
            if(!isset($req_mrrack[$i]['id']) || $req_mrrack[$i]['id'] == ''){                
                Mrrack::insert([
                    'kode' => $req_mrrack[$i]['kode'],
                    'nama' => $req_mrrack[$i]['nama'],
                    'panjang' => $req_mrrack[$i]['panjang'],
                    'lebar' => $req_mrrack[$i]['lebar'],
                    'tinggi' => $req_mrrack[$i]['tinggi'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);

            }else{
                Mrrack::where('id', '=', $req_mrrack[$i]['id'])
                ->update([
                    'kode' => $req_mrrack[$i]['kode'],
                    'nama' => $req_mrrack[$i]['nama'],
                    'panjang' => $req_mrrack[$i]['panjang'],
                    'lebar' => $req_mrrack[$i]['lebar'],
                    'tinggi' => $req_mrrack[$i]['tinggi'],
                    'is_aktif' => $req_mrrack[$i]['is_aktif'],
                    'user_update' => $request->user()->email,
                ]);

            }
        }
    }
    
    function put_mrsatn(Request $request){
        $req_mrsatn = $request['mrsatn'];

        for($i=0; $i<count($req_mrsatn); $i++){
            if(!isset($req_mrsatn[$i]['id']) || $req_mrsatn[$i]['id'] == ''){                
                Mrsatn::insert([
                    'kode' => $req_mrsatn[$i]['kode'],
                    'nama' => $req_mrsatn[$i]['nama'],
                    'is_aktif' => 1,
                    'user_update' => $request->user()->email,
                ]);

            }else{
                Mrsatn::where('id', '=', $req_mrsatn[$i]['id'])
                ->update([
                    'kode' => $req_mrsatn[$i]['kode'],
                    'nama' => $req_mrsatn[$i]['nama'],
                    'is_aktif' => $req_mrsatn[$i]['is_aktif'],
                    'user_update' => $request->user()->email,
                ]);

            }
        }
    }
    

}

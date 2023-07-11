<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BtController extends Controller
{
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

    function get_btivpo(Request $request){
        $res = DB::table('v_btivpo')
            ->get();

        return response()->json(array('status' => 200, 'btivpo' => $res));
    }

}

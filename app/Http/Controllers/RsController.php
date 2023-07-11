<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class RsController extends Controller
{
    function get(Request $request)
    {
        $path = explode('/', $request->path());
        $method_name = 'get_' . $path[1];

        DB::beginTransaction();

        try {
            $rtn = $this->$method_name($request);

            DB::commit();

            return $rtn;

        } catch (\Exception $e) {
            DB::rollback();

            return response()->json(array('status' => 501, 'message' => $e->getMessage() . ' at ' . $e->getFile() . ' line: ' . $e->getLine()));
        } catch (\Throwable $e) {
            DB::rollback();

            return response()->json(array('status' => 502, 'message' => $e->getMessage() . ' at ' . $e->getFile() . ' line: ' . $e->getLine()));
        }
    }

    function get_rsgudg(Request $request)
    {

        DB::select("select garis.func_rsgudg_1(?, ?, ?)", [$request['id_gudang'], $request['periode'], 'cur']);

        $res = DB::select('fetch all in cur');

        return response()->json(array('status' => 200, 'rsgudg' => $res));
    }

    function get_rsmuts(Request $request)
    {

        DB::select("select garis.func_rimutg(?, ?, ?)", [$request['id_gudang'], $request['periode'], 'cur']);

        $res = DB::select('fetch all in cur');

        return response()->json(array('status' => 200, 'rsmuts' => $res));
    }
}

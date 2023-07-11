<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class HomeController extends Controller
{
    function get_menu(Request $request){
        $user = $request->user();

        $res = DB::table('v_syauth')
            ->where('id_grupuser', '=', $user->id_grupuser)
            ->where('grup1', '=', $request['grup1'])
            ->where('is_aktifauth', '=', 1)
            ->where('is_aktifmenu', '=', 1)
            ->orderBy('grup1', 'asc')
            ->orderBy('grup2', 'asc')
            ->orderBy('urut', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'menus' => $res));
    }

}

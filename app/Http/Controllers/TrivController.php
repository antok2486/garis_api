<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\tr\Trivpo1;
use App\Models\tr\Trivpo2;
use App\Models\tr\Trivgr1;
use App\Models\tr\Trivgr2;
use App\Models\tr\Trivpw1;
use App\Models\tr\Trivpw2;
use App\Models\sy\Syparm;
use Carbon\Carbon;
use Illuminate\Support\Arr;

class TrivController extends Controller
{
    function get(Request $request)
    {
        try {
            $path = explode('/', $request->path());
            $method_name = 'get_' . $path[1];

            return $this->$method_name($request);
        } catch (\Exception $e) {
            return response()->json(array('status' => 501, 'message' => $e->getMessage() . ' at ' . $e->getFile() . ' line: ' . $e->getLine()));
        } catch (\Throwable $e) {
            return response()->json(array('status' => 502, 'message' => $e->getMessage() . ' at ' . $e->getFile() . ' line: ' . $e->getLine()));
        }
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

    function get_idno($columns, $trx)
    {
        $select = "
            (coalesce(" . $columns['id'] . ", 0) +1) as last_id,
            " . $columns['no'] . " as last_no,
            to_char(current_date, 'YYMMDD') as prefix
        ";

        $res = DB::table('syparm')
            ->selectRaw($select)
            ->lockForUpdate()
            ->get();

        #yymmddTRX
        $last_no = $res[0]->last_no;
        $prefix = $res[0]->prefix . $trx;

        $rtn['id'] = $res[0]->last_id;

        #in same day
        if (substr($last_no, 0, 9) == $prefix) {
            $rtn['no'] = $prefix . substr(('0000' . floatval(substr($last_no, -4)) + 1), -4);
        } else {
            $rtn['no'] = $prefix . '0001';
        }

        #update id and no
        DB::table('syparm')->update([
            $columns['id'] => $rtn['id'],
            $columns['no'] => $rtn['no']
        ]);

        return $rtn;
    }

    function get_syparm()
    {
        return DB::table('syparm as a')
            ->leftJoin('mrkota as b', 'a.id_kota', '=', 'b.id')
            ->select('a.*', 'b.nama as nama_kota')->get();
    }

    function get_trivds(Request $request)
    {
        $select = "
            a.*,
            case a.jenis_dist when 1 then 'Kirim Counter' when 2 then 'Retur Counter' when 3 then 'Transfer Counter' when 4 then 'Transfer Gudang' end as jenis_dista,
            case a.status when 0 then 'Batal' when 1 then 'Entry' when 2 then 'Valid' when 3 then 'Finish' end as statusa,
            to_char(a.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata,
            b.nama as nama_gudangdr,
            c.nama as nama_gudangke,
            d.nama as nama_merk
        ";

        $status = 1;
        if ($request['status']) {
            $status = [$request['status']];
        }

        if($request['id']){

        }else{
            $res = DB::table('trivds1 as a')
                ->leftJoin('mdgudg as b', 'a.id_gudangdr', '=', 'b.id')
                ->leftJoin('mdgudg as c', 'a.id_gudangke', '=', 'c.id')
                ->leftJoin('mrmerk as d', 'a.id_merk', '=', 'd.id')
                ->selectRaw($select)
                ->where('a.status', '=', $status)
                ->orderBy('a.no_ds', 'asc')
                ->get();

            return response()->json(array('status' => 200, 'trivds' => $res));
        }

    }

    function get_trivgr(Request $request)
    {
        $select = "
            trivgr1.*,
            trivpo1.no_po as no_po,
            case trivpo1.jenis_transaksi when 1 then 'Putus' when 2 then 'Konsinyasi' end as jenis_transaksia,
            case trivpo1.site_transaksi when 1 then 'Offline' when 2 then 'E Commerce' end as site_transaksia,
            case trivgr1.status when 0 then 'Batal' when 1 then 'Entry' when 2 then 'Valid' when 3 then 'Finish' end as statusa,
            to_char(trivgr1.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata,
            to_char(trivpo1.tgl_deliver, 'dd-mm-yyyy') as tgl_delivera,
            mrmerk.nama as nama_merk,
            mdsupl.nama as nama_supplier,
            mdgudg.nama as nama_gudang
        ";

        $status = 1;
        if ($request['status']) {
            $status = [$request['status']];
        }

        if ($request['id']) {
            $res = DB::table('trivgr1')
                ->leftJoin('trivpo1', 'trivgr1.id_po', '=', 'trivpo1.id')
                ->leftJoin('mrmerk', 'trivgr1.id_merk', '=', 'mrmerk.id')
                ->leftJoin('mdsupl', 'trivgr1.id_supplier', '=', 'mdsupl.id')
                ->leftJoin('mdgudg', 'trivgr1.id_gudang', '=', 'mdgudg.id')
                ->selectRaw($select)
                ->where('trivgr1.id', '=', $request['id'])
                ->orderBy('trivgr1.no_gr', 'asc')
                ->get();

            $select_trivgr2 = "
                ROW_NUMBER() OVER(PARTITION BY c.kode, d.kode ORDER BY c.kode, e.id) urut, 
                b.id_produk id_produk, 
                b.id id_skuproduk, 
                c.kode kode_produk, 
                c.nama nama_produk, 
                d.kode kode_varian_1, 
                d.nama nama_varian_1, 
                e.kode kode_varian_2, 
                e.nama nama_varian_2, 
                a.qty qty, 
                a.hrg hrg, 
                a.disc disc, 
                a.tax tax                 
                ";

            $res_trivgr2 = DB::table('trivgr2 as a')
                ->leftJoin('mppros as b', 'a.id_skuproduk', '=', 'b.id')
                ->leftJoin('mpprod as c', 'b.id_produk', '=', 'c.id')
                ->leftJoin('mpvars as d', 'b.id_varian_1', '=', 'd.id')
                ->leftJoin('mpvars as e', 'b.id_varian_2', '=', 'e.id')
                ->selectRaw($select_trivgr2)
                ->where('a.id_gr', '=', $request['id'])
                ->get();

            return response()->json(array('status' => 200, 'trivgr1' => $res, 'trivgr2' => $res_trivgr2));
        } else {
            $res = DB::table('trivgr1')
                ->leftJoin('trivpo1', 'trivgr1.id_po', '=', 'trivpo1.id')
                ->leftJoin('mrmerk', 'trivgr1.id_merk', '=', 'mrmerk.id')
                ->leftJoin('mdsupl', 'trivgr1.id_supplier', '=', 'mdsupl.id')
                ->leftJoin('mdgudg', 'trivgr1.id_gudang', '=', 'mdgudg.id')
                ->selectRaw($select)
                ->where('trivgr1.status', '=', $status)
                ->orderBy('trivgr1.no_gr', 'asc')
                ->get();

            return response()->json(array('status' => 200, 'trivgr' => $res));
        }
    }

    function get_trivgrctkputaway(Request $request)
    {
        $select_header = "
            trivpw1.*, 
            to_char(trivpw1.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata, 
            mdgudg.nama as nama_gudang, 
            mrmerk.nama as nama_merk,
            trivgr1.no_gr as no_gr
        ";

        $res_header = DB::table('trivpw1')
            ->leftJoin('mdgudg', 'trivpw1.id_gudang', '=', 'mdgudg.id')
            ->leftJoin('trivgr1', 'trivpw1.id_reff', '=', 'trivgr1.id')
            ->leftJoin('mrmerk', 'trivgr1.id_merk', '=', 'mrmerk.id')
            ->selectRaw($select_header)
            ->where('trivpw1.id_reff', '=', $request['id_reff'])
            ->get();


        $select_detail = "
            ROW_NUMBER() OVER(PARTITION BY c.kode, d.kode ORDER BY f.kode, c.kode, e.id) urut, 
            f.kode kode_lokasi,
            b.id_produk id_produk, 
            b.id id_skuproduk, 
            c.kode kode_produk, 
            c.nama nama_produk, 
            d.kode kode_varian_1, 
            d.nama nama_varian_1, 
            e.kode kode_varian_2, 
            e.nama nama_varian_2, 
            a.qty_order qty
        ";

        $res_detail = DB::table('trivpw2 as a')
            ->leftJoin('mppros as b', 'a.id_skuproduk', '=', 'b.id')
            ->leftJoin('mpprod as c', 'b.id_produk', '=', 'c.id')
            ->leftJoin('mpvars as d', 'b.id_varian_1', '=', 'd.id')
            ->leftJoin('mpvars as e', 'b.id_varian_2', '=', 'e.id')
            ->leftJoin('mdgudl as f', 'a.id_lokasi', '=', 'f.id')
            ->selectRaw($select_detail)
            ->where('a.id_pw', '=', $res_header[0]->id)
            ->get();

        return response()->json(array('status' => 200, 'header' => $res_header, 'detail' => $res_detail, 'param' => $this->get_syparm()));
    }

    function get_trivparam()
    {
        $select = "
            id_jenissuplbrg,
            id_tipegudangpo,
            to_char(current_date, 'YYMMDD') as no_prefix
        ";

        $res = DB::table('syparm')
            ->selectRaw($select)
            ->get();

        return response()->json(array('status' => 200, 'params' => $res[0]));
    }

    function get_trivpo(Request $request)
    {
        $status = 1;
        if ($request['status']) {
            $status = [$request['status']];
        }

        $select = "
            trivpo1.*,
            case trivpo1.jenis_transaksi when 1 then 'Putus' when 2 then 'Konsinyasi' end as jenis_transaksia,
            case trivpo1.site_transaksi when 1 then 'Offline' when 2 then 'E Commerce' end as site_transaksia,
            case trivpo1.status when 0 then 'Batal' when 1 then 'Entry' when 2 then 'Valid' when 3 then 'Finish' end as statusa,
            to_char(trivpo1.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata,
            to_char(trivpo1.tgl_deliver, 'dd-mm-yyyy') as tgl_delivera,
            mrmerk.nama as nama_merk,
            mdsupl.nama as nama_supplier,
            mdgudg.nama as nama_gudang
        ";

        if ($request['id']) {
            $res = DB::table('trivpo1')
                ->leftJoin('mrmerk', 'trivpo1.id_merk', '=', 'mrmerk.id')
                ->leftJoin('mdsupl', 'trivpo1.id_supplier', '=', 'mdsupl.id')
                ->leftJoin('mdgudg', 'trivpo1.id_gudang', '=', 'mdgudg.id')
                ->selectRaw($select)
                ->where('trivpo1.id', '=', $request['id'])
                ->orderBy('trivpo1.no_po', 'asc')
                ->get();

            $select_trivpo2 = "
                ROW_NUMBER() OVER(PARTITION BY c.kode, d.kode ORDER BY c.kode, e.id) urut, 
                b.id_produk id_produk, 
                b.id id_skuproduk, 
                c.kode kode_produk, 
                c.nama nama_produk, 
                d.kode kode_varian_1, 
                d.nama nama_varian_1, 
                e.kode kode_varian_2, 
                e.nama nama_varian_2, 
                a.qty_po qty, 
                a.hrg hrg, 
                a.disc disc, 
                a.tax tax                 
                ";

            $res_trivpo2 = DB::table('trivpo2 as a')
                ->leftJoin('mppros as b', 'a.id_skuproduk', '=', 'b.id')
                ->leftJoin('mpprod as c', 'b.id_produk', '=', 'c.id')
                ->leftJoin('mpvars as d', 'b.id_varian_1', '=', 'd.id')
                ->leftJoin('mpvars as e', 'b.id_varian_2', '=', 'e.id')
                ->selectRaw($select_trivpo2)
                ->where('a.id_po', '=', $request['id'])
                ->get();

            return response()->json(array('status' => 200, 'trivpo1' => $res, 'trivpo2' => $res_trivpo2, 'param' => $this->get_syparm()));
        } else {
            $res = DB::table('trivpo1')
                ->leftJoin('mrmerk', 'trivpo1.id_merk', '=', 'mrmerk.id')
                ->leftJoin('mdsupl', 'trivpo1.id_supplier', '=', 'mdsupl.id')
                ->leftJoin('mdgudg', 'trivpo1.id_gudang', '=', 'mdgudg.id')
                ->selectRaw($select)
                ->where('trivpo1.status', '=', $status)
                ->orderBy('trivpo1.no_po', 'asc')
                ->get();

            return response()->json(array('status' => 200, 'trivpo' => $res));
        }
    }

    function get_trivpo_no(Request $request)
    {
        $select = "
            trivpo1.*,
            case trivpo1.jenis_transaksi when 1 then 'Putus' when 2 then 'Konsinyasi' end as jenis_transaksia,
            case trivpo1.site_transaksi when 1 then 'Offline' when 2 then 'E Commerce' end as site_transaksia,
            case trivpo1.status when 0 then 'Batal' when 1 then 'Entry' when 2 then 'Valid' when 3 then 'Finish' end as statusa,
            to_char(trivpo1.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata,
            to_char(trivpo1.tgl_deliver, 'dd-mm-yyyy') as tgl_delivera,
            mrmerk.nama as nama_merk,
            mdsupl.nama as nama_supplier,
            mdgudg.nama as nama_gudang
        ";

        $res = DB::table('trivpo1')
            ->leftJoin('mrmerk', 'trivpo1.id_merk', '=', 'mrmerk.id')
            ->leftJoin('mdsupl', 'trivpo1.id_supplier', '=', 'mdsupl.id')
            ->leftJoin('mdgudg', 'trivpo1.id_gudang', '=', 'mdgudg.id')
            ->selectRaw($select)
            ->where('trivpo1.status', '=', 2)
            ->orderBy('trivpo1.no_po', 'asc')
            ->get();

        return response()->json(array('status' => 200, 'trivpo_no' => $res));
    }

    function get_trivpo_varian(Request $request)
    {
        $res = DB::table('v_trivpo_varian_1')
            ->where('id_po', '=', $request['id_po'])
            ->orderBy('kode_produk', 'asc')
            ->orderBy('kode_varian_1', 'asc')
            ->get();

        //get varian 2
        for ($i = 0; $i < count($res); $i++) {
            $res_varian2 = DB::table('v_trivpo_varian_2')
                ->where('id_po', '=', $res[$i]->id_po)
                ->where('id_produk', '=', $res[$i]->id_produk)
                ->where('id_varian_1', '=', $res[$i]->id_varian_1)
                ->get();
            $res[$i]->varian_2 = $res_varian2;
        }

        return response()->json(array('status' => 200, 'trivpo_varian' => $res));
    }

    function get_trivpw(Request $request)
    {
        $status = 1;
        if ($request['status']) {
            $status = [$request['status']];
        }

        $select = "
            trivpw1.*,
            mdgudg.nama as nama_gudang,
            case trivpw1.status when 0 then 'Batal' when 1 then 'Entry' when 2 then 'Valid' when 3 then 'Finish' end as statusa,
            to_char(trivpw1.updated_at, 'dd-mm-yyyy hh24:mi:ss') as updated_ata,
            case trivpw1.jenis_penerimaan when 1 then 'Penerimaan Brg PO' when 2 then 'Retur Counter' when 3 then 'Retur Penjualan' else 'N/A' end as jenis_penerimaana,
            case trivpw1.jenis_penerimaan when 1 then trivgr1.no_gr else 'N/A' end as no_reff
        ";

        $select_trivpw2 = "
            a.id id,
            a.id_pw id_pw, 
            c.kode kode_lokasi,
            (d.nama || '/' || e.nama || '/' || f.nama ) nama_produk,  
            b.kode kode_skuproduk, 
            a.qty_order qty_order,
            0 qty_put
        ";

        if ($request['id'] || $request['no_pw']) {
            $col_pw = 'trivpw1.id';
            $col_pwval = $request['id'];

            if($request['no_pw']){
                $col_pw = 'trivpw1.no_pw';
                $col_pwval = $request['no_pw'];
            }

            $res_trivpw1 = DB::table('trivpw1')
                ->leftJoin('mdgudg', 'trivpw1.id_gudang', '=', 'mdgudg.id')
                ->leftJoin('trivgr1', 'trivpw1.id_reff', '=', 'trivgr1.id')
                ->selectRaw($select)
                ->where($col_pw, '=', $col_pwval)
                ->get();

            $res_trivpw2 = DB::table('trivpw2 as a')
                ->leftJoin('mppros as b', 'a.id_skuproduk', '=', 'b.id')
                ->leftJoin('mdgudl as c', 'a.id_lokasi', '=', 'c.id')
                ->leftJoin('mpprod as d', 'b.id_produk', '=', 'd.id')
                ->leftJoin('mpvars as e', 'b.id_varian_1', '=', 'e.id')
                ->leftJoin('mpvars as f', 'b.id_varian_2', '=', 'f.id')
                ->selectRaw($select_trivpw2)
                ->where('a.id_pw', '=', $res_trivpw1[0]->id)
                ->orderBy('kode_lokasi', 'asc')
                ->orderBy('kode_skuproduk', 'asc')
                ->get();

            return response()->json(array('status' => 200, 'trivpw1' => $res_trivpw1, 'trivpw2' => $res_trivpw2));
        } else {
            $res = DB::table('trivpw1')
                ->leftJoin('mdgudg', 'trivpw1.id_gudang', '=', 'mdgudg.id')
                ->leftJoin('trivgr1', 'trivpw1.id_reff', '=', 'trivgr1.id')
                ->selectRaw($select)
                ->where('trivpw1.status', '=', $status)
                ->orderBy('trivpw1.no_pw', 'asc')
                ->get();

            return response()->json(array('status' => 200, 'trivpw' => $res));
        }
    }

    function put_trivgr(Request $request)
    {
        $req_trivgr1 = $request['trivgr1'];
        $req_trivgr2 = $request['trivgr2'];

        //create no_po
        $id_no = $this->get_idno(['id' => 'id_gr', 'no' => 'no_gr'], 'GRB');

        //insert trivgr1
        Trivgr1::insert([
            "id" => $id_no['id'],
            "no_gr" => $id_no['no'],
            "id_po" => $req_trivgr1["id_po"],
            "id_merk" => $req_trivgr1["id_merk"],
            "id_supplier" => $req_trivgr1["id_supplier"],
            "id_gudang" => $req_trivgr1["id_gudang"],
            "note" => $req_trivgr1["note"],
            "status" => $req_trivgr1["status"],
            "user_update" => $request->user()->email,
        ]);

        //insert trivgr2
        for ($i = 0; $i < count($req_trivgr2); $i++) {
            Trivgr2::insert([
                "id_gr" => $id_no['id'],
                "id_skuproduk" => $req_trivgr2[$i]["id_skuproduk"],
                "qty" => $req_trivgr2[$i]["qty"],
                "hrg" => $req_trivgr2[$i]["hrg"],
                "disc" => $req_trivgr2[$i]["disc"],
                "disc_amt" => 0,
                "tax" => $req_trivgr2[$i]["tax"],
                "tax_amt" => 0,
                "hrg_beli" => $req_trivgr2[$i]["hrg"],
            ]);
        }
    }

    function put_trivgrputaway(Request $request)
    {
        DB::select("call proc_trivgr_putaway(?)", [$request['id_gr']]);

        //update status valid
        Trivgr1::where('id', '=', $request['id_gr'])
            ->update([
                'status' => 2
            ]);
    }

    function put_trivpo(Request $request)
    {
        $req_trivpo1 = $request['trivpo1'];
        $req_trivpo2 = $request['trivpo2'];

        //create no_po
        $id_no = $this->get_idno(['id' => 'id_po', 'no' => 'no_po'], 'POB');

        //insert trivpo1
        Trivpo1::insert([
            "id" => $id_no['id'],
            "no_po" => $id_no['no'],
            "jenis_po" => $req_trivpo1["jenis_po"],
            "id_merk" => $req_trivpo1["id_merk"],
            "id_supplier" => $req_trivpo1["id_supplier"],
            "id_gudang" => $req_trivpo1["id_gudang"],
            "jenis_transaksi" => $req_trivpo1["jenis_transaksi"],
            "site_transaksi" => $req_trivpo1["site_transaksi"],
            "tgl_deliver" => $req_trivpo1["tgl_deliver"],
            "note" => $req_trivpo1["note"],
            "request_by" => $request->user()->nama,
            "approve_by" => $req_trivpo1["approve_by"],
            "status" => $req_trivpo1["status"],
            "user_update" => $request->user()->email,
        ]);

        //insert trivpo2
        for ($i = 0; $i < count($req_trivpo2); $i++) {
            Trivpo2::insert([
                "id_po" => $id_no['id'],
                "id_skuproduk" => $req_trivpo2[$i]["id_skuproduk"],
                "qty_po" => $req_trivpo2[$i]["qty"],
                "qty_gr" => 0,
                "hrg" => $req_trivpo2[$i]["hrg"],
                "disc" => $req_trivpo2[$i]["disc"],
                "disc_amt" => 0,
                "tax" => $req_trivpo2[$i]["tax"],
                "tax_amt" => 0,
                "hrg_beli" => $req_trivpo2[$i]["hrg"],
            ]);
        }
    }

    function put_trivpoapv(Request $request)
    {
        Trivpo1::where('id', '=', $request['id'])
            ->update([
                'approve_by' => $request->user()->nama,
                'status' => $request['status'],
                'user_valid' => $request->user()->email,
                'valid_at' => Carbon::now()
            ]);
    }

    function put_trivpw(Request $request)
    {
        $req_trivpw1 = $request['trivpw1'];
        $req_trivpw2 = $request['trivpw2'];

        //update trivpw1
        Trivpw1::where('id', '=', $req_trivpw1['id'])
            ->update([
                'status' => 2,
                'user_update' => $request->user()->email
            ]);
        
        foreach ($req_trivpw2 as $row){
            Trivpw2::where('id', '=', $row['id'])
                ->update([
                    'qty_put' => $row['qty_put']
                ]);
        }
    }
}

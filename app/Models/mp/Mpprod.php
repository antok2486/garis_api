<?php

namespace App\Models\mp;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Mpprod extends Model
{
    protected $table='mpprod';
    use HasFactory;

    protected static function getId(){
        $next_id = DB::select("select nextval('mpprod_id_seq') as nextval");
        return intval($next_id['0']->nextval);
    }

}

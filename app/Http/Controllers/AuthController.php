<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
Use Illuminate\Support\Facades\Auth;
Use Illuminate\Support\Facades\DB;
use App\Models\User;

class AuthController extends Controller{
    function login(Request $request){
        $request->validate([
            'email' => 'required',
            'password' => 'required',
        ],
        [
            'email.required' => 'Email / No. HP tidak boleh kosong',
            'password.required' => 'Password tidak boleh kosong',
        ]
        );

        //cek jika sudah login
        if(Auth::check()){
            return response()->json(array(
                'status' => 200,
                'message' => 'User sudah login'
            ));    
        }

        $email = $request['email'];
        $password = $request['password'];

        if (!Auth::attempt(['email' => $email, 'password' => $password, 'is_aktif' => 1])) {
            return response()->json(array(
                'status' => 401, 
                'errors' => array(
                    'email' => array('Login gagal'), 
                    'password' => array('Cek email dan password anda')
            )));
        }

        $user = Auth::user();
        $token = $user->createToken('token_name')->plainTextToken;

        return response()->json(array(
            'status' => 200,
            'token' => $token,
            'user' => $user
        ));

    }
    
    function logout(Request $request){
        $user = $request->user();
        $user->currentAccessToken()->delete();

        return response()->json(array(
            'status' => 200,
        ));
    }

    function register(Request $request){
        DB::beginTransaction();
        try{
            User::insert([
                'id_user' => $request['email'],
                'nama' => $request['nama'],
                'email' => $request['email'],
                'tlp' => $request['tlp'],
                'password' => bcrypt($request['password1']),
            ]);

            DB::commit();

            return response()->json(array('status' => 200));

        }catch(\Exception $e){
            DB::rollback();
            return response()->json(array('status' => 500, 'message' => $e));

        }catch(\Throwable $e){
            DB::rollback();
            return response()->json(array('status' => 500, 'message' => $e));

        }
    }
}

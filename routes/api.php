<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MdController;
use App\Http\Controllers\MpController;
use App\Http\Controllers\MrController;
use App\Http\Controllers\SyController;
use App\Http\Controllers\BtController;
use App\Http\Controllers\TrivController;
use App\Http\Controllers\RsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::controller(AuthController::class)->group(function(){
    Route::post('/login', 'login');
    Route::post('/register', 'register');
});

//Protecting Routes
Route::group(['middleware' => ['auth:sanctum']], function () {
    // API route for logout user
    Route::get('/logout', [AuthController::class, 'logout']);

    //API route for home
    Route::controller(HomeController::class)->group(function(){
        Route::get('/menu', 'get_menu');
    });

    //API Route for Budget and Target
    Route::controller(BtController::class)->group(function(){
        Route::get('/bt{slug}', 'get');
        Route::put('/bt{slug}', 'put');
        
    });

    //API Route for MD
    Route::controller(MdController::class)->group(function(){
        Route::get('/md{slug}', 'get');
        Route::put('/md{slug}', 'put');
        Route::delete('/md{slug}', 'delete');
        
    });
    
    //API Route for MP
    Route::controller(MpController::class)->group(function(){
        Route::get('/mp{slug}', 'get');
        Route::put('/mp{slug}', 'put');
        Route::delete('/mp{slug}', 'delete');
        
    });

    //API Route for MR
    Route::controller(MrController::class)->group(function(){
        Route::get('/mr{slug}', 'get');
        Route::put('/mr{slug}', 'put');
        Route::delete('/mr{slug}', 'delete');
        
    });

    //API Route for Sy
    Route::controller(SyController::class)->group(function(){
        Route::get('/sy{slug}', 'get');
        Route::put('/sy{slug}', 'put');
        Route::delete('/sy{slug}', 'delete');
        
    });

    //API Route for Triv
    Route::controller(TrivController::class)->group(function(){
        Route::get('/triv{slug}', 'get');
        Route::put('/triv{slug}', 'put');
        
    });

    //API Route for Rs (report stock)
    Route::controller(RsController::class)->group(function(){
        Route::get('/rs{slug}', 'get');
        
    });
});


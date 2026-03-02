<?php

use App\Http\Controllers\AnalylicsRepportsController;
use App\Http\Controllers\OrdonanceController;
use App\Http\Controllers\PharmacieController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\SearchedProductController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware('auth', 'checkblocked','pharmacieIsBlocked')->name('dashboard.')->group(function () {

    Route::get('/',[AnalylicsRepportsController::class,'index'])->name('home');
    Route::get('/ordonance', [OrdonanceController::class, 'index'])->name('ordonance.index');
    Route::get('/ordonance/{ordonance}',[OrdonanceController::class,'show'])->name('ordonance.show');
    Route::put('/ordonance/feedback/{ordonance}',[OrdonanceController::class,'feedback'])->name('ordonance.feedback');
    Route::put('/ordonance/approuve/{ordonance}',[OrdonanceController::class,'approuve'])->name('ordonance.approuve');
    Route::put('/ordonance/rejete/{ordonance}',[OrdonanceController::class,'rejected'])->name('ordonance.rejected');
    Route::put('/ordonance/comment/{ordonance}',[OrdonanceController::class,'comment'])->name('ordonance.comment');
    Route::get('/produit', [ProduitController::class, 'index'])->name('produit.index');
    Route::post('/produit/create',[ProduitController::class,'store'])->name('produit.store');
    Route::delete('/produit/destroy/{id}',[ProduitController::class,'destroy'])->name('produit.destroy');
    Route::get('/produits/search', [ProduitController::class, 'search'])->name('produit.search');
    Route::post('/produits/produit/create',[ProduitController::class,'produitCreateAdd'])->name('produit.createAdd');

    Route::get('/utilisateur', [UserController::class, 'index'])->name('user.index');
    Route::put('/utilisateur/{user}/block', [UserController::class, 'block'])->name('users.block');
    Route::put('/utilisateur/{user}/unblock', [UserController::class, 'unblock'])->name('users.unblock');
    Route::delete('/utilisateur/{user}/delete',[UserController::class,'destroy'])->name('users.delete');
    Route::get('/paramettrage', [PharmacieController::class, 'index'])->middleware('role:admin')->name('pharmacie.index');
    Route::get('/paramettrage/invite/{pharmacie}', [PharmacieController::class, 'invite'])->middleware('role:admin')->name('phamacie.invite');
    Route::post('/paramettrage/invite/{pharmacie}', [PharmacieController::class, 'envoyer'])->middleware('role:admin')->name('phamacie.envoyer');
    Route::put('/paramettrage/update/{pharmacie}', [PharmacieController::class, 'update'])->middleware('role:admin')->name('phamacie.update');
    Route::get('/paramettrage/edit/{pharmacie}', [PharmacieController::class, 'edit'])->middleware('role:admin')->name('phamacie.edit');
    Route::delete('/paramettrage/delete/{pharmacie}', [PharmacieController::class, 'destroy'])->middleware('role:admin')->name('pharmacie.delete');
    Route::put('/paramettrage/{pharmacie}/update-status', [PharmacieController::class, 'updateStatus'])->middleware('role:admin')->name('phamacie.updateStatus');
    Route::put('/paramettrage/{pharmacie}/update-disponibilite', [PharmacieController::class, 'updateDisponibilite'])->middleware('role:admin')->name('phamacie.updateDisponibilite');


    Route::post('/users/{user}/roles', [PharmacieController::class, 'updateUserRoles'])
        ->middleware('role:admin')
        ->name('users.updateRoles');
    Route::put('/serched-product/{ordonnanceId}',[SearchedProductController::class,'update'])->name('search_product.update');


});
Route::middleware('auth','role:super admin','checkblocked')->prefix('dashboard')->name('superAdmin.')->group(function(){
    Route::get('/Administration/Dashboard',[SuperAdminController::class,'index'])->name('home');
    Route::get('/Administration/Dashboard/pharmacies',[SuperAdminController::class,'pharmacie'])->name('pharmacie');
    Route::get('/Administration/Dashboard/ordonnances',[SuperAdminController::class,'ordonnance'])->name('ordonnance');
    Route::put('/Administration/Dashboard/ordonnance/rejected/{ordonance}',[SuperAdminController::class,'Ordonancerejected'])->name('ordonance.rejected');
    Route::put('/Administration/Dashboard/ordonnance/comment/{ordonance}',[SuperAdminController::class,'Ordonancecomment'])->name('ordonance.comment');
    Route::get('/Administration/Dashboard/produits',[SuperAdminController::class,'produit'])->name('produit');
    Route::get('/Administration/Dashboard/utilisateur',[SuperAdminController::class,'utilisateur'])->middleware('role:hyper admin')->name('users');
    Route::put('/Administration/Dashboard/pharmacie/{pharmacie}/blocked',[SuperAdminController::class,'phramacieBlocked'])->name('pharmacie.blocked');
    Route::put('/Administration/Dashboard/utilisateur/{user}/block', [userController::class, 'block'])->name('super.users.block');
    Route::put('/Administration/Dashboard/utilisateur/{user}/unblock', [userController::class, 'unblock'])->name('super.users.unblock');
    Route::delete('/Administration/Dashboard/utilisateur/{user}/delete',[userController::class,'destroy'])->name('super.users.delete');
    Route::get('/Administration/Dashboard/pharmacie/{pharmacie}',[SuperAdminController::class,'showPharmacie'])->name('pharmacie.show');
    Route::get('/Administration/Dashboard/ordonnance/{ordonance}',[SuperAdminController::class,'showOrdonnance'])->name('ordonnance.show');
    Route::get('/Administration/Dashboard/produit/create',[SuperAdminController::class,'produitCreate'])->name('produit.create');
    Route::post('/Administration/Dashboard/produit/create',[SuperAdminController::class,'produitCreateAdd'])->name('produit.createAdd');
    Route::get('/Administration/Dashboard/produit/edit/{produit}',[SuperAdminController::class,'produitEdit'])->name('produit.edit');
    Route::put('/Administration/Dashboard/produit/update/{produit}',[SuperAdminController::class,'produitUpdate'])->name('produit.update');
    Route::delete('/Administration/Dashboard/produit/delete/{produit}',[SuperAdminController::class,'produitDelete'])->name('produit.delete');
    Route::post('/Administration/Dashboard/invite/', [SuperAdminController::class, 'envoyer'])->name('user.Envoyer');
    Route::put('/Administration/Dashboard/ordonnance/rejected/{ordonance}',[SuperAdminController::class,'rejected'])->name('ordonance.rejected');
    Route::put('/Administration/Dashboard/ordonnance/comment/{ordonance}',[SuperAdminController::class,'comment'])->name('ordonance.comment');

   
    Route::post('/Administration/Dashboard/pharmacies/status',          [SuperAdminController::class, 'updateStatut'])->name('pharmacies.status');
    Route::post('/Administration/Dashboard/pharmacies/disponibilite',   [SuperAdminController::class, 'updateDisponibilite'])->name('pharmacies.disponibilite');
    Route::post('/Administration/Dashboard/pharmacies/block',           [SuperAdminController::class, 'toggleBlock'])->name('pharmacies.block');
    Route::delete('/Administration/Dashboard/pharmacies/{pharmacie}',   [SuperAdminController::class, 'destroy'])->name('pharmacies.destroy');
});

require __DIR__.'/settings.php';

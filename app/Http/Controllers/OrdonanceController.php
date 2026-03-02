<?php

namespace App\Http\Controllers;

use App\Models\Ordonance;
use App\Models\Searched_product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrdonanceController extends Controller
{
     public function index()
    {
        $userAuth = Auth::id();
        $user = User::where('id', $userAuth)->first();
        $ordonnances = Ordonance::with('user', 'pharmacie','produits')->where('pharmacie_id', $user->pharmacie_id)->paginate(10);

    

        return Inertia::render('Ordonance/index', [
            'ordonnance' => $ordonnances
        ]);
    }
   public function show(Ordonance $ordonance)
{
    // Charger les relations
    $ordonance->load(['user', 'pharmacie', 'produits']);

    // Produits recherchés liés à cette ordonnance
    $searchedProducts = Searched_product::where('ordonance_id', $ordonance->id)
        ->get();

    return Inertia::render('Ordonance/Show', [
        'ordonnance' => $ordonance,
        'produits' => $ordonance->produits,
        'searched_product' => $searchedProducts,
    ]);
}

    public function feedback(Request $request, Ordonance $ordonance)
    {
        $request->validate([
            'feedback' => 'required|string',

        ]);
        $feedback=$ordonance->update([
            'feedback' => $request->feedback
        ]);
        $userOrdn=$ordonance->user;
        $pharmacie=$ordonance->pharmacie;
        if($feedback){
            //$userOrdn->notify(new PharmacieMailSmsNotification($pharmacie,$userOrdn));
        }
        return redirect()->back()->with('success', 'feedback mis à jour avec succès !');
    }
    public function approuve(Ordonance $ordonance)
    {
        if ($ordonance->status === 'processed') {
            return redirect()->back()->with('warning', 'Cette ordonnance a déjà été approuvée !');
        }

        if ($ordonance->total === null || floatval($ordonance->total) <= 0) {
            return redirect()->back()->with('warning', "Veuillez renseigner le prix des produits avant d'approuver l'ordonnance !");
        }

       $processed= $ordonance->update([
            'status' => 'processed',
            'approuve_par' => Auth::id()
        ]);
        $userOrdn=$ordonance->user;
        $pharmacie=$ordonance->pharmacie;
        if($processed){
            //$userOrdn->notify(new PharmacieMailSmsNotification($pharmacie,$userOrdn));
        }
        return redirect()->back()->with('success', 'L\'ordonnance a été approuvée avec succès !');
    }
    public function rejected(Ordonance $ordonance)
    {
        if ($ordonance->status === 'rejected') {
            return redirect()->back()->with('warning', 'Cette ordonnance a déjà été rejectée !');
        }



       $rejected= $ordonance->update([
            'status' => 'rejected',

        ]);
        $userOrdn=$ordonance->user;
        $pharmacie=$ordonance->pharmacie;
        if($rejected){
           // $userOrdn->notify(new PharmacieMailSmsNotification($pharmacie,$userOrdn));
        }
        return redirect()->back()->with('success', 'L\'ordonnance a été rejectée avec succès !');
    }
    public function comment(Ordonance $ordonance)
    {
        if ($ordonance->status === 'comment') {
            return redirect()->back()->with('warning', 'Cette ordonnance a déjà été relencée" !');
        }



       $comment= $ordonance->update([
            'status' => 'comment',

        ]);
        $userOrdn=$ordonance->user;
        $pharmacie=$ordonance->pharmacie;
        if($comment){
            //$userOrdn->notify(new PharmacieMailSmsNotification($pharmacie,$userOrdn));
        }
        return redirect()->back()->with('success', 'L\'ordonnance a été relancée avec succès !');
    }
}

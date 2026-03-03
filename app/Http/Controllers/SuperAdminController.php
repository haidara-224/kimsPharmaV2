<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProduitaddRequest;
use App\Models\Ordonance;
use App\Models\Pharmacie;
use App\Models\Produit;
use App\Models\Searched_product;
use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SuperAdminController extends Controller
{
    public function index()
    {
        $now       = now();
        $lastMonth = $now->copy()->subMonth();
        $lastYear  = $now->copy()->subYear();

        // ── Totaux globaux ─────────────────────────────────────────────────────
        $pharmacies  = Pharmacie::count();
        $ordonnances = Ordonance::count();
        $produits    = Produit::count();

        // ── Croissance mois en cours vs mois précédent ─────────────────────────
        $pThis  = Pharmacie::whereMonth('created_at', $now->month)->whereYear('created_at', $now->year)->count();
        $oThis  = Ordonance::whereMonth('created_at', $now->month)->whereYear('created_at', $now->year)->count();
        $prThis = Produit::whereMonth('created_at',   $now->month)->whereYear('created_at', $now->year)->count();

        $pPrev  = Pharmacie::whereMonth('created_at', $lastMonth->month)->whereYear('created_at', $lastMonth->year)->count();
        $oPrev  = Ordonance::whereMonth('created_at', $lastMonth->month)->whereYear('created_at', $lastMonth->year)->count();
        $prPrev = Produit::whereMonth('created_at',   $lastMonth->month)->whereYear('created_at', $lastMonth->year)->count();

        $growth = fn($cur, $prev) => $prev > 0
            ? round((($cur - $prev) / $prev) * 100, 1)
            : ($cur > 0 ? 100 : 0);

        $growthStats = [
            'pharmacies'  => $growth($pThis,  $pPrev),
            'ordonnances' => $growth($oThis,  $oPrev),
            'produits'    => $growth($prThis, $prPrev),
        ];

        // ── Stats mensuelles 12 mois (clé YYYY-MM) ────────────────────────────
        $buildMonthly = fn(string $model) => $model::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as count')
            ->where('created_at', '>=', $lastYear)
            ->groupBy('year', 'month')->orderBy('year')->orderBy('month')
            ->get()
            ->mapWithKeys(fn($r) => [
                $r->year . '-' . str_pad($r->month, 2, '0', STR_PAD_LEFT) => $r->count
            ])->toArray();

        $monthlyStats = [
            'pharmacies'  => $buildMonthly(Pharmacie::class),
            'ordonnances' => $buildMonthly(Ordonance::class),
            'produits'    => $buildMonthly(Produit::class),
        ];

        // ── Statuts ordonnances : pending | processed | rejected | to_create | comment
        $ordonnancesStats = [
            'processed' => Ordonance::where('status', 'processed')->count(),
            'pending'   => Ordonance::where('status', 'pending')->count(),
            'rejected'  => Ordonance::where('status', 'rejected')->count(),
            'to_create' => Ordonance::where('status', 'to_create')->count(),
            'comment'   => Ordonance::where('status', 'comment')->count(),
        ];

        // ── Statut livraison : En Pharmacie | Livraison Gratuite | Livraison express | Livraison Standard
        $livraisonsStats = [
            'en_pharmacie'       => Ordonance::where('statut_livraison', 'En Pharmacie')->count(),
            'livraison_gratuite' => Ordonance::where('statut_livraison', 'Livraison Gratuite')->count(),
            'livraison_express'  => Ordonance::where('statut_livraison', 'Livraison express')->count(),
            'livraison_standard' => Ordonance::where('statut_livraison', 'Livraison Standard')->count(),
        ];

        // ── Statut pharmacies : statut active|inactive  +  disponibilite open|closed  +  is_blocked
        $pharmaciesStats = [
            'active'   => Pharmacie::where('statut', 'active')->where('is_blocked', false)->count(),
            'inactive' => Pharmacie::where('statut', 'inactive')->count(),
            'open'     => Pharmacie::where('disponibilite', 'open')->count(),
            'closed'   => Pharmacie::where('disponibilite', 'closed')->count(),
            'blocked'  => Pharmacie::where('is_blocked', true)->count(),
        ];

        // ── Chiffre d'affaires (ordonnances processed) ─────────────────────────
        $chiffreAffaires = Ordonance::where('status', 'processed')->sum('total');
        $caThisMonth     = Ordonance::where('status', 'processed')
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at',  $now->year)->sum('total');
        $caLastMonth     = Ordonance::where('status', 'processed')
            ->whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at',  $lastMonth->year)->sum('total');

        // ── Top 5 pharmacies par nb d'ordonnances ──────────────────────────────
        $topPharmacies = Pharmacie::withCount('ordonances')
            ->orderByDesc('ordonances_count')
            ->limit(5)
            ->get(['id', 'name', 'adresse', 'statut', 'disponibilite', 'is_blocked'])
            ->map(fn($p) => [
                'id'           => $p->id,
                'nom'          => $p->name,
                'adresse'      => $p->adresse,
                'statut'       => $p->is_blocked ? 'Bloquée' : ($p->statut === 'active' ? 'Active' : 'Inactive'),
                'disponibilite' => $p->disponibilite,   // 'open' | 'closed'
                'count'        => $p->ordonances_count,
            ])->toArray();

        // ── Activités récentes ─────────────────────────────────────────────────
        $recPharmacies = Pharmacie::latest()->limit(5)
            ->get(['id', 'name', 'created_at', 'statut', 'is_blocked'])
            ->map(fn($p) => [
                'id'     => $p->id,
                'type'   => 'pharmacie',
                'action' => 'Nouvelle pharmacie inscrite',
                'name'   => $p->name,
                'time'   => $p->created_at->diffForHumans(),
                'status' => $p->is_blocked ? 'error' : ($p->statut === 'active' ? 'success' : 'warning'),
                'total'  => null,
            ]);

        $recOrdonnances = Ordonance::latest()->limit(6)
            ->get(['id', 'numero', 'patient', 'created_at', 'status', 'total'])
            ->map(fn($o) => [
                'id'     => $o->id,
                'type'   => 'ordonnance',
                'action' => match ($o->status) {
                    'processed' => 'Ordonnance traitée',
                    'rejected'  => 'Ordonnance rejetée',
                    'to_create' => 'Ordonnance à créer',
                    'comment'   => 'Ordonnance commentée',
                    default     => 'Nouvelle ordonnance',   // pending
                },
                'name'   => $o->patient . ' — ' . ($o->numero ?? '#' . $o->id),
                'time'   => $o->created_at->diffForHumans(),
                'status' => match ($o->status) {
                    'processed' => 'success',
                    'rejected'  => 'error',
                    'comment'   => 'warning',
                    default     => 'info',
                },
                'total'  => (float) $o->total,
            ]);

        $recentActivities = $recPharmacies->concat($recOrdonnances)
            ->sortByDesc('time')->values()->take(10)->toArray();

        // ── Données 7 derniers jours ───────────────────────────────────────────
        $weeklyData = collect(range(6, 0))->map(function ($i) use ($now) {
            $day = $now->copy()->subDays($i);
            return [
                'day'         => $day->locale('fr')->isoFormat('ddd'),
                'ordonnances' => Ordonance::whereDate('created_at', $day)->count(),
                'pharmacies'  => Pharmacie::whereDate('created_at', $day)->count(),
                'ca'          => (float) Ordonance::where('status', 'processed')
                    ->whereDate('created_at', $day)->sum('total'),
            ];
        })->toArray();

        // ── Catégories produits ────────────────────────────────────────────────
        $categoriesStats = Produit::selectRaw('categorie, COUNT(*) as count')
            ->groupBy('categorie')->orderByDesc('count')->limit(6)
            ->get()->map(fn($c) => ['name' => $c->categorie, 'value' => $c->count])->toArray();

        return Inertia::render('Administration/Dashboard/index', compact(
            'pharmacies',
            'ordonnances',
            'produits',
            'monthlyStats',
            'growthStats',
            'ordonnancesStats',
            'livraisonsStats',
            'pharmaciesStats',
            'chiffreAffaires',
            'caThisMonth',
            'caLastMonth',
            'topPharmacies',
            'recentActivities',
            'weeklyData',
            'categoriesStats'
        ));
    }

public function pharmacie()
{
    $pharmacies = Pharmacie::withCount(['ordonances', 'ordonances as ordonances_processed_count' => function($q) {
            $q->where('status', 'processed');
        }])
        ->orderByDesc('created_at')
        ->paginate(10);

    return Inertia::render('Administration/Dashboard/Pharmacie/index', [
        'pharmacies' => $pharmacies,
    ]);
}
    public function ordonnance()
{
    $ordonnances = Ordonance::with(['user', 'pharmacie', 'produits'])
        ->withCount('produits')
        ->orderByDesc('created_at')
        ->paginate(10);


    $stats = [
        'total'     => Ordonance::count(),
        'pending'   => Ordonance::where('status', 'pending')->count(),
        'processed' => Ordonance::where('status', 'processed')->count(),
        'rejected'  => Ordonance::where('status', 'rejected')->count(),
        'to_create' => Ordonance::where('status', 'to_create')->count(),
        'comment'   => Ordonance::where('status', 'comment')->count(),
        'ca_total'  => (float) Ordonance::where('status', 'processed')->sum('total'),
        'ca_mois'   => (float) Ordonance::where('status', 'processed')
                            ->whereMonth('created_at', now()->month)
                            ->whereYear('created_at',  now()->year)
                            ->sum('total'),
  
        'en_pharmacie'       => Ordonance::where('statut_livraison', 'En Pharmacie')->count(),
        'livraison_express'  => Ordonance::where('statut_livraison', 'Livraison express')->count(),
        'livraison_standard' => Ordonance::where('statut_livraison', 'Livraison Standard')->count(),
        'livraison_gratuite' => Ordonance::where('statut_livraison', 'Livraison Gratuite')->count(),
    ];

    return Inertia::render('Administration/Dashboard/Ordonnance/index', [
        'ordonnances' => $ordonnances,
        'stats'       => $stats,
    ]);
}
public function updateOrdonnanceStatus(Request $request)
{
    $request->validate([
        'id'     => ['required', 'integer', 'exists:ordonances,id'],
        'status' => ['required', 'in:pending,processed,rejected,to_create,comment'],
    ]);

    $ordonnance = Ordonance::findOrFail($request->id);
    $ordonnance->update([
        'status'      => $request->status,
        'approuve_par'=> in_array($request->status, ['processed','rejected']) ? Auth::id() : $ordonnance->approuve_par,
    ]);

    return back();
}
    public function produit()
    {
        $produit = Produit::orderByDesc('created_at')->paginate(10);

        return Inertia::render('Administration/Dashboard/Produit/index', [
            'produit' => $produit
        ]);
    }

    public function utilisateur()
    {
        $superAdminUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'super admin');
        })->paginate(10);

        return view('super-admin.utilisateur.super-admin', [
            'users' => $superAdminUsers
        ]);
    }
    public function phramacieBlocked(Pharmacie $pharmacie)
    {
        $pharmacie->update([
            'is_blocked' => $pharmacie->is_blocked ? false : true
        ]);

        return back()->with('success', 'La pharmacie a été bloqué avec success');
    }
    public function showPharmacie(pharmacie $pharmacie)
    {
        $users = $pharmacie->users()->get();
        $ordonnances = $pharmacie->ordonances()->get();

        $ordonnancesParMois = $ordonnances->groupBy(function ($ordonnance) {
            return \Carbon\Carbon::parse($ordonnance->created_at)->format('Y-m'); 
        });

       
        $ordonnancesCountParMois = $ordonnancesParMois->map(function ($monthGroup) {
            return $monthGroup->count();
        });

        // Récupérer les produits recherchés par mois
        $searchedProducts = DB::table('searched_products')
            ->join('ordonances', 'searched_products.ordonance_id', '=', 'ordonances.id')
            ->where('ordonances.pharmacie_id', $pharmacie->id)
            ->selectRaw('YEAR(searched_products.created_at) as year, MONTH(searched_products.created_at) as month, COUNT(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year', 'ASC')
            ->orderBy('month', 'ASC')
            ->get();

        // Organiser les données des produits recherchés par mois dans un format similaire aux ordonnances
        $searchedProductsCountParMois = $searchedProducts->mapWithKeys(function ($item) {
            return [
                $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT) => $item->count
            ];
        });

        // Comptage des ordonnances
        $nbOrdonnance = $ordonnances->count();

        // Comptage des produits associés à la pharmacie (en tenant compte des multiples produits par enregistrement)
        $nombreProduits = DB::table('pharmacie_produits')
            ->where('pharmacie_id', $pharmacie->id)
            ->get()
            ->map(function ($record) {
                // Séparer les produits par le délimiteur ';' ou ',' et compter les éléments distincts
                $produits = preg_split('/[;,]+/', $record->produit_id);
                return count(array_filter($produits)); // Compter le nombre de produits après avoir filtré les vides
            })
            ->sum(); // Totaliser le nombre de produits

        // Pour tester les données


        // Passer les données au view
        return view('super-admin.pharmacie.show', [
            'pharmacie' => $pharmacie,
            'users' => $users,
            'ordonnancesCountParMois' => $ordonnancesCountParMois,
            'searchedProductsCountParMois' => $searchedProductsCountParMois,
            'nbOrdonnance' => $nbOrdonnance,
            'nombreProduits' => $nombreProduits,  // Passer la donnée au view
        ]);
    }
    public function showOrdonnance(ordonance $ordonance)
    {
        $produits = $ordonance->produits;
        $searched_product = Searched_product::whereIn('produit_id', $produits->pluck('id'))
            ->where('ordonance_id', $ordonance->id)
            ->get();

        return view('super-admin.ordonnance.show', [
            'ordonnance' => $ordonance,
            'produits' => $produits,
            'searched_product' => $searched_product
        ]);
    }
    public function produitCreate()
    {


        return view('super-admin.produit.create');
    }
    public function produitCreateAdd(ProduitaddRequest   $produitaddRequest)
    {
        $produit = new Produit();


        if ($produitaddRequest->hasFile('images')) {
            $imagePath = $produitaddRequest->file('images')->store('produits', 'public');
            $produit->images = $imagePath;
        }

        // Enregistrement des autres champs
        $produit->produit = $produitaddRequest->produit;
        $produit->categorie = $produitaddRequest->categorie;
        $produit->sous_categorie = $produitaddRequest->sous_categorie;
        $produit->forme = $produitaddRequest->forme;
        $produit->dosage = $produitaddRequest->dosage;
        $produit->save();

        return redirect()->route('superAdmin.produit')->with('success', 'Le produit a été ajouté avec succès');
    }
    public function produitEdit(produit $produit)
    {
        return view('super-admin.produit.edit', [
            'produit' => $produit
        ]);
    }
    public function produitUpdate(Request $request, Produit $produit)
    {
        $request->validate([
            'images' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'produit' => [
                'required',
                'string',
                'max:255',
                Rule::unique('produits', 'produit')->ignore($produit->id),
            ],
            'sous_categorie' => 'nullable|string|max:255',
            'categorie' => 'nullable|string|max:255',
            'dosage' => 'nullable|string|max:255',
            'forme' => 'nullable|string|max:255',
        ]);

        // Gestion de l'image
        if ($request->hasFile('images')) {
            $imagePath = $request->file('images')->store('produits', 'public');
            // Supprimer l'ancienne image si elle existe
            if ($produit->images) {
                Storage::disk('public')->delete($produit->images);
            }
            $produit->images = $imagePath;
        }

        // Mise à jour des données
        $produit->update([
            'produit' => $request->produit,
            'sous_categorie' => $request->sous_categorie,
            'categorie' => $request->categorie,
            'dosage' => $request->dosage,
            'forme' => $request->forme,
        ]);

        return redirect()->route('superAdmin.produit')->with('success', 'Produit mis à jour avec succès !');
    }
    public function produitDelete(produit $produit)
    {

        if ($produit->images) {
            Storage::disk('public')->delete($produit->images);
        }

        // Supprimer le produit
        $produit->delete();

        return redirect()->back()->with('success', 'Produit supprimé avec succès !');
    }
    // public function envoyer(fromSendMailRequest $fromSendMailRequest)
    // {
    //     $data = $fromSendMailRequest->validated();
    //     $email = $data['email'];
    //     $nom = $data['name'];
    //     $user = User::where('email', $email)->first();

    //     if (!$user) {
    //         $password = Str::random(10);
    //         $user = User::create([
    //             'nom' => $nom,
    //             'email' => $email,
    //             'password' => bcrypt($password),
    //         ]);
    //         $user->assignRole('super admin');
    //     } else {
    //         $password = 'Mot de passe déjà existant';
    //     }

    //     Mail::to($email)->send(new superAdminInvite($email, $password));
    //     $user->save();
    //     return back()->with('success', 'L\'invitation a été envoyée avec succès');
    // }
    public function block(User $user)
    {
        $user->update(['status' => 'inactive']);

        return redirect()->back()->with('success', 'L’utilisateur a été bloqué avec succès.');
    }

    public function unblock(User $user)
    {
        $user->update(['status' => 'active']);

        return redirect()->back()->with('success', 'L’utilisateur a été débloqué avec succès.');
    }


    public function rejected(Ordonance $ordonance)
    {
        if ($ordonance->status === 'rejected') {
            return redirect()->back()->with('warning', 'Cette ordonnance a déjà été rejectée !');
        }



        $rejected = $ordonance->update([
            'status' => 'rejected',

        ]);
        $userOrdn = $ordonance->user;
        $pharmacie = $ordonance->pharmacie;
        // if ($rejected) {
        //     $userOrdn->notify(new PharmacieMailSmsNotification($pharmacie, $userOrdn));
        // }
        return redirect()->back()->with('success', 'L\'ordonnance a été rejectée avec succès !');
    }
    public function comment(Ordonance $ordonance)
    {
        if ($ordonance->status === 'comment') {
            return redirect()->back()->with('warning', 'Cette ordonnance a déjà été relencée" !');
        }



        $comment = $ordonance->update([
            'status' => 'comment',

        ]);
        $userOrdn = $ordonance->user;
        $pharmacie = $ordonance->pharmacie;
        // if ($comment) {
        //     $userOrdn->notify(new PharmacieMailSmsNotification($pharmacie, $userOrdn));
        // }
        return redirect()->back()->with('success', 'L\'ordonnance a été relancée avec succès !');
    }
    public function Ordonancerejected(ordonance $ordonance)
    {
        if ($ordonance->status === 'rejected') {
            return redirect()->back()->with('warning', 'Cette ordonnance a déjà été rejectée !');
        }



        $rejected = $ordonance->update([
            'status' => 'rejected',

        ]);
        $userOrdn = $ordonance->user;
        $pharmacie = $ordonance->pharmacie;
        // if ($rejected) {
        //     $userOrdn->notify(new PharmacieMailSmsNotification($pharmacie, $userOrdn));
        // }
        return redirect()->back()->with('success', 'L\'ordonnance a été rejectée avec succès !');
    }

    public function Ordonancecomment(ordonance $ordonance)
    {
        if ($ordonance->status === 'comment') {
            return redirect()->back()->with('warning', 'Cette ordonnance a déjà été relencée" !');
        }



        $comment = $ordonance->update([
            'status' => 'comment',

        ]);
        $userOrdn = $ordonance->user;
        $pharmacie = $ordonance->pharmacie;
        // if ($comment) {
        //     $userOrdn->notify(new PharmacieMailSmsNotification($pharmacie, $userOrdn));
        // }
        return redirect()->back()->with('success', 'L\'ordonnance a été relancée avec succès !');
    }

     public function updateStatut(Request $request)
    {
        $request->validate([
            'id'     => ['required', 'integer', 'exists:pharmacies,id'],
            'statut' => ['required', 'in:active,inactive'],
        ]);

        $pharmacie = Pharmacie::findOrFail($request->id);

        // Impossible de modifier une pharmacie bloquée
        if ($pharmacie->is_blocked) {
            return back()->withErrors(['statut' => 'Cette pharmacie est bloquée. Débloquez-la d\'abord.']);
        }

        $pharmacie->update([
            'statut'        => $request->statut,
            // Si on désactive, on ferme aussi automatiquement
            'disponibilite' => $request->statut === 'inactive' ? 'closed' : $pharmacie->disponibilite,
        ]);

        return back();
    }

    // ── Changer la disponibilité (open / closed) ───────────────────────────
    public function updateDisponibilite(Request $request)
    {
        $request->validate([
            'id'            => ['required', 'integer', 'exists:pharmacies,id'],
            'disponibilite' => ['required', 'in:open,closed'],
        ]);

        $pharmacie = Pharmacie::findOrFail($request->id);

        if ($pharmacie->is_blocked) {
            return back()->withErrors(['disponibilite' => 'Cette pharmacie est bloquée.']);
        }

        if ($pharmacie->statut !== 'active') {
            return back()->withErrors(['disponibilite' => 'Activez la pharmacie avant de changer sa disponibilité.']);
        }

        $pharmacie->update(['disponibilite' => $request->disponibilite]);

        return back();
    }

    // ── Bloquer / Débloquer ────────────────────────────────────────────────
    public function toggleBlock(Request $request)
    {
        $request->validate([
            'id'         => ['required', 'integer', 'exists:pharmacies,id'],
            'is_blocked' => ['required', 'boolean'],
        ]);

        $pharmacie = Pharmacie::findOrFail($request->id);

        $pharmacie->update([
            'is_blocked'    => $request->is_blocked,
            // Quand on bloque : fermer et désactiver automatiquement
            'statut'        => $request->is_blocked ? 'inactive'  : $pharmacie->statut,
            'disponibilite' => $request->is_blocked ? 'closed'    : $pharmacie->disponibilite,
        ]);

        return back();
    }

    // ── Supprimer ──────────────────────────────────────────────────────────
    public function destroy(Pharmacie $pharmacie)
    {
        // Supprimer le logo et l'image si présents
        if ($pharmacie->logo) {
        Storage::disk('public')->delete($pharmacie->logo);
        }
        if ($pharmacie->image) {
            Storage::disk('public')->delete($pharmacie->image);
        }

        $pharmacie->delete();

        return back();
    }
}

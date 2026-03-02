<?php

namespace App\Http\Controllers;

use App\Http\Requests\formEditPharmacieRequest;
use App\Http\Requests\FromSendMailRequest;
use App\Models\Pharmacie;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class PharmacieController extends Controller
{
    public function index()
    {
      
        $userAuthId = Auth::id();
        $currentUser = User::find($userAuthId);
        $pharmacie = $currentUser->pharmacie;

    
        $images = json_decode($pharmacie->image, true);
     $users = User::where('pharmacie_id', $pharmacie->id)
    ->whereHas('roles', function ($query) {
        $query->whereIn('name', ['pharmacy', 'admin']);
    })
    ->with('roles') // 🔥 IMPORTANT
    ->get();
$roles = Role::select('id', 'name')
    ->whereNotIn('name', ['Hyper Admin', 'Client','Super Admin'])
    ->get();

        return Inertia::render('Phamacie/Index', [
            'pharmacie' => $pharmacie,
            'images' => $images,
            'users' => $users,
            'roles' => $roles,
        ]);
    }
    public function invite(Pharmacie $pharmacie)
    {
        $user = User::where('pharmacie_id', $pharmacie->id)->get();

        return Inertia::render('Phamacie/Invite', [
            'pharmacie' => $pharmacie,
            'users' => $user
        ]);
    }

    /**
     * Synchronise les rôles d'un utilisateur.
     * Reçoit un tableau d'ids de rôles via POST et met à jour
     * l'utilisateur avec `syncRoles` de Spatie.
     */
    public function updateUserRoles(User $user, Request $request)
    {
        $data = $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'integer|exists:roles,id',
        ]);

        // récupérer les noms de rôles correspondants aux ids
        $roleNames = Role::whereIn('id', $data['roles'])->pluck('name')->toArray();

        $user->syncRoles($roleNames);

        // retourner une réponse JSON pour Inertia
        return back()->with('success', 'Rôles mis à jour avec succès.');
    }
    public function envoyer(Pharmacie $pharmacie, FromSendMailRequest $fromSendMailRequest)
    {
        $data = $fromSendMailRequest->validated();
        $email = $data['email'];
        $nom = $data['name'];

        $user = User::where('email', $email)->first();


        if (!$user) {
            $password = Str::random(10);
            $user = User::create([
                'nom' => $nom,
                'email' => $email,
                'pharmacie_id' => $pharmacie->id,
                'password' => bcrypt($password),
                'user_type'=>'pharmacy'
            ]);
            $user->assignRole('pharmacy');
        } else {
            $password = 'Mot de passe déjà existant';
        }


       

        return back()->with('success', 'Votre Email a bien été envoyé et le compte utilisateur a été créé.');
    }
    public function edit(pharmacie $pharmacie)
    {
        $images = json_decode($pharmacie->image, true);
        return Inertia::render('dashboard.Phamacie.edit', [
            'pharmacie' => $pharmacie,
            'images' => $images,
        ]);
    }
    private function handleMultipleImageUpload($images)
    {
        $storedPaths = [];

        if ($images) {
            foreach ($images as $image) {
                if ($image && $image->isValid()) {
                    $storedPaths[] = $image->store('images', 'public');
                }
            }
        }

        return $storedPaths;
    }
    private function handleImageUpload($image)
    {
        if ($image && $image->isValid()) {
            return $image->store('images', 'public');
        }
        return null;
    }
    public function update(pharmacie $pharmacie, formEditPharmacieRequest $formEditPharmacieRequest)
    {
        $data = $formEditPharmacieRequest->validated();

        $pharmacie->name = $data['Pharmacie'];
        $pharmacie->adresse = $data['Adresse'];
        $pharmacie->tel = $data['Telephone'];
        $pharmacie->description = $data['description'] ?? $pharmacie->description;

        // handle logo upload
        if ($formEditPharmacieRequest->hasFile('logo')) {
            if ($pharmacie->logo) {
                Storage::delete($pharmacie->logo);
            }
            $pharmacie->logo = $this->handleImageUpload($formEditPharmacieRequest->file('logo'));
        }

        // prepare existing images array
        $existingImages = is_array($pharmacie->image)
            ? $pharmacie->image
            : (json_decode($pharmacie->image, true) ?: []);

        // remove images marked as deleted (frontend sends full preview URL like /storage/...) 
        if ($formEditPharmacieRequest->filled('deleted_images')) {
            $deleted = json_decode($formEditPharmacieRequest->input('deleted_images'), true) ?: [];
            foreach ($deleted as $del) {
                // normalize path to storage relative path
                $delPath = preg_replace('#^/storage/#', '', $del);
                $key = array_search($delPath, $existingImages);
                if ($key !== false) {
                    Storage::delete($existingImages[$key]);
                    unset($existingImages[$key]);
                } else {
                    // sometimes previews include full URL or other variants; try to match by basename
                    $basename = basename($delPath);
                    foreach ($existingImages as $k => $img) {
                        if (basename($img) === $basename) {
                            Storage::delete($img);
                            unset($existingImages[$k]);
                        }
                    }
                }
            }
            $existingImages = array_values($existingImages);
        }

        // handle newly uploaded gallery images (frontend sends image[])
        $newImagePaths = [];
        $uploaded = $formEditPharmacieRequest->file('image');
        if ($uploaded) {
            // ensure array
            if (!is_array($uploaded)) {
                $uploaded = [$uploaded];
            }
            foreach ($uploaded as $img) {
                if ($img && $img->isValid()) {
                    $newImagePaths[] = $img->store('images', 'public');
                }
            }
        }

        // merge remaining existing images with newly uploaded ones
        $finalImages = array_values(array_merge($existingImages, $newImagePaths));
        $pharmacie->image = json_encode($finalImages);

        $pharmacie->save();

        return back()->with('success', 'Pharmacie mise à jour avec succès.');
    }
    public function destroy(pharmacie $pharmacie)
    {
        // Vérifier s'il y a des ordonnances liées
        if ($pharmacie->ordonances()->count() > 0) {
            return back()
                ->with('error', 'Impossible de supprimer cette pharmacie car elle a des ordonnances liées.');
        }

        // Supprimer les utilisateurs qui ont un rôle 'pharmacy' ou 'admin' dans cette pharmacie
        $users = User::where('pharmacie_id', $pharmacie->id)
            ->whereHas('roles', function ($query) {
                $query->whereIn('name', ['pharmacy', 'admin']);
            })
            ->get();

        foreach ($users as $user) {
            $user->delete();
        }

        // Supprimer les images
        if ($pharmacie->image) {
            $images = json_decode($pharmacie->image, true);
            foreach ($images as $image) {
                Storage::delete($image);
            }
        }
        
        // Supprimer le logo
        if ($pharmacie->logo) {
            Storage::delete($pharmacie->logo);
        }

        // Supprimer la pharmacie
        $pharmacie->delete();

        return back()->with('success', 'Pharmacie supprimée avec succès.');
    }
    public function updateStatus(Request $request, Pharmacie $pharmacie)
    {
        $request->validate([

            'statut' => 'required|in:active,inactive',
        ]);

        $pharmacie->update([

            'statut' => $request->statut,
        ]);

        return redirect()->back()->with('success', 'Statut mis à jour avec succès.');
    }
    public function updateDisponibilite(Request $request, Pharmacie $pharmacie)
    {
        $request->validate([
            'disponibilite' => 'required|in:open,closed',

        ]);

        $pharmacie->update([
            'disponibilite' => $request->disponibilite,

        ]);

        return redirect()->back()->with('success', ' disponibilité mis à jour avec succès.');
    }
}

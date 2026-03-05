<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ParamettreController extends Controller
{
    public function utilisateur()
    {
        $superAdmins = User::with('roles')
            ->whereHas('roles', fn($q) => $q->where('name', 'super admin'))
            ->orderByDesc('created_at')
            ->paginate(10, ['*'], 'admins_page');

        $otherUsers = User::with('roles')
            ->whereDoesntHave('roles', fn($q) => $q->whereIn('name', ['super admin']))
            ->orderByDesc('created_at')
            ->paginate(10, ['*'], 'users_page');

        $stats = [
            'total_admins' => User::whereHas('roles', fn($q) => $q->where('name', 'super admin'))->count(),
            'total_users'  => User::whereDoesntHave('roles', fn($q) => $q->whereIn('name', ['super admin']))->count(),
            'actifs'       => User::where('status', 'active')->count(),
            'bloques'      => User::where('status', 'inactive')->count(),
        ];

        return Inertia::render('Administration/Dashboard/Paramettre/index', [
            'superAdmins' => $superAdmins,
            'otherUsers'  => $otherUsers,
            'stats'       => $stats,
        ]);
    }

    public function block(User $user)
    {
        $user->update(['status' => 'inactive']);
        return back();
    }

    public function unblock(User $user)
    {
        $user->update(['status' => 'active']);
        return back();
    }

    public function destroy(User $user)
    {
        // Empêcher la suppression de son propre compte ici
        if ($user->id === Auth::id()) {
            return back()->withErrors(['error' => 'Vous ne pouvez pas supprimer votre propre compte.']);
        }
        $user->delete();
        return back();
    }

    public function envoyer(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'name'  => ['required', 'string', 'max:255'],
        ]);

        $existing = User::where('email', $request->email)->first();

        if (!$existing) {
            $password = Str::random(10);
            $user = User::create([
                'nom'     => $request->name,
                'email'    => $request->email,
                'password' => bcrypt($password),
                'status'   => 'active',
            ]);
            $user->assignRole('super admin');
            // TODO: envoyer l'email avec $password
        } else {
            $existing->assignRole('super admin');
        }

        return back()->with('success', 'Invitation envoyée avec succès');
    }
}
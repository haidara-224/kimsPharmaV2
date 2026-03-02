<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IsblokedPharmacie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
    $userAuth = Auth::id();
        $user = User::find($userAuth);

        // Vérifier si l'utilisateur est un super admin
        if ($user->role === 'super admin') {
            // Laisser passer l'utilisateur si c'est un super admin
            return $next($request);
        }

        // Vérifier si l'utilisateur n'a pas de pharmacie et n'est pas un super admin
        if (!$user->pharmacie) {
            Auth::logout();
            return redirect()->route('login')->with('error', 'Vous n\'avez pas de pharmacie associée à votre compte.');
        }

        $pharmacie = $user->pharmacie;

        // Vérifier si la pharmacie est bloquée
        if ($pharmacie->is_blocked) {
            Auth::logout();
            return redirect()->route('login')->with('error', 'Votre pharmacie est bloquée. Contactez KimsPharma.');
        }

        return $next($request);
    }
}

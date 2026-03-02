<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class UserBlocked
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
           if (Auth::user() &&   Auth::user()->status==='inactive') {
            Auth::logout();
            return redirect()->route('login')->with('error', 'Votre compte est bloqué. Contactez l’administrateur.');
        }

        return $next($request);
    }
}

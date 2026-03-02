<?php

namespace App\Actions\Fortify;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\Request;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request)
    {
        $user = $request->user();

        if ($user && method_exists($user, 'hasAnyRole')) {
            if ($user->hasAnyRole(['hyper admin', 'super admin'])) {
                return redirect()->route('superAdmin.home');
            }

            if ($user->hasAnyRole(['admin', 'pharmacy'])) {
                return redirect()->route('dashboard.home');
            }
        }

        return redirect()->route('dashboard.home');
    }
}

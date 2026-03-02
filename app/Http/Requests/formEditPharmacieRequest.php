<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class formEditPharmacieRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'Pharmacie' => ['required', 'string'],
            'Adresse' => ['required', 'string'],
            'Telephone' => ['required', 'string'],
            'image' => ['nullable', 'array'],
            'image.*' => ['image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'description' => ['nullable', 'string'],
            'deleted_images' => ['nullable', 'string'], 
        ];
    }
}

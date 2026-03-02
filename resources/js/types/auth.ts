import { Pharmacie } from "."

export type User = {
  id: number

  // Infos principales
  nom: string
  email: string
  tel?: string | null

  // Auth
  password?: string // jamais renvoyé par l’API en pratique
  email_verified_at: string | null
  two_factor_enabled?: boolean

  // Pharmacie
  pharmacie_id?: number | null

  // Pièce / vérification
  fichier_piece?: string | null
  status_piece?: string

  // Rôle & statut
  user_type:  string
  status?:  string

  // UI
  avatar?: string | null

  // Relations (optionnelles)
  pharmacie?: Pharmacie

  // Timestamps
  created_at: string
  updated_at: string

  // Extension libre (Inertia / API)
  [key: string]: unknown
}


export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

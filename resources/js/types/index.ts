export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth, User } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
};
  
export interface Pharmacie{
    id:number,
name:string,
tel:string,
adresse:string,
description:string,
logo:string,
image:string,
coordonnees:string,
disponibilite:string,
statut:string,
is_blocked:boolean,
created_at:Date,
updated_at:Date,

}
export interface Ordonnance {
  id: number

  // Champs fillable
  patient: string
  age_patient: number | null
  numero: string
  fichier: string | null
  date_ord: string // ISO date (YYYY-MM-DD ou datetime)
  user_id: number
  total: number
  pharmacie_id: number
  status: 'en_attente' | 'approuve' | 'rejete' | string
  approuve_par: number | null
  frais_livraison: number | null
  feedback: string | null
  commentaire: string | null
  coordonees_livraison: string | null
  statut_livraison: 'en_attente' | 'en_cours' | 'livre' | string

  // Relations
  pharmacie?: Pharmacie
  produits?: Produit[]
  user?: User
  approuvePar?: User

  // Timestamps Laravel
  created_at?: string
  updated_at?: string
}
export interface Produit {
  id: number

  // Champs fillable
  produit: string
  categorie: string
  sous_categorie?: string | null
  forme?: string | null
  dosage?: string | null
  images?: string[] | null

  // Relations
  ordonances?: Ordonnance[]
  pharmacies?: Pharmacie[]

  // Pivot (relation many-to-many avec Ordonance)
  pivot?: {
    produit_id: number
    ordonance_id: number
  }

  // Timestamps Laravel
  created_at?: string
  updated_at?: string
}
export interface SearchedProduct {
  id: number
  ordonnance_id: number
  produit_id: number

  nom: string
  categorie: string
  sous_categorie?: string | null
  forme_dosage?: string | null

  prix_unitaire: number
  quantite: number
  prix_total: number

  images?: string[] | null
}



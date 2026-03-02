import { AlertCircle, MapPin, Navigation, Phone, Store } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { Pharmacie } from "@/types";
interface Propos{
    pharmacie:Pharmacie,
    handleInputChange:()=>void
}
export default function General({pharmacie,handleInputChange}:Propos) {
    const [isEditing, setIsEditing] = useState(false);

        const [formData, setFormData] = useState({
            Pharmacie: pharmacie.name || '',
            Adresse: pharmacie.adresse || '',
            Telephone: pharmacie.tel || '',
            description: pharmacie.description || '',
        });
         
    
    return <Card>
        <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
                Modifiez les informations de base de votre pharmacie
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                    <Label htmlFor="Pharmacie" className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        Nom de la pharmacie
                    </Label>
                    <Input
                        id="Pharmacie"
                        name="Pharmacie"
                        value={formData.Pharmacie}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Ex: Pharmacie Centrale"
                        className={!isEditing ? 'bg-muted' : ''}
                    />
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                    <Label htmlFor="Telephone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone
                    </Label>
                    <Input
                        id="Telephone"
                        name="Telephone"
                        value={formData.Telephone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Ex: +221 77 123 45 67"
                        className={!isEditing ? 'bg-muted' : ''}
                    />
                </div>

                {/* Adresse */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="Adresse" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Adresse
                    </Label>
                    <Input
                        id="Adresse"
                        name="Adresse"
                        value={formData.Adresse}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Ex: 123 Rue Principale, Dakar"
                        className={!isEditing ? 'bg-muted' : ''}
                    />
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Description
                    </Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Décrivez votre pharmacie..."
                        rows={4}
                        className={!isEditing ? 'bg-muted' : ''}
                    />
                </div>
            </div>

            {/* Coordonnées (affichage seulement) */}
            {pharmacie.coordonnees && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                        <Navigation className="h-4 w-4 text-primary" />
                        <span className="font-medium">Coordonnées GPS:</span>
                        <span className="text-muted-foreground">{pharmacie.coordonnees}</span>
                    </div>
                </div>
            )}
        </CardContent>
    </Card>

}
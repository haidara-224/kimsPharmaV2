import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pharmacie } from '@/types';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from './ui/button';

interface PharmaciesMapProps {
  pharmacies: Pharmacie[];
}

export function PharmaciesMap({ pharmacies }: PharmaciesMapProps) {
  // Compter les pharmacies avec coordonnées GPS
  const withCoordinates = pharmacies.filter(p => p.coordonnees).length;

  return (
    <Card className="border-0 shadow-lg sticky top-4">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Carte des pharmacies
        </CardTitle>
        <CardDescription>
          {withCoordinates} pharmacie(s) avec coordonnées GPS
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Navigation className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Carte interactive</h3>
            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
              Visualisez toutes les pharmacies sur une carte interactive
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              Ouvrir la carte
            </Button>
          </div>
        </div>

        {/* Liste rapide des coordonnées */}
        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
          {pharmacies.filter(p => p.coordonnees).map((pharmacie, index) => (
            <div key={pharmacie.id} className="p-2 bg-muted/30 rounded-lg text-sm">
              <p className="font-medium truncate">{pharmacie.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {pharmacie.coordonnees}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
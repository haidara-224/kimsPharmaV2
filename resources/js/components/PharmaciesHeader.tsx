import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Download, Plus, RefreshCw, FileSpreadsheet, FileText, ChevronDown, File } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pharmacie } from '@/types';

interface PharmaciesHeaderProps {
  total: number;
  pharmacies: Pharmacie[];
}

export function PharmaciesHeader({ total, pharmacies }: PharmaciesHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['ID','Nom','Téléphone','Adresse','Statut','Disponibilité','Bloquée','Coordonnées','Date inscription'];
      const rows = pharmacies.map(p => [
        p.id, p.name, p.tel || '', p.adresse || '',
        p.statut === 'active' ? 'Active' : 'Inactive',
        p.disponibilite === 'open' ? 'Ouverte' : 'Fermée',
        p.is_blocked ? 'Oui' : 'Non',
        p.coordonnees || '',
        p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '',
      ]);
      const csv = [headers, ...rows]
        .map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(';'))
        .join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `pharmacies_${today()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } finally { setIsExporting(false); }
  };

  const exportExcel = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      const data = pharmacies.map(p => ({
        'ID': p.id, 'Nom': p.name, 'Téléphone': p.tel || '',
        'Adresse': p.adresse || '',
        'Statut': p.statut === 'active' ? 'Active' : 'Inactive',
        'Disponibilité': p.disponibilite === 'open' ? 'Ouverte' : 'Fermée',
        'Bloquée': p.is_blocked ? 'Oui' : 'Non',
        'Coordonnées GPS': p.coordonnees || '',
        'Description': p.description || '',
        'Date inscription': p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [
        {wch:6},{wch:30},{wch:16},{wch:35},
        {wch:12},{wch:14},{wch:10},{wch:22},{wch:35},{wch:18},
      ];
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let c = range.s.c; c <= range.e.c; c++) {
        const ref = XLSX.utils.encode_cell({ r:0, c });
        if (ws[ref]) ws[ref].s = {
          font: { bold:true, color:{rgb:'FFFFFF'} },
          fill: { fgColor:{rgb:'4F46E5'} },
          alignment: { horizontal:'center' },
        };
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pharmacies');
      const summary = XLSX.utils.aoa_to_sheet([
        ['Rapport — Pharmacies'],
        ['Généré le', new Date().toLocaleDateString('fr-FR', { dateStyle:'full' })],
        [],
        ['Indicateur','Valeur'],
        ['Total', pharmacies.length],
        ['Actives',   pharmacies.filter(p => p.statut === 'active').length],
        ['Inactives', pharmacies.filter(p => p.statut === 'inactive').length],
        ['Ouvertes',  pharmacies.filter(p => p.disponibilite === 'open').length],
        ['Fermées',   pharmacies.filter(p => p.disponibilite === 'closed').length],
        ['Bloquées',  pharmacies.filter(p => p.is_blocked).length],
      ]);
      summary['!cols'] = [{wch:20},{wch:20}];
      XLSX.utils.book_append_sheet(wb, summary, 'Résumé');
      XLSX.writeFile(wb, `pharmacies_${today()}.xlsx`);
    } finally { setIsExporting(false); }
  };


  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF }    = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const now   = new Date().toLocaleDateString('fr-FR', { dateStyle: 'full' });

     
      doc.setFillColor(79, 70, 229); // indigo-600
      doc.rect(0, 0, pageW, 28, 'F');

      // Titre
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text('Rapport — Pharmacies', 14, 12);

      // Sous-titre
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Généré le ${now}  ·  ${pharmacies.length} pharmacie${pharmacies.length > 1 ? 's' : ''}`, 14, 20);

      // Logo textuel à droite
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('PharmAdmin', pageW - 14, 16, { align: 'right' });

      const actives   = pharmacies.filter(p => p.statut === 'active').length;
      const ouvertes  = pharmacies.filter(p => p.disponibilite === 'open').length;
      const bloquees  = pharmacies.filter(p => p.is_blocked).length;
      const inactives = pharmacies.filter(p => p.statut === 'inactive').length;

      const kpis = [
        { label: 'Total',     value: pharmacies.length, color: [79, 70, 229]  as [number,number,number] },
        { label: 'Actives',   value: actives,            color: [16, 185, 129] as [number,number,number] },
        { label: 'Ouvertes',  value: ouvertes,           color: [59, 130, 246] as [number,number,number] },
        { label: 'Inactives', value: inactives,          color: [148,163,184]  as [number,number,number] },
        { label: 'Bloquées',  value: bloquees,           color: [239, 68, 68]  as [number,number,number] },
      ];

      const cardW = (pageW - 28 - (kpis.length - 1) * 4) / kpis.length;
      kpis.forEach((kpi, i) => {
        const x = 14 + i * (cardW + 4);
        const y = 33;
        // Fond carte
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, y, cardW, 20, 2, 2, 'F');
        // Barre colorée en haut
        doc.setFillColor(...kpi.color);
        doc.roundedRect(x, y, cardW, 2.5, 1, 1, 'F');
        // Valeur
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...kpi.color);
        doc.text(String(kpi.value), x + cardW / 2, y + 11, { align: 'center' });
        // Label
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, x + cardW / 2, y + 17, { align: 'center' });
      });

      // ── Tableau ───────────────────────────────────────────────────────────
      autoTable(doc, {
        startY: 60,
        head: [['#','Nom','Téléphone','Adresse','Statut','Disponibilité','Bloquée','Inscription']],
        body: pharmacies.map(p => [
          p.id,
          p.name,
          p.tel || '—',
          p.adresse || '—',
          p.statut === 'active' ? 'Active' : 'Inactive',
          p.disponibilite === 'open' ? 'Ouverte' : 'Fermée',
          p.is_blocked ? 'Oui' : 'Non',
          p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—',
        ]),
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
          lineColor: [226, 232, 240],
          lineWidth: 0.3,
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8.5,
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'center' },
          7: { halign: 'center' },
        },
        // Coloriser les cellules selon statut
        didParseCell(data) {
          if (data.section === 'body') {
            if (data.column.index === 4) {
              data.cell.styles.textColor = data.cell.raw === 'Active'
                ? [16, 185, 129] : [148, 163, 184];
              data.cell.styles.fontStyle = 'bold';
            }
            if (data.column.index === 5) {
              data.cell.styles.textColor = data.cell.raw === 'Ouverte'
                ? [59, 130, 246] : [148, 163, 184];
              data.cell.styles.fontStyle = 'bold';
            }
            if (data.column.index === 6 && data.cell.raw === 'Oui') {
              data.cell.styles.textColor = [239, 68, 68];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        margin: { left: 14, right: 14 },
      });


      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pH = doc.internal.pageSize.getHeight();
        doc.setDrawColor(226, 232, 240);
        doc.line(14, pH - 10, pageW - 14, pH - 10);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text('PharmAdmin — Rapport confidentiel', 14, pH - 5);
        doc.text(`Page ${i} / ${totalPages}`, pageW - 14, pH - 5, { align: 'right' });
      }

      doc.save(`pharmacies_${today()}.pdf`);
    } finally { setIsExporting(false); }
  };


  const exportJSON = () => {
    setIsExporting(true);
    try {
      const data = pharmacies.map(p => ({
        id: p.id, nom: p.name, telephone: p.tel, adresse: p.adresse,
        description: p.description, statut: p.statut,
        disponibilite: p.disponibilite, bloquee: p.is_blocked,
        coordonnees: p.coordonnees, created_at: p.created_at,
      }));
      const blob = new Blob(
        [JSON.stringify({ exported_at: new Date().toISOString(), total: data.length, pharmacies: data }, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href = url; a.download = `pharmacies_${today()}.json`; a.click();
      URL.revokeObjectURL(url);
    } finally { setIsExporting(false); }
  };

  const today = () => new Date().toISOString().slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Pharmacies
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {total} pharmacie{total > 1 ? 's' : ''} enregistrée{total > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2" disabled={isExporting}>
              {isExporting
                ? <RefreshCw className="h-4 w-4 animate-spin" />
                : <Download className="h-4 w-4" />}
              Exporter
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {pharmacies.length} pharmacie{pharmacies.length > 1 ? 's' : ''} à exporter
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* PDF */}
            <DropdownMenuItem onClick={exportPDF} className="gap-3 cursor-pointer">
              <div className="p-1.5 bg-red-50 dark:bg-red-950/30 rounded">
                <File className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">PDF (.pdf)</p>
                <p className="text-xs text-muted-foreground">Rapport mis en page</p>
              </div>
            </DropdownMenuItem>

            {/* Excel */}
            <DropdownMenuItem onClick={exportExcel} className="gap-3 cursor-pointer">
              <div className="p-1.5 bg-green-50 dark:bg-green-950/30 rounded">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Excel (.xlsx)</p>
                <p className="text-xs text-muted-foreground">Avec feuille résumé</p>
              </div>
            </DropdownMenuItem>

            {/* CSV */}
            <DropdownMenuItem onClick={exportCSV} className="gap-3 cursor-pointer">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 rounded">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">CSV (.csv)</p>
                <p className="text-xs text-muted-foreground">Compatible Excel</p>
              </div>
            </DropdownMenuItem>

            {/* JSON */}
            <DropdownMenuItem onClick={exportJSON} className="gap-3 cursor-pointer">
              <div className="p-1.5 bg-purple-50 dark:bg-purple-950/30 rounded">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">JSON (.json)</p>
                <p className="text-xs text-muted-foreground">Format brut API</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.reload()}>
          <RefreshCw className="h-4 w-4" /> Actualiser
        </Button>

        
      </div>
    </motion.div>
  );
}
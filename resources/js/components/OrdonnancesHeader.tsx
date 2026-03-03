import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, RefreshCw, ChevronDown, FileSpreadsheet, File } from 'lucide-react';
import { router } from '@inertiajs/react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ordonnance } from '@/types';

const today = () => new Date().toISOString().slice(0, 10);

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente', processed: 'Traitée', rejected: 'Rejetée',
  to_create: 'À créer', comment: 'Commentaire',
};
const LIVRAISON_LABEL: Record<string, string> = {
  'En Pharmacie': 'En Pharmacie', 'Livraison Gratuite': 'Gratuite',
  'Livraison express': 'Express', 'Livraison Standard': 'Standard',
};

export function OrdonnancesHeader({ total, ordonnances }: { total: number; ordonnances: Ordonnance[] }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['#','Numéro','Patient','Âge','Pharmacie','Statut','Livraison','Total','Frais livr.','Date'];
      const rows = ordonnances.map(o => [
        o.id, o.numero, o.patient, o.age_patient ?? '',
        o.pharmacie?.name ?? '—',
        STATUS_LABEL[o.status] ?? o.status,
        LIVRAISON_LABEL[o.statut_livraison] ?? o.statut_livraison,
        o.total, o.frais_livraison ?? 0,
        o.date_ord ? new Date(o.date_ord).toLocaleDateString('fr-FR') : '',
      ]);
      const csv = [headers, ...rows]
        .map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(';')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: `ordonnances_${today()}.csv` });
      a.click(); URL.revokeObjectURL(url);
    } finally { setIsExporting(false); }
  };

  const exportExcel = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      const data = ordonnances.map(o => ({
        'ID': o.id, 'Numéro': o.numero, 'Patient': o.patient, 'Âge': o.age_patient ?? '',
        'Pharmacie': o.pharmacie?.name ?? '—',
        'Statut': STATUS_LABEL[o.status] ?? o.status,
        'Livraison': LIVRAISON_LABEL[o.statut_livraison] ?? o.statut_livraison,
        'Total (GNF)': o.total, 'Frais livraison': o.frais_livraison ?? 0,
        'Date ordonnance': o.date_ord ? new Date(o.date_ord).toLocaleDateString('fr-FR') : '',
        'Commentaire': o.commentaire ?? '', 'Feedback': o.feedback ?? '',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{wch:6},{wch:16},{wch:22},{wch:6},{wch:26},{wch:14},{wch:18},{wch:14},{wch:14},{wch:16},{wch:30},{wch:30}];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ordonnances');
      XLSX.writeFile(wb, `ordonnances_${today()}.xlsx`);
    } finally { setIsExporting(false); }
  };

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF }     = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageW, 28, 'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(20); doc.setTextColor(255,255,255);
      doc.text('Rapport — Ordonnances', 14, 12);
      doc.setFontSize(9); doc.setFont('helvetica','normal');
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', {dateStyle:'full'})}  ·  ${ordonnances.length} ordonnance${ordonnances.length>1?'s':''}`, 14, 20);
      doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text('PharmAdmin', pageW - 14, 16, { align: 'right' });

      // KPIs
      const kpis = [
        { label: 'Total',      value: ordonnances.length,                                    color: [16,185,129]  as [number,number,number] },
        { label: 'Traitées',   value: ordonnances.filter(o=>o.status==='processed').length,  color: [59,130,246]  as [number,number,number] },
        { label: 'En attente', value: ordonnances.filter(o=>o.status==='pending').length,    color: [245,158,11]  as [number,number,number] },
        { label: 'Rejetées',   value: ordonnances.filter(o=>o.status==='rejected').length,   color: [239,68,68]   as [number,number,number] },
        { label: 'CA (GNF)',   value: ordonnances.filter(o=>o.status==='processed').reduce((s,o)=>s+Number(o.total),0).toLocaleString('fr-FR'), color: [168,85,247] as [number,number,number] },
      ];
      const cW = (pageW - 28 - 16) / kpis.length;
      kpis.forEach((k, i) => {
        const x = 14 + i*(cW+4), y = 33;
        doc.setFillColor(248,250,252); doc.roundedRect(x,y,cW,20,2,2,'F');
        doc.setFillColor(...k.color); doc.roundedRect(x,y,cW,2.5,1,1,'F');
        doc.setFontSize(13); doc.setFont('helvetica','bold'); doc.setTextColor(...k.color);
        doc.text(String(k.value), x+cW/2, y+11, { align:'center' });
        doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139);
        doc.text(k.label, x+cW/2, y+17, { align:'center' });
      });

      autoTable(doc, {
        startY: 60,
        head: [['#','Numéro','Patient','Pharmacie','Statut','Livraison','Total','Date']],
        body: ordonnances.map(o => [
          o.id, o.numero, o.patient,
          o.pharmacie?.name ?? '—',
          STATUS_LABEL[o.status] ?? o.status,
          LIVRAISON_LABEL[o.statut_livraison] ?? o.statut_livraison,
          Number(o.total).toLocaleString('fr-FR') + ' GNF',
          o.date_ord ? new Date(o.date_ord).toLocaleDateString('fr-FR') : '—',
        ]),
        styles: { fontSize:8, cellPadding:3, lineColor:[226,232,240], lineWidth:0.3 },
        headStyles: { fillColor:[16,185,129], textColor:255, fontStyle:'bold', halign:'center' },
        alternateRowStyles: { fillColor:[248,250,252] },
        columnStyles: { 0:{halign:'center',cellWidth:10}, 4:{halign:'center'}, 5:{halign:'center'}, 6:{halign:'right'}, 7:{halign:'center'} },
        didParseCell(d) {
          if (d.section==='body' && d.column.index===4) {
            const colors: Record<string,[number,number,number]> = {
              'Traitée':[16,185,129], 'En attente':[245,158,11], 'Rejetée':[239,68,68],
              'À créer':[59,130,246], 'Commentaire':[168,85,247],
            };
            if (colors[d.cell.raw as string]) {
              d.cell.styles.textColor = colors[d.cell.raw as string];
              d.cell.styles.fontStyle = 'bold';
            }
          }
        },
        margin: { left:14, right:14 },
      });

      const tp = (doc as any).internal.getNumberOfPages();
      for (let i=1; i<=tp; i++) {
        doc.setPage(i);
        const pH = doc.internal.pageSize.getHeight();
        doc.setDrawColor(226,232,240); doc.line(14,pH-10,pageW-14,pH-10);
        doc.setFontSize(7.5); doc.setTextColor(148,163,184); doc.setFont('helvetica','normal');
        doc.text('PharmAdmin — Rapport confidentiel', 14, pH-5);
        doc.text(`Page ${i} / ${tp}`, pageW-14, pH-5, { align:'right' });
      }
      doc.save(`ordonnances_${today()}.pdf`);
    } finally { setIsExporting(false); }
  };

  return (
    <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/20">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Ordonnances
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {total} ordonnance{total > 1 ? 's' : ''} enregistrée{total > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2" disabled={isExporting}>
              {isExporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exporter <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {ordonnances.length} ordonnance{ordonnances.length>1?'s':''} à exporter
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { label:'PDF (.pdf)',   desc:'Rapport mis en page', icon: File,            color:'red',    fn: exportPDF },
              { label:'Excel (.xlsx)',desc:'Toutes les colonnes', icon: FileSpreadsheet, color:'green',  fn: exportExcel },
              { label:'CSV (.csv)',   desc:'Compatible Excel',    icon: FileText,        color:'blue',   fn: exportCSV },
            ].map(({label,desc,icon:Icon,color,fn}) => (
              <DropdownMenuItem key={label} onClick={fn} className="gap-3 cursor-pointer">
                <div className={`p-1.5 bg-${color}-50 dark:bg-${color}-950/30 rounded`}>
                  <Icon className={`h-4 w-4 text-${color}-600`} />
                </div>
                <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.reload()}>
          <RefreshCw className="h-4 w-4" /> Actualiser
        </Button>
      </div>
    </motion.div>
  );
}
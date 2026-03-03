import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Package, Download, RefreshCw, Plus, ChevronDown, FileSpreadsheet, FileText, File } from 'lucide-react';
import { router } from '@inertiajs/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Produit } from '@/types';

const today = () => new Date().toISOString().slice(0,10);

export function ProduitsHeader({ total, produits, onAdd }: { total:number; produits:Produit[]; onAdd:()=>void }) {
  const [isExporting, setExporting] = useState(false);

  const exportCSV = () => {
    setExporting(true);
    try {
      const headers = ['ID','Nom','Catégorie','Sous-catégorie','Forme','Dosage','Nb images','Nb ordonnances','Nb pharmacies','Date'];
      const rows = produits.map(p => [
        p.id, p.produit, p.categorie, p.sous_categorie??'', p.forme??'', p.dosage??'',
        p.images?.length??0, (p as any).ordonances_count??0, (p as any).pharmacies_count??0,
        p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '',
      ]);
      const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(';')).join('\n');
      const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
      const a = Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:`produits_${today()}.csv`});
      a.click();
    } finally { setExporting(false); }
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import('xlsx');
      const data = produits.map(p=>({
        'ID':p.id,'Nom':p.produit,'Catégorie':p.categorie,
        'Sous-catégorie':p.sous_categorie??'','Forme':p.forme??'','Dosage':p.dosage??'',
        'Nb images':p.images?.length??0,
        'Nb ordonnances':(p as any).ordonances_count??0,
        'Nb pharmacies':(p as any).pharmacies_count??0,
        'Date':p.created_at?new Date(p.created_at).toLocaleDateString('fr-FR'):'',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols']=[{wch:6},{wch:30},{wch:20},{wch:20},{wch:15},{wch:15},{wch:12},{wch:16},{wch:16},{wch:14}];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'Produits');
      XLSX.writeFile(wb,`produits_${today()}.xlsx`);
    } finally { setExporting(false); }
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const {default:jsPDF}    = await import('jspdf');
      const {default:autoTable} = await import('jspdf-autotable');
      const doc = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
      const W = doc.internal.pageSize.getWidth();

      doc.setFillColor(168,85,247); doc.rect(0,0,W,28,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(20); doc.setTextColor(255,255,255);
      doc.text('Catalogue — Produits',14,12);
      doc.setFontSize(9); doc.setFont('helvetica','normal');
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR',{dateStyle:'full'})}  ·  ${produits.length} produit${produits.length>1?'s':''}`,14,20);
      doc.text('PharmAdmin',W-14,16,{align:'right'});

      const kpis = [
        {label:'Total',         value:produits.length,                                       color:[168,85,247]  as [number,number,number]},
        {label:'Catégories',    value:[...new Set(produits.map(p=>p.categorie))].length,     color:[59,130,246]  as [number,number,number]},
        {label:'Avec forme',    value:produits.filter(p=>p.forme).length,                    color:[16,185,129]  as [number,number,number]},
        {label:'Avec dosage',   value:produits.filter(p=>p.dosage).length,                   color:[245,158,11]  as [number,number,number]},
        {label:'Avec images',   value:produits.filter(p=>p.images?.length).length,           color:[239,68,68]   as [number,number,number]},
      ];
      const cW=(W-28-16)/kpis.length;
      kpis.forEach((k,i)=>{
        const x=14+i*(cW+4),y=33;
        doc.setFillColor(248,250,252); doc.roundedRect(x,y,cW,20,2,2,'F');
        doc.setFillColor(...k.color); doc.roundedRect(x,y,cW,2.5,1,1,'F');
        doc.setFontSize(14);doc.setFont('helvetica','bold');doc.setTextColor(...k.color);
        doc.text(String(k.value),x+cW/2,y+11,{align:'center'});
        doc.setFontSize(7);doc.setFont('helvetica','normal');doc.setTextColor(100,116,139);
        doc.text(k.label,x+cW/2,y+17,{align:'center'});
      });

      autoTable(doc,{
        startY:60,
        head:[['#','Nom','Catégorie','Sous-cat.','Forme','Dosage','Images','Ord.']],
        body:produits.map(p=>[
          p.id,p.produit,p.categorie,p.sous_categorie??'—',
          p.forme??'—',p.dosage??'—',p.images?.length??0,
          (p as any).ordonances_count??0,
        ]),
        styles:{fontSize:8,cellPadding:3,lineColor:[226,232,240],lineWidth:0.3},
        headStyles:{fillColor:[168,85,247],textColor:255,fontStyle:'bold',halign:'center'},
        alternateRowStyles:{fillColor:[248,250,252]},
        columnStyles:{0:{halign:'center',cellWidth:10},6:{halign:'center'},7:{halign:'center'}},
        margin:{left:14,right:14},
      });

      const tp=(doc as any).internal.getNumberOfPages();
      for(let i=1;i<=tp;i++){
        doc.setPage(i); const pH=doc.internal.pageSize.getHeight();
        doc.setDrawColor(226,232,240); doc.line(14,pH-10,W-14,pH-10);
        doc.setFontSize(7.5);doc.setTextColor(148,163,184);
        doc.text('PharmAdmin — Catalogue produits',14,pH-5);
        doc.text(`Page ${i} / ${tp}`,W-14,pH-5,{align:'right'});
      }
      doc.save(`produits_${today()}.pdf`);
    } finally { setExporting(false); }
  };

  return (
    <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20">
          <Package className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Produits
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {total} produit{total>1?'s':''} référencé{total>1?'s':''}
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2" disabled={isExporting}>
              {isExporting ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Download className="h-4 w-4"/>}
              Exporter <ChevronDown className="h-3.5 w-3.5 opacity-60"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {produits.length} produit{produits.length>1?'s':''} à exporter
            </DropdownMenuLabel>
            <DropdownMenuSeparator/>
            {[
              {label:'PDF (.pdf)',   desc:'Catalogue mis en page',  icon:File,            color:'red',    fn:exportPDF},
              {label:'Excel (.xlsx)',desc:'Toutes les colonnes',    icon:FileSpreadsheet, color:'green',  fn:exportExcel},
              {label:'CSV (.csv)',   desc:'Compatible Excel',       icon:FileText,        color:'blue',   fn:exportCSV},
            ].map(({label,desc,icon:Icon,color,fn})=>(
              <DropdownMenuItem key={label} onClick={fn} className="gap-3 cursor-pointer">
                <div className={`p-1.5 bg-${color}-50 dark:bg-${color}-950/30 rounded`}>
                  <Icon className={`h-4 w-4 text-${color}-600`}/>
                </div>
                <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" className="gap-2" onClick={()=>router.reload()}>
          <RefreshCw className="h-4 w-4"/> Actualiser
        </Button>
        <Button size="sm" className="gap-2 shadow-sm shadow-purple-500/30 bg-purple-600 hover:bg-purple-700" onClick={onAdd}>
          <Plus className="h-4 w-4"/> Nouveau produit
        </Button>
      </div>
    </motion.div>
  );
}
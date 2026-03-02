import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from "html2canvas-pro";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface PdfExportProps {
    targetId: string;
    fileName?: string;
}

const PdfExport: React.FC<PdfExportProps> = ({ targetId, fileName = 'dashboard.pdf' }) => {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        const originalElement = document.getElementById(targetId);
        if (!originalElement) {
            console.warn(`Element with id "${targetId}" not found.`);
            setLoading(false);
            return;
        }

        try {
            // Créer un conteneur pour l'export
            const exportContainer = document.createElement('div');
            exportContainer.id = 'pdf-export-container';
            exportContainer.style.position = 'absolute';
            exportContainer.style.left = '-9999px';
            exportContainer.style.top = '-9999px';
            exportContainer.style.backgroundColor = '#ffffff';
            exportContainer.style.padding = '20px';
            exportContainer.style.width = '1200px';
            document.body.appendChild(exportContainer);

            // Ajouter le titre
            const now = new Date();
            const titleDiv = document.createElement('div');
            titleDiv.className = 'pdf-header';
            titleDiv.innerHTML = `
                <h1 style="color: #702a91; font-size: 24px; margin-bottom: 5px;">Tableau de Bord Pharmacie</h1>
                <div style="color: #666; font-size: 12px; margin-bottom: 20px; border-bottom: 2px solid #702a91; padding-bottom: 10px;">
                    Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}
                </div>
            `;
            exportContainer.appendChild(titleDiv);

            // Capturer les statistiques (cartes)
            const statsSection = await captureStats(originalElement);
            if (statsSection) exportContainer.appendChild(statsSection);

            // Capturer les graphiques principaux
            const chartsSection = await captureCharts(originalElement);
            if (chartsSection) exportContainer.appendChild(chartsSection);

            // Capturer la section des KPI
            const kpiSection = await captureKPIs(originalElement);
            if (kpiSection) exportContainer.appendChild(kpiSection);

            // Capturer le résumé
            const summarySection = await captureSummary(originalElement);
            if (summarySection) exportContainer.appendChild(summarySection);

            // Attendre que tout soit bien rendu
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Générer le PDF
            const canvas = await html2canvas(exportContainer, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                allowTaint: true,
                useCORS: true,
                windowWidth: 1200
            });

            // Nettoyer
            document.body.removeChild(exportContainer);

            // Créer le PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const width = imgWidth * ratio;
            const height = imgHeight * ratio;

            pdf.addImage(imgData, 'PNG', (pdfWidth - width) / 2, 0, width, height);
            pdf.save(fileName);

        } catch (error) {
            console.error('Erreur lors de la génération du PDF :', error);
        } finally {
            setLoading(false);
        }
    };

    const captureStats = async (element: HTMLElement) => {
        const statsContainer = document.createElement('div');
        statsContainer.style.marginBottom = '30px';
        
        const statsGrid = element.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
        if (!statsGrid) return null;

        try {
            const canvas = await html2canvas(statsGrid as HTMLElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                allowTaint: true,
                useCORS: true
            });
            
            const img = document.createElement('img');
            img.src = canvas.toDataURL();
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.marginBottom = '20px';
            statsContainer.appendChild(img);
            
            return statsContainer;
        } catch (error) {
            console.error('Erreur capture stats:', error);
            return null;
        }
    };

    const captureCharts = async (element: HTMLElement) => {
        const chartsContainer = document.createElement('div');
        chartsContainer.style.marginBottom = '30px';
        
        // Titre de section
        const sectionTitle = document.createElement('h2');
        sectionTitle.style.color = '#374151';
        sectionTitle.style.fontSize = '18px';
        sectionTitle.style.fontWeight = '600';
        sectionTitle.style.marginBottom = '15px';
        sectionTitle.style.borderBottom = '2px solid #702a91';
        sectionTitle.style.paddingBottom = '8px';
        sectionTitle.textContent = '📈 Analyses et Graphiques';
        chartsContainer.appendChild(sectionTitle);

        // Grille pour les graphiques
        const gridDiv = document.createElement('div');
        gridDiv.style.display = 'grid';
        gridDiv.style.gridTemplateColumns = 'repeat(2, 1fr)';
        gridDiv.style.gap = '20px';

        // Capturer chaque graphique individuellement
        const chartElements = [
            { selector: '.lg\\:grid-cols-2 .border-0.shadow-lg:first-child', title: 'Évolution globale' },
            { selector: '.lg\\:grid-cols-2 .border-0.shadow-lg:last-child', title: 'Tendance des revenus' },
            { selector: '.lg\\:grid-cols-3 .border-0.shadow-lg:first-child', title: 'Répartition des ventes' },
            { selector: '.lg\\:grid-cols-3 .border-0.shadow-lg:nth-child(2)', title: 'Recherches mensuelles' }
        ];

        for (const chart of chartElements) {
            const chartElement = element.querySelector(chart.selector);
            if (chartElement) {
                try {
                    const canvas = await html2canvas(chartElement as HTMLElement, {
                        scale: 2,
                        backgroundColor: '#ffffff',
                        logging: false,
                        allowTaint: true,
                        useCORS: true
                    });

                    const cardDiv = document.createElement('div');
                    cardDiv.style.border = '1px solid #e5e7eb';
                    cardDiv.style.borderRadius = '8px';
                    cardDiv.style.padding = '15px';
                    cardDiv.style.backgroundColor = 'white';

                    const titleDiv = document.createElement('div');
                    titleDiv.style.fontSize = '14px';
                    titleDiv.style.fontWeight = '600';
                    titleDiv.style.marginBottom = '10px';
                    titleDiv.style.color = '#374151';
                    titleDiv.textContent = chart.title;
                    cardDiv.appendChild(titleDiv);

                    const img = document.createElement('img');
                    img.src = canvas.toDataURL();
                    img.style.width = '100%';
                    img.style.height = 'auto';
                    cardDiv.appendChild(img);

                    gridDiv.appendChild(cardDiv);
                } catch (error) {
                    console.error(`Erreur capture chart ${chart.title}:`, error);
                }
            }
        }

        chartsContainer.appendChild(gridDiv);
        return chartsContainer;
    };

    const captureKPIs = async (element: HTMLElement) => {
        const kpiContainer = document.createElement('div');
        kpiContainer.style.marginBottom = '30px';

        const kpiCard = element.querySelector('.lg\\:grid-cols-3 .border-0.shadow-lg:last-child');
        if (!kpiCard) return null;

        try {
            const canvas = await html2canvas(kpiCard as HTMLElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                allowTaint: true,
                useCORS: true
            });

            const sectionTitle = document.createElement('h2');
            sectionTitle.style.color = '#374151';
            sectionTitle.style.fontSize = '18px';
            sectionTitle.style.fontWeight = '600';
            sectionTitle.style.marginBottom = '15px';
            sectionTitle.style.borderBottom = '2px solid #702a91';
            sectionTitle.style.paddingBottom = '8px';
            sectionTitle.textContent = '🎯 Indicateurs de Performance';
            kpiContainer.appendChild(sectionTitle);

            const img = document.createElement('img');
            img.src = canvas.toDataURL();
            img.style.width = '100%';
            img.style.height = 'auto';
            kpiContainer.appendChild(img);

            return kpiContainer;
        } catch (error) {
            console.error('Erreur capture KPI:', error);
            return null;
        }
    };

    const captureSummary = async (element: HTMLElement) => {
        const summaryContainer = document.createElement('div');
        
        const summaryCard = element.querySelector('.border-0.shadow-lg.bg-linear-to-br');
        if (!summaryCard) return null;

        try {
            const canvas = await html2canvas(summaryCard as HTMLElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                allowTaint: true,
                useCORS: true
            });

            const sectionTitle = document.createElement('h2');
            sectionTitle.style.color = '#374151';
            sectionTitle.style.fontSize = '18px';
            sectionTitle.style.fontWeight = '600';
            sectionTitle.style.marginBottom = '15px';
            sectionTitle.style.borderBottom = '2px solid #702a91';
            sectionTitle.style.paddingBottom = '8px';
            sectionTitle.textContent = '📊 Résumé des Performances';
            summaryContainer.appendChild(sectionTitle);

            const img = document.createElement('img');
            img.src = canvas.toDataURL();
            img.style.width = '100%';
            img.style.height = 'auto';
            summaryContainer.appendChild(img);

            return summaryContainer;
        } catch (error) {
            console.error('Erreur capture summary:', error);
            return null;
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={loading}
            className="bg-linear-to-r from-[#702a91] to-[#fa3143] hover:shadow-lg gap-2"
        >
            {loading ? (
                <Spinner className="h-4 w-4 mr-2" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            {loading ? 'Patientez...' : 'Exporter PDF'}
        </Button>
    );
};

export default PdfExport;
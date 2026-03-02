// components/reports/OrdonnanceReportPDF.tsx
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet,
  PDFViewer,
  Font
} from '@react-pdf/renderer';

// Définir les styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2px solid #702a91'
  },
  title: {
    fontSize: 24,
    color: '#702a91',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20
  },
  pharmacieInfo: {
    marginBottom: 20,
    textAlign: 'center'
  },
  pharmacieName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333'
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
    gap: 10
  },
  statCard: {
    width: '48%',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    marginBottom: 10
  },
  statLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#702a91'
  },
  table: {
    width: '100%',
    marginBottom: 30
  },
  tableHeader: {
    backgroundColor: '#702a91',
    flexDirection: 'row',
    padding: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #eaeaea',
    padding: 8
  },
  tableCell: {
    padding: 5,
    fontSize: 9
  },
  headerCell: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666'
  }
});

interface ReportData {
  title: string;
  startDate: string;
  endDate: string;
  ordonnances: any[];
  stats: any;
  pharmacie: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export const OrdonnanceReportPDF: React.FC<{ data: ReportData }> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>
            Période : {data.startDate} au {data.endDate}
          </Text>
          
          <View style={styles.pharmacieInfo}>
            <Text style={styles.pharmacieName}>{data.pharmacie.name}</Text>
            <Text>{data.pharmacie.address}</Text>
            <Text>Tél: {data.pharmacie.phone} | Email: {data.pharmacie.email}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Ordonnances</Text>
            <Text style={styles.statValue}>{data.stats.total}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Ordonnances Traitées</Text>
            <Text style={styles.statValue}>{data.stats.processed}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>En Attente</Text>
            <Text style={styles.statValue}>{data.stats.pending}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Chiffre d'Affaires</Text>
            <Text style={styles.statValue}>
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'GNF',
                minimumFractionDigits: 0,
              }).format(data.stats.totalRevenue)}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={{ width: '20%' }}>
              <Text style={styles.headerCell}>Date</Text>
            </View>
            <View style={{ width: '20%' }}>
              <Text style={styles.headerCell}>N°</Text>
            </View>
            <View style={{ width: '30%' }}>
              <Text style={styles.headerCell}>Patient</Text>
            </View>
            <View style={{ width: '15%' }}>
              <Text style={styles.headerCell}>Produits</Text>
            </View>
            <View style={{ width: '15%' }}>
              <Text style={styles.headerCell}>Montant</Text>
            </View>
          </View>

          {data.ordonnances.map((ordonnance, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={{ width: '20%' }}>
                <Text style={styles.tableCell}>
                  {new Date(ordonnance.date_ord).toLocaleDateString('fr-FR')}
                </Text>
              </View>
              <View style={{ width: '20%' }}>
                <Text style={[styles.tableCell, { fontFamily: 'Courier' }]}>
                  {ordonnance.numero}
                </Text>
              </View>
              <View style={{ width: '30%' }}>
                <Text style={styles.tableCell}>{ordonnance.patient}</Text>
              </View>
              <View style={{ width: '15%' }}>
                <Text style={styles.tableCell}>
                  {ordonnance.produits?.length || 0}
                </Text>
              </View>
              <View style={{ width: '15%' }}>
                <Text style={styles.tableCell}>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'GNF',
                    minimumFractionDigits: 0,
                  }).format(ordonnance.total)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Document généré le {new Date().toLocaleDateString('fr-FR')}</Text>
          <Text>© {new Date().getFullYear()} {data.pharmacie.name}</Text>
        </View>
      </Page>
    </Document>
  );
};
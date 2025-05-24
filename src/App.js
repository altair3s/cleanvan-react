import React, { useState, useEffect } from 'react';
import { Download, Calculator, Calendar, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';

const VehicleCleaningSimulator = () => {
  const [config, setConfig] = useState({
    ambulifts: 20,
    navettes: 30,
    investissement: 12000,
    amortissementMois: 12,
    salaireCharge: 2800,
    caCible: 3800,
    interventionsPonctuelles: 8 // par mois
  });

  const [planning, setPlanning] = useState({
    periodeDebut: new Date().toISOString().split('T')[0],
    periodeFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [results, setResults] = useState({
    coutMensuel: 0,
    totalVehicules: 0,
    nettoyagesComplets: 0,
    nettoyagesInterieurs: 0,
    tarifAmbulift: 0,
    tarifNavette: 0,
    tarifIntervention: 0,
    caPeriode: 0,
    nbJoursPeriode: 0,
    caMensuelRealise: 0,
    heuresPeriode: 0,
    heuresMensuelles: 0,
    heuresTotales: 0,
    heuresAmbuliftComplet: 0,
    heuresAmbuliftInterieur: 0,
    heuresNavetteComplet: 0,
    heuresNavetteInterieur: 0,
    heuresInterventions: 0,
    totalHeuresGlobales: 0, // Total des heures globales
    tarifAmbuliftComplet: 0,
    tarifNavetteComplet: 0,
    tarifAmbuliftInterieur: 0,
    tarifNavetteInterieur: 0,
    tarifIntervention: 0
  });

  // Calcul automatique des résultats
  useEffect(() => {
    const amortissementMois = config.amortissementMois > 0 ? config.amortissementMois : 1; // Eviter division par zéro
    const coutEquipement = config.investissement / amortissementMois;
    const coutMensuel = config.salaireCharge + coutEquipement;
    const totalVehicules = config.ambulifts + config.navettes;
    
    // Calcul du nombre de nettoyages par mois
    const nettoyagesCompletsParMois = totalVehicules * 2; // 1 semaine sur 2
    const nettoyagesInterieursParMois = totalVehicules * 2; // les autres semaines
    const totalNettoyagesParMois = nettoyagesCompletsParMois + nettoyagesInterieursParMois + config.interventionsPonctuelles;
    
    // Calcul des tarifs pour atteindre le CA cible
    const tarifMoyenBase = config.caCible / totalNettoyagesParMois;
    
    // Différenciation des tarifs (complet plus cher que intérieur)
    const tarifComplet = tarifMoyenBase * 1.5;
    const tarifInterieur = tarifMoyenBase * 0.8;
    const tarifIntervention = tarifMoyenBase * 1.2;
    
    // Tarifs par type de véhicule (ambulifts plus gros donc plus chers)
    const tarifAmbuliftComplet = tarifComplet * 1.2;
    const tarifNavetteComplet = tarifComplet * 0.9;
    const tarifAmbuliftInterieur = tarifInterieur * 1.2;
    const tarifNavetteInterieur = tarifInterieur * 0.9;

    // Calcul du CA sur la période sélectionnée
    const dateDebut = new Date(planning.periodeDebut);
    const dateFin = new Date(planning.periodeFin);
    const nbJours = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24)) + 1;
    const nbMois = nbJours / 30.44; // Moyenne de jours par mois
    
    // CA généré par les nettoyages programmés
    const caCompletsAmbulift = (config.ambulifts * 2 * nbMois) * tarifAmbuliftComplet;
    const caInterieursAmbulift = (config.ambulifts * 2 * nbMois) * tarifAmbuliftInterieur;
    const caCompletsNavette = (config.navettes * 2 * nbMois) * tarifNavetteComplet;
    const caInterieursNavette = (config.navettes * 2 * nbMois) * tarifNavetteInterieur;
    const caInterventions = (config.interventionsPonctuelles * nbMois) * tarifIntervention;
    
    const caPeriode = caCompletsAmbulift + caInterieursAmbulift + caCompletsNavette + caInterieursNavette + caInterventions;
    const caMensuelRealise = caPeriode / nbMois;

    // Calcul des heures de travail par type de nettoyage
    const heuresCompletsAmbulift = (config.ambulifts * 2 * nbMois) * 2; // 45 min = 0.75h
    const heuresInterieursAmbulift = (config.ambulifts * 2 * nbMois) * 1; // 25 min = 0.42h
    const heuresCompletsNavette = (config.navettes * 2 * nbMois) * 1.5; // 35 min = 0.58h
    const heuresInterieursNavette = (config.navettes * 2 * nbMois) * 0.75; // 20 min = 0.33h
    const heuresInterventions = (config.interventionsPonctuelles * nbMois) * 0.75; // 30 min moyenne = 0.5h
    
    const heuresPeriode = heuresCompletsAmbulift + heuresInterieursAmbulift + heuresCompletsNavette + heuresInterieursNavette + heuresInterventions;
    const heuresMensuelles = heuresPeriode / nbMois;

    // Calcul des heures détaillées par type de nettoyage et type de véhicule
    const heuresTotalesAmbuliftComplet = heuresCompletsAmbulift;
    const heuresTotalesAmbuliftInterieur = heuresInterieursAmbulift;
    const heuresTotalesNavetteComplet = heuresCompletsNavette;
    const heuresTotalesNavetteInterieur = heuresInterieursNavette;

    // Total global des heures
    const totalHeuresGlobales = heuresTotalesAmbuliftComplet + heuresTotalesAmbuliftInterieur + heuresTotalesNavetteComplet + heuresTotalesNavetteInterieur + heuresInterventions;

    setResults({
      coutMensuel,
      totalVehicules,
      nettoyagesComplets: nettoyagesCompletsParMois,
      nettoyagesInterieurs: nettoyagesInterieursParMois,
      tarifAmbuliftComplet: Math.round(tarifAmbuliftComplet * 100) / 100,
      tarifNavetteComplet: Math.round(tarifNavetteComplet * 100) / 100,
      tarifAmbuliftInterieur: Math.round(tarifAmbuliftInterieur * 100) / 100,
      tarifNavetteInterieur: Math.round(tarifNavetteInterieur * 100) / 100,
      tarifIntervention: Math.round(tarifIntervention * 100) / 100,
      caPeriode: Math.round(caPeriode * 100) / 100,
      nbJoursPeriode: nbJours,
      caMensuelRealise: Math.round(caMensuelRealise * 100) / 100,
      heuresPeriode: Math.round(heuresPeriode * 10) / 10,
      heuresMensuelles: Math.round(heuresMensuelles * 10) / 10,
      heuresTotales: Math.round(totalHeuresGlobales * 10) / 10, // Total des heures globales
      heuresAmbuliftComplet: Math.round(heuresTotalesAmbuliftComplet * 10) / 10,
      heuresAmbuliftInterieur: Math.round(heuresTotalesAmbuliftInterieur * 10) / 10,
      heuresNavetteComplet: Math.round(heuresTotalesNavetteComplet * 10) / 10,
      heuresNavetteInterieur: Math.round(heuresTotalesNavetteInterieur * 10) / 10,
      heuresInterventions: Math.round(heuresInterventions * 10) / 10,
      totalHeuresGlobales: Math.round(totalHeuresGlobales * 10) / 10 // Total des heures globales
    });
  }, [config, planning]);

  // Génération du planning
  const generatePlanning = () => {
    const debut = new Date(planning.periodeDebut);
    const fin = new Date(planning.periodeFin);
    const planningData = [];
    
    let currentDate = new Date(debut);
    let semaine = 1;
    
    while (currentDate <= fin) {
      const jour = currentDate.getDay();
      
      // Planification du lundi au vendredi
      if (jour >= 1 && jour <= 5) {
        const isNettoyageComplet = semaine % 2 === 1;
        const typeNettoyage = isNettoyageComplet ? 'Complet' : 'Intérieur';
        
        // Ambulifts
        for (let i = 1; i <= config.ambulifts; i++) {
          planningData.push({
            Date: currentDate.toLocaleDateString('fr-FR'),
            'Type de véhicule': 'Ambulift',
            'Numéro': `AMB-${i.toString().padStart(3, '0')}`,
            'Type de nettoyage': typeNettoyage,
            'Tarif': isNettoyageComplet ? results.tarifAmbuliftComplet : results.tarifAmbuliftInterieur,
            'Durée estimée': isNettoyageComplet ? '120 min' : '60 min'
          });
        }
        
        // Navettes
        for (let i = 1; i <= config.navettes; i++) {
          planningData.push({
            Date: currentDate.toLocaleDateString('fr-FR'),
            'Type de véhicule': 'Navette PMR',
            'Numéro': `NAV-${i.toString().padStart(3, '0')}`,
            'Type de nettoyage': typeNettoyage,
            'Tarif': isNettoyageComplet ? results.tarifNavetteComplet : results.tarifNavetteInterieur,
            'Durée estimée': isNettoyageComplet ? '90 min' : '45 min'
          });
        }
      }
      
      // Passage à la semaine suivante le dimanche
      if (jour === 0) {
        semaine++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return planningData;
  };

  // Export Excel
  const exportToExcel = () => {
    const planningData = generatePlanning();
    
    // Feuille 1: Planning
    const ws1 = XLSX.utils.json_to_sheet(planningData);
    
    // Feuille 2: Résumé financier
    const resumeData = [
      { Élément: 'CONFIGURATION', Valeur: '' },
      { Élément: 'Investissement total', Valeur: `${config.investissement} €` },
      { Élément: 'Amortissement', Valeur: `${config.amortissementMois} mois` },
      { Élément: 'Coût équipement/mois', Valeur: `${Math.round(config.investissement / config.amortissementMois)} €` },
      { Élément: 'Salaire chargé/mois', Valeur: `${config.salaireCharge} €` },
      { Élément: 'Coût total mensuel', Valeur: `${Math.round(results.coutMensuel)} €` },
      { Élément: 'CA cible mensuel', Valeur: `${config.caCible} €` },
      { Élément: '', Valeur: '' },
      { Élément: 'CHIFFRE D\'AFFAIRES PÉRIODE', Valeur: '' },
      { Élément: 'Période', Valeur: `${planning.periodeDebut} au ${planning.periodeFin}` },
      { Élément: 'Nombre de jours', Valeur: `${results.nbJoursPeriode} jours` },
      { Élément: 'CA total période', Valeur: `${results.caPeriode.toLocaleString('fr-FR')} €` },
      { Élément: 'CA mensuel réalisé', Valeur: `${results.caMensuelRealise.toLocaleString('fr-FR')} €` },
      { Élément: 'Écart vs CA cible', Valeur: `${results.caMensuelRealise >= config.caCible ? '+' : ''}${Math.round(results.caMensuelRealise - config.caCible)} €` },
      { Élément: '', Valeur: '' },
      { Élément: 'TEMPS DE TRAVAIL', Valeur: '' },
      { Élément: 'Heures totales période', Valeur: `${results.heuresPeriode}h` },
      { Élément: 'Heures mensuelles', Valeur: `${results.heuresMensuelles}h` },
      { Élément: 'Heures totales générées', Valeur: `${results.totalHeuresGlobales}h` }, // Ajout des heures totales
      { Élément: 'Heures ambulift complet', Valeur: `${results.heuresAmbuliftComplet}h` },
      { Élément: 'Heures ambulift intérieur', Valeur: `${results.heuresAmbuliftInterieur}h` },
      { Élément: 'Heures navette complet', Valeur: `${results.heuresNavetteComplet}h` },
      { Élément: 'Heures navette intérieur', Valeur: `${results.heuresNavetteInterieur}h` },
      { Élément: 'Heures interventions ponctuelles', Valeur: `${results.heuresInterventions}h` },
      { Élément: 'Taux horaire moyen', Valeur: `${results.heuresMensuelles > 0 ? Math.round((results.caMensuelRealise / results.heuresMensuelles) * 100) / 100 : 0} €/h` },
      { Élément: '', Valeur: '' },
      { Élément: 'TARIFS', Valeur: '' },
      { Élément: 'Ambulift - Nettoyage complet', Valeur: `${results.tarifAmbuliftComplet} €` },
      { Élément: 'Ambulift - Nettoyage intérieur', Valeur: `${results.tarifAmbuliftInterieur} €` },
      { Élément: 'Navette - Nettoyage complet', Valeur: `${results.tarifNavetteComplet} €` },
      { Élément: 'Navette - Nettoyage intérieur', Valeur: `${results.tarifNavetteInterieur} €` },
      { Élément: 'Intervention ponctuelle', Valeur: `${results.tarifIntervention} €` }
    ];
    
    const ws2 = XLSX.utils.json_to_sheet(resumeData);
    
    // Création du classeur
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Planning');
    XLSX.utils.book_append_sheet(wb, ws2, 'Résumé financier');
    
    // Export
    XLSX.writeFile(wb, `planning_nettoyage_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <Calculator className="mr-3 text-blue-600" />
          Simulateur de Nettoyage de Véhicules Professionnels
        </h1>
        <p className="text-gray-600">Calculez vos tarifs optimaux et générez votre planning d'interventions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Settings className="mr-2 text-blue-600" />
            Configuration
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre d'Ambulifts
                </label>
                <input
                  type="number"
                  value={config.ambulifts}
                  onChange={(e) => setConfig({...config, ambulifts: Number(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Navettes PMR
                </label>
                <input
                  type="number"
                  value={config.navettes}
                  onChange={(e) => setConfig({...config, navettes: Number(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investissement total (€)
                </label>
                <input
                  type="number"
                  value={config.investissement}
                  onChange={(e) => setConfig({...config, investissement: Number(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amortissement (mois)
                </label>
                <input
                  type="number"
                  value={config.amortissementMois}
                  onChange={(e) => setConfig({...config, amortissementMois: Number(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salaire chargé/mois (€)
                </label>
                <input
                  type="number"
                  value={config.salaireCharge}
                  onChange={(e) => setConfig({...config, salaireCharge: Number(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CA cible mensuel (€)
                </label>
                <input
                  type="number"
                  value={config.caCible}
                  onChange={(e) => setConfig({...config, caCible: Number(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interventions ponctuelles/mois
              </label>
              <input
                type="number"
                value={config.interventionsPonctuelles}
                onChange={(e) => setConfig({...config, interventionsPonctuelles: Number(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Résultats de la simulation
          </h2>
          
          <div className="space-y-4">
            {/* Détails financiers */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Analyse financière</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Coût mensuel total:</span>
                  <span className="font-semibold">{Math.round(results.coutMensuel)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Total véhicules:</span>
                  <span className="font-semibold">{results.totalVehicules}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nettoyages complets/mois:</span>
                  <span className="font-semibold">{results.nettoyagesComplets}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nettoyages intérieurs/mois:</span>
                  <span className="font-semibold">{results.nettoyagesInterieurs}</span>
                </div>
              </div>
            </div>
            
            {/* Chiffre d'affaires généré */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">CA généré sur la période</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Période ({results.nbJoursPeriode} jours):</span>
                  <span className="font-semibold text-lg text-orange-700">{results.caPeriode.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between">
                  <span>CA mensuel réalisé:</span>
                  <span className="font-semibold">{results.caMensuelRealise.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between">
                  <span>CA cible mensuel:</span>
                  <span className="font-semibold">{config.caCible.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between pt-1 border-t">
                  <span>Écart vs cible:</span>
                  <span className={`font-semibold ${results.caMensuelRealise >= config.caCible ? 'text-green-600' : 'text-red-600'}`}>
                    {results.caMensuelRealise >= config.caCible ? '+' : ''}{Math.round(results.caMensuelRealise - config.caCible)} €
                  </span>
                </div>
              </div>
            </div>
            
            {/* Détails des heures de travail */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Détails des heures de travail</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Heures Ambulift - Complet:</span>
                  <span className="font-semibold">{results.heuresAmbuliftComplet} h</span>
                </div>
                <div className="flex justify-between">
                  <span>Heures Ambulift - Intérieur:</span>
                  <span className="font-semibold">{results.heuresAmbuliftInterieur} h</span>
                </div>
                <div className="flex justify-between">
                  <span>Heures Navette - Complet:</span>
                  <span className="font-semibold">{results.heuresNavetteComplet} h</span>
                </div>
                <div className="flex justify-between">
                  <span>Heures Navette - Intérieur:</span>
                  <span className="font-semibold">{results.heuresNavetteInterieur} h</span>
                </div>
                <div className="flex justify-between">
                  <span>Heures Interventions Ponctuelles:</span>
                  <span className="font-semibold">{results.heuresInterventions} h</span>
                </div>
                {/* Total global des heures */}
                <div className="flex justify-between pt-2 border-t">
                  <span>Total global des heures:</span>
                  <span className="font-semibold">{results.totalHeuresGlobales} h</span>
                </div>
              </div>
            </div>

            {/* Tarifs calculés */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Tarifs calculés</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Ambulift - Nettoyage complet:</span>
                  <span className="font-semibold">{results.tarifAmbuliftComplet} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Ambulift - Nettoyage intérieur:</span>
                  <span className="font-semibold">{results.tarifAmbuliftInterieur} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Navette - Nettoyage complet:</span>
                  <span className="font-semibold">{results.tarifNavetteComplet} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Navette - Nettoyage intérieur:</span>
                  <span className="font-semibold">{results.tarifNavetteInterieur} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Intervention ponctuelle:</span>
                  <span className="font-semibold">{results.tarifIntervention} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Planning */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="mr-2 text-blue-600" />
          Génération du planning
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={planning.periodeDebut}
              onChange={(e) => setPlanning({...planning, periodeDebut: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              value={planning.periodeFin}
              onChange={(e) => setPlanning({...planning, periodeFin: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={exportToExcel}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter Excel
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Le planning généré inclut tous les véhicules avec alternance hebdomadaire 
          (semaine 1: nettoyage complet, semaine 2: nettoyage intérieur uniquement). 
          Les interventions ponctuelles sont à ajouter manuellement selon les besoins.
        </p>
      </div>
    </div>
  );
};

export default VehicleCleaningSimulator;

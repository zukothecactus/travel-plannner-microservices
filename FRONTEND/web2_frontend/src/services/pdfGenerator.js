import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generisiPlanPDF = (plan, ukupnaPotrosnja) => {
  const doc = new jsPDF();

  // 1. Zaglavlje dokumenta
  doc.setFillColor(9, 29, 54); // Mystic Blue boja iz tvoje teme
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(plan.naziv || 'Plan Putovanja', 14, 25);

  // 2. Osnovne informacije o putovanju
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text(`Opis: ${plan.opis || 'Nema opisa'}`, 14, 50);
  
  const dPocetak = new Date(plan.datumPocetka).toLocaleDateString('sr-RS');
  const dZavrsetak = new Date(plan.datumZavrsetka).toLocaleDateString('sr-RS');
  doc.text(`Period putovanja: ${dPocetak} - ${dZavrsetak}`, 14, 58);

  // Financije
  doc.text(`Planirani budžet: ${plan.planiraniBudzet} EUR`, 14, 66);
  doc.text(`Trenutna potrošnja: ${ukupnaPotrosnja || 0} EUR`, 14, 74);

  let trenutniY = 85;

  // 3. Tabela Destinacija i Aktivnosti
  if (plan.destinacije && plan.destinacije.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(9, 29, 54);
    doc.text('1. Plan rute i destinacije', 14, trenutniY);
    
    const destinacijeRedovi = [];
    plan.destinacije.forEach((dest) => {
      const dolazak = new Date(dest.datumDolaska).toLocaleDateString('sr-RS');
      const odlazak = new Date(dest.datumOdlaska).toLocaleDateString('sr-RS');
      destinacijeRedovi.push([
        dest.nazivMesta,
        `${dolazak} - ${odlazak}`,
        dest.napomena || '/'
      ]);
    });

    autoTable(doc, {
    startY: trenutniY + 4,
    head: [['Mesto / Destinacija', 'Trajanje boravka', 'Napomena']],
    body: destinacijeRedovi,
    headStyles: { fillStyle: [9, 29, 54] },
    });

    trenutniY = doc.lastAutoTable.finalY + 15;
  }

  // 4. Tabela Troškova
  if (plan.troskovi && plan.troskovi.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(9, 29, 54);
    doc.text('2. Evidencija troškova', 14, trenutniY);

    const troskoviRedovi = plan.troskovi.map(t => [
      t.kategorija,
      t.opis || '/',
      new Date(t.datum).toLocaleDateString('sr-RS'),
      `${t.iznos} EUR`
    ]);

    autoTable(doc, {
    startY: trenutniY + 4,
    head: [['Kategorija', 'Opis troška', 'Datum', 'Iznos']],
    body: troskoviRedovi,
    headStyles: { fillStyle: [9, 29, 54] },
    });

    trenutniY = doc.lastAutoTable.finalY + 15;
  }

  // 5. To-Do Spisak stavki
  if (plan.spisak && plan.spisak.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(9, 29, 54);
    doc.text('3. Podsetnik / To-Do Lista', 14, trenutniY);

    const todoRedovi = plan.spisak.map(s => [
      s.tekst,
      s.jeZavrseno ? 'Završeno' : 'U planu'
    ]);

    autoTable(doc, {
      startY: trenutniY + 4,
      head: [['Zadatak / Stavka', 'Status']],
      body: todoRedovi,
      headStyles: { fillStyle: [9, 29, 54] },
    });
  }

  // Slanje fajla pretraživaču na preuzimanje
  doc.save(`Plan_Putovanja_${plan.naziv || 'Izvestaj'}.pdf`);
};
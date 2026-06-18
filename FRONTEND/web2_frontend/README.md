# Web2 Frontend

Ovo je React + Vite frontend za aplikaciju za planiranje putovanja. Aplikacija koristi Redux Toolkit za stanje, Axios za komunikaciju sa backend API-jem i više funkcionalnih komponenti za upravljanje planovima, destinacijama, troškovima, aktivnostima i deljenjem plana.

## Kako frontend funkcioniše

1. Korisnik prvo prolazi kroz autentikaciju preko login i register ekrana.
2. Prijavljeni korisnik dobija token koji se čuva u `localStorage` i koristi se za sve naredne API pozive.
3. Nakon prijave prikazuje se lista planova putovanja.
4. Kada se izabere plan, frontend povlači detalje plana i prikazuje:
	- osnovne podatke o planu i budžetu,
	- to-do spisak,
	- destinacije,
	- aktivnosti u kalendaru,
	- troškove sa filtriranjem po kategoriji.
5. Podaci se menjaju direktno kroz forme u UI-ju, a svaka izmena šalje odgovarajući zahtev ka backend-u i odmah osvežava prikaz.
6. Admin korisnici imaju dodatni pristup Admin Panel-u.
7. Plan može da se podeli putem generisanog linka, a deljeni plan se otvara preko rute `/deli/:token`.

## Glavne funkcionalnosti

- prijava i registracija korisnika,
- pregled i izbor planova putovanja,
- uređivanje osnovnih podataka plana i budžeta,
- dodavanje, izmena i brisanje destinacija,
- dodavanje i upravljanje troškovima,
- pregled aktivnosti kroz kalendar,
- deljenje plana preko tokena/QR koda,
- admin pregled za korisnike sa ulogom `ADMIN`.

## Struktura aplikacije

- `src/App.jsx` upravlja glavnim tokom aplikacije i prikazom ekrana zavisno od tokena, role i izabranog plana.
- `src/store/authSlice.js` čuva podatke o autentikaciji i upravlja login/logout logikom.
- `src/store/planSlice.js` sadrži asinhrone akcije za planove, troškove, destinacije, aktivnosti i deljenje.
- `src/components/` sadrži UI komponente za forme, liste, kalendar, deljenje i admin panel.
- `src/services/api.jsx` je centralno mesto za HTTP komunikaciju sa backend-om.

## Pokretanje

```bash
npm install
npm run dev
```

Za produkcijski build:

```bash
npm run build
```

Za lokalni pregled build-a:

```bash
npm run preview
```

## Napomena

Frontend očekuje da je backend API pokrenut i dostupan na adresi konfigurisanoj u `src/services/api.jsx`.

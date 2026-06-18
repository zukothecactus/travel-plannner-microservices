# TravelPlanner - Mikroservisna Arhitektura

## ?? Pregled Projekta

TravelPlanner je kompleksna ASP.NET Core aplikacija sa **mikroservisnom arhitekturom** koju pokre?e **Azure Service Fabric**. Aplikacija omogu?ava korisnicima da planiraju putovanja, prate budžete, upravljaju destinacijama, aktivnostima i delim planove sa drugim korisnicima.

### Tehnološki Stack
- **.NET 8** - Framework
- **ASP.NET Core** - Web API
- **Entity Framework Core** - ORM
- **Azure Service Fabric** - Orkestracija mikroservisa
- **SQL Server** - Baza podataka
- **JWT** - Autentifikacija i autorizacija
- **BCrypt** - Heširavanje lozinki
- **CORS** - Podrška za React frontend

---

## ??? Arhitektura Mikroservisa

Sistem se sastoji od **5 projekata** organizovanih kao specijalizovani mikroservisi:

### 1. **WebAPI** (Stateless Servis)
Glavna ulazna ta?ka aplikacije - REST API server koji komunikira sa ostalim servisima.

#### Tehni?ki Detalji:
- **Tip**: Stateless Service
- **Framework**: ASP.NET Core sa Kestrel serverom
- **Autentifikacija**: JWT Bearer tokens
- **CORS**: Dozvoljeni su zahtevi sa bilo kojeg origin-a (za React frontend)

#### Kontroleri:

##### **AuthController** - Upravljanje autentifikacijom
```
POST /api/auth/registracija - Registracija novog korisnika
POST /api/auth/login - Prijava korisnika i generisanje JWT tokena
```

Tok autentifikacije:
1. Korisnik šalje email i lozinku
2. TravelDataService verifikuje kredencijale (BCrypt validacija)
3. Ako su validni, generiše se JWT token sa:
   - `sub` - ID korisnika
   - `name` - Ime korisnika
   - `email` - Email adresa
   - `role` - Uloga (ADMIN ili KORISNIK)

##### **PlanPutovanjaController** - Upravljanje putovanjima
Svi endpoint-i zahtevaju autentifikaciju (`[Authorize]`).

**Upravljanje Planovima:**
```
POST /api/planputovanja - Kreiranje novog plana
GET /api/planputovanja - Preuzimanje svih planova trenutnog korisnika
GET /api/planputovanja/{id} - Preuzimanje detaljnog plana sa svim podacima
PUT /api/planputovanja/{id} - Izmena plana
DELETE /api/planputovanja/{id} - Brisanje plana
```

**Upravljanje Destinacijama:**
```
POST /api/planputovanja/destinacija - Dodavanje destinacije
PUT /api/planputovanja/destinacija/{id} - Izmena destinacije
DELETE /api/planputovanja/destinacija/{id} - Brisanje destinacije
```

**Upravljanje Trošcima:**
```
POST /api/planputovanja/trosak - Dodavanje troška u plan
PUT /api/planputovanja/trosak/{id} - Izmena troška
DELETE /api/planputovanja/trosak/{id} - Brisanje troška
GET /api/planputovanja/{id}/potrosnja - Preuzimanje trenutne potrošnje
```

**Upravljanje To-Do Stavkama:**
```
POST /api/planputovanja/todo - Dodavanje stavke na listu
PUT /api/planputovanja/todo/{id}/toggle - Ozna?avanje stavke kao završene/nezavršene
DELETE /api/planputovanja/todo/{id} - Brisanje stavke
```

**Upravljanje Aktivnostima:**
```
POST /api/planputovanja/aktivnost - Dodavanje aktivnosti
PUT /api/planputovanja/aktivnost/{id} - Izmena aktivnosti
DELETE /api/planputovanja/aktivnost/{id} - Brisanje aktivnosti
```

**Deljenje Planova (JWT-based):**
```
POST /api/planputovanja/{id}/generisi-token - Generisanje sharing tokena
GET /api/planputovanja/validiraj-deljenje/{token} - Validacija i preuzimanje deljenog plana (bez autentifikacije)
```

Sharing Token sadrži:
- `PlanId` - ID plana koji se deli
- `NivoPristupa` - "VIEW" (samo pregled) ili "EDIT" (može menjati)
- `TipTokena` - "DeljenjePlana" (za sigurnost)
- Trajanje - Korisnik definiše (u minutima)

##### **AdminController** - Administrativne funkcije
Zahteva ulogu `ADMIN` (`[Authorize(Roles = "ADMIN")]`).

```
GET /api/admin/korisnici - Preuzimanje svih korisnika
DELETE /api/admin/korisnici/{id} - Brisanje korisnika
PUT /api/admin/korisnici/{id}/uloga - Promena uloge korisnika
```

### 2. **TravelDataService** (Stateless Servis)
Baza podataka servis koji upravlja svim persistentnim podacima u SQL Server bazi.

#### Tehni?ki Detalji:
- **Tip**: Stateless Service
- **ORM**: Entity Framework Core
- **Baza**: SQL Server (LocalDB - `TravelPlanner_obren`)
- **Komunikacija**: Service Fabric Remoting

#### Klju?ne Metode:

**Planovi Putovanja:**
- `AddPlanPutovanjaAsync()` - Kreiranje novog plana (povezuje se sa ulogovanim korisnikom)
- `GetPlanoviPutovanjaAsync()` - Preuzimanje svih planova za korisnika
- `GetPlanPutovanjaSaDetaljimaAsync()` - Preuzimanje plana sa svim relacijama (destinacije, trošcima, To-Do stavkama)
- `AzurirajPlanPutovanjaAsync()` - Ažuriranje (Naziv, Opis, PlaniraniBudzet)
- `ObrisiPlanPutovanjaAsync()` - Brisanje plana

**Destinacije:**
- `AddDestinacijaAsync()` - Dodavanje destinacije
- `AzurirajDestinacijuAsync()` - Ažuriranje (NazivMesta, Napomena, DatumDolaska, DatumOdlaska)
- `ObrisiDestinacijuAsync()` - Brisanje destinacije

**Trošci:**
- `AddTrosakAsync()` - Dodavanje troška
- `AzurirajTrosakAsync()` - Ažuriranje (Kategorija, Opis, Iznos, Datum)
- `ObrisiTrosakAsync()` - Brisanje troška
- `DobaviSumuTroskovaZaPlanAsync()` - Brzo preuzimanje sume troškova (koristi se za keš u BudgetService)

**To-Do Stavke:**
- `DodajToDoStavkuAsync()` - Dodavanje stavke
- `PromeniStatusStavkeAsync()` - Toggle završenosti
- `ObrisiToDoStavkuAsync()` - Brisanje stavke

**Aktivnosti:**
- `DodajAktivnostAsync()` - Dodavanje aktivnosti
- `AzurirajAktivnostAsync()` - Ažuriranje svih polja
- `ObrisiAktivnostAsync()` - Brisanje aktivnosti

**Upravljanje Korisnicima:**
- `RegistrujKorisnikaAsync()` - Registracija (lozinka se heširuje sa BCrypt)
- `ProverKredencijalAsync()` - Verifikacija lozinke tokom logovanja
- `DobaviSveKorisnikeAsync()` - Preuzimanje svih korisnika (za admin)
- `ObrisiKorisnikaAsync()` - Brisanje korisnika (ne može se obrisati glavni admin ID=1)
- `PromeniUloguKorisnikaAsync()` - Promena uloge (ADMIN/KORISNIK)

#### Baza Podataka - Tabele:
```
PlanoviPutovanja
??? Id (PK)
??? Naziv
??? Opis
??? PlaniraniBudzet (double)
??? KorisnikId (FK) - Vezan za vlasnika
??? Relacije: Destinacije, Troskovi, Aktivnosti, ToDoStavke

Destinacije
??? Id (PK)
??? NazivMesta
??? Napomena
??? DatumDolaska
??? DatumOdlaska
??? PlanPutovanjaId (FK)
??? Relacija: Aktivnosti

Aktivnosti
??? Id (PK)
??? Naziv
??? Opis
??? VremePocetka
??? VremeZavrsetka
??? Lokacija
??? Trosak (double)
??? Status
??? DestinacijaId (FK)

Troskovi
??? Id (PK)
??? Kategorija
??? Opis
??? Iznos (double)
??? Datum
??? PlanPutovanjaId (FK)

ToDoStavke
??? Id (PK)
??? Opis
??? JeZavrseno (bool)
??? PlanPutovanjaId (FK)

Korisnici
??? Id (PK)
??? Ime
??? Email (Unique)
??? LozinkaHash
??? Uloga (KORISNIK/ADMIN)
??? Relacija: PlanoviPutovanja
```

### 3. **BudgetService** (Stateful Servis)
Brzi in-memory servis koji prati potrošnju budžeta sa keš optimizacijom.

#### Tehni?ki Detalji:
- **Tip**: Stateful Service (?uva stanje u memoriji klastera)
- **Stanje**: `IReliableDictionary<int, double>` - Mapira Plan ID ? Trenutna Potrošnja
- **Svrha**: Brze upite bez optere?enja baze podataka
- **Konzistentnost**: Automatski replikuje stanje na sve replike servisa

#### Klju?ne Metode:

**DodajTrosakUBudzetAsync(int planId, double iznos)**
- Inkrementira potrošnju za plan za dati iznos
- Ako plan još ne postoji u keš memoriji, inicijalizuje se sa 0
- Vra?a novu sumu potrošnje
- **Optimizacija**: Particionisano po `PlanId` - svaki plan ide na specifi?nu particiju
  
```
Tok: WebAPI šalje trošak ? TravelDataService ?uva u SQL ? BudgetService ažurira keš
     Za particionisanje: new ServicePartitionKey(trosak.PlanPutovanjaId)
```

**DobaviUkupnuPotrosnjuAsync(int planId)**
- **2-fazna strategija**:
  1. Prvo proverava keš - ako postoji, odmah vra?a (ultra brzo)
  2. Ako keš nedostaje (CACHE MISS):
     - Poziva TravelDataService da izra?una sumu iz baze
     - Popunjava keš sa tim vrednostima
     - Vra?a rezultat

```
Optimizacija: Minimizira SQL upite - ve?ina zahteva radi sa keš memorijom
```

**InvalidirajKesBudzetaAsync(int planId)**
- Briše vrednost iz keš memorije
- Koristi se kada se trošci izmene/brišu
- Slede?i `DobaviUkupnuPotrosnjuAsync()` ?e ponovljivo izra?unati iz baze

#### Integracija sa drugim servisima:
- **BudgetService ? SharingService**: Kada se doda trošak, šalje notifikaciju
- **WebAPI ? BudgetService**: Komunicira sa specifi?nom particijom:
  ```csharp
  var budgetProxy = ServiceProxy.Create<IBudgetService>(
      new Uri("fabric:/TravelPlannerApp/BudgetService"),
      new ServicePartitionKey(planId)); // Particionisano!
  ```

### 4. **SharingService** (Stateful Servis)
Servis za upravljanje notifikacijama i podelama planova.

#### Tehni?ki Detalji:
- **Tip**: Stateful Service
- **Stanje**: `IReliableQueue<string>` - Red ?ekanja za notifikacije
- **Svrha**: Prikupljanje doga?aja iz celog sistema

#### Klju?ne Metode:

**PosaljiNotifikacijuAsync(string poruka)**
- Dodaje notifikaciju u red ?ekanja
- Poziva je `BudgetService` kada se dodá trošak
- Notifikacija sadrži: ID plana, iznos, novi budžet

#### Tok Notifikacija:
```
1. Korisnik doda trošak preko WebAPI
2. TravelDataService ?uva u SQL
3. BudgetService ažurira keš i poziva SharingService
4. SharingService dodaje u red: "Plan 5: Dodat trošak od 50. Novi budžet iznosi: 250"
5. Frontend može polling-ovati SharingService za nove notifikacije
```

### 5. **TravelPlanner.Interfaces**
Zajedni?ki interfejsi i modeli koje dele svi servisi.

#### Interfejsi:
```csharp
ITravelDataService - Baza podataka operacije
IBudgetService - Budžet operacije
ISharingService - Notifikacije
```

#### Modelni Objekti:
```
PlanPutovanja, Destinacija, Aktivnost, Trosak, ToDoStavka, Korisnik,
KorisnikInfo, RegistracijaDto, PrijavaDto, ZahtevZaDeljenje
```

---

## ?? Sigurnosni Mehanizmi

### Autentifikacija - JWT (JSON Web Tokens)

**Tok logovanja:**
1. Korisnik šalje email + lozinka na `/api/auth/login`
2. TravelDataService verifikuje sa `BCrypt.Verify()`
3. WebAPI generiše JWT token sa 2-satnim rokom trajanja
4. Frontend ?uva token u localStorage i šalje u svakom zahtevom u `Authorization: Bearer {token}`

**Token Struktura:**
```json
{
  "sub": "1",           // User ID
  "name": "Marko",      // Ime
  "email": "m@test.com",// Email
  "role": "KORISNIK",   // Uloga
  "iss": "TravelPlannerApp",
  "aud": "TravelPlannerAppUsers",
  "exp": 1234567890    // Ekspirano nakon 2 sata
}
```

### Autorizacija - Role-Based Access Control (RBAC)

**Nivoi pristupa:**
```
- KORISNIK  - Može upravljati svojim planovima
- ADMIN     - Ima pristup svim korisnicima i može menjati uloge
```

**Primena:**
```csharp
[Authorize]                          // Samo autentifikovani
[Authorize(Roles = "ADMIN")]        // Samo admini
[AllowAnonymous]                    // Javno dostupno
```

### Sharing Tokens - Specifi?ni Tokeni za Deljenje

Odvojena autentifikacija od glavni JWT tokena:

**Karakteristike:**
- Kra?e trajanje (definiše korisnik pri generisanju)
- Sadrži samo `PlanId` i `NivoPristupa`
- Druga?iji tajni klju? i issuer od glavnog JWT-a
- `[AllowAnonymous]` endpoint - može pristupiti bilo ko sa validnim tokenom

**Primer Tokena za Deljenje:**
```json
{
  "PlanId": "5",
  "NivoPristupa": "VIEW",           // ili "EDIT"
  "TipTokena": "DeljenjePlana",     // Zaštita od reuse-a
  "exp": 1234567890                 // Kratko trajanje
}
```

### Heširavanje Lozinki - BCrypt

Lozinke se NIKAD ne ?uvaju u bazi:
```csharp
// Pri registraciji:
LozinkaHash = BCrypt.Net.BCrypt.HashPassword(lozinka); // Automats salt + hash

// Pri logovanja:
bool validna = BCrypt.Net.BCrypt.Verify(unosenaaLozinka, hashIzBaze);
```

---

## ?? Komunikacija Izme?u Servisa

### Service Fabric Remoting - RPC Pozivi

Servisi komuniciraju preko **proxy objekata** umesto HTTP zahteva:

```csharp
// U WebAPI-ju:
var travelDataProxy = ServiceProxy.Create<ITravelDataService>(
    new Uri("fabric:/TravelPlannerApp/TravelDataService"));

var planovi = await travelDataProxy.GetPlanoviPutovanjaAsync(korisnikId);
```

### Particionisanje - Stateful Servisi

BudgetService je particionisana po `PlanId`:

```csharp
// Uvek pozivamo ISTU particiju za isti plan:
var budgetProxy = ServiceProxy.Create<IBudgetService>(
    new Uri("fabric:/TravelPlannerApp/BudgetService"),
    new ServicePartitionKey(planId)); // Klju? particionisanja

var potrosnja = await budgetProxy.DobaviUkupnuPotrosnjuAsync(planId);
```

**Zašto je ovo važno?**
- Sve operacije za jedan plan idu na istu mašinu/repliku
- Brže je jer nema mrežne latencije izme?u particija
- Keš ostaje lokalan na particiji

### Tok Dodavanja Troška (End-to-End)

```
Frontend (React)
    ? POST /api/planputovanja/trosak
WebAPI (AuthController validira JWT)
    ? ServiceProxy.Create<ITravelDataService>
TravelDataService
    ? INSERT INTO Troskovi
SQL Server Database
    ? return true
WebAPI ? ServiceProxy.Create<IBudgetService> (sa ServicePartitionKey)
BudgetService (Particija za ovaj plan)
    ? Inkrementira keš memoriju
    ? Poziva SharingService
SharingService
    ? Enqueue notifikacija
Frontend
    ? Polling/WebSocket ?eka rezultat
    ? Prikazuje "Trošak od 50 je dodat!"
```

---

## ?? Startup Procesa

### 1. **Program.cs** - Inicijalizacija Servisa

Svaki servis se startuje kroz Service Fabric host:

```csharp
// BudgetService/Program.cs
ServiceRuntime.RegisterServiceAsync("BudgetServiceType", 
    context => new BudgetService(context)).GetAwaiter().GetResult();
```

Ovo generiše `Service Fabric Application` koja pokre?e sve:
- WebAPI na `http://localhost:8080`
- TravelDataService kao remote servis
- BudgetService kao stateful servis
- SharingService kao stateful servis

### 2. **Konfiguracija Baze Podataka**

```csharp
// TravelDbContext.cs
optionsBuilder.UseSqlServer(
    @"Server=.\SQLEXPRESS;Database=TravelPlanner_obren;Trusted_Connection=True;");
```

Automatski se pravi baza pri prvom conect-u.

### 3. **Migracije Entity Framework-a**

Migracije u `TravelDataService/Migrations/`:
- `20260520155429_InicijalnaBaza.cs` - Kreiranje svih tabela
- `20260614081502_ToDoLista.cs` - Dodavanje To-Do tabele
- `20260614094151_Korisnici.cs` - Dodavanje Korisnici tabele
- `20260615100838_DodatKorisnikUPlanove.cs` - FK od korisnika
- `20260618003928_DodateAktivnosti.cs` - Dodavanje Aktivnosti tabele

---

## ?? Specifi?ni Scenariji Upotrebe

### Scenario 1: Kreiranje i Upravljanje Planom

```
1. Frontend ? POST /api/auth/login
   ? Korisnik dobija JWT token

2. Frontend ? POST /api/planputovanja (sa JWT token-om)
   {
     "naziv": "Italija 2026",
     "opis": "Jednonedelni odmor",
     "planiraniBudzet": 2000
   }
   ? WebAPI izvla?i korisnikId iz JWT-a
   ? TravelDataService pravi plan sa tim korisnikId-om
   ? Vra?a se OK + plan sa novim ID-om

3. Frontend ? GET /api/planputovanja
   ? Preuzima sve planove za tog korisnika

4. Frontend ? GET /api/planputovanja/1
   ? Preuzima detaljan plan sa svim relacijama
   {
     "id": 1,
     "naziv": "Italija 2026",
     "destinacije": [
       {
         "id": 1,
         "nazivMesta": "Rim",
         "aktivnosti": [...]
       }
     ],
     "troskovi": [
       { "kategorija": "Hotel", "iznos": 500 }
     ]
   }
```

### Scenario 2: Dodavanje Troška i Pra?enje Budžeta

```
1. Frontend ? POST /api/planputovanja/trosak
   {
     "kategorija": "Hrana",
     "iznos": 75.50,
     "datum": "2026-06-15",
     "planPutovanjaId": 1
   }
   
2. TravelDataService ?uva u SQL
   
3. WebAPI ? BudgetService (ServicePartitionKey(1))
   ? Inkrementira keš: budžet[1] = 500 + 75.50 = 575.50
   ? BudgetService ? SharingService
   ? Notifikacija: "Plan 1: Dodat trošak od 75.50. Novi budžet: 575.50"

4. Frontend ? GET /api/planputovanja/1/potrosnja
   {
     "planPutovanjaId": 1,
     "ukupnaPotrosnja": 575.50
   }
```

### Scenario 3: Deljenje Plana sa Prijateljima

```
1. Korisnik (ID=5) želi da deli plan 10 sa prijateljima

2. Frontend ? POST /api/planputovanja/10/generisi-token
   {
     "nivoPristupa": "VIEW",
     "trajanjeUMinutima": 60
   }
   ? WebAPI generiše JWT sa 1-satnim rokom
   ? Vra?a token: "eyJhbGc..."

3. Korisnik šalje token prijatelju kroz URL:
   https://frontend.com/planovi/pristup/eyJhbGc...

4. Prijatelj (bez logovanja) ? GET /api/planputovanja/validiraj-deljenje/eyJhbGc...
   ? [AllowAnonymous] endpoint validira token
   ? Ako je validan, vra?a ceo plan sa svim podacima
   
5. Frontend prikazuje plan sa "READ-ONLY" mode jer je nivoPristupa = "VIEW"
```

### Scenario 4: Administrativne Funkcije

```
1. Admin (uloga=ADMIN) ? GET /api/admin/korisnici
   ? Preuzima listu svih korisnika
   
2. Admin ? PUT /api/admin/korisnici/3/uloga
   { "novaUloga": "ADMIN" }
   ? Promene korisnika 3 u admina
   
3. Admin ? DELETE /api/admin/korisnici/7
   ? Briše korisnika (ali ne može obrisati ID=1 - glavni admin)
```

---

## ?? Konfiguracija i Zavisnosti

### NuGet Paketi (Klju?ni)
- **Microsoft.ServiceFabric.Services** - Service Fabric SDK
- **Microsoft.AspNetCore.Authentication.JwtBearer** - JWT autentifikacija
- **Microsoft.EntityFrameworkCore.SqlServer** - EF + SQL Server
- **BCrypt.Net-Core** - Heširovanje lozinki
- **System.IdentityModel.Tokens.Jwt** - JWT tokenizacija

### Hardkodirani Tajni Klju?evi (BEZBEDNOST!)
?? **VAŽNO**: Ovi klju?evi su hardkodirani u razvoju, ALI se MORAJU prebaciti u Secrets ili Azure Key Vault za produkciju:

```csharp
// JWT g?ówny klju?
"nekiTajniKljucZaJWTmoraDaBudeJakoDugacakIliEnkripcijaNeceRaditiKakoTrebaIProgramCeOtkazati"

// Sharing token klju?
"OvoJeTajniKljucZaGenerisanjeTokenaKojiTrebaDaBudeDugacakMinimum32Karaktera"
```

---

## ?? Debugovanje i Logovanje

### Service Fabric Event Source
Svi servisi koriste `ServiceEventSource.Current.ServiceMessage()`:

```csharp
ServiceEventSource.Current.ServiceMessage(context, $"Kreiram plan: {plan.Naziv}");
```

Log se vidi u:
- Event Viewer (Windows) - Applications and Services Logs ? Microsoft-ServiceFabric
- Service Fabric Explorer - Properties servisa
- Output u Visual Studio

---

## ?? Struktura Foldera

```
web2_backend/
??? WebAPI/
?   ??? Controllers/
?   ?   ??? AuthController.cs
?   ?   ??? PlanPutovanjaController.cs
?   ?   ??? AdminController.cs
?   ??? WebAPI.cs (Service Fabric starost)
?   ??? Program.cs
?
??? TravelDataService/
?   ??? Models/
?   ?   ??? TravelDbContext.cs
?   ??? Migrations/
?   ?   ??? [EF migracije]
?   ??? TravelDataService.cs
?   ??? Program.cs
?
??? BudgetService/
?   ??? BudgetService.cs
?   ??? Program.cs
?
??? SharingService/
?   ??? SharingService.cs
?   ??? Program.cs
?
??? TravelPlanner.Interfaces/
?   ??? Models/
?   ?   ??? PlanPutovanja.cs
?   ?   ??? Destinacija.cs
?   ?   ??? Aktivnost.cs
?   ?   ??? Trosak.cs
?   ?   ??? ToDoStavka.cs
?   ?   ??? Korisnik.cs
?   ?   ??? ...
?   ??? ITravelDataService.cs
?   ??? IBudgetService.cs
?   ??? ISharingService.cs
?
??? TravelPlannerApp/ (Service Fabric manifest?)
    ??? ApplicationPackageRoot/
        ??? ApplicationManifest.xml
```

---

## ?? Zaklju?ak

TravelPlanner je **distribuirana aplikacija** sa **mikroservisnom arhitekturom** koja demonstrira:

? **Stateless servisi** - WebAPI i TravelDataService (bez stanja)
? **Stateful servisi** - BudgetService i SharingService (sa keš memorijom)
? **Particionisanje** - Brže ?itanja i pisanja za iste planove
? **RPC komunikacija** - Service Fabric Remoting umesto HTTP-a
? **Sigurnost** - JWT, RBAC, BCrypt heširovanje
? **ORM** - Entity Framework sa SQL Server bazom
? **Skalabilnost** - Automatsko skaliranje particija i servisa kroz Service Fabric

Svaki mikroservis ima jasnu odgovornost i komunicira sa ostalima kroz definirane interfejse.

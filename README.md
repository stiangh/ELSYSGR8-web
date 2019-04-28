# Nettside Gruppe 8

- [Link til nettsiden](https://folk.ntnu.no/stiangh/AquaTech)
- [Link til Arduino-kode](https://github.com/haraldhj/ELSYSGR8)

Her ligger alle filene som tilhører nettsiden vår. Disse skal til enhver tid være up to date. Nedenfor har jeg satt opp en fremdriftsliste der vi kan krysse av når vi noe implementeres, og se fremdriften til siden. \"AquaTech\" er kun et placeholder-navn, og vil erstattes av det virkelige navnet når gruppen blir enige om dette.

Vi benytter PHP, HTML, CSS, JavaScript og en MySQL-database. Vi benytter oss av [Chart.js](https://chartjs.org) for tegning av grafer. Designet ligger hovedsaklig i `template.php` og `Includes/inno8_19.css`. De forskjellige sidene linker inn disse filene, og innholdet lastes så fra Content-mappen, i en fil med samme navn. F.eks ligger innholdet til `Data.php` i `Content/Data.php`. Dette er gjort slik at det skal være enkelt å endre på design og layout, uten å måtte gjøre samme endring i flere filer. I Includes-mappen har vi i tillegg en del PHP-filer som ikke skal vises, men som utfører andre oppgaver, som kommunikasjon med TTN og/eller databasen.

Kom gjerne med spørsmål og innspill. Jeg må bare beklage at koden knapt er kommentert, dette skal jeg forsøke å bli bedre på.

---

**Fremdrift:**

- [x] Lage repository på GitHub!
- [x] Lagring i database
  - [x] Sette opp database
  - [x] Automatisk lagring av målinger fra The Things Network
  - [x] Uthenting av data fra database
- [x] Fremstilling av data i tabeller og grafer
  - [x] Tabeller og grafer implementert
  - [x] Dynamisk oppdatering av tabeller og grafer m/AJAX
  - [x] Flere utvalg: Fra Dato til Dato, Siste antall dager, Siste antall målinger
  - [x] Mulighet til velge hvilke parametre som vises i tabeller og grafer
  - [x] Aliaser \(F.eks \"Temperatur\" istendenfor \"temp\"\)
  - [x] Mulighet til å eksportere data som CSV-fil
  - [x] Mulighet til eksportere grafer som PNG-filer
  - [x] Mulighet til å fargekode basert på måle-verdiene
- [x] Måleparametere Implementert
  - [x] Temperatur
  - [x] Turbiditet
  - [x] Timestamp (Fra TTN-Gatewayen som først mottok pakken)
  - [x] PH
  - [x] Konduktivitet
  - [x] Fargeanalyse
  - [ ] ~~Batteri%~~
- [x] Fjernstyring
  - [x] Mulighet til å legge inn downlink fra The Things Network gjennom nettsiden (Sovetid)
  - [x] Implementert i Arduino
  - [ ] ~~\(?\) Mulighet til å requeste ekstra måledata fra SSD~~
- [ ] Design
  - [x] Et fungerende, overordnet, midlertidig design
  - [ ] Endelig navn og logo for gruppen
  - [ ] Skikkelig design for datamaskiner
  - [ ] Skikkelig design for mobil
- [x] Innlogging-system
- [x] Varsling på E-mail
- [x] Informasjon om oss og vårt produkt (Noe annet enn Lorum Ipsum på forsiden)
- [ ] ~~.htaccess-fil~~
- [ ] ~~\(?\) Mulighet til å bruke egne algoritmer på data, kombinere data etc.~~
- [ ] ~~\(?\) Kontakt oss / Feedback - mulighet~~
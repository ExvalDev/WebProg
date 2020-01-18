# Willkommen bei Timetool



## How to install

- run `npm install`
- run `npm start`
- to fill some test Data in the Software
  - go to https://chill-hound.glitch.me/fakedata
  - press the Button 'Testdaten eintragen'


## Basis Funktionen
### Tabllen
  - customers
  - employees
  - projects 
  - timelogs
  
### APIs für alle Tabellen.
  - kompletter Inhalt -> get /api/v1/tabelle
  - Inhalt einer Reihe mit der id -> get /api/v1/tabelle/id 
  - Hinzufügen eines Datensatzes -> post /api/v1/tabelle
  - Update von Reihe mit id -> put /api/v1/tabelle/id
  - Läschen eines Datensatzes mit id -> delete /api/v1/tabelle/id
  

## Erweiterte Funktionen
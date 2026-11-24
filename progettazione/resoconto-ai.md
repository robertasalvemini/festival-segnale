## Sessione N.1

## Che cosa ho chiesto

- Capire perché `sedi.json` dava errore e come correggerlo.
- Completare `eventi.json` con i quattro eventi mancanti, ricavandoli da `programma.html` e `info.html`.
- Scrivere `dati/SCHEMA.md`: entità, campi, chiavi, relazione Evento–Sede, quantità, aggiornamento dei dati, contenuto della pagina e schema Mermaid.
- Far costruire le schede di `programma.html` da `eventi.json` e `sedi.json` con `fetch`, con messaggi per caricamento, nessun evento ed errore, e «Sede da definire» per un `sede_id` sbagliato.
- Aggiungere una sezione «Meteo a Torino adesso» con i dati di Open-Meteo, e portarla dentro `programma.html` e il suo stile in `style.css`.
- Domande di chiarimento: unire i file JavaScript, aprire il sito con una live preview, capire perché il meteo restava fermo.

## Che cosa ho usato, modificato o scartato

- **Usato:** i JSON completati, `SCHEMA.md`, `programma.js` (schede dai JSON), `meteo.js` (meteo attuale con fonte e licenza), gli stili dei messaggi e della card meteo ricavati dalle regole di `.event-card` in `style.css`.
- **Modificato:**
  - Ho spostato gli stili dal blocco `<style>` di `programma.html` a `style.css`.
  - Ho fatto diventare le etichette del meteo (Temperatura, Vento, Dato rilevato) del colore primario del sito.
  - Ho chiesto di ricevere solo le modifiche da fare nei file, senza che l'AI rigenerasse tutto.
- **Scartato:**
  - L'idea di unire tutti gli script in `script.js`: l'AI l'ha sconsigliata perché ogni pagina usa script diversi e un errore ne fermerebbe altri.

## Come ho verificato

- L'AI non poteva aprire il sito in un browser. Ha controllato il codice confrontandolo con i file che ho incollato (HTML, CSS, JSON): ad esempio ha ricavato i `sede_id` dai nomi delle sedi e ha verificato quali classi CSS esistevano già.
- Le prove sul funzionamento le ho fatte io in locale, con live preview ds VS Code, guardando le schede, il meteo e gli errori.

## Problemi e soluzioni

- **Errore in `sedi.json`:** c'erano tre array separati, e un file JSON può avere un solo valore radice. Soluzione: un solo array con gli oggetti separati da virgole.
- **Cambiando un `id` in `eventi.json` il luogo non cambiava:** la sede dipende da `sede_id`, non da `id`. Se cambia l'`id` di una sede, gli eventi collegati mostrano «Sede da definire».
- **`fetch` non funziona con il doppio clic sul file:** serve un server locale (Live Preview o Live Server, oppure `python -m http.server`).
- **Meteo fermo alle 18:15:** Open-Meteo aggiorna il dato ogni 15 minuti e la pagina lo chiedeva una sola volta. Soluzione: richiesta ripetuta ogni 15 minuti con `setInterval` e `cache: 'no-store'`, tenendo i dati precedenti se un aggiornamento fallisce.
- **Contrasto del colore primario:** l'AI ha segnalato che `#C65C36` su bianco è poco sotto il rapporto consigliato per il testo piccolo e ha proposto `--colore-primario-scuro` come alternativa.
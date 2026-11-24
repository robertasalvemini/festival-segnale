(function () {
  'use strict';

  var PERCORSO_EVENTI = 'dati/eventi.json';
  var PERCORSO_SEDI = 'dati/sedi.json';
  var SEDE_MANCANTE = 'Sede da definire';

  var griglia = document.getElementById('elenco-eventi');
  var stato = document.getElementById('stato-eventi');

  var formatoData = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC'
  });

  // Mostra un messaggio al posto delle schede (caricamento, nessun evento, errore).
  function mostraStato(testo, isErrore) {
    stato.textContent = testo;
    stato.setAttribute('role', isErrore ? 'alert' : 'status');
    stato.hidden = false;
    griglia.replaceChildren();
  }

  function nascondiStato() {
    stato.hidden = true;
    stato.textContent = '';
  }

  // Legge un file JSON e verifica che contenga un array.
  function caricaJson(percorso) {
    return fetch(percorso).then(function (risposta) {
      if (!risposta.ok) {
        throw new Error('Errore HTTP ' + risposta.status + ' per ' + percorso);
      }
      return risposta.json();
    }).then(function (dati) {
      if (!Array.isArray(dati)) {
        throw new Error(percorso + ' non contiene un elenco');
      }
      return dati;
    });
  }

  // "2026-06-12" -> "Venerdì 12 giugno"
  function formattaData(isoData) {
    var data = new Date(isoData + 'T00:00:00Z');
    if (isNaN(data.getTime())) {
      return isoData || '';
    }
    var testo = formatoData.format(data);
    return testo.charAt(0).toUpperCase() + testo.slice(1);
  }

  function creaElemento(tag, classe, testo) {
    var el = document.createElement(tag);
    if (classe) { el.className = classe; }
    if (testo !== undefined) { el.textContent = testo; }
    return el;
  }

  function creaScheda(evento, sediPerId) {
    var sede = sediPerId.get(evento.sede_id);
    var nomeSede = sede && sede.nome ? sede.nome : SEDE_MANCANTE;

    var scheda = creaElemento('article', 'event-card');

    var img = document.createElement('img');
    img.src = evento.immagine || '';
    img.alt = evento.immagine_alt || '';
    img.width = 900;
    img.height = 600;
    scheda.appendChild(img);

    var corpo = creaElemento('div', 'event-body');

    var meta = [formattaData(evento.data), evento.orario, evento.categoria]
      .filter(Boolean)
      .join(' · ');
    corpo.appendChild(creaElemento('p', 'event-meta', meta));
    corpo.appendChild(creaElemento('h3', '', evento.titolo || ''));
    corpo.appendChild(creaElemento('p', '', evento.descrizione || ''));

    var luogo = creaElemento('p', 'event-place');
    luogo.appendChild(creaElemento('strong', '', 'Sede:'));
    luogo.appendChild(document.createTextNode(' ' + nomeSede));
    corpo.appendChild(luogo);

    scheda.appendChild(corpo);
    return scheda;
  }

  function mostraEventi(eventi, sedi) {
    var sediPerId = new Map(sedi.map(function (s) { return [s.id, s]; }));

    // Ordine cronologico: prima per data, poi per orario.
    var ordinati = eventi.slice().sort(function (a, b) {
      return (a.data + ' ' + a.orario).localeCompare(b.data + ' ' + b.orario);
    });

    griglia.replaceChildren.apply(
      griglia,
      ordinati.map(function (evento) { return creaScheda(evento, sediPerId); })
    );
  }

  function avvia() {
    mostraStato('Caricamento degli appuntamenti…', false);

    Promise.allSettled([caricaJson(PERCORSO_EVENTI), caricaJson(PERCORSO_SEDI)])
      .then(function (esiti) {
        var fallimenti = [];
        if (esiti[0].status === 'rejected') {
          fallimenti.push(PERCORSO_EVENTI);
          console.error(esiti[0].reason);
        }
        if (esiti[1].status === 'rejected') {
          fallimenti.push(PERCORSO_SEDI);
          console.error(esiti[1].reason);
        }

        if (fallimenti.length > 0) {
          mostraStato(
            'Non è stato possibile leggere ' +
            (fallimenti.length > 1 ? 'i file ' : 'il file ') +
            fallimenti.join(' e ') +
            '. Riprova più tardi.',
            true
          );
          return;
        }

        var eventi = esiti[0].value;
        var sedi = esiti[1].value;

        if (eventi.length === 0) {
          mostraStato('Al momento non ci sono appuntamenti in programma.', false);
          return;
        }

        mostraEventi(eventi, sedi);
        nascondiStato();
      })
      .catch(function (errore) {
        console.error(errore);
        mostraStato('Si è verificato un errore nella visualizzazione degli appuntamenti.', true);
      });
  }

  avvia();
})();
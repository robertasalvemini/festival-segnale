(function () {
  'use strict';

  var URL_METEO = 'https://api.open-meteo.com/v1/forecast' +
    '?latitude=45.0703&longitude=7.6869' +
    '&current=temperature_2m,wind_speed_10m' +
    '&timezone=Europe%2FRome';
  var TIMEOUT_MS = 8000;

  var contenitore = document.getElementById('meteo');
  if (!contenitore) { return; }

  function mostraMessaggio(testo, isErrore) {
    var p = document.createElement('p');
    p.className = 'stato-meteo';
    p.setAttribute('role', isErrore ? 'alert' : 'status');
    p.textContent = testo;
    contenitore.replaceChildren(p);
  }

  function formattaNumero(valore) {
    return Number(valore).toLocaleString('it-IT', { maximumFractionDigits: 1 });
  }

  // "2026-11-18T14:15" (ora di Torino) -> "18 novembre 2026, ore 14:15"
  function formattaOra(testo) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(testo || '');
    if (!m) { return testo || 'non disponibile'; }
    var data = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    var giorno = new Intl.DateTimeFormat('it-IT', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
    }).format(data);
    return giorno + ', ore ' + m[4] + ':' + m[5] + ' (ora di Torino)';
  }

  function aggiungiVoce(lista, etichetta, valore) {
    var dt = document.createElement('dt');
    dt.textContent = etichetta;
    var dd = document.createElement('dd');
    dd.textContent = valore;
    lista.appendChild(dt);
    lista.appendChild(dd);
  }

  function mostraMeteo(dati) {
    var attuale = dati && dati.current;
    var unita = (dati && dati.current_units) || {};
    if (!attuale ||
        typeof attuale.temperature_2m !== 'number' ||
        typeof attuale.wind_speed_10m !== 'number') {
      throw new Error('Risposta di Open-Meteo non valida');
    }

    var lista = document.createElement('dl');
    lista.className = 'meteo-dati';
    aggiungiVoce(lista, 'Temperatura',
      formattaNumero(attuale.temperature_2m) + ' ' + (unita.temperature_2m || '°C'));
    aggiungiVoce(lista, 'Vento',
      formattaNumero(attuale.wind_speed_10m) + ' ' + (unita.wind_speed_10m || 'km/h'));
    aggiungiVoce(lista, 'Dato rilevato', formattaOra(attuale.time));
    contenitore.replaceChildren(lista);
  }

  function avvia() {
    mostraMessaggio('Caricamento del meteo…', false);

    var controllo = new AbortController();
    var timer = setTimeout(function () { controllo.abort(); }, TIMEOUT_MS);

    fetch(URL_METEO, { signal: controllo.signal })
      .then(function (risposta) {
        if (!risposta.ok) { throw new Error('Errore HTTP ' + risposta.status); }
        return risposta.json();
      })
      .then(mostraMeteo)
      .catch(function (errore) {
        console.error(errore);
        mostraMessaggio('Il meteo non è disponibile in questo momento. Riprova più tardi.', true);
      })
      .finally(function () { clearTimeout(timer); });
  }

  avvia();
})();
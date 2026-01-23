Sidekick ist eine ADHS-Begleit-App für Anwender von Medikinet Adult (retardiert). Die App unterstützt beim täglichen Medikamenten-Management durch intelligentes Tracking und Visualisierung der Wirkstoffkurve.  
                                                                                                                                                                                                                      ---                                                                                                                                                                                                               
  Kernfunktionen                                                                                                                                                                                                                                                                                                                                                                                                                        
  1. Einnahme-Tracking
  - One-Tap-Logging mit vordefinierten Dosen (10mg/20mg/30mg)
  - Food-Check bei jeder Einnahme ("Hast du gegessen?")
  - Manuelles Nachtragen und Bearbeiten von Einnahmen
  - Haptisches Feedback zur Bestätigung

  2. Biphasische Wirkungskurve
  - Live-Visualisierung der Medikinet-Wirkung basierend auf Gauß-Verteilung
  - Phase 1 (Sofort-Freisetzung): Peak bei ~2h
  - Phase 2 (Retard-Freisetzung): Plateau bei ~5-6h
  - Rebound-Modellierung ab ~8h
  - "Jetzt"-Marker zeigt aktuelle Position auf der Kurve
  - Dynamisches Zeitfenster (1h vor bis 10h nach Einnahme)
  - Konfigurierbarer Stoffwechsel-Offset (±60 Minuten)

  3. Smart Notifications
  - T+0: Essens-Erinnerung (wenn ohne Nahrung eingenommen)
  - T+3,5h: Bio-Pause Snack-Alarm (Übergangsphase)
  - T+8h: Rebound-Warnung
  - Individuell aktivierbar/deaktivierbar

  4. Tages-Kontext
  - Morgen-Prompt für Schlafqualität (1-5) und Koffeinkonsum
  - Einfluss-Faktoren für spätere Korrelationsanalyse

  5. Check-In System (teilweise implementiert)
  - Gefühlsbewertungen in drei Kategorien: Fokus, Reizbarkeit, Unruhe
  - 5-stufige Skala pro Kategorie
  - Optionale Freitext-Notizen

  6. Gedanken-Schnellerfassung
  - Spontane Notizen mit Zeitstempel (max. 500 Zeichen)

  7. Mahlzeiten-Tracking
  - Erfassung von Frühstück, Bio-Snack, Mittagessen, Abendessen
  - Freitext-Beschreibung der Mahlzeiten

  8. Daten-Export
  - ChatGPT-Export (1-7 Tage auswählbar)
  - Für Arztgespräche oder Selbstanalyse

  ---
  Technische Basis

  - Stack: Expo 54 + TypeScript (strict) + Zustand + Expo Router
  - Persistenz: AsyncStorage mit Zustand Persist-Middleware
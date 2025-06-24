/*
  # Home Page Translations
  
  This migration adds translations for the home page content in multiple languages.
  
  1. Translations added:
     - Hero section (title, subtitle, CTA buttons)
     - Features section
     - Experience section
     - Testimonials section
     - Location section
     - CTA section
*/

-- Insert Home Page translations
-- This is an empty migration.
-- Add new translations for HomePage.tsx

INSERT INTO public.translations (key, language_code, text, category) VALUES
('home.hero.title_part1', 'en', 'Experience the Thrill of', 'homepage'),
('home.hero.title_part1', 'it', 'Vivi l''Emozione di', 'homepage'),
('home.hero.title_part1', 'de', 'Erleben Sie den Nervenkitzel von', 'homepage'),
('home.hero.title_part1', 'fr', 'Vivez le Frisson de', 'homepage'),
('home.hero.title_part1', 'es', 'Experimenta la Emoción de', 'homepage'),

('home.hero.title_part2', 'en', 'Yacht Racing', 'homepage'),
('home.hero.title_part2', 'it', 'Regate in Yacht', 'homepage'),
('home.hero.title_part2', 'de', 'Yachtrennen', 'homepage'),
('home.hero.title_part2', 'fr', 'Courses de Voile', 'homepage'),
('home.hero.title_part2', 'es', 'Carreras de Yates', 'homepage'),

('home.hero.subtitle', 'en', 'Daily yacht racing experiences in world-famous Lake Garda with professional skippers, racing medals, and unforgettable memories', 'homepage'),
('home.hero.subtitle', 'it', 'Esperienze quotidiane di regate in yacht nel famoso Lago di Garda con skipper professionisti, medaglie di gara e ricordi indimenticabili', 'homepage'),
('home.hero.subtitle', 'de', 'Tägliche Yachtrennsport-Erlebnisse am weltberühmten Gardasee mit professionellen Skippern, Rennmedaillen und unvergesslichen Erinnerungen', 'homepage'),
('home.hero.subtitle', 'fr', 'Expériences quotidiennes de régates sur le célèbre lac de Garde avec des skippers professionnels, des médailles de course et des souvenirs inoubliables', 'homepage'),
('home.hero.subtitle', 'es', 'Experiencias diarias de carreras de yates en el famoso Lago de Garda con patrones profesionales, medallas de regata y recuerdos inolvidables', 'homepage'),

('home.hero.price_description', 'en', 'per person • Full day experience', 'homepage'),
('home.hero.price_description', 'it', 'a persona • Esperienza di un giorno intero', 'homepage'),
('home.hero.price_description', 'de', 'pro Person • Ganztageserlebnis', 'homepage'),
('home.hero.price_description', 'fr', 'par personne • Expérience d''une journée complète', 'homepage'),
('home.hero.price_description', 'es', 'por persona • Experiencia de día completo', 'homepage'),

('home.hero.feature1', 'en', 'Real yacht racing format', 'homepage'),
('home.hero.feature1', 'it', 'Vero formato di regata in yacht', 'homepage'),
('home.hero.feature1', 'de', 'Echtes Yachtrennsport-Format', 'homepage'),
('home.hero.feature1', 'fr', 'Format de course de voile réel', 'homepage'),
('home.hero.feature1', 'es', 'Formato de carrera de yates real', 'homepage'),

('home.hero.feature2', 'en', 'Professional skipper on every boat', 'homepage'),
('home.hero.feature2', 'it', 'Skipper professionista su ogni barca', 'homepage'),
('home.hero.feature2', 'de', 'Professioneller Skipper auf jedem Boot', 'homepage'),
('home.hero.feature2', 'fr', 'Skipper professionnel sur chaque bateau', 'homepage'),
('home.hero.feature2', 'es', 'Patrón profesional en cada barco', 'homepage'),

('home.hero.feature3', 'en', 'Open to all skill levels – no experience needed', 'homepage'),
('home.hero.feature3', 'it', 'Aperto a tutti i livelli di abilità – nessuna esperienza richiesta', 'homepage'),
('home.hero.feature3', 'de', 'Offen für alle Fähigkeitsstufen – keine Erfahrung erforderlich', 'homepage'),
('home.hero.feature3', 'fr', 'Ouvert à tous les niveaux – aucune expérience requise', 'homepage'),
('home.hero.feature3', 'es', 'Abierto a todos los niveles de habilidad – no se necesita experiencia', 'homepage'),

('home.hero.feature4', 'en', 'Professional photos & videos from the race', 'homepage'),
('home.hero.feature4', 'it', 'Foto e video professionali della gara', 'homepage'),
('home.hero.feature4', 'de', 'Professionelle Fotos & Videos vom Rennen', 'homepage'),
('home.hero.feature4', 'fr', 'Photos & vidéos professionnelles de la course', 'homepage'),
('home.hero.feature4', 'es', 'Fotos y videos profesionales de la carrera', 'homepage'),

('home.hero.feature5', 'en', 'All equipment provided', 'homepage'),
('home.hero.feature5', 'it', 'Tutta l''attrezzatura fornita', 'homepage'),
('home.hero.feature5', 'de', 'Alle Ausrüstung wird gestellt', 'homepage'),
('home.hero.feature5', 'fr', 'Tout l''équipement fourni', 'homepage'),
('home.hero.feature5', 'es', 'Todo el equipo proporcionado', 'homepage'),

('home.hero.cta', 'en', 'Book Your Adventure', 'homepage'),
('home.hero.cta', 'it', 'Prenota la Tua Avventura', 'homepage'),
('home.hero.cta', 'de', 'Buchen Sie Ihr Abenteuer', 'homepage'),
('home.hero.cta', 'fr', 'Réservez Votre Aventure', 'homepage'),
('home.hero.cta', 'es', 'Reserva Tu Aventura', 'homepage'),

('home.features.title', 'en', 'Why Choose Garda Racing?', 'homepage'),
('home.features.title', 'it', 'Perché Scegliere Garda Racing?', 'homepage'),
('home.features.title', 'de', 'Warum Garda Racing wählen?', 'homepage'),
('home.features.title', 'fr', 'Pourquoi Choisir Garda Racing?', 'homepage'),
('home.features.title', 'es', '¿Por qué elegir Garda Racing?', 'homepage'),

('home.features.subtitle', 'en', 'We provide the complete yacht racing experience with professional guidance, premium equipment, and memories that last a lifetime.', 'homepage'),
('home.features.subtitle', 'it', 'Offriamo l''esperienza completa di regate in yacht con guida professionale, attrezzatura premium e ricordi che durano una vita.', 'homepage'),
('home.features.subtitle', 'de', 'Wir bieten das komplette Yachtrennsport-Erlebnis mit professioneller Anleitung, Premium-Ausrüstung und lebenslangen Erinnerungen.', 'homepage'),
('home.features.subtitle', 'fr', 'Nous offrons l''expérience complète de course de voile avec des conseils professionnels, un équipement de qualité supérieure et des souvenirs qui durent toute une vie.', 'homepage'),
('home.features.subtitle', 'es', 'Ofrecemos la experiencia completa de carreras de yates con orientación profesional, equipo premium y recuerdos que duran toda la vida.', 'homepage'),

('home.features.item1.title', 'en', 'Real Racing Format', 'homepage'),
('home.features.item1.title', 'it', 'Vero Formato di Regata', 'homepage'),
('home.features.item1.title', 'de', 'Echtes Rennformat', 'homepage'),
('home.features.item1.title', 'fr', 'Format de Course Réel', 'homepage'),
('home.features.item1.title', 'es', 'Formato de Carrera Real', 'homepage'),

('home.features.item1.description', 'en', 'Authentic yacht regatta with team dynamics, medals, and true competition.', 'homepage'),
('home.features.item1.description', 'it', 'Autentica regata in yacht con dinamiche di squadra, medaglie e vera competizione.', 'homepage'),
('home.features.item1.description', 'de', 'Authentische Yachtregatta mit Teamdynamik, Medaillen und echtem Wettbewerb.', 'homepage'),
('home.features.item1.description', 'fr', 'Régate de yacht authentique avec dynamique d''équipe, médailles et véritable compétition.', 'homepage'),
('home.features.item1.description', 'es', 'Auténtica regata de yates con dinámica de equipo, medallas y verdadera competición.', 'homepage'),

('home.features.item2.title', 'en', 'Professional Skipper', 'homepage'),
('home.features.item2.title', 'it', 'Skipper Professionista', 'homepage'),
('home.features.item2.title', 'de', 'Professioneller Skipper', 'homepage'),
('home.features.item2.title', 'fr', 'Skipper Professionnel', 'homepage'),
('home.features.item2.title', 'es', 'Patrón Profesional', 'homepage'),

('home.features.item2.description', 'en', 'Certified and experienced sailing captains on every boat.', 'homepage'),
('home.features.item2.description', 'it', 'Capitani di vela certificati ed esperti su ogni barca.', 'homepage'),
('home.features.item2.description', 'de', 'Zertifizierte und erfahrene Segelkapitäne auf jedem Boot.', 'homepage'),
('home.features.item2.description', 'fr', 'Capitaines de voile certifiés et expérimentés sur chaque bateau.', 'homepage'),
('home.features.item2.description', 'es', 'Capitanes de vela certificados y experimentados en cada barco.', 'homepage'),

('home.features.item3.title', 'en', 'Photo & Video', 'homepage'),
('home.features.item3.title', 'it', 'Foto & Video', 'homepage'),
('home.features.item3.title', 'de', 'Foto & Video', 'homepage'),
('home.features.item3.title', 'fr', 'Photo & Vidéo', 'homepage'),
('home.features.item3.title', 'es', 'Foto y Video', 'homepage'),

('home.features.item3.description', 'en', 'Professional photos and videos of your race day to remember and share.', 'homepage'),
('home.features.item3.description', 'it', 'Foto e video professionali della tua giornata di gara da ricordare e condividere.', 'homepage'),
('home.features.item3.description', 'de', 'Professionelle Fotos und Videos von Ihrem Renntag zum Erinnern und Teilen.', 'homepage'),
('home.features.item3.description', 'fr', 'Photos et vidéos professionnelles de votre journée de course à retenir et à partager.', 'homepage'),
('home.features.item3.description', 'es', 'Fotos y videos profesionales de tu día de carrera para recordar y compartir.', 'homepage'),

('home.features.item4.title', 'en', 'Fully Insured', 'homepage'),
('home.features.item4.title', 'it', 'Completamente Assicurato', 'homepage'),
('home.features.item4.title', 'de', 'Voll versichert', 'homepage'),
('home.features.item4.title', 'fr', 'Entièrement Assuré', 'homepage'),
('home.features.item4.title', 'es', 'Totalmente Asegurado', 'homepage'),

('home.features.item4.description', 'en', 'Complete safety coverage and modern equipment included.', 'homepage'),
('home.features.item4.description', 'it', 'Copertura di sicurezza completa e attrezzatura moderna inclusa.', 'homepage'),
('home.features.item4.description', 'de', 'Umfassende Sicherheitsabdeckung und moderne Ausrüstung inklusive.', 'homepage'),
('home.features.item4.description', 'fr', 'Couverture de sécurité complète et équipement moderne inclus.', 'homepage'),
('home.features.item4.description', 'es', 'Cobertura de seguridad completa y equipo moderno incluido.', 'homepage'),

('home.features.item5.title', 'en', 'Accessible & Premium', 'homepage'),
('home.features.item5.title', 'it', 'Accessibile & Premium', 'homepage'),
('home.features.item5.title', 'de', 'Zugänglich & Premium', 'homepage'),
('home.features.item5.title', 'fr', 'Accessible & Premium', 'homepage'),
('home.features.item5.title', 'es', 'Accesible y Premium', 'homepage'),

('home.features.item5.description', 'en', 'A top-level regatta experience open to everyone — no experience needed.', 'homepage'),
('home.features.item5.description', 'it', 'Un''esperienza di regata di alto livello aperta a tutti — nessuna esperienza richiesta.', 'homepage'),
('home.features.item5.description', 'de', 'Ein erstklassiges Regatta-Erlebnis für jedermann – keine Erfahrung erforderlich.', 'homepage'),
('home.features.item5.description', 'fr', 'Une expérience de régate de haut niveau ouverte à tous — aucune expérience requise.', 'homepage'),
('home.features.item5.description', 'es', 'Una experiencia de regata de alto nivel abierta a todos — no se necesita experiencia.', 'homepage'),

('home.experience.title', 'en', 'Your Perfect Day on Lake Garda', 'homepage'),
('home.experience.title', 'it', 'La Tua Giornata Perfetta sul Lago di Garda', 'homepage'),
('home.experience.title', 'de', 'Ihr perfekter Tag am Gardasee', 'homepage'),
('home.experience.title', 'fr', 'Votre Journée Parfaite sur le Lac de Garde', 'homepage'),
('home.experience.title', 'es', 'Tu Día Perfecto en el Lago de Garda', 'homepage'),

('home.experience.step1.title', 'en', 'Morning Briefing', 'homepage'),
('home.experience.step1.title', 'it', 'Briefing Mattutino', 'homepage'),
('home.experience.step1.title', 'de', 'Morgenbesprechung', 'homepage'),
('home.experience.step1.title', 'fr', 'Briefing du Matin', 'homepage'),
('home.experience.step1.title', 'es', 'Sesión Informativa Matutina', 'homepage'),

('home.experience.step1.description', 'en', 'Meet your professional skipper and learn the basics of yacht racing in a relaxed, friendly environment.', 'homepage'),
('home.experience.step1.description', 'it', 'Incontra il tuo skipper professionista e impara le basi delle regate in yacht in un ambiente rilassato e amichevole.', 'homepage'),
('home.experience.step1.description', 'de', 'Treffen Sie Ihren professionellen Skipper und lernen Sie die Grundlagen des Yachtrennsports in einer entspannten, freundlichen Umgebung.', 'homepage'),
('home.experience.step1.description', 'fr', 'Rencontrez votre skipper professionnel et apprenez les bases de la course de voile dans un environnement détendu et convivial.', 'homepage'),
('home.experience.step1.description', 'es', 'Conoce a tu patrón profesional y aprende los conceptos básicos de las carreras de yates en un ambiente relajado y amigable.', 'homepage'),

('home.experience.step2.title', 'en', 'Racing Experience', 'homepage'),
('home.experience.step2.title', 'it', 'Esperienza di Regata', 'homepage'),
('home.experience.step2.title', 'de', 'Rennerlebnis', 'homepage'),
('home.experience.step2.title', 'fr', 'Expérience de Course', 'homepage'),
('home.experience.step2.title', 'es', 'Experiencia de Carrera', 'homepage'),

('home.experience.step2.description', 'en', 'Participate in authentic yacht races with other boats, experiencing the thrill of competition on beautiful Lake Garda.', 'homepage'),
('home.experience.step2.description', 'it', 'Partecipa a autentiche regate in yacht con altre barche, vivendo l''emozione della competizione sul bellissimo Lago di Garda.', 'homepage'),
('home.experience.step2.description', 'de', 'Nehmen Sie an authentischen Yachtrennen mit anderen Booten teil und erleben Sie den Nervenkitzel des Wettbewerbs auf dem wunderschönen Gardasee.', 'homepage'),
('home.experience.step2.description', 'fr', 'Participez à d''authentiques courses de voile avec d''autres bateaux, en vivant le frisson de la compétition sur le magnifique lac de Garde.', 'homepage'),
('home.experience.step2.description', 'es', 'Participa en auténticas carreras de yates con otros barcos, experimentando la emoción de la competición en el hermoso Lago de Garda.', 'homepage'),

('home.experience.step3.title', 'en', 'Medal Ceremony', 'homepage'),
('home.experience.step3.title', 'it', 'Cerimonia di Premiazione', 'homepage'),
('home.experience.step3.title', 'de', 'Siegerehrung', 'homepage'),
('home.experience.step3.title', 'fr', 'Cérémonie de Remise des Médailles', 'homepage'),
('home.experience.step3.title', 'es', 'Ceremonia de Medallas', 'homepage'),

('home.experience.step3.description', 'en', 'Celebrate your achievement with an official medal.', 'homepage'),
('home.experience.step3.description', 'it', 'Festeggia il tuo **traguardo** con una medaglia ufficiale.', 'homepage'),
('home.experience.step3.description', 'de', 'Feiern Sie Ihre **Leistung** mit einer offiziellen Medaille.', 'homepage'),
('home.experience.step3.description', 'fr', 'Célébrez votre **réussite** avec une médaille officielle.', 'homepage'),
('home.experience.step3.description', 'es', 'Celebra tu **logro** con una medalla oficial.', 'homepage')

('home.experience.cta', 'en', 'Learn More About the Experience', 'homepage'),
('home.experience.cta', 'it', 'Scopri di Più sull''Esperienza', 'homepage'),
('home.experience.cta', 'de', 'Erfahren Sie mehr über das Erlebnis', 'homepage'),
('home.experience.cta', 'fr', 'En Savoir Plus sur l''Expérience', 'homepage'),
('home.experience.cta', 'es', 'Aprende Más sobre la Experiencia', 'homepage'),

('home.testimonials.title', 'en', 'What Our Sailors Say', 'homepage'),
('home.testimonials.title', 'it', 'Cosa Dicono i Nostri Marinai', 'homepage'),
('home.testimonials.title', 'de', 'Was unsere Segler sagen', 'homepage'),
('home.testimonials.title', 'fr', 'Ce que Disent Nos Marins', 'homepage'),
('home.testimonials.title', 'es', 'Lo que Dicen Nuestros Marineros', 'homepage'),

('home.testimonials.subtitle', 'en', 'Join thousands of satisfied customers who''ve experienced the magic of Lake Garda racing', 'homepage'),
('home.testimonials.subtitle', 'it', 'Unisciti a migliaia di clienti soddisfatti che hanno vissuto la magia delle regate sul Lago di Garda', 'homepage'),
('home.testimonials.subtitle', 'de', 'Schließen Sie sich Tausenden zufriedener Kunden an, die die Magie des Gardasee-Rennsports erlebt haben', 'homepage'),
('home.testimonials.subtitle', 'fr', 'Rejoignez des milliers de clients satisfaits qui ont vécu la magie des courses sur le lac de Garde', 'homepage'),
('home.testimonials.subtitle', 'es', 'Únete a miles de clientes satisfechos que han experimentado la magia de las carreras en el Lago de Garda', 'homepage'),

('home.testimonials.connection_error', 'en', 'Currently showing sample testimonials - database connection unavailable', 'homepage'),
('home.testimonials.connection_error', 'it', 'Attualmente vengono mostrate testimonianze di esempio - connessione al database non disponibile', 'homepage'),
('home.testimonials.connection_error', 'de', 'Derzeit werden Beispiel-Testimonials angezeigt - Datenbankverbindung nicht verfügbar', 'homepage'),
('home.testimonials.connection_error', 'fr', 'Affichage d''exemples de témoignages - connexion à la base de données indisponible', 'homepage'),
('home.testimonials.connection_error', 'es', 'Actualmente se muestran testimonios de ejemplo - conexión a la base de datos no disponible', 'homepage'),

('home.location.title', 'en', 'Prime Location in Riva del Garda', 'homepage'),
('home.location.title', 'it', 'Posizione Strategica a Riva del Garda', 'homepage'),
('home.location.title', 'de', 'Erstklassige Lage in Riva del Garda', 'homepage'),
('home.location.title', 'fr', 'Emplacement Privilégié à Riva del Garda', 'homepage'),
('home.location.title', 'es', 'Ubicación Privilegiada en Riva del Garda', 'homepage'),

('home.location.item1.title', 'en', 'Easy Access from Munich', 'homepage'),
('home.location.item1.title', 'it', 'Facile Accesso da Monaco', 'homepage'),
('home.location.item1.title', 'de', 'Einfacher Zugang von München', 'homepage'),
('home.location.item1.title', 'fr', 'Accès Facile depuis Munich', 'homepage'),
('home.location.item1.title', 'es', 'Fácil Acceso desde Múnich', 'homepage'),

('home.location.item1.description', 'en', 'Just 4 hours drive from Munich, making it perfect for weekend getaways and corporate events.', 'homepage'),
('home.location.item1.description', 'it', 'A soli 4 ore di auto da Monaco, il che lo rende perfetto per fughe nel fine settimana ed eventi aziendali.', 'homepage'),
('home.location.item1.description', 'de', 'Nur 4 Autostunden von München entfernt, ideal für Wochenendausflüge und Firmenveranstaltungen.', 'homepage'),
('home.location.item1.description', 'fr', 'À seulement 4 heures de route de Munich, ce qui le rend parfait pour les escapades de week-end et les événements d''entreprise.', 'homepage'),
('home.location.item1.description', 'es', 'A solo 4 horas en coche de Múnich, lo que lo hace perfecto para escapadas de fin de semana y eventos corporativos.', 'homepage'),

('home.location.item2.title', 'en', 'World-Class Sailing Conditions', 'homepage'),
('home.location.item2.title', 'it', 'Condizioni di Navigazione di Classe Mondiale', 'homepage'),
('home.location.item2.title', 'de', 'Weltklasse-Segelbedingungen', 'homepage'),
('home.location.item2.title', 'fr', 'Conditions de Navigation de Classe Mondiale', 'homepage'),
('home.location.item2.title', 'es', 'Condiciones de Navegación de Clase Mundial', 'homepage'),

('home.location.item2.description', 'en', 'Lake Garda offers consistent winds and stunning Alpine scenery, making it Europe''s premier sailing destination.', 'homepage'),
('home.location.item2.description', 'it', 'Il Lago di Garda offre venti costanti e uno splendido scenario alpino, rendendolo la principale destinazione velica d''Europa.', 'homepage'),
('home.location.item2.description', 'de', 'Der Gardasee bietet konstante Winde und eine atemberaubende Alpenlandschaft, was ihn zu Europas führendem Segelziel macht.', 'homepage'),
('home.location.item2.description', 'fr', 'Le lac de Garde offre des vents constants et des paysages alpins époustouflants, ce qui en fait la première destination de voile d''Europe.', 'homepage'),
('home.location.item2.description', 'es', 'El Lago de Garda ofrece vientos constantes y un impresionante paisaje alpino, lo que lo convierte en el principal destino de navegación de Europa.', 'homepage'),

('home.location.item3.title', 'en', 'Daily Departures', 'homepage'),
('home.location.item3.title', 'it', 'Partenze Quotidiane', 'homepage'),
('home.location.item3.title', 'de', 'Tägliche Abfahrten', 'homepage'),
('home.location.item3.title', 'fr', 'Départs Quotidiens', 'homepage'),
('home.location.item3.title', 'es', 'Salidas Diarias', 'homepage'),

('home.location.item3.description', 'en', 'Multiple time slots available daily from March to October, with flexible booking options.', 'homepage'),
('home.location.item3.description', 'it', 'Più fasce orarie disponibili ogni giorno da marzo a ottobre, con opzioni di prenotazione flessibili.', 'homepage'),
('home.location.item3.description', 'de', 'Mehrere Zeitfenster täglich von März bis Oktober verfügbar, mit flexiblen Buchungsoptionen.', 'homepage'),
('home.location.item3.description', 'fr', 'Plusieurs créneaux horaires disponibles tous les jours de mars à octobre, avec des options de réservation flexibles.', 'homepage'),
('home.location.item3.description', 'es', 'Múltiples franjas horarias disponibles diariamente de marzo a octubre, con opciones de reserva flexibles.', 'homepage'),

('home.location.google_rating', 'en', 'Google Rating', 'homepage'),
('home.location.google_rating', 'it', 'Valutazione Google', 'homepage'),
('home.location.google_rating', 'de', 'Google Bewertung', 'homepage'),
('home.location.google_rating', 'fr', 'Note Google', 'homepage'),
('home.location.google_rating', 'es', 'Calificación de Google', 'homepage'),

('home.partners.title', 'en', 'Our Trusted Partners', 'homepage'),
('home.partners.title', 'it', 'I Nostri Partner Affidabili', 'homepage'),
('home.partners.title', 'de', 'Unsere vertrauenswürdigen Partner', 'homepage'),
('home.partners.title', 'fr', 'Nos Partenaires de Confiance', 'homepage'),
('home.partners.title', 'es', 'Nuestros Socios de Confianza', 'homepage'),

('home.partners.subtitle', 'en', 'We work with the world''s leading yacht and marine equipment manufacturers to provide you with the best possible sailing experience.', 'homepage'),
('home.partners.subtitle', 'it', 'Collaboriamo con i principali produttori mondiali di yacht e attrezzature marine per offrirti la migliore esperienza di navigazione possibile.', 'homepage'),
('home.partners.subtitle', 'de', 'Wir arbeiten mit den weltweit führenden Herstellern von Yachten und Schiffsausrüstung zusammen, um Ihnen das bestmögliche Segelerlebnis zu bieten.', 'homepage'),
('home.partners.subtitle', 'fr', 'Nous travaillons avec les principaux fabricants mondiaux de yachts et d''équipements marins pour vous offrir la meilleure expérience de navigation possible.', 'homepage'),
('home.partners.subtitle', 'es', 'Trabajamos con los principales fabricantes mundiales de yates y equipos marinos para ofrecerte la mejor experiencia de navegación posible.', 'homepage'),

('home.partners.cta_text', 'en', 'Interested in partnering with us? We''re always looking for quality brands that share our passion for sailing.', 'homepage'),
('home.partners.cta_text', 'it', 'Interessato a collaborare con noi? Siamo sempre alla ricerca di marchi di qualità che condividano la nostra passione per la vela.', 'homepage'),
('home.partners.cta_text', 'de', 'Interessiert an einer Partnerschaft mit uns? Wir sind immer auf der Suche nach Qualitätsmarken, die unsere Leidenschaft für das Segeln teilen.', 'homepage'),
('home.partners.cta_text', 'fr', 'Intéressé par un partenariat avec nous ? Nous recherchons toujours des marques de qualité qui partagent notre passion pour la voile.', 'homepage'),
('home.partners.cta_text', 'es', '¿Interesado en asociarse con nosotros? Siempre buscamos marcas de calidad que compartan nuestra pasión por la navegación.', 'homepage'),

('home.partners.cta', 'en', 'Contact Us About Partnerships', 'homepage'),
('home.partners.cta', 'it', 'Contattaci per Partnership', 'homepage'),
('home.partners.cta', 'de', 'Kontaktieren Sie uns bezüglich Partnerschaften', 'homepage'),
('home.partners.cta', 'fr', 'Contactez-nous pour les Partenariats', 'homepage'),
('home.partners.cta', 'es', 'Contáctanos para Asociaciones', 'homepage'),

('home.final_cta.title', 'en', 'Ready for Your Sailing Adventure?', 'homepage'),
('home.final_cta.title', 'it', 'Pronto per la Tua Avventura in Barca a Vela?', 'homepage'),
('home.final_cta.title', 'de', 'Bereit für Ihr Segelabenteuer?', 'homepage'),
('home.final_cta.title', 'fr', 'Prêt pour Votre Aventure en Voile?', 'homepage'),
('home.final_cta.title', 'es', '¿Listo para Tu Aventura en Vela?', 'homepage'),

('home.final_cta.subtitle', 'en', 'Join us for an unforgettable day of yacht racing on Lake Garda. No experience necessary - just bring your sense of adventure!', 'homepage'),
('home.final_cta.subtitle', 'it', 'Unisciti a noi per una giornata indimenticabile di regate in yacht sul Lago di Garda. Nessuna esperienza necessaria - porta solo il tuo senso dell''avventura!', 'homepage'),
('home.final_cta.subtitle', 'de', 'Begleiten Sie uns für einen unvergesslichen Tag Yachtrennen am Gardasee. Keine Erfahrung erforderlich – bringen Sie einfach Ihren Abenteuergeist mit!', 'homepage'),
('home.final_cta.subtitle', 'fr', 'Rejoignez-nous pour une journée inoubliable de course de voile sur le lac de Garde. Aucune expérience nécessaire - apportez simplement votre sens de l''aventure !', 'homepage'),
('home.final_cta.subtitle', 'es', 'Únete a nosotros para un día inolvidable de carreras de yates en el Lago de Garda. No se necesita experiencia, ¡solo trae tu espíritu aventurero!', 'homepage'),

('home.final_cta.cta', 'en', 'Book Now - €195', 'homepage'),
('home.final_cta.cta', 'it', 'Prenota Ora - €195', 'homepage'),
('home.final_cta.cta', 'de', 'Jetzt buchen - 195 €', 'homepage'),
('home.final_cta.cta', 'fr', 'Réservez Maintenant - 195 €', 'homepage'),
('home.final_cta.cta', 'es', 'Reserva Ahora - 195 €', 'homepage');

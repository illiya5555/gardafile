/*
# Add Homepage Translations for All Languages

This migration adds translations for hardcoded strings on the homepage in all supported languages.

1. New Translations
   - Features section (item5 - Accessible & Premium)
   - Testimonial quotes and names
   - Location section (title, items, Google rating)
   - Partners section (title, subtitle, CTA, partner names and descriptions)
   - Final CTA section (title, subtitle, button text)

2. Languages
   - English (en), Italian (it), German (de), French (fr), Spanish (es), Russian (ru), Polish (pl), Hebrew (he)
*/

-- Add translations for home.features.item5
INSERT INTO translations (key, language_code, text, category) VALUES
('home.features.item5.title', 'en', 'Accessible & Premium', 'home_page'),
('home.features.item5.title', 'it', 'Accessibile e Premium', 'home_page'),
('home.features.item5.title', 'de', 'Zugänglich & Premium', 'home_page'),
('home.features.item5.title', 'fr', 'Accessible et Premium', 'home_page'),
('home.features.item5.title', 'es', 'Accesible y Premium', 'home_page'),
('home.features.item5.title', 'pl', 'Dostępne i Premium', 'home_page'),
('home.features.item5.title', 'he', 'נגיש ופרימיום', 'home_page'),

('home.features.item5.description', 'en', 'A top-level regatta experience open to everyone — no experience needed.', 'home_page'),
('home.features.item5.description', 'it', 'Un''esperienza di regata di alto livello aperta a tutti - nessuna esperienza necessaria.', 'home_page'),
('home.features.item5.description', 'de', 'Ein Regatta-Erlebnis auf höchstem Niveau für alle - keine Erfahrung nötig.', 'home_page'),
('home.features.item5.description', 'fr', 'Une expérience de régate de haut niveau ouverte à tous - aucune expérience nécessaire.', 'home_page'),
('home.features.item5.description', 'es', 'Una experiencia de regata de alto nivel abierta a todos - no se necesita experiencia.', 'home_page'),
('home.features.item5.description', 'pl', 'Doświadczenie regat na najwyższym poziomie otwarte dla wszystkich - nie wymaga doświadczenia.', 'home_page'),
('home.features.item5.description', 'he', 'חוויית רגטה ברמה הגבוהה ביותר פתוחה לכולם - לא נדרש ניסיון קודם.', 'home_page');

-- Add testimonial translations
INSERT INTO translations (key, language_code, text, category) VALUES
-- Marco Rossi testimonial
('testimonial.marco_rossi.text', 'en', 'Incredible experience! The professional skipper made us feel safe while we enjoyed the thrill of racing. The photos they took are amazing memories.', 'testimonials'),
('testimonial.marco_rossi.text', 'it', 'Esperienza incredibile! Lo skipper professionista ci ha fatto sentire al sicuro mentre godevamo del brivido della regata. Le foto che hanno scattato sono ricordi straordinari.', 'testimonials'),
('testimonial.marco_rossi.text', 'de', 'Unglaubliches Erlebnis! Der professionelle Skipper hat uns ein sicheres Gefühl vermittelt, während wir den Nervenkitzel des Rennens genossen haben. Die Fotos, die sie gemacht haben, sind wunderbare Erinnerungen.', 'testimonials'),
('testimonial.marco_rossi.text', 'fr', 'Expérience incroyable ! Le skipper professionnel nous a fait sentir en sécurité pendant que nous profitions du frisson de la course. Les photos qu''ils ont prises sont des souvenirs incroyables.', 'testimonials'),
('testimonial.marco_rossi.text', 'es', '¡Experiencia increíble! El patrón profesional nos hizo sentir seguros mientras disfrutábamos de la emoción de la competición. Las fotos que tomaron son recuerdos increíbles.', 'testimonials'),
('testimonial.marco_rossi.text', 'ru', 'Невероятный опыт! Профессиональный шкипер обеспечил нам безопасность, пока мы наслаждались азартом гонки. Фотографии, которые они сделали — удивительные воспоминания.', 'testimonials'),
('testimonial.marco_rossi.text', 'pl', 'Niesamowite doświadczenie! Profesjonalny skipper sprawił, że czuliśmy się bezpiecznie, ciesząc się emocjami z wyścigu. Zdjęcia, które zrobili, to wspaniałe wspomnienia.', 'testimonials'),
('testimonial.marco_rossi.text', 'he', 'חוויה מדהימה! הסקיפר המקצועי גרם לנו להרגיש בטוחים בזמן שנהנינו מהריגוש של המרוץ. התמונות שהם צילמו הן זכרונות מדהימים.', 'testimonials'),

-- Sarah Johnson testimonial
('testimonial.sarah_johnson.text', 'en', 'Perfect day on Lake Garda! No sailing experience needed - they taught us everything. The medal ceremony was a nice touch. Highly recommended!', 'testimonials'),
('testimonial.sarah_johnson.text', 'it', 'Giornata perfetta sul Lago di Garda! Non è necessaria esperienza di vela - ci hanno insegnato tutto. La cerimonia della medaglia è stato un bel tocco. Altamente consigliato!', 'testimonials'),
('testimonial.sarah_johnson.text', 'de', 'Perfekter Tag am Gardasee! Keine Segelerfahrung nötig - sie haben uns alles beigebracht. Die Medaillenzeremonie war eine schöne Geste. Sehr empfehlenswert!', 'testimonials'),
('testimonial.sarah_johnson.text', 'fr', 'Journée parfaite sur le Lac de Garde ! Aucune expérience de voile nécessaire - ils nous ont tout appris. La cérémonie de médailles était une belle touche. Hautement recommandé !', 'testimonials'),
('testimonial.sarah_johnson.text', 'es', '¡Día perfecto en el Lago de Garda! No se necesita experiencia en navegación - nos enseñaron todo. La ceremonia de medallas fue un bonito detalle. ¡Muy recomendable!', 'testimonials'),
('testimonial.sarah_johnson.text', 'ru', 'Идеальный день на озере Гарда! Опыт в парусном спорте не требуется - они научили нас всему. Церемония вручения медалей была приятным дополнением. Очень рекомендую!', 'testimonials'),
('testimonial.sarah_johnson.text', 'pl', 'Idealny dzień nad jeziorem Garda! Nie potrzeba doświadczenia żeglarskiego - nauczyli nas wszystkiego. Ceremonia medalowa była miłym akcentem. Polecam!', 'testimonials'),
('testimonial.sarah_johnson.text', 'he', 'יום מושלם באגם גארדה! לא נדרש ניסיון שיט - הם לימדו אותנו הכל. טקס המדליות היה נגיעה נחמדה. מומלץ ביותר!', 'testimonials'),

-- Andreas Mueller testimonial
('testimonial.andreas_mueller.text', 'en', 'Brought our corporate team here for a unique experience. Everyone loved it! Great organization, beautiful location, and unforgettable memories.', 'testimonials'),
('testimonial.andreas_mueller.text', 'it', 'Abbiamo portato il nostro team aziendale qui per un''esperienza unica. A tutti è piaciuto! Ottima organizzazione, bellissima location e ricordi indimenticabili.', 'testimonials'),
('testimonial.andreas_mueller.text', 'de', 'Wir haben unser Unternehmensteam für ein einzigartiges Erlebnis hierher gebracht. Alle waren begeistert! Großartige Organisation, wunderschöne Lage und unvergessliche Erinnerungen.', 'testimonials'),
('testimonial.andreas_mueller.text', 'fr', 'Nous avons amené notre équipe d''entreprise ici pour une expérience unique. Tout le monde a adoré ! Excellente organisation, bel emplacement et souvenirs inoubliables.', 'testimonials'),
('testimonial.andreas_mueller.text', 'es', 'Trajimos a nuestro equipo corporativo aquí para una experiencia única. ¡A todos les encantó! Gran organización, hermoso lugar y recuerdos inolvidables.', 'testimonials'),
('testimonial.andreas_mueller.text', 'ru', 'Привезли сюда нашу корпоративную команду для уникального опыта. Всем понравилось! Отличная организация, красивое место и незабываемые воспоминания.', 'testimonials'),
('testimonial.andreas_mueller.text', 'pl', 'Przywieźliśmy tu nasz zespół firmowy na wyjątkowe doświadczenie. Wszyscy to pokochali! Świetna organizacja, piękna lokalizacja i niezapomniane wspomnienia.', 'testimonials'),
('testimonial.andreas_mueller.text', 'he', 'הבאנו את צוות החברה שלנו לכאן לחוויה ייחודית. כולם אהבו את זה! ארגון מעולה, מיקום יפהפה וזיכרונות בלתי נשכחים.', 'testimonials');

-- Add location section translations
INSERT INTO translations (key, language_code, text, category) VALUES
-- Location title
('home.location.title', 'en', 'Prime Location in Riva del Garda', 'home_page'),
('home.location.title', 'it', 'Posizione Privilegiata a Riva del Garda', 'home_page'),
('home.location.title', 'de', 'Erstklassige Lage in Riva del Garda', 'home_page'),
('home.location.title', 'fr', 'Emplacement de Choix à Riva del Garda', 'home_page'),
('home.location.title', 'es', 'Ubicación Privilegiada en Riva del Garda', 'home_page'),
('home.location.title', 'pl', 'Doskonała Lokalizacja w Riva del Garda', 'home_page'),
('home.location.title', 'he', 'מיקום מעולה בריבה דל גארדה', 'home_page'),

-- Google rating
('home.location.google_rating', 'en', 'Google Rating', 'home_page'),
('home.location.google_rating', 'it', 'Valutazione Google', 'home_page'),
('home.location.google_rating', 'de', 'Google-Bewertung', 'home_page'),
('home.location.google_rating', 'fr', 'Évaluation Google', 'home_page'),
('home.location.google_rating', 'es', 'Calificación de Google', 'home_page'),
('home.location.google_rating', 'pl', 'Ocena Google', 'home_page'),
('home.location.google_rating', 'he', 'דירוג גוגל', 'home_page'),

-- Location item 1
('home.location.item1.title', 'en', 'Easy Access from Munich', 'home_page'),
('home.location.item1.title', 'it', 'Facile Accesso da Monaco', 'home_page'),
('home.location.item1.title', 'de', 'Einfache Anreise von München', 'home_page'),
('home.location.item1.title', 'fr', 'Accès Facile depuis Munich', 'home_page'),
('home.location.item1.title', 'es', 'Fácil Acceso desde Múnich', 'home_page'),
('home.location.item1.title', 'pl', 'Łatwy Dojazd z Monachium', 'home_page'),
('home.location.item1.title', 'he', 'גישה נוחה ממינכן', 'home_page'),

('home.location.item1.description', 'en', 'Just 4 hours drive from Munich, making it perfect for weekend getaways and corporate events.', 'home_page'),
('home.location.item1.description', 'it', 'Solo 4 ore di auto da Monaco, perfetto per fughe di fine settimana ed eventi aziendali.', 'home_page'),
('home.location.item1.description', 'de', 'Nur 4 Stunden Fahrt von München, ideal für Wochenendausflüge und Firmenveranstaltungen.', 'home_page'),
('home.location.item1.description', 'fr', 'Seulement 4 heures de route de Munich, ce qui en fait un endroit parfait pour les escapades de week-end et les événements d''entreprise.', 'home_page'),
('home.location.item1.description', 'es', 'Solo 4 horas en coche desde Múnich, lo que lo hace perfecto para escapadas de fin de semana y eventos corporativos.', 'home_page'),
('home.location.item1.description', 'pl', 'Tylko 4 godziny jazdy z Monachium, co czyni go idealnym na weekendowe wypady i imprezy firmowe.', 'home_page'),
('home.location.item1.description', 'he', 'רק 4 שעות נסיעה ממינכן, מה שהופך אותו למושלם לבריחות סוף שבוע ואירועי חברה.', 'home_page'),

-- Location item 2
('home.location.item2.title', 'en', 'World-Class Sailing Conditions', 'home_page'),
('home.location.item2.title', 'it', 'Condizioni di Navigazione di Classe Mondiale', 'home_page'),
('home.location.item2.title', 'de', 'Weltklasse-Segelbedingungen', 'home_page'),
('home.location.item2.title', 'fr', 'Conditions de Navigation de Classe Mondiale', 'home_page'),
('home.location.item2.title', 'es', 'Condiciones de Navegación de Clase Mundial', 'home_page'),
('home.location.item2.title', 'pl', 'Światowej Klasy Warunki Żeglarskie', 'home_page'),
('home.location.item2.title', 'he', 'תנאי שיט ברמה עולמית', 'home_page'),

('home.location.item2.description', 'en', 'Lake Garda offers consistent winds and stunning Alpine scenery, making it Europe''s premier sailing destination.', 'home_page'),
('home.location.item2.description', 'it', 'Il Lago di Garda offre venti costanti e paesaggi alpini mozzafiato, rendendolo la principale destinazione velica d''Europa.', 'home_page'),
('home.location.item2.description', 'de', 'Der Gardasee bietet beständige Winde und atemberaubende Alpenlandschaften und ist damit Europas führendes Segelrevier.', 'home_page'),
('home.location.item2.description', 'fr', 'Le lac de Garde offre des vents constants et des paysages alpins magnifiques, ce qui en fait la principale destination de voile d''Europe.', 'home_page'),
('home.location.item2.description', 'es', 'El Lago de Garda ofrece vientos constantes y impresionantes paisajes alpinos, lo que lo convierte en el principal destino de navegación de Europa.', 'home_page'),
('home.location.item2.description', 'pl', 'Jezioro Garda oferuje stałe wiatry i zapierające dech w piersiach alpejskie krajobrazy, co czyni go najważniejszym celem żeglarskim w Europie.', 'home_page'),
('home.location.item2.description', 'he', 'אגם גארדה מציע רוחות עקביות ונופים אלפיניים מרהיבים, מה שהופך אותו ליעד השיט המוביל באירופה.', 'home_page'),

-- Location item 3
('home.location.item3.title', 'en', 'Daily Departures', 'home_page'),
('home.location.item3.title', 'it', 'Partenze Giornaliere', 'home_page'),
('home.location.item3.title', 'de', 'Tägliche Abfahrten', 'home_page'),
('home.location.item3.title', 'fr', 'Départs Quotidiens', 'home_page'),
('home.location.item3.title', 'es', 'Salidas Diarias', 'home_page'),
('home.location.item3.title', 'pl', 'Codzienne Wypłynięcia', 'home_page'),
('home.location.item3.title', 'he', 'יציאות יומיות', 'home_page'),

('home.location.item3.description', 'en', 'Multiple time slots available daily from March to October, with flexible booking options.', 'home_page'),
('home.location.item3.description', 'it', 'Più fasce orarie disponibili quotidianamente da marzo a ottobre, con opzioni di prenotazione flessibili.', 'home_page'),
('home.location.item3.description', 'de', 'Mehrere Zeitfenster täglich von März bis Oktober verfügbar, mit flexiblen Buchungsoptionen.', 'home_page'),
('home.location.item3.description', 'fr', 'Plusieurs créneaux horaires disponibles quotidiennement de mars à octobre, avec des options de réservation flexibles.', 'home_page'),
('home.location.item3.description', 'es', 'Múltiples horarios disponibles diariamente de marzo a octubre, con opciones de reserva flexibles.', 'home_page'),
('home.location.item3.description', 'pl', 'Wiele terminów dostępnych codziennie od marca do października, z elastycznymi opcjami rezerwacji.', 'home_page'),
('home.location.item3.description', 'he', 'מספר משבצות זמן זמינות מדי יום ממרץ עד אוקטובר, עם אפשרויות הזמנה גמישות.', 'home_page');

-- Add partners section translations
INSERT INTO translations (key, language_code, text, category) VALUES
-- Partners section title and subtitle
('home.partners.title', 'en', 'Our Trusted Partners', 'home_page'),
('home.partners.title', 'it', 'I Nostri Partner di Fiducia', 'home_page'),
('home.partners.title', 'de', 'Unsere vertrauenswürdigen Partner', 'home_page'),
('home.partners.title', 'fr', 'Nos Partenaires de Confiance', 'home_page'),
('home.partners.title', 'es', 'Nuestros Socios de Confianza', 'home_page'),
('home.partners.title', 'pl', 'Nasi Zaufani Partnerzy', 'home_page'),
('home.partners.title', 'he', 'השותפים המהימנים שלנו', 'home_page'),

('home.partners.subtitle', 'en', 'We work with the world''s leading yacht and marine equipment manufacturers to provide you with the best possible sailing experience.', 'home_page'),
('home.partners.subtitle', 'it', 'Lavoriamo con i principali produttori mondiali di yacht e attrezzature marine per offrirti la migliore esperienza di navigazione possibile.', 'home_page'),
('home.partners.subtitle', 'de', 'Wir arbeiten mit den weltweit führenden Yacht- und Marineausrüstungsherstellern zusammen, um Ihnen das bestmögliche Segelerlebnis zu bieten.', 'home_page'),
('home.partners.subtitle', 'fr', 'Nous travaillons avec les principaux fabricants mondiaux de yachts et d''équipements marins pour vous offrir la meilleure expérience de voile possible.', 'home_page'),
('home.partners.subtitle', 'es', 'Trabajamos con los principales fabricantes mundiales de yates y equipos marinos para proporcionarle la mejor experiencia de navegación posible.', 'home_page'),
('home.partners.subtitle', 'pl', 'Współpracujemy z wiodącymi na świecie producentami jachtów i sprzętu morskiego, aby zapewnić Ci najlepsze możliwe doświadczenie żeglarskie.', 'home_page'),
('home.partners.subtitle', 'he', 'אנו עובדים עם יצרני היאכטות וציוד הימי המובילים בעולם כדי לספק לך את חוויית השיט הטובה ביותר האפשרית.', 'home_page'),

-- Partners CTA
('home.partners.cta_text', 'en', 'Interested in partnering with us? We''re always looking for quality brands that share our passion for sailing.', 'home_page'),
('home.partners.cta_text', 'it', 'Interessato a collaborare con noi? Siamo sempre alla ricerca di marchi di qualità che condividano la nostra passione per la vela.', 'home_page'),
('home.partners.cta_text', 'de', 'Interessiert an einer Partnerschaft mit uns? Wir suchen immer nach Qualitätsmarken, die unsere Leidenschaft für das Segeln teilen.', 'home_page'),
('home.partners.cta_text', 'fr', 'Intéressé par un partenariat avec nous? Nous sommes toujours à la recherche de marques de qualité qui partagent notre passion pour la voile.', 'home_page'),
('home.partners.cta_text', 'es', '¿Interesado en asociarse con nosotros? Siempre estamos buscando marcas de calidad que compartan nuestra pasión por la navegación.', 'home_page'),
('home.partners.cta_text', 'pl', 'Zainteresowany partnerstwem z nami? Zawsze szukamy jakościowych marek, które podzielają naszą pasję do żeglarstwa.', 'home_page'),
('home.partners.cta_text', 'he', 'מעוניין בשיתוף פעולה איתנו? אנו תמיד מחפשים מותגים איכותיים שחולקים את התשוקה שלנו לשיט.', 'home_page'),

('home.partners.cta', 'en', 'Contact Us About Partnerships', 'home_page'),
('home.partners.cta', 'it', 'Contattaci per Partnership', 'home_page'),
('home.partners.cta', 'de', 'Kontaktieren Sie uns für Partnerschaften', 'home_page'),
('home.partners.cta', 'fr', 'Contactez-Nous pour des Partenariats', 'home_page'),
('home.partners.cta', 'es', 'Contáctenos sobre Asociaciones', 'home_page'),
('home.partners.cta', 'pl', 'Skontaktuj się z Nami w Sprawie Partnerstwa', 'home_page'),
('home.partners.cta', 'he', 'צור קשר בנוגע לשותפויות', 'home_page'),

-- Partner names and descriptions (Bavaria Yachts)
('home.partners.bavaria_yachts.name', 'en', 'Bavaria Yachts', 'home_page'),
('home.partners.bavaria_yachts.name', 'it', 'Bavaria Yachts', 'home_page'),
('home.partners.bavaria_yachts.name', 'de', 'Bavaria Yachts', 'home_page'),
('home.partners.bavaria_yachts.name', 'fr', 'Bavaria Yachts', 'home_page'),
('home.partners.bavaria_yachts.name', 'es', 'Bavaria Yachts', 'home_page'),
('home.partners.bavaria_yachts.name', 'pl', 'Bavaria Yachts', 'home_page'),
('home.partners.bavaria_yachts.name', 'he', 'Bavaria Yachts', 'home_page'),

('home.partners.bavaria_yachts.description', 'en', 'Premium yacht manufacturer', 'home_page'),
('home.partners.bavaria_yachts.description', 'it', 'Produttore premium di yacht', 'home_page'),
('home.partners.bavaria_yachts.description', 'de', 'Premium-Yachthersteller', 'home_page'),
('home.partners.bavaria_yachts.description', 'fr', 'Fabricant de yachts premium', 'home_page'),
('home.partners.bavaria_yachts.description', 'es', 'Fabricante premium de yates', 'home_page'),
('home.partners.bavaria_yachts.description', 'pl', 'Producent jachtów premium', 'home_page'),
('home.partners.bavaria_yachts.description', 'he', 'יצרן יאכטות פרימיום', 'home_page'),

-- Garmin Marine
('home.partners.garmin_marine.name', 'en', 'Garmin Marine', 'home_page'),
('home.partners.garmin_marine.name', 'it', 'Garmin Marine', 'home_page'),
('home.partners.garmin_marine.name', 'de', 'Garmin Marine', 'home_page'),
('home.partners.garmin_marine.name', 'fr', 'Garmin Marine', 'home_page'),
('home.partners.garmin_marine.name', 'es', 'Garmin Marine', 'home_page'),
('home.partners.garmin_marine.name', 'pl', 'Garmin Marine', 'home_page'),
('home.partners.garmin_marine.name', 'he', 'Garmin Marine', 'home_page'),

('home.partners.garmin_marine.description', 'en', 'Navigation technology', 'home_page'),
('home.partners.garmin_marine.description', 'it', 'Tecnologia di navigazione', 'home_page'),
('home.partners.garmin_marine.description', 'de', 'Navigationstechnologie', 'home_page'),
('home.partners.garmin_marine.description', 'fr', 'Technologie de navigation', 'home_page'),
('home.partners.garmin_marine.description', 'es', 'Tecnología de navegación', 'home_page'),
('home.partners.garmin_marine.description', 'pl', 'Technologia nawigacyjna', 'home_page'),
('home.partners.garmin_marine.description', 'he', 'טכנולוגיית ניווט', 'home_page'),

-- Helly Hansen
('home.partners.helly_hansen.name', 'en', 'Helly Hansen', 'home_page'),
('home.partners.helly_hansen.name', 'it', 'Helly Hansen', 'home_page'),
('home.partners.helly_hansen.name', 'de', 'Helly Hansen', 'home_page'),
('home.partners.helly_hansen.name', 'fr', 'Helly Hansen', 'home_page'),
('home.partners.helly_hansen.name', 'es', 'Helly Hansen', 'home_page'),
('home.partners.helly_hansen.name', 'pl', 'Helly Hansen', 'home_page'),
('home.partners.helly_hansen.name', 'he', 'Helly Hansen', 'home_page'),

('home.partners.helly_hansen.description', 'en', 'Professional sailing gear', 'home_page'),
('home.partners.helly_hansen.description', 'it', 'Attrezzatura professionale da vela', 'home_page'),
('home.partners.helly_hansen.description', 'de', 'Professionelle Segelausrüstung', 'home_page'),
('home.partners.helly_hansen.description', 'fr', 'Équipement de voile professionnel', 'home_page'),
('home.partners.helly_hansen.description', 'es', 'Equipo de navegación profesional', 'home_page'),
('home.partners.helly_hansen.description', 'pl', 'Profesjonalny sprzęt żeglarski', 'home_page'),
('home.partners.helly_hansen.description', 'he', 'ציוד שיט מקצועי', 'home_page'),

-- Musto Sailing
('home.partners.musto_sailing.name', 'en', 'Musto Sailing', 'home_page'),
('home.partners.musto_sailing.name', 'it', 'Musto Sailing', 'home_page'),
('home.partners.musto_sailing.name', 'de', 'Musto Sailing', 'home_page'),
('home.partners.musto_sailing.name', 'fr', 'Musto Sailing', 'home_page'),
('home.partners.musto_sailing.name', 'es', 'Musto Sailing', 'home_page'),
('home.partners.musto_sailing.name', 'pl', 'Musto Sailing', 'home_page'),
('home.partners.musto_sailing.name', 'he', 'Musto Sailing', 'home_page'),

('home.partners.musto_sailing.description', 'en', 'Technical sailing clothing', 'home_page'),
('home.partners.musto_sailing.description', 'it', 'Abbigliamento tecnico da vela', 'home_page'),
('home.partners.musto_sailing.description', 'de', 'Technische Segelbekleidung', 'home_page'),
('home.partners.musto_sailing.description', 'fr', 'Vêtements techniques de voile', 'home_page'),
('home.partners.musto_sailing.description', 'es', 'Ropa técnica de navegación', 'home_page'),
('home.partners.musto_sailing.description', 'pl', 'Techniczna odzież żeglarska', 'home_page'),
('home.partners.musto_sailing.description', 'he', 'ביגוד שיט טכני', 'home_page'),

-- Raymarine
('home.partners.raymarine.name', 'en', 'Raymarine', 'home_page'),
('home.partners.raymarine.name', 'it', 'Raymarine', 'home_page'),
('home.partners.raymarine.name', 'de', 'Raymarine', 'home_page'),
('home.partners.raymarine.name', 'fr', 'Raymarine', 'home_page'),
('home.partners.raymarine.name', 'es', 'Raymarine', 'home_page'),
('home.partners.raymarine.name', 'pl', 'Raymarine', 'home_page'),
('home.partners.raymarine.name', 'he', 'Raymarine', 'home_page'),

('home.partners.raymarine.description', 'en', 'Marine electronics', 'home_page'),
('home.partners.raymarine.description', 'it', 'Elettronica marina', 'home_page'),
('home.partners.raymarine.description', 'de', 'Marine-Elektronik', 'home_page'),
('home.partners.raymarine.description', 'fr', 'Électronique marine', 'home_page'),
('home.partners.raymarine.description', 'es', 'Electrónica marina', 'home_page'),
('home.partners.raymarine.description', 'pl', 'Elektronika morska', 'home_page'),
('home.partners.raymarine.description', 'he', 'אלקטרוניקה ימית', 'home_page'),

-- Spinlock
('home.partners.spinlock.name', 'en', 'Spinlock', 'home_page'),
('home.partners.spinlock.name', 'it', 'Spinlock', 'home_page'),
('home.partners.spinlock.name', 'de', 'Spinlock', 'home_page'),
('home.partners.spinlock.name', 'fr', 'Spinlock', 'home_page'),
('home.partners.spinlock.name', 'es', 'Spinlock', 'home_page'),
('home.partners.spinlock.name', 'pl', 'Spinlock', 'home_page'),
('home.partners.spinlock.name', 'he', 'Spinlock', 'home_page'),

('home.partners.spinlock.description', 'en', 'Safety equipment', 'home_page'),
('home.partners.spinlock.description', 'it', 'Equipaggiamento di sicurezza', 'home_page'),
('home.partners.spinlock.description', 'de', 'Sicherheitsausrüstung', 'home_page'),
('home.partners.spinlock.description', 'fr', 'Équipement de sécurité', 'home_page'),
('home.partners.spinlock.description', 'es', 'Equipo de seguridad', 'home_page'),
('home.partners.spinlock.description', 'pl', 'Sprzęt bezpieczeństwa', 'home_page'),
('home.partners.spinlock.description', 'he', 'ציוד בטיחות', 'home_page');

-- Add final CTA section translations
INSERT INTO translations (key, language_code, text, category) VALUES
-- Final CTA title
('home.final_cta.title', 'en', 'Ready for Your Sailing Adventure?', 'home_page'),
('home.final_cta.title', 'it', 'Pronto per la Tua Avventura Velica?', 'home_page'),
('home.final_cta.title', 'de', 'Bereit für Dein Segelabenteuer?', 'home_page'),
('home.final_cta.title', 'fr', 'Prêt pour Votre Aventure en Voile?', 'home_page'),
('home.final_cta.title', 'es', '¿Listo para Tu Aventura de Navegación?', 'home_page'),
('home.final_cta.title', 'pl', 'Gotowy na Twoją Przygodę Żeglarską?', 'home_page'),
('home.final_cta.title', 'he', 'מוכן להרפתקת השיט שלך?', 'home_page'),

-- Final CTA subtitle
('home.final_cta.subtitle', 'en', 'Join us for an unforgettable day of yacht racing on Lake Garda. No experience necessary - just bring your sense of adventure!', 'home_page'),
('home.final_cta.subtitle', 'it', 'Unisciti a noi per una giornata indimenticabile di regate in yacht sul Lago di Garda. Nessuna esperienza necessaria - porta solo il tuo spirito di avventura!', 'home_page'),
('home.final_cta.subtitle', 'de', 'Begleite uns für einen unvergesslichen Tag bei Yachtrennen am Gardasee. Keine Erfahrung nötig - bring einfach dein Abenteuergeist mit!', 'home_page'),
('home.final_cta.subtitle', 'fr', 'Rejoignez-nous pour une journée inoubliable de régates sur le lac de Garde. Aucune expérience nécessaire - apportez simplement votre esprit d''aventure!', 'home_page'),
('home.final_cta.subtitle', 'es', 'Únete a nosotros para un día inolvidable de regatas de yates en el Lago de Garda. No se necesita experiencia - ¡solo trae tu espíritu de aventura!', 'home_page'),
('home.final_cta.subtitle', 'pl', 'Dołącz do nas na niezapomniany dzień regat jachtowych na jeziorze Garda. Doświadczenie nie jest wymagane - przynieś tylko swój duch przygody!', 'home_page'),
('home.final_cta.subtitle', 'he', 'הצטרף אלינו ליום בלתי נשכח של מירוצי יאכטות באגם גארדה. ניסיון לא נדרש - פשוט הביא את תחושת ההרפתקנות שלך!', 'home_page'),

-- Final CTA button
('home.final_cta.cta', 'en', 'Book Now - €195', 'home_page'),
('home.final_cta.cta', 'it', 'Prenota Ora - €195', 'home_page'),
('home.final_cta.cta', 'de', 'Jetzt Buchen - €195', 'home_page'),
('home.final_cta.cta', 'fr', 'Réserver Maintenant - €195', 'home_page'),
('home.final_cta.cta', 'es', 'Reservar Ahora - €195', 'home_page'),
('home.final_cta.cta', 'pl', 'Zarezerwuj Teraz - €195', 'home_page'),
('home.final_cta.cta', 'he', 'הזמן עכשיו - €195', 'home_page');

-- Use ON CONFLICT to handle duplicate keys
ON CONFLICT (key, language_code) DO UPDATE SET 
  text = EXCLUDED.text,
  category = EXCLUDED.category;
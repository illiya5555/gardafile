/*
  # Add base translations for all pages

  1. Translations
    - Add comprehensive translations for all pages and components
    - Support for multiple languages (en, it, de, fr, es, ru)
    - Organized by categories for better management

  2. Languages supported
    - English (en) - default
    - Italian (it) - primary market
    - German (de) - major market
    - French (fr) - secondary market
    - Spanish (es) - secondary market
    - Russian (ru) - secondary market
*/

-- Insert base translations
INSERT INTO public.translations (key, language_code, text, category) VALUES 
-- Navigation translations
('nav.home', 'en', 'Home', 'navigation'),
('nav.home', 'it', 'Home', 'navigation'),
('nav.home', 'de', 'Startseite', 'navigation'),
('nav.home', 'fr', 'Accueil', 'navigation'),
('nav.home', 'es', 'Inicio', 'navigation'),
('nav.home', 'ru', 'Главная', 'navigation'),

('nav.events', 'en', 'Events', 'navigation'),
('nav.events', 'it', 'Eventi', 'navigation'),
('nav.events', 'de', 'Veranstaltungen', 'navigation'),
('nav.events', 'fr', 'Événements', 'navigation'),
('nav.events', 'es', 'Eventos', 'navigation'),
('nav.events', 'ru', 'События', 'navigation'),

('nav.services', 'en', 'Services', 'navigation'),
('nav.services', 'it', 'Servizi', 'navigation'),
('nav.services', 'de', 'Dienstleistungen', 'navigation'),
('nav.services', 'fr', 'Services', 'navigation'),
('nav.services', 'es', 'Servicios', 'navigation'),
('nav.services', 'ru', 'Услуги', 'navigation'),

('nav.contact', 'en', 'Contact', 'navigation'),
('nav.contact', 'it', 'Contatti', 'navigation'),
('nav.contact', 'de', 'Kontakt', 'navigation'),
('nav.contact', 'fr', 'Contact', 'navigation'),
('nav.contact', 'es', 'Contacto', 'navigation'),
('nav.contact', 'ru', 'Контакты', 'navigation'),

('nav.book_now', 'en', 'Book Now', 'navigation'),
('nav.book_now', 'it', 'Prenota Ora', 'navigation'),
('nav.book_now', 'de', 'Jetzt Buchen', 'navigation'),
('nav.book_now', 'fr', 'Réserver', 'navigation'),
('nav.book_now', 'es', 'Reservar', 'navigation'),
('nav.book_now', 'ru', 'Забронировать', 'navigation'),

-- Home page translations
('home.hero.title_part1', 'en', 'Experience the Thrill of', 'home'),
('home.hero.title_part1', 'it', 'Vivi l''Emozione del', 'home'),
('home.hero.title_part1', 'de', 'Erleben Sie den Nervenkitzel des', 'home'),
('home.hero.title_part1', 'fr', 'Vivez le Frisson du', 'home'),
('home.hero.title_part1', 'es', 'Experimenta la Emoción del', 'home'),
('home.hero.title_part1', 'ru', 'Почувствуйте Азарт', 'home'),

('home.hero.title_part2', 'en', 'Yacht Racing', 'home'),
('home.hero.title_part2', 'it', 'Racing in Barca a Vela', 'home'),
('home.hero.title_part2', 'de', 'Yachtrennsports', 'home'),
('home.hero.title_part2', 'fr', 'Course de Voiliers', 'home'),
('home.hero.title_part2', 'es', 'Regatas de Vela', 'home'),
('home.hero.title_part2', 'ru', 'Парусных Гонок', 'home'),

('home.hero.subtitle', 'en', 'Daily yacht racing **on** world-famous Lake Garda with professional skippers **for an unforgettable experience**.', 'home'),
('home.hero.subtitle', 'it', '**Regate giornaliere** sul **celebre** Lago di Garda con skipper **professionisti per ricordi indimenticabili**.', 'home'),
('home.hero.subtitle', 'de', 'Tägliche **Segelregatten** auf dem weltberühmten Gardasee mit professionellen Skippern für **unvergessliche Erlebnisse**.', 'home'),
('home.hero.subtitle', 'fr', '**Régates quotidiennes** sur le célèbre lac de Garde avec des skippers professionnels pour des **souvenirs inoubliables**.', 'home'),
('home.hero.subtitle', 'es', 'Regatas diarias en el **mundialmente famoso** Lago de Garda con **skippers** profesionales para **una experiencia inolvidable**.', 'home'),
('home.hero.subtitle', 'ru', 'Ежедневные **парусные регаты** на **всемирно известном** озере Гарда с профессиональными шкиперами — **незабываемые впечатления**!', 'home'),

-- Booking page translations
('booking.title', 'en', 'Book Your Regatta Experience', 'booking'),
('booking.title', 'it', 'Prenota la Tua Esperienza di Regata', 'booking'),
('booking.title', 'de', 'Buchen Sie Ihr Regatta-Erlebnis', 'booking'),
('booking.title', 'fr', 'Réservez Votre Expérience de Régate', 'booking'),
('booking.title', 'es', 'Reserve Su Experiencia de Regata', 'booking'),
('booking.title', 'ru', 'Забронируйте Парусную Регату', 'booking'),

('booking.subtitle', 'en', 'Choose a date and time for an unforgettable yacht racing experience on Lake Garda', 'booking'),
('booking.subtitle', 'it', 'Scegli una data e un orario per un''esperienza indimenticabile di regata sul Lago di Garda', 'booking'),
('booking.subtitle', 'de', 'Wählen Sie Datum und Uhrzeit für ein unvergessliches Yacht-Rennerlebnis am Gardasee', 'booking'),
('booking.subtitle', 'fr', 'Choisissez une date et une heure pour une expérience inoubliable de course de voiliers sur le lac de Garde', 'booking'),
('booking.subtitle', 'es', 'Elija una fecha y hora para una experiencia inolvidable de regatas en el Lago de Garda', 'booking'),
('booking.subtitle', 'ru', 'Выберите дату и время для незабываемых парусных гонок на озере Гарда', 'booking'),

-- Contact page translations
('contact.hero.title', 'en', 'Contact Us', 'contact'),
('contact.hero.title', 'it', 'Contattaci', 'contact'),
('contact.hero.title', 'de', 'Kontaktieren Sie uns', 'contact'),
('contact.hero.title', 'fr', 'Contactez-nous', 'contact'),
('contact.hero.title', 'es', 'Contáctanos', 'contact'),
('contact.hero.title', 'ru', 'Свяжитесь с нами', 'contact'),

('contact.hero.subtitle', 'en', 'We are ready to answer all your questions and help organize an unforgettable sailing adventure on Lake Garda', 'contact'),
('contact.hero.subtitle', 'it', 'Siamo pronti a rispondere a tutte le vostre domande e ad aiutarvi a organizzare un''avventura velica indimenticabile sul Lago di Garda', 'contact'),
('contact.hero.subtitle', 'de', 'Wir sind bereit, alle Ihre Fragen zu beantworten und Ihnen bei der Organisation eines unvergesslichen Segeabenteuers am Gardasee zu helfen', 'contact'),
('contact.hero.subtitle', 'fr', 'Nous sommes prêts à répondre à toutes vos questions et à vous aider à organiser une aventure voile inoubliable sur le lac de Garde', 'contact'),
('contact.hero.subtitle', 'es', 'Estamos listos para responder todas sus preguntas y ayudar a organizar una aventura de vela inolvidable en el Lago de Garda', 'contact'),
('contact.hero.subtitle', 'ru', 'Мы готовы ответить на все ваши вопросы и помочь организовать незабываемое парусное приключение на озере Гарда', 'contact'),

-- Events page translations
('events.title', 'en', 'The Complete Racing Experience', 'events'),
('events.title', 'it', 'L''Esperienza di Regata Completa', 'events'),
('events.title', 'de', 'Das Komplette Regatta-Erlebnis', 'events'),
('events.title', 'fr', 'L''Expérience de Course Complète', 'events'),
('events.title', 'es', 'La Experiencia Completa de Regata', 'events'),
('events.title', 'ru', 'Полный Опыт Парусных Гонок', 'events'),

('events.subtitle', 'en', 'From beginner to champion in one day. Experience authentic yacht racing on Lake Garda with professional instruction, competitive races, and official recognition of your achievement.', 'events'),
('events.subtitle', 'it', 'Da principiante a campione in un giorno. Vivi la regata autentica sul Lago di Garda con istruzione professionale, gare competitive e riconoscimento ufficiale del tuo risultato.', 'events'),
('events.subtitle', 'de', 'Vom Anfänger zum Champion an einem Tag. Erleben Sie authentische Yachtrennen am Gardasee mit professioneller Anleitung, Wettkampfrennen und offizieller Anerkennung Ihrer Leistung.', 'events'),
('events.subtitle', 'fr', 'De débutant à champion en une journée. Vivez de véritables courses de voiliers sur le lac de Garde avec instruction professionnelle, courses compétitives et reconnaissance officielle de votre réalisation.', 'events'),
('events.subtitle', 'es', 'De principiante a campeón en un día. Experimente regatas auténticas en el Lago de Garda con instrucción profesional, carreras competitivas y reconocimiento oficial de su logro.', 'events'),
('events.subtitle', 'ru', 'От новичка до чемпиона за один день. Испытайте настоящие парусные гонки на озере Гарда с профессиональным обучением, соревновательными гонками и официальным признанием ваших достижений.', 'events'),

-- Services page translations
('services.title', 'en', 'Corporate Services', 'services'),
('services.title', 'it', 'Servizi Aziendali', 'services'),
('services.title', 'de', 'Firmendienstleistungen', 'services'),
('services.title', 'fr', 'Services Entreprise', 'services'),
('services.title', 'es', 'Servicios Corporativos', 'services'),
('services.title', 'ru', 'Корпоративные Услуги', 'services'),

('services.subtitle', 'en', 'Create unforgettable corporate events on Lake Garda. Professionally organized regattas to strengthen team spirit.', 'services'),
('services.subtitle', 'it', 'Create eventi aziendali indimenticabili sul Lago di Garda. Regate organizzate professionalmente per rafforzare lo spirito di squadra.', 'services'),
('services.subtitle', 'de', 'Schaffen Sie unvergessliche Firmenveranstaltungen am Gardasee. Professionell organisierte Regatten zur Stärkung des Teamgeists.', 'services'),
('services.subtitle', 'fr', 'Créez des événements d''entreprise inoubliables sur le lac de Garde. Régates organisées professionnellement pour renforcer l''esprit d''équipe.', 'services'),
('services.subtitle', 'es', 'Cree eventos corporativos inolvidables en el Lago de Garda. Regatas organizadas profesionalmente para fortalecer el espíritu de equipo.', 'services'),
('services.subtitle', 'ru', 'Создавайте незабываемые корпоративные мероприятия на озере Гарда. Профессионально организованные регаты для укрепления командного духа.', 'services'),

-- Common form translations
('form.name', 'en', 'Name', 'forms'),
('form.name', 'it', 'Nome', 'forms'),
('form.name', 'de', 'Name', 'forms'),
('form.name', 'fr', 'Nom', 'forms'),
('form.name', 'es', 'Nombre', 'forms'),
('form.name', 'ru', 'Имя', 'forms'),

('form.email', 'en', 'Email', 'forms'),
('form.email', 'it', 'Email', 'forms'),
('form.email', 'de', 'E-Mail', 'forms'),
('form.email', 'fr', 'E-mail', 'forms'),
('form.email', 'es', 'Correo electrónico', 'forms'),
('form.email', 'ru', 'Электронная почта', 'forms'),

('form.phone', 'en', 'Phone', 'forms'),
('form.phone', 'it', 'Telefono', 'forms'),
('form.phone', 'de', 'Telefon', 'forms'),
('form.phone', 'fr', 'Téléphone', 'forms'),
('form.phone', 'es', 'Teléfono', 'forms'),
('form.phone', 'ru', 'Телефон', 'forms'),

('form.message', 'en', 'Message', 'forms'),
('form.message', 'it', 'Messaggio', 'forms'),
('form.message', 'de', 'Nachricht', 'forms'),
('form.message', 'fr', 'Message', 'forms'),
('form.message', 'es', 'Mensaje', 'forms'),
('form.message', 'ru', 'Сообщение', 'forms'),

('form.submit', 'en', 'Send Message', 'forms'),
('form.submit', 'it', 'Invia Messaggio', 'forms'),
('form.submit', 'de', 'Nachricht Senden', 'forms'),
('form.submit', 'fr', 'Envoyer le Message', 'forms'),
('form.submit', 'es', 'Enviar Mensaje', 'forms'),
('form.submit', 'ru', 'Отправить Сообщение', 'forms'),

-- Common buttons
('common.loading', 'en', 'Loading...', 'common'),
('common.loading', 'it', 'Caricamento...', 'common'),
('common.loading', 'de', 'Laden...', 'common'),
('common.loading', 'fr', 'Chargement...', 'common'),
('common.loading', 'es', 'Cargando...', 'common'),
('common.loading', 'ru', 'Загрузка...', 'common'),

('common.error', 'en', 'Error', 'common'),
('common.error', 'it', 'Errore', 'common'),
('common.error', 'de', 'Fehler', 'common'),
('common.error', 'fr', 'Erreur', 'common'),
('common.error', 'es', 'Error', 'common'),
('common.error', 'ru', 'Ошибка', 'common'),

('common.success', 'en', 'Success', 'common'),
('common.success', 'it', 'Successo', 'common'),
('common.success', 'de', 'Erfolg', 'common'),
('common.success', 'fr', 'Succès', 'common'),
('common.success', 'es', 'Éxito', 'common'),
('common.success', 'ru', 'Успех', 'common'),

('common.close', 'en', 'Close', 'common'),
('common.close', 'it', 'Chiudi', 'common'),
('common.close', 'de', 'Schließen', 'common'),
('common.close', 'fr', 'Fermer', 'common'),
('common.close', 'es', 'Cerrar', 'common'),
('common.close', 'ru', 'Закрыть', 'common'),

('common.save', 'en', 'Save', 'common'),
('common.save', 'it', 'Salva', 'common'),
('common.save', 'de', 'Speichern', 'common'),
('common.save', 'fr', 'Sauvegarder', 'common'),
('common.save', 'es', 'Guardar', 'common'),
('common.save', 'ru', 'Сохранить', 'common'),

('common.cancel', 'en', 'Cancel', 'common'),
('common.cancel', 'it', 'Annulla', 'common'),
('common.cancel', 'de', 'Abbrechen', 'common'),
('common.cancel', 'fr', 'Annuler', 'common'),
('common.cancel', 'es', 'Cancelar', 'common'),
('common.cancel', 'ru', 'Отменить', 'common'),

-- Pricing and features
('pricing.per_person', 'en', 'per person', 'pricing'),
('pricing.per_person', 'it', 'a persona', 'pricing'),
('pricing.per_person', 'de', 'pro Person', 'pricing'),
('pricing.per_person', 'fr', 'par personne', 'pricing'),
('pricing.per_person', 'es', 'por persona', 'pricing'),
('pricing.per_person', 'ru', 'с человека', 'pricing'),

('pricing.full_day', 'en', 'Full day experience', 'pricing'),
('pricing.full_day', 'it', 'Esperienza giornata intera', 'pricing'),
('pricing.full_day', 'de', 'Ganztageserlebnis', 'pricing'),
('pricing.full_day', 'fr', 'Expérience d''une journée complète', 'pricing'),
('pricing.full_day', 'es', 'Experiencia de día completo', 'pricing'),
('pricing.full_day', 'ru', 'Опыт полного дня', 'pricing')

ON CONFLICT (key, language_code) DO UPDATE SET 
  text = EXCLUDED.text,
  category = EXCLUDED.category,
  updated_at = now();
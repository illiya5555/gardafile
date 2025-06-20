-- Add SEO translations for all languages
INSERT INTO translations (key, language_code, text, category) VALUES
-- Home page SEO
('seo.home.title', 'en', 'Garda Racing Yacht Club - Premium Sailing Experiences on Lake Garda', 'seo'),
('seo.home.title', 'it', 'Garda Racing Yacht Club - Esperienze Premium di Vela sul Lago di Garda', 'seo'),
('seo.home.title', 'de', 'Garda Racing Yacht Club - Premium Segelerlebnisse am Gardasee', 'seo'),
('seo.home.title', 'fr', 'Garda Racing Yacht Club - Expériences de Voile Premium sur le Lac de Garde', 'seo'),
('seo.home.title', 'es', 'Garda Racing Yacht Club - Experiencias Premium de Vela en el Lago de Garda', 'seo'),
('seo.home.title', 'ru', 'Garda Racing Yacht Club - Премиум-опыт парусного спорта на озере Гарда', 'seo'),
('seo.home.title', 'pl', 'Garda Racing Yacht Club - Ekskluzywne doświadczenia żeglarskie na Jeziorze Garda', 'seo'),
('seo.home.title', 'he', 'מועדון יאכטות גארדה רייסינג - חוויות שיט פרימיום באגם גארדה', 'seo'),

('seo.home.description', 'en', 'Daily yacht racing experiences in world-famous Lake Garda. Professional skipper, racing medals, and unforgettable memories. Book your €195 sailing adventure today!', 'seo'),
('seo.home.description', 'it', 'Esperienze giornaliere di regata sul famoso Lago di Garda. Skipper professionista, medaglie e ricordi indimenticabili. Prenota oggi la tua avventura di vela a €195!', 'seo'),
('seo.home.description', 'de', 'Tägliche Yachtrennen-Erlebnisse am weltberühmten Gardasee. Professioneller Skipper, Rennmedaillen und unvergessliche Erinnerungen. Buchen Sie Ihr Segelabenteuer für €195 noch heute!', 'seo'),
('seo.home.description', 'fr', 'Expériences quotidiennes de régate sur le célèbre Lac de Garde. Skipper professionnel, médailles de course et souvenirs inoubliables. Réservez votre aventure de voile à €195 dès aujourd''hui!', 'seo'),
('seo.home.description', 'es', 'Experiencias diarias de regatas en el mundialmente famoso Lago de Garda. Patrón profesional, medallas de competición y recuerdos inolvidables. ¡Reserva tu aventura de vela por €195 hoy!', 'seo'),
('seo.home.description', 'ru', 'Ежедневные гонки на яхтах на всемирно известном озере Гарда. Профессиональный шкипер, гоночные медали и незабываемые воспоминания. Забронируйте свое парусное приключение за €195 уже сегодня!', 'seo'),
('seo.home.description', 'pl', 'Codzienne doświadczenia regat jachtowych na światowej sławy Jeziorze Garda. Profesjonalny skipper, medale i niezapomniane wspomnienia. Zarezerwuj swoją przygodę żeglarską za €195 już dziś!', 'seo'),
('seo.home.description', 'he', 'חוויות יומיות של תחרויות יאכטות באגם גארדה המפורסם בעולם. סקיפר מקצועי, מדליות תחרותיות, וזכרונות בלתי נשכחים. הזמן את הרפתקת השיט שלך ב-€195 היום!', 'seo'),

-- Events page SEO
('seo.events.title', 'en', 'Yacht Racing Events - Complete Day Program | Garda Racing', 'seo'),
('seo.events.title', 'it', 'Eventi di Regata - Programma Completo | Garda Racing', 'seo'),
('seo.events.title', 'de', 'Yachtrennen-Events - Komplettes Tagesprogramm | Garda Racing', 'seo'),
('seo.events.title', 'fr', 'Événements de Régate - Programme Complet | Garda Racing', 'seo'),
('seo.events.title', 'es', 'Eventos de Regata - Programa Completo | Garda Racing', 'seo'),
('seo.events.title', 'ru', 'События яхтенных гонок - Полная дневная программа | Garda Racing', 'seo'),
('seo.events.title', 'pl', 'Wydarzenia Regat Jachtowych - Pełny Program Dzienny | Garda Racing', 'seo'),
('seo.events.title', 'he', 'אירועי תחרויות יאכטות - תוכנית יום מלאה | Garda Racing', 'seo'),

-- Add additional missing translations for Polish and Hebrew
('booking.title', 'pl', 'Zarezerwuj swoje doświadczenie regat', 'booking_page'),
('booking.title', 'he', 'הזמן את חוויית התחרות שלך', 'booking_page'),

('booking.subtitle', 'pl', 'Wybierz datę i czas dla niezapomnianego doświadczenia regat jachtowych na Jeziorze Garda', 'booking_page'),
('booking.subtitle', 'he', 'בחר תאריך ושעה לחוויית תחרות יאכטות בלתי נשכחת באגם גארדה', 'booking_page'),

('booking.proceed_payment', 'pl', 'Przejdź do płatności', 'booking_page'),
('booking.proceed_payment', 'he', 'המשך לתשלום', 'booking_page'),

-- Add missing translations for header and footer
('header.logo.title', 'en', 'Garda Racing', 'common'),
('header.logo.title', 'it', 'Garda Racing', 'common'),
('header.logo.title', 'de', 'Garda Racing', 'common'),
('header.logo.title', 'fr', 'Garda Racing', 'common'),
('header.logo.title', 'es', 'Garda Racing', 'common'),
('header.logo.title', 'ru', 'Garda Racing', 'common'),
('header.logo.title', 'pl', 'Garda Racing', 'common'),
('header.logo.title', 'he', 'גארדה רייסינג', 'common'),

('header.logo.subtitle', 'en', 'Yacht Club', 'common'),
('header.logo.subtitle', 'it', 'Yacht Club', 'common'),
('header.logo.subtitle', 'de', 'Yacht Club', 'common'),
('header.logo.subtitle', 'fr', 'Yacht Club', 'common'),
('header.logo.subtitle', 'es', 'Yacht Club', 'common'),
('header.logo.subtitle', 'ru', 'Яхт-клуб', 'common'),
('header.logo.subtitle', 'pl', 'Klub Jachtowy', 'common'),
('header.logo.subtitle', 'he', 'מועדון יאכטות', 'common'),

-- Chat widget translations
('chat.support_title', 'en', 'Garda Racing Support', 'common'),
('chat.support_title', 'it', 'Supporto Garda Racing', 'common'),
('chat.support_title', 'de', 'Garda Racing Support', 'common'),
('chat.support_title', 'fr', 'Support Garda Racing', 'common'),
('chat.support_title', 'es', 'Soporte Garda Racing', 'common'),
('chat.support_title', 'ru', 'Поддержка Garda Racing', 'common'),
('chat.support_title', 'pl', 'Wsparcie Garda Racing', 'common'),
('chat.support_title', 'he', 'תמיכת Garda Racing', 'common'),

('chat.initial_message', 'en', 'Hello! How can I help you with your yacht racing experience today?', 'common'),
('chat.initial_message', 'it', 'Ciao! Come posso aiutarti con la tua esperienza di vela da regata oggi?', 'common'),
('chat.initial_message', 'de', 'Hallo! Wie kann ich Ihnen heute mit Ihrem Yachtrennen-Erlebnis helfen?', 'common'),
('chat.initial_message', 'fr', 'Bonjour! Comment puis-je vous aider avec votre expérience de régate aujourd''hui?', 'common'),
('chat.initial_message', 'es', '¡Hola! ¿Cómo puedo ayudarte con tu experiencia de regata hoy?', 'common'),
('chat.initial_message', 'ru', 'Здравствуйте! Чем я могу помочь вам с вашим опытом яхтенных гонок сегодня?', 'common'),
('chat.initial_message', 'pl', 'Cześć! Jak mogę pomóc ci z twoim doświadczeniem regat jachtowych dzisiaj?', 'common'),
('chat.initial_message', 'he', 'שלום! איך אני יכול לעזור לך עם חוויית תחרות היאכטות שלך היום?', 'common'),

('chat.placeholder', 'en', 'Type your message...', 'common'),
('chat.placeholder', 'it', 'Scrivi il tuo messaggio...', 'common'),
('chat.placeholder', 'de', 'Nachricht eingeben...', 'common'),
('chat.placeholder', 'fr', 'Tapez votre message...', 'common'),
('chat.placeholder', 'es', 'Escribe tu mensaje...', 'common'),
('chat.placeholder', 'ru', 'Введите ваше сообщение...', 'common'),
('chat.placeholder', 'pl', 'Wpisz swoją wiadomość...', 'common'),
('chat.placeholder', 'he', 'הקלד את הודעתך...', 'common')

ON CONFLICT (key, language_code) DO NOTHING;

-- Add RLS Policies for SEO translations (same as other translations)
ALTER POLICY "Public can read translations" ON public.translations USING (true);

-- Add indexes for faster translation lookups
CREATE INDEX IF NOT EXISTS idx_translations_language_key ON public.translations(language_code, key);
CREATE INDEX IF NOT EXISTS idx_translations_category ON public.translations(category);
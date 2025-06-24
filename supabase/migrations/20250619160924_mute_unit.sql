/*
  # Complete Translations Migration

  Add comprehensive translations for all pages and components including:
  1. Footer content and links
  2. Contact page content  
  3. Login/Authentication pages
  4. Dashboard and user interface
  5. Success and error messages
  6. Corporate sailing and gift certificates
  7. Feature descriptions and benefits
*/

INSERT INTO public.translations (key, language_code, text, category) VALUES 

-- Footer translations
('footer.company.description', 'en', 'Experience the thrill of yacht racing on world-famous Lake Garda. Premium equipment, unforgettable memories.', 'footer'),
('footer.company.description', 'it', 'Vivi l''emozione delle regate sul celebre Lago di Garda. Attrezzatura premium e ricordi indimenticabili.', 'footer'),
('footer.company.description', 'de', 'Erleben Sie den Nervenkitzel von Segelregatten auf dem weltberühmten Gardasee. Premium-Ausrüstung und unvergessliche Erlebnisse.', 'footer'),
('footer.company.description', 'fr', 'Vivez le frisson des régates sur le célèbre lac de Garde. Équipement premium et souvenirs inoubliables.', 'footer'),
('footer.company.description', 'es', 'Experimenta la emoción de las regatas en el mundialmente famoso Lago de Garda. Equipamiento premium y recuerdos inolvidables.', 'footer'),
('footer.company.description', 'ru', 'Испытайте азарт парусных регат на всемирно известном озере Гарда. Премиальное оборудование и незабываемые впечатления.', 'footer'),

('footer.links.quick_links', 'en', 'Quick Links', 'footer'),
('footer.links.quick_links', 'it', 'Link Rapidi', 'footer'),
('footer.links.quick_links', 'de', 'Schnelllinks', 'footer'),
('footer.links.quick_links', 'fr', 'Liens Rapides', 'footer'),
('footer.links.quick_links', 'es', 'Enlaces Rápidos', 'footer'),
('footer.links.quick_links', 'ru', 'Быстрые Ссылки', 'footer'),

('footer.contact.title', 'en', 'Contact', 'footer'),
('footer.contact.title', 'it', 'Contatti', 'footer'),
('footer.contact.title', 'de', 'Kontakt', 'footer'),
('footer.contact.title', 'fr', 'Contact', 'footer'),
('footer.contact.title', 'es', 'Contacto', 'footer'),
('footer.contact.title', 'ru', 'Контакты', 'footer'),

('footer.certifications.title', 'en', 'Certifications', 'footer'),
('footer.certifications.title', 'it', 'Certificazioni', 'footer'),
('footer.certifications.title', 'de', 'Zertifizierungen', 'footer'),
('footer.certifications.title', 'fr', 'Certifications', 'footer'),
('footer.certifications.title', 'es', 'Certificaciones', 'footer'),
('footer.certifications.title', 'ru', 'Сертификаты', 'footer'),

('footer.certifications.insured', 'en', 'Fully Insured', 'footer'),
('footer.certifications.insured', 'it', 'Completamente Assicurato', 'footer'),
('footer.certifications.insured', 'de', 'Vollversichert', 'footer'),
('footer.certifications.insured', 'fr', 'Entièrement Assuré', 'footer'),
('footer.certifications.insured', 'es', 'Completamente Asegurado', 'footer'),
('footer.certifications.insured', 'ru', 'Полная Страховка', 'footer'),

('footer.certifications.support', 'en', '24/7 Support', 'footer'),
('footer.certifications.support', 'it', 'Supporto 24/7', 'footer'),
('footer.certifications.support', 'de', '24/7 Support', 'footer'),
('footer.certifications.support', 'fr', 'Support 24/7', 'footer'),
('footer.certifications.support', 'es', 'Soporte 24/7', 'footer'),
('footer.certifications.support', 'ru', 'Поддержка 24/7', 'footer'),

('footer.operating_hours', 'en', 'Operating Hours:', 'footer'),
('footer.operating_hours', 'it', 'Orari di Apertura:', 'footer'),
('footer.operating_hours', 'de', 'Öffnungszeiten:', 'footer'),
('footer.operating_hours', 'fr', 'Heures d''ouverture:', 'footer'),
('footer.operating_hours', 'es', 'Horarios de Operación:', 'footer'),
('footer.operating_hours', 'ru', 'Время Работы:', 'footer'),

('footer.daily_hours', 'en', 'Daily: 8:00 AM - 7:00 PM', 'footer'),
('footer.daily_hours', 'it', 'Giornaliero: 8:00 - 19:00', 'footer'),
('footer.daily_hours', 'de', 'Täglich: 8:00 - 19:00', 'footer'),
('footer.daily_hours', 'fr', 'Quotidien: 8h00 - 19h00', 'footer'),
('footer.daily_hours', 'es', 'Diario: 8:00 - 19:00', 'footer'),
('footer.daily_hours', 'ru', 'Ежедневно: 8:00 - 19:00', 'footer'),

('footer.season', 'en', 'Season: March - October', 'footer'),
('footer.season', 'it', 'Stagione: Marzo - Ottobre', 'footer'),
('footer.season', 'de', 'Saison: März - Oktober', 'footer'),
('footer.season', 'fr', 'Saison: Mars - Octobre', 'footer'),
('footer.season', 'es', 'Temporada: Marzo - Octubre', 'footer'),
('footer.season', 'ru', 'Сезон: Март - Октябрь', 'footer'),

-- Contact page detailed translations
('contact.info.title', 'en', 'Contact Information', 'contact'),
('contact.info.title', 'it', 'Informazioni di Contatto', 'contact'),
('contact.info.title', 'de', 'Kontaktinformationen', 'contact'),
('contact.info.title', 'fr', 'Informations de Contact', 'contact'),
('contact.info.title', 'es', 'Información de Contacto', 'contact'),
('contact.info.title', 'ru', 'Контактная Информация', 'contact'),

('contact.info.address.title', 'en', 'Address', 'contact'),
('contact.info.address.title', 'it', 'Indirizzo', 'contact'),
('contact.info.address.title', 'de', 'Adresse', 'contact'),
('contact.info.address.title', 'fr', 'Adresse', 'contact'),
('contact.info.address.title', 'es', 'Dirección', 'contact'),
('contact.info.address.title', 'ru', 'Адрес', 'contact'),

('contact.info.phone.title', 'en', 'Phone', 'contact'),
('contact.info.phone.title', 'it', 'Telefono', 'contact'),
('contact.info.phone.title', 'de', 'Telefon', 'contact'),
('contact.info.phone.title', 'fr', 'Téléphone', 'contact'),
('contact.info.phone.title', 'es', 'Teléfono', 'contact'),
('contact.info.phone.title', 'ru', 'Телефон', 'contact'),

('contact.info.email.title', 'en', 'Email', 'contact'),
('contact.info.email.title', 'it', 'Email', 'contact'),
('contact.info.email.title', 'de', 'E-Mail', 'contact'),
('contact.info.email.title', 'fr', 'E-mail', 'contact'),
('contact.info.email.title', 'es', 'Correo electrónico', 'contact'),
('contact.info.email.title', 'ru', 'Электронная почта', 'contact'),

('contact.info.hours.title', 'en', 'Operating Hours', 'contact'),
('contact.info.hours.title', 'it', 'Orari di Apertura', 'contact'),
('contact.info.hours.title', 'de', 'Öffnungszeiten', 'contact'),
('contact.info.hours.title', 'fr', 'Heures d''ouverture', 'contact'),
('contact.info.hours.title', 'es', 'Horarios de Operación', 'contact'),
('contact.info.hours.title', 'ru', 'Время Работы', 'contact'),

('contact.form.title', 'en', 'Send a message', 'contact'),
('contact.form.title', 'it', 'Invia un messaggio', 'contact'),
('contact.form.title', 'de', 'Nachricht senden', 'contact'),
('contact.form.title', 'fr', 'Envoyer un message', 'contact'),
('contact.form.title', 'es', 'Enviar un mensaje', 'contact'),
('contact.form.title', 'ru', 'Отправить сообщение', 'contact'),

('contact.form.success.title', 'en', 'Message sent!', 'contact'),
('contact.form.success.title', 'it', 'Messaggio inviato!', 'contact'),
('contact.form.success.title', 'de', 'Nachricht gesendet!', 'contact'),
('contact.form.success.title', 'fr', 'Message envoyé!', 'contact'),
('contact.form.success.title', 'es', '¡Mensaje enviado!', 'contact'),
('contact.form.success.title', 'ru', 'Сообщение отправлено!', 'contact'),

('contact.form.success.message', 'en', 'We will contact you shortly.', 'contact'),
('contact.form.success.message', 'it', 'Ti contatteremo a breve.', 'contact'),
('contact.form.success.message', 'de', 'Wir werden Sie in Kürze kontaktieren.', 'contact'),
('contact.form.success.message', 'fr', 'Nous vous contacterons bientôt.', 'contact'),
('contact.form.success.message', 'es', 'Nos pondremos en contacto contigo pronto.', 'contact'),
('contact.form.success.message', 'ru', 'Мы свяжемся с вами в ближайшее время.', 'contact'),

-- Home page feature translations
('home.features.title', 'en', 'Why Choose Garda Racing?', 'home'),
('home.features.title', 'it', 'Perché Scegliere Garda Racing?', 'home'),
('home.features.title', 'de', 'Warum Garda Racing wählen?', 'home'),
('home.features.title', 'fr', 'Pourquoi Choisir Garda Racing?', 'home'),
('home.features.title', 'es', '¿Por Qué Elegir Garda Racing?', 'home'),
('home.features.title', 'ru', 'Почему Выбрать Garda Racing?', 'home'),

('home.features.subtitle', 'en', 'We provide the complete yacht racing experience with professional guidance, premium equipment, and memories that last a lifetime.', 'home'),
('home.features.subtitle', 'it', 'Forniamo l''esperienza completa di regata con guida professionale, attrezzature premium e ricordi che durano tutta la vita.', 'home'),
('home.features.subtitle', 'de', 'Wir bieten die komplette Yacht-Regatta-Erfahrung mit professioneller Anleitung, Premium-Ausrüstung und lebenslangen Erinnerungen.', 'home'),
('home.features.subtitle', 'fr', 'Nous offrons l''expérience complète de course de voiliers avec un encadrement professionnel, un équipement haut de gamme et des souvenirs qui durent toute une vie.', 'home'),
('home.features.subtitle', 'es', 'Ofrecemos la experiencia completa de regatas con orientación profesional, equipamiento premium y recuerdos que duran toda la vida.', 'home'),
('home.features.subtitle', 'ru', 'Мы предоставляем полный опыт парусных гонок с профессиональным руководством, премиальным оборудованием и воспоминаниями на всю жизнь.', 'home'),

-- Authentication translations
('auth.welcome_back', 'en', 'Welcome Back', 'auth'),
('auth.welcome_back', 'it', 'Bentornato', 'auth'),
('auth.welcome_back', 'de', 'Willkommen zurück', 'auth'),
('auth.welcome_back', 'fr', 'Bon retour', 'auth'),
('auth.welcome_back', 'es', 'Bienvenido de vuelta', 'auth'),
('auth.welcome_back', 'ru', 'Добро пожаловать обратно', 'auth'),

('auth.create_account', 'en', 'Create Account', 'auth'),
('auth.create_account', 'it', 'Crea Account', 'auth'),
('auth.create_account', 'de', 'Konto erstellen', 'auth'),
('auth.create_account', 'fr', 'Créer un compte', 'auth'),
('auth.create_account', 'es', 'Crear cuenta', 'auth'),
('auth.create_account', 'ru', 'Создать Аккаунт', 'auth'),

('auth.sign_in', 'en', 'Sign In', 'auth'),
('auth.sign_in', 'it', 'Accedi', 'auth'),
('auth.sign_in', 'de', 'Anmelden', 'auth'),
('auth.sign_in', 'fr', 'Se connecter', 'auth'),
('auth.sign_in', 'es', 'Iniciar sesión', 'auth'),
('auth.sign_in', 'ru', 'Войти', 'auth'),

('auth.sign_up', 'en', 'Sign Up', 'auth'),
('auth.sign_up', 'it', 'Registrati', 'auth'),
('auth.sign_up', 'de', 'Registrieren', 'auth'),
('auth.sign_up', 'fr', 'S''inscrire', 'auth'),
('auth.sign_up', 'es', 'Registrarse', 'auth'),
('auth.sign_up', 'ru', 'Зарегистрироваться', 'auth'),

('auth.password', 'en', 'Password', 'auth'),
('auth.password', 'it', 'Password', 'auth'),
('auth.password', 'de', 'Passwort', 'auth'),
('auth.password', 'fr', 'Mot de passe', 'auth'),
('auth.password', 'es', 'Contraseña', 'auth'),
('auth.password', 'ru', 'Пароль', 'auth'),

-- Dashboard translations
('dashboard.my_bookings', 'en', 'My Bookings', 'dashboard'),
('dashboard.my_bookings', 'it', 'Le Mie Prenotazioni', 'dashboard'),
('dashboard.my_bookings', 'de', 'Meine Buchungen', 'dashboard'),
('dashboard.my_bookings', 'fr', 'Mes Réservations', 'dashboard'),
('dashboard.my_bookings', 'es', 'Mis Reservas', 'dashboard'),
('dashboard.my_bookings', 'ru', 'Мои Бронирования', 'dashboard'),

('dashboard.my_profile', 'en', 'My Profile', 'dashboard'),
('dashboard.my_profile', 'it', 'Il Mio Profilo', 'dashboard'),
('dashboard.my_profile', 'de', 'Mein Profil', 'dashboard'),
('dashboard.my_profile', 'fr', 'Mon Profil', 'dashboard'),
('dashboard.my_profile', 'es', 'Mi Perfil', 'dashboard'),
('dashboard.my_profile', 'ru', 'Мой Профиль', 'dashboard'),

-- Booking specific translations
('booking.cta', 'en', 'Book Your Experience - €195', 'booking'),
('booking.cta', 'it', 'Prenota la Tua Esperienza - €195', 'booking'),
('booking.cta', 'de', 'Buchen Sie Ihr Erlebnis - €195', 'booking'),
('booking.cta', 'fr', 'Réservez Votre Expérience - €195', 'booking'),
('booking.cta', 'es', 'Reserve Su Experiencia - €195', 'booking'),
('booking.cta', 'ru', 'Забронируйте Ваш Опыт - €195', 'booking'),

('booking.proceed_payment', 'en', 'Proceed to payment', 'booking'),
('booking.proceed_payment', 'it', 'Procedi al pagamento', 'booking'),
('booking.proceed_payment', 'de', 'Zur Zahlung fortfahren', 'booking'),
('booking.proceed_payment', 'fr', 'Procéder au paiement', 'booking'),
('booking.proceed_payment', 'es', 'Proceder al pago', 'booking'),
('booking.proceed_payment', 'ru', 'Перейти к оплате', 'booking'),

-- Success page translations
('success.title', 'en', 'Payment Successful!', 'success'),
('success.title', 'it', 'Pagamento Riuscito!', 'success'),
('success.title', 'de', 'Zahlung Erfolgreich!', 'success'),
('success.title', 'fr', 'Paiement Réussi!', 'success'),
('success.title', 'es', '¡Pago Exitoso!', 'success'),
('success.title', 'ru', 'Платёж Успешен!', 'success'),

('success.subtitle', 'en', 'Thank you for your purchase. Your booking has been confirmed.', 'success'),
('success.subtitle', 'it', 'Grazie per il tuo acquisto. La tua prenotazione è stata confermata.', 'success'),
('success.subtitle', 'de', 'Vielen Dank für Ihren Kauf. Ihre Buchung wurde bestätigt.', 'success'),
('success.subtitle', 'fr', 'Merci pour votre achat. Votre réservation a été confirmée.', 'success'),
('success.subtitle', 'es', 'Gracias por su compra. Su reserva ha sido confirmada.', 'success'),
('success.subtitle', 'ru', 'Спасибо за покупку. Ваше бронирование подтверждено.', 'success')

ON CONFLICT (key, language_code) DO UPDATE SET 
  text = EXCLUDED.text,
  category = EXCLUDED.category,
  updated_at = now();
/*
  # Add Contact Page Translations

  This migration adds translations for the Contact page in multiple languages.
  It only inserts the translations and doesn't modify any existing tables or policies.
*/

-- Insert Contact Page translations
INSERT INTO translations (key, language_code, text, category) VALUES
-- Contact Page Translations
('contact.hero.title', 'en', 'Contact Us', 'contact_page'),
('contact.hero.title', 'de', 'Kontaktieren Sie uns', 'contact_page'),
('contact.hero.title', 'fr', 'Contactez-nous', 'contact_page'),
('contact.hero.title', 'it', 'Contattaci', 'contact_page'),
('contact.hero.title', 'es', 'Contáctanos', 'contact_page'),
('contact.hero.title', 'pl', 'Skontaktuj się z nami', 'contact_page'),
('contact.hero.title', 'he', 'צור קשר', 'contact_page'),
('contact.hero.title', 'ru', 'Свяжитесь с нами', 'contact_page'),

('contact.hero.subtitle', 'en', 'We are ready to answer all your questions and help organize an unforgettable sailing adventure on Lake Garda', 'contact_page'),
('contact.hero.subtitle', 'de', 'Wir sind bereit, alle Ihre Fragen zu beantworten und Ihnen bei der Organisation eines unvergesslichen Segelabenteuer am Gardasee zu helfen', 'contact_page'),
('contact.hero.subtitle', 'fr', 'Nous sommes prêts à répondre à toutes vos questions et à vous aider à organiser une aventure de voile inoubliable sur le lac de Garde', 'contact_page'),
('contact.hero.subtitle', 'it', 'Siamo pronti a rispondere a tutte le vostre domande e ad aiutarvi a organizzare un''avventura velica indimenticabile sul Lago di Garda', 'contact_page'),
('contact.hero.subtitle', 'es', 'Estamos listos para responder todas sus preguntas y ayudar a organizar una aventura de navegación inolvidable en el Lago de Garda', 'contact_page'),
('contact.hero.subtitle', 'pl', 'Jesteśmy gotowi odpowiedzieć na wszystkie Twoje pytania i pomóc zorganizować niezapomnianą przygodę żeglarską na jeziorze Garda', 'contact_page'),
('contact.hero.subtitle', 'he', 'אנחנו מוכנים לענות על כל השאלות שלכם ולעזור לארגן הרפתקת שיט בלתי נשכחת באגם גארדה', 'contact_page'),
('contact.hero.subtitle', 'ru', 'Мы готовы ответить на все ваши вопросы и помочь организовать незабываемое парусное приключение на озере Гарда', 'contact_page'),

('contact.info.title', 'en', 'Contact Information', 'contact_page'),
('contact.info.title', 'de', 'Kontaktinformationen', 'contact_page'),
('contact.info.title', 'fr', 'Informations de contact', 'contact_page'),
('contact.info.title', 'it', 'Informazioni di contatto', 'contact_page'),
('contact.info.title', 'es', 'Información de contacto', 'contact_page'),
('contact.info.title', 'pl', 'Informacje kontaktowe', 'contact_page'),
('contact.info.title', 'he', 'פרטי התקשרות', 'contact_page'),
('contact.info.title', 'ru', 'Контактная информация', 'contact_page'),

('contact.info.address.title', 'en', 'Address', 'contact_page'),
('contact.info.address.title', 'de', 'Adresse', 'contact_page'),
('contact.info.address.title', 'fr', 'Adresse', 'contact_page'),
('contact.info.address.title', 'it', 'Indirizzo', 'contact_page'),
('contact.info.address.title', 'es', 'Dirección', 'contact_page'),
('contact.info.address.title', 'pl', 'Adres', 'contact_page'),
('contact.info.address.title', 'he', 'כתובת', 'contact_page'),
('contact.info.address.title', 'ru', 'Адрес', 'contact_page'),

('contact.info.phone.title', 'en', 'Phone', 'contact_page'),
('contact.info.phone.title', 'de', 'Telefon', 'contact_page'),
('contact.info.phone.title', 'fr', 'Téléphone', 'contact_page'),
('contact.info.phone.title', 'it', 'Telefono', 'contact_page'),
('contact.info.phone.title', 'es', 'Teléfono', 'contact_page'),
('contact.info.phone.title', 'pl', 'Telefon', 'contact_page'),
('contact.info.phone.title', 'he', 'טלפון', 'contact_page'),
('contact.info.phone.title', 'ru', 'Телефон', 'contact_page'),

('contact.info.email.title', 'en', 'Email', 'contact_page'),
('contact.info.email.title', 'de', 'E-Mail', 'contact_page'),
('contact.info.email.title', 'fr', 'E-mail', 'contact_page'),
('contact.info.email.title', 'it', 'Email', 'contact_page'),
('contact.info.email.title', 'es', 'Correo electrónico', 'contact_page'),
('contact.info.email.title', 'pl', 'E-mail', 'contact_page'),
('contact.info.email.title', 'he', 'אימייל', 'contact_page'),
('contact.info.email.title', 'ru', 'Электронная почта', 'contact_page'),

('contact.info.hours.title', 'en', 'Operating Hours', 'contact_page'),
('contact.info.hours.title', 'de', 'Öffnungszeiten', 'contact_page'),
('contact.info.hours.title', 'fr', 'Heures d''ouverture', 'contact_page'),
('contact.info.hours.title', 'it', 'Orari di apertura', 'contact_page'),
('contact.info.hours.title', 'es', 'Horarios de operación', 'contact_page'),
('contact.info.hours.title', 'pl', 'Godziny pracy', 'contact_page'),
('contact.info.hours.title', 'he', 'שעות פעילות', 'contact_page'),
('contact.info.hours.title', 'ru', 'Часы работы', 'contact_page'),

('contact.info.hours.daily', 'en', 'Daily: 8:00 AM - 7:00 PM', 'contact_page'),
('contact.info.hours.daily', 'de', 'Täglich: 8:00 - 19:00 Uhr', 'contact_page'),
('contact.info.hours.daily', 'fr', 'Quotidien: 8h00 - 19h00', 'contact_page'),
('contact.info.hours.daily', 'it', 'Giornaliero: 8:00 - 19:00', 'contact_page'),
('contact.info.hours.daily', 'es', 'Diario: 8:00 AM - 7:00 PM', 'contact_page'),
('contact.info.hours.daily', 'pl', 'Codziennie: 8:00 - 19:00', 'contact_page'),
('contact.info.hours.daily', 'he', 'יומי: 8:00 - 19:00', 'contact_page'),
('contact.info.hours.daily', 'ru', 'Ежедневно: 8:00 - 19:00', 'contact_page'),

('contact.info.hours.season', 'en', 'Season: March - October', 'contact_page'),
('contact.info.hours.season', 'de', 'Saison: März - Oktober', 'contact_page'),
('contact.info.hours.season', 'fr', 'Saison: Mars - Octobre', 'contact_page'),
('contact.info.hours.season', 'it', 'Stagione: Marzo - Ottobre', 'contact_page'),
('contact.info.hours.season', 'es', 'Temporada: Marzo - Octubre', 'contact_page'),
('contact.info.hours.season', 'pl', 'Sezon: Marzec - Październik', 'contact_page'),
('contact.info.hours.season', 'he', 'עונה: מרץ - אוקטובר', 'contact_page'),
('contact.info.hours.season', 'ru', 'Сезон: Март - Октябрь', 'contact_page'),

('contact.info.map.title', 'en', 'How to find us', 'contact_page'),
('contact.info.map.title', 'de', 'So finden Sie uns', 'contact_page'),
('contact.info.map.title', 'fr', 'Comment nous trouver', 'contact_page'),
('contact.info.map.title', 'it', 'Come trovarci', 'contact_page'),
('contact.info.map.title', 'es', 'Cómo encontrarnos', 'contact_page'),
('contact.info.map.title', 'pl', 'Jak nas znaleźć', 'contact_page'),
('contact.info.map.title', 'he', 'איך למצוא אותנו', 'contact_page'),
('contact.info.map.title', 'ru', 'Как нас найти', 'contact_page'),

('contact.form.title', 'en', 'Send a message', 'contact_page'),
('contact.form.title', 'de', 'Nachricht senden', 'contact_page'),
('contact.form.title', 'fr', 'Envoyer un message', 'contact_page'),
('contact.form.title', 'it', 'Invia un messaggio', 'contact_page'),
('contact.form.title', 'es', 'Enviar un mensaje', 'contact_page'),
('contact.form.title', 'pl', 'Wyślij wiadomość', 'contact_page'),
('contact.form.title', 'he', 'שלח הודעה', 'contact_page'),
('contact.form.title', 'ru', 'Отправить сообщение', 'contact_page'),

('contact.form.name.label', 'en', 'Name', 'contact_page'),
('contact.form.name.label', 'de', 'Name', 'contact_page'),
('contact.form.name.label', 'fr', 'Nom', 'contact_page'),
('contact.form.name.label', 'it', 'Nome', 'contact_page'),
('contact.form.name.label', 'es', 'Nombre', 'contact_page'),
('contact.form.name.label', 'pl', 'Imię', 'contact_page'),
('contact.form.name.label', 'he', 'שם', 'contact_page'),
('contact.form.name.label', 'ru', 'Имя', 'contact_page'),

('contact.form.name.placeholder', 'en', 'Your name', 'contact_page'),
('contact.form.name.placeholder', 'de', 'Ihr Name', 'contact_page'),
('contact.form.name.placeholder', 'fr', 'Votre nom', 'contact_page'),
('contact.form.name.placeholder', 'it', 'Il tuo nome', 'contact_page'),
('contact.form.name.placeholder', 'es', 'Tu nombre', 'contact_page'),
('contact.form.name.placeholder', 'pl', 'Twoje imię', 'contact_page'),
('contact.form.name.placeholder', 'he', 'השם שלך', 'contact_page'),
('contact.form.name.placeholder', 'ru', 'Ваше имя', 'contact_page'),

('contact.form.email.label', 'en', 'Email', 'contact_page'),
('contact.form.email.label', 'de', 'E-Mail', 'contact_page'),
('contact.form.email.label', 'fr', 'E-mail', 'contact_page'),
('contact.form.email.label', 'it', 'Email', 'contact_page'),
('contact.form.email.label', 'es', 'Correo electrónico', 'contact_page'),
('contact.form.email.label', 'pl', 'E-mail', 'contact_page'),
('contact.form.email.label', 'he', 'אימייל', 'contact_page'),
('contact.form.email.label', 'ru', 'Электронная почта', 'contact_page'),

('contact.form.email.placeholder', 'en', 'your@email.com', 'contact_page'),
('contact.form.email.placeholder', 'de', 'ihre@email.com', 'contact_page'),
('contact.form.email.placeholder', 'fr', 'votre@email.com', 'contact_page'),
('contact.form.email.placeholder', 'it', 'tua@email.com', 'contact_page'),
('contact.form.email.placeholder', 'es', 'tu@email.com', 'contact_page'),
('contact.form.email.placeholder', 'pl', 'twoj@email.com', 'contact_page'),
('contact.form.email.placeholder', 'he', 'email@שלך.com', 'contact_page'),
('contact.form.email.placeholder', 'ru', 'ваш@email.com', 'contact_page'),

('contact.form.phone.label', 'en', 'Phone', 'contact_page'),
('contact.form.phone.label', 'de', 'Telefon', 'contact_page'),
('contact.form.phone.label', 'fr', 'Téléphone', 'contact_page'),
('contact.form.phone.label', 'it', 'Telefono', 'contact_page'),
('contact.form.phone.label', 'es', 'Teléfono', 'contact_page'),
('contact.form.phone.label', 'pl', 'Telefon', 'contact_page'),
('contact.form.phone.label', 'he', 'טלפון', 'contact_page'),
('contact.form.phone.label', 'ru', 'Телефон', 'contact_page'),

('contact.form.subject.label', 'en', 'Subject', 'contact_page'),
('contact.form.subject.label', 'de', 'Betreff', 'contact_page'),
('contact.form.subject.label', 'fr', 'Sujet', 'contact_page'),
('contact.form.subject.label', 'it', 'Oggetto', 'contact_page'),
('contact.form.subject.label', 'es', 'Asunto', 'contact_page'),
('contact.form.subject.label', 'pl', 'Temat', 'contact_page'),
('contact.form.subject.label', 'he', 'נושא', 'contact_page'),
('contact.form.subject.label', 'ru', 'Тема', 'contact_page'),

('contact.form.subject.placeholder', 'en', 'Select subject', 'contact_page'),
('contact.form.subject.placeholder', 'de', 'Betreff auswählen', 'contact_page'),
('contact.form.subject.placeholder', 'fr', 'Sélectionner le sujet', 'contact_page'),
('contact.form.subject.placeholder', 'it', 'Seleziona oggetto', 'contact_page'),
('contact.form.subject.placeholder', 'es', 'Seleccionar asunto', 'contact_page'),
('contact.form.subject.placeholder', 'pl', 'Wybierz temat', 'contact_page'),
('contact.form.subject.placeholder', 'he', 'בחר נושא', 'contact_page'),
('contact.form.subject.placeholder', 'ru', 'Выберите тему', 'contact_page'),

('contact.form.subject.booking', 'en', 'Booking', 'contact_page'),
('contact.form.subject.booking', 'de', 'Buchung', 'contact_page'),
('contact.form.subject.booking', 'fr', 'Réservation', 'contact_page'),
('contact.form.subject.booking', 'it', 'Prenotazione', 'contact_page'),
('contact.form.subject.booking', 'es', 'Reserva', 'contact_page'),
('contact.form.subject.booking', 'pl', 'Rezerwacja', 'contact_page'),
('contact.form.subject.booking', 'he', 'הזמנה', 'contact_page'),
('contact.form.subject.booking', 'ru', 'Бронирование', 'contact_page'),

('contact.form.subject.corporate', 'en', 'Corporate Events', 'contact_page'),
('contact.form.subject.corporate', 'de', 'Firmenveranstaltungen', 'contact_page'),
('contact.form.subject.corporate', 'fr', 'Événements d''entreprise', 'contact_page'),
('contact.form.subject.corporate', 'it', 'Eventi aziendali', 'contact_page'),
('contact.form.subject.corporate', 'es', 'Eventos corporativos', 'contact_page'),
('contact.form.subject.corporate', 'pl', 'Wydarzenia firmowe', 'contact_page'),
('contact.form.subject.corporate', 'he', 'אירועים עסקיים', 'contact_page'),
('contact.form.subject.corporate', 'ru', 'Корпоративные мероприятия', 'contact_page'),

('contact.form.subject.general', 'en', 'General Questions', 'contact_page'),
('contact.form.subject.general', 'de', 'Allgemeine Fragen', 'contact_page'),
('contact.form.subject.general', 'fr', 'Questions générales', 'contact_page'),
('contact.form.subject.general', 'it', 'Domande generali', 'contact_page'),
('contact.form.subject.general', 'es', 'Preguntas generales', 'contact_page'),
('contact.form.subject.general', 'pl', 'Pytania ogólne', 'contact_page'),
('contact.form.subject.general', 'he', 'שאלות כלליות', 'contact_page'),
('contact.form.subject.general', 'ru', 'Общие вопросы', 'contact_page'),

('contact.form.subject.partnership', 'en', 'Partnership', 'contact_page'),
('contact.form.subject.partnership', 'de', 'Partnerschaft', 'contact_page'),
('contact.form.subject.partnership', 'fr', 'Partenariat', 'contact_page'),
('contact.form.subject.partnership', 'it', 'Partnership', 'contact_page'),
('contact.form.subject.partnership', 'es', 'Asociación', 'contact_page'),
('contact.form.subject.partnership', 'pl', 'Partnerstwo', 'contact_page'),
('contact.form.subject.partnership', 'he', 'שותפות', 'contact_page'),
('contact.form.subject.partnership', 'ru', 'Партнерство', 'contact_page'),

('contact.form.subject.other', 'en', 'Other', 'contact_page'),
('contact.form.subject.other', 'de', 'Sonstiges', 'contact_page'),
('contact.form.subject.other', 'fr', 'Autre', 'contact_page'),
('contact.form.subject.other', 'it', 'Altro', 'contact_page'),
('contact.form.subject.other', 'es', 'Otro', 'contact_page'),
('contact.form.subject.other', 'pl', 'Inne', 'contact_page'),
('contact.form.subject.other', 'he', 'אחר', 'contact_page'),
('contact.form.subject.other', 'ru', 'Другое', 'contact_page'),

('contact.form.message.label', 'en', 'Message', 'contact_page'),
('contact.form.message.label', 'de', 'Nachricht', 'contact_page'),
('contact.form.message.label', 'fr', 'Message', 'contact_page'),
('contact.form.message.label', 'it', 'Messaggio', 'contact_page'),
('contact.form.message.label', 'es', 'Mensaje', 'contact_page'),
('contact.form.message.label', 'pl', 'Wiadomość', 'contact_page'),
('contact.form.message.label', 'he', 'הודעה', 'contact_page'),
('contact.form.message.label', 'ru', 'Сообщение', 'contact_page'),

('contact.form.message.placeholder', 'en', 'Tell us about your questions or wishes...', 'contact_page'),
('contact.form.message.placeholder', 'de', 'Erzählen Sie uns von Ihren Fragen oder Wünschen...', 'contact_page'),
('contact.form.message.placeholder', 'fr', 'Parlez-nous de vos questions ou souhaits...', 'contact_page'),
('contact.form.message.placeholder', 'it', 'Raccontaci delle tue domande o desideri...', 'contact_page'),
('contact.form.message.placeholder', 'es', 'Cuéntanos sobre tus preguntas o deseos...', 'contact_page'),
('contact.form.message.placeholder', 'pl', 'Opowiedz nam o swoich pytaniach lub życzeniach...', 'contact_page'),
('contact.form.message.placeholder', 'he', 'ספר לנו על השאלות או הרצונות שלך...', 'contact_page'),
('contact.form.message.placeholder', 'ru', 'Расскажите нам о ваших вопросах или пожеланиях...', 'contact_page'),

('contact.form.submit', 'en', 'Send message', 'contact_page'),
('contact.form.submit', 'de', 'Nachricht senden', 'contact_page'),
('contact.form.submit', 'fr', 'Envoyer le message', 'contact_page'),
('contact.form.submit', 'it', 'Invia messaggio', 'contact_page'),
('contact.form.submit', 'es', 'Enviar mensaje', 'contact_page'),
('contact.form.submit', 'pl', 'Wyślij wiadomość', 'contact_page'),
('contact.form.submit', 'he', 'שלח הודעה', 'contact_page'),
('contact.form.submit', 'ru', 'Отправить сообщение', 'contact_page'),

('contact.form.error', 'en', 'An error occurred while sending your message. Please try again.', 'contact_page'),
('contact.form.error', 'de', 'Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.', 'contact_page'),
('contact.form.error', 'fr', 'Une erreur s''est produite lors de l''envoi de votre message. Veuillez réessayer.', 'contact_page'),
('contact.form.error', 'it', 'Si è verificato un errore durante l''invio del messaggio. Si prega di riprovare.', 'contact_page'),
('contact.form.error', 'es', 'Se produjo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.', 'contact_page'),
('contact.form.error', 'pl', 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.', 'contact_page'),
('contact.form.error', 'he', 'אירעה שגיאה בעת שליחת ההודעה שלך. אנא נסה שוב.', 'contact_page'),
('contact.form.error', 'ru', 'Произошла ошибка при отправке вашего сообщения. Пожалуйста, попробуйте еще раз.', 'contact_page'),

('contact.form.success.title', 'en', 'Message sent!', 'contact_page'),
('contact.form.success.title', 'de', 'Nachricht gesendet!', 'contact_page'),
('contact.form.success.title', 'fr', 'Message envoyé!', 'contact_page'),
('contact.form.success.title', 'it', 'Messaggio inviato!', 'contact_page'),
('contact.form.success.title', 'es', '¡Mensaje enviado!', 'contact_page'),
('contact.form.success.title', 'pl', 'Wiadomość wysłana!', 'contact_page'),
('contact.form.success.title', 'he', 'ההודעה נשלחה!', 'contact_page'),
('contact.form.success.title', 'ru', 'Сообщение отправлено!', 'contact_page'),

('contact.form.success.message', 'en', 'We will contact you shortly.', 'contact_page'),
('contact.form.success.message', 'de', 'Wir werden uns in Kürze bei Ihnen melden.', 'contact_page'),
('contact.form.success.message', 'fr', 'Nous vous contacterons sous peu.', 'contact_page'),
('contact.form.success.message', 'it', 'Ti contatteremo a breve.', 'contact_page'),
('contact.form.success.message', 'es', 'Nos pondremos en contacto contigo en breve.', 'contact_page'),
('contact.form.success.message', 'pl', 'Skontaktujemy się z Tobą wkrótce.', 'contact_page'),
('contact.form.success.message', 'he', 'ניצור איתך קשר בקרוב.', 'contact_page'),
('contact.form.success.message', 'ru', 'Мы свяжемся с вами в ближайшее время.', 'contact_page'),

('contact.form.success.send_another', 'en', 'Send another message', 'contact_page'),
('contact.form.success.send_another', 'de', 'Eine weitere Nachricht senden', 'contact_page'),
('contact.form.success.send_another', 'fr', 'Envoyer un autre message', 'contact_page'),
('contact.form.success.send_another', 'it', 'Invia un altro messaggio', 'contact_page'),
('contact.form.success.send_another', 'es', 'Enviar otro mensaje', 'contact_page'),
('contact.form.success.send_another', 'pl', 'Wyślij kolejną wiadomość', 'contact_page'),
('contact.form.success.send_another', 'he', 'שלח הודעה נוספת', 'contact_page'),
('contact.form.success.send_another', 'ru', 'Отправить еще одно сообщение', 'contact_page'),

('contact.quick.title', 'en', 'Need quick help?', 'contact_page'),
('contact.quick.title', 'de', 'Benötigen Sie schnelle Hilfe?', 'contact_page'),
('contact.quick.title', 'fr', 'Besoin d''aide rapide?', 'contact_page'),
('contact.quick.title', 'it', 'Hai bisogno di aiuto veloce?', 'contact_page'),
('contact.quick.title', 'es', '¿Necesitas ayuda rápida?', 'contact_page'),
('contact.quick.title', 'pl', 'Potrzebujesz szybkiej pomocy?', 'contact_page'),
('contact.quick.title', 'he', 'צריך עזרה מהירה?', 'contact_page'),
('contact.quick.title', 'ru', 'Нужна быстрая помощь?', 'contact_page'),

('contact.faq.title', 'en', 'Frequently asked questions', 'contact_page'),
('contact.faq.title', 'de', 'Häufig gestellte Fragen', 'contact_page'),
('contact.faq.title', 'fr', 'Questions fréquemment posées', 'contact_page'),
('contact.faq.title', 'it', 'Domande frequenti', 'contact_page'),
('contact.faq.title', 'es', 'Preguntas frecuentes', 'contact_page'),
('contact.faq.title', 'pl', 'Często zadawane pytania', 'contact_page'),
('contact.faq.title', 'he', 'שאלות נפוצות', 'contact_page'),
('contact.faq.title', 'ru', 'Часто задаваемые вопросы', 'contact_page'),

('contact.faq.booking.question', 'en', 'How to book?', 'contact_page'),
('contact.faq.booking.question', 'de', 'Wie kann ich buchen?', 'contact_page'),
('contact.faq.booking.question', 'fr', 'Comment réserver?', 'contact_page'),
('contact.faq.booking.question', 'it', 'Come prenotare?', 'contact_page'),
('contact.faq.booking.question', 'es', '¿Cómo reservar?', 'contact_page'),
('contact.faq.booking.question', 'pl', 'Jak zarezerwować?', 'contact_page'),
('contact.faq.booking.question', 'he', 'איך להזמין?', 'contact_page'),
('contact.faq.booking.question', 'ru', 'Как забронировать?', 'contact_page'),

('contact.faq.booking.answer', 'en', 'You can book through our website, call us, or email us. We will confirm your booking within 24 hours.', 'contact_page'),
('contact.faq.booking.answer', 'de', 'Sie können über unsere Website buchen, uns anrufen oder uns eine E-Mail senden. Wir bestätigen Ihre Buchung innerhalb von 24 Stunden.', 'contact_page'),
('contact.faq.booking.answer', 'fr', 'Vous pouvez réserver via notre site web, nous appeler ou nous envoyer un e-mail. Nous confirmerons votre réservation dans les 24 heures.', 'contact_page'),
('contact.faq.booking.answer', 'it', 'Puoi prenotare tramite il nostro sito web, chiamarci o inviarci un''email. Confermeremo la tua prenotazione entro 24 ore.', 'contact_page'),
('contact.faq.booking.answer', 'es', 'Puedes reservar a través de nuestro sitio web, llamarnos o enviarnos un correo electrónico. Confirmaremos tu reserva dentro de las 24 horas.', 'contact_page'),
('contact.faq.booking.answer', 'pl', 'Możesz zarezerwować przez naszą stronę internetową, zadzwonić do nas lub wysłać e-mail. Potwierdzimy Twoją rezerwację w ciągu 24 godzin.', 'contact_page'),
('contact.faq.booking.answer', 'he', 'אתה יכול להזמין דרך האתר שלנו, להתקשר אלינו או לשלוח לנו אימייל. נאשר את ההזמנה שלך תוך 24 שעות.', 'contact_page'),
('contact.faq.booking.answer', 'ru', 'Вы можете забронировать через наш сайт, позвонить нам или отправить электронное письмо. Мы подтвердим ваше бронирование в течение 24 часов.', 'contact_page'),

('contact.faq.weather.question', 'en', 'What weather is suitable for sailing?', 'contact_page'),
('contact.faq.weather.question', 'de', 'Welches Wetter eignet sich zum Segeln?', 'contact_page'),
('contact.faq.weather.question', 'fr', 'Quel temps convient à la voile?', 'contact_page'),
('contact.faq.weather.question', 'it', 'Che tempo è adatto per la vela?', 'contact_page'),
('contact.faq.weather.question', 'es', '¿Qué clima es adecuado para navegar?', 'contact_page'),
('contact.faq.weather.question', 'pl', 'Jaka pogoda jest odpowiednia do żeglowania?', 'contact_page'),
('contact.faq.weather.question', 'he', 'איזה מזג אוויר מתאים לשיט?', 'contact_page'),
('contact.faq.weather.question', 'ru', 'Какая погода подходит для парусного спорта?', 'contact_page'),

('contact.faq.weather.answer', 'en', 'We go to sea with winds from 5 to 25 knots. In adverse conditions, we will offer a reschedule or a full refund.', 'contact_page'),
('contact.faq.weather.answer', 'de', 'Wir fahren bei Winden von 5 bis 25 Knoten aufs Meer. Bei widrigen Bedingungen bieten wir eine Umbuchung oder eine vollständige Rückerstattung an.', 'contact_page'),
('contact.faq.weather.answer', 'fr', 'Nous allons en mer avec des vents de 5 à 25 nœuds. En cas de conditions défavorables, nous proposerons un report ou un remboursement intégral.', 'contact_page'),
('contact.faq.weather.answer', 'it', 'Andiamo in mare con venti da 5 a 25 nodi. In condizioni avverse, offriremo un riprogrammazione o un rimborso completo.', 'contact_page'),
('contact.faq.weather.answer', 'es', 'Salimos al mar con vientos de 5 a 25 nudos. En condiciones adversas, ofreceremos reprogramar o un reembolso completo.', 'contact_page'),
('contact.faq.weather.answer', 'pl', 'Wypływamy na morze przy wiatrach od 5 do 25 węzłów. W niekorzystnych warunkach zaoferujemy zmianę terminu lub pełny zwrot kosztów.', 'contact_page'),
('contact.faq.weather.answer', 'he', 'אנחנו יוצאים לים עם רוחות מ-5 עד 25 קשר. בתנאים קשים, נציע לקבוע מחדש או החזר כספי מלא.', 'contact_page'),
('contact.faq.weather.answer', 'ru', 'Мы выходим в море при ветре от 5 до 25 узлов. В неблагоприятных условиях мы предложим перенос или полный возврат средств.', 'contact_page'),

('contact.faq.experience.question', 'en', 'Is sailing experience required?', 'contact_page'),
('contact.faq.experience.question', 'de', 'Ist Segelerfahrung erforderlich?', 'contact_page'),
('contact.faq.experience.question', 'fr', 'Une expérience de voile est-elle requise?', 'contact_page'),
('contact.faq.experience.question', 'it', 'È richiesta esperienza di vela?', 'contact_page'),
('contact.faq.experience.question', 'es', '¿Se requiere experiencia en navegación?', 'contact_page'),
('contact.faq.experience.question', 'pl', 'Czy wymagane jest doświadczenie żeglarskie?', 'contact_page'),
('contact.faq.experience.question', 'he', 'האם נדרש ניסיון בשיט?', 'contact_page'),
('contact.faq.experience.question', 'ru', 'Требуется ли опыт парусного спорта?', 'contact_page'),

('contact.faq.experience.answer', 'en', 'No, experience is not required. Our professional instructors will teach you everything you need and ensure safety on the water.', 'contact_page'),
('contact.faq.experience.answer', 'de', 'Nein, Erfahrung ist nicht erforderlich. Unsere professionellen Ausbilder bringen Ihnen alles bei, was Sie brauchen, und sorgen für Sicherheit auf dem Wasser.', 'contact_page'),
('contact.faq.experience.answer', 'fr', 'Non, l''expérience n''est pas requise. Nos instructeurs professionnels vous apprendront tout ce dont vous avez besoin et assureront votre sécurité sur l''eau.', 'contact_page'),
('contact.faq.experience.answer', 'it', 'No, l''esperienza non è richiesta. I nostri istruttori professionisti ti insegneranno tutto ciò di cui hai bisogno e garantiranno la sicurezza in acqua.', 'contact_page'),
('contact.faq.experience.answer', 'es', 'No, no se requiere experiencia. Nuestros instructores profesionales te enseñarán todo lo que necesitas y garantizarán la seguridad en el agua.', 'contact_page'),
('contact.faq.experience.answer', 'pl', 'Nie, doświadczenie nie jest wymagane. Nasi profesjonalni instruktorzy nauczą Cię wszystkiego, czego potrzebujesz i zapewnią bezpieczeństwo na wodzie.', 'contact_page'),
('contact.faq.experience.answer', 'he', 'לא, לא נדרש ניסיון. המדריכים המקצועיים שלנו ילמדו אותך כל מה שאתה צריך ויבטיחו בטיחות במים.', 'contact_page'),
('contact.faq.experience.answer', 'ru', 'Нет, опыт не требуется. Наши профессиональные инструкторы научат вас всему необходимому и обеспечат безопасность на воде.', 'contact_page'),

('contact.faq.included.question', 'en', 'What is included in the price?', 'contact_page'),
('contact.faq.included.question', 'de', 'Was ist im Preis enthalten?', 'contact_page'),
('contact.faq.included.question', 'fr', 'Qu''est-ce qui est inclus dans le prix?', 'contact_page'),
('contact.faq.included.question', 'it', 'Cosa è incluso nel prezzo?', 'contact_page'),
('contact.faq.included.question', 'es', '¿Qué está incluido en el precio?', 'contact_page'),
('contact.faq.included.question', 'pl', 'Co jest wliczone w cenę?', 'contact_page'),
('contact.faq.included.question', 'he', 'מה כלול במחיר?', 'contact_page'),
('contact.faq.included.question', 'ru', 'Что включено в стоимость?', 'contact_page'),

('contact.faq.included.answer', 'en', 'The price includes: professional skipper, all equipment, instruction, participant medal, and professional photos.', 'contact_page'),
('contact.faq.included.answer', 'de', 'Im Preis enthalten sind: Professioneller Skipper, komplette Ausrüstung, Anleitung, Teilnehmermedaille und professionelle Fotos.', 'contact_page'),
('contact.faq.included.answer', 'fr', 'Le prix comprend: skipper professionnel, tout l''équipement, instruction, médaille de participant et photos professionnelles.', 'contact_page'),
('contact.faq.included.answer', 'it', 'Il prezzo include: skipper professionista, tutta l''attrezzatura, istruzioni, medaglia di partecipante e foto professionali.', 'contact_page'),
('contact.faq.included.answer', 'es', 'El precio incluye: patrón profesional, todo el equipo, instrucción, medalla de participante y fotos profesionales.', 'contact_page'),
('contact.faq.included.answer', 'pl', 'Cena obejmuje: profesjonalnego skippera, cały sprzęt, instruktaż, medal uczestnika i profesjonalne zdjęcia.', 'contact_page'),
('contact.faq.included.answer', 'he', 'המחיר כולל: סקיפר מקצועי, כל הציוד, הדרכה, מדליית משתתף, וצילומים מקצועיים.', 'contact_page'),
('contact.faq.included.answer', 'ru', 'В стоимость входит: профессиональный шкипер, всё оборудование, инструктаж, медаль участника и профессиональные фотографии.', 'contact_page')

ON CONFLICT (key, language_code) DO UPDATE SET
  text = EXCLUDED.text,
  category = EXCLUDED.category,
  updated_at = NOW();
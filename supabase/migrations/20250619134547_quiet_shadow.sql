/*
  # Multilingual System Setup

  1. New Tables
    - `translations`
      - `id` (uuid, primary key)
      - `key` (text, translation key)
      - `language_code` (text, language identifier)
      - `text` (text, translated content)
      - `category` (text, grouping translations)
      - `updated_at` (timestamp)
    
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `language_code` (text, user's preferred language)
      - `country_code` (text, user's country)
      - `auto_detected` (boolean, if language was auto-detected)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public read access for translations
    - Users can manage their own preferences
    - Service role can manage translations

  3. Functions
    - `get_user_language()` - Get user's language preference
    - `update_user_language()` - Update user's language preference

  4. Initial Data
    - Default translations for navigation, buttons, forms, and hero section
    - Support for 8 languages: en, de, fr, it, es, pl, he, ru
*/

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  language_code TEXT NOT NULL,
  text TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key, language_code)
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL DEFAULT 'en',
  country_code TEXT,
  auto_detected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for translations (public read access)
CREATE POLICY "Public read access for translations"
  ON translations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage translations"
  ON translations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policies for user preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Anonymous users can insert preferences (for guest language detection)
CREATE POLICY "Anonymous can insert preferences"
  ON user_preferences
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_translations_key_lang ON translations(key, language_code);
CREATE INDEX IF NOT EXISTS idx_translations_category ON translations(category);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Insert default translations for supported languages
INSERT INTO translations (key, language_code, text, category) VALUES
-- Navigation
('nav.home', 'en', 'Home', 'navigation'),
('nav.home', 'de', 'Startseite', 'navigation'),
('nav.home', 'fr', 'Accueil', 'navigation'),
('nav.home', 'it', 'Home', 'navigation'),
('nav.home', 'es', 'Inicio', 'navigation'),
('nav.home', 'pl', 'Strona główna', 'navigation'),
('nav.home', 'he', 'בית', 'navigation'),
('nav.home', 'ru', 'Главная', 'navigation'),

('nav.events', 'en', 'Events', 'navigation'),
('nav.events', 'de', 'Veranstaltungen', 'navigation'),
('nav.events', 'fr', 'Événements', 'navigation'),
('nav.events', 'it', 'Eventi', 'navigation'),
('nav.events', 'es', 'Eventos', 'navigation'),
('nav.events', 'pl', 'Wydarzenia', 'navigation'),
('nav.events', 'he', 'אירועים', 'navigation'),
('nav.events', 'ru', 'События', 'navigation'),

('nav.services', 'en', 'Services', 'navigation'),
('nav.services', 'de', 'Dienstleistungen', 'navigation'),
('nav.services', 'fr', 'Services', 'navigation'),
('nav.services', 'it', 'Servizi', 'navigation'),
('nav.services', 'es', 'Servicios', 'navigation'),
('nav.services', 'pl', 'Usługi', 'navigation'),
('nav.services', 'he', 'שירותים', 'navigation'),
('nav.services', 'ru', 'Услуги', 'navigation'),

('nav.contact', 'en', 'Contact', 'navigation'),
('nav.contact', 'de', 'Kontakt', 'navigation'),
('nav.contact', 'fr', 'Contact', 'navigation'),
('nav.contact', 'it', 'Contatto', 'navigation'),
('nav.contact', 'es', 'Contacto', 'navigation'),
('nav.contact', 'pl', 'Kontakt', 'navigation'),
('nav.contact', 'he', 'צור קשר', 'navigation'),
('nav.contact', 'ru', 'Контакт', 'navigation'),

('nav.book_now', 'en', 'Book Now', 'navigation'),
('nav.book_now', 'de', 'Jetzt buchen', 'navigation'),
('nav.book_now', 'fr', 'Réserver maintenant', 'navigation'),
('nav.book_now', 'it', 'Prenota ora', 'navigation'),
('nav.book_now', 'es', 'Reservar ahora', 'navigation'),
('nav.book_now', 'pl', 'Zarezerwuj teraz', 'navigation'),
('nav.book_now', 'he', 'הזמן עכשיו', 'navigation'),
('nav.book_now', 'ru', 'Забронировать', 'navigation'),

-- Common buttons and actions
('button.submit', 'en', 'Submit', 'buttons'),
('button.submit', 'de', 'Senden', 'buttons'),
('button.submit', 'fr', 'Soumettre', 'buttons'),
('button.submit', 'it', 'Invia', 'buttons'),
('button.submit', 'es', 'Enviar', 'buttons'),
('button.submit', 'pl', 'Wyślij', 'buttons'),
('button.submit', 'he', 'שלח', 'buttons'),
('button.submit', 'ru', 'Отправить', 'buttons'),

('button.cancel', 'en', 'Cancel', 'buttons'),
('button.cancel', 'de', 'Abbrechen', 'buttons'),
('button.cancel', 'fr', 'Annuler', 'buttons'),
('button.cancel', 'it', 'Annulla', 'buttons'),
('button.cancel', 'es', 'Cancelar', 'buttons'),
('button.cancel', 'pl', 'Anuluj', 'buttons'),
('button.cancel', 'he', 'בטל', 'buttons'),
('button.cancel', 'ru', 'Отмена', 'buttons'),

-- Form fields
('form.name', 'en', 'Name', 'forms'),
('form.name', 'de', 'Name', 'forms'),
('form.name', 'fr', 'Nom', 'forms'),
('form.name', 'it', 'Nome', 'forms'),
('form.name', 'es', 'Nombre', 'forms'),
('form.name', 'pl', 'Imię', 'forms'),
('form.name', 'he', 'שם', 'forms'),
('form.name', 'ru', 'Имя', 'forms'),

('form.email', 'en', 'Email', 'forms'),
('form.email', 'de', 'E-Mail', 'forms'),
('form.email', 'fr', 'E-mail', 'forms'),
('form.email', 'it', 'Email', 'forms'),
('form.email', 'es', 'Correo electrónico', 'forms'),
('form.email', 'pl', 'E-mail', 'forms'),
('form.email', 'he', 'אימייל', 'forms'),
('form.email', 'ru', 'Электронная почта', 'forms'),

('form.phone', 'en', 'Phone', 'forms'),
('form.phone', 'de', 'Telefon', 'forms'),
('form.phone', 'fr', 'Téléphone', 'forms'),
('form.phone', 'it', 'Telefono', 'forms'),
('form.phone', 'es', 'Teléfono', 'forms'),
('form.phone', 'pl', 'Telefon', 'forms'),
('form.phone', 'he', 'טלפון', 'forms'),
('form.phone', 'ru', 'Телефон', 'forms'),

('form.message', 'en', 'Message', 'forms'),
('form.message', 'de', 'Nachricht', 'forms'),
('form.message', 'fr', 'Message', 'forms'),
('form.message', 'it', 'Messaggio', 'forms'),
('form.message', 'es', 'Mensaje', 'forms'),
('form.message', 'pl', 'Wiadomość', 'forms'),
('form.message', 'he', 'הודעה', 'forms'),
('form.message', 'ru', 'Сообщение', 'forms'),

-- Hero section
('hero.title', 'en', 'Experience the Thrill of Yacht Racing', 'hero'),
('hero.title', 'de', 'Erleben Sie den Nervenkitzel des Yachtrennsports', 'hero'),
('hero.title', 'fr', 'Vivez le frisson de la course de yachts', 'hero'),
('hero.title', 'it', 'Vivi l''emozione delle regate veliche', 'hero'),
('hero.title', 'es', 'Experimenta la emoción de las regatas de yates', 'hero'),
('hero.title', 'pl', 'Przeżyj emocje wyścigów jachtowych', 'hero'),
('hero.title', 'he', 'חווה את הריגוש של מירוצי יאכטות', 'hero'),
('hero.title', 'ru', 'Почувствуйте азарт парусных гонок', 'hero'),

('hero.subtitle', 'en', 'Daily yacht racing on world-famous Lake Garda with professional skippers for an **unforgettable experience**.', 'hero'),
('hero.subtitle', 'de', 'Tägliche **Segelregatten** auf dem weltberühmten Gardasee mit professionellen Skippern für **unvergessliche Erlebnisse**.', 'hero'),
('hero.subtitle', 'fr', '**Régates quotidiennes** sur le célèbre lac de Garde avec des skippers professionnels pour des **souvenirs inoubliables**.', 'hero'),
('hero.subtitle', 'it', '**Regate giornaliere** sul celebre Lago di Garda con skipper professionisti per **ricordi indimenticabili**.', 'hero'),
('hero.subtitle', 'es', '**Regatas diarias** en el mundialmente famoso Lago de Garda con skippers profesionales para una **experiencia inolvidable**.', 'hero'),
('hero.subtitle', 'pl', 'Codzienne **regaty** na słynnym Jeziorze Garda z profesjonalnymi skiperami – **gwarancja niezapomnianych wrażeń**!', 'hero'),
('hero.subtitle', 'he', 'רגאטות יומיות באגם גארדה המפורסם עם סקיפרים מקצועיים **לחוויה בלתי נשכחת**.', 'hero'),
('hero.subtitle', 'ru', 'Ежедневные **парусные регаты** на всемирно известном озере Гарда с профессиональными шкиперами — **незабываемые впечатления**!', 'hero')

ON CONFLICT (key, language_code) DO NOTHING;

-- Create function to get user language preference
CREATE OR REPLACE FUNCTION get_user_language()
RETURNS TEXT AS $$
DECLARE
  user_lang TEXT;
BEGIN
  -- Try to get authenticated user's preference
  IF auth.uid() IS NOT NULL THEN
    SELECT language_code INTO user_lang
    FROM user_preferences
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    IF user_lang IS NOT NULL THEN
      RETURN user_lang;
    END IF;
  END IF;
  
  -- Default to English
  RETURN 'en';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user language preference
CREATE OR REPLACE FUNCTION update_user_language(
  p_language_code TEXT,
  p_country_code TEXT DEFAULT NULL,
  p_auto_detected BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO user_preferences (user_id, language_code, country_code, auto_detected)
    VALUES (auth.uid(), p_language_code, p_country_code, p_auto_detected)
    ON CONFLICT (user_id)
    DO UPDATE SET
      language_code = p_language_code,
      country_code = COALESCE(p_country_code, user_preferences.country_code),
      auto_detected = p_auto_detected,
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
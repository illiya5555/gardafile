/*
  # Translation Management Functions

  1. Purpose
     - Manages translations for multilingual support
     - Provides utilities for translation operations
     - Ensures consistent translation handling

  2. Features
     - Translation retrieval by language
     - Missing translation detection
     - Translation import/export
     - Translation statistics
*/

-- Create a function to get translations for a language
CREATE OR REPLACE FUNCTION get_translations(language_code TEXT)
RETURNS TABLE (
    key TEXT,
    text TEXT,
    category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.key,
        t.text,
        t.category
    FROM
        translations t
    WHERE
        t.language_code = language_code
    ORDER BY
        t.category,
        t.key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get missing translations
CREATE OR REPLACE FUNCTION get_missing_translations(target_language TEXT)
RETURNS TABLE (
    key TEXT,
    category TEXT,
    english_text TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        en.key,
        en.category,
        en.text AS english_text
    FROM
        translations en
    WHERE
        en.language_code = 'en' AND
        NOT EXISTS (
            SELECT 1
            FROM translations t
            WHERE t.language_code = target_language AND t.key = en.key
        )
    ORDER BY
        en.category,
        en.key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get translation statistics
CREATE OR REPLACE FUNCTION get_translation_statistics()
RETURNS TABLE (
    language_code TEXT,
    language_name TEXT,
    total_translations BIGINT,
    completion_percentage NUMERIC,
    categories_count BIGINT,
    last_updated TIMESTAMPTZ
) AS $$
DECLARE
    english_count BIGINT;
BEGIN
    -- Get total English translations as baseline
    SELECT COUNT(*) INTO english_count FROM translations WHERE language_code = 'en';
    
    RETURN QUERY
    SELECT
        t.language_code,
        CASE
            WHEN t.language_code = 'en' THEN 'English'
            WHEN t.language_code = 'de' THEN 'German'
            WHEN t.language_code = 'fr' THEN 'French'
            WHEN t.language_code = 'it' THEN 'Italian'
            WHEN t.language_code = 'es' THEN 'Spanish'
            WHEN t.language_code = 'ru' THEN 'Russian'
            WHEN t.language_code = 'pl' THEN 'Polish'
            WHEN t.language_code = 'he' THEN 'Hebrew'
            ELSE t.language_code
        END AS language_name,
        COUNT(*) AS total_translations,
        ROUND(100 * COUNT(*)::NUMERIC / NULLIF(english_count, 0), 2) AS completion_percentage,
        COUNT(DISTINCT t.category) AS categories_count,
        MAX(t.updated_at) AS last_updated
    FROM
        translations t
    GROUP BY
        t.language_code
    ORDER BY
        CASE WHEN t.language_code = 'en' THEN 0 ELSE 1 END,
        completion_percentage DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to import translations
CREATE OR REPLACE FUNCTION import_translations(
    import_data JSONB,
    language_code TEXT,
    overwrite BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    imported_count INT,
    updated_count INT,
    skipped_count INT,
    error_count INT,
    errors TEXT[]
) AS $$
DECLARE
    imported INT := 0;
    updated INT := 0;
    skipped INT := 0;
    errors INT := 0;
    error_list TEXT[] := ARRAY[]::TEXT[];
    translation_key TEXT;
    translation_text TEXT;
    translation_category TEXT;
    translation_record JSONB;
BEGIN
    -- Validate language code
    IF language_code IS NULL OR language_code = '' THEN
        error_list := array_append(error_list, 'Language code is required');
        errors := errors + 1;
        RETURN QUERY SELECT imported, updated, skipped, errors, error_list;
        RETURN;
    END IF;
    
    -- Process each translation
    FOR translation_record IN SELECT * FROM jsonb_array_elements(import_data)
    LOOP
        -- Extract values
        translation_key := translation_record->>'key';
        translation_text := translation_record->>'text';
        translation_category := COALESCE(translation_record->>'category', 'general');
        
        -- Validate required fields
        IF translation_key IS NULL OR translation_key = '' OR translation_text IS NULL OR translation_text = '' THEN
            error_list := array_append(error_list, format('Invalid translation: %s', translation_record::TEXT));
            errors := errors + 1;
            CONTINUE;
        END IF;
        
        -- Check if translation exists
        IF EXISTS (
            SELECT 1 FROM translations 
            WHERE key = translation_key AND language_code = import_translations.language_code
        ) THEN
            -- Update or skip based on overwrite flag
            IF overwrite THEN
                UPDATE translations
                SET 
                    text = translation_text,
                    category = translation_category,
                    updated_at = NOW()
                WHERE 
                    key = translation_key AND 
                    language_code = import_translations.language_code;
                
                updated := updated + 1;
            ELSE
                skipped := skipped + 1;
            END IF;
        ELSE
            -- Insert new translation
            INSERT INTO translations (key, language_code, text, category)
            VALUES (translation_key, language_code, translation_text, translation_category);
            
            imported := imported + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        error_list := array_append(error_list, format('Error processing translation %s: %s', translation_key, SQLERRM));
        errors := errors + 1;
    END LOOP;
    
    RETURN QUERY SELECT imported, updated, skipped, errors, error_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to export translations
CREATE OR REPLACE FUNCTION export_translations(
    language_code TEXT,
    category TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'key', key,
            'text', text,
            'category', category
        )
    )
    INTO result
    FROM translations
    WHERE 
        translations.language_code = export_translations.language_code AND
        (export_translations.category IS NULL OR translations.category = export_translations.category);
    
    RETURN COALESCE(result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user language preference
CREATE OR REPLACE FUNCTION get_user_language(user_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    user_lang TEXT;
BEGIN
    -- Try to get authenticated user's preference
    IF user_id IS NOT NULL THEN
        SELECT language_code INTO user_lang
        FROM user_preferences
        WHERE user_preferences.user_id = get_user_language.user_id
        LIMIT 1;
        
        IF user_lang IS NOT NULL THEN
            RETURN user_lang;
        END IF;
    END IF;
    
    -- Default to English
    RETURN 'en';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update user language preference
CREATE OR REPLACE FUNCTION update_user_language(
    language_code TEXT,
    country_code TEXT DEFAULT NULL,
    auto_detected BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN AS $$
DECLARE
    success BOOLEAN := TRUE;
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update or insert user preference
    INSERT INTO user_preferences (user_id, language_code, country_code, auto_detected)
    VALUES (auth.uid(), language_code, country_code, auto_detected)
    ON CONFLICT (user_id)
    DO UPDATE SET
        language_code = EXCLUDED.language_code,
        country_code = COALESCE(EXCLUDED.country_code, user_preferences.country_code),
        auto_detected = EXCLUDED.auto_detected,
        updated_at = NOW();
    
    RETURN success;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_translations(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_missing_translations(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_translation_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION import_translations(JSONB, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION export_translations(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_language(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_user_language(TEXT, TEXT, BOOLEAN) TO authenticated;

-- Return a message to confirm successful creation
SELECT 'Translation management functions created successfully' AS result;
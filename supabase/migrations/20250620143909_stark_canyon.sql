-- Add Russian translations for homepage content
INSERT INTO translations (key, language_code, text, category) VALUES
-- Features section
('home.features.item5.title', 'ru', 'Доступно и Премиально', 'home_page'),
('home.features.item5.description', 'ru', 'Опыт гонок высшего уровня доступен всем — опыт не требуется.', 'home_page'),

-- Location section
('home.location.title', 'ru', 'Привилегированное Расположение в Рива-дель-Гарда', 'home_page'),
('home.location.google_rating', 'ru', 'Рейтинг Google', 'home_page'),
('home.location.item1.title', 'ru', 'Легкий Доступ из Мюнхена', 'home_page'),
('home.location.item1.description', 'ru', 'Всего 4 часа езды из Мюнхена, что делает его идеальным для выходных и корпоративных мероприятий.', 'home_page'),
('home.location.item2.title', 'ru', 'Мировые Условия для Парусного Спорта', 'home_page'),
('home.location.item2.description', 'ru', 'Озеро Гарда предлагает стабильные ветры и потрясающие альпийские пейзажи, что делает его ведущим направлением для парусного спорта в Европе.', 'home_page'),
('home.location.item3.title', 'ru', 'Ежедневные Отправления', 'home_page'),
('home.location.item3.description', 'ru', 'Несколько временных интервалов доступны ежедневно с марта по октябрь, с гибкими опциями бронирования.', 'home_page'),

-- Partners section
('home.partners.title', 'ru', 'Наши Надежные Партнеры', 'home_page'),
('home.partners.subtitle', 'ru', 'Мы работаем с ведущими мировыми производителями яхт и морского оборудования, чтобы обеспечить вам наилучший опыт парусного спорта.', 'home_page'),
('home.partners.cta_text', 'ru', 'Заинтересованы в партнерстве с нами? Мы всегда ищем качественные бренды, которые разделяют нашу страсть к парусному спорту.', 'home_page'),
('home.partners.cta', 'ru', 'Свяжитесь с нами о Партнерстве', 'home_page'),

-- Partners names and descriptions
('home.partners.bavaria_yachts.name', 'ru', 'Bavaria Yachts', 'home_page'),
('home.partners.bavaria_yachts.description', 'ru', 'Премиум-производитель яхт', 'home_page'),
('home.partners.garmin_marine.name', 'ru', 'Garmin Marine', 'home_page'),
('home.partners.garmin_marine.description', 'ru', 'Навигационные технологии', 'home_page'),
('home.partners.helly_hansen.name', 'ru', 'Helly Hansen', 'home_page'),
('home.partners.helly_hansen.description', 'ru', 'Профессиональное парусное снаряжение', 'home_page'),
('home.partners.musto_sailing.name', 'ru', 'Musto Sailing', 'home_page'),
('home.partners.musto_sailing.description', 'ru', 'Техническая парусная одежда', 'home_page'),
('home.partners.raymarine.name', 'ru', 'Raymarine', 'home_page'),
('home.partners.raymarine.description', 'ru', 'Морская электроника', 'home_page'),
('home.partners.spinlock.name', 'ru', 'Spinlock', 'home_page'),
('home.partners.spinlock.description', 'ru', 'Оборудование безопасности', 'home_page'),

-- Final CTA section
('home.final_cta.title', 'ru', 'Готовы к Вашему Парусному Приключению?', 'home_page'),
('home.final_cta.subtitle', 'ru', 'Присоединяйтесь к нам для незабываемого дня яхтенных гонок на озере Гарда. Опыт не нужен - просто принесите чувство приключения!', 'home_page'),
('home.final_cta.cta', 'ru', 'Забронировать - €195', 'home_page')

ON CONFLICT (key, language_code) DO NOTHING;
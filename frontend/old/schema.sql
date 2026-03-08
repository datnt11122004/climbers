-- PostgreSQL Database Schema for Climbers App Tracking System

-- 1. App Categories
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'game_action', 'tools'
    name VARCHAR(100) NOT NULL,
    lucide_icon VARCHAR(50) DEFAULT 'layers',
    theme_color VARCHAR(50) DEFAULT 'brand-500',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Monitored Stores (For Store Monitoring Feed)
CREATE TABLE public.stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'google_play', 'app_store', 'appvn'
    url VARCHAR(255),
    developer_url_pattern VARCHAR(255), -- Pattern to crawl apps from a developer
    theme_color VARCHAR(50) DEFAULT 'blue-500',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Core Apps Information
CREATE TABLE public.apps (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES public.stores(id),
    category_id INTEGER REFERENCES public.categories(id),
    app_store_id VARCHAR(100) NOT NULL, -- e.g., 'com.kiloo.subwaysurf' or '123456789' for iOS
    title VARCHAR(255) NOT NULL,
    developer_name VARCHAR(255),
    icon_url TEXT,
    store_url TEXT,
    first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When we first saw this app
    latest_update_date TIMESTAMP WITH TIME ZONE, -- Date updated on the actual store
    is_tracking_metrics BOOLEAN DEFAULT false, -- If true, we run daily metric tracking
    is_bookmarked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_store_app_id UNIQUE (store_id, app_store_id)
);

-- 4. Daily App Metrics (The core of D-2, D-1, D0 tracking)
-- We insert a new row here for each tracked app every single day (Cronjob at Midnight)
CREATE TABLE public.app_daily_metrics (
    id BIGSERIAL PRIMARY KEY,
    app_id INTEGER REFERENCES public.apps(id) ON DELETE CASCADE,
    record_date DATE NOT NULL, -- For D0, D-1 logic
    
    -- Google Play specific
    min_installs BIGINT, 
    max_installs BIGINT,
    
    -- Common metrics
    rating_score NUMERIC(3, 2), -- e.g., 4.50
    total_ratings BIGINT, -- On iOS, we use this to estimate growth
    total_reviews BIGINT,
    ranking_position INTEGER, -- Optional: if keeping track of Top Charts
    
    -- Derived metrics (Calculated based on yesterday's data)
    estimated_daily_installs BIGINT DEFAULT 0, 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_app_date UNIQUE (app_id, record_date)
);

-- 5. Trigger Events / Notifications Log
CREATE TABLE public.notification_logs (
    id BIGSERIAL PRIMARY KEY,
    app_id INTEGER REFERENCES public.apps(id) ON DELETE CASCADE,
    trigger_rule VARCHAR(10) NOT NULL, -- 'NT1', 'NT2', 'NEW_APP'
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
    sent_to_ua BOOLEAN DEFAULT false,
    sent_to_monetize BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_app_metrics_app_date ON public.app_daily_metrics(app_id, record_date);
CREATE INDEX idx_apps_category ON public.apps(category_id);
CREATE INDEX idx_apps_store ON public.apps(store_id);
CREATE INDEX idx_notifications_created ON public.notification_logs(created_at DESC);

# Global Signal - Database Schema Design (PostgreSQL / Supabase)

This document defines the relational database schema required to back the Global Signal application. It is designed to be easily implemented in PostgreSQL (e.g., using Supabase) and optimized for high-performance map rendering, vector/full-text search, and alert feed generation.

---

## 1. `events`
Stores the core intelligence anomalies/signals.

*   **Fields:**
    *   `id` (UUID, Primary Key, Default: gen_random_uuid())
    *   `title` (VARCHAR(255), Not Null)
    *   `summary` (TEXT, Not Null)
    *   `category` (VARCHAR(100), Not Null) - e.g., 'Geopolitics', 'Technology & Infrastructure'
    *   `event_type` (VARCHAR(100), Not Null) - e.g., 'Regulatory action', 'Supply chain disruption'
    *   `materiality_score` (INTEGER, Not Null) - 0 to 100
    *   `timestamp` (TIMESTAMPTZ, Not Null, Default: NOW())
    *   `created_at` (TIMESTAMPTZ, Not Null, Default: NOW())
*   **Indexes:**
    *   `idx_events_timestamp` ON `timestamp` DESC (Optimizes feed generation)
    *   `idx_events_category` ON `category`
    *   `idx_events_materiality` ON `materiality_score` DESC
    *   `idx_events_fts` (GIN index on `to_tsvector('english', title || ' ' || summary)`)
*   **Query Patterns:** Map clustering by time/category, feed generation, full-text search.

---

## 2. `locations`
Stores normalized geographic and administrative locations.

*   **Fields:**
    *   `id` (UUID, Primary Key)
    *   `name` (VARCHAR(255), Not Null)
    *   `country_code` (VARCHAR(2))
    *   `lat` (FLOAT, Not Null)
    *   `lng` (FLOAT, Not Null)
    *   `geom` (GEOMETRY(Point, 4326)) - PostGIS spatial column
*   **Indexes:**
    *   `idx_locations_geom` (GIST index on `geom`)
    *   `idx_locations_name` (B-TREE on `name`)
*   **Query Patterns:** Spatial bounding box queries for the map canvas, resolving location queries.

---

## 3. `entities`
Stores corporations, individuals, and sovereign entities.

*   **Fields:**
    *   `id` (UUID, Primary Key)
    *   `name` (VARCHAR(255), Not Null)
    *   `entity_type` (VARCHAR(50), Not Null) - e.g., 'Company', 'Person', 'Government', 'Commodity'
    *   `ticker` (VARCHAR(20))
    *   `industry` (VARCHAR(100))
*   **Indexes:**
    *   `idx_entities_name_trgm` (GIN index using `pg_trgm` for partial matching/search)
    *   `idx_entities_type` ON `entity_type`
*   **Query Patterns:** Entity lookup, autocomplete, finding events by entity.

---

## 4. `event_locations` (Many-to-Many)
Links events to locations. Specifies if a location is the 'origin' or 'impact' destination.

*   **Fields:**
    *   `event_id` (UUID, Foreign Key -> `events.id`, On Delete Cascade)
    *   `location_id` (UUID, Foreign Key -> `locations.id`, On Delete Cascade)
    *   `role` (VARCHAR(50), Not Null) - 'Origin' or 'Impact'
*   **Primary Key:** `(event_id, location_id, role)`
*   **Indexes:**
    *   `idx_evtloc_event` ON `event_id`
    *   `idx_evtloc_location` ON `location_id`
*   **Query Patterns:** Fetching the origin of an event for mapping, fetching all impacted regions.

---

## 5. `event_entities` (Many-to-Many)
Links events to entities. Specifies if an entity is directly involved or secondarily impacted.

*   **Fields:**
    *   `event_id` (UUID, Foreign Key -> `events.id`, On Delete Cascade)
    *   `entity_id` (UUID, Foreign Key -> `entities.id`, On Delete Cascade)
    *   `role` (VARCHAR(50), Not Null) - 'Primary' or 'Secondary'
*   **Primary Key:** `(event_id, entity_id)`
*   **Indexes:**
    *   `idx_evtent_event` ON `event_id`
    *   `idx_evtent_entity` ON `entity_id`
*   **Query Patterns:** Watchlist entity matching, knowledge graph edge generation.

---

## 6. `event_impacts`
Stores the qualitative analytical assessments of an event's ripple effects.

*   **Fields:**
    *   `id` (UUID, Primary Key)
    *   `event_id` (UUID, Foreign Key -> `events.id`, On Delete Cascade)
    *   `target` (VARCHAR(255), Not Null) - The sector, demographic, or theme impacted.
    *   `impact_type` (VARCHAR(50), Not Null) - 'Direct impact', 'Likely impact', 'Thematic relevance'
    *   `explanation` (TEXT, Not Null)
*   **Indexes:**
    *   `idx_impacts_event` ON `event_id`
*   **Query Patterns:** Loaded alongside event details drawer, searched during thematic/keyword search.

---

## 7. `source_articles`
Stores the original news pieces, regulatory filings, or telemetry data that triggered the event.

*   **Fields:**
    *   `id` (UUID, Primary Key)
    *   `event_id` (UUID, Foreign Key -> `events.id`, On Delete Cascade)
    *   `title` (VARCHAR(512), Not Null)
    *   `url` (TEXT, Not Null)
    *   `publisher` (VARCHAR(150), Not Null)
    *   `published_at` (TIMESTAMPTZ, Not Null)
    *   `credibility_score` (INTEGER)
*   **Indexes:**
    *   `idx_sources_event` ON `event_id`
*   **Query Patterns:** Loaded when viewing event details to display citations.

---

## 8. `user_preferences`
Stores generic app settings for a user.

*   **Fields:**
    *   `user_id` (UUID, Primary Key) - Matches Auth provider user ID
    *   `theme` (VARCHAR(20), Default: 'dark')
    *   `default_map_view` (JSONB) - Stores default lat, lng, zoom
    *   `created_at` (TIMESTAMPTZ, Default: NOW())
    *   `updated_at` (TIMESTAMPTZ, Default: NOW())
*   **Query Patterns:** Loaded once on auth.

---

## 9. `user_watchlists`
Stores the explicit calibration entities/themes a user follows.

*   **Fields:**
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Foreign Key -> `user_preferences.user_id`, On Delete Cascade)
    *   `keyword` (VARCHAR(255), Not Null) - e.g., 'TSMC' or 'Semiconductors'
    *   `keyword_type` (VARCHAR(50), Not Null) - 'company', 'country', 'theme', 'sector', etc.
    *   `linked_entity_id` (UUID, Optional, Foreign Key -> `entities.id`) - To hard-link a keyword to an entity, avoiding pure string matches.
    *   `created_at` (TIMESTAMPTZ, Default: NOW())
*   **Indexes:**
    *   `idx_watchlist_user` ON `user_id`
*   **Query Patterns:** Loaded to compute the `watchlistRelevance` score of the incoming events stream.

---

## 10. `alerts`
Stores the pre-calculated or historical notifications generated for a specific user based on their watchlist.

*   **Fields:**
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Foreign Key -> `user_preferences.user_id`, On Delete Cascade)
    *   `event_id` (UUID, Foreign Key -> `events.id`, On Delete Cascade)
    *   `match_reason` (TEXT, Not Null)
    *   `relevance_score` (INTEGER, Not Null)
    *   `is_read` (BOOLEAN, Default: false)
    *   `created_at` (TIMESTAMPTZ, Default: NOW())
*   **Indexes:**
    *   `idx_alerts_user_unread` ON (`user_id`, `is_read`)
    *   `idx_alerts_event` ON `event_id`
*   **Query Patterns:** Used to populate the "Your Alerts" feed without computing matches on the fly, fetching unread counts.

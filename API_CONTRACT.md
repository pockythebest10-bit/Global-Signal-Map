# Global Signal - API Contract

This document defines the backend REST API contract for the Global Signal application. All endpoints are prefixed with `/api/v1`.

## Common Error Handling
All endpoints follow a unified error response structure appropriately using HTTP status codes.
**Schema:**
```json
{
  "error": {
    "code": "BAD_REQUEST | UNAUTHORIZED | NOT_FOUND | INTERNAL_ERROR",
    "message": "Human readable error description",
    "details": {} // Optional validation or context details
  }
}
```

---

## 1. Get Map Events
**Route:** `GET /events/map`
**Purpose:** Fetch lightweight event data tailored for rendering pins and heatmaps on the global map canvas.
**Request Params (Query):**
* `timeframe` (optional, string): Filter by time range (e.g., `24h`, `7d`, `30d`). Default: `7d`.
* `bbox` (optional, string): Bounding box `minLng,minLat,maxLng,maxLat` to restrict results.
* `category` (optional, string): Filter by event category.

**Response Schema:**
```typescript
interface MapEventsResponse {
  events: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    category: string;
    materialityScore: number;
  }>;
}
```

**Example Response:**
```json
{
  "events": [
    {
      "id": "evt-123",
      "lat": 35.6762,
      "lng": 139.6503,
      "title": "Unplanned outage at regional fabrication hub",
      "category": "Technology & Infrastructure",
      "materialityScore": 88
    }
  ]
}
```

---

## 2. Get Event by ID
**Route:** `GET /events/:id`
**Purpose:** Fetch the comprehensive data model for a specific signal event (used for the Event Details Drawer).
**Request Params:**
* `id` (path parameter): The unique identifier of the event.

**Response Schema:** `SignalEvent` (matching the front-end core data model).

**Example Response:**
```json
{
  "id": "evt-123",
  "title": "Unplanned outage at regional fabrication hub",
  "summary": "A major power disruption has halted production...",
  "category": "Technology & Infrastructure",
  "originLocation": { "lat": 35.6762, "lng": 139.6503, "name": "Tokyo, Japan" },
  "impacts": [],
  "primaryEntities": [],
  "timestamp": "2023-10-24T05:00:00.000Z"
}
```

---

## 3. Search Entities/Events
**Route:** `GET /search`
**Purpose:** Unified search returning events, entities, or thematic matches based on user queries.
**Request Params (Query):**
* `q` (required, string): The search query.
* `limit` (optional, number): Max results per category. Default: 5.

**Response Schema:**
```typescript
interface SearchResponse {
  groups: Array<{
    type: 'Direct Exposure' | 'Likely Impact' | 'Thematic Relevance';
    items: Array<{
      eventId: string;
      title: string;
      category: string;
      matchReason: string;
    }>;
  }>;
}
```

**Example Response:**
```json
{
  "groups": [
    {
      "type": "Direct Exposure",
      "items": [
        {
          "eventId": "evt-456",
          "title": "TSMC revises Q3 output forecast",
          "category": "Corporate Actions",
          "matchReason": "Direct match on core entity: TSMC"
        }
      ]
    }
  ]
}
```

---

## 4. Get Alerts Feed
**Route:** `GET /alerts/feed`
**Purpose:** Fetch the personalized, ranked feed of signal events for the left sidebar.
**Request Params (Query):**
* `page` (optional, number): Pagination offset.
* `limit` (optional, number): default 20.
* `filter` (optional, string): Top navigation filter (e.g., 'Markets').

**Response Schema:**
```typescript
interface AlertsFeedResponse {
  feed: Array<SignalEvent & {
    computedRelevanceScore: number;
    matchReasons: string[];
  }>;
  hasMore: boolean;
}
```

**Example Response:**
```json
{
  "feed": [
    {
      "id": "evt-123",
      "title": "Silicon exports restricted",
      "computedRelevanceScore": 85,
      "matchReasons": ["Matched because you follow semiconductors"]
      // ... rest of SignalEvent data
    }
  ],
  "hasMore": false
}
```

---

## 5. Follow/Unfollow Watchlist Items
**Route(s):** 
* `POST /user/watchlist` (Follow)
* `DELETE /user/watchlist/:id` (Unfollow)

**Purpose:** Manage the user's customized tracking list. (User identity inferred from auth token).
**Request Params:**
* **POST Body:** `{ "keyword": "Taiwan", "type": "country" }`
* **DELETE Auth:** `id` in path segment.

**Response Schema:**
```typescript
interface WatchlistResponse {
  watchlist: Array<{
    id: string;
    keyword: string;
    type: string;
    addedAt: string;
  }>;
}
```

**Example Response (POST):**
```json
{
  "watchlist": [
    {
      "id": "wl-832",
      "keyword": "Taiwan",
      "type": "country",
      "addedAt": "2023-10-24T12:00:00.000Z"
    }
  ]
}
```

---

## 6. Get Related Events
**Route:** `GET /events/:id/related`
**Purpose:** Fetch historical or concurrent events that share thematic, entity, or geographic overlap with a target event.
**Request Params:** 
* `id` (path parameter)
* `limit` (optional, number): Default 3.

**Response Schema:**
```typescript
interface RelatedEventsResponse {
  related: Array<{
    eventId: string;
    title: string;
    category: string;
    timestamp: string;
    relationType: 'Temporal' | 'Temporal & Entity' | 'Geographic';
  }>;
}
```

**Example Response:**
```json
{
  "related": [
    {
      "eventId": "evt-999",
      "title": "Early warning indicators triggered surrounding Taipei",
      "category": "Technology & Infrastructure",
      "timestamp": "2023-10-22T00:00:00.000Z",
      "relationType": "Geographic"
    }
  ]
}
```

---

## 7. Get Event Impacts
**Route:** `GET /events/:id/impacts`
**Purpose:** Fetch the cascading supply chain, market, or political impact network stemming from a specific event. Used for graphing/diagramming.
**Request Params:**
* `id` (path parameter)

**Response Schema:**
```typescript
interface EventImpactsResponse {
  nodes: Array<{ id: string; label: string; group: 'Entity' | 'Location' | 'Sector' }>;
  edges: Array<{ source: string; target: string; type: 'Direct' | 'Likely' | 'Thematic'; description?: string }>;
}
```

**Example Response:**
```json
{
  "nodes": [
    { "id": "n1", "label": "Tokyo Port", "group": "Location" },
    { "id": "n2", "label": "Automotive Sector", "group": "Sector" }
  ],
  "edges": [
    { "source": "n1", "target": "n2", "type": "Likely", "description": "Delayed shipments affecting JIT manufacturing" }
  ]
}
```

---

## 8. Get Trending Signals
**Route:** `GET /events/trending`
**Purpose:** Fetch currently trending entities or topics experiencing a high volume of signal anomalies.
**Request Params (Query):**
* `timeframe` (optional, string): e.g., `24h`.

**Response Schema:**
```typescript
interface TrendingSignalsResponse {
  trending: Array<{
    keyword: string;
    type: 'Company' | 'Location' | 'Theme';
    velocityScore: number;
    relatedEventIds: string[];
  }>;
}
```

**Example Response:**
```json
{
  "trending": [
    {
      "keyword": "Strait of Hormuz",
      "type": "Location",
      "velocityScore": 95,
      "relatedEventIds": ["evt-111", "evt-112"]
    }
  ]
}
```

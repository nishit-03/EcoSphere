# EcoSphere REST API — Feed System

## Base URL
```
https://api.ecosphere.app/v1
```

---

## Endpoints

### GET `/feed`
Paginated, ranked feed of AI-verified posts.

**Query Params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number |
| `limit` | int | 10 | Posts per page (max 50) |
| `community_id` | uuid | null | Filter by community |

**Ranking Formula:**
```
score = (co2_saved * 10) × 0.4
      + (likes + comments × 2) × 0.35
      + (1 / (hours_since_post + 1)) × 100 × 0.25
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user": { "id": "uuid", "name": "string", "avatar": "url", "trust_score": 98 },
      "community": { "id": "uuid", "name": "string" },
      "action_type": "cycling",
      "action_label": "Bike Commute",
      "before_image": "url",
      "after_image": "url | null",
      "co2_saved": 2.4,
      "calories_burned": 240,
      "distance_km": 10.2,
      "ai_verification": { "status": "verified", "confidence": 0.92 },
      "ai_caption": "string",
      "caption": "string",
      "likes_count": 89,
      "comments_count": 12,
      "is_liked": true,
      "created_at": "ISO 8601"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 142, "has_more": true }
}
```

---

### GET `/posts/:id`
Single post with full details.

---

### POST `/posts`
Create a new post. Triggers AI verification pipeline.

**Body (multipart/form-data):**
```json
{
  "action_type": "cleanup",
  "before_image": "<file>",
  "after_image": "<file | null>",
  "caption": "string",
  "route_data": { "coordinates": [] }
}
```

**Response:** `201 Created` with post object (`ai_verification_status: "pending"`)

---

### POST `/posts/:id/like`
Toggle like (idempotent). Returns updated count.

**Response:**
```json
{ "liked": true, "likes_count": 125 }
```

---

### POST `/posts/:id/comment`
Add comment. Runs AI moderation check.

**Body:**
```json
{ "content": "string" }
```

**Response:** `201 Created` with comment object

---

## Feed Logic

1. **Only verified** — `WHERE ai_verification_status = 'verified'`
2. **Ranked** — by composite score (impact × 0.4 + engagement × 0.35 + recency × 0.25)
3. **Paginated** — cursor-based for infinite scroll
4. **Cached** — materialized view refreshed every 5 minutes
5. **Pull-to-refresh** — bypasses cache, queries live data

## Key Indexes
```sql
idx_posts_feed_rank     (ai_verification_status, created_at DESC, likes_count DESC)
idx_posts_user          (user_id)
idx_posts_community     (community_id)
idx_likes_post_user     (post_id, user_id) UNIQUE
```

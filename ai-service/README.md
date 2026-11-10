# Hybrid product recommendation service

FastAPI recommendation service that combines multilingual E5 semantic similarity with the existing TF-IDF content recommender:

```text
Hybrid = 0.70 × normalized E5 cosine similarity
       + 0.30 × normalized TF-IDF cosine similarity
```

The two component scores are min-max normalized across eligible products before combining. Set `E5_WEIGHT` and `TFIDF_WEIGHT` to change the weights; the service normalizes them to sum to 1. Both cannot be zero.

## Windows 11 setup

Use Python 3.11 (64-bit), which is supported by the pinned scientific and Sentence Transformers packages. On an 8 GB PC, close other memory-heavy applications during the first model download and cache build. The service runs inference on CPU with two threads by default.

```powershell
cd ai-service
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` and set `DATABASE_URL` to the same MySQL URL used by the Express backend. The production default is `AI_DATA_SOURCE=mysql`. The service reads current available, in-stock products from MySQL and never substitutes sample products when MySQL is unavailable. Keep `.env` private.

The pretrained `intfloat/multilingual-e5-small` model downloads from Hugging Face on first use and is kept in the Sentence Transformers cache. Product passage embeddings are cached in memory and reused while product IDs and descriptive text remain unchanged. Restarting the service clears this in-memory cache.

Start the API:

```powershell
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

The Express backend should have `AI_SERVICE_URL=http://localhost:8000`. The product page sends text searches through Express to this service for hybrid E5 + TF-IDF ranking; the backend then reloads the ranked products from MySQL before returning prices or other product data. AI search accepts `query`, category/factory filters, and optional price bounds. Search needs the AI service running and configured to use the same MySQL database as Express. `GET /api/recommendations` remains compatible with the frontend and continues to use customer search history.

## Development with the CSV

The supplied file is `data/kombolcha_factories_products_500.csv`. Its actual columns are:

`product_id`, `factory_name`, `location`, `category_name`, `product_name`, `description`, `price_etb`, `currency`, `unit`, `color`, `size_or_specification`, `material`, `stock_quantity`, `availability`, `average_rating`, `tags`, `target_market`, `data_source_note`.

The CSV uses `KMB-...` string SKUs and explicitly describes variant-level price and stock as modeled estimates. Set `AI_DATA_SOURCE=csv` only for local development and tests. CSV IDs are returned in the additive `product_keys` response field; the existing integer `product_ids` field remains reserved for production MySQL IDs. Do not use CSV prices or stock as customer-facing catalog data.

## API

`POST /recommend` keeps the existing required `buyer_id` and `search_history` fields. `keyword` and `category` entries are encoded with the E5 `query:` prefix; product descriptions use the `passage:` prefix. Optional filters and result count are:

```json
{
  "buyer_id": 12,
  "search_history": [{"keyword": "cotton bedding", "category": "Home Textiles"}],
  "category_filter": 4,
  "factory_filter": 2,
  "top_n": 8
}
```

`category_filter` and `factory_filter` accept database IDs or exact names. `top_n` is 1–100 and defaults to `RECOMMENDATION_TOP_N` (8). The existing response fields `buyer_id`, `product_ids`, `category`, and `message` remain; `product_keys` is added for CSV development results. `GET /health` reports service liveness; `/retrain` refreshes products and embeddings.

The Express route also accepts `category_id`, `factory_id`, and `top_n` query parameters, for example `GET /api/recommendations?category_id=4&factory_id=2&top_n=12`. Its existing no-parameter request continues to work.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `AI_DATA_SOURCE` | `mysql` | Production source; use `csv` for development only |
| `DATABASE_URL` | — | MySQL connection URL shared with Express |
| `PRODUCTS_CSV_PATH` | bundled CSV | Optional local CSV path |
| `E5_WEIGHT` | `0.70` | E5 component weight |
| `TFIDF_WEIGHT` | `0.30` | Existing TF-IDF component weight |
| `RECOMMENDATION_TOP_N` | `8` | Default result count |
| `E5_CPU_THREADS` | `2` | Torch CPU thread count |
| `PORT` | `8000` | API port |
| `LOG_LEVEL` | `INFO` | Python log level |

## Tests

Tests use the bundled CSV and a deterministic fake encoder, so they do not need a Hugging Face download or a running MySQL instance. Run them with:

```powershell
python -m pip install -r requirements-dev.txt
python -m pytest
```

The same test suite also runs with Python's standard library runner:

```powershell
python -m unittest discover -s tests -v
```

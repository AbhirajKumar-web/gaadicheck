# GadiCheck 🚗🛡️

**Trust intelligence for used-car marketplaces.**

GadiCheck is a Bright Data Scraper Studio-focused hackathon project that turns messy used-car listings into normalized data and an explainable scam/risk signal.

## The idea

Used-car marketplaces are noisy: prices can be misleading, descriptions can contain pressure language, listings can be incomplete, and scraper selectors can break when a site changes.

GadiCheck is designed as a **self-healing pipeline**:

```text
Marketplace URL → Bright Data Scraper Studio → Normalize → Validate → Risk analysis
                                             ↓
                                    schema drift detected?
                                             ↓ yes
                                      repair / re-run
                                             ↓
                                      Trust dashboard
```

## Extracted fields

- Listing title
- Price
- Year
- Kilometers driven
- Fuel type
- Location
- Seller type
- Posted date
- Description
- Photo count
- Listing URL

## What makes it different

Instead of stopping at “scrape this page”, GadiCheck treats scraping as a reliability problem. The normalized contract stays stable even when marketplace HTML changes. A production Bright Data integration can feed the same contract into validation, drift detection, repair, and the dashboard.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

The included deterministic demo dataset means judges can explore the complete dashboard without credentials.

## Bright Data integration boundary

`POST /api/scrape` is the integration boundary. Connect your Bright Data Scraper Studio dataset/API there and map the returned records to the listing schema above. Keep credentials in environment variables and never commit them.

## Judge demo flow

1. Paste a marketplace category URL.
2. Click **Scrape & Analyze**.
3. Show normalized records instead of raw HTML.
4. Point out the explainable risk score and reasons.
5. Explain that schema validation catches missing/changed fields.
6. Explain that the repair loop re-runs extraction instead of silently returning bad data.

## Roadmap

- Bright Data dataset job polling + webhook ingestion
- Persistent run history
- Field-level schema drift detector
- Automatic scraper repair suggestions
- Before/after extraction diff
- Confidence score per extracted field
- CSV/JSON export
- Multi-marketplace comparison

## Hackathon

Built for **Into the Scrape-Verse**, organized by WeMakeDevs with Bright Data. The project focuses on the self-healing scraper theme while solving a concrete consumer-trust problem.

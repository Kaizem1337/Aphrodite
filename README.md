# Market Clock

Market Clock is a responsive Next.js dashboard for checking global equity-market operating hours in a selected IANA timezone. It shows live market cards, countdowns, a 24-hour overlap timeline, preference persistence, session overrides, and a copyable schedule summary.

## Features

- Default watchlist: NYSE, LSE, Frankfurt/Xetra, KRX, HKEX, and TWSE.
- Add, remove, reorder, search, and favourite markets from a predefined global exchange catalogue.
- Switch display timezone with DST handled by Luxon and IANA timezone names.
- Toggle extended hours, regular-only mode, and compact cards.
- Edit existing sessions or add custom sessions per market.
- Static holiday support for MVP exchanges where included.
- Preferences stored in `localStorage` with corrupted-data fallback.
- Docker production deployment on port `3000`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Docker Deployment

```bash
docker compose up --build
```

The container builds the production Next.js app and exposes port `3000`. A healthcheck is available at `/api/health`.

## Testing

```bash
npm run lint
npm run test
npm run build
```

## Adding A Market

Add a new `Exchange` entry in `src/data/exchanges.ts`. Use local exchange session times and an IANA timezone such as `Europe/London` or `America/New_York`. Avoid fixed UTC offsets.

## Customising Sessions

Open Settings, choose a selected market in Session editor, then adjust session names, times, and types. Overrides are saved in `localStorage`.

## Timezone And DST Notes

All calculations use Luxon with IANA timezone names. Session definitions remain in local exchange time and are converted into the selected display timezone for cards, countdowns, copy output, and timeline blocks.

## Known Limitations

- Holiday data is static in the MVP.
- Some predefined exchange hours should be verified against official exchange calendars before production trading use.
- Auction sessions may vary by exchange.
- Half-days and special trading sessions need a proper calendar API integration.

## Future Improvements

- Official exchange holiday/calendar feeds.
- Half-day and make-up trading day support.
- Broker-specific extended-hours availability.
- Import/export of watchlists and session overrides.

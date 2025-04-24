# stile-markr-challenge

## Assumptions
If the total marks available on results for a particular test differs (perhaps due to scanning errors), picking the most common value should be the correct one.

The variance in the aggregate payload should be computed on the percentage as a number between 0 and 100, not 0 and 1.

We don't need to do any rounding.

## Running the entire stack

```bash
docker compose up
```

## Running for development

```bash
docker compose up postgres
```

Then

```bash
cd app
npm run dev
```


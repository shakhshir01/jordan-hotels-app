const start = Number(process.env.START || 293960);
const end = Number(process.env.END || 294020);

const inJordan = (lat, lon) => lat >= 29 && lat <= 34.5 && lon >= 34 && lon <= 40;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const main = async () => {
  const hits = [];

  for (let id = start; id <= end; id++) {
    const locationKey = `g${id}`;
    const url = `https://data.xotelo.com/api/list?location_key=${locationKey}&limit=1&offset=0&sort=best_value`;

    try {
      const json = await fetchJson(url);
      const first = json?.error ? null : json?.result?.list?.[0];
      if (!first) {
        await sleep(120);
        continue;
      }

      const lat = Number(first?.geo?.latitude);
      const lon = Number(first?.geo?.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lon) && inJordan(lat, lon)) {
        hits.push({
          location_key: locationKey,
          total_count: Number(json?.result?.total_count || 0),
          example_name: String(first?.name || ""),
          lat,
          lon,
          example_url: String(first?.url || ""),
        });
        console.log(
          `HIT ${locationKey} total=${json.result.total_count} example=${first.name} @ ${lat},${lon}`
        );
      }
    } catch {
      // ignore
    }

    await sleep(120);
  }

  console.log(`DONE hits=${hits.length}`);
  console.log(JSON.stringify(hits, null, 2));
};

main();

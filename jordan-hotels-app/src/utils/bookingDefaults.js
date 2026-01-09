export function toISODate(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export function daysBetween(checkInIso, checkOutIso) {
  try {
    const a = new Date(checkInIso);
    const b = new Date(checkOutIso);
    const diff = Math.ceil((b - a) / (24 * 60 * 60 * 1000));
    return diff > 0 ? diff : 0;
  } catch {
    return 0;
  }
}

export function getDefaultBookingData({ checkInDate, checkOutDate, guests = 2 } = {}) {
  const today = new Date();
  const start = checkInDate ? new Date(checkInDate) : today;
  // normalize to yyyy-mm-dd
  const inIso = toISODate(start);

  let out;
  if (checkOutDate) out = new Date(checkOutDate);
  else {
    out = new Date(start);
    out.setDate(out.getDate() + 1);
  }
  const outIso = toISODate(out);

  const nights = daysBetween(inIso, outIso) || 1;

  return {
    checkInDate: inIso,
    checkOutDate: outIso,
    nights,
    guests: Number.isFinite(Number(guests)) ? Number(guests) : 2,
  };
}

export default getDefaultBookingData;

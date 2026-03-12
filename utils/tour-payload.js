const toTrimmedString = (value) => String(value ?? "").trim();

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split("\n");
  return [];
};

const normalizeStringArray = (value) =>
  toArray(value)
    .map((item) => toTrimmedString(item))
    .filter(Boolean);

const normalizeDateValue = (value) => {
  const raw = toTrimmedString(value);
  if (!raw) return "";

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toISOString();
};

const normalizeDayWise = (value) =>
  toArray(value)
    .map((item, index) => ({
      day: Number(item?.day) || index + 1,
      description: toTrimmedString(item?.description),
    }))
    .filter((item) => item.description);

const normalizeVehicles = (vehicles = []) =>
  toArray(vehicles)
    .map((vehicle) => ({
      ...vehicle,
      name: toTrimmedString(vehicle?.name),
      vehicleNumber: toTrimmedString(vehicle?.vehicleNumber),
      seaterType: toTrimmedString(vehicle?.seaterType),
      totalSeats: Number(vehicle?.totalSeats) || 0,
      pricePerSeat: Number(vehicle?.pricePerSeat) || 0,
      isActive: Boolean(vehicle?.isActive),
      seatLayout: Array.isArray(vehicle?.seatLayout) ? vehicle.seatLayout : [],
      bookedSeats: Array.isArray(vehicle?.bookedSeats) ? vehicle.bookedSeats : [],
      seatConfig: {
        rows: Number(vehicle?.seatConfig?.rows) || 0,
        left: Number(vehicle?.seatConfig?.left) || 0,
        right: Number(vehicle?.seatConfig?.right) || 0,
        aisle: Boolean(vehicle?.seatConfig?.aisle),
      },
    }))
    .filter((vehicle) => vehicle.name || vehicle.vehicleNumber || vehicle.totalSeats > 0);

export const policiesToMap = (policies = []) =>
  policies.reduce((acc, policy) => {
    const key = toTrimmedString(policy?.key);
    const value = toTrimmedString(policy?.value);

    if (key) acc[key] = value;
    return acc;
  }, {});

export const buildTourPayload = (
  tour = {},
  { policies = [], agencyIdFallback = "", defaultAccepted = false } = {}
) => {
  const isCustomizable = Boolean(tour?.isCustomizable);
  const startDate = normalizeDateValue(tour?.tourStartDate);
  const fromDate = normalizeDateValue(tour?.from) || startDate;
  const toDate = normalizeDateValue(tour?.to) || startDate;

  return {
    travelAgencyName: toTrimmedString(tour?.travelAgencyName),
    agencyId: toTrimmedString(tour?.agencyId) || toTrimmedString(agencyIdFallback),
    agencyPhone: toTrimmedString(tour?.agencyPhone),
    agencyEmail: toTrimmedString(tour?.agencyEmail),
    isAccepted:
      typeof tour?.isAccepted === "boolean" ? tour.isAccepted : defaultAccepted,
    country: toTrimmedString(tour?.country),
    state: toTrimmedString(tour?.state),
    city: toTrimmedString(tour?.city),
    visitngPlaces: toTrimmedString(tour?.visitngPlaces),
    themes: toTrimmedString(tour?.themes),
    price: Number(tour?.price) || 0,
    nights: Number(tour?.nights) || 0,
    days: Number(tour?.days) || 0,
    from: fromDate,
    to: toDate,
    isCustomizable,
    amenities: normalizeStringArray(tour?.amenities),
    inclusion: normalizeStringArray(tour?.inclusion),
    exclusion: normalizeStringArray(tour?.exclusion),
    termsAndConditions: policiesToMap(policies),
    dayWise: normalizeDayWise(tour?.dayWise),
    starRating: Number(tour?.starRating) || 0,
    vehicles: normalizeVehicles(tour?.vehicles),
  };
};

export const appendTourFormData = (fd, payload) => {
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value) || (value && typeof value === "object")) {
      fd.append(key, JSON.stringify(value));
      return;
    }

    if (value !== "" && value !== undefined && value !== null) {
      fd.append(key, value);
    }
  });

  return fd;
};

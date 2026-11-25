/**
 * AgriN — API Service
 * Centralized HTTP client for the FastAPI backend with timeouts and structured errors.
 */

const BASE_URL = '/api';
const DEFAULT_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'API_ERROR', detail = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers = {}, ...fetchOptions } = options;
  const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        headers: isFormData ? { ...headers } : { 'Content-Type': 'application/json', ...headers },
        signal: controller.signal,
        ...fetchOptions,
      });

      const contentType = response.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      if (!response.ok) {
        const rawDetail = data?.detail ?? data?.error ?? data?.message ?? `Request failed (${response.status})`;
        const msg = typeof rawDetail === 'string'
          ? rawDetail
          : rawDetail?.message || JSON.stringify(rawDetail);
        throw new ApiError(msg, {
          status: response.status,
          code: response.status === 401 ? 'UNAUTHORIZED'
            : response.status === 403 ? 'FORBIDDEN'
              : response.status === 422 ? 'VALIDATION_ERROR'
                : response.status >= 500 ? 'SERVER_ERROR'
                  : 'HTTP_ERROR',
          detail: rawDetail,
        });
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err?.name === 'AbortError') {
        throw new ApiError(`Request timed out after ${Math.round(timeoutMs / 1000)}s. Please check your connection and retry.`, {
          status: 408,
          code: 'TIMEOUT',
        });
      }
      throw new ApiError(err?.message || 'Network error reaching AgriN backend API.', {
        status: 0,
        code: 'NETWORK_ERROR',
      });
    } finally {
      clearTimeout(timer);
    }
  }

  // ── Reference Data ─────────────────────────────────────────────────────────
  export const getReferenceData = (state = null) =>
    apiCall(state ? `/reference-data?state=${encodeURIComponent(state)}` : '/reference-data');

  export const getCrops = () =>
    apiCall('/crops');

  export const getLiveWeather = (params = 'Parbhani') => {
    if (typeof params === 'object') {
      const q = new URLSearchParams();
      if (params.district) q.append('district', params.district);
      if (params.state) q.append('state', params.state);
      if (params.lat != null) q.append('lat', params.lat);
      if (params.lon != null) q.append('lon', params.lon);
      return apiCall(`/weather?${q.toString()}`);
    }
    return apiCall(`/weather?district=${encodeURIComponent(params)}`);
  };


  // ── Validation ──────────────────────────────────────────────────────────────
  export const validateInputs = (payload) =>
    apiCall('/validate', { method: 'POST', body: JSON.stringify(payload) });

  // ── Main Analysis ───────────────────────────────────────────────────────────
  export const runAnalysis = (payload) =>
    apiCall('/analyze', { method: 'POST', body: JSON.stringify(payload) });

  // ── Feasibility (I Want to Grow This) ──────────────────────────────────────
  export const checkFeasibility = (payload) =>
    apiCall('/feasibility', { method: 'POST', body: JSON.stringify(payload) });

  // ── What-If ─────────────────────────────────────────────────────────────────
  export const runWhatIf = (payload) =>
    apiCall('/whatif', { method: 'POST', body: JSON.stringify(payload) });

  // ── Explanation ─────────────────────────────────────────────────────────────
  export const getExplanation = (cropResult, explanationType = 'crop_detail') =>
    apiCall('/explain', {
      method: 'POST',
      body: JSON.stringify({ crop_result: cropResult, explanation_type: explanationType })
    });

  // ── Feedback ────────────────────────────────────────────────────────────────
  export const submitFeedback = (payload) =>
    apiCall('/feedback', { method: 'POST', body: JSON.stringify(payload) });

  export const getFeedbackSummary = () =>
    apiCall('/feedback/summary');

  // ── Analytics ───────────────────────────────────────────────────────────────
  export const getAnalytics = () =>
    apiCall('/analytics');

  export const getModelInfo = () =>
    apiCall('/model-info');

  // ── Phase 2.5 Intelligence & Hardening Endpoints ────────────────────────────
  export const getRegenerativePractices = () =>
    apiCall('/regenerative/practices');

  export const recommendRegenerative = (payload) =>
    apiCall('/regenerative/recommend', { method: 'POST', body: JSON.stringify(payload) });

  export const getFarmHealth = (farmId, payload = null) =>
    apiCall(`/farms/${encodeURIComponent(farmId)}/health`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined
    });

  export const getFarmAdvisories = (farmId, payload) =>
    apiCall(`/farms/${encodeURIComponent(farmId)}/advisories`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

  export const submitAdvisoryFeedback = (payload) =>
    apiCall('/advisory/feedback', { method: 'POST', body: JSON.stringify(payload) });

  export const getDataSources = () =>
    apiCall('/data-sources');

  export const getCoverage = () =>
    apiCall('/coverage');

  // ── Track 4: AgriN Intelligence Layer ───────────────────────────────────────
  export const getFullAgriculturalIntelligence = (payload) =>
    apiCall('/intelligence/full-analysis', { method: 'POST', body: JSON.stringify(payload) });

  export const getSoilHealthProfile = (payload) =>
    apiCall('/soil/profile', { method: 'POST', body: JSON.stringify(payload) });

  export const getRegenerativeAdvisory = (payload) =>
    apiCall('/regenerative/advisor', { method: 'POST', body: JSON.stringify(payload) });

  export const getFarmResilienceScore = (payload) =>
    apiCall('/resilience/score', { method: 'POST', body: JSON.stringify(payload) });

  export const getSatelliteStatus = () =>
    apiCall('/satellite/status');

  export const diagnoseCropDisease = (file, { cropHint, symptoms, farmId, allowDemo = false } = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (cropHint) formData.append('crop_hint', cropHint);
    if (symptoms) formData.append('symptoms', symptoms);
    if (farmId) formData.append('farm_id', farmId);
    formData.append('allow_demo', String(Boolean(allowDemo)));
    return apiCall('/disease/diagnose', { method: 'POST', body: formData });
  };

  export const getNationalOverview = () =>
    apiCall('/national/overview');

  export const getInteroperabilityAdapters = () =>
    apiCall('/interoperability/adapters');

  // ── Phase 3 Maturity Endpoints ──────────────────────────────────────────────
  export const compareCrops = (payload) =>
    apiCall('/crops/compare', { method: 'POST', body: JSON.stringify(payload) });

  export const getKnowledgeSources = () =>
    apiCall('/knowledge/sources');

  export const getDemoFarms = () =>
    apiCall('/demo/farms');

  // ── IoT & Hardware Integration ──────────────────────────────────────────────
  export const getDeviceStatus = (deviceId) =>
    apiCall(`/devices/${encodeURIComponent(deviceId)}`);

  export const getLatestTelemetry = (deviceId) =>
    apiCall(`/telemetry/${encodeURIComponent(deviceId)}/latest`);

  export const getTelemetryHistory = (deviceId, page = 1, pageSize = 20) =>
    apiCall(`/telemetry/${encodeURIComponent(deviceId)}/history?page=${page}&page_size=${pageSize}`);

  export const registerDevice = (data) =>
    apiCall('/devices/register', { method: 'POST', body: JSON.stringify(data) });

  export const getFieldsForFarm = (farmId) =>
    apiCall(`/fields/${encodeURIComponent(farmId)}`);

  export const createField = (data) =>
    apiCall('/fields', { method: 'POST', body: JSON.stringify(data) });

  // ── Expanded Crop Catalogue & Synthetic Engine ──────────────────────────────
  export const getCropCatalogue = (params = {}) => {
    const q = new URLSearchParams();
    if (params.category) q.append('category', params.category);
    if (params.season) q.append('season', params.season);
    if (params.state) q.append('state', params.state);
    if (params.soil_type) q.append('soil_type', params.soil_type);
    if (params.search) q.append('search', params.search);
    if (params.lifecycle) q.append('lifecycle', params.lifecycle);
    const qs = q.toString();
    return apiCall(`/crops/catalogue${qs ? `?${qs}` : ''}`);
  };

  export const getCropCategories = () =>
    apiCall('/crops/categories');

  export const getCropById = (cropId) =>
    apiCall(`/crops/${encodeURIComponent(cropId)}`);

  export const getSyntheticMetadata = () =>
    apiCall('/synthetic/metadata');

  export const getSyntheticSample = (limit = 10) =>
    apiCall(`/synthetic/sample?limit=${limit}`);

  export const getSyntheticScenarios = () =>
    apiCall('/synthetic/scenarios');

  // ── Soil Intelligence Ecosystem Endpoints ────────────────────────────────────
  export const getFieldSoilFingerprints = (fieldId) =>
    apiCall(`/soil-intelligence/fingerprints/${encodeURIComponent(fieldId)}`);

  export const saveSoilFingerprint = (data) =>
    apiCall('/soil-intelligence/fingerprints', { method: 'POST', body: JSON.stringify(data) });

  export const getSoilDepthAnalysis = (fieldId) =>
    apiCall(`/soil-intelligence/depth-analysis/${encodeURIComponent(fieldId)}`);

  export const getSamplingRoute = (fieldId) =>
    apiCall(`/soil-intelligence/sampling-routes/${encodeURIComponent(fieldId)}`);

  export const createSamplingRoute = (data) =>
    apiCall('/soil-intelligence/sampling-routes', { method: 'POST', body: JSON.stringify(data) });

  export const toggleSampleCollected = (routeId, pointId) =>
    apiCall(`/soil-intelligence/sampling-routes/${encodeURIComponent(routeId)}/collect/${encodeURIComponent(pointId)}`, { method: 'POST' });

  export const getSoilTreatments = (fieldId) =>
    apiCall(`/soil-intelligence/treatments/${encodeURIComponent(fieldId)}`);

  export const logSoilTreatment = (data) =>
    apiCall('/soil-intelligence/treatments', { method: 'POST', body: JSON.stringify(data) });

  // ── AgriMarket Endpoints ─────────────────────────────────────────────────────
  export const getMarketplaceListings = (params = {}) => {
    const q = new URLSearchParams();
    if (params.category) q.append('category', params.category);
    if (params.district) q.append('district', params.district);
    if (params.is_rental !== undefined) q.append('is_rental', params.is_rental);
    if (params.search) q.append('search', params.search);
    if (params.max_price) q.append('max_price', params.max_price);
    const qs = q.toString();
    return apiCall(`/marketplace/listings${qs ? `?${qs}` : ''}`);
  };

  export const createMarketplaceListing = (data) =>
    apiCall('/marketplace/listings', { method: 'POST', body: JSON.stringify(data) });

  export const getMarketplaceListingDetail = (listingId) =>
    apiCall(`/marketplace/listings/${encodeURIComponent(listingId)}`);

  export const submitMarketplaceEnquiry = (data) =>
    apiCall('/marketplace/enquiries', { method: 'POST', body: JSON.stringify(data) });

  export const getPriceBenchmarks = () =>
    apiCall('/marketplace/price-benchmarks');

  export const getSoilAmendmentsMatch = (deficiency, district = 'Parbhani') =>
    apiCall(`/marketplace/soil-amendments-match?deficiency=${encodeURIComponent(deficiency)}&district=${encodeURIComponent(district)}`);

  // ── AgriLedger: Farm Economics ───────────────────────────────────────────────
  export const getFarmExpenses = (farmId) =>
    apiCall(`/economics/expenses/${encodeURIComponent(farmId)}`);

  export const addFarmExpense = (data) =>
    apiCall('/economics/expenses', { method: 'POST', body: JSON.stringify(data) });

  export const getFarmSales = (farmId) =>
    apiCall(`/economics/sales/${encodeURIComponent(farmId)}`);

  export const recordFarmSale = (data) =>
    apiCall('/economics/sales', { method: 'POST', body: JSON.stringify(data) });

  export const getFarmPnL = (farmId) =>
    apiCall(`/economics/pnl/${encodeURIComponent(farmId)}`);






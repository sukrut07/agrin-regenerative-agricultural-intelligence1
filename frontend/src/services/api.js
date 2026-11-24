/**
 * FarmFriend AI — API Service
 * All API calls to the FastAPI backend.
 */

const BASE_URL = '/api';

async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data.detail || data.error || 'An error occurred';
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }

  return data;
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





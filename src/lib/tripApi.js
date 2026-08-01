/**
 * Group Trip Planner data layer — mock implementation.
 *
 * Same interface (`createSession`, `getSession`, `submitResponse`,
 * `getResponses`, `subscribeToResponses`) that a real Supabase-backed version
 * will expose later on the demo branch. Every caller in the UI only ever
 * imports from this module, so swapping the implementation is a matter of
 * replacing this file's internals, not touching any component.
 *
 * Persistence: localStorage, namespaced under STORAGE_PREFIX. "Live" updates
 * across tabs (the organizer's hub watching a participant submit from a
 * second tab) use the browser's native `storage` event, which only fires in
 * *other* tabs than the one that wrote the value — which is exactly the
 * cross-tab realtime behavior this flow needs, no backend required.
 */

const STORAGE_PREFIX = 'mmt_trip_planner';

const sessionKey = (id) => `${STORAGE_PREFIX}:session:${id}`;
const responsesKey = (id) => `${STORAGE_PREFIX}:responses:${id}`;

const generateId = () => crypto.randomUUID();

const readJSON = (key, fallback) => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

/**
 * @param {{ organizerName: string, groupSize: number, dateWindow: string, budgetPerPerson: number }} input
 * @returns {object} the created session, including its generated id
 */
export const createSession = ({ organizerName, groupSize, dateWindow, budgetPerPerson }) => {
  const session = {
    id: generateId(),
    organizer_name: organizerName,
    group_size: groupSize,
    date_window: dateWindow,
    budget_per_person: budgetPerPerson,
    status: 'collecting',
    recommendation: null,
    created_at: new Date().toISOString(),
  };
  writeJSON(sessionKey(session.id), session);
  writeJSON(responsesKey(session.id), []);
  return session;
};

/**
 * @param {string} id
 * @returns {object|null} the session, or null if it doesn't exist
 */
export const getSession = (id) => readJSON(sessionKey(id), null);

/**
 * @param {string} sessionId
 * @param {{ participantName?: string, vibe?: string, accommodation?: string, pace?: string, openNote?: string, deferred?: boolean }} data
 * @returns {object} the created response row
 */
export const submitResponse = (sessionId, data) => {
  const response = {
    id: generateId(),
    session_id: sessionId,
    participant_name: data.participantName ?? '',
    vibe: data.vibe ?? null,
    accommodation: data.accommodation ?? null,
    pace: data.pace ?? null,
    open_note: data.openNote ?? '',
    deferred: data.deferred ?? false,
    created_at: new Date().toISOString(),
  };
  const responses = readJSON(responsesKey(sessionId), []);
  responses.push(response);
  writeJSON(responsesKey(sessionId), responses);
  return response;
};

/**
 * @param {string} sessionId
 * @returns {object[]}
 */
export const getResponses = (sessionId) => readJSON(responsesKey(sessionId), []);

/**
 * @param {string} sessionId
 * @param {(responses: object[]) => void} callback
 * @returns {() => void} unsubscribe function
 */
export const subscribeToResponses = (sessionId, callback) => {
  const key = responsesKey(sessionId);
  const handler = (event) => {
    if (event.key === key) {
      callback(getResponses(sessionId));
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};

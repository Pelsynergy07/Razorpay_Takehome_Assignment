/**
 * Group Trip Planner data layer with Dual-Mode Architecture:
 * 1. Live Supabase Realtime (when VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY are present)
 * 2. LocalStorage + Storage Event fallback (for offline zero-config demo)
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';

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
 * @returns {Promise<object>|object}
 */
export const createSession = async ({ organizerName, groupSize, dateWindow, budgetPerPerson }) => {
  const sessionId = generateId();
  const session = {
    id: sessionId,
    organizer_name: organizerName,
    group_size: groupSize,
    date_window: dateWindow,
    budget_per_person: budgetPerPerson,
    status: 'collecting',
    recommendation: null,
    created_at: new Date().toISOString(),
  };

  // Always write local fallback
  writeJSON(sessionKey(session.id), session);
  writeJSON(responsesKey(session.id), []);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('sessions').insert([{
        id: session.id,
        organizer_name: organizerName,
        group_size: groupSize,
        date_window: dateWindow,
        budget_per_person: budgetPerPerson,
      }]);
      if (error) console.warn('[Supabase Session Insert Error]', error);
    } catch (err) {
      console.warn('[Supabase Session Insert Exception]', err);
    }
  }

  return session;
};

/**
 * @param {string} id
 * @returns {Promise<object|null>|object|null}
 */
export const getSession = async (id) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();
      if (data && !error) return data;
    } catch (err) {
      console.warn('[Supabase getSession Error]', err);
    }
  }
  return readJSON(sessionKey(id), null);
};

/**
 * @param {string} sessionId
 * @param {{ participantName?: string, vibe?: string, accommodation?: string, pace?: string, openNote?: string, deferred?: boolean }} data
 * @returns {Promise<object>|object}
 */
export const submitResponse = async (sessionId, data) => {
  const response = {
    id: generateId(),
    session_id: sessionId,
    participant_name: data.participantName ?? 'Participant',
    vibe: data.vibe ?? null,
    accommodation: data.accommodation ?? null,
    pace: data.pace ?? null,
    open_note: data.openNote ?? '',
    deferred: data.deferred ?? false,
    created_at: new Date().toISOString(),
  };

  // Save to LocalStorage
  const localResponses = readJSON(responsesKey(sessionId), []);
  localResponses.push(response);
  writeJSON(responsesKey(sessionId), localResponses);

  // Send storage event locally
  window.dispatchEvent(new CustomEvent('mmt_local_response', { detail: { sessionId, responses: localResponses } }));

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('responses').insert([{
        id: response.id,
        session_id: sessionId,
        participant_name: response.participant_name,
        vibe: response.vibe,
        accommodation: response.accommodation,
        pace: response.pace,
        open_note: response.open_note,
        deferred: response.deferred,
      }]);
      if (error) console.warn('[Supabase submitResponse Error]', error);
    } catch (err) {
      console.warn('[Supabase submitResponse Exception]', err);
    }
  }

  return response;
};

/**
 * @param {string} sessionId
 * @returns {Promise<object[]>|object[]}
 */
export const getResponses = async (sessionId) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      if (data && !error) return data;
    } catch (err) {
      console.warn('[Supabase getResponses Error]', err);
    }
  }
  return readJSON(responsesKey(sessionId), []);
};

/**
 * Subscribes to live response updates — via Supabase Realtime when configured,
 * or native LocalStorage cross-tab events as fallback.
 *
 * @param {string} sessionId
 * @param {(responses: object[]) => void} callback
 * @returns {() => void} unsubscribe function
 */
export const subscribeToResponses = (sessionId, callback) => {
  let supabaseChannel = null;

  if (isSupabaseConfigured) {
    // Initial fetch
    getResponses(sessionId).then((initial) => callback(initial));

    // Listen for Realtime Postgres Changes
    supabaseChannel = supabase
      .channel(`public:responses:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'responses',
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          const fresh = await getResponses(sessionId);
          callback(fresh);
        }
      )
      .subscribe();
  }

  // Local tab/window storage listener
  const key = responsesKey(sessionId);
  const storageHandler = (event) => {
    if (event.key === key) {
      callback(readJSON(key, []));
    }
  };
  const customHandler = (event) => {
    if (event.detail?.sessionId === sessionId) {
      callback(event.detail.responses);
    }
  };

  window.addEventListener('storage', storageHandler);
  window.addEventListener('mmt_local_response', customHandler);

  return () => {
    window.removeEventListener('storage', storageHandler);
    window.removeEventListener('mmt_local_response', customHandler);
    if (supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
  };
};

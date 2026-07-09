/**
 * Visitor identification and session management.
 * Generates permanent visitorId and per-session sessionId.
 */

const VISITOR_ID_KEY = 'sc_visitor_id';
const FIRST_VISIT_KEY = 'sc_first_visit';
const SESSION_ID_KEY = 'sc_session_id';

/**
 * Get or create a permanent visitor ID stored in localStorage.
 */
export const getVisitorId = () => {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
};

/**
 * Get or set the first visit timestamp (never overwritten).
 */
export const getFirstVisitTimestamp = () => {
  let timestamp = localStorage.getItem(FIRST_VISIT_KEY);
  if (!timestamp) {
    timestamp = new Date().toISOString();
    localStorage.setItem(FIRST_VISIT_KEY, timestamp);
  }
  return timestamp;
};

/**
 * Get or create a session ID stored in sessionStorage.
 * Regenerated every new browser session.
 */
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

/**
 * Get all visitor identifiers as a single object.
 */
export const getVisitorInfo = () => ({
  visitorId: getVisitorId(),
  sessionId: getSessionId(),
  firstVisitTimestamp: getFirstVisitTimestamp(),
});

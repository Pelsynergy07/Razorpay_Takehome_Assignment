const STORAGE_PREFIX = 'mmt_myra_chat';
const INDEX_KEY = `${STORAGE_PREFIX}:index`;

function readIndex() {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY)) || [];
  } catch {
    return [];
  }
}

function writeIndex(index) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

function deriveTitle(messages) {
  const firstUserMsg = messages.find((m) => m.role === 'user');
  if (!firstUserMsg?.text) return 'New conversation';
  return firstUserMsg.text.length > 64 ? `${firstUserMsg.text.slice(0, 61)}...` : firstUserMsg.text;
}

export function createConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Most-recently-updated first. */
export function listConversations() {
  return readIndex().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getConversation(id) {
  try {
    return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}:conversation:${id}`));
  } catch {
    return null;
  }
}

export function saveConversation(id, messages) {
  if (!id || messages.length === 0) return;
  const updatedAt = Date.now();
  localStorage.setItem(
    `${STORAGE_PREFIX}:conversation:${id}`,
    JSON.stringify({ id, messages, updatedAt })
  );
  writeIndex([...readIndex().filter((c) => c.id !== id), { id, title: deriveTitle(messages), updatedAt }]);
}

/** Wipe every persisted conversation and the index. */
export function clearAllConversations() {
  readIndex().forEach((c) => localStorage.removeItem(`${STORAGE_PREFIX}:conversation:${c.id}`));
  localStorage.removeItem(INDEX_KEY);
}

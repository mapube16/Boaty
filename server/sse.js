/**
 * SSE Manager - Server-Sent Events for real-time notifications
 * Tracks connected clients and broadcasts events to specific users or roles.
 */

// Map: userId (string) -> Set of response objects
const clients = new Map();

// Map: userId -> role (for broadcasting to roles)
const userRoles = new Map();

export function addClient(userId, role, res) {
    const id = String(userId);
    if (!clients.has(id)) clients.set(id, new Set());
    clients.get(id).add(res);
    userRoles.set(id, role);

    res.on('close', () => removeClient(id, res));
}

export function removeClient(userId, res) {
    const id = String(userId);
    const set = clients.get(id);
    if (set) {
        set.delete(res);
        if (set.size === 0) {
            clients.delete(id);
            userRoles.delete(id);
        }
    }
}

/**
 * Send an SSE event to specific user IDs.
 * @param {string[]} userIds
 * @param {string} event - event name
 * @param {object} data - payload
 */
export function sendToUsers(userIds, event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const uid of userIds) {
        const id = String(uid);
        const set = clients.get(id);
        if (set) {
            for (const res of set) {
                try { res.write(payload); } catch (_) { /* ignore closed */ }
            }
        }
    }
}

/**
 * Send an SSE event to all users with specific roles.
 * @param {string[]} roles - e.g. ['ADMIN','STAFF']
 * @param {string} event
 * @param {object} data
 */
export function sendToRoles(roles, event, data) {
    const roleSet = new Set(roles);
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [uid, role] of userRoles.entries()) {
        if (roleSet.has(role)) {
            const set = clients.get(uid);
            if (set) {
                for (const res of set) {
                    try { res.write(payload); } catch (_) { /* ignore closed */ }
                }
            }
        }
    }
}

/**
 * Broadcast to everyone connected.
 */
export function broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const set of clients.values()) {
        for (const res of set) {
            try { res.write(payload); } catch (_) { /* ignore closed */ }
        }
    }
}

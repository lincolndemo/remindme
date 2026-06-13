// In-memory store for tests — reset between test files via jest.resetModules() or beforeEach
const store: Record<string, Record<string, unknown>> = {};

const db = {
  execAsync: jest.fn(),
  runAsync: jest.fn(async (sql: string, params: unknown[]) => {
    if (sql.includes('INSERT OR REPLACE INTO reminders')) {
      const id = params[0] as string;
      store[id] = {
        id: params[0], title: params[1], category: params[2],
        due_date: params[3], amount: params[4], currency: params[5],
        contact: params[6], lead_times: params[7], notes: params[8],
        is_archived: 0, calendar_event_id: params[9],
        notification_ids: '[]',
        created_at: params[10], updated_at: params[11],
      };
    }
    if (sql.includes('UPDATE reminders SET') && sql.includes('is_archived = 1')) {
      const id = params[params.length - 1] as string;
      if (store[id]) {
        store[id].is_archived = 1;
        store[id].updated_at = params[0];
      }
    }
    if (sql.includes('UPDATE reminders SET') && sql.includes('notification_ids = ?')) {
      const id = params[params.length - 1] as string;
      if (store[id]) {
        store[id].notification_ids = params[0];
        store[id].updated_at = params[1];
      }
    }
    if (sql.includes('UPDATE reminders SET') && sql.includes('title=?')) {
      const id = params[params.length - 1] as string;
      if (store[id]) {
        store[id].title = params[0];
        store[id].category = params[1];
        store[id].due_date = params[2];
        store[id].amount = params[3];
        store[id].currency = params[4];
        store[id].contact = params[5];
        store[id].lead_times = params[6];
        store[id].notes = params[7];
        store[id].is_archived = params[8];
        store[id].calendar_event_id = params[9];
        store[id].updated_at = params[10];
      }
    }
  }),
  getFirstAsync: jest.fn(async (sql: string) => {
    if (sql.includes("key = 'db_version'")) return { value: '1' };
    return null;
  }),
  getAllAsync: jest.fn(async (sql: string) => {
    const rows = Object.values(store);
    if (sql.includes('is_archived = 0')) return rows.filter((r) => r.is_archived === 0);
    return rows;
  }),
};

// Clear store between tests
beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  jest.clearAllMocks();
  // Re-attach implementations after clearAllMocks
  (db.getFirstAsync as jest.Mock).mockImplementation(async (sql: string) => {
    if (sql.includes("key = 'db_version'")) return { value: '1' };
    return null;
  });
  (db.getAllAsync as jest.Mock).mockImplementation(async (sql: string) => {
    const rows = Object.values(store);
    if (sql.includes('is_archived = 0')) return rows.filter((r) => r.is_archived === 0);
    return rows;
  });
  (db.runAsync as jest.Mock).mockImplementation(async (sql: string, params: unknown[]) => {
    if (sql.includes('INSERT OR REPLACE INTO reminders')) {
      const id = params[0] as string;
      store[id] = {
        id: params[0], title: params[1], category: params[2],
        due_date: params[3], amount: params[4], currency: params[5],
        contact: params[6], lead_times: params[7], notes: params[8],
        is_archived: 0, calendar_event_id: params[9],
        notification_ids: '[]',
        created_at: params[10], updated_at: params[11],
      };
    }
    if (sql.includes('UPDATE reminders SET') && sql.includes('is_archived = 1')) {
      const id = params[params.length - 1] as string;
      if (store[id]) {
        store[id].is_archived = 1;
        store[id].updated_at = params[0];
      }
    }
    if (sql.includes('UPDATE reminders SET') && sql.includes('notification_ids = ?')) {
      const id = params[params.length - 1] as string;
      if (store[id]) {
        store[id].notification_ids = params[0];
        store[id].updated_at = params[1];
      }
    }
    if (sql.includes('UPDATE reminders SET') && sql.includes('title=?')) {
      const id = params[params.length - 1] as string;
      if (store[id]) {
        store[id].title = params[0];
        store[id].category = params[1];
        store[id].due_date = params[2];
        store[id].amount = params[3];
        store[id].currency = params[4];
        store[id].contact = params[5];
        store[id].lead_times = params[6];
        store[id].notes = params[7];
        store[id].is_archived = params[8];
        store[id].calendar_event_id = params[9];
        store[id].updated_at = params[10];
      }
    }
  });
  (db.execAsync as jest.Mock).mockImplementation(async () => {});
});

export const openDatabaseAsync = jest.fn(async () => db);

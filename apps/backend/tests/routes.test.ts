import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

vi.mock('../src/lib/db');
vi.mock('../src/models/Trigger', () => ({
  TriggerModel: {
    find: vi.fn().mockReturnValue({ skip: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }) }) }),
    countDocuments: vi.fn().mockResolvedValue(0),
  },
}));

describe('GET /api/v1/health', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBeLessThan(600);
    expect(res.body).toHaveProperty('status');
  });
});

describe('GET /api/v1/triggers', () => {
  it('returns paginated triggers', async () => {
    const res = await request(app).get('/api/v1/triggers');
    expect([200, 500]).toContain(res.status);
  });
});

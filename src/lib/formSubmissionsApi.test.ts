import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteFormSubmission, listFormSubmissions, updateFormSubmission, updateFormSubmissionStatus } from '@/lib/adminApi';

const fetchMock = vi.fn<typeof fetch>();
const apiBase = import.meta.env.VITE_API_URL ?? '';

describe('form submissions API', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the typed list envelope with pagination, type, and repeated status filters', async () => {
    const submission = { id: 'entry-1', type: 'Feedback', fullName: 'Sam', email: 'sam@example.com' };
    const response = {
      success: true,
      message: 'Success',
      data: { data: [submission], pagination: { page: 2, limit: 25, total: 1, totalPages: 1 } },
    };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));

    await expect(listFormSubmissions({
      page: 2,
      limit: 25,
      type: 'Testimony',
      statuses: ['new', 'in_progress'],
    })).resolves.toEqual({
      data: [{ ...submission, status: 'new', data: {} }],
      pagination: response.data.pagination,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${apiBase}/forms?page=2&limit=25&type=Testimony&status=pending`,
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it('patches documented submission fields at the resource route', async () => {
    const update = { status: 'pending' as const };
    await updateFormSubmission('entry/1', update);

    expect(fetchMock).toHaveBeenCalledWith(`${apiBase}/forms/entry%2F1`, expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify(update),
    }));
    expect(fetchMock.mock.calls[0][1]?.headers).not.toHaveProperty('Idempotency-Key');
    expect(fetchMock.mock.calls[0][1]?.headers).not.toHaveProperty('X-Idempotency-Key');
  });

  it('patches approval status at the dedicated status endpoint', async () => {
    await updateFormSubmissionStatus('entry/1', 'approved');

    expect(fetchMock).toHaveBeenCalledWith(`${apiBase}/forms/entry%2F1/status`, expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ status: 'approved' }),
    }));
  });

  it('does not send unsupported exclusion filters to the backend', async () => {
    await listFormSubmissions({
      page: 1,
      limit: 25,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${apiBase}/forms?page=1&limit=25`,
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it('normalizes a single testimony record with its explicit status', async () => {
    const submission = {
      id: 'testimony-1',
      type: 'Testimony',
      fullName: 'Jordan Lee',
      email: 'jordan@example.com',
      data: { testimony: 'A testimony' },
      status: 'pending',
      createdAt: '2026-10-17T12:00:00.000Z',
      updatedAt: '2026-10-17T12:00:00.000Z',
    };
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      success: true,
      message: 'Success',
      data: submission,
    }), { status: 200 }));

    await expect(listFormSubmissions({ page: 1, limit: 25, type: 'Testimony' })).resolves.toMatchObject({
      data: [{ id: 'testimony-1', status: 'pending', type: 'Testimony' }],
      pagination: { page: 1, limit: 25, total: 1, totalPages: 1 },
    });
  });

  it('deletes a submission at the resource route', async () => {
    await deleteFormSubmission('entry-1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${apiBase}/forms/entry-1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
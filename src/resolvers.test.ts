import { resolvers } from './resolvers';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { connectToDb } from './db';

// mocks

vi.mock('../src/db', () => ({
  connectToDb: vi.fn(() => ({
    all: vi.fn().mockResolvedValue([
      { AlbumId: 1, Title: 'Good Album 1' },
      { AlbumId: 2, Title: 'Good Album 2' },
      { AlbumId: 3, Title: 'Better Album 1' },
    ]),
    get: vi.fn().mockResolvedValue({ AlbumId: 1, Title: 'Good Album 1' }),
  })),
}));

vi.mock('fuzzysort', () => ({
  default: {
    go: vi.fn(),
  }
}));

import fuzzysort from 'fuzzysort';

describe('Query albums', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all albums when no title filter is provided', async () => {
    const albums = await resolvers.Query.albums(null, {});
    expect(albums).toEqual([
      { AlbumId: 1, Title: 'Good Album 1' },
      { AlbumId: 2, Title: 'Good Album 2' },
      { AlbumId: 3, Title: 'Better Album 1' },
    ]);
  });

  it('should fetch albums that match the title filter with score >= 0.9', async () => {
    (fuzzysort.go as any).mockReturnValue([
      { score: 0.95, obj: { AlbumId: 1, Title: 'Good Album 1' } },
      { score: 0.90, obj: { AlbumId: 2, Title: 'Good Album 2' } },
      { score: 0.5, obj: { AlbumId: 3, Title: 'Better Album 1' } },
    ]);

    const albums = await resolvers.Query.albums(null, { title: 'Good' });

    expect(albums).toEqual([
      { AlbumId: 1, Title: 'Good Album 1' },
      { AlbumId: 2, Title: 'Good Album 2' },
    ]);
  });

  it('should return empty list if no matching albums are found', async () => {
    (fuzzysort.go as any).mockReturnValue([
      { score: 0.6, obj: { AlbumId: 1, Title: 'Good Album 1' } },
      { score: 0.5, obj: { AlbumId: 2, Title: 'Good Album 2' } },
      { score: 0.5, obj: { AlbumId: 3, Title: 'Better Album 1' } },
    ]);

    const albums = await resolvers.Query.albums(null, { title: 'Something something' });

    expect(albums).toEqual([]);
  });

  it('should throw an error if database connection fails while fetching albums', async () => {
    (connectToDb as any).mockRejectedValueOnce(new Error('Failed to fetch albums'));

    await expect(resolvers.Query.albums(null, {}))
      .rejects
      .toThrow('Failed to fetch albums');
  });
});

describe('Query album', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch an album by ID', async () => {
    const album = await resolvers.Query.album(null, { id: "1" });
    expect(album).toEqual({ AlbumId: 1, Title: "Good Album 1" });
  });

  it('should return null if the album is not found', async () => {
    (connectToDb as any).mockResolvedValue({
      get: vi.fn().mockResolvedValue(null),
    });

    const album = await resolvers.Query.album(null, { id: "4" });
    expect(album).toBeNull();
  });

  it('should throw an error if database connection fails while fetching album', async () => {
    (connectToDb as any).mockRejectedValueOnce(new Error('Failed to fetch album'));

    await expect(resolvers.Query.album(null, {id: "1"}))
      .rejects
      .toThrow('Failed to fetch album');
  });
});
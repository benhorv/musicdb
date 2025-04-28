import { resolvers } from './resolvers';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { connectToDb } from './db';
import fuzzysort from 'fuzzysort';

// mocks

vi.mock('../src/db', () => ({
  connectToDb: vi.fn(() => Promise.resolve({ all: vi.fn(), get: vi.fn() })),
  getAllAlbums: vi.fn(() => Promise.resolve([
    { AlbumId: 1, Title: 'Good Album 1' },
    { AlbumId: 2, Title: 'Good Album 2' },
    { AlbumId: 3, Title: 'Better Album 1' },
  ])
  ),
  getAlbumById: vi.fn((_, params: any[]) => {
    const id = params[0];
    if (id == "1") {
      return Promise.resolve({ AlbumId: 1, Title: 'Good Album 1' });
    }
    if (id == "2") {
      return Promise.resolve({ AlbumId: 2, Title: 'Good Album 2' });
    }
    return Promise.resolve(null);
  }),
  getAllArtists: vi.fn(() => Promise.resolve([
    { ArtistId: 1, Name: 'John Doe' },
    { ArtistId: 2, Name: 'Elek Teszt' },
    { ArtistId: 3, Name: 'John Dor' },
  ])
  ),
  getArtistById: vi.fn((_, params: any[]) => {
    const id = params[0];
    if (id == "1") {
      return Promise.resolve({ ArtistId: 1, Name: 'John Doe' });
    }
    if (id == "2") {
      return Promise.resolve({ ArtistId: 2, Name: 'Elek Teszt' });
    }
    return Promise.resolve(null);
  }),
  getTrackById: vi.fn((_, params: any[]) => {
    const id = params[0];
    if (id == "1") {
      return Promise.resolve({ TrackId: 1, Name: 'Worm', AlbumId: "1" });
    }
    if (id == "2") {
      return Promise.resolve({ TrackId: 2, Name: '444888', AlbumId: "1" });
    }
    return Promise.resolve(null);
  }),
  getAllAlbumsByArtistId: vi.fn((_, params: any[]) => {
    const id = params[0];
    if (id == "1") {
      return Promise.resolve([
        { AlbumId: 1, Title: 'Good Album 1' },
        { AlbumId: 3, Title: 'Better Album 1' },
      ]);
    }
    if (id == "2") {
      return Promise.resolve([
        { AlbumId: 2, Title: 'Good Album 2' },
      ]);
    }
    return Promise.resolve([]);
  }),
  getAllTracksByArtistId: vi.fn((_, params: any[]) => {
    const id = params[0];
    if (id == "1") {
      return Promise.resolve([
        { TrackId: 1, Name: 'Worm', AlbumId: "1" },
      ]);
    }
    if (id == "2") {
      return Promise.resolve([
        { TrackId: 2, Name: '444888', AlbumId: "1" },
      ]);
    }
    return Promise.resolve([]);
  }),
  getAllTracksByAlbumId: vi.fn((_, params: any) => {
    const id = params;
    if (id == "1") {
      return Promise.resolve([
        { TrackId: 1, Name: 'Worm', AlbumId: "1" },
      ]);
    }
    if (id == "2") {
      return Promise.resolve([
        { TrackId: 2, Name: '444888', AlbumId: "1" },
      ]);
    }
    return Promise.resolve([]);
  }),
  getArtistByTrackId: vi.fn((_, params: any[]) => {
    const id = params[0];
    if (id == "1") {
      return Promise.resolve({ ArtistId: 1, Name: 'John Doe' });
    }
    if (id == "2") {
      return Promise.resolve({ ArtistId: 2, Name: 'Elek Teszt' });
    }
    return Promise.resolve(null);
  })
}));


vi.mock('fuzzysort', () => ({
  default: {
    go: vi.fn(),
  }
}));


describe('Query albums', () => {
  beforeEach(() => {
    vi.resetAllMocks();
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

    const albums = await resolvers.Query.albums(null, { title: 'Good' }); // does not matter, since fuzzysort is mocked

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
    vi.resetAllMocks();
  });

  it('should fetch an album by ID', async () => {
    const album = await resolvers.Query.album(null, { id: "1" });
    expect(album).toEqual({ AlbumId: 1, Title: "Good Album 1" });

    const album2 = await resolvers.Query.album(null, { id: "2" });
    expect(album2).toEqual({ AlbumId: 2, Title: "Good Album 2" });

    const albumNotFound = await resolvers.Query.album(null, { id: "999" });
    expect(albumNotFound).toBeNull();
  });

  it('should return null if the album is not found', async () => {
    (connectToDb as any).mockResolvedValue({
      get: vi.fn().mockResolvedValue(null),
    });

    const album = await resolvers.Query.album(null, { id: "999" });
    expect(album).toBeNull();
  });

  it('should throw an error if database connection fails while fetching album', async () => {
    (connectToDb as any).mockRejectedValueOnce(new Error('Failed to fetch album'));

    await expect(resolvers.Query.album(null, { id: "1" }))
      .rejects
      .toThrow('Failed to fetch album');
  });
});

describe('Query artists', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch all artists when no title filter is provided', async () => {
    const artists = await resolvers.Query.artists(null, {});
    expect(artists).toEqual([
      { ArtistId: 1, Name: 'John Doe' },
      { ArtistId: 2, Name: 'Elek Teszt' },
      { ArtistId: 3, Name: 'John Dor' },
    ]);
  });

  it('should fetch artists that match the name filter with score >= 0.9', async () => {
    (fuzzysort.go as any).mockReturnValue([
      { score: 0.95, obj: { ArtistId: 1, Name: 'John Doe' } },
      { score: 0.6, obj: { ArtistId: 2, Name: 'Elek Teszt' } },
      { score: 0.91, obj: { ArtistId: 3, Name: 'John Dor' } },
    ]);

    const artists = await resolvers.Query.artists(null, { name: 'John' });

    expect(artists).toEqual([
      { ArtistId: 1, Name: 'John Doe' },
      { ArtistId: 3, Name: 'John Dor' },
    ]);
  });

  it('should return empty list if no matching artists are found', async () => {
    (fuzzysort.go as any).mockReturnValue([
      { score: 0.5, obj: { ArtistId: 1, Name: 'John Doe' } },
      { score: 0.6, obj: { ArtistId: 2, Name: 'Elek Teszt' } },
      { score: 0.3, obj: { ArtistId: 3, Name: 'John Dor' } },
    ]);

    const albums = await resolvers.Query.artists(null, { name: 'Something something' });

    expect(albums).toEqual([]);
  });

  it('should throw an error if database connection fails while fetching artists', async () => {
    (connectToDb as any).mockRejectedValueOnce(new Error('Failed to fetch artists'));

    await expect(resolvers.Query.artists(null, {}))
      .rejects
      .toThrow('Failed to fetch artists');
  });
});

describe('Query artist', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch an artist by ID', async () => {
    const artist = await resolvers.Query.artist(null, { id: "1" });
    expect(artist).toEqual({ ArtistId: 1, Name: 'John Doe' });

    const artist2 = await resolvers.Query.artist(null, { id: "2" });
    expect(artist2).toEqual({ ArtistId: 2, Name: 'Elek Teszt' });

    const artistNotFound = await resolvers.Query.artist(null, { id: "999" });
    expect(artistNotFound).toBeNull();
  });

  it('should return null if the artist is not found', async () => {
    (connectToDb as any).mockResolvedValue({
      get: vi.fn().mockResolvedValue(null),
    });

    const artist = await resolvers.Query.artist(null, { id: "999" });
    expect(artist).toBeNull();
  });

  it('should throw an error if database connection fails while fetching artist', async () => {
    (connectToDb as any).mockRejectedValueOnce(new Error('Failed to fetch artist'));

    await expect(resolvers.Query.artist(null, { id: "1" }))
      .rejects
      .toThrow('Failed to fetch artist');
  });
});

describe('Query track', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch an track by ID', async () => {
    const track = await resolvers.Query.track(null, { id: "1" });
    expect(track).toEqual({ TrackId: 1, Name: 'Worm', AlbumId: "1" });

    const track2 = await resolvers.Query.track(null, { id: "2" });
    expect(track2).toEqual({ TrackId: 2, Name: '444888', AlbumId: "1" });

    const trackNotFound = await resolvers.Query.track(null, { id: "999" });
    expect(trackNotFound).toBeNull();
  });

  it('should return null if the track is not found', async () => {
    (connectToDb as any).mockResolvedValue({
      get: vi.fn().mockResolvedValue(null),
    });

    const track = await resolvers.Query.track(null, { id: "999" });
    expect(track).toBeNull();
  });

  it('should throw an error if database connection fails while fetching track', async () => {
    (connectToDb as any).mockRejectedValueOnce(new Error('Failed to fetch track'));

    await expect(resolvers.Query.track(null, { id: "1" }))
      .rejects
      .toThrow('Failed to fetch track');
  });
});

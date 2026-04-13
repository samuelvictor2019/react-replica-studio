export async function postForm(formType: string, data: any) {
  const LOCAL_FORMS_STORAGE_KEY = 'wgc_frontend_form_submissions';
  // Map frontend form types to backend expected types
  const typeMapping: Record<string, string> = {
    'counselling': 'Counselling',
    'event-registration': 'Feedback', // Map to Feedback for now
    'feedback': 'Feedback',
    'new-member': 'New Comers',
    'pre-marital-counseling': 'Pre-Marital Counselling',
    'testimony': 'Testimony',
    'volunteer': 'Volunteer',
    'altar-call': 'Altar Call',
    'baby-dedication': 'Naming Ceremony'
  };

  const backendType = typeMapping[formType] || formType;

  // Forms that don't require email
  const formsWithoutEmail = ['feedback', 'testimony', 'altar-call', 'baby-dedication'];

  // Filter out fields that the backend doesn't want and map to correct field names
  const filteredData: any = {};

  // Map common fields to backend expected format
  if (data.fullName) filteredData.fullName = data.fullName;
  if (data.name) filteredData.fullName = data.name; // Map name to fullName
  if (data.email && data.email.trim()) {
    filteredData.email = data.email.trim();
  } else if (!formsWithoutEmail.includes(formType)) {
    // For forms that should have email but don't, this will still cause validation error
    // But for forms that legitimately don't have email, we'll handle it below
  }
  if (data.phone) filteredData.phone = data.phone;

  // For forms that don't collect email, provide a default email to satisfy backend validation
  if (formsWithoutEmail.includes(formType) && !filteredData.email) {
    filteredData.email = 'no-email-provided@churchform.com';
  }

  const reservedKeys = new Set(['fullName', 'name', 'email', 'phone']);
  const extraData = Object.entries(data || {}).reduce((acc, [key, value]) => {
    if (!reservedKeys.has(key)) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);

  if (Object.keys(extraData).length > 0) {
    filteredData.data = extraData;
  }

  const url = (import.meta.env.VITE_API_URL ?? '') + `/forms`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: backendType, ...filteredData }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to submit form');
  }

  const responseJson = await res.json();

  try {
    const existingRaw = localStorage.getItem(LOCAL_FORMS_STORAGE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const list = Array.isArray(existing) ? existing : [];
    const now = new Date().toISOString();
    const responseData = responseJson?.data || responseJson;

    const record = {
      id: responseData?.id || `local-form-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      type: backendType,
      status: 'new',
      notes: '',
      fullName: filteredData.fullName || '',
      email: filteredData.email || '',
      phone: filteredData.phone || '',
      data: filteredData.data || {},
      createdAt: responseData?.createdAt || now,
      updatedAt: responseData?.updatedAt || now,
    };

    localStorage.setItem(LOCAL_FORMS_STORAGE_KEY, JSON.stringify([record, ...list].slice(0, 1000)));
  } catch (error) {
    console.warn('Failed to mirror form submission locally:', error);
  }

  return responseJson;
}

// Public API functions for fetching data
export async function getEvents() {
  const url = (import.meta.env.VITE_API_URL ?? '') + `/events?page=1&limit=50&status=published`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.status}`);
    }
    const data = await res.json();
    return data.items || data.data || [];
  } catch (error) {
    console.warn('Failed to fetch events from API, using fallback data:', error);
    return getFallbackEvents();
  }
}

export async function getEventById(eventId: string) {
  const url = (import.meta.env.VITE_API_URL ?? '') + `/events/${encodeURIComponent(eventId)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch event: ${res.status}`);
    }
    const data = await res.json();
    return data?.data || data?.item || data;
  } catch (error) {
    console.warn('Failed to fetch event by ID from API, using events list fallback:', error);
    const events = await getEvents();
    return (events || []).find((event: any) => String(event.id) === String(eventId)) || null;
  }
}

export function buildEventRegistrationUrl(event: {
  id: string;
  title?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}) {
  const path = `/event-registration/${encodeURIComponent(event.id)}`;
  const params = new URLSearchParams();

  if (event.title) params.set('title', event.title);
  if (event.type) params.set('type', event.type);
  if (event.startDate) params.set('startDate', event.startDate);
  if (event.endDate) params.set('endDate', event.endDate);
  if (event.location) params.set('location', event.location);

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export async function registerEventParticipant(
  eventId: string,
  payload: {
    fullName: string;
    email: string;
    phone?: string;
    gender?: string;
    address?: string;
    placeOfWorship?: string;
  }
) {
  const parts = String(payload.fullName || '').trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || 'Guest';
  const lastName = parts.slice(1).join(' ') || 'Attendee';

  const url = (import.meta.env.VITE_API_URL ?? '') + `/events/${encodeURIComponent(eventId)}/participants/register`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName,
      lastName,
      email: payload.email,
      phone: payload.phone,
      gender: payload.gender ? String(payload.gender).toUpperCase() : undefined,
      address: payload.address,
      placeOfWorship: payload.placeOfWorship,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to register participant');
  }

  return res.json();
}

export async function getMedia() {
  // Media is stored locally (no API available), load from localStorage
  const STORAGE_KEY = 'wgc_admin_media';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const mediaItems = JSON.parse(stored);
      // Filter for published items only
      return mediaItems.filter((item: any) => item.status === 'published' || !item.status);
    }
  } catch (error) {
    console.warn('Failed to load media from localStorage:', error);
  }

  // Fallback to hardcoded data if nothing in localStorage
  return getFallbackMedia();
}

export async function getTestimonies() {
  const url = (import.meta.env.VITE_API_URL ?? '') + `/testimonies?page=1&limit=20&status=approved`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch testimonies: ${res.status}`);
    }
    const data = await res.json();
    return data.items || data.data || [];
  } catch (error) {
    console.warn('Failed to fetch testimonies from API, using fallback data:', error);
    return getFallbackTestimonies();
  }
}

// Fallback data functions
function getFallbackEvents() {
  return [
    {
      id: 'fallback-1',
      title: "PARTAKERS OF THE HOLYGHOST",
      description: "At WaterGate Church, our events are moments of alignment, transformation, and community. From intimate trainings to weekly gatherings, each meeting is designed to be...",
      startDate: "2025-12-18T08:00:00Z",
      endDate: "2025-12-21T18:00:00Z",
      location: "THE WATERGATE CHURCH, JENDOL BUS-STOP, OJU ORE, OTA",
      status: "published",
      type: "conference",
      bannerImageUrl: "/src/assets/event-1.png",
      price: 0,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z"
    },
    {
      id: 'fallback-2',
      title: "Sunday Service",
      description: "Join us for our weekly Sunday service filled with worship, prayer, and the Word.",
      startDate: "2025-12-22T10:00:00Z",
      endDate: "2025-12-22T12:00:00Z",
      location: "THE WATERGATE CHURCH, JENDOL BUS-STOP, OJU ORE, OTA",
      status: "published",
      type: "service",
      price: 0,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z"
    }
  ];
}

function getFallbackMedia() {
  return [
    {
      id: 'fallback-1',
      title: "Partakers Of The HolyGhost (PART ONE)",
      type: "youtube",
      url: "https://youtube.com/watch?v=example1",
      category: "sermons",
      description: "A powerful message about the Holy Spirit",
      thumbnail: "/src/assets/media_icon.png",
      createdAt: "2025-08-01T10:00:00Z",
      updatedAt: "2025-08-01T10:00:00Z"
    },
    {
      id: 'fallback-2',
      title: "Walking in the Spirit",
      type: "youtube",
      url: "https://youtube.com/watch?v=example2",
      category: "sermons",
      description: "Understanding how to walk in the Spirit daily",
      thumbnail: "/src/assets/media_icon.png",
      createdAt: "2025-07-18T10:00:00Z",
      updatedAt: "2025-07-18T10:00:00Z"
    }
  ];
}

function getFallbackTestimonies() {
  return [
    {
      id: 'fallback-1',
      authorName: "John Doe",
      authorEmail: "john@example.com",
      title: "Healed from sickness",
      content: "God healed me completely from my illness. Praise Jesus!",
      category: "healing",
      status: "approved",
      submittedDate: "2025-01-15T10:00:00Z",
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2025-01-15T10:00:00Z"
    }
  ];
}

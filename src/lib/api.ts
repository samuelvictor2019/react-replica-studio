export async function postForm(formType: string, data: any) {
  const url = (import.meta.env.VITE_API_URL ?? '') + `/api/forms/${formType}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to submit form');
  }

  return res.json();
}

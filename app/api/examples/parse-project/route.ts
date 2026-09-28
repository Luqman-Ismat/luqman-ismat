export const runtime = 'nodejs';
export async function POST(request: Request) {
  // The parser is an explicitly configured local/service dependency, never a client URL.
  const endpoint = process.env.DEMO_MPP_PARSER_URL;
  if (!endpoint) return Response.json({ success: false, error: 'The project parser service is not configured.' }, { status: 503 });
  const size = Number(request.headers.get('content-length') || 0);
  if (size > 8 * 1024 * 1024) return Response.json({ success: false, error: 'Use a schedule under 8 MB.' }, { status: 413 });
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || !/\.(mpp|xml)$/i.test(file.name) || file.size > 8 * 1024 * 1024) return Response.json({ success: false, error: 'Choose an MPP or Microsoft Project XML file under 8 MB.' }, { status: 400 });
    const payload = new FormData(); payload.append('file', file);
    const response = await fetch(`${endpoint.replace(/\/$/, '')}/parse`, { method: 'POST', body: payload, signal: AbortSignal.timeout(120000) });
    const result = await response.json();
    return Response.json(result, { status: response.ok ? 200 : 422, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ success: false, error: 'The parser could not read this schedule. Check the file and the local parser service.' }, { status: 502 });
  }
}

export async function GET() {
  return Response.json({
    ok: true,
    service: "aphrodite",
    timestamp: new Date().toISOString(),
  });
}

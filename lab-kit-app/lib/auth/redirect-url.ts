import { type NextRequest } from "next/server";

/** Tạo URL redirect theo host/protocol mà browser hoặc proxy gửi tới route. */
export function createRedirectUrl(path: string, request: NextRequest): URL {
  const url = new URL(path, request.url);
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto");

  if (host) {
    url.host = host;
  }

  if (protocol) {
    url.protocol = `${protocol}:`;
  }

  return url;
}

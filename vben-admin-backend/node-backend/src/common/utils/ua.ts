/**
 * 请求工具：IP 获取、User-Agent 解析
 */

export function getClientIp(request: any): string {
  let ip =
    request.headers['x-forwarded-for'] ||
    request.headers['x-real-ip'] ||
    request.ip ||
    '';
  if (Array.isArray(ip)) ip = ip[0];
  if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();
  if (ip === '::1' || ip === '::ffff:127.0.0.1' || !ip) ip = '127.0.0.1';
  return ip;
}

export function parseBrowser(userAgent: string): string {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('Chrome/')) return 'Chrome';
  if (userAgent.includes('Firefox/')) return 'Firefox';
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome'))
    return 'Safari';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident/'))
    return 'IE';
  return 'Unknown';
}

export function parseOs(userAgent: string): string {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Windows NT 10')) return 'Windows 10/11';
  if (userAgent.includes('Windows NT')) return 'Windows';
  if (userAgent.includes('Mac OS X')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad'))
    return 'iOS';
  return 'Unknown';
}

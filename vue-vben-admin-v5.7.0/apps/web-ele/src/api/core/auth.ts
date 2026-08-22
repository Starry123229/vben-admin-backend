import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}

/** 注册并自动登录 */
export async function registerApi(data: {
  username: string;
  password: string;
  realName?: string;
  phone?: string;
  email?: string;
}) {
  return requestClient.post<AuthApi.LoginResult>('/auth/register', data);
}

/** 发送手机验证码（开发期返回 mockCode 便于测试） */
export async function sendSmsApi(phone: string) {
  return requestClient.post<{ mockCode: string | null }>('/auth/sms/send', {
    phone,
  });
}

/** 手机号 + 验证码登录（新手机号自动注册） */
export async function phoneLoginApi(phone: string, code: string) {
  return requestClient.post<AuthApi.LoginResult>('/auth/phone-login', {
    phone,
    code,
  });
}

/** 生成二维码登录 ticket */
export async function createQrApi() {
  return requestClient.get<{ ticket: string; status: string }>('/auth/qr/create');
}

/** 轮询二维码登录状态 */
export async function pollQrApi(ticket: string) {
  return requestClient.get<{
    ticket: string;
    status: string;
    accessToken?: string;
  }>('/auth/qr/poll', { params: { ticket } });
}

/** 发送忘记密码验证码（开发期返回 mockCode 便于测试） */
export async function sendResetCodeApi(email: string) {
  return requestClient.post<{ mockCode: string | null }>('/auth/forgot/send', {
    email,
  });
}

/** 校验验证码并重置密码 */
export async function resetPasswordApi(
  email: string,
  code: string,
  newPassword: string,
) {
  return requestClient.post('/auth/forgot/reset', { email, code, newPassword });
}

/** 获取第三方登录授权 URL */
export async function getOAuthUrlApi(provider: string) {
  return requestClient.get<{ url: string }>(`/auth/oauth/${provider}/url`);
}

/** 第三方回调登录（mock：后端直接返回 accessToken） */
export async function oauthCallbackApi(provider: string) {
  return requestClient.get<AuthApi.LoginResult>(
    `/auth/oauth/callback/${provider}`,
    { params: { code: 'mock', state: 'STATE' } },
  );
}

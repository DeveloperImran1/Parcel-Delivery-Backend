import { Response } from 'express';

export interface AuthTokens {
  refreshToken?: string;
  accessToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  // refresh token jemon rakhlam, thik temoni access token kew cookie te rakhbo. Bivinno somoi need porbe.
  if (tokenInfo.accessToken) {
    res.cookie('accessToken', tokenInfo.accessToken, {
      httpOnly: true,
      // secure: envVars.NODE_ENV === 'production',  // dev mode a ai line comment kore, secure true kore dibo.
      secure: true,
      sameSite: 'none', // deploy korar por ai property add koresi.But localshost a aita thaklew somossa nai maybe.
    });
  }

  // successfully login hole loginInfo er moddhe access-token and refresh-token thakbe. Seikhan theke refresh token ke client side er browser a coockies er moddhe set kore dita hobe. Jehto postman theke try korbo. Tai ai refreshToken postman er coockie teo set hobe.
  if (tokenInfo.refreshToken) {
    res.cookie('refreshToken', tokenInfo.refreshToken, {
      httpOnly: true,
      // secure: envVars.NODE_ENV === 'production',
      secure: true,

      sameSite: 'none',
    });
  }
};

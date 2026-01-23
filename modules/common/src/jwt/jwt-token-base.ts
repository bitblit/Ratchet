/**
 * Defines the common fields expected in a JWT token according to the RFC
 * https://www.rfc-editor.org/rfc/rfc7519.html
 */

export interface JwtTokenBase {
  iss?: string; // Issuer
  sub?: string; // Subject
  aud?: string; // Audience
  exp?: number; // Expiration time
  nbf?: number; // Not Before
  iat?: number; // Issued at (time of creation)
  jti?: string; // Unique ID for the token
  scope?: string; // Space separated string of scopes
}

import { Action, ActionPanel, List } from "@raycast/api";

import { OAuth } from "@raycast/api";

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "Ottomatic",
  providerIcon: "twitter-logo.png",
  description: "Connect to Ottomatic",
});

async function fetchTokens(authRequest: OAuth.AuthorizationRequest, authCode: string): Promise<OAuth.TokenResponse> {
  const params = new URLSearchParams();
  params.append("client_id", "YourClientId");
  params.append("code", authCode);
  params.append("code_verifier", authRequest.codeVerifier);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", authRequest.redirectURI);

  const response = await fetch("https://clerk.ottomatic.cloud/oauth/token", {
    method: "POST",
    body: params,
  });
  if (!response.ok) {
    console.error("fetch tokens error:", await response.text());
    throw new Error(response.statusText);
  }
  return (await response.json()) as OAuth.TokenResponse;
}

export default function FavoritesList() {
  return (
    <List
      actions={
        <ActionPanel>
          <Action
            title="Auth"
            onAction={async () => {
              const authRequest = await client.authorizationRequest({
                clientId: "knPOnlv1o1yv2NQf",
                scope: "email private_metadata profile public_metadata",
                endpoint: "https://clerk.ottomatic.cloud/oauth/authorize",
              });
              console.log("authRequest", authRequest);
              const { authorizationCode } = await client.authorize(authRequest);
              console.log("authorizationCode", authorizationCode);
              const tokenResponse = await fetchTokens(authRequest, authorizationCode);
              console.log("tokenResponse", tokenResponse);
              await client.setTokens(tokenResponse);
            }}
          />
        </ActionPanel>
      }
    ></List>
  );
}

import * as fs from 'fs';
import { Credentials } from 'google-auth-library';
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import * as readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKENS_PATH = './secrets/google-tokens.json';
const PROJECT_CONFIG_PATH = './secrets/google.json';

export type AuthorizePolicy = 'always-new' | 'ask' | 'only-saved';

export async function authorizeAsync(policy: AuthorizePolicy) {
  const projectConfig = JSON.parse(
    fs.readFileSync(PROJECT_CONFIG_PATH, 'utf8')
  ) as ProjectConfig;
  const {
    client_secret: clientSecret,
    client_id: clientId,
    redirect_uris: redirectUris,
  } = projectConfig.installed;

  if (policy === 'always-new') {
    clearTokens();
  }

  const authClient = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUris[0]
  );
  authClient.on('tokens', tokens => {
    const currentTokens = loadTokens();
    saveTokens({ ...currentTokens, ...tokens });
  });

  let code = null;
  if (policy === 'always-new' || policy === 'ask') {
    const authUrl = authClient.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    console.log();
    code = await askCodeAsync();
  }

  await trySetCredentials(authClient, code);

  return authClient;
}

function askCodeAsync(): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      'Just enter to use saved tokens or enter the code from that page here to get new tokens: ',
      code => {
        rl.close();
        resolve(code);
      }
    );
  });
}

async function trySetCredentials(authClient: OAuth2Client, code: string) {
  if (code) {
    const response = await authClient.getToken(code);
    saveTokens(response.tokens);
    authClient.setCredentials(response.tokens);
  } else {
    const tokens = loadTokens();
    if (tokens) {
      authClient.setCredentials(tokens);
    }
  }
}

function clearTokens() {
  if (fs.existsSync(TOKENS_PATH)) {
    fs.unlinkSync(TOKENS_PATH);
  }
}

function saveTokens(tokens: Credentials) {
  const json = JSON.stringify({ ...tokens, updated: new Date().toString() });
  fs.writeFileSync(TOKENS_PATH, json, { encoding: 'utf8' });
}

function loadTokens(): Credentials {
  if (!fs.existsSync(TOKENS_PATH)) {
    return null;
  }

  const content = fs.readFileSync(TOKENS_PATH, 'utf8');
  if (!content) {
    return null;
  }

  const tokens = JSON.parse(content) as Credentials;
  if (!tokens) {
    return null;
  }

  return tokens;
}

interface ProjectConfig {
  installed: ProjectCredentials;
}

interface ProjectCredentials {
  client_secret: string;
  client_id: string;
  redirect_uris: string[];
}

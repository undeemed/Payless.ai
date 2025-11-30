import * as vscode from 'vscode';
import { AdsSidebarProvider } from './sidebar/AdsSidebarProvider';
import { ChatPanelProvider } from './chat/ChatPanelProvider';
import { ApiClient } from './api/client';
import { SupabaseAuth } from './auth/supabase';

let apiClient: ApiClient;
let supabaseAuth: SupabaseAuth;
let adsSidebarProvider: AdsSidebarProvider;
let chatPanelProvider: ChatPanelProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log('Payless AI extension is now active!');

  // Initialize services
  apiClient = new ApiClient(context);
  supabaseAuth = new SupabaseAuth(context);

  // Initialize sidebar provider (embeds payless.chat/extension)
  adsSidebarProvider = new AdsSidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('payless-ai.adsView', adsSidebarProvider)
  );

  // Initialize chat panel provider
  chatPanelProvider = new ChatPanelProvider(context, apiClient);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('payless-ai.chatView', chatPanelProvider)
  );

  // Register URI handler for OAuth callback
  context.subscriptions.push(
    vscode.window.registerUriHandler({
      async handleUri(uri: vscode.Uri) {
        if (uri.path === '/auth-callback') {
          const token = await supabaseAuth.handleAuthCallback(uri);
          if (token) {
            await apiClient.setToken(token);
            vscode.window.showInformationMessage('Successfully signed in to Payless AI!');
            chatPanelProvider.refresh();
          }
        }
      },
    })
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('payless-ai.signIn', async () => {
      const token = await supabaseAuth.signInWithGoogle();
      if (token) {
        await apiClient.setToken(token);
        vscode.window.showInformationMessage('Successfully signed in!');
        chatPanelProvider.refresh();
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('payless-ai.signOut', async () => {
      await supabaseAuth.signOut();
      await apiClient.clearToken();
      vscode.window.showInformationMessage('Signed out of Payless AI');
      chatPanelProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('payless-ai.refreshBalance', async () => {
      adsSidebarProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('payless-ai.openChat', async () => {
      await vscode.commands.executeCommand('payless-ai.chatView.focus');
    })
  );

  // Check initial auth state
  checkAuthState();
}

async function checkAuthState() {
  const isSignedIn = await supabaseAuth.isSignedIn();
  if (isSignedIn) {
    const token = await supabaseAuth.getStoredToken();
    if (token) {
      await apiClient.setToken(token);
    }
  }
}

export function deactivate() {
  // Cleanup
}

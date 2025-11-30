import * as vscode from 'vscode';

export class AdsSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'payless-ai.adsView';
  private _view?: vscode.WebviewView;

  constructor(private readonly context: vscode.ExtensionContext) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getHtmlContent();
  }

  public refresh() {
    if (this._view) {
      this._view.webview.html = this.getHtmlContent();
    }
  }

  private getHtmlContent(): string {
    // Get the extension page URL from settings or use default
    const config = vscode.workspace.getConfiguration('payless-ai');
    const extensionPageUrl = config.get<string>('extensionPageUrl') || 'https://payless.chat/extension';

    return `<!DOCTYPE html>
<html lang="en" style="height: 100%; margin: 0; padding: 0;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payless AI</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      height: 100%;
      overflow: hidden;
      background: #1e1e1e;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <iframe 
    src="${extensionPageUrl}" 
    allow="autoplay; encrypted-media"
    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
  ></iframe>
</body>
</html>`;
  }
}

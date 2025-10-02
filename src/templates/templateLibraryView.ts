/**
 * Template Library View - webview for browsing and managing templates
 */

import * as vscode from 'vscode';
import { PromptTemplate, TemplateCategory, ILogger } from '../core/types';
import { TemplateManager } from './templateManager';

export class TemplateLibraryView {
    private static instance: TemplateLibraryView | null = null;
    private panel: vscode.WebviewPanel | undefined;
    private templateManager: TemplateManager;
    private logger: ILogger;
    private context: vscode.ExtensionContext;

    private constructor(context: vscode.ExtensionContext, templateManager: TemplateManager, logger: ILogger) {
        this.context = context;
        this.templateManager = templateManager;
        this.logger = logger;
    }

    static async show(context: vscode.ExtensionContext, templateManager: TemplateManager, logger: ILogger): Promise<void> {
        if (!TemplateLibraryView.instance) {
            TemplateLibraryView.instance = new TemplateLibraryView(context, templateManager, logger);
        }

        await TemplateLibraryView.instance.showPanel();
    }

    private async showPanel(): Promise<void> {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'templateLibrary',
            'Prompt Template Library',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = await this.getWebviewContent();
        
        this.panel.webview.onDidReceiveMessage(
            async (message) => await this.handleMessage(message),
            undefined,
            []
        );

        this.panel.onDidDispose(
            () => {
                this.panel = undefined;
            },
            null,
            []
        );
    }

    private async handleMessage(message: any): Promise<void> {
        try {
            switch (message.command) {
                case 'refresh':
                    await this.refreshView();
                    break;
                    
                case 'createTemplate':
                    await this.createTemplate(message.data);
                    break;
                    
                case 'updateTemplate':
                    await this.updateTemplate(message.data);
                    break;
                    
                case 'deleteTemplate':
                    await this.deleteTemplate(message.id);
                    break;
                    
                case 'useTemplate':
                    await this.useTemplate(message.id);
                    break;
                    
                case 'exportTemplates':
                    await this.exportTemplates();
                    break;
                    
                case 'importTemplates':
                    await this.importTemplates();
                    break;
            }
        } catch (error) {
            this.logger.error('Error handling message', error as Error);
            this.panel?.webview.postMessage({ 
                command: 'error', 
                message: (error as Error).message 
            });
        }
    }

    private async refreshView(): Promise<void> {
        const templates = await this.templateManager.getAllTemplates();
        this.panel?.webview.postMessage({ 
            command: 'templates', 
            data: templates 
        });
    }

    private async createTemplate(data: any): Promise<void> {
        const template = await this.templateManager.createTemplate(data);
        await this.refreshView();
        vscode.window.showInformationMessage(`Template "${template.name}" created!`);
    }

    private async updateTemplate(data: any): Promise<void> {
        const { id, ...updates } = data;
        const template = await this.templateManager.updateTemplate(id, updates);
        await this.refreshView();
        vscode.window.showInformationMessage(`Template "${template.name}" updated!`);
    }

    private async deleteTemplate(id: string): Promise<void> {
        const template = await this.templateManager.getTemplate(id);
        const confirm = await vscode.window.showWarningMessage(
            `Delete template "${template?.name}"?`,
            { modal: true },
            'Delete'
        );

        if (confirm === 'Delete') {
            await this.templateManager.deleteTemplate(id);
            await this.refreshView();
            vscode.window.showInformationMessage('Template deleted!');
        }
    }

    private async useTemplate(id: string): Promise<void> {
        const template = await this.templateManager.getTemplate(id);
        if (!template) {
            return;
        }

        // Extract variables from template
        const variables = this.templateManager.extractVariables(template.content);
        const values: Record<string, string> = {};

        // Show info about what's about to happen
        if (variables.length > 0) {
            const continueAction = await vscode.window.showInformationMessage(
                `This template has ${variables.length} variable${variables.length > 1 ? 's' : ''} to fill in. After completing them, the template will be copied to your clipboard.`,
                'Continue',
                'Cancel'
            );
            
            if (continueAction !== 'Continue') {
                return;
            }
        }

        // Prompt user for variable values
        for (let i = 0; i < variables.length; i++) {
            const variable = variables[i];
            const value = await vscode.window.showInputBox({
                title: `Template: ${template.name} (${i + 1}/${variables.length})`,
                prompt: variable.description || `Enter value for "${variable.name}"`,
                placeHolder: variable.defaultValue || '',
                value: variable.defaultValue || '',
                ignoreFocusOut: true
            });

            if (value === undefined) {
                return; // User cancelled
            }

            values[variable.name] = value;
        }

        // Substitute variables
        const content = this.templateManager.substituteVariables(template.content, values);

        // Copy to clipboard
        await vscode.env.clipboard.writeText(content);
        
        // Increment use count
        await this.templateManager.incrementUseCount(id);

        vscode.window.showInformationMessage(`✅ Template "${template.name}" copied to clipboard! You can now paste it into Cursor chat.`);
    }

    private async exportTemplates(): Promise<void> {
        const templates = await this.templateManager.exportTemplates();
        const json = JSON.stringify(templates, null, 2);

        const uri = await vscode.window.showSaveDialog({
            filters: { 'JSON': ['json'] },
            defaultUri: vscode.Uri.file('prompt-templates.json')
        });

        if (uri) {
            await vscode.workspace.fs.writeFile(uri, Buffer.from(json, 'utf8'));
            vscode.window.showInformationMessage('Templates exported!');
        }
    }

    private async importTemplates(): Promise<void> {
        const uris = await vscode.window.showOpenDialog({
            filters: { 'JSON': ['json'] },
            canSelectMany: false
        });

        if (uris && uris.length > 0) {
            const content = await vscode.workspace.fs.readFile(uris[0]);
            const templates = JSON.parse(content.toString());
            await this.templateManager.importTemplates(templates);
            await this.refreshView();
            vscode.window.showInformationMessage('Templates imported!');
        }
    }

    private async getWebviewContent(): Promise<string> {
        const templates = await this.templateManager.getAllTemplates();
        const categories: TemplateCategory[] = ['refactoring', 'debugging', 'testing', 'documentation', 'optimization', 'general'];

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prompt Template Library</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: 600;
        }
        
        .actions {
            display: flex;
            gap: 10px;
        }
        
        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            border-radius: 2px;
            font-size: 13px;
        }
        
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        button.secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        
        .filters {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 6px 12px;
            background: var(--vscode-button-secondaryBackground);
            border: 1px solid transparent;
        }
        
        .filter-btn.active {
            background: var(--vscode-button-background);
            border-color: var(--vscode-focusBorder);
        }
        
        .search-box {
            width: 100%;
            padding: 8px 12px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            font-size: 13px;
            margin-bottom: 20px;
        }
        
        .templates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
        }
        
        .template-card {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .template-card:hover {
            border-color: var(--vscode-focusBorder);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .template-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 10px;
        }
        
        .template-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--vscode-editor-foreground);
        }
        
        .template-category {
            display: inline-block;
            padding: 2px 8px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border-radius: 10px;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        .template-description {
            color: var(--vscode-descriptionForeground);
            font-size: 13px;
            margin-bottom: 10px;
            line-height: 1.5;
        }
        
        .template-meta {
            display: flex;
            gap: 15px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
        }
        
        .template-actions {
            display: flex;
            gap: 8px;
        }
        
        .template-actions button {
            padding: 4px 10px;
            font-size: 12px;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--vscode-descriptionForeground);
        }
        
        .empty-state h2 {
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            align-items: center;
            justify-content: center;
        }
        
        .modal.active {
            display: flex;
        }
        
        .modal-content {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 20px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 8px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
        }
        
        .form-group textarea {
            min-height: 150px;
            font-family: var(--vscode-editor-font-family);
        }
        
        .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
        }
        
        .tags-input {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 5px;
        }
        
        .tag {
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📚 Prompt Template Library</h1>
        <div class="actions">
            <button onclick="showCreateModal()">+ New Template</button>
            <button class="secondary" onclick="exportTemplates()">Export</button>
            <button class="secondary" onclick="importTemplates()">Import</button>
        </div>
    </div>
    
    <input type="text" class="search-box" placeholder="🔍 Search templates..." oninput="filterTemplates(this.value)">
    
    <div class="filters">
        <button class="filter-btn active" onclick="filterByCategory('all')">All</button>
        ${categories.map(cat => 
            `<button class="filter-btn" onclick="filterByCategory('${cat}')">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`
        ).join('')}
    </div>
    
    <div id="templates-container" class="templates-grid">
        ${this.renderTemplates(templates)}
    </div>
    
    <div id="templateModal" class="modal">
        <div class="modal-content">
            <h2 id="modalTitle">Create New Template</h2>
            <form id="templateForm">
                <input type="hidden" id="templateId">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" id="templateName" required>
                </div>
                <div class="form-group">
                    <label>Category *</label>
                    <select id="templateCategory" required>
                        ${categories.map(cat => 
                            `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" id="templateDescription">
                </div>
                <div class="form-group">
                    <label>Content * (Use {{variableName}} for placeholders)</label>
                    <textarea id="templateContent" required></textarea>
                </div>
                <div class="form-group">
                    <label>Tags (comma-separated)</label>
                    <input type="text" id="templateTags">
                </div>
                <div class="modal-actions">
                    <button type="button" class="secondary" onclick="hideTemplateModal()">Cancel</button>
                    <button type="submit" id="submitBtn">Create Template</button>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        let allTemplates = ${JSON.stringify(templates)};
        let currentFilter = 'all';
        
        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'templates':
                    allTemplates = message.data;
                    renderAllTemplates();
                    break;
                case 'error':
                    alert('Error: ' + message.message);
                    break;
            }
        });
        
        function showCreateModal() {
            document.getElementById('modalTitle').textContent = 'Create New Template';
            document.getElementById('submitBtn').textContent = 'Create Template';
            document.getElementById('templateId').value = '';
            document.getElementById('templateForm').reset();
            document.getElementById('templateModal').classList.add('active');
        }
        
        function showEditModal(id) {
            const template = allTemplates.find(t => t.id === id);
            if (!template) return;
            
            document.getElementById('modalTitle').textContent = 'Edit Template';
            document.getElementById('submitBtn').textContent = 'Update Template';
            document.getElementById('templateId').value = template.id;
            document.getElementById('templateName').value = template.name;
            document.getElementById('templateCategory').value = template.category;
            document.getElementById('templateDescription').value = template.description || '';
            document.getElementById('templateContent').value = template.content;
            document.getElementById('templateTags').value = template.tags.join(', ');
            document.getElementById('templateModal').classList.add('active');
        }
        
        function hideTemplateModal() {
            document.getElementById('templateModal').classList.remove('active');
            document.getElementById('templateForm').reset();
        }
        
        function filterByCategory(category) {
            currentFilter = category;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            renderAllTemplates();
        }
        
        function filterTemplates(query) {
            const filtered = allTemplates.filter(t => 
                t.name.toLowerCase().includes(query.toLowerCase()) ||
                (t.description && t.description.toLowerCase().includes(query.toLowerCase())) ||
                t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            );
            renderTemplates(filtered);
        }
        
        function renderAllTemplates() {
            const filtered = currentFilter === 'all' 
                ? allTemplates 
                : allTemplates.filter(t => t.category === currentFilter);
            renderTemplates(filtered);
        }
        
        function renderTemplates(templates) {
            const container = document.getElementById('templates-container');
            if (templates.length === 0) {
                container.innerHTML = \`
                    <div class="empty-state">
                        <h2>No templates found</h2>
                        <p>Create your first template to get started!</p>
                    </div>
                \`;
                return;
            }
            
            container.innerHTML = templates.map(t => \`
                <div class="template-card">
                    <div class="template-header">
                        <h3 class="template-title">\${t.name}</h3>
                        <span class="template-category">\${t.category}</span>
                    </div>
                    \${t.description ? \`<p class="template-description">\${t.description}</p>\` : ''}
                    <div class="template-meta">
                        <span>📊 Used: \${t.useCount} times</span>
                        <span>📅 \${new Date(t.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="template-actions">
                        <button onclick='useTemplate("\${t.id}")'>Use Template</button>
                        <button class="secondary" onclick='showEditModal("\${t.id}")'>Edit</button>
                        <button class="secondary" onclick='deleteTemplate("\${t.id}")'>Delete</button>
                    </div>
                </div>
            \`).join('');
        }
        
        function useTemplate(id) {
            vscode.postMessage({ command: 'useTemplate', id });
        }
        
        function deleteTemplate(id) {
            vscode.postMessage({ command: 'deleteTemplate', id });
        }
        
        function exportTemplates() {
            vscode.postMessage({ command: 'exportTemplates' });
        }
        
        function importTemplates() {
            vscode.postMessage({ command: 'importTemplates' });
        }
        
        document.getElementById('templateForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('templateId').value;
            const name = document.getElementById('templateName').value;
            const category = document.getElementById('templateCategory').value;
            const description = document.getElementById('templateDescription').value;
            const content = document.getElementById('templateContent').value;
            const tagsInput = document.getElementById('templateTags').value;
            const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
            
            if (id) {
                // Update existing template
                vscode.postMessage({
                    command: 'updateTemplate',
                    data: { id, name, category, description, content, tags, variables: [] }
                });
            } else {
                // Create new template
                vscode.postMessage({
                    command: 'createTemplate',
                    data: { name, category, description, content, tags, variables: [] }
                });
            }
            
            hideTemplateModal();
        });
        
        renderAllTemplates();
    </script>
</body>
</html>`;
    }

    private renderTemplates(templates: PromptTemplate[]): string {
        if (templates.length === 0) {
            return `
                <div class="empty-state">
                    <h2>No templates found</h2>
                    <p>Create your first template to get started!</p>
                </div>
            `;
        }

        return templates.map(t => `
            <div class="template-card">
                <div class="template-header">
                    <h3 class="template-title">${t.name}</h3>
                    <span class="template-category">${t.category}</span>
                </div>
                ${t.description ? `<p class="template-description">${t.description}</p>` : ''}
                <div class="template-meta">
                    <span>📊 Used: ${t.useCount} times</span>
                    <span>📅 ${new Date(t.updatedAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }
}


/**
 * Template Manager - handles CRUD operations for prompt templates
 */

import * as vscode from 'vscode';
import { PromptTemplate, TemplateCategory, ITemplateManager, ILogger, TemplateVariable } from '../core/types';

export class TemplateManager implements ITemplateManager {
    private static readonly STORAGE_KEY = 'cursorHelper.promptTemplates';
    private static readonly INITIALIZED_KEY = 'cursorHelper.templatesInitialized';
    private context: vscode.ExtensionContext;
    private logger: ILogger;

    constructor(context: vscode.ExtensionContext, logger: ILogger) {
        this.context = context;
        this.logger = logger;
        this.initializeDefaultTemplates();
    }

    /**
     * Initializes default templates on first use
     */
    private async initializeDefaultTemplates(): Promise<void> {
        const initialized = this.context.globalState.get<boolean>(TemplateManager.INITIALIZED_KEY, false);
        
        if (!initialized) {
            const { DEFAULT_TEMPLATES } = await import('./defaultTemplates');
            
            for (const template of DEFAULT_TEMPLATES) {
                await this.createTemplate(template);
            }
            
            await this.context.globalState.update(TemplateManager.INITIALIZED_KEY, true);
            this.logger.info('Initialized default templates');
        }
    }

    /**
     * Creates a new template
     */
    async createTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>): Promise<PromptTemplate> {
        const templates = await this.getAllTemplates();
        
        const newTemplate: PromptTemplate = {
            ...template,
            id: this.generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
            useCount: 0
        };

        templates.push(newTemplate);
        await this.saveTemplates(templates);
        
        this.logger.info(`Created template: ${newTemplate.name}`);
        return newTemplate;
    }

    /**
     * Updates an existing template
     */
    async updateTemplate(id: string, updates: Partial<Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PromptTemplate> {
        const templates = await this.getAllTemplates();
        const index = templates.findIndex(t => t.id === id);
        
        if (index === -1) {
            throw new Error(`Template not found: ${id}`);
        }

        const updatedTemplate: PromptTemplate = {
            ...templates[index],
            ...updates,
            updatedAt: new Date()
        };

        templates[index] = updatedTemplate;
        await this.saveTemplates(templates);
        
        this.logger.info(`Updated template: ${updatedTemplate.name}`);
        return updatedTemplate;
    }

    /**
     * Deletes a template
     */
    async deleteTemplate(id: string): Promise<void> {
        const templates = await this.getAllTemplates();
        const filtered = templates.filter(t => t.id !== id);
        
        if (filtered.length === templates.length) {
            throw new Error(`Template not found: ${id}`);
        }

        await this.saveTemplates(filtered);
        this.logger.info(`Deleted template: ${id}`);
    }

    /**
     * Gets a single template by ID
     */
    async getTemplate(id: string): Promise<PromptTemplate | undefined> {
        const templates = await this.getAllTemplates();
        return templates.find(t => t.id === id);
    }

    /**
     * Gets all templates
     */
    async getAllTemplates(): Promise<PromptTemplate[]> {
        const stored = this.context.globalState.get<any[]>(TemplateManager.STORAGE_KEY, []);
        
        // Convert stored dates from strings back to Date objects
        return stored.map(t => ({
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt)
        }));
    }

    /**
     * Gets templates by category
     */
    async getTemplatesByCategory(category: TemplateCategory): Promise<PromptTemplate[]> {
        const templates = await this.getAllTemplates();
        return templates.filter(t => t.category === category);
    }

    /**
     * Searches templates by name, description, or tags
     */
    async searchTemplates(query: string): Promise<PromptTemplate[]> {
        const templates = await this.getAllTemplates();
        const lowerQuery = query.toLowerCase();
        
        return templates.filter(t => 
            t.name.toLowerCase().includes(lowerQuery) ||
            t.description?.toLowerCase().includes(lowerQuery) ||
            t.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            t.content.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Increments the use count for a template
     */
    async incrementUseCount(id: string): Promise<void> {
        const templates = await this.getAllTemplates();
        const template = templates.find(t => t.id === id);
        
        if (template) {
            template.useCount++;
            template.updatedAt = new Date();
            await this.saveTemplates(templates);
        }
    }

    /**
     * Exports all templates
     */
    async exportTemplates(): Promise<PromptTemplate[]> {
        return this.getAllTemplates();
    }

    /**
     * Imports templates (merges with existing)
     */
    async importTemplates(templates: PromptTemplate[]): Promise<void> {
        const existing = await this.getAllTemplates();
        const existingIds = new Set(existing.map(t => t.id));
        
        // Only add templates that don't already exist
        const newTemplates = templates.filter(t => !existingIds.has(t.id));
        
        if (newTemplates.length > 0) {
            await this.saveTemplates([...existing, ...newTemplates]);
            this.logger.info(`Imported ${newTemplates.length} templates`);
        }
    }

    /**
     * Parses template content and extracts variable placeholders
     * Format: {{variableName}} or {{variableName:description}} or {{variableName:description:defaultValue}}
     */
    extractVariables(content: string): TemplateVariable[] {
        const regex = /\{\{([^:}]+)(?::([^:}]+))?(?::([^}]+))?\}\}/g;
        const variables: TemplateVariable[] = [];
        const seen = new Set<string>();
        
        let match;
        while ((match = regex.exec(content)) !== null) {
            const name = match[1].trim();
            const description = match[2]?.trim();
            const defaultValue = match[3]?.trim();
            
            if (!seen.has(name)) {
                variables.push({ name, description, defaultValue });
                seen.add(name);
            }
        }
        
        return variables;
    }

    /**
     * Substitutes variables in template content
     */
    substituteVariables(content: string, values: Record<string, string>): string {
        return content.replace(/\{\{([^:}]+)(?::[^}]+)?\}\}/g, (match, name) => {
            const varName = name.trim();
            return values[varName] !== undefined ? values[varName] : match;
        });
    }

    /**
     * Gets the most recently used templates
     */
    async getRecentTemplates(count: number = 5): Promise<PromptTemplate[]> {
        const templates = await this.getAllTemplates();
        return templates
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .slice(0, count);
    }

    /**
     * Gets the most popular templates by use count
     */
    async getPopularTemplates(count: number = 5): Promise<PromptTemplate[]> {
        const templates = await this.getAllTemplates();
        return templates
            .sort((a, b) => b.useCount - a.useCount)
            .slice(0, count);
    }

    /**
     * Saves templates to storage
     */
    private async saveTemplates(templates: PromptTemplate[]): Promise<void> {
        await this.context.globalState.update(TemplateManager.STORAGE_KEY, templates);
    }

    /**
     * Generates a unique ID for a template
     */
    private generateId(): string {
        // Simple ID generation - you can use uuid if preferred
        return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}


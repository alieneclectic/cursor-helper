# Prompt Template Library Guide

The Cursor Helper Template Library allows you to save, organize, and reuse effective prompts with variable substitution for maximum flexibility.

## Features

### 📚 Template Management
- **Create templates** from scratch or from selected text
- **Organize by categories**: Refactoring, Debugging, Testing, Documentation, Optimization, General
- **Tag templates** for easy searching
- **Track usage** to identify your most effective prompts
- **Import/Export** templates to share across projects

### 🔄 Variable Substitution
Templates support dynamic placeholders that prompt you for values when used:

**Syntax:**
- `{{variableName}}` - Simple placeholder
- `{{variableName:description}}` - With description prompt
- `{{variableName:description:defaultValue}}` - With description and default

**Example:**
```
Please refactor {{fileName:Name of file to refactor}} to improve {{goal:Refactoring goal::readability}}.
```

When used, this will prompt:
1. "Name of file to refactor" → user enters value
2. "Refactoring goal" → suggests "readability" as default

## Getting Started

### Opening the Template Library

**Via Command Palette:**
1. Press `Cmd/Ctrl + Shift + P`
2. Type "Template Library"
3. Select "Cursor Helper: Open Template Library"

### Quick Template Insertion

**Via Command Palette:**
- `Cursor Helper: Insert Template` - Browse all templates by category
- `Cursor Helper: Insert Recent Template` - Quick access to recently used templates

### Creating Templates

#### From Scratch (in Template Library):
1. Open Template Library
2. Click "+ New Template"
3. Fill in details:
   - **Name**: Descriptive name
   - **Category**: Choose from dropdown
   - **Description**: Brief explanation (optional)
   - **Content**: Your prompt with `{{variables}}`
   - **Tags**: Comma-separated tags (optional)
4. Click "Create Template"

#### From Selected Text:
1. Select text in your editor
2. Open Command Palette (`Cmd/Ctrl + Shift + P`)
3. Run "Cursor Helper: Create Template from Selection"
4. Follow the prompts to name and categorize

## Using Templates

### Insert a Template

1. Run "Cursor Helper: Insert Template"
2. Browse templates by category
3. Select a template
4. Fill in any variable values
5. Template is inserted at cursor position (or copied to clipboard if no editor is active)

### Managing Templates

**In the Template Library:**
- **Use Template**: Click "Use Template" on any card
- **Delete Template**: Click "Delete" on any card
- **Filter**: Click category buttons or use search box
- **Export All**: Click "Export" to save as JSON
- **Import**: Click "Import" to load templates from JSON file

## Best Practices

### Creating Effective Templates

1. **Be Specific**: Include context and clear instructions
2. **Use Variables Wisely**: Place variables for commonly changing parts
3. **Add Descriptions**: Help future-you remember what each variable means
4. **Set Defaults**: Provide sensible defaults for optional parameters
5. **Structure Clearly**: Use formatting (bullets, sections) for readability

### Template Examples

#### Bug Investigation Template
```
I've encountered a bug in {{fileName:File name}}:

**Expected Behavior:**
{{expectedBehavior:What should happen}}

**Actual Behavior:**
{{actualBehavior:What actually happens}}

Please help me:
1. Identify the root cause
2. Suggest a fix
3. Explain why this happened
```

#### Code Review Template
```
Please review this code for {{purpose:Purpose of the code}}:

**Focus Areas:**
- Code quality and best practices
- Security vulnerabilities
- Performance issues
- {{customFocus:Additional focus areas::Error handling}}

Please provide:
1. Overall assessment
2. Specific issues found
3. Improvement suggestions
```

### Organizing Templates

1. **Use Categories**: Assign appropriate categories for easy browsing
2. **Add Tags**: Use tags for cross-cutting concerns (e.g., "typescript", "security")
3. **Descriptive Names**: Use clear, searchable names
4. **Keep It Updated**: Remove templates you no longer use

## Sharing Templates

### Export Templates
1. Open Template Library
2. Click "Export"
3. Save JSON file
4. Share with team via Git, docs, etc.

### Import Templates
1. Open Template Library
2. Click "Import"
3. Select JSON file
4. Templates are added to your library (duplicates are skipped)

## Default Templates

Cursor Helper includes 8 default templates to get you started:

1. **Bug Fix Investigation** - Systematic bug debugging
2. **Code Refactoring** - Request targeted refactoring
3. **Unit Test Generation** - Generate comprehensive tests
4. **Function Documentation** - Create detailed docs
5. **Performance Optimization** - Analyze and optimize code
6. **Code Review Request** - Thorough code review
7. **API Endpoint Implementation** - Scaffold REST endpoints
8. **React Component Creation** - Create React components

These templates are automatically available when you first use the feature.

## Configuration

Access settings via `Cursor Helper: Open Settings`:

- `cursorHelper.templateLibrary.enabled` - Enable/disable template library (default: true)
- `cursorHelper.templateLibrary.showInCommandPalette` - Show commands in palette (default: true)
- `cursorHelper.templateLibrary.recentTemplatesCount` - Number of recent templates to show (default: 5)

## Tips & Tricks

1. **Quick Access**: Use "Insert Recent Template" for frequently used templates
2. **Keyboard Shortcuts**: Assign keyboard shortcuts to template commands for faster access
3. **Template Chains**: Create templates that build on each other for complex workflows
4. **Version Control**: Keep your exported templates in version control with your projects
5. **Team Standards**: Share templates to standardize team prompts and best practices

## Troubleshooting

**Templates not showing?**
- Check that `templateLibrary.enabled` is true in settings
- Try reloading VS Code window

**Variables not prompting?**
- Ensure variable syntax is correct: `{{name}}` or `{{name:desc}}`
- Check for typos in variable names

**Import failing?**
- Verify JSON file format matches export format
- Check that file is not corrupted

## Support

For issues, feature requests, or questions:
- GitHub: https://github.com/alieneclectic/cursor-helper
- Open an issue with [Template Library] in the title

---

**Pro Tip**: Start by using the default templates and customize them to fit your workflow. This is faster than creating templates from scratch and helps you learn the variable syntax!


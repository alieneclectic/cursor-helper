/**
 * Default prompt templates to help users get started
 */

import { PromptTemplate, TemplateCategory } from '../core/types';

export const DEFAULT_TEMPLATES: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>[] = [
    {
        name: 'Bug Fix Investigation',
        description: 'Systematically investigate and fix a bug',
        category: 'debugging',
        content: `I've encountered a bug in {{fileName:File name}}:

**Expected Behavior:**
{{expectedBehavior:What should happen}}

**Actual Behavior:**
{{actualBehavior:What actually happens}}

**Steps to Reproduce:**
{{steps:Steps to reproduce the issue}}

**Additional Context:**
{{context:Any relevant context or error messages}}

Please help me:
1. Identify the root cause
2. Suggest a fix
3. Explain why this happened
4. Recommend tests to prevent regression`,
        variables: [],
        tags: ['debugging', 'bug-fix', 'troubleshooting']
    },
    {
        name: 'Code Refactoring',
        description: 'Request code refactoring with specific goals',
        category: 'refactoring',
        content: `Please refactor the following code in {{fileName:File or function name}}:

**Current Issues:**
{{issues:What problems need to be addressed}}

**Goals:**
- Improve readability
- Enhance maintainability
- {{customGoal:Any specific refactoring goals::Follow best practices}}

**Constraints:**
{{constraints:Any constraints or requirements::Maintain backward compatibility}}

Please provide:
1. Refactored code
2. Explanation of changes
3. Benefits of the new approach`,
        variables: [],
        tags: ['refactoring', 'code-quality', 'clean-code']
    },
    {
        name: 'Unit Test Generation',
        description: 'Generate comprehensive unit tests for a function or class',
        category: 'testing',
        content: `Please create comprehensive unit tests for {{targetName:Function/Class name}}:

**Test Framework:**
{{framework:Testing framework::Jest}}

**Coverage Goals:**
- Edge cases
- Error handling
- Happy path scenarios
- {{customCoverage:Additional test scenarios::Boundary conditions}}

**Requirements:**
- Use descriptive test names
- Include comments explaining complex test cases
- Aim for {{coverage:Coverage percentage::90%}} code coverage
- Follow AAA pattern (Arrange, Act, Assert)`,
        variables: [],
        tags: ['testing', 'unit-tests', 'quality-assurance']
    },
    {
        name: 'Function Documentation',
        description: 'Generate comprehensive documentation for a function',
        category: 'documentation',
        content: `Please create detailed documentation for the function {{functionName:Function name}}:

**Include:**
- Brief description of purpose
- Parameter descriptions with types
- Return value description
- Usage examples
- Edge cases and error handling
- {{additional:Additional requirements::Performance considerations}}

**Format:**
{{format:Documentation format::JSDoc}}

Please ensure the documentation is:
- Clear and concise
- Suitable for both developers and automated doc generators
- Includes practical examples`,
        variables: [],
        tags: ['documentation', 'comments', 'api-docs']
    },
    {
        name: 'Performance Optimization',
        description: 'Analyze and optimize code performance',
        category: 'optimization',
        content: `Please analyze and optimize the performance of {{target:Code section or file}}:

**Current Performance Issue:**
{{issue:Describe the performance problem}}

**Metrics:**
- Current: {{currentMetric:Current performance metric}}
- Target: {{targetMetric:Target performance goal}}

**Constraints:**
{{constraints:Any constraints::Must maintain existing API}}

Please provide:
1. Performance bottleneck analysis
2. Optimization recommendations with code examples
3. Expected performance improvements
4. Trade-offs to consider
5. Benchmarking suggestions`,
        variables: [],
        tags: ['optimization', 'performance', 'efficiency']
    },
    {
        name: 'Code Review Request',
        description: 'Request a thorough code review',
        category: 'general',
        content: `Please review this code for {{purpose:Purpose of the code}}:

**Focus Areas:**
- Code quality and best practices
- Security vulnerabilities
- Performance issues
- Error handling
- {{customFocus:Additional focus areas::Accessibility}}

**Context:**
{{context:Additional context about the code}}

Please provide:
1. Overall assessment
2. Specific issues found (with severity ratings)
3. Improvement suggestions with code examples
4. Positive aspects worth highlighting`,
        variables: [],
        tags: ['code-review', 'quality', 'best-practices']
    },
    {
        name: 'API Endpoint Implementation',
        description: 'Scaffold a new API endpoint with best practices',
        category: 'general',
        content: `Please implement a new API endpoint:

**Endpoint Details:**
- Method: {{method:HTTP method::GET}}
- Path: {{path:API path::/api/v1/}}
- Purpose: {{purpose:What this endpoint does}}

**Requirements:**
- Input validation
- Error handling
- Authentication/Authorization: {{auth:Auth requirements::JWT}}
- Response format: {{format:Response format::JSON}}
- {{additional:Additional requirements::Rate limiting}}

**Framework:**
{{framework:Backend framework::Express}}

Please include:
1. Route handler implementation
2. Input validation schema
3. Error handling
4. Tests
5. API documentation`,
        variables: [],
        tags: ['api', 'backend', 'rest', 'endpoints']
    },
    {
        name: 'React Component Creation',
        description: 'Create a new React component with TypeScript',
        category: 'general',
        content: `Please create a React component named {{componentName:Component name}}:

**Purpose:**
{{purpose:What this component does}}

**Props:**
{{props:List of props and their types}}

**Requirements:**
- TypeScript
- Functional component with hooks
- {{styling:Styling approach::CSS modules}}
- Accessibility (a11y) best practices
- {{additional:Additional requirements::Responsive design}}

**State Management:**
{{stateManagement:State management approach::Local useState}}

Please include:
1. Component implementation
2. Props interface
3. Basic styling
4. Usage example
5. Unit tests`,
        variables: [],
        tags: ['react', 'typescript', 'frontend', 'component']
    }
];


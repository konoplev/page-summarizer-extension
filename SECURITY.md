# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Fully supported |

## Reporting a Vulnerability

The Page Summarizer extension team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories** (preferred): Use the "Security" tab in this repository to create a private security advisory
2. **Email**: Send details to the repository owner through their website contact form at https://konoplev.me
3. **GitHub Issues**: For non-sensitive security improvements, you may use public issues with the "security" label

### What to Include

When reporting a security vulnerability, please include:

- Type of issue (e.g. XSS, injection, privilege escalation, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Acknowledgment**: We'll acknowledge receipt of your vulnerability report within 48 hours
- **Initial Assessment**: We'll provide an initial assessment within 5 business days
- **Updates**: We'll keep you informed of our progress throughout the investigation
- **Resolution**: We aim to resolve security issues within 30 days of initial report

### Security Considerations

#### Extension-Specific Security

- **API Key Storage**: Your OpenAI API key is stored locally in your browser using secure storage APIs
- **Data Processing**: Page content is sent to OpenAI for processing - ensure you understand OpenAI's privacy policy
- **Permissions**: The extension requests minimal permissions necessary for functionality
- **No Tracking**: The extension does not collect analytics or tracking data

#### Common Security Scenarios

- **Content Injection**: The extension processes web page content - malicious pages could potentially cause issues
- **API Key Exposure**: While stored securely, users should protect their OpenAI API keys
- **Cross-Site Scripting**: The extension injects content into web pages and displays summaries

### Scope

This security policy applies to:

- The Page Summarizer extension code
- Build scripts and development tools
- Documentation and configuration files

Out of scope:
- Third-party dependencies (report to respective maintainers)
- OpenAI API issues (report to OpenAI)
- Browser-specific security issues (report to browser vendors)

### Safe Harbor

We consider security research conducted under this policy to be:

- Authorized concerning the Computer Fraud and Abuse Act
- Authorized concerning similar laws of other countries
- Exempt from DMCA takedown notices

As long as you:
- Make a good faith effort to avoid privacy violations and disruption to others
- Only interact with accounts you own or have explicit permission to access
- Do not access or modify user data without permission
- Give us reasonable time to resolve vulnerabilities before disclosure

### Recognition

We believe in recognizing security researchers who help keep our users safe:

- We'll acknowledge your contribution in our security acknowledgments (unless you prefer to remain anonymous)
- For significant findings, we may include recognition in release notes
- We encourage responsible disclosure and will work with you on disclosure timing

Thank you for helping keep Page Summarizer and our users safe!

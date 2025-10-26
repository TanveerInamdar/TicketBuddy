# GitHub Integration - Permissions and Setup Guide

## Overview

This document outlines the required permissions and configuration for the GitHub integration to function properly.

## Authentication Methods

You can authenticate with GitHub using either:
1. **Personal Access Token (PAT)** - Simpler, recommended for single-user or small team setups
2. **GitHub App** - More secure, recommended for production and organization-wide deployments

---

## Option 1: Personal Access Token (PAT)

### Required Scopes

When creating a Personal Access Token, you must grant the following scopes:

#### Minimum Required Scopes:
- ✅ **`repo`** (Full control of private repositories)
  - Includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
  - **Why needed:** Read and write access to pull requests, issues, and repository content

#### What Each Permission Enables:
- **Pull Requests**: Read, create, merge, and close PRs
- **Issues**: Read, create, update, and comment on issues
- **Repository Content**: Read repository metadata and webhooks
- **Status Checks**: View CI/CD status for branch protection

### Creating a PAT

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: `RowdyHacks Edge Worker`
4. Select expiration (recommend: 90 days, with calendar reminder to rotate)
5. Check the **`repo`** scope checkbox
6. Click "Generate token"
7. **⚠️ Copy the token immediately** - you won't see it again!
8. Add to your Cloudflare Worker environment as `GITHUB_TOKEN`

### Wrangler Configuration

```bash
# For local development
wrangler secret put GITHUB_TOKEN

# For production
wrangler secret put GITHUB_TOKEN --env production
```

Or add to `wrangler.toml`:
```toml
[vars]
# Public variables
API_ENDPOINT = "https://api.github.com"

# Secrets (set via wrangler secret put)
# GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxx"
# GITHUB_WEBHOOK_SECRET = "your-webhook-secret"
```

---

## Option 2: GitHub App (Recommended for Production)

### Required Permissions

When creating a GitHub App, configure the following **Repository Permissions**:

| Permission | Access Level | Purpose |
|------------|--------------|---------|
| **Pull requests** | Read & Write | Merge PRs, read PR data, create/update PRs |
| **Issues** | Read & Write | Create, update, close issues, add comments |
| **Contents** | Read | Access repository metadata, read files |
| **Metadata** | Read | Access basic repository info (automatic) |

### Optional Permissions for Enhanced Features:

| Permission | Access Level | Purpose |
|------------|--------------|---------|
| **Commit statuses** | Read | View CI/CD status checks |
| **Deployments** | Read | Track deployment events |
| **Webhooks** | Read & Write | Manage webhook configuration |

### Webhook Events to Subscribe To:

Enable these webhook events for real-time updates:

- ✅ **Pull request** - All PR activity (opened, closed, merged, edited, etc.)
- ✅ **Issues** - Issue activity (opened, closed, edited, labeled, etc.)
- ✅ **Push** - Track commits to branches
- ✅ **Workflow run** - CI/CD pipeline status updates

### Creating a GitHub App

1. Go to GitHub → Settings → Developer settings → GitHub Apps → New GitHub App

2. **Basic Information:**
   - App name: `RowdyHacks Edge Dashboard`
   - Homepage URL: `https://your-dashboard.pages.dev`
   - Webhook URL: `https://your-worker.workers.dev/github/webhook`
   - Webhook secret: Generate a strong secret (see below)

3. **Permissions:** Set as listed in table above

4. **Subscribe to events:** Select events listed above

5. **Where can this GitHub App be installed?**
   - Choose "Only on this account" for private use
   - Or "Any account" for public distribution

6. **Create the app** and note:
   - App ID
   - Client ID
   - Generate and download a private key

7. **Install the app** on your repositories

### Authentication with GitHub App

```typescript
// Generate JWT for app authentication
// Then exchange for installation access token
// Implementation varies - see GitHub App docs
```

---

## Webhook Configuration

### Webhook Secret

**⚠️ Critical for Security:** Always use a webhook secret to verify webhook authenticity.

#### Generate a Strong Secret:

```bash
# Generate a secure random secret
openssl rand -hex 32
```

Or use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Configure in Wrangler:

```bash
wrangler secret put GITHUB_WEBHOOK_SECRET
```

Enter the same secret you configured in:
- GitHub Repository → Settings → Webhooks → Secret
- Or GitHub App → Webhook secret

### Repository Webhook Setup

If not using a GitHub App, configure webhooks manually:

1. Go to Repository → Settings → Webhooks → Add webhook
2. **Payload URL**: `https://your-worker.workers.dev/github/webhook`
3. **Content type**: `application/json`
4. **Secret**: Your generated webhook secret
5. **Which events?** Select:
   - Pull requests
   - Issues
   - Pushes (optional)
   - Workflow runs (optional)
6. **Active**: ✅ Checked

### Webhook Security

The worker verifies webhooks using HMAC SHA-256:

```typescript
// Signature format from GitHub
X-Hub-Signature-256: sha256=<hmac_hex_digest>

// Worker validates by:
// 1. Computing HMAC-SHA256(webhook_secret, request_body)
// 2. Comparing with X-Hub-Signature-256 header
// 3. Rejecting if signatures don't match
```

**Security Notes:**
- ⚠️ Never commit secrets to git
- ⚠️ Rotate secrets every 90 days
- ⚠️ Use different secrets for dev/staging/production
- ⚠️ Monitor webhook delivery logs in GitHub

---

## Branch Protection Settings (Optional but Recommended)

For production repositories, configure branch protection:

### Recommended Settings for `main` branch:

- ✅ **Require a pull request before merging**
  - Require approvals: 1+
  - Dismiss stale reviews when new commits are pushed
  
- ✅ **Require status checks to pass before merging**
  - Select your CI/CD checks
  - Require branches to be up to date
  
- ✅ **Require conversation resolution before merging**

- ✅ **Do not allow bypassing the above settings**

### How Branch Protection Affects the Integration:

When branch protection is enabled, the merge endpoint will return clear errors:

| Protection | Error Message |
|------------|---------------|
| Required checks failing | "Branch protection: Required status checks must pass before merging" |
| Missing required reviews | "Branch protection: Required reviews must be approved before merging" |
| Merge conflicts | "Pull Request is not mergeable (likely due to conflicts)" |
| Outdated branch | "Head branch was modified. Review and try the merge again." |

---

## Environment Variables Reference

### Required:

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
# OR for GitHub App:
# GITHUB_APP_ID=123456
# GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."

GITHUB_WEBHOOK_SECRET=your-webhook-secret-here
```

### Optional:

```bash
# GitHub API endpoint (defaults to api.github.com)
GITHUB_API_ENDPOINT=https://api.github.com

# Rate limit tracking
GITHUB_RATE_LIMIT_REMAINING=5000
```

---

## Cloudflare D1 Binding

Ensure your `wrangler.toml` includes:

```toml
[[d1_databases]]
binding = "DB"
database_name = "edge-mcp-db"
database_id = "your-database-id"
```

Run migrations:
```bash
wrangler d1 migrations apply edge-mcp-db --remote
```

---

## Testing Permissions

### Verify PAT Permissions:

```bash
# Test authentication
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Test repository access
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/OWNER/REPO

# Test PR merge capability
curl -X PUT \
  -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/pulls/1/merge
```

### Verify Webhook Delivery:

1. Go to Repository → Settings → Webhooks → Your webhook
2. Check "Recent Deliveries" tab
3. Look for successful 200 responses
4. Click on delivery to see request/response details

### Test Integration:

1. **Link a repository:**
   ```bash
   POST /github/link
   { "repo": "owner/repo" }
   ```

2. **Create a test PR** on GitHub

3. **Verify webhook received:**
   - Check Cloudflare Worker logs: `wrangler tail`
   - Verify PR appears in dashboard

4. **Merge PR via dashboard:**
   - Should succeed if all permissions are correct
   - Check for clear error if branch protection blocks

---

## Troubleshooting

### "Bad credentials" Error

- ✅ Verify GITHUB_TOKEN is set correctly
- ✅ Check token hasn't expired
- ✅ Ensure `repo` scope is enabled
- ✅ Try generating a new token

### "Not Found" Error

- ✅ Verify repository exists and is accessible
- ✅ Check token has access to the repository
- ✅ For private repos, ensure PAT has `repo` scope (not just `public_repo`)

### "Validation Failed" on Merge

- ✅ Check branch protection requirements
- ✅ Verify CI/CD checks have passed
- ✅ Ensure required reviews are approved
- ✅ Check for merge conflicts

### Webhook Not Receiving Events

- ✅ Verify webhook URL is correct
- ✅ Check webhook secret matches
- ✅ Look at "Recent Deliveries" in GitHub webhook settings
- ✅ Ensure worker is deployed and accessible

### "Forbidden" Error

- ✅ Token lacks required permissions
- ✅ Repository may have additional restrictions
- ✅ Check organization/enterprise policies

---

## Security Best Practices

1. **Rotate secrets regularly** (every 90 days)
2. **Use separate tokens** for dev/staging/production
3. **Never commit secrets** to version control
4. **Use GitHub App** instead of PAT for production
5. **Enable webhook signature verification** (already implemented)
6. **Monitor webhook delivery logs** for suspicious activity
7. **Limit token scope** to minimum required permissions
8. **Use environment variables** for all secrets
9. **Enable 2FA** on GitHub account that owns the token
10. **Audit token usage** regularly via GitHub settings

---

## Rate Limits

### GitHub API Rate Limits:

- **With PAT:** 5,000 requests/hour per token
- **With GitHub App:** 5,000 requests/hour per installation + 50 for authenticated app

### Rate Limit Headers:

```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1234567890
```

The worker logs these headers for monitoring.

### Handling Rate Limits:

- Worker will receive 403 status with rate limit details
- Implement exponential backoff for retries
- Use conditional requests (`If-None-Match`) when possible
- Schedule polling for off-peak hours

---

## Support and Resources

- **GitHub REST API Docs:** https://docs.github.com/en/rest
- **GitHub Apps Docs:** https://docs.github.com/en/developers/apps
- **Webhooks Guide:** https://docs.github.com/en/webhooks
- **Cloudflare Workers:** https://developers.cloudflare.com/workers/
- **D1 Database:** https://developers.cloudflare.com/d1/

---

## Quick Setup Checklist

- [ ] Generate PAT with `repo` scope OR create GitHub App
- [ ] Add `GITHUB_TOKEN` to Cloudflare Worker secrets
- [ ] Generate webhook secret (32+ characters)
- [ ] Add `GITHUB_WEBHOOK_SECRET` to Worker secrets
- [ ] Configure webhook in GitHub (repository or app)
- [ ] Run D1 migrations
- [ ] Deploy Worker to Cloudflare
- [ ] Test `/github/link` endpoint
- [ ] Create test PR and verify webhook delivery
- [ ] Test PR merge functionality
- [ ] Verify error messages for protected branches
- [ ] Set up monitoring and logging

---

**Last Updated:** October 2024
**Version:** 1.0


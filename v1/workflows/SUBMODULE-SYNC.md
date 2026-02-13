# Submodule Sync Workflow

Automated workflow to check and update Git submodules in pull requests.

## Overview

This workflow:
1. ✅ **Checks** all submodules in every PR
2. 🔍 **Detects** outdated submodules
3. 💬 **Comments** on PR with status table
4. ⏸️ **Pauses** for manual approval per submodule
5. 🔄 **Updates** submodules when approved
6. ✅ **Commits** and pushes changes

## Setup

### 1. Create Environment

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name it: `submodule-update-approval`
4. Add required reviewers (recommended)
5. Click **Save protection rules**

### 2. Enable Workflow

The workflow is already in `.github/workflows/submodule-sync.yml` and will run automatically on PRs.

## How It Works

### Trigger Events

Runs on PRs targeting `main` or `develop` when:
- PR is opened
- New commits are pushed
- PR is reopened

### Workflow Steps

#### 1. Check Submodules

```
✅ Checkout repository with submodules
✅ Parse .gitmodules file
✅ Check each submodule:
   - Fetch latest from remote
   - Compare current vs latest commit
   - Count commits behind
✅ Create output JSON with outdated submodules
```

#### 2. Comment on PR

Creates/updates a single comment:

```markdown
## 🔄 Submodule Sync Status

⚠️ **Outdated Submodules Detected**

2 submodule(s) need updating:

| Submodule | Status | Behind | Actions |
|-----------|--------|--------|-------------|
| **extension-1**<br/>`lib/ext1` | `abc1234` → `def5678` | 3 commits | ⏸️ Awaiting approval |
| **extension-2**<br/>`lib/ext2` | `111aaaa` → `222bbbb` | 5 commits | ⏸️ Awaiting approval |

### 📋 Next Steps

1. Go to the **Actions** tab
2. Find the "Submodule Sync Check" workflow
3. Approve each submodule update individually

> ⚠️ **Manual approval required** for each submodule
```

#### 3. Create Approval Jobs

For each outdated submodule:
- Creates a separate job
- Requires manual approval via environment
- Shows submodule name in job title

#### 4. Update Submodules (After Approval)

When approved:
```bash
cd submodule/path
git fetch origin
git checkout origin/main  # or default branch
cd -
git add submodule/path
git commit -m "chore: update submodule NAME"
git push
```

#### 5. Update PR Comment

Updates the comment to show completion:

```markdown
| **extension-1** | `abc1234` → `def5678` | 3 commits | ✅ Updated |
```

#### 6. Finalize

Adds final status to comment:

```markdown
---

✅ **All submodules updated successfully!**

*Completed: 2026-02-11T23:30:00.000Z*
```

## Usage

### Normal Workflow

1. **Create PR** - Workflow runs automatically
2. **Review comment** - Check which submodules are outdated
3. **Go to Actions tab** - Find the workflow run
4. **Approve updates** - Click "Review deployments" for each submodule
5. **Wait for completion** - Submodules are updated and pushed
6. **Merge PR** - Submodules are now up to date!

### Example Comment Evolution

**Initial:**
```
⚠️ Outdated Submodules Detected
- extension-1: 3 commits behind
- extension-2: 5 commits behind
```

**After approving extension-1:**
```
⚠️ Outdated Submodules Detected
- extension-1: ✅ Updated
- extension-2: ⏸️ Awaiting approval
```

**After all approved:**
```
✅ All submodules updated successfully!
Completed: 2026-02-11T23:30:00.000Z
```

## Configuration

### Change Target Branches

Edit `.github/workflows/submodule-sync.yml`:

```yaml
on:
  pull_request:
    branches:
      - main
      - develop
      - staging  # Add more branches
```

### Skip Approval (Auto-Update)

Remove the `environment:` section from the `sync-submodule` job:

```yaml
sync-submodule:
  name: Update ${{ matrix.name }}
  runs-on: ubuntu-latest
  # Remove these lines:
  # environment:
  #   name: submodule-update-approval
```

**⚠️ Warning:** This auto-updates without approval!

### Custom Commit Message

Edit the commit message in the "Update submodule to latest" step:

```yaml
git commit -m "chore: update submodule ${{ matrix.name }}

Your custom message here
- Path: ${{ matrix.path }}
- Commits: ${{ matrix.behind }}"
```

## Troubleshooting

### "Environment not found"

**Problem:** `submodule-update-approval` environment doesn't exist

**Solution:** Create it in Settings → Environments

### Workflow doesn't run

**Problem:** No .gitmodules file

**Solution:** Add submodules:
```bash
git submodule add <url> <path>
```

### Updates fail to push

**Problem:** Insufficient permissions

**Solution:** Ensure `GITHUB_TOKEN` has write permissions (already configured in workflow)

### Submodule shows as outdated after update

**Problem:** Local cache issue

**Solution:** Re-run the workflow or wait for next commit

## Best Practices

### 1. Review Changes

Always review what commits you're pulling in:
```bash
cd submodule/path
git log HEAD..origin/main
```

### 2. Test Updates

After approving updates, test your application to ensure compatibility.

### 3. Update Gradually

Don't approve all submodules at once - update one, test, then update next.

### 4. Monitor Dependencies

Keep track of breaking changes in submodule repositories.

## Advanced Usage

### Only Check Specific Submodules

Add a filter in the "Parse and check all submodules" step:

```bash
# Only check submodules in specific directory
if [[ "$submodule_path" == lib/extensions/* ]]; then
  # Check logic here
fi
```

### Add Change Preview

Modify the comment to show actual commits:

```javascript
// In the "Create or update PR comment" step
const commits = await github.rest.repos.compareCommits({
  owner: submoduleOwner,
  repo: submoduleRepo,
  base: current,
  head: latest
});

commentBody += `\n**Recent changes:**\n`;
commits.data.commits.forEach(commit => {
  commentBody += `- ${commit.commit.message}\n`;
});
```

### Slack Notifications

Add after the "Update PR comment" step:

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Submodule ${{ matrix.name }} updated in PR #${{ github.event.pull_request.number }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## FAQ

**Q: Can I auto-approve trusted submodules?**  
A: Yes, use branch protection rules or remove the environment for specific submodules.

**Q: What if a submodule has breaking changes?**  
A: Don't approve the update. Fix compatibility first, then update.

**Q: Can I update to a specific commit instead of latest?**  
A: Yes, modify the checkout step to use a specific SHA.

**Q: Does this work with private submodules?**  
A: Yes, if the `GITHUB_TOKEN` has access. For external private repos, add an SSH key or PAT.

**Q: How do I disable for a specific PR?**  
A: Add `[skip submodule-check]` to the PR title or description and check for it in the workflow.

## See Also

- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [GitHub Actions Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)
- [GitHub Actions Matrix Strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)

---

**Last Updated:** February 11, 2026

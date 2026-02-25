# Wrecking Shot

A lightweight browser game inspired by the launch-and-destroy loop of physics demolition games.

## Play locally

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173`

## Where to find the game on GitHub

You usually **won't** see this game directly on your GitHub profile overview page.
It is published as a **GitHub Pages site for this repository**.

After deployment, open:

- `https://<your-username>.github.io/<your-repo-name>/`

Example:

- Repo: `github.com/alex/demo-game`
- Game URL: `https://alex.github.io/demo-game/`

## Enable GitHub Pages deployment

This repo includes a workflow at `.github/workflows/deploy-pages.yml` that deploys the game as a static site.

1. Push this branch to GitHub.
2. In GitHub, open **Settings → Pages**.
3. Ensure **Source** is set to **GitHub Actions**.
4. Open the **Actions** tab and confirm the "Deploy static game to GitHub Pages" workflow ran successfully.
5. Visit:
   - `https://<your-username>.github.io/<your-repo-name>/`

### Important for your current setup

Your current branch is `work`, and the workflow now deploys on pushes to `work`, `main`, and `master`.
So you do **not** need to merge first just to test deployment.

If the page shows 404 right after deploy, wait 1–2 minutes and refresh.

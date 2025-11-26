# Street Jewls Website

Premium JDM parts e-commerce website.

## Quick Start

```bash
npm install
npm run dev     # Start local server at http://localhost:3000
npm run build   # Build to dist/
```

## Project Structure

```
├── .github/workflows/
│   └── ci-cd.yml       # CI/CD pipeline
├── assets/
│   ├── css/
│   │   └── main.css    # Design system
│   ├── js/
│   │   └── main.js     # Core functionality
│   └── images/         # Static images
├── pages/
│   ├── index.html      # Homepage
│   ├── parts.html      # Parts catalog
│   ├── merchandise.html
│   ├── jewls.html      # Build gallery
│   ├── about.html
│   └── contact.html
├── scripts/
│   └── build.js        # Build script
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Lint CSS and JavaScript |
| `npm test` | Run tests |

## CI/CD

The pipeline runs on:

| Event | Actions |
|-------|---------|
| PR to main | Lint → Build → Test → Preview deploy |
| Push to main | Lint → Build → Test → Staging deploy |
| Tag `v*` | Lint → Build → Test → Production deploy |
| Manual | Choose staging or production |

### Required Secrets

- `NETLIFY_AUTH_TOKEN` - Netlify personal access token
- `NETLIFY_SITE_ID` - Site ID from Netlify

### Release Process

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Contact Form

Submits to `/api/v1/contact` endpoint. Falls back to `mailto:` if API unavailable.

Email: TheStreetJewls@gmail.com

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

Proprietary - All rights reserved.

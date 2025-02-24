import { marked } from 'marked';

interface BannerConfig {
  name: string;
  description: string;
  imageUrl: string;
  platform: string;
}

export function generateBannerHTML(config: BannerConfig): string {
  // Convert markdown to HTML
  const formattedDescription = marked.parse(config.description);
  
  // Platform-specific styles
  const platformStyles = {
    facebook: {
      width: '1200px',
      height: '628px',
      fontSize: '18px',
    },
    instagram: {
      width: '1080px',
      height: '1080px',
      fontSize: '16px',
    },
    tiktok: {
      width: '1080px',
      height: '1920px',
      fontSize: '20px',
    },
  }[config.platform] || {
    width: '1200px',
    height: '628px',
    fontSize: '18px',
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.5;
      color: #1a1a1a;
    }

    .banner {
      width: ${platformStyles.width};
      height: ${platformStyles.height};
      position: relative;
      overflow: hidden;
      background: #ffffff;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      padding: 2rem;
    }

    .content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1.5rem;
      font-size: ${platformStyles.fontSize};
    }

    .title {
      font-size: 2.5em;
      font-weight: bold;
      color: #000;
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .description {
      color: #333;
    }

    .description h1 { font-size: 1.8em; margin-bottom: 0.5em; }
    .description h2 { font-size: 1.5em; margin-bottom: 0.5em; }
    .description h3 { font-size: 1.2em; margin-bottom: 0.5em; }
    .description p { margin-bottom: 1em; }
    .description ul, .description ol { margin-left: 1.5em; margin-bottom: 1em; }
    .description li { margin-bottom: 0.5em; }

    .image-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 12px;
    }

    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate {
      animation: fadeIn 0.8s ease-out forwards;
    }
  </style>
</head>
<body>
  <div class="banner">
    <div class="content animate">
      <h1 class="title">${config.name}</h1>
      <div class="description">
        ${formattedDescription}
      </div>
    </div>
    <div class="image-container animate">
      <img src="${config.imageUrl}" alt="${config.name}">
    </div>
  </div>
</body>
</html>`;
}

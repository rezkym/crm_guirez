import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'CRM MindiMedia',
  tagline: 'Enterprise Hotel Management System dengan Clean Architecture',
  favicon: 'img/favicon.ico',

  url: 'http://localhost:3001',
  baseUrl: '/',

  organizationName: 'mindimedia',
  projectName: 'crm-mindimedia',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'id',
    locales: ['id'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'CRM MindiMedia',
      logo: {
        alt: 'CRM MindiMedia Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'http://localhost:3000/api/v1',
          label: 'API',
          position: 'right',
        },
        {
          href: 'https://github.com/mindimedia/crm-mindimedia',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/development/getting-started',
            },
            {
              label: 'Architecture',
              to: '/docs/architecture/clean-architecture',
            },
            {
              label: 'API Reference',
              to: '/docs/api-reference/',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'API Server',
              href: 'http://localhost:3000',
            },
            {
              label: 'Health Check',
              href: 'http://localhost:3000/health',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/mindimedia/crm-mindimedia',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} CRM MindiMedia. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['typescript', 'javascript', 'bash', 'json', 'sql'],
    },
    mermaid: {
      theme: {light: 'default', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

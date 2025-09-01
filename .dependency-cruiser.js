module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'clean-architecture-layers',
      severity: 'error',
      comment: 'Domain layer should not depend on infrastructure or interface layers',
      from: {
        path: '^src/domain'
      },
      to: {
        path: '^src/(controllers|repositories|data|router|core/http)'
      }
    },
    {
      name: 'application-layer-boundaries',
      severity: 'error',
      comment: 'Services should not depend on controllers or routers',
      from: {
        path: '^src/services'
      },
      to: {
        path: '^src/(controllers|router)'
      }
    },
    {
      name: 'infrastructure-isolation',
      severity: 'warn',
      comment: 'Infrastructure components should be isolated',
      from: {
        path: '^src/data'
      },
      to: {
        path: '^src/(controllers|router)'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: [
        'npm',
        'npm-dev',
        'npm-optional',
        'npm-peer',
        'npm-bundled',
        'npm-no-pkg'
      ]
    },
    exclude: {
      path: '(test|spec|node_modules)',
      dynamic: true
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: './tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      mainFields: ['module', 'main', 'types']
    },
    reporterOptions: {
      dot: {
        collapsePattern: [
          'node_modules/[^/]+',
          '^src/core/[^/]+',
          '^src/config/[^/]+'
        ],
        theme: {
          graph: {
            bgcolor: 'transparent',
            fontname: 'Arial',
            fontsize: '14',
            layout: 'dot',
            rankdir: 'TB',
            concentrate: true,
            compound: true
          },
          modules: [
            {
              criteria: { source: '^src/domain' },
              attributes: {
                fillcolor: '#e8f5e9',
                color: '#4caf50',
                fontcolor: '#1b5e20'
              }
            },
            {
              criteria: { source: '^src/services' },
              attributes: {
                fillcolor: '#e3f2fd',
                color: '#2196f3',
                fontcolor: '#0d47a1'
              }
            },
            {
              criteria: { source: '^src/controllers' },
              attributes: {
                fillcolor: '#fff3e0',
                color: '#ff9800',
                fontcolor: '#e65100'
              }
            },
            {
              criteria: { source: '^src/(data|repositories)' },
              attributes: {
                fillcolor: '#fce4ec',
                color: '#e91e63',
                fontcolor: '#880e4f'
              }
            },
            {
              criteria: { source: '^src/rbac' },
              attributes: {
                fillcolor: '#f3e5f5',
                color: '#9c27b0',
                fontcolor: '#4a148c'
              }
            }
          ],
          dependencies: [
            {
              criteria: { resolved: '^src/domain' },
              attributes: {
                color: '#4caf50',
                fontcolor: '#4caf50',
                penwidth: 2
              }
            },
            {
              criteria: { resolved: '^src/services' },
              attributes: {
                color: '#2196f3',
                fontcolor: '#2196f3',
                penwidth: 1.5
              }
            }
          ]
        }
      },
      archi: {
        collapsePattern: '^src/[^/]+',
        theme: {
          graph: {
            bgcolor: 'transparent',
            splines: 'ortho',
            rankdir: 'TB',
            ranksep: '2'
          }
        }
      }
    }
  }
};

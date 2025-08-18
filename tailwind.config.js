import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
  	extend: {
      // Enhanced responsive breakpoints
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Custom breakpoints for medical interfaces
        'mobile': {'max': '767px'},
        'tablet': {'min': '768px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
      },
      
      // Touch target sizes
      spacing: {
        'touch-sm': '36px',
        'touch-md': '44px',
        'touch-lg': '48px',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      
      // Responsive font sizes using clamp
      fontSize: {
        'responsive-xs': 'clamp(0.75rem, 1.5vw, 0.875rem)',
        'responsive-sm': 'clamp(0.875rem, 2vw, 1rem)',
        'responsive-base': 'clamp(1rem, 2.5vw, 1.125rem)',
        'responsive-lg': 'clamp(1.125rem, 3vw, 1.25rem)',
        'responsive-xl': 'clamp(1.25rem, 3.5vw, 1.5rem)',
        'responsive-2xl': 'clamp(1.5rem, 4vw, 2rem)',
        'responsive-3xl': 'clamp(1.875rem, 5vw, 2.5rem)',
        'responsive-4xl': 'clamp(2.25rem, 6vw, 3rem)',
      },
      
      // Medical UI specific colors with better contrast
      colors: {
        // Touch feedback colors
        'touch-feedback': {
          light: 'rgba(59, 130, 246, 0.1)',
          dark: 'rgba(59, 130, 246, 0.2)',
        },
        
        // Medical status colors with accessibility
        'medical': {
          'critical': '#dc2626',
          'warning': '#ea580c',
          'success': '#16a34a',
          'info': '#2563eb',
          'neutral': '#6b7280',
        },

        // Search-specific color scheme
        'search': {
          'primary': 'hsl(212, 100%, 46%)', // Professional blue
          'secondary': 'hsl(341, 75%, 51%)', // Medical accent
          'surface': 'hsl(0, 0%, 98%)', // Clean white surface
          'surface-dark': 'hsl(222, 84%, 5%)', // Dark surface
          'border': 'hsl(214, 32%, 91%)', // Subtle border
          'border-dark': 'hsl(215, 28%, 17%)', // Dark border
        },

        // Glassmorphism design tokens
        'glass': {
          'white': 'rgba(255, 255, 255, 0.25)',
          'white-strong': 'rgba(255, 255, 255, 0.4)',
          'dark': 'rgba(30, 41, 59, 0.25)',
          'dark-strong': 'rgba(30, 41, 59, 0.4)',
          'blue': 'rgba(59, 130, 246, 0.1)',
          'blue-strong': 'rgba(59, 130, 246, 0.2)',
        },

        // Evidence level color coding
        'evidence': {
          'systematic-review': '#10b981', // Strong green
          'meta-analysis': '#059669', // Emerald
          'rct': '#3b82f6', // Blue
          'cohort': '#8b5cf6', // Purple
          'case-control': '#f59e0b', // Amber
          'case-series': '#ef4444', // Red
          'expert-opinion': '#6b7280', // Gray
        },

        // Specialty-specific accent colors
        'specialty': {
          'cardiology': {
            light: '#fef3c7', // Warm yellow light
            DEFAULT: '#d97706', // Amber
            dark: '#92400e', // Dark amber
            accent: '#dc2626', // Red accent for urgency
          },
          'obgyn': {
            light: '#fce7f3', // Pink light
            DEFAULT: '#ec4899', // Pink
            dark: '#be185d', // Dark pink
            accent: '#7c3aed', // Purple accent
          },
          'general': {
            light: '#e0f2fe', // Cyan light
            DEFAULT: '#0891b2', // Cyan
            dark: '#164e63', // Dark cyan
            accent: '#059669', // Emerald accent
          },
        },
        
        // Existing color system
        primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			dark: {
  				DEFAULT: '#1a1b1e',
  				primary: '#1a1b1e',
  				secondary: '#212529',
  				muted: '#adb5bd',
  				border: '#343a40'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
      },
      
      // Font family configuration
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'inter': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },

      // Enhanced container sizes
      maxWidth: {
        'xs': '320px',
        'sm': '384px',
        'md': '448px',
        'lg': '512px',
        'xl': '576px',
        '2xl': '672px',
        '3xl': '768px',
        '4xl': '896px',
        '5xl': '1024px',
        '6xl': '1152px',
        '7xl': '1280px',
        '8xl': '1408px',
        'screen-xs': '480px',
        'screen-sm': '640px',
        'screen-md': '768px',
        'screen-lg': '1024px',
        'screen-xl': '1280px',
        'screen-2xl': '1536px',
      },
      
      // Grid template columns for responsive layouts
      gridTemplateColumns: {
        'auto-fit-xs': 'repeat(auto-fit, minmax(200px, 1fr))',
        'auto-fit-sm': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fit-md': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fit-lg': 'repeat(auto-fit, minmax(350px, 1fr))',
      },
      
      // Enhanced ring sizes for focus states
      ringWidth: {
        'touch': '3px',
        'search': '2px',
      },

      // Search-specific responsive breakpoints
      screens: {
        ...{
          'xs': '480px',
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
          // Custom breakpoints for medical interfaces
          'mobile': {'max': '767px'},
          'tablet': {'min': '768px', 'max': '1023px'},
          'desktop': {'min': '1024px'},
        },
        // Search interface breakpoints
        'search-mobile': {'max': '639px'},
        'search-tablet': {'min': '640px', 'max': '1023px'},
        'search-desktop': {'min': '1024px'},
        'search-wide': {'min': '1440px'},
      },

      // Search-specific spacing
      spacing: {
        ...{
          'touch-sm': '36px',
          'touch-md': '44px',
          'touch-lg': '48px',
          'safe-top': 'env(safe-area-inset-top)',
          'safe-bottom': 'env(safe-area-inset-bottom)',
          'safe-left': 'env(safe-area-inset-left)',
          'safe-right': 'env(safe-area-inset-right)',
        },
        // Search component spacing
        'search-padding': '1.5rem',
        'search-gap': '1rem',
        'search-radius': '0.75rem',
        'filter-height': '3rem',
        'result-spacing': '1.25rem',
      },

      // Glassmorphism backdrop blur
      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
        'glass-strong': '20px',
      },
      
      // Safe area insets
      padding: {
        'safe': 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      
      ringOffsetColor: {
  			dark: '#1a1b1e'
  		},
  		backgroundImage: {
  			'grid-white': 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.3s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			pulse: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Touch feedback animation
        'touch-feedback': 'touchFeedback 0.2s ease-out',
        // Search-specific animations
        'search-pulse': 'searchPulse 2s ease-in-out infinite',
        'result-slide-in': 'resultSlideIn 0.4s ease-out',
        'filter-slide': 'filterSlide 0.3s ease-out',
        'glass-shimmer': 'glassShimmer 3s ease-in-out infinite',
        'evidence-glow': 'evidenceGlow 1.5s ease-in-out infinite alternate',
        'search-bounce': 'searchBounce 0.6s ease-in-out',
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(10px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			pulse: {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '.5'
  				}
  			},
        touchFeedback: {
          '0%': {
            transform: 'scale(1)',
            backgroundColor: 'transparent'
          },
          '50%': {
            transform: 'scale(0.95)',
            backgroundColor: 'var(--touch-feedback-light)'
          },
          '100%': {
            transform: 'scale(1)',
            backgroundColor: 'transparent'
          }
        },
        // Search-specific keyframes
        searchPulse: {
          '0%, 100%': {
            opacity: '0.4',
            transform: 'scale(0.95)'
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1)'
          }
        },
        resultSlideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          }
        },
        filterSlide: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        glassShimmer: {
          '0%': {
            backgroundPosition: '-200% 0'
          },
          '100%': {
            backgroundPosition: '200% 0'
          }
        },
        evidenceGlow: {
          '0%': {
            boxShadow: '0 0 5px rgba(16, 185, 129, 0.3)'
          },
          '100%': {
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)'
          }
        },
        searchBounce: {
          '0%, 20%, 53%, 80%, 100%': {
            transform: 'translateY(0)'
          },
          '40%, 43%': {
            transform: 'translateY(-8px)'
          },
          '70%': {
            transform: 'translateY(-4px)'
          },
          '90%': {
            transform: 'translateY(-2px)'
          }
        }
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    tailwindcssAnimate,
    // Custom responsive utilities plugin
    function({ addUtilities, addComponents, theme }) {
      // Touch target utilities
      addUtilities({
        '.touch-target': {
          minHeight: theme('spacing.touch-md'),
          minWidth: theme('spacing.touch-md'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.touch-target-sm': {
          minHeight: theme('spacing.touch-sm'),
          minWidth: theme('spacing.touch-sm'),
        },
        '.touch-target-lg': {
          minHeight: theme('spacing.touch-lg'),
          minWidth: theme('spacing.touch-lg'),
        },
      });

      // Search-specific utilities
      addUtilities({
        '.glass-surface': {
          backgroundColor: theme('colors.glass.white'),
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-surface-dark': {
          backgroundColor: theme('colors.glass.dark'),
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-surface-strong': {
          backgroundColor: theme('colors.glass.white-strong'),
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.search-focus': {
          outline: 'none',
          ringWidth: theme('ringWidth.search'),
          ringColor: theme('colors.search.primary'),
          ringOffsetWidth: '2px',
        },
        '.evidence-badge': {
          fontSize: '0.75rem',
          fontWeight: '600',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.375rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      });
      
      // Responsive container utilities
      addComponents({
        '.container-responsive': {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: 'clamp(1rem, 5vw, 2rem)',
          paddingRight: 'clamp(1rem, 5vw, 2rem)',
          '@screen sm': {
            maxWidth: theme('maxWidth.screen-sm'),
          },
          '@screen md': {
            maxWidth: theme('maxWidth.screen-md'),
          },
          '@screen lg': {
            maxWidth: theme('maxWidth.screen-lg'),
          },
          '@screen xl': {
            maxWidth: theme('maxWidth.screen-xl'),
          },
          '@screen 2xl': {
            maxWidth: theme('maxWidth.screen-2xl'),
          },
        },
        
        // Search-specific component classes
        '.search-container': {
          maxWidth: theme('maxWidth.7xl'),
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: theme('spacing.search-padding'),
          '@screen search-mobile': {
            padding: theme('spacing.4'),
          },
        },
        
        '.search-input': {
          width: '100%',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          borderRadius: theme('spacing.search-radius'),
          border: `1px solid ${theme('colors.search.border')}`,
          backgroundColor: theme('colors.search.surface'),
          fontSize: theme('fontSize.responsive-base'),
          transition: 'all 0.2s ease-in-out',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.search.primary'),
            boxShadow: `0 0 0 3px ${theme('colors.glass.blue')}`,
          },
          '.dark &': {
            backgroundColor: theme('colors.search.surface-dark'),
            borderColor: theme('colors.search.border-dark'),
          },
        },
        
        '.search-result-card': {
          backgroundColor: theme('colors.card.DEFAULT'),
          borderRadius: theme('spacing.search-radius'),
          padding: theme('spacing.result-spacing'),
          marginBottom: theme('spacing.search-gap'),
          border: `1px solid ${theme('colors.border')}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: theme('boxShadow.lg'),
            transform: 'translateY(-2px)',
          },
          '&.selected': {
            borderColor: theme('colors.search.primary'),
            boxShadow: `0 0 0 2px ${theme('colors.glass.blue')}`,
          },
        },
        
        '.filter-panel': {
          backgroundColor: theme('colors.glass.white'),
          backdropFilter: 'blur(12px)',
          borderRadius: theme('spacing.search-radius'),
          padding: theme('spacing.4'),
          marginBottom: theme('spacing.search-gap'),
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '.dark &': {
            backgroundColor: theme('colors.glass.dark'),
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
      });
      
      // Safe area utilities
      addUtilities({
        '.safe-area-inset': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
      });
    }
  ],
};
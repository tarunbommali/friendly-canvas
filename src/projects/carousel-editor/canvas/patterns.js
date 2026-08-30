/**
 * Background Pattern Generator: Generates SVG DataURL strings for canvas patterns
 *
 * @param {'solid' | 'dots' | 'grid' | 'lines' | 'diagonal' | 'crosshatch'} patternType
 * @param {string} [color='#e2e8f0'] - Pattern stroke/fill color
 * @param {number} [scale=1] - Multiplier for pattern tile size/spacing
 * @returns {string | null} SVG DataURL string or null for solid
 */
export function getPatternDataUrl(patternType, color = "#e2e8f0", scale = 1) {
  if (!patternType || patternType === "solid") return null;

  const svgFor = (patternType) => {
    switch (patternType) {
      case "dots": {
        const size = 30 * scale;
        const r = 1.5 * scale;
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${color}" opacity="0.6"/>
        </svg>`;
      }

      case "grid": {
        const size = 40 * scale;
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${color}" stroke-width="1" opacity="0.5"/>
        </svg>`;
      }

      case "lines": {
        const size = 20 * scale;
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <path d="M0 ${size} L${size} 0" stroke="${color}" stroke-width="1" opacity="0.5"/>
        </svg>`;
      }

      case "diagonal": {
        const size = 20 * scale;
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <path d="M0 ${size} L${size} 0" stroke="${color}" stroke-width="1" opacity="0.5"/>
        </svg>`;
      }

      case "crosshatch": {
        const size = 20 * scale;
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <path d="M0 ${size} L${size} 0 M0 0 L${size} ${size}" stroke="${color}" stroke-width="1" opacity="0.4"/>
        </svg>`;
      }

      default:
        return null;
    }
  };

  const svg = svgFor(patternType);
  if (!svg) return null;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}
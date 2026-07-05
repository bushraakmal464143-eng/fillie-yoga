import re
from pathlib import Path

html = Path("index.html").read_text(encoding="utf-8")
s = html.index('<svg xmlns="http://www.w3.org/2000/svg" style="display:none"')
e = html.index("</svg>", s) + len("</svg>")
svg = html[s:e]

replacements = {
    "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "fill-rule": "fillRule",
    "clip-rule": "clipRule",
}
for old, new in replacements.items():
    svg = svg.replace(old, new)

svg = re.sub(r'\s*aria-hidden="true"', '', svg)
svg = svg.replace('style="display:none"', 'style={{ display: "none" }} aria-hidden="true"')

out = f'''export default function IconSprites() {{
  return (
    {svg}
  );
}}
'''
Path("components/IconSprites.tsx").write_text(out, encoding="utf-8")
print("wrote IconSprites.tsx")

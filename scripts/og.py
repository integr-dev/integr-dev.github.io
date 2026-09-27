"""Social preview images (1200x630) for every post and every project page.

Run after adding or editing a post or project, then commit the results:
    python3 scripts/og.py
Writes public/og/posts/<slug>.png and public/og/projects/<slug>.png in the look of public/og.png.
Needs Pillow and PyYAML. Fonts: Schibsted Grotesk and JetBrains Mono (both SIL OFL) in scripts/fonts.
"""
import glob
import os
import yaml
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'scripts', 'fonts')
W, H = 1200, 630
G = 28
BG = (17, 24, 18)
GRID = (128, 181, 95)
FG = (236, 228, 200)
MUTED = (185, 176, 140)
LINE = (128, 181, 95)
WOOD = (107, 86, 56)
ACC = (232, 213, 106)
MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def font(name, size, weight):
    f = ImageFont.truetype(os.path.join(FONTS, name), size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def frontmatter(path):
    text = open(path, encoding='utf-8').read()
    return yaml.safe_load(text.split('---', 2)[1])


def wrap(draw, text, fnt, width, max_lines):
    """Greedy word wrap; the last line ends in an ellipsis if the text does not fit."""
    words, lines, line = text.split(), [], ''
    for word in words:
        test = f'{line} {word}'.strip()
        if draw.textlength(test, font=fnt) <= width:
            line = test
            continue
        lines.append(line)
        line = word
    lines.append(line)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        while draw.textlength(lines[-1] + '…', font=fnt) > width:
            lines[-1] = lines[-1].rsplit(' ', 1)[0]
        lines[-1] += '…'
    return lines


def base():
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im, 'RGBA')
    for x in range(0, W, 16):
        d.line([(x, 0), (x, H)], fill=GRID + (16,))
    for y in range(0, H, 16):
        d.line([(0, y), (W, y)], fill=GRID + (16,))
    for x in range(0, W, 96):
        d.line([(x, 0), (x, H)], fill=GRID + (32,))
    for y in range(0, H, 96):
        d.line([(0, y), (W, y)], fill=GRID + (32,))
    d.rectangle([G, G, W - G, H - G], outline=WOOD, width=1)
    return im, d


def avatar(im, d, size, x, y):
    av = Image.open(os.path.join(ROOT, 'public', 'img', 'avatar.png')).convert('RGBA').resize((size, size), Image.NEAREST)
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=size // 5, fill=255)
    im.paste(av, (x, y), mask)
    for cx, cy, dx, dy in [(x - 8, y - 8, 1, 1), (x + size + 8, y - 8, -1, 1), (x - 8, y + size + 8, 1, -1), (x + size + 8, y + size + 8, -1, -1)]:
        d.line([(cx, cy), (cx + 12 * dx, cy)], fill=LINE, width=1)
        d.line([(cx, cy), (cx, cy + 12 * dy)], fill=LINE, width=1)


def card(kicker, title, text, footer, out):
    im, d = base()
    x0 = 96
    av = 120
    avatar(im, d, av, W - G - 68 - av, G + 68)
    mono = font('JetBrainsMono.ttf', 22, 400)
    d.text((x0, G + 68), kicker, font=mono, fill=LINE)

    width = W - G - 68 - av - 48 - x0
    size = 84
    while True:
        disp = font('SchibstedGrotesk.ttf', size, 700)
        lines = wrap(d, title, disp, width, 3)
        if len(lines) <= 2 or size <= 60:
            break
        size -= 6
    y = G + 118
    for line in lines:
        d.text((x0, y), line, font=disp, fill=FG)
        y += int(size * 1.12)
    y += 18
    d.line([(x0, y), (x0 + 500, y)], fill=LINE, width=2)
    y += 26
    body = font('SchibstedGrotesk.ttf', 32, 400)
    for line in wrap(d, text, body, W - G - 68 - x0, 3 if len(lines) < 3 else 2):
        d.text((x0, y), line, font=body, fill=MUTED)
        y += 44

    d.rectangle([x0 - 2, H - G - 40, x0 + 10, H - G - 28], fill=ACC)
    d.text((x0 + 22, H - G - 44), footer, font=mono, fill=MUTED)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, optimize=True)
    print('wrote', os.path.relpath(out, ROOT))


def main():
    for path in sorted(glob.glob(os.path.join(ROOT, 'content', 'posts', '*.md'))):
        fm = frontmatter(path)
        if fm.get('draft'):
            continue
        slug = os.path.basename(path)[:-3]
        y, m, day = (int(n) for n in str(fm['date']).split('-'))
        card(f'post · {day} {MONTHS[m - 1]} {y}', fm['title'], fm['summary'],
             f'Erik Reitbauer  ·  integr.is-a.dev/posts/{slug}',
             os.path.join(ROOT, 'public', 'og', 'posts', f'{slug}.png'))

    for path in sorted(glob.glob(os.path.join(ROOT, 'content', 'projects', '*.md'))):
        fm = frontmatter(path)
        if fm['tier'] != 'flagship':
            continue
        slug = os.path.basename(path)[:-3]
        card('project · ' + ', '.join(fm['stack'][:4]), fm['title'], fm['tagline'],
             f'Erik Reitbauer  ·  integr.is-a.dev/projects/{slug}',
             os.path.join(ROOT, 'public', 'og', 'projects', f'{slug}.png'))


if __name__ == '__main__':
    main()

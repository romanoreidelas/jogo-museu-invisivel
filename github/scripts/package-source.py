"""Optional maintainer utility: build a source ZIP without repository identity or local data."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parent.parent
output = root / 'public/downloads/museu-invisivel-github.zip'
output.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for name in ['src', 'public', 'scripts', 'tests', 'docs', '.github']:
        for path in (root / name).rglob('*'):
            if path.is_file() and 'downloads' not in path.relative_to(root).parts and '__pycache__' not in path.parts:
                archive.write(path, path.relative_to(root))
    for name in ['README.md', 'package.json', 'package-lock.json', '.gitignore']:
        archive.write(root / name, name)
print(output)

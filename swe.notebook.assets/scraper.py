import os
import json
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MANIFEST_PATH = os.path.join(BASE_DIR, "manifest.json")
DOWNLOADS_DIR = os.path.join(BASE_DIR, "downloads")

# Free public CDNs for real logos and portraits
ICON_SOURCES = {
    "devicon": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/{name}/{name}-original.svg",
    "simpleicons": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/{name}.svg"
}

def load_manifest():
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

def download_image(img_url, local_dest_path):
    """Downloads an image from a URL and saves it to the specified local path."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SWE-Notebook-Asset-Collector/1.0"
        }
        resp = requests.get(img_url, headers=headers, stream=True, timeout=15)
        resp.raise_for_status()

        os.makedirs(os.path.dirname(local_dest_path), exist_ok=True)
        with open(local_dest_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"[OK] Downloaded: {os.path.basename(local_dest_path)} from {img_url}")
        return True
    except Exception as e:
        print(f"[FAIL] Failed to download {img_url}: {e}")
        return False

def scrape_images_from_page(url, output_folder, max_images=10):
    """Scrapes a webpage, discovers all image tags, and downloads them."""
    os.makedirs(output_folder, exist_ok=True)
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        img_tags = soup.find_all("img")
        print(f"Found {len(img_tags)} image tags at {url}")

        count = 0
        for img in img_tags:
            if count >= max_images:
                break
            src = img.get("src") or img.get("data-src")
            if not src:
                continue

            full_url = urljoin(url, src)
            filename = os.path.basename(urlparse(full_url).path)
            if not filename or "." not in filename:
                filename = f"asset_{int(time.time())}_{count}.jpg"

            dest_path = os.path.join(output_folder, filename)
            if download_image(full_url, dest_path):
                count += 1
                time.sleep(0.5)

        print(f"Completed scraping {count} images from {url}")
    except Exception as e:
        print(f"Scraping error for {url}: {e}")

def fetch_real_tech_logos():
    """Fetches real SVG logos for programming languages, frameworks, databases, and DevOps tools."""
    manifest = load_manifest()
    if not manifest:
        print("Manifest not found.")
        return

    logo_categories = ["6_logos_languages", "7_logos_frameworks", "8_logos_databases", "9_logos_cloud", "10_logos_devops", "11_logos_os", "12_logos_vcs", "13_logos_ai_ml"]
    
    # Mapping placeholder ID to clean icon slug
    icon_slug_map = {
        "logo-python": ("devicon", "python"),
        "logo-javascript": ("devicon", "javascript"),
        "logo-java": ("devicon", "java"),
        "logo-c-language": ("devicon", "c"),
        "logo-cpp": ("devicon", "cplusplus"),
        "logo-csharp": ("devicon", "csharp"),
        "logo-go": ("devicon", "go"),
        "logo-rust": ("devicon", "rust"),
        "logo-swift": ("devicon", "swift"),
        "logo-kotlin": ("devicon", "kotlin"),
        "logo-php": ("devicon", "php"),
        "logo-ruby": ("devicon", "ruby"),
        "logo-typescript": ("devicon", "typescript"),
        "logo-sql": ("simpleicons", "mysql"),
        "logo-html": ("devicon", "html5"),
        "logo-css": ("devicon", "css3"),
        "logo-react": ("devicon", "react"),
        "logo-nextjs": ("devicon", "nextjs"),
        "logo-vue": ("devicon", "vuejs"),
        "logo-angular": ("devicon", "angularjs"),
        "logo-nodejs": ("devicon", "nodejs"),
        "logo-express": ("devicon", "express"),
        "logo-django": ("devicon", "django"),
        "logo-flask": ("devicon", "flask"),
        "logo-spring": ("devicon", "spring"),
        "logo-fastapi": ("devicon", "fastapi"),
        "logo-tailwind": ("devicon", "tailwindcss"),
        "logo-bootstrap": ("devicon", "bootstrap"),
        "logo-jquery": ("devicon", "jquery"),
        "logo-pandas": ("devicon", "pandas"),
        "logo-numpy": ("devicon", "numpy"),
        "logo-matplotlib": ("devicon", "matplotlib"),
        "logo-postgresql": ("devicon", "postgresql"),
        "logo-mysql": ("devicon", "mysql"),
        "logo-mongodb": ("devicon", "mongodb"),
        "logo-redis": ("devicon", "redis"),
        "logo-sqlite": ("devicon", "sqlite"),
        "logo-docker": ("devicon", "docker"),
        "logo-kubernetes": ("devicon", "kubernetes"),
        "logo-nginx": ("devicon", "nginx"),
        "logo-terraform": ("devicon", "terraform"),
        "logo-ansible": ("devicon", "ansible"),
        "logo-prometheus": ("devicon", "prometheus"),
        "logo-grafana": ("devicon", "grafana"),
        "logo-linux": ("devicon", "linux"),
        "logo-windows": ("devicon", "windows8"),
        "logo-apple": ("devicon", "apple"),
        "logo-git": ("devicon", "git"),
        "logo-github": ("devicon", "github"),
        "logo-gitlab": ("devicon", "gitlab"),
        "logo-tensorflow": ("devicon", "tensorflow"),
        "logo-pytorch": ("devicon", "pytorch")
    }

    print("Fetching verified vector icons for tech logos...")
    downloaded = 0
    for ph_id, (source_type, slug) in icon_slug_map.items():
        if source_type == "devicon":
            url = ICON_SOURCES["devicon"].format(name=slug)
        else:
            url = ICON_SOURCES["simpleicons"].format(name=slug)
        
        # Determine taxonomy category directory
        for cat_key in logo_categories:
            cat_dir = os.path.join(BASE_DIR, "taxonomy", cat_key)
            dest_file = os.path.join(cat_dir, f"{ph_id}.real.svg")
            if os.path.exists(cat_dir):
                if download_image(url, dest_file):
                    downloaded += 1
                    break
        time.sleep(0.1)

    print(f"Successfully downloaded {downloaded} official real SVG tech logos!")

if __name__ == "__main__":
    print("SWE Notebook Automated Asset & Logo Harvester")
    fetch_real_tech_logos()

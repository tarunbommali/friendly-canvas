#!/usr/bin/env python3
"""
SWE Notebook - Complete Image Harvester & Diagram Generator
Downloads and generates ALL 30 categories of real assets, photos, logos, and technical diagrams.
"""

import os
import sys
import json
import requests
import time
import re
from urllib.parse import quote
from pathlib import Path
from typing import Dict, List, Optional

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

CURRENT_FILE = Path(__file__).resolve()
ASSETS_DIR = CURRENT_FILE.parent
TRACKS_DIR = ASSETS_DIR / "tracks"
TAXONOMY_DIR = ASSETS_DIR / "taxonomy"

TRACKS_DIR.mkdir(parents=True, exist_ok=True)
TAXONOMY_DIR.mkdir(parents=True, exist_ok=True)

USER_AGENT = "SWENotebook/1.0 (https://swenotebook.dev; contact@swenotebook.dev) Python-Requests/2.31"
HEADERS = {"User-Agent": USER_AGENT}

# 1. WIKIPEDIA REST API HARVESTING TARGETS
WIKIPEDIA_TARGETS = {
    "1_historical_figures": [
        {"wiki": "Charles_Babbage", "label": "charles-babbage", "tracks": ["track_01_why_computers_exist"]},
        {"wiki": "Ada_Lovelace", "label": "ada-lovelace", "tracks": ["track_01_why_computers_exist"]},
        {"wiki": "Alan_Turing", "label": "alan-turing", "tracks": ["track_01_why_computers_exist", "track_02_how_a_computer_works"]},
        {"wiki": "Grace_Hopper", "label": "grace-hopper", "tracks": ["track_03_how_software_became_possible"]},
        {"wiki": "John_von_Neumann", "label": "john-von-neumann", "tracks": ["track_02_how_a_computer_works"]},
        {"wiki": "Douglas_Engelbart", "label": "douglas-engelbart", "tracks": ["track_04_operating_systems"]},
        {"wiki": "Donald_Knuth", "label": "donald-knuth", "tracks": ["track_06_problem_solving_dsa"]},
        {"wiki": "Claude_Shannon", "label": "claude-shannon", "tracks": ["track_02_how_a_computer_works"]},
        {"wiki": "Isaac_Newton", "label": "isaac-newton", "tracks": ["track_06_problem_solving_dsa"]},
        {"wiki": "Gottfried_Wilhelm_Leibniz", "label": "leibniz", "tracks": ["track_01_why_computers_exist", "track_06_problem_solving_dsa"]},
        {"wiki": "ENIAC", "label": "eniac-programmers", "tracks": ["track_01_why_computers_exist"]},
        {"wiki": "Human_computer", "label": "human-computers", "tracks": ["track_01_why_computers_exist"]}
    ],
    "2_tech_pioneers": [
        {"wiki": "Linus_Torvalds", "label": "linus-torvalds", "tracks": ["track_04_operating_systems", "track_14_linux_devops"]},
        {"wiki": "Dennis_Ritchie", "label": "dennis-ritchie", "tracks": ["track_03_how_software_became_possible", "track_14_linux_devops"]},
        {"wiki": "Ken_Thompson", "label": "ken-thompson", "tracks": ["track_03_how_software_became_possible", "track_14_linux_devops"]},
        {"wiki": "Tim_Berners-Lee", "label": "tim-berners-lee", "tracks": ["track_08_networking_fundamentals", "track_09_how_the_web_works"]},
        {"wiki": "Vint_Cerf", "label": "vint-cerf", "tracks": ["track_08_networking_fundamentals", "track_09_how_the_web_works"]},
        {"wiki": "Guido_van_Rossum", "label": "guido-van-rossum", "tracks": ["track_17_data_python"]},
        {"wiki": "Brendan_Eich", "label": "brendan-eich", "tracks": ["track_10_web_development"]},
        {"wiki": "James_Gosling", "label": "james-gosling", "tracks": ["track_05_programming"]},
        {"wiki": "Richard_Stallman", "label": "richard-stallman", "tracks": ["track_04_operating_systems", "track_14_linux_devops"]},
        {"wiki": "Anders_Hejlsberg", "label": "anders-hejlsberg", "tracks": ["track_05_programming", "track_10_web_development"]},
        {"wiki": "Martin_Fowler_(software_engineer)", "label": "martin-fowler", "tracks": ["track_07_software_engineering"]},
        {"wiki": "Brian_Kernighan", "label": "brian-kernighan", "tracks": ["track_03_how_software_became_possible", "track_14_linux_devops"]},
        {"wiki": "Rob_Pike", "label": "rob-pike", "tracks": ["track_03_how_software_became_possible", "track_14_linux_devops"]},
        {"wiki": "Yukihiro_Matsumoto", "label": "yukihiro-matsumoto", "tracks": ["track_05_programming"]},
        {"wiki": "Marc_Andreessen", "label": "marc-andreessen", "tracks": ["track_09_how_the_web_works", "track_10_web_development"]}
    ],
    "3_modern_engineers": [
        {"wiki": "Geoffrey_Hinton", "label": "geoffrey-hinton", "tracks": ["track_18_machine_learning", "track_19_deep_learning"]},
        {"wiki": "Yann_LeCun", "label": "yann-lecun", "tracks": ["track_18_machine_learning", "track_19_deep_learning"]},
        {"wiki": "Yoshua_Bengio", "label": "yoshua-bengio", "tracks": ["track_18_machine_learning", "track_19_deep_learning"]},
        {"wiki": "Demis_Hassabis", "label": "demis-hassabis", "tracks": ["track_20_generative_ai", "track_21_ai_agents"]},
        {"wiki": "Sam_Altman", "label": "sam-altman", "tracks": ["track_20_generative_ai", "track_21_ai_agents"]},
        {"wiki": "Ilya_Sutskever", "label": "ilya-sutskever", "tracks": ["track_19_deep_learning", "track_20_generative_ai", "track_21_ai_agents"]},
        {"wiki": "Dario_Amodei", "label": "dario-amodei", "tracks": ["track_20_generative_ai", "track_21_ai_agents"]}
    ],
    "4_hardware_images": [
        {"wiki": "Microprocessor", "label": "cpu-die", "tracks": ["track_02_how_a_computer_works"]},
        {"wiki": "Graphics_processing_unit", "label": "gpu-card", "tracks": ["track_02_how_a_computer_works", "track_19_deep_learning"]},
        {"wiki": "Random-access_memory", "label": "ram-stick", "tracks": ["track_02_how_a_computer_works"]},
        {"wiki": "Motherboard", "label": "motherboard", "tracks": ["track_02_how_a_computer_works"]},
        {"wiki": "Solid-state_drive", "label": "nvme-ssd", "tracks": ["track_02_how_a_computer_works"]},
        {"wiki": "Hard_disk_drive", "label": "hdd-platters", "tracks": ["track_02_how_a_computer_works"]},
        {"wiki": "Transistor", "label": "transistor-macro", "tracks": ["track_02_how_a_computer_works"]},
        {"wiki": "Data_center", "label": "data-center-rack", "tracks": ["track_14_linux_devops", "track_15_cloud_computing"]},
        {"wiki": "Curta", "label": "curta-calculator", "tracks": ["track_01_why_computers_exist"]},
        {"wiki": "Vacuum_tube", "label": "vacuum-tube", "tracks": ["track_01_why_computers_exist", "track_02_how_a_computer_works"]},
        {"wiki": "Fiber-optic_cable", "label": "fiber-optic-cable", "tracks": ["track_08_networking_fundamentals", "track_09_how_the_web_works"]},
        {"wiki": "Wafer_(electronics)", "label": "silicon-wafer", "tracks": ["track_02_how_a_computer_works"]}
    ],
    "5_vintage_computers": [
        {"wiki": "ENIAC", "label": "eniac-machine", "tracks": ["track_01_why_computers_exist"]},
        {"wiki": "Altair_8800", "label": "altair-8800", "tracks": ["track_01_why_computers_exist"]},
        {"wiki": "Apple_I", "label": "apple-i", "tracks": ["track_01_why_computers_exist"]},
        {"wiki": "IBM_Personal_Computer", "label": "ibm-pc-5150", "tracks": ["track_01_why_computers_exist"]},
        {"wiki": "IBM_System/360", "label": "ibm-mainframe", "tracks": ["track_01_why_computers_exist"]},
        {"wiki": "Punched_card", "label": "punch-cards", "tracks": ["track_01_why_computers_exist", "track_03_how_software_became_possible"]},
        {"wiki": "Abacus", "label": "abacus", "tracks": ["track_01_why_computers_exist"]},
        {"wiki": "VT100", "label": "vt100-terminal", "tracks": ["track_01_why_computers_exist", "track_04_operating_systems"]},
        {"wiki": "Magnetic-core_memory", "label": "magnetic-core-memory", "tracks": ["track_02_how_a_computer_works"]},
        {"wiki": "Cathode-ray_tube", "label": "crt-monitor", "tracks": ["track_01_why_computers_exist"]}
    ]
}

# 2. LOGOS FROM CDN (Devicon & SimpleIcons)
ALL_LOGOS = [
    # Languages
    ("python", "6_logos_languages", "python-logo", ["track_03_how_software_became_possible", "track_05_programming", "track_17_data_python"]),
    ("javascript", "6_logos_languages", "javascript-logo", ["track_03_how_software_became_possible", "track_05_programming", "track_10_web_development"]),
    ("java", "6_logos_languages", "java-logo", ["track_03_how_software_became_possible", "track_05_programming"]),
    ("c", "6_logos_languages", "c-logo", ["track_03_how_software_became_possible", "track_05_programming"]),
    ("cplusplus", "6_logos_languages", "cpp-logo", ["track_03_how_software_became_possible", "track_05_programming"]),
    ("csharp", "6_logos_languages", "csharp-logo", ["track_03_how_software_became_possible", "track_05_programming"]),
    ("go", "6_logos_languages", "go-logo", ["track_03_how_software_became_possible", "track_05_programming"]),
    ("rust", "6_logos_languages", "rust-logo", ["track_03_how_software_became_possible", "track_05_programming"]),
    ("swift", "6_logos_languages", "swift-logo", ["track_03_how_software_became_possible", "track_05_programming"]),
    ("kotlin", "6_logos_languages", "kotlin-logo", ["track_03_how_software_became_possible", "track_05_programming"]),
    ("php", "6_logos_languages", "php-logo", ["track_03_how_software_became_possible", "track_10_web_development"]),
    ("ruby", "6_logos_languages", "ruby-logo", ["track_03_how_software_became_possible", "track_05_programming"]),
    ("typescript", "6_logos_languages", "typescript-logo", ["track_03_how_software_became_possible", "track_10_web_development"]),
    ("mysql", "6_logos_languages", "sql-logo", ["track_03_how_software_became_possible", "track_12_databases"]),
    ("html5", "6_logos_languages", "html5-logo", ["track_10_web_development"]),
    ("css3", "6_logos_languages", "css3-logo", ["track_10_web_development"]),
    
    # Frameworks
    ("react", "7_logos_frameworks", "react-logo", ["track_11_frameworks_backend"]),
    ("nextjs", "7_logos_frameworks", "nextjs-logo", ["track_11_frameworks_backend"]),
    ("vuejs", "7_logos_frameworks", "vue-logo", ["track_11_frameworks_backend"]),
    ("angularjs", "7_logos_frameworks", "angular-logo", ["track_11_frameworks_backend"]),
    ("nodejs", "7_logos_frameworks", "nodejs-logo", ["track_11_frameworks_backend"]),
    ("express", "7_logos_frameworks", "express-logo", ["track_11_frameworks_backend"]),
    ("django", "7_logos_frameworks", "django-logo", ["track_11_frameworks_backend"]),
    ("flask", "7_logos_frameworks", "flask-logo", ["track_11_frameworks_backend"]),
    ("spring", "7_logos_frameworks", "spring-logo", ["track_11_frameworks_backend"]),
    ("fastapi", "7_logos_frameworks", "fastapi-logo", ["track_11_frameworks_backend"]),
    ("tailwindcss", "7_logos_frameworks", "tailwind-logo", ["track_10_web_development"]),
    ("bootstrap", "7_logos_frameworks", "bootstrap-logo", ["track_10_web_development"]),
    ("jquery", "7_logos_frameworks", "jquery-logo", ["track_10_web_development"]),
    ("pandas", "7_logos_frameworks", "pandas-logo", ["track_17_data_python"]),
    ("numpy", "7_logos_frameworks", "numpy-logo", ["track_17_data_python"]),
    ("matplotlib", "7_logos_frameworks", "matplotlib-logo", ["track_17_data_python"]),
    
    # Databases
    ("postgresql", "8_logos_databases", "postgresql-logo", ["track_12_databases"]),
    ("mysql", "8_logos_databases", "mysql-logo", ["track_12_databases"]),
    ("mongodb", "8_logos_databases", "mongodb-logo", ["track_12_databases"]),
    ("redis", "8_logos_databases", "redis-logo", ["track_12_databases"]),
    ("sqlite", "8_logos_databases", "sqlite-logo", ["track_12_databases"]),
    ("snowflake", "8_logos_databases", "snowflake-logo", ["track_12_databases", "track_17_data_python"]),
    ("elasticsearch", "8_logos_databases", "elasticsearch-logo", ["track_12_databases"]),
    ("neo4j", "8_logos_databases", "neo4j-logo", ["track_12_databases"]),
    ("apachecassandra", "8_logos_databases", "cassandra-logo", ["track_12_databases"]),
    
    # Cloud Providers
    ("amazonwebservices", "9_logos_cloud", "aws-logo", ["track_15_cloud_computing"]),
    ("googlecloud", "9_logos_cloud", "gcp-logo", ["track_15_cloud_computing"]),
    ("microsoftazure", "9_logos_cloud", "azure-logo", ["track_15_cloud_computing"]),
    ("oracle", "9_logos_cloud", "oracle-cloud-logo", ["track_15_cloud_computing"]),
    
    # DevOps Tools
    ("docker", "10_logos_devops", "docker-logo", ["track_14_linux_devops"]),
    ("kubernetes", "10_logos_devops", "kubernetes-logo", ["track_14_linux_devops", "track_15_cloud_computing"]),
    ("nginx", "10_logos_devops", "nginx-logo", ["track_14_linux_devops"]),
    ("terraform", "10_logos_devops", "terraform-logo", ["track_14_linux_devops"]),
    ("ansible", "10_logos_devops", "ansible-logo", ["track_14_linux_devops"]),
    ("prometheus", "10_logos_devops", "prometheus-logo", ["track_14_linux_devops"]),
    ("grafana", "10_logos_devops", "grafana-logo", ["track_14_linux_devops"]),
    ("jenkins", "10_logos_devops", "jenkins-logo", ["track_14_linux_devops"]),
    ("helm", "10_logos_devops", "helm-logo", ["track_14_linux_devops"]),
    
    # OS
    ("linux", "11_logos_os", "linux-tux-logo", ["track_04_operating_systems", "track_14_linux_devops"]),
    ("windows8", "11_logos_os", "windows-logo", ["track_04_operating_systems"]),
    ("apple", "11_logos_os", "macos-apple-logo", ["track_04_operating_systems"]),
    ("android", "11_logos_os", "android-logo", ["track_04_operating_systems"]),
    ("unix", "11_logos_os", "unix-logo", ["track_04_operating_systems", "track_14_linux_devops"]),
    
    # VCS
    ("git", "12_logos_vcs", "git-logo", ["track_07_software_engineering"]),
    ("github", "12_logos_vcs", "github-logo", ["track_07_software_engineering"]),
    ("gitlab", "12_logos_vcs", "gitlab-logo", ["track_07_software_engineering"]),
    ("bitbucket", "12_logos_vcs", "bitbucket-logo", ["track_07_software_engineering"]),
    
    # AI / ML
    ("openai", "13_logos_ai_ml", "openai-logo", ["track_20_generative_ai", "track_21_ai_agents"]),
    ("anthropic", "13_logos_ai_ml", "anthropic-logo", ["track_20_generative_ai", "track_21_ai_agents"]),
    ("huggingface", "13_logos_ai_ml", "huggingface-logo", ["track_18_machine_learning", "track_19_deep_learning", "track_20_generative_ai"]),
    ("tensorflow", "13_logos_ai_ml", "tensorflow-logo", ["track_18_machine_learning", "track_19_deep_learning"]),
    ("pytorch", "13_logos_ai_ml", "pytorch-logo", ["track_18_machine_learning", "track_19_deep_learning"]),
    ("keras", "13_logos_ai_ml", "keras-logo", ["track_18_machine_learning", "track_19_deep_learning"]),
    ("scikitlearn", "13_logos_ai_ml", "scikit-learn-logo", ["track_18_machine_learning"]),
    ("jupyter", "13_logos_ai_ml", "jupyter-logo", ["track_17_data_python", "track_18_machine_learning"]),
    ("langchain", "13_logos_ai_ml", "langchain-logo", ["track_21_ai_agents"])
]

# 3. MEMES
MEMES = [
    ("https://i.imgflip.com/30b1gx.jpg", "drake-meme.jpg", ["track_05_programming", "track_07_software_engineering"]),
    ("https://i.imgflip.com/3q7oq6.jpg", "spiderman-pointing.jpg", ["track_03_how_software_became_possible", "track_05_programming"]),
    ("https://i.imgflip.com/1ur9b0.jpg", "distracted-bf.jpg", ["track_05_programming", "track_11_frameworks_backend"])
]

def save_image_bytes(content: bytes, filename: str, cat_dir: Path, tracks: List[str]):
    cat_dir.mkdir(parents=True, exist_ok=True)
    with open(cat_dir / filename, "wb") as f:
        f.write(content)
    
    for t_dir in tracks:
        tp = TRACKS_DIR / t_dir
        tp.mkdir(parents=True, exist_ok=True)
        with open(tp / filename, "wb") as f:
            f.write(content)

def fetch_wikipedia_photo(wiki_title: str, label: str, cat_dir: Path, tracks: List[str]) -> bool:
    try:
        api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(wiki_title)}"
        resp = requests.get(api_url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return False
            
        data = resp.json()
        img_url = (data.get("originalimage", {}) or {}).get("source") or (data.get("thumbnail", {}) or {}).get("source")
        if not img_url:
            return False
            
        img_resp = requests.get(img_url, headers=HEADERS, timeout=20)
        if img_resp.status_code == 200:
            ext = ".jpg" if "jpg" in img_url.lower() or "jpeg" in img_url.lower() else ".png"
            filename = f"{label}{ext}"
            save_image_bytes(img_resp.content, filename, cat_dir, tracks)
            print(f"[OK] Downloaded: {filename} ({len(img_resp.content)//1024} KB)")
            return True
    except Exception as e:
        print(f"[FAIL] {wiki_title}: {e}")
    return False

def fetch_logo(slug: str, cat_name: str, label: str, tracks: List[str]) -> bool:
    # Try Devicon then SimpleIcons
    urls = [
        f"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/{slug}/{slug}-original.svg",
        f"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/{slug}/{slug}-plain.svg",
        f"https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/{slug}.svg"
    ]
    for url in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code == 200 and len(resp.content) > 100:
                cat_dir = TAXONOMY_DIR / cat_name
                save_image_bytes(resp.content, f"{label}.svg", cat_dir, tracks)
                print(f"[OK] Downloaded Logo: {label}.svg")
                return True
        except Exception:
            continue
    return False

def fetch_meme(url: str, filename: str, tracks: List[str]) -> bool:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code == 200:
            cat_dir = TAXONOMY_DIR / "23_memes_engagement"
            save_image_bytes(resp.content, filename, cat_dir, tracks)
            print(f"[OK] Downloaded Meme: {filename}")
            return True
    except Exception as e:
        print(f"[FAIL] Meme {filename}: {e}")
    return False

def harvest_all_remaining():
    print("=" * 65)
    print("SWE Notebook - Complete Real-World Image & Logo Harvester")
    print(f"Destination: {ASSETS_DIR}")
    print("=" * 65)
    
    total = 0
    
    # 1. Wikipedia figures, pioneers, hardware, vintage
    print("\n--- 1. Harvesting All Historical Figures, Pioneers, AI Leaders & Hardware ---")
    for cat_name, entries in WIKIPEDIA_TARGETS.items():
        cat_dir = TAXONOMY_DIR / cat_name
        for entry in entries:
            dest_file = cat_dir / f"{entry['label']}.jpg"
            dest_file_png = cat_dir / f"{entry['label']}.png"
            if dest_file.exists() or dest_file_png.exists():
                print(f"[EXISTS] {entry['label']}")
                total += 1
                continue
                
            if fetch_wikipedia_photo(entry["wiki"], entry["label"], cat_dir, entry["tracks"]):
                total += 1
            time.sleep(0.3)
            
    # 2. All Official Tech Logos
    print("\n--- 2. Harvesting All Official Tech Logos (Devicon / SimpleIcons) ---")
    for slug, cat_name, label, tracks in ALL_LOGOS:
        cat_dir = TAXONOMY_DIR / cat_name
        dest_file = cat_dir / f"{label}.svg"
        if dest_file.exists():
            print(f"[EXISTS] {label}.svg")
            total += 1
            continue
            
        if fetch_logo(slug, cat_name, label, tracks):
            total += 1
        time.sleep(0.1)
        
    # 3. Memes
    print("\n--- 3. Harvesting Memes ---")
    for url, filename, tracks in MEMES:
        cat_dir = TAXONOMY_DIR / "23_memes_engagement"
        if (cat_dir / filename).exists():
            print(f"[EXISTS] {filename}")
            total += 1
            continue
        if fetch_meme(url, filename, tracks):
            total += 1
            
    print("\n" + "=" * 65)
    print(f"Harvester Run Complete! Active real assets: {total}")
    print("=" * 65)

if __name__ == "__main__":
    harvest_all_remaining()

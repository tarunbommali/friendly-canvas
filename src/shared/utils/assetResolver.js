/**
 * SWE Notebook Asset Resolver
 * Maps slides → taxonomy assets using keyword scoring against
 * SlideTitle, Content, VisualDirective, and Layout fields.
 *
 * All asset URLs are served via /swe-assets/ Vite middleware at runtime.
 */

export const SWE_ASSETS_BASE = '/swe-assets'

// ──────────────────────────────────────────────────────────────────────────
// Taxonomy directory map
// ──────────────────────────────────────────────────────────────────────────
export const TAXONOMY_DIRS = {
  historical_figures: '1_historical_figures',
  tech_pioneers: '2_tech_pioneers',
  modern_engineers: '3_modern_engineers',
  hardware: '4_hardware_images',
  vintage_computers: '5_vintage_computers',
  logos_languages: '6_logos_languages',
  logos_frameworks: '7_logos_frameworks',
  logos_databases: '8_logos_databases',
  logos_cloud: '9_logos_cloud',
  logos_devops: '10_logos_devops',
  logos_os: '11_logos_os',
  logos_vcs: '12_logos_vcs',
  logos_ai_ml: '13_logos_ai_ml',
  architecture: '14_architecture_diagrams',
  network: '15_network_topologies',
  cloud_infra: '16_cloud_infra',
  dsa_visuals: '17_dsa_visuals',
  memes: '23_memes_engagement',
  real_world: '28_real_world_scenarios',
  anatomy: '29_anatomy_breakdowns',
}

// ──────────────────────────────────────────────────────────────────────────
// All known assets — { file, label, tags[] }
// tags: any keyword that would make this asset relevant to a slide
// ──────────────────────────────────────────────────────────────────────────
const ALL_ASSETS = [
  // ── 1. Historical Figures ───────────────────────────────────────────────
  { cat: 'historical_figures', file: 'charles-babbage.jpg', label: 'Charles Babbage', tags: ['babbage', 'analytical engine', 'mechanical', 'calculator', 'charles'] },
  { cat: 'historical_figures', file: 'ada-lovelace.png', label: 'Ada Lovelace', tags: ['lovelace', 'ada', 'algorithm', 'first programmer', 'punch card', 'notes'] },
  { cat: 'historical_figures', file: 'alan-turing.jpg', label: 'Alan Turing', tags: ['turing', 'programmable', 'enigma', 'machine', 'cryptography', 'computation'] },
  { cat: 'historical_figures', file: 'grace-hopper.jpg', label: 'Grace Hopper', tags: ['hopper', 'grace', 'compiler', 'cobol', 'bug', 'navy', 'first compiler'] },
  { cat: 'historical_figures', file: 'john-von-neumann.png', label: 'John von Neumann', tags: ['von neumann', 'architecture', 'stored program', 'memory', 'fetch decode execute'] },
  { cat: 'historical_figures', file: 'donald-knuth.jpg', label: 'Donald Knuth', tags: ['knuth', 'algorithm', 'art of computer programming', 'dsa', 'sorting'] },
  { cat: 'historical_figures', file: 'claude-shannon.jpg', label: 'Claude Shannon', tags: ['shannon', 'information theory', 'entropy', 'bit', 'binary', 'signal'] },
  { cat: 'historical_figures', file: 'douglas-engelbart.jpg', label: 'Douglas Engelbart', tags: ['engelbart', 'mouse', 'hypertext', 'demo', 'gui', 'interface'] },
  { cat: 'historical_figures', file: 'eniac-programmers.jpg', label: 'ENIAC Programmers', tags: ['eniac', 'programmer', 'women', 'pioneer', 'electronic', 'computer'] },
  { cat: 'historical_figures', file: 'human-computers.jpg', label: 'Human Computers', tags: ['human computer', 'calculator', 'nasa', 'women', 'arithmetic', 'compute'] },
  { cat: 'historical_figures', file: 'isaac-newton.jpg', label: 'Isaac Newton', tags: ['newton', 'physics', 'calculus', 'mathematics', 'science'] },
  { cat: 'historical_figures', file: 'leibniz.jpg', label: 'Leibniz', tags: ['leibniz', 'calculator', 'calculus', 'binary', 'binary number system', 'step reckoner'] },
  { cat: 'historical_figures', file: 'historical-figure-babbage.svg', label: 'Babbage (SVG)', tags: ['babbage', 'analytical engine', 'mechanical', 'charles'] },
  { cat: 'historical_figures', file: 'historical-figure-turing.svg', label: 'Turing Machine (SVG)', tags: ['turing', 'tape', 'machine', 'programmable', 'computation'] },
  { cat: 'historical_figures', file: 'historical-figure-lovelace.svg', label: 'Lovelace (SVG)', tags: ['lovelace', 'ada', 'algorithm', 'notes'] },
  { cat: 'historical_figures', file: 'historical-figure-hopper.svg', label: 'Hopper (SVG)', tags: ['hopper', 'compiler', 'cobol'] },
  { cat: 'historical_figures', file: 'historical-figure-eniac.svg', label: 'ENIAC (SVG)', tags: ['eniac', 'electronic', 'vacuum tube', 'room-sized'] },
  { cat: 'historical_figures', file: 'historical-figure-abacus.svg', label: 'Abacus (SVG)', tags: ['abacus', 'bead', 'calculate', 'ancient', 'manual'] },
  { cat: 'historical_figures', file: 'historical-figure-shannon.svg', label: 'Shannon (SVG)', tags: ['shannon', 'information', 'binary', 'bit'] },
  { cat: 'historical_figures', file: 'historical-figure-von-neumann.svg', label: 'Von Neumann (SVG)', tags: ['von neumann', 'architecture', 'memory', 'stored program'] },
  { cat: 'historical_figures', file: 'historical-figure-knuth.svg', label: 'Knuth (SVG)', tags: ['knuth', 'algorithm', 'dsa', 'sorting', 'complexity'] },
  { cat: 'historical_figures', file: 'historical-figure-engelbart.svg', label: 'Engelbart (SVG)', tags: ['engelbart', 'mouse', 'gui', 'interface'] },

  // ── 2. Tech Pioneers ───────────────────────────────────────────────────
  { cat: 'tech_pioneers', file: 'linus-torvalds.jpg', label: 'Linus Torvalds', tags: ['linus', 'torvalds', 'linux', 'kernel', 'git', 'open source'] },
  { cat: 'tech_pioneers', file: 'dennis-ritchie.jpg', label: 'Dennis Ritchie', tags: ['ritchie', 'dennis', 'c language', 'unix', 'bell labs'] },
  { cat: 'tech_pioneers', file: 'ken-thompson.jpg', label: 'Ken Thompson', tags: ['thompson', 'ken', 'unix', 'b language', 'bell labs', 'go'] },
  { cat: 'tech_pioneers', file: 'tim-berners-lee.jpg', label: 'Tim Berners-Lee', tags: ['berners-lee', 'tim', 'www', 'http', 'web', 'html', 'url', 'internet'] },
  { cat: 'tech_pioneers', file: 'vint-cerf.jpg', label: 'Vint Cerf', tags: ['cerf', 'vint', 'tcp', 'ip', 'internet', 'protocol', 'packet'] },
  { cat: 'tech_pioneers', file: 'guido-van-rossum.jpg', label: 'Guido van Rossum', tags: ['guido', 'van rossum', 'python', 'scripting'] },
  { cat: 'tech_pioneers', file: 'brendan-eich.jpg', label: 'Brendan Eich', tags: ['eich', 'brendan', 'javascript', 'js', 'browser', 'netscape'] },
  { cat: 'tech_pioneers', file: 'james-gosling.jpg', label: 'James Gosling', tags: ['gosling', 'james', 'java', 'jvm', 'object oriented'] },
  { cat: 'tech_pioneers', file: 'richard-stallman.jpg', label: 'Richard Stallman', tags: ['stallman', 'richard', 'gnu', 'free software', 'emacs', 'open source', 'gpl'] },
  { cat: 'tech_pioneers', file: 'anders-hejlsberg.jpg', label: 'Anders Hejlsberg', tags: ['hejlsberg', 'anders', 'c#', 'typescript', 'delphi', 'dotnet'] },
  { cat: 'tech_pioneers', file: 'martin-fowler.jpg', label: 'Martin Fowler', tags: ['fowler', 'martin', 'refactoring', 'patterns', 'agile', 'clean code', 'software engineering'] },
  { cat: 'tech_pioneers', file: 'brian-kernighan.jpg', label: 'Brian Kernighan', tags: ['kernighan', 'brian', 'c', 'unix', 'awk', 'bell labs'] },
  { cat: 'tech_pioneers', file: 'rob-pike.jpg', label: 'Rob Pike', tags: ['pike', 'rob', 'go', 'golang', 'unix', 'plan 9', 'utf-8'] },
  { cat: 'tech_pioneers', file: 'marc-andreessen.jpg', label: 'Marc Andreessen', tags: ['andreessen', 'marc', 'netscape', 'browser', 'mosaic', 'web', 'startup'] },

  // ── 3. Modern Engineers / AI Pioneers ──────────────────────────────────
  { cat: 'modern_engineers', file: 'geoffrey-hinton.jpg', label: 'Geoffrey Hinton', tags: ['hinton', 'deep learning', 'neural network', 'backpropagation', 'godfather of ai'] },
  { cat: 'modern_engineers', file: 'yann-lecun.jpg', label: 'Yann LeCun', tags: ['lecun', 'yann', 'cnn', 'convolutional', 'image recognition', 'meta ai'] },
  { cat: 'modern_engineers', file: 'yoshua-bengio.jpg', label: 'Yoshua Bengio', tags: ['bengio', 'yoshua', 'deep learning', 'attention', 'recurrent'] },
  { cat: 'modern_engineers', file: 'demis-hassabis.jpg', label: 'Demis Hassabis', tags: ['hassabis', 'demis', 'alphago', 'alphafold', 'deepmind', 'protein folding'] },
  { cat: 'modern_engineers', file: 'sam-altman.jpg', label: 'Sam Altman', tags: ['altman', 'sam', 'openai', 'gpt', 'chatgpt', 'llm', 'ceo'] },
  { cat: 'modern_engineers', file: 'ilya-sutskever.jpg', label: 'Ilya Sutskever', tags: ['sutskever', 'ilya', 'openai', 'gpt', 'transformer', 'neural'] },
  { cat: 'modern_engineers', file: 'dario-amodei.jpg', label: 'Dario Amodei', tags: ['amodei', 'dario', 'anthropic', 'claude', 'alignment', 'safety'] },

  // ── 4. Hardware ────────────────────────────────────────────────────────
  { cat: 'hardware', file: 'cpu-die.jpg', label: 'CPU Die Shot', tags: ['cpu', 'processor', 'die', 'silicon', 'transistor', 'chip', 'clock', 'core', 'fetch', 'decode', 'execute', 'alu', 'control unit'] },
  { cat: 'hardware', file: 'gpu-card.png', label: 'GPU Card', tags: ['gpu', 'graphics', 'cuda', 'parallel', 'training', 'deep learning', 'rendering', 'shader'] },
  { cat: 'hardware', file: 'ram-stick.jpg', label: 'DDR4 RAM', tags: ['ram', 'memory', 'volatile', 'dram', 'ddr', 'stack', 'heap', 'address'] },
  { cat: 'hardware', file: 'motherboard.png', label: 'Motherboard', tags: ['motherboard', 'bus', 'chipset', 'pcie', 'hardware', 'circuit', 'board'] },
  { cat: 'hardware', file: 'nvme-ssd.png', label: 'NVMe SSD', tags: ['ssd', 'nvme', 'flash', 'storage', 'disk', 'persistent', 'read', 'write'] },
  { cat: 'hardware', file: 'hdd-platters.jpg', label: 'HDD Platters', tags: ['hdd', 'hard drive', 'disk', 'platter', 'magnetic', 'storage', 'rotational', 'sector', 'block'] },
  { cat: 'hardware', file: 'transistor-macro.jpg', label: 'Transistor', tags: ['transistor', 'switch', 'gate', 'semiconductor', 'mosfet', 'logic'] },
  { cat: 'hardware', file: 'data-center-rack.jpg', label: 'Server Rack', tags: ['server', 'rack', 'data center', 'cloud', 'datacenter', 'blade', 'infra'] },
  { cat: 'hardware', file: 'vacuum-tube.jpg', label: 'Vacuum Tube', tags: ['vacuum tube', 'triode', 'early computer', 'eniac', 'electronic', 'amplifier'] },
  { cat: 'hardware', file: 'silicon-wafer.jpg', label: 'Silicon Wafer', tags: ['silicon', 'wafer', 'chip', 'fabrication', 'moores law', 'semiconductor', 'photolithography'] },
  { cat: 'hardware', file: 'fiber-optic-cable.jpg', label: 'Fiber Optic', tags: ['fiber', 'optic', 'cable', 'network', 'bandwidth', 'light', 'transmission'] },
  { cat: 'hardware', file: 'curta-calculator.jpg', label: 'Curta Calculator', tags: ['curta', 'mechanical', 'calculator', 'gear', 'portable', 'math'] },

  // ── 5. Vintage Computers ───────────────────────────────────────────────
  { cat: 'vintage_computers', file: 'eniac-machine.jpg', label: 'ENIAC Machine', tags: ['eniac', 'electronic', 'room-sized', 'vacuum tube', '1940', 'early computer', '30 tons'] },
  { cat: 'vintage_computers', file: 'altair-8800.jpg', label: 'Altair 8800', tags: ['altair', '8800', 'personal computer', 'microcomputer', 'homebrew', 'gates'] },
  { cat: 'vintage_computers', file: 'apple-i.jpg', label: 'Apple I', tags: ['apple i', 'wozniak', 'jobs', 'personal computer', 'microcomputer', 'circuit board'] },
  { cat: 'vintage_computers', file: 'ibm-pc-5150.png', label: 'IBM PC 5150', tags: ['ibm', 'pc', '5150', 'personal computer', 'ms-dos', 'x86'] },
  { cat: 'vintage_computers', file: 'ibm-mainframe.jpg', label: 'IBM Mainframe', tags: ['mainframe', 'ibm', 'batch', 'tape', 'enterprise', '1960', '1970'] },
  { cat: 'vintage_computers', file: 'punch-cards.jpg', label: 'Punch Cards', tags: ['punch card', 'card', 'batch', 'input', 'fortran', 'cobol', '1950', '1960'] },
  { cat: 'vintage_computers', file: 'abacus.png', label: 'Abacus', tags: ['abacus', 'bead', 'ancient', 'calculate', 'arithmetic', 'manual'] },
  { cat: 'vintage_computers', file: 'vt100-terminal.jpg', label: 'VT100 Terminal', tags: ['terminal', 'vt100', 'tty', 'shell', 'cli', 'command line', 'console'] },
  { cat: 'vintage_computers', file: 'magnetic-core-memory.jpg', label: 'Core Memory', tags: ['core memory', 'magnetic', 'ram', 'early', '1950', '1960', 'memory'] },
  { cat: 'vintage_computers', file: 'crt-monitor.png', label: 'CRT Monitor', tags: ['crt', 'monitor', 'display', 'cathode', 'ray', 'tube', 'phosphor'] },

  // ── 6. Language Logos ──────────────────────────────────────────────────
  { cat: 'logos_languages', file: 'python-logo.svg', label: 'Python', tags: ['python', 'scripting', 'data', 'pandas', 'numpy', 'ml', 'automation', 'guido'] },
  { cat: 'logos_languages', file: 'javascript-logo.svg', label: 'JavaScript', tags: ['javascript', 'js', 'web', 'browser', 'dom', 'node', 'react', 'brendan'] },
  { cat: 'logos_languages', file: 'typescript-logo.svg', label: 'TypeScript', tags: ['typescript', 'ts', 'type', 'static', 'microsoft', 'hejlsberg'] },
  { cat: 'logos_languages', file: 'java-logo.svg', label: 'Java', tags: ['java', 'jvm', 'object oriented', 'spring', 'android', 'gosling'] },
  { cat: 'logos_languages', file: 'c-logo.svg', label: 'C', tags: ['c language', 'c lang', 'unix', 'systems', 'ritchie', 'low level', 'kernighan'] },
  { cat: 'logos_languages', file: 'cpp-logo.svg', label: 'C++', tags: ['c++', 'cpp', 'systems', 'oop', 'games', 'performance', 'stroustrup'] },
  { cat: 'logos_languages', file: 'csharp-logo.svg', label: 'C#', tags: ['c#', 'csharp', 'dotnet', '.net', 'microsoft', 'unity', 'hejlsberg'] },
  { cat: 'logos_languages', file: 'go-logo.svg', label: 'Go', tags: ['go', 'golang', 'goroutine', 'concurrent', 'google', 'pike', 'thompson'] },
  { cat: 'logos_languages', file: 'rust-logo.svg', label: 'Rust', tags: ['rust', 'memory safe', 'ownership', 'borrow', 'systems', 'wasm'] },
  { cat: 'logos_languages', file: 'swift-logo.svg', label: 'Swift', tags: ['swift', 'ios', 'apple', 'mobile', 'xcode', 'objc'] },
  { cat: 'logos_languages', file: 'kotlin-logo.svg', label: 'Kotlin', tags: ['kotlin', 'android', 'jvm', 'jetbrains', 'coroutine'] },
  { cat: 'logos_languages', file: 'php-logo.svg', label: 'PHP', tags: ['php', 'wordpress', 'web', 'server side', 'laravel'] },
  { cat: 'logos_languages', file: 'ruby-logo.svg', label: 'Ruby', tags: ['ruby', 'rails', 'matz', 'scripting', 'web'] },
  { cat: 'logos_languages', file: 'html5-logo.svg', label: 'HTML5', tags: ['html', 'html5', 'web', 'markup', 'dom', 'structure', 'berners-lee'] },
  { cat: 'logos_languages', file: 'css3-logo.svg', label: 'CSS3', tags: ['css', 'css3', 'style', 'web', 'layout', 'flexbox', 'grid'] },

  // ── 7. Framework Logos ─────────────────────────────────────────────────
  { cat: 'logos_frameworks', file: 'react-logo.svg', label: 'React', tags: ['react', 'jsx', 'component', 'facebook', 'meta', 'frontend', 'spa', 'vdom'] },
  { cat: 'logos_frameworks', file: 'nextjs-logo.svg', label: 'Next.js', tags: ['nextjs', 'next', 'ssr', 'ssg', 'vercel', 'fullstack', 'routing'] },
  { cat: 'logos_frameworks', file: 'vue-logo.svg', label: 'Vue', tags: ['vue', 'vuejs', 'frontend', 'component', 'evan you'] },
  { cat: 'logos_frameworks', file: 'angular-logo.svg', label: 'Angular', tags: ['angular', 'google', 'typescript', 'spa', 'enterprise', 'rxjs'] },
  { cat: 'logos_frameworks', file: 'nodejs-logo.svg', label: 'Node.js', tags: ['nodejs', 'node', 'backend', 'javascript', 'npm', 'event loop', 'v8'] },
  { cat: 'logos_frameworks', file: 'express-logo.svg', label: 'Express', tags: ['express', 'rest', 'api', 'node', 'backend', 'middleware', 'route'] },
  { cat: 'logos_frameworks', file: 'django-logo.svg', label: 'Django', tags: ['django', 'python', 'mvc', 'orm', 'backend', 'web framework'] },
  { cat: 'logos_frameworks', file: 'flask-logo.svg', label: 'Flask', tags: ['flask', 'python', 'micro framework', 'api', 'route', 'backend'] },
  { cat: 'logos_frameworks', file: 'fastapi-logo.svg', label: 'FastAPI', tags: ['fastapi', 'fast api', 'python', 'async', 'openapi', 'swagger', 'rest'] },
  { cat: 'logos_frameworks', file: 'spring-logo.svg', label: 'Spring Boot', tags: ['spring', 'spring boot', 'java', 'microservice', 'rest', 'dependency injection'] },
  { cat: 'logos_frameworks', file: 'tailwind-logo.svg', label: 'Tailwind', tags: ['tailwind', 'css', 'utility', 'design', 'frontend'] },
  { cat: 'logos_frameworks', file: 'pandas-logo.svg', label: 'Pandas', tags: ['pandas', 'dataframe', 'python', 'data', 'csv', 'analysis'] },
  { cat: 'logos_frameworks', file: 'numpy-logo.svg', label: 'NumPy', tags: ['numpy', 'array', 'matrix', 'python', 'linear algebra', 'scientific'] },

  // ── 8. Database Logos ──────────────────────────────────────────────────
  { cat: 'logos_databases', file: 'postgresql-logo.svg', label: 'PostgreSQL', tags: ['postgres', 'postgresql', 'sql', 'relational', 'database', 'query', 'acid', 'transaction'] },
  { cat: 'logos_databases', file: 'mysql-logo.svg', label: 'MySQL', tags: ['mysql', 'sql', 'relational', 'database', 'table', 'query', 'web'] },
  { cat: 'logos_databases', file: 'mongodb-logo.svg', label: 'MongoDB', tags: ['mongodb', 'nosql', 'document', 'json', 'bson', 'collection', 'database'] },
  { cat: 'logos_databases', file: 'redis-logo.svg', label: 'Redis', tags: ['redis', 'cache', 'key value', 'in-memory', 'session', 'queue', 'pubsub'] },
  { cat: 'logos_databases', file: 'sqlite-logo.svg', label: 'SQLite', tags: ['sqlite', 'embedded', 'database', 'local', 'file', 'serverless'] },
  { cat: 'logos_databases', file: 'elasticsearch-logo.svg', label: 'Elasticsearch', tags: ['elasticsearch', 'elastic', 'search', 'full text', 'log', 'kibana'] },
  { cat: 'logos_databases', file: 'neo4j-logo.svg', label: 'Neo4j', tags: ['neo4j', 'graph database', 'node', 'edge', 'cypher', 'relationship'] },

  // ── 9. Cloud Logos ─────────────────────────────────────────────────────
  { cat: 'logos_cloud', file: 'aws-logo.svg', label: 'AWS', tags: ['aws', 'amazon', 'cloud', 's3', 'ec2', 'lambda', 'iam', 'rds', 'cloudfront'] },
  { cat: 'logos_cloud', file: 'gcp-logo.svg', label: 'GCP', tags: ['gcp', 'google cloud', 'bigquery', 'gke', 'cloud run', 'pubsub', 'firestore'] },
  { cat: 'logos_cloud', file: 'azure-logo.svg', label: 'Azure', tags: ['azure', 'microsoft', 'cloud', 'ad', 'virtual machine', 'functions', 'cosmos'] },

  // ── 10. DevOps Logos ───────────────────────────────────────────────────
  { cat: 'logos_devops', file: 'docker-logo.svg', label: 'Docker', tags: ['docker', 'container', 'dockerfile', 'image', 'compose', 'containerize'] },
  { cat: 'logos_devops', file: 'kubernetes-logo.svg', label: 'Kubernetes', tags: ['kubernetes', 'k8s', 'cluster', 'pod', 'service', 'deploy', 'orchestration'] },
  { cat: 'logos_devops', file: 'nginx-logo.svg', label: 'Nginx', tags: ['nginx', 'web server', 'reverse proxy', 'load balance', 'http', 'static'] },
  { cat: 'logos_devops', file: 'terraform-logo.svg', label: 'Terraform', tags: ['terraform', 'iac', 'infrastructure', 'cloud', 'provision', 'hashicorp', 'hcl'] },
  { cat: 'logos_devops', file: 'ansible-logo.svg', label: 'Ansible', tags: ['ansible', 'automation', 'playbook', 'yaml', 'configuration', 'linux'] },
  { cat: 'logos_devops', file: 'prometheus-logo.svg', label: 'Prometheus', tags: ['prometheus', 'metrics', 'monitoring', 'alert', 'time series', 'grafana'] },
  { cat: 'logos_devops', file: 'grafana-logo.svg', label: 'Grafana', tags: ['grafana', 'dashboard', 'monitoring', 'visualization', 'prometheus', 'observability'] },
  { cat: 'logos_devops', file: 'jenkins-logo.svg', label: 'Jenkins', tags: ['jenkins', 'ci', 'cd', 'pipeline', 'build', 'deploy', 'automation'] },
  { cat: 'logos_devops', file: 'helm-logo.svg', label: 'Helm', tags: ['helm', 'chart', 'kubernetes', 'k8s', 'deploy', 'release'] },

  // ── 11. OS Logos ───────────────────────────────────────────────────────
  { cat: 'logos_os', file: 'linux-logo.svg', label: 'Linux', tags: ['linux', 'kernel', 'unix', 'open source', 'linus', 'shell', 'cli', 'bash'] },
  { cat: 'logos_os', file: 'linux-tux-logo.svg', label: 'Linux Tux', tags: ['tux', 'linux', 'penguin', 'linus', 'kernel', 'os'] },
  { cat: 'logos_os', file: 'windows-logo.svg', label: 'Windows', tags: ['windows', 'microsoft', 'nt', 'dos', 'desktop', 'gui', 'registry'] },
  { cat: 'logos_os', file: 'macos-apple-logo.svg', label: 'macOS', tags: ['macos', 'apple', 'darwin', 'unix', 'mac', 'xcode', 'ios'] },
  { cat: 'logos_os', file: 'android-logo.svg', label: 'Android', tags: ['android', 'google', 'mobile', 'java', 'kotlin', 'apk', 'dalvik'] },

  // ── 12. VCS Logos ──────────────────────────────────────────────────────
  { cat: 'logos_vcs', file: 'git-logo.svg', label: 'Git', tags: ['git', 'version control', 'commit', 'branch', 'merge', 'rebase', 'linus'] },
  { cat: 'logos_vcs', file: 'github-logo.svg', label: 'GitHub', tags: ['github', 'repository', 'pull request', 'issue', 'open source', 'ci', 'actions'] },
  { cat: 'logos_vcs', file: 'gitlab-logo.svg', label: 'GitLab', tags: ['gitlab', 'ci', 'cd', 'devops', 'pipeline', 'self hosted', 'repository'] },
  { cat: 'logos_vcs', file: 'bitbucket-logo.svg', label: 'Bitbucket', tags: ['bitbucket', 'atlassian', 'jira', 'git', 'mercurial', 'repository'] },

  // ── 13. AI / ML Logos ──────────────────────────────────────────────────
  { cat: 'logos_ai_ml', file: 'openai-logo.svg', label: 'OpenAI', tags: ['openai', 'gpt', 'chatgpt', 'llm', 'altman', 'api', 'token'] },
  { cat: 'logos_ai_ml', file: 'anthropic-logo.svg', label: 'Anthropic', tags: ['anthropic', 'claude', 'safety', 'alignment', 'amodei', 'constitutional ai'] },
  { cat: 'logos_ai_ml', file: 'tensorflow-logo.svg', label: 'TensorFlow', tags: ['tensorflow', 'google', 'neural', 'ml', 'deep learning', 'keras', 'graph'] },
  { cat: 'logos_ai_ml', file: 'pytorch-logo.svg', label: 'PyTorch', tags: ['pytorch', 'torch', 'facebook', 'meta', 'neural', 'gradient', 'autograd'] },
  { cat: 'logos_ai_ml', file: 'keras-logo.svg', label: 'Keras', tags: ['keras', 'deep learning', 'neural', 'tensorflow', 'layer', 'model'] },
  { cat: 'logos_ai_ml', file: 'scikit-learn-logo.svg', label: 'Scikit-learn', tags: ['scikit', 'sklearn', 'machine learning', 'classification', 'regression', 'cluster'] },
  { cat: 'logos_ai_ml', file: 'jupyter-logo.svg', label: 'Jupyter', tags: ['jupyter', 'notebook', 'ipynb', 'python', 'data science', 'interactive', 'cell'] },

  // ── 23. Memes ──────────────────────────────────────────────────────────
  { cat: 'memes', file: 'drake-meme.jpg', label: 'Drake', tags: ['meme', 'comparison', 'prefer', 'versus', 'vs', 'choice', 'funny'] },
  { cat: 'memes', file: 'spiderman-pointing.jpg', label: 'Spiderman', tags: ['meme', 'same', 'duplicate', 'confusion', 'funny', 'pointing'] },
  { cat: 'memes', file: 'distracted-bf.jpg', label: 'Distracted BF', tags: ['meme', 'distracted', 'shiny', 'trend', 'funny', 'comparison'] },
]

// ──────────────────────────────────────────────────────────────────────────
// Scoring engine
// ──────────────────────────────────────────────────────────────────────────

/** Normalise a string into a lowercase array of tokens */
function tokenise(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean)
}

/**
 * Score an asset against a search corpus derived from a slide.
 * Returns numeric score — higher is a better match.
 * Scoring rules:
 *   - Exact label match in corpus           → +10 (highest priority)
 *   - Multi-word tag match (N words)         → N × 3
 *   - Single-word tag match (len ≥ 5)       → +2
 *   - Short single-word tag match (len 3-4) → +1 (weak signal)
 *   - Label word appears in corpus (len ≥ 5) → +1
 */
function scoreAsset(asset, corpus) {
  let score = 0
  const corpusStr = corpus.join(' ')

  // Exact label match is the strongest signal
  const normalLabel = asset.label.toLowerCase()
  if (corpusStr.includes(normalLabel)) {
    score += 10
  }

  for (const tag of asset.tags) {
    const tagLen = tag.split(' ').length
    if (corpusStr.includes(tag)) {
      if (tagLen >= 2) {
        score += tagLen * 3   // multi-word: very specific
      } else if (tag.length >= 5) {
        score += 2            // single meaningful word
      } else {
        score += 1            // short word — weak signal only
      }
    }
  }

  // Label tokens bonus (e.g. 'Babbage' in label matches 'babbage' in corpus)
  const labelWords = tokenise(asset.label)
  for (const word of labelWords) {
    if (word.length >= 5 && corpusStr.includes(word)) score += 1
  }

  return score
}

/**
 * Build a text corpus from a slide object.
 * Includes SlideTitle, Content, VisualDirective, Layout.
 */
function buildSlideCorpus(slide) {
  const raw = [
    slide?.SlideTitle || slide?.title || slide?.content?.title || '',
    slide?.Content || slide?.body || (typeof slide?.content === 'string' ? slide.content : slide?.content?.body) || '',
    slide?.VisualDirective || slide?.visualDirective || slide?.content?.visualDirective || '',
    slide?.Layout || slide?.layout?.id || (typeof slide?.layout === 'string' ? slide.layout : '') || '',
  ].join(' ')
  return tokenise(raw)
}

// ──────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────

/** Return the asset URL for dev server */
export function assetUrl(categoryKey, file) {
  const dir = TAXONOMY_DIRS[categoryKey]
  if (!dir) return null
  return `${SWE_ASSETS_BASE}/taxonomy/${dir}/${file}`
}

/**
 * Returns slide-specific assets sorted by relevance score.
 * Strict threshold (score >= 2) ensures only genuinely relevant
 * assets are shown. Falls back to a small set of collection-level
 * assets only when nothing matches the slide directly.
 *
 * @param {object} slide           — the current slide object
 * @param {string} collectionName  — e.g. "Collection 1 — Why Computers Exist"
 * @param {number} maxResults      — hard cap on results (default 8)
 */
export function getAssetsForSlide(slide, collectionName = '', maxResults = 8) {
  const corpus = buildSlideCorpus(slide)

  const scored = ALL_ASSETS.map((asset) => ({
    ...asset,
    url: assetUrl(asset.cat, asset.file),
    isVector: asset.file.endsWith('.svg'),
    score: scoreAsset(asset, corpus),
  }))

  // Only keep assets with a meaningful score (≥ 2 prevents noise)
  const matched = scored
    .filter((a) => a.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)

  // Fallback: show up to 5 collection-level assets when slide is generic
  if (matched.length === 0) {
    return scored
      .filter((a) => COLLECTION_TO_CATEGORIES[collectionName]?.includes(a.cat))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }

  return matched
}

/** Group a list of scored assets by category key */
export function groupByCategory(assets) {
  const map = {}
  for (const a of assets) {
    if (!map[a.cat]) map[a.cat] = []
    map[a.cat].push(a)
  }
  return map
}

// ──────────────────────────────────────────────────────────────────────────
// Collection → category hints (used by fallback path)
// ──────────────────────────────────────────────────────────────────────────
const COLLECTION_TO_CATEGORIES = {
  'Collection 1 — Why Computers Exist': ['historical_figures', 'vintage_computers', 'hardware'],
  'Collection 2 — How a Computer Actually Works': ['hardware', 'vintage_computers', 'historical_figures'],
  'Collection 3 — How Software Became Possible': ['tech_pioneers', 'logos_languages', 'vintage_computers'],
  'Collection 4 — Operating Systems': ['logos_os', 'tech_pioneers', 'vintage_computers'],
  'Collection 5 — Programming': ['logos_languages', 'logos_frameworks', 'tech_pioneers'],
  'Collection 6 — Problem Solving & DSA': ['logos_languages', 'historical_figures', 'logos_frameworks'],
  'Collection 7 — Software Engineering': ['logos_vcs', 'tech_pioneers', 'logos_languages'],
  'Collection 8 — Networking Fundamentals': ['hardware', 'logos_cloud', 'logos_devops'],
  'Collection 9 — How the Web Works': ['logos_frameworks', 'logos_cloud', 'tech_pioneers'],
  'Collection 10 — Web Development': ['logos_frameworks', 'logos_languages', 'logos_databases'],
  'Collection 11 — Frameworks & Backend': ['logos_frameworks', 'logos_databases', 'logos_devops'],
  'Collection 12 — Databases': ['logos_databases', 'logos_cloud', 'logos_devops'],
  'Collection 13 — Security': ['logos_os', 'logos_devops', 'logos_vcs'],
  'Collection 14 — Linux + DevOps': ['logos_devops', 'logos_os', 'logos_vcs'],
  'Collection 15 — Cloud Computing': ['logos_cloud', 'logos_devops', 'hardware'],
  'Collection 16 — System Design': ['logos_cloud', 'logos_devops', 'logos_databases'],
  'Collection 17 — Data & Python': ['logos_languages', 'logos_frameworks', 'modern_engineers'],
  'Collection 18 — Machine Learning': ['logos_ai_ml', 'modern_engineers', 'logos_frameworks'],
  'Collection 19 — Deep Learning': ['logos_ai_ml', 'modern_engineers', 'hardware'],
  'Collection 20 — Generative AI': ['modern_engineers', 'logos_ai_ml', 'memes'],
  'Collection 21 — AI Agents': ['logos_ai_ml', 'modern_engineers', 'logos_frameworks'],
}

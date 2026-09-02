const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_DIR = path.join(__dirname, '..', 'stitch-designs');
const SCREENSHOTS_DIR = path.join(BASE_DIR, 'screenshots');
const CODE_DIR = path.join(BASE_DIR, 'code');
const DESIGN_SYSTEM_DIR = path.join(BASE_DIR, 'design-system');

[SCREENSHOTS_DIR, CODE_DIR, DESIGN_SYSTEM_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const screens = [
  {
    id: '5347d050184249e2b75e523a44ee3a19',
    slug: 'workspace-home',
    title: 'Workspace Home',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1UGTmSfnfvuIzQ_-tYWA2yKZXkQmokaWAzdz5Af6mO9JMT65j95Dxw-DOjy-0j1yuySQdI1s2gJxkf3eJ2P7VkQOjsVC9st0dQNkTQ63mkDPma1D8_Xgs1dUYqnvwaLgGyQMoa9MDp-farodGcQASaMZGi3xkhBUREk2VQUmF8LJKT6K_VIpk85envKgP-yuRc04UJ33CP1V4ADd9DE5rCKKRgltdRRxPwxNZPoiZhgkiy-zB81epFLQ-W5',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTdlZjQ5ZmY4NTEwMzgzYTJlMTRlMzY2N2M5EgsSBxCshJvh7hsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTk4MzcwMzQ5NTk5NzQxMTQzOA&filename=&opi=89354086',
  },
  {
    id: 'd9c746e1de494cd9928ece6823c9e8ae',
    slug: 'member-management',
    title: 'Member Management',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1WyB1IxdhMcIBnuP8ThM31Q1xrzuq3x_c9_tEm3AuPV22rZ6Kh8OGRonmhHVH38mlQoS8q6cYo8F1dBLdyS6vkGrXkviWe72m_hsahQksow-Mbe7MvQ16I0B7IQ_YurQTt_pZibwTRZZza3xJvJvlM_fumUhH3RmoexndUd5YnXib-_eOghi2-RIaZqNpduzmIRDbA88AS26urlnltA7OEWg2Jx3lTIZnOPEJrP54j1ZIN9tYYTklj_v28',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTdmMDBmMGNkYjUwMGRiNDgwODc2MzJhYTk1EgsSBxCshJvh7hsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTk4MzcwMzQ5NTk5NzQxMTQzOA&filename=&opi=89354086',
  },
  {
    id: '73dc98d3fcde4a9aaa191b534a97a1f7',
    slug: 'role-permissions-matrix',
    title: 'Role Permissions Matrix',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1W9fjE3r4UxtgW5bf08d8kliGescLpLbtmE9XB-NFRWnypehTQ1XpDnqrAgLMznm1gKjbOIKbLV0b0QiCa3SsimrdkXf3Fu0ay-Hbv-13SyUJKq6YoKUQ2gnFl3OiOy1NBwpqENHxf7Eltqe6wbDqGaqAIlR9Z2hBx3s1UKy_6CTkMh6PqlVKbRTzXpc57y-JZBpQ67o51ZEi8f-btAoqi2yeZBYNhXmKprabYoZdkzvRqAeHnKQ2DlMVCy',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTdmMDA0Mzg1YWMwMWE2MTE2OWFiMzczZTg1EgsSBxCshJvh7hsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTk4MzcwMzQ5NTk5NzQxMTQzOA&filename=&opi=89354086',
  },
  {
    id: 'fdf8288d0d1b4154afb6477f1d83d114',
    slug: 'project-overview',
    title: 'Project Overview',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1X7BkDdNZ0KuMF12BQvk0qkhQx5f8HCCiYa_wEFgfX_O-jnQljN-BZkKLdSUGMQ1Z--RyYKAZrhHNEi1LdpPMoiKODfkmN6gy14yIAQDUBT2h-sf_YG85kTqwF8fLB7CPPVrnL86ydtXqRefleMIvMfEwBSaxvhJOsWbAncQJ7bf4QLwYxUZrejmQYk0nVwwgPQdKdH0ja15G0HvcgfDLgIDC_Y_F4T9Oz9ms__kIjA0FqusJSCV_GjAzw',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTdlZjRlMzYxN2QwN2M0Y2FmZWFiMDM4N2FhEgsSBxCshJvh7hsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTk4MzcwMzQ5NTk5NzQxMTQzOA&filename=&opi=89354086',
  },
  {
    id: 'c14e3494ca9c4f96ac66c9b7ffdb5a2a',
    slug: 'track-detail',
    title: 'Track Detail',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1UdWaBLtz3IRM5Q-suu4SjcIYQsJ9GZxqLXtP4n6ZNaWj56D-Ux7oADCxARqrhXVTurzSa8OGvHwHQMETlQoFdPhjvqV-91OqUb3NK_c548Ejn2R37MrmBZH9XcJQIvV1QpsqZ7kjMvNZdUsXCAT8YX8uhXpO1e-KpdgFLieXPLFb9VCYBEJJy35Mtqp1WCV00cQq2G3Ei_cHqBjTu3sVrr-RRJq8Mj_Iu-Oxj9YuTPoP91bJsXQJjoCiY',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTdlZjRiNDY4NTUwNTc2MzFmZTYxMDQ4NDNlEgsSBxCshJvh7hsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTk4MzcwMzQ5NTk5NzQxMTQzOA&filename=&opi=89354086',
  },
  {
    id: 'eeeb121d8817450abde9c8fdbaa61f1a',
    slug: 'login',
    title: 'Login',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1UH8SqXoNEdygHo6V7kXe5e5n-b_sHhRPU2FwAx19d6JrV7xR_J5DFEYL7tmU3JIC55DEH3mfV6PC5REeCBcS0t_Qig7JTJYdIk43df5m1iBS7tHRL5ADwn_Z4qgEcagMytvtNWmO0AxJVLx6_dQ9Ra9cVWj1o45qp8iIHiZAEwe9AtkakVbhjs0TT-4oFCJdLeN2Iop3tKs3P05CSJqDqvB01_zB3qUJ49VhG6Rm57MM6P5zdAWrwWAZYC',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTdmMDVhMWRlMDAwN2M0ZTMwZjhkMTEyZDI3EgsSBxCshJvh7hsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTk4MzcwMzQ5NTk5NzQxMTQzOA&filename=&opi=89354086',
  },
  {
    id: '7dee46b8c65e4f6e863bbe9d579179b1',
    slug: 'forgot-password',
    title: 'Forgot Password',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1VlCRbi_ZBkiWpF5Pafs45YhX-SODuWPlz-gkrzZa9PkIKJTpso3RC_VZTdH_bUuNc4-wE9D4IYy0kRWwmrtNzqCszv3Bxt2lrG3OhuI_ijEowqNOV33z-8NCjraQ4npT1Su8NsqO5Df4XjwAVqHdSF6XKIiv-ASX3YEKdfGyw5dfJ6P_D-f3P_DQMa76fylAjuu8VYUpsxXLfWY-4QVkU8SFL0x5v9R_jm87r6SrWrnQiAcEgKrVHca20C',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTdmMDRmZmNmMjIwNzc5OWUwMGQ4MzljNzQ4EgsSBxCshJvh7hsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTk4MzcwMzQ5NTk5NzQxMTQzOA&filename=&opi=89354086',
  },
  {
    id: '86d70a60432a46d5b56f4e075fdbec19',
    slug: 'reset-password',
    title: 'Reset Password',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1XX-6nbH9uHFr0_qLV12Ed0-RpglaqgGvSmyzuWVnHSLkOnCbJW7feqsxwJ0Z4_xfcCcP2QeT2wsmLSkI5HRMfb7pbW2_lWvUYte2Zt612qYf3-vBGwHWuXDq8mihYM2ONyUxn1GfYRNDmhnDkX1GDGWpnTjES48ogmq45hZSFJ1f3yy6oqNQ8axIZYHq41fIK4Fci6opBGv0D7RAP1E-s1Rg7PP9eaSjnIcyIb2ft9Ij9ZnDpEJvp-9LJQ',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTdmMDU5NWZhM2EwN2M0Y2FmZWFiMDM4N2FhEgsSBxCshJvh7hsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTk4MzcwMzQ5NTk5NzQxMTQzOA&filename=&opi=89354086',
  },
  {
    id: 'dd2eb64d89fe4616bb89bb6a6a2499d1',
    slug: 'post-detail-slide-editor',
    title: 'Post Detail & Slide Editor',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1Wefhb83b9H-yAv-DTEIIjnb3MQ8wmzDml6u0XWR2sa-cNB8crkE0Tov6M3MLo0m3nyOXWMfv0z_50yWEvUqO7cpq15pSyYStHZ7y-ylIgDkX9CNfvkFoJYtRvqTcS0Xc-evsfvWupF7vxBGfA97cqEKZ6w37WGA5Lre_0ySdaEQzMgIvTte0VfcpVI9valkH8IkIAqFeCP8HAFA3xP678hNUYC9FV_rTseUrsCzQecGzP3ulJtwUbumfuE',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTdlZjUxMjQyMDYwMWI0ZTgxMTk3MGFmNzMzEgsSBxCshJvh7hsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTk4MzcwMzQ5NTk5NzQxMTQzOA&filename=&opi=89354086',
  },
  {
    id: '7a74e7f0d5e941959e63646b5c6b7b69',
    slug: 'canvas-editor-dark-studio',
    title: 'Canvas Editor - Dark Studio',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1VBJ0eZaW7b2pu4kh_QuSHRS32NoN2KU25d4yqcy9-O0Z9Gl-09TB5iMwG3afAPkLwj7wJJWBsKzqdZ2ykEsqBrfuDaP2JeHR68_k4tzW8BLWnIcULenmV-6gWU-3bMUpgPVV4rHJmFYDWkFZurf1z7XRCJ1aQpjcNwQx520RAhPVwlFkgqBSypxM-gK2hkzEPFEYsXPBPw65s1Mu3MHAEOtTVLUuxbEBgDMia_-l7elyZm1wPNlPKJLuTu',
    html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YTdlZmFjNDRlYTYwOTI1Yzc1MTA5MTA4NDdmEgsSBxCshJvh7hsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTk4MzcwMzQ5NTk5NzQxMTQzOA&filename=&opi=89354086',
  },
  {
    id: '3d9fee775447434cb167fb41d2bbbf86',
    slug: 'canvas-editor-variant-2',
    title: 'Canvas Editor Variant 2',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1UhYG7n4lUp5fiPVD1NayiyDS-ZZvg6qO8d_mmjHitpvs4-matHzlQADyLnLrDdVBt2mNcerHDqJQW9lGiDDyU4cicOwn7WLmDNVA-acS8uESj9e88NkqkoybjrB7nGUY97_YKRhhcYCSHZR1zg6WtsjOuhaMW3ZYzUL9d0v8Oe4XcqEmj4MCYvQSrUwz5L_o15aUnXzCy7wppJIRqLYzIkkjXkts02mhKsV6jgNqD5tX3TAOR5J12J_lOz',
  },
  {
    id: 'ae5084ce8caf4764ae02b1ea2f62b3db',
    slug: 'canvas-editor-variant-3',
    title: 'Canvas Editor Variant 3',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1UQbmihJKQEz3ORhB3PHUsPgH2vrxrr7xohosjUHVXn4lmM0RwWg4xNS3OsSPvnjmO_-8QUXYjVZtyKd00WdSyQm0TDFLlpNeuOYbcZx4Zk9zBrEI0wFRFvWtDa5fVA6PMR5squA3g1C-FtBV-nQPqYp2TKB8GgIPHBftxhNQAqUgMlj4r7ihZOF2u_MqivQzEpxblRI3cZ5XngLNRsmVGY-6DoOHY7OW26kJ6G_NUYEpStM06Pl3aKBY88',
  },
];

function downloadUrl(url, destPath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Handle redirect
          return downloadUrl(res.headers.location, destPath).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
        }

        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      })
      .on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

async function run() {
  console.log('Downloading Stitch project screens and code...');

  for (const screen of screens) {
    if (screen.image) {
      const imgPath = path.join(SCREENSHOTS_DIR, `${screen.slug}.png`);
      try {
        await downloadUrl(screen.image, imgPath);
        console.log(`✓ Downloaded screenshot: ${screen.slug}.png`);
      } catch (err) {
        console.warn(`Failed image download for ${screen.slug}:`, err.message);
      }
    }

    if (screen.html) {
      const htmlPath = path.join(CODE_DIR, `${screen.slug}.html`);
      try {
        await downloadUrl(screen.html, htmlPath);
        console.log(`✓ Downloaded code: ${screen.slug}.html`);
      } catch (err) {
        console.warn(`Failed html download for ${screen.slug}:`, err.message);
      }
    }
  }

  console.log('All downloads completed successfully!');
}

run().catch(console.error);

#!/usr/bin/env node
// Procesa SVGs desde public/brands → public/marcas
// - Convierte colores a blanco (#FFFFFF) excepto "none"
// - Elimina gradientes, filtros, estilos
// - Asegura viewBox y remueve width/height
// - Optimiza con SVGO
// - Genera manifiesto src/data/brands.json

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { optimize } from 'svgo';

const cwd = process.cwd();
const inputDir = path.resolve(cwd, 'public', 'brands');
const outputDir = path.resolve(cwd, 'public', 'marcas');
const manifestPath = path.resolve(cwd, 'src', 'data', 'brands.json');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function toLowerCaseName(file) {
  const ext = path.extname(file);
  const name = path.basename(file, ext);
  return `${name.toLowerCase()}${ext.toLowerCase()}`;
}

function forceWhite(svg) {
  let out = svg;
  // quitar <style>...</style>
  out = out.replace(/<style[\s\S]*?<\/style>/gi, '');
  // gradientes y filtros
  out = out.replace(/<linearGradient[\s\S]*?<\/linearGradient>/gi, '');
  out = out.replace(/<radialGradient[\s\S]*?<\/radialGradient>/gi, '');
  out = out.replace(/<filter[\s\S]*?<\/filter>/gi, '');
  // rellenos/tra trazos por url(#id)
  out = out.replace(/fill="url\([^)]+\)"/gi, 'fill="#FFFFFF"');
  out = out.replace(/stroke="url\([^)]+\)"/gi, 'stroke="#FFFFFF"');
  // convertir colores de fill/stroke (excepto none) a blanco
  out = out.replace(/fill="(?!none)[^"]+"/gi, 'fill="#FFFFFF"');
  out = out.replace(/stroke="(?!none)[^"]+"/gi, 'stroke="#FFFFFF"');
  // estilos inline: fill:xxx; stroke:yyy
  out = out.replace(/fill\s*:\s*(?!none)[^;"']+/gi, 'fill:#FFFFFF');
  out = out.replace(/stroke\s*:\s*(?!none)[^;"']+/gi, 'stroke:#FFFFFF');
  // color actual
  out = out.replace(/currentColor/gi, '#FFFFFF');
  return out;
}

function ensureViewBox(svg) {
  if (/viewBox="[^"]+"/i.test(svg)) return svg;
  // intentar derivar desde width/height
  const widthMatch = svg.match(/\bwidth="(\d+(?:\.\d+)?)(?:px)?"/i);
  const heightMatch = svg.match(/\bheight="(\d+(?:\.\d+)?)(?:px)?"/i);
  if (widthMatch && heightMatch) {
    const w = Number(widthMatch[1]);
    const h = Number(heightMatch[1]);
    return svg.replace(/<svg\b/i, `<svg viewBox="0 0 ${w} ${h}"`);
  }
  return svg; // si no se puede, SVGO intentará mantener lo que haya
}

function stripDimensions(svg) {
  return svg
    .replace(/\s+width="[^"]*"/gi, '')
    .replace(/\s+height="[^"]*"/gi, '');
}

async function processSvg(svgContent) {
  let content = svgContent.toString('utf8');
  content = forceWhite(content);
  content = ensureViewBox(content);
  content = stripDimensions(content);

  const { data } = optimize(content, {
    multipass: true,
    plugins: [
      'preset-default',
      { name: 'removeDimensions', active: true },
      { name: 'removeAttrs', params: { attrs: ['class', 'id', 'data-*'] } },
      { name: 'cleanupNumericValues', active: true },
    ],
  });
  return data;
}

async function build() {
  await ensureDir(outputDir);
  await ensureDir(path.dirname(manifestPath));

  let files = [];
  try {
    files = await fs.readdir(inputDir);
  } catch (e) {
    console.error(`No se encontró la carpeta de entrada: ${inputDir}`);
    process.exit(1);
  }

  const svgs = files.filter((f) => f.toLowerCase().endsWith('.svg'));
  if (svgs.length === 0) {
    console.warn('No se encontraron archivos .svg en public/brands');
  }

  const outNames = [];
  for (const file of svgs) {
    const inputPath = path.join(inputDir, file);
    const nameLower = toLowerCaseName(file);
    const outputPath = path.join(outputDir, nameLower);

    const svg = await fs.readFile(inputPath, 'utf8');
    const processed = await processSvg(svg);
    await fs.writeFile(outputPath, processed, 'utf8');
    outNames.push(nameLower);
    console.log(`✓ Procesado: ${file} → ${path.relative(cwd, outputPath)}`);
  }

  // generar manifiesto
  await fs.writeFile(manifestPath, JSON.stringify(outNames, null, 2) + '\n', 'utf8');
  console.log(`\nManifiesto actualizado: ${path.relative(cwd, manifestPath)}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});



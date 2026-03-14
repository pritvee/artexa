const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'public', 'models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.glb'));

for (const file of files) {
  console.log(`\n--- Parsing ${file} ---`);
  const buf = fs.readFileSync(path.join(modelsDir, file));
  const magic = buf.toString('latin1', 0, 4);
  if (magic !== 'glTF') {
    console.log('Not a valid GLB file');
    continue;
  }
  const version = buf.readUInt32LE(4);
  const length = buf.readUInt32LE(8);
  const chunk0Length = buf.readUInt32LE(12);
  const chunk0Type = buf.toString('latin1', 16, 20);
  
  if (chunk0Type === 'JSON') {
    const jsonStr = buf.toString('utf8', 20, 20 + chunk0Length);
    try {
      const gltf = JSON.parse(jsonStr);
      console.log('Nodes:');
      if (gltf.nodes) {
        gltf.nodes.forEach((n, i) => console.log(`  [${i}] name = ${n.name}, mesh = ${n.mesh !== undefined ? n.mesh : 'none'}`));
      } else {
        console.log('  No nodes found.');
      }
      console.log('Meshes:');
      if (gltf.meshes) {
        gltf.meshes.forEach((m, i) => console.log(`  [${i}] name = ${m.name}`));
      } else {
        console.log('  No meshes found.');
      }
    } catch (e) {
      console.log('Failed to parse JSON:', e.message);
    }
  } else {
    console.log('First chunk is not JSON');
  }
}

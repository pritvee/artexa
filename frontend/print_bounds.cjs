const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'public', 'models', 'true_heart_gift_box_openable.glb');
const buf = fs.readFileSync(file);
const chunk0Length = buf.readUInt32LE(12);
const jsonStr = buf.toString('utf8', 20, 20 + chunk0Length);
const gltf = JSON.parse(jsonStr);

console.log("Accessors min/max:");
gltf.accessors.forEach((acc, i) => {
  if (acc.type === 'VEC3' && acc.min && acc.max) {
     console.log(`Accessor ${i}: min=(${acc.min.map(n=>n.toFixed(2)).join(',')}), max=(${acc.max.map(n=>n.toFixed(2)).join(',')})`);
  }
});


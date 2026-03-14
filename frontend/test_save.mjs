import axios from 'axios';

async function testSave() {
    try {
        const loginRes = await axios.post('http://localhost:8000/api/v1/auth/login', 'username=admin@example.com&password=admin123', {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const token = loginRes.data.access_token;
        console.log("Token:", token);

        const prods = await axios.get('http://localhost:8000/api/v1/products/');
        const product = prods.data.items[0];

        const payload = {
            name: product.name,
            category_id: product.category_id,
            price: product.price,
            stock: product.stock,
            description: product.description || '',
            image_url: product.image_url,
            customization_type: product.customization_type || 'Frame',
            customization_schema: { sizes: [], styles: [] }
        };

        const updateRes = await axios.patch(`http://localhost:8000/api/v1/admin/products/${product.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Success:", updateRes.data);
    } catch (err) {
        console.error("Error:", err.response ? JSON.stringify(err.response.data) : err.message);
    }
}
testSave();

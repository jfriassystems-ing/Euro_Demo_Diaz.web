
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Validar que existan las credenciales
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ ERROR: Credenciales de Cloudinary no configuradas en .env');
    process.exit(1);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('✅ Cloudinary configurado correctamente');

module.exports = cloudinary;
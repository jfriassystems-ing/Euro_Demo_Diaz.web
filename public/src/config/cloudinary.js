const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary solo si existen las credenciales
if (process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET) {
    
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    console.log('✅ Cloudinary configurado correctamente');
} else {
    console.warn('⚠️ Cloudinary no configurado - Las imágenes no se subirán');
}

module.exports = cloudinary;
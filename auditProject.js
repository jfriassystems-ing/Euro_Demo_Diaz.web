const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n═══════════════════════════════════════════════════════');
console.log('🔍 AUDITORÍA COMPLETA DEL PROYECTO EUROMODADIAZweb');
console.log('═══════════════════════════════════════════════════════\n');

// ============================================
// 1. ESTRUCTURA DEL PROYECTO
// ============================================
console.log('📁 1. ESTRUCTURA DE CARPETAS');
console.log('─────────────────────────────────────────────────────────');

function listStructure(dir, prefix = '', depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return;
    try {
        const items = fs.readdirSync(dir);
        const filtered = items.filter(item => !item.startsWith('.') && item !== 'node_modules');
        
        filtered.forEach((item, index) => {
            const isLast = index === filtered.length - 1;
            const fullPath = path.join(dir, item);
            const isDir = fs.statSync(fullPath).isDirectory();
            const prefixSymbol = prefix + (isLast ? '└── ' : '├── ');
            
            console.log(`${prefixSymbol}${item}${isDir ? '/' : ''}`);
            
            if (isDir && depth < maxDepth) {
                const childPrefix = prefix + (isLast ? '    ' : '│   ');
                listStructure(fullPath, childPrefix, depth + 1, maxDepth);
            }
        });
    } catch (e) {
        console.log(`   ⚠️  No se pudo leer: ${dir}`);
    }
}

listStructure('./', '', 0, 2);

// ============================================
// 2. ARCHIVOS CRÍTICOS
// ============================================
console.log('\n\n📄 2. ARCHIVOS CRÍTICOS');
console.log('─────────────────────────────────────────────────────────');

const criticalFiles = [
    'package.json',
    'server.js',
    '.env',
    '.gitignore',
    'backend/package.json',
    'backend/server.js',
    'backend/.env',
    'frontend/package.json',
    'index.html',
    'admin.html',
    'checkout.html'
];

criticalFiles.forEach(file => {
    const exists = fs.existsSync(file);
    const status = exists ? '✅ EXISTE' : '❌ FALTA';
    console.log(`   ${status}  ${file}`);
});

// ============================================
// 3. DEPENDENCIAS (BACKEND)
// ============================================
console.log('\n\n📦 3. DEPENDENCIAS DEL BACKEND');
console.log('─────────────────────────────────────────────────────────');

try {
    const backendPackagePath = './backend/package.json';
    let packageJson;
    
    if (fs.existsSync(backendPackagePath)) {
        packageJson = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
    } else if (fs.existsSync('./package.json')) {
        packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    } else {
        throw new Error('No se encontró package.json');
    }
    
    const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };
    
    console.log(`   📦 Dependencias encontradas: ${Object.keys(allDeps).length}`);
    console.log('\n   Principales dependencias:');
    
    // Listar las más importantes
    const important = ['express', 'mysql2', 'sequelize', 'dotenv', 'cloudinary', 'cors', 'bcrypt', 'jsonwebtoken'];
    important.forEach(dep => {
        if (allDeps[dep]) {
            console.log(`   ✅ ${dep}: ${allDeps[dep]}`);
        } else {
            console.log(`   ❌ ${dep}: NO INSTALADA`);
        }
    });
    
    // Verificar scripts disponibles
    console.log('\n   📜 Scripts disponibles:');
    if (packageJson.scripts) {
        Object.keys(packageJson.scripts).forEach(script => {
            console.log(`   ▶️  npm run ${script}: ${packageJson.scripts[script]}`);
        });
    } else {
        console.log('   ⚠️  No hay scripts definidos');
    }
    
} catch (e) {
    console.log(`   ⚠️  Error: ${e.message}`);
}

// ============================================
// 4. DEPENDENCIAS (FRONTEND)
// ============================================
console.log('\n\n📦 4. DEPENDENCIAS DEL FRONTEND');
console.log('─────────────────────────────────────────────────────────');

try {
    const frontendPackagePath = './frontend/package.json';
    if (fs.existsSync(frontendPackagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };
        console.log(`   📦 Dependencias encontradas: ${Object.keys(allDeps).length}`);
        
        const important = ['react', 'vue', 'angular', 'axios', 'bootstrap', 'tailwind'];
        important.forEach(dep => {
            if (allDeps[dep]) {
                console.log(`   ✅ ${dep}: ${allDeps[dep]}`);
            } else {
                console.log(`   ⚠️  ${dep}: NO INSTALADA`);
            }
        });
    } else {
        console.log('   ⚠️  No se encontró frontend/package.json');
    }
} catch (e) {
    console.log(`   ⚠️  Error: ${e.message}`);
}

// ============================================
// 5. BASE DE DATOS
// ============================================
console.log('\n\n🗄️ 5. CONFIGURACIÓN DE BASE DE DATOS');
console.log('─────────────────────────────────────────────────────────');

// Buscar archivos de configuración de DB
const dbFiles = [];
const searchDir = (dir) => {
    try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory() && item !== 'node_modules') {
                searchDir(fullPath);
            } else if (item.includes('database') || item.includes('db') || item.includes('mysql') || item.includes('sequelize')) {
                dbFiles.push(fullPath);
            }
        });
    } catch (e) {}
};

searchDir('./');
dbFiles.forEach(file => {
    console.log(`   📄 ${file}`);
});

// ============================================
// 6. VARIABLES DE ENTORNO
// ============================================
console.log('\n\n🔐 6. VARIABLES DE ENTORNO');
console.log('─────────────────────────────────────────────────────────');

const envFiles = ['.env', 'backend/.env', 'frontend/.env'];
envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
        console.log(`   ✅ ${envFile} existe`);
        try {
            const content = fs.readFileSync(envFile, 'utf8');
            const variables = content.split('\n')
                .filter(line => line.trim() && !line.startsWith('#'))
                .map(line => line.split('=')[0].trim());
            
            console.log(`   📋 Variables definidas: ${variables.join(', ')}`);
            
            // Verificar variables críticas
            const critical = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'CLOUDINARY_CLOUD_NAME'];
            critical.forEach(varName => {
                if (variables.includes(varName)) {
                    console.log(`   ✅ ${varName}: DEFINIDA`);
                } else {
                    console.log(`   ⚠️  ${varName}: NO DEFINIDA`);
                }
            });
        } catch (e) {
            console.log(`   ⚠️  No se pudo leer ${envFile}`);
        }
    } else {
        console.log(`   ❌ ${envFile} NO EXISTE`);
    }
});

// ============================================
// 7. CONTROLADORES
// ============================================
console.log('\n\n🎮 7. CONTROLADORES ENCONTRADOS');
console.log('─────────────────────────────────────────────────────────');

const controllersPath = './backend/src/controllers';
if (fs.existsSync(controllersPath)) {
    const files = fs.readdirSync(controllersPath).filter(f => f.endsWith('.js'));
    files.forEach(file => {
        console.log(`   📄 ${file}`);
    });
    console.log(`\n   Total: ${files.length} controladores`);
} else {
    console.log('   ❌ No se encontró la carpeta controllers');
}

// ============================================
// 8. RUTAS
// ============================================
console.log('\n\n🛣️ 8. RUTAS ENCONTRADAS');
console.log('─────────────────────────────────────────────────────────');

const routesPath = './backend/src/routes';
if (fs.existsSync(routesPath)) {
    const files = fs.readdirSync(routesPath).filter(f => f.endsWith('.js'));
    files.forEach(file => {
        console.log(`   📄 ${file}`);
    });
    console.log(`\n   Total: ${files.length} archivos de rutas`);
} else {
    console.log('   ❌ No se encontró la carpeta routes');
}

// ============================================
// 9. MODELOS
// ============================================
console.log('\n\n📊 9. MODELOS ENCONTRADOS');
console.log('─────────────────────────────────────────────────────────');

const modelsPath = './backend/src/models';
if (fs.existsSync(modelsPath)) {
    const files = fs.readdirSync(modelsPath).filter(f => f.endsWith('.js'));
    files.forEach(file => {
        console.log(`   📄 ${file}`);
    });
    console.log(`\n   Total: ${files.length} modelos`);
} else {
    console.log('   ❌ No se encontró la carpeta models');
}

// ============================================
// 10. MIDDLEWARE
// ============================================
console.log('\n\n🔧 10. MIDDLEWARE ENCONTRADO');
console.log('─────────────────────────────────────────────────────────');

const middlewarePath = './backend/src/middleware';
if (fs.existsSync(middlewarePath)) {
    const files = fs.readdirSync(middlewarePath).filter(f => f.endsWith('.js'));
    files.forEach(file => {
        console.log(`   📄 ${file}`);
    });
    console.log(`\n   Total: ${files.length} middleware`);
} else {
    console.log('   ❌ No se encontró la carpeta middleware');
}

// ============================================
// 11. FRONTEND
// ============================================
console.log('\n\n🖥️ 11. FRONTEND');
console.log('─────────────────────────────────────────────────────────');

if (fs.existsSync('./frontend')) {
    console.log('   ✅ Carpeta frontend existe');
    
    // Verificar archivos principales
    const frontendFiles = ['index.html', 'admin.html', 'checkout.html'];
    frontendFiles.forEach(file => {
        const exists = fs.existsSync(`./${file}`);
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    });
    
    // Verificar src
    if (fs.existsSync('./frontend/src')) {
        console.log('   ✅ frontend/src existe');
        const srcFiles = fs.readdirSync('./frontend/src');
        console.log(`   📁 Contenido: ${srcFiles.join(', ')}`);
    } else {
        console.log('   ❌ frontend/src NO EXISTE');
    }
} else {
    console.log('   ❌ No se encontró la carpeta frontend');
}

// ============================================
// 12. SCRIPTS DE SEED
// ============================================
console.log('\n\n🌱 12. SCRIPTS DE SEED');
console.log('─────────────────────────────────────────────────────────');

const configPath = './backend/src/config';
if (fs.existsSync(configPath)) {
    const files = fs.readdirSync(configPath).filter(f => f.includes('seed') || f.includes('add') || f.includes('init'));
    files.forEach(file => {
        console.log(`   📄 ${file}`);
    });
    console.log(`\n   Total: ${files.length} scripts de seed`);
} else {
    console.log('   ❌ No se encontró la carpeta config');
}

// ============================================
// RESUMEN FINAL
// ============================================
console.log('\n\n═══════════════════════════════════════════════════════');
console.log('📊 RESUMEN EJECUTIVO');
console.log('═══════════════════════════════════════════════════════\n');

// Verificar lo más importante
const issues = [];

if (!fs.existsSync('./backend')) issues.push('❌ Falta carpeta backend/');
if (!fs.existsSync('./backend/server.js') && !fs.existsSync('./server.js')) issues.push('❌ Falta server.js');
if (!fs.existsSync('./.env') && !fs.existsSync('./backend/.env')) issues.push('⚠️  Falta archivo .env');
if (!fs.existsSync('./package.json') && !fs.existsSync('./backend/package.json')) issues.push('❌ Falta package.json');
if (!fs.existsSync('./index.html') && !fs.existsSync('./frontend/index.html')) issues.push('⚠️  Falta index.html');

if (issues.length === 0) {
    console.log('✅ TODO PARECE ESTAR EN ORDEN');
    console.log('   El proyecto tiene la estructura básica completa.');
} else {
    console.log('⚠️  PROBLEMAS ENCONTRADOS:');
    issues.forEach(issue => {
        console.log(`   ${issue}`);
    });
}

console.log('\n💡 RECOMENDACIONES:');
console.log('─────────────────────────────────────────────────────────');
console.log('   1. Si falta .env, crealo con las variables necesarias');
console.log('   2. Ejecutar: npm install (o cd backend && npm install)');
console.log('   3. Para iniciar: node server.js o npm start');
console.log('   4. Verificar que la base de datos esté corriendo');

console.log('\n═══════════════════════════════════════════════════════\n');
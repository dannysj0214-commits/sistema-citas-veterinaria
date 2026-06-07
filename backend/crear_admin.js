const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/sistema_citas')
  .then(async () => {
    console.log('✅ Conectado a MongoDB');
    
    // Obtener el modelo User
    const User = require('./src/models/User');
    
    // Eliminar admin existente
    await User.deleteOne({ email: 'admin@test.com' });
    console.log('🗑️ Admin anterior eliminado');
    
    // Crear nuevo admin
    const admin = new User({
      nombre: 'Administrador',
      email: 'admin@test.com',
      password: 'admin123',
      rol: 'admin',
      telefono: '3000000000',
      disponible: true
    });
    
    await admin.save();
    console.log('✅ Administrador creado exitosamente');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Contraseña: admin123');
    
    // Mostrar el admin creado
    const adminCreado = await User.findOne({ email: 'admin@test.com' }).select('-password');
    console.log('📋 Datos del admin:', adminCreado);
    
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/sistema_citas')
  .then(async () => {
    console.log('✅ Conectado a MongoDB');
    
    const User = require('./src/models/User');
    
    // Crear Cliente
    await User.deleteOne({ email: 'cliente@test.com' });
    const cliente = new User({
      nombre: 'Cliente Test',
      email: 'cliente@test.com',
      password: '123456',
      rol: 'cliente',
      telefono: '3001234567',
      disponible: true
    });
    await cliente.save();
    console.log('✅ Cliente creado: cliente@test.com / 123456');
    
    // Crear Profesional
    await User.deleteOne({ email: 'profesional@test.com' });
    const profesional = new User({
      nombre: 'Dr. Juan Perez',
      email: 'profesional@test.com',
      password: '123456',
      rol: 'profesional',
      especialidad: 'Medicina General',
      telefono: '3007654321',
      disponible: true,
      horario_atencion: { inicio: '09:00', fin: '18:00', duracion_cita: 90 }
    });
    await profesional.save();
    console.log('✅ Profesional creado: profesional@test.com / 123456');
    
    console.log('\n📋 USUARIOS CREADOS:');
    console.log('👑 Admin: admin@test.com / admin123');
    console.log('🧑 Cliente: cliente@test.com / 123456');
    console.log('👨‍⚕️ Profesional: profesional@test.com / 123456');
    
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
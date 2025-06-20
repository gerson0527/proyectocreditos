const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../models');
const User = db.User;

exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Usar findOne de Sequelize con where clause
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    // 1. Generar JWT de acceso (15-30 min de vida)
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 2. Generar Refresh Token (válido por 7 días, guardado en DB)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Guardar refreshToken en la base de datos usando método de Sequelize
    await user.update({ refreshToken });

    // 3. Enviar tokens en cookies HttpOnly (seguras)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true, // Solo en HTTPS
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 15 min
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    // 4. Responder con datos no sensibles del usuario
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error al iniciar sesión" 
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // Obtener el token de la cookie
    const accessToken = req.cookies.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "No hay sesión activa"
      });
    }

    try {
      // Decodificar el token para obtener el ID del usuario
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Limpiar el refreshToken en la base de datos
      await User.update(
        { refreshToken: null },
        { where: { id: userId } }
      );

      // Limpiar las cookies
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });

      res.json({
        success: true,
        message: "Sesión cerrada exitosamente"
      });
    } catch (tokenError) {
      // Si el token es inválido, solo limpiamos las cookies
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });

      return res.status(200).json({
        success: true,
        message: "Cookies limpiadas exitosamente"
      });
    }
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: "Error al cerrar sesión"
    });
  }
};
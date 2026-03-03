const User = require('../models/User');

// @desc    Register a HOD account (requires secret code)
// @route   POST /api/auth/register-hod
// @access  Public (secret-code-gated)
const registerHOD = async (req, res) => {
  try {
    const { name, email, password, secretCode } = req.body;

    // Validate secret code
    if (!secretCode || secretCode !== process.env.HOD_SECRET_CODE) {
      return res.status(403).json({ message: 'Invalid secret code. HOD registration denied.' });
    }

    // Check if email already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create HOD user
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('RegisterHOD error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    HOD creates an account for another user (mentor, student, itr_coordinator)
// @route   POST /api/auth/create-user
// @access  Private (HOD/admin only)
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      enrollmentNumber,
      rollNumber,
      department,
      division,
      className,
      academicYear,
    } = req.body;

    // HOD cannot create another admin account through this route
    if (role === 'admin') {
      return res.status(403).json({ message: 'Cannot create another HOD account via this route.' });
    }

    const allowedRoles = ['mentor', 'student', 'itr_coordinator'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` });
    }

    // Validate enrollment number for students
    if (role === 'student') {
      if (!enrollmentNumber) {
        return res.status(400).json({ message: 'Enrollment number is required for students' });
      }
      // Check if a student with this enrollment number already exists (ensure uniqueness)
      const existingStudentByEnrollment = await User.findOne({ enrollmentNumber, role: 'student' });
      if (existingStudentByEnrollment) {
        return res.status(400).json({ message: 'A student account with this enrollment number already exists' });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      enrollmentNumber,
      rollNumber,
      department,
      division,
      className,
      academicYear,
    });

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        enrollmentNumber: user.enrollmentNumber,
        rollNumber: user.rollNumber,
        division: user.division,
      },
    });
  } catch (error) {
    console.error('CreateUser error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if role matches
    if (role && user.role !== role) {
      return res.status(401).json({ message: `Invalid credentials for role '${role}'` });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        enrollmentNumber: user.enrollmentNumber,
        rollNumber: user.rollNumber,
        division: user.division,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('groupId');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Forgot password (placeholder)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // TODO: Implement email service for password reset
    console.log(`Password reset requested for: ${email}`);

    res.json({
      success: true,
      message: 'Password reset link sent to email (placeholder)',
    });
  } catch (error) {
    console.error('ForgotPassword error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerHOD,
  createUser,
  login,
  getMe,
  forgotPassword,
};

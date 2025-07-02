import { Router } from 'itty-router';

const router = Router();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
router.options('*', () => new Response(null, { headers: corsHeaders }));

// Helper function to add CORS headers to response
function addCorsHeaders(response) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Simple hash function for passwords (in production, use proper hashing)
async function simpleHash(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Middleware for authentication
async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const session = await env.DB.prepare(
    'SELECT s.*, u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime("now")'
  ).bind(token).first();
  
  return session;
}

// Generate simple UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Authentication routes
router.post('/api/auth/login', async (request, env) => {
  try {
    const { username, password } = await request.json();
    
    const user = await env.DB.prepare('SELECT * FROM users WHERE username = ? OR email = ?').bind(username, username).first();
    
    // Simple password check (in production, use proper password verification)
    const hashedPassword = await simpleHash(password);
    if (!user || user.password_hash !== hashedPassword) {
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    
    // Create session
    const sessionId = generateUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').bind(sessionId, user.id, expiresAt).run();
    
    return addCorsHeaders(new Response(JSON.stringify({
      token: sessionId,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

router.post('/api/auth/logout', async (request, env) => {
  const user = await authenticate(request, env);
  if (user) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader.substring(7);
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
  }
  
  return addCorsHeaders(new Response(JSON.stringify({ message: 'Logged out' }), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

// Get current user
router.get('/api/auth/me', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  
  return addCorsHeaders(new Response(JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

// Classes routes
router.get('/api/classes', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }));
  }
  
  let query = `
    SELECT c.*, g.name as grade_name, s.name as subject_name, s.code as subject_code,
           u.first_name as teacher_first_name, u.last_name as teacher_last_name
    FROM classes c
    JOIN grades g ON c.grade_id = g.id
    JOIN subjects s ON c.subject_id = s.id
    JOIN users u ON c.teacher_id = u.id
  `;
  
  if (user.role === 'teacher') {
    query += ' WHERE c.teacher_id = ?';
    const classes = await env.DB.prepare(query).bind(user.id).all();
    return addCorsHeaders(new Response(JSON.stringify(classes.results || []), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } else {
    const classes = await env.DB.prepare(query).all();
    return addCorsHeaders(new Response(JSON.stringify(classes.results || []), {
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

// Students in a class
router.get('/api/classes/:classId/students', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }));
  }
  
  const { classId } = request.params;
  
  // Check if teacher can access this class
  if (user.role === 'teacher') {
    const classCheck = await env.DB.prepare('SELECT * FROM classes WHERE id = ? AND teacher_id = ?').bind(classId, user.id).first();
    if (!classCheck) {
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
    }
  }
  
  const students = await env.DB.prepare(`
    SELECT s.*, g.name as grade_name, ce.enrollment_date, ce.status as enrollment_status
    FROM students s
    JOIN class_enrollments ce ON s.id = ce.student_id
    JOIN grades g ON s.grade_id = g.id
    WHERE ce.class_id = ? AND ce.status = 'active'
    ORDER BY s.last_name, s.first_name
  `).bind(classId).all();
  
  return addCorsHeaders(new Response(JSON.stringify(students.results || []), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

// Get attendance for a class and date
router.get('/api/attendance/:classId/:date', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }));
  }
  
  const { classId, date } = request.params;
  
  // Check if teacher can access this class
  if (user.role === 'teacher') {
    const classCheck = await env.DB.prepare('SELECT * FROM classes WHERE id = ? AND teacher_id = ?').bind(classId, user.id).first();
    if (!classCheck) {
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
    }
  }
  
  const attendance = await env.DB.prepare(`
    SELECT a.*, s.first_name, s.last_name, s.student_id
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE a.class_id = ? AND a.date = ?
    ORDER BY s.last_name, s.first_name
  `).bind(classId, date).all();
  
  return addCorsHeaders(new Response(JSON.stringify(attendance.results || []), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

// Record/update attendance
router.post('/api/attendance', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }));
  }
  
  const { records } = await request.json();
  
  try {
    for (const record of records) {
      const { student_id, class_id, date, status, notes } = record;
      
      // Check if teacher can access this class
      if (user.role === 'teacher') {
        const classCheck = await env.DB.prepare('SELECT * FROM classes WHERE id = ? AND teacher_id = ?').bind(class_id, user.id).first();
        if (!classCheck) {
          continue;
        }
      }
      
      // Check if record exists
      const existing = await env.DB.prepare('SELECT * FROM attendance WHERE student_id = ? AND class_id = ? AND date = ?').bind(student_id, class_id, date).first();
      
      if (existing) {
        // Update existing record
        await env.DB.prepare(`
          UPDATE attendance 
          SET status = ?, notes = ?, recorded_by = ?, updated_at = datetime('now')
          WHERE student_id = ? AND class_id = ? AND date = ?
        `).bind(status, notes || '', user.id, student_id, class_id, date).run();
      } else {
        // Insert new record
        await env.DB.prepare(`
          INSERT INTO attendance (student_id, class_id, date, status, notes, recorded_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(student_id, class_id, date, status, notes || '', user.id).run();
      }
    }
    
    return addCorsHeaders(new Response(JSON.stringify({ message: 'Attendance recorded successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to record attendance' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

// Admin routes - Students management
router.get('/api/admin/students', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const students = await env.DB.prepare(`
    SELECT s.*, g.name as grade_name
    FROM students s
    JOIN grades g ON s.grade_id = g.id
    ORDER BY s.last_name, s.first_name
  `).all();
  
  return addCorsHeaders(new Response(JSON.stringify(students.results || []), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

router.post('/api/admin/students', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const student = await request.json();
  
  try {
    const result = await env.DB.prepare(`
      INSERT INTO students (student_id, first_name, last_name, email, phone, grade_id, date_of_birth, parent_name, parent_phone, parent_email, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      student.student_id,
      student.first_name,
      student.last_name,
      student.email,
      student.phone,
      student.grade_id,
      student.date_of_birth,
      student.parent_name,
      student.parent_phone,
      student.parent_email,
      student.address
    ).run();
    
    return addCorsHeaders(new Response(JSON.stringify({ id: result.meta.last_row_id, message: 'Student created successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to create student' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

// Update student
router.put('/api/admin/students/:id', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const { id } = request.params;
  const student = await request.json();
  
  try {
    await env.DB.prepare(`
      UPDATE students 
      SET student_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, grade_id = ?, 
          date_of_birth = ?, parent_name = ?, parent_phone = ?, parent_email = ?, address = ?, 
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      student.student_id,
      student.first_name,
      student.last_name,
      student.email,
      student.phone,
      student.grade_id,
      student.date_of_birth,
      student.parent_name,
      student.parent_phone,
      student.parent_email,
      student.address,
      id
    ).run();
    
    return addCorsHeaders(new Response(JSON.stringify({ message: 'Student updated successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to update student' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

// Delete student
router.delete('/api/admin/students/:id', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const { id } = request.params;
  
  try {
    // First delete related attendance records
    await env.DB.prepare('DELETE FROM attendance WHERE student_id = ?').bind(id).run();
    
    // Delete class enrollments
    await env.DB.prepare('DELETE FROM class_enrollments WHERE student_id = ?').bind(id).run();
    
    // Finally delete the student
    await env.DB.prepare('DELETE FROM students WHERE id = ?').bind(id).run();
    
    return addCorsHeaders(new Response(JSON.stringify({ message: 'Student deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to delete student' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

// Bulk import students from CSV
router.post('/api/admin/students/import', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const { students } = await request.json();
  
  try {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const student of students) {
      try {
        await env.DB.prepare(`
          INSERT INTO students (student_id, first_name, last_name, email, phone, grade_id, date_of_birth, parent_name, parent_phone, parent_email, address)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          student.student_id,
          student.first_name,
          student.last_name,
          student.email || null,
          student.phone || null,
          student.grade_id,
          student.date_of_birth || null,
          student.parent_name || null,
          student.parent_phone || null,
          student.parent_email || null,
          student.address || null
        ).run();
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Row ${students.indexOf(student) + 1}: ${error.message}`);
      }
    }
    
    return addCorsHeaders(new Response(JSON.stringify({ 
      message: `Import completed. ${successCount} students imported, ${errorCount} errors.`,
      successCount,
      errorCount,
      errors 
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to import students' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

// Class management endpoints
router.get('/api/admin/classes', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const classes = await env.DB.prepare(`
    SELECT c.*, g.name as grade_name, s.name as subject_name, s.code as subject_code,
           u.first_name as teacher_first_name, u.last_name as teacher_last_name
    FROM classes c
    JOIN grades g ON c.grade_id = g.id
    JOIN subjects s ON c.subject_id = s.id
    JOIN users u ON c.teacher_id = u.id
    ORDER BY c.name
  `).all();
  
  return addCorsHeaders(new Response(JSON.stringify(classes.results || []), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

router.post('/api/admin/classes', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const cls = await request.json();
  
  try {
    const result = await env.DB.prepare(`
      INSERT INTO classes (name, grade_id, subject_id, teacher_id, room, schedule_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      cls.name,
      cls.grade_id,
      cls.subject_id,
      cls.teacher_id,
      cls.room,
      cls.schedule_time
    ).run();
    
    return addCorsHeaders(new Response(JSON.stringify({ id: result.meta.last_row_id, message: 'Class created successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to create class' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

// Update class
router.put('/api/admin/classes/:id', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const { id } = request.params;
  const cls = await request.json();
  
  try {
    await env.DB.prepare(`
      UPDATE classes 
      SET name = ?, grade_id = ?, subject_id = ?, teacher_id = ?, room = ?, schedule_time = ?
      WHERE id = ?
    `).bind(
      cls.name,
      cls.grade_id,
      cls.subject_id,
      cls.teacher_id,
      cls.room,
      cls.schedule_time,
      id
    ).run();
    
    return addCorsHeaders(new Response(JSON.stringify({ message: 'Class updated successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to update class' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

// Get class enrollments
router.get('/api/admin/classes/:id/enrollments', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const { id } = request.params;
  
  const enrollments = await env.DB.prepare(`
    SELECT s.*, g.name as grade_name, ce.enrollment_date, ce.status as enrollment_status
    FROM students s
    JOIN class_enrollments ce ON s.id = ce.student_id
    JOIN grades g ON s.grade_id = g.id
    WHERE ce.class_id = ?
    ORDER BY s.last_name, s.first_name
  `).bind(id).all();
  
  return addCorsHeaders(new Response(JSON.stringify(enrollments.results || []), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

// Add student to class
router.post('/api/admin/classes/:id/enrollments', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const { id } = request.params;
  const { student_id } = await request.json();
  
  try {
    await env.DB.prepare(`
      INSERT INTO class_enrollments (student_id, class_id, enrollment_date, status)
      VALUES (?, ?, date('now'), 'active')
    `).bind(student_id, id).run();
    
    return addCorsHeaders(new Response(JSON.stringify({ message: 'Student enrolled successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to enroll student' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

// Remove student from class
router.delete('/api/admin/classes/:id/enrollments/:studentId', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const { id, studentId } = request.params;
  
  try {
    await env.DB.prepare(`
      DELETE FROM class_enrollments 
      WHERE class_id = ? AND student_id = ?
    `).bind(id, studentId).run();
    
    return addCorsHeaders(new Response(JSON.stringify({ message: 'Student removed from class successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to remove student from class' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

// Get teacher's classes
router.get('/api/users/:id/classes', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const { id } = request.params;
  
  const classes = await env.DB.prepare(`
    SELECT c.*, g.name as grade_name, s.name as subject_name, s.code as subject_code,
           COUNT(ce.student_id) as student_count
    FROM classes c
    JOIN grades g ON c.grade_id = g.id
    JOIN subjects s ON c.subject_id = s.id
    LEFT JOIN class_enrollments ce ON c.id = ce.class_id AND ce.status = 'active'
    WHERE c.teacher_id = ?
    GROUP BY c.id
    ORDER BY c.name
  `).bind(id).all();
  
  return addCorsHeaders(new Response(JSON.stringify(classes.results || []), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

// Get student attendance details
router.get('/api/admin/student-attendance/:studentId', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const { studentId } = request.params;
  const url = new URL(request.url);
  const startDate = url.searchParams.get('start_date');
  const endDate = url.searchParams.get('end_date');
  const classId = url.searchParams.get('class_id');
  
  let query = `
    SELECT a.*, c.name as class_name, s.name as subject_name, u.first_name as teacher_first_name, u.last_name as teacher_last_name
    FROM attendance a
    JOIN classes c ON a.class_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    JOIN users u ON c.teacher_id = u.id
    WHERE a.student_id = (SELECT id FROM students WHERE student_id = ?)
  `;
  
  let bindings = [studentId];
  
  if (startDate && endDate) {
    query += ' AND a.date BETWEEN ? AND ?';
    bindings.push(startDate, endDate);
  }
  
  if (classId) {
    query += ' AND a.class_id = ?';
    bindings.push(classId);
  }
  
  query += ' ORDER BY a.date DESC, c.name';
  
  const attendanceRecords = await env.DB.prepare(query).bind(...bindings).all();
  
  // Also get student info
  const studentInfo = await env.DB.prepare(`
    SELECT s.*, g.name as grade_name
    FROM students s
    JOIN grades g ON s.grade_id = g.id
    WHERE s.student_id = ?
  `).bind(studentId).first();
  
  return addCorsHeaders(new Response(JSON.stringify({
    student: studentInfo,
    attendance: attendanceRecords.results || []
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

// User management endpoints
router.get('/api/admin/users', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const users = await env.DB.prepare(`
    SELECT id, username, email, role, first_name, last_name, created_at, updated_at
    FROM users
    ORDER BY last_name, first_name
  `).all();
  
  return addCorsHeaders(new Response(JSON.stringify(users.results || []), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

router.post('/api/admin/users', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const newUser = await request.json();
  
  try {
    const hashedPassword = await simpleHash(newUser.password);
    
    const result = await env.DB.prepare(`
      INSERT INTO users (username, email, password_hash, role, first_name, last_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      newUser.username,
      newUser.email,
      hashedPassword,
      newUser.role,
      newUser.first_name,
      newUser.last_name
    ).run();
    
    return addCorsHeaders(new Response(JSON.stringify({ id: result.meta.last_row_id, message: 'User created successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to create user' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

// Get grades and subjects for dropdowns
router.get('/api/grades', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }));
  }
  
  const grades = await env.DB.prepare('SELECT * FROM grades ORDER BY name').all();
  return addCorsHeaders(new Response(JSON.stringify(grades.results || []), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

router.get('/api/subjects', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }));
  }
  
  const subjects = await env.DB.prepare('SELECT * FROM subjects ORDER BY name').all();
  return addCorsHeaders(new Response(JSON.stringify(subjects.results || []), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

// Reports - Attendance summary
router.get('/api/reports/attendance-summary', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  const url = new URL(request.url);
  const startDate = url.searchParams.get('start_date');
  const endDate = url.searchParams.get('end_date');
  const classId = url.searchParams.get('class_id');
  
  let query = `
    SELECT 
      s.student_id,
      s.first_name,
      s.last_name,
      c.name as class_name,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
      COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
      COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
      COUNT(CASE WHEN a.status = 'excused' THEN 1 END) as excused_count,
      COUNT(CASE WHEN a.status = 'early_leave' THEN 1 END) as early_leave_count,
      COUNT(*) as total_days
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN classes c ON a.class_id = c.id
    WHERE a.date BETWEEN ? AND ?
  `;
  
  let bindings = [startDate, endDate];
  
  if (classId) {
    query += ' AND a.class_id = ?';
    bindings.push(classId);
  }
  
  query += ' GROUP BY s.id, c.id ORDER BY s.last_name, s.first_name';
  
  const summary = await env.DB.prepare(query).bind(...bindings).all();
  
  return addCorsHeaders(new Response(JSON.stringify(summary.results || []), {
    headers: { 'Content-Type': 'application/json' }
  }));
});

// Dashboard statistics
router.get('/api/admin/dashboard-stats', async (request, env) => {
  const user = await authenticate(request, env);
  if (!user || user.role !== 'admin') {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 }));
  }
  
  try {
    // Get total students
    const studentsResult = await env.DB.prepare('SELECT COUNT(*) as count FROM students WHERE status = "active"').first();
    const totalStudents = studentsResult.count;
    
    // Get total classes
    const classesResult = await env.DB.prepare('SELECT COUNT(*) as count FROM classes').first();
    const totalClasses = classesResult.count;
    
    // Get total teachers
    const teachersResult = await env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE role = "teacher"').first();
    const totalTeachers = teachersResult.count;
    
    // Get today's attendance rate
    const today = new Date().toISOString().split('T')[0];
    const todayAttendanceResult = await env.DB.prepare(`
      SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(*) as total
      FROM attendance 
      WHERE date = ?
    `).bind(today).first();
    
    const todayAttendanceRate = todayAttendanceResult.total > 0 
      ? Math.round((todayAttendanceResult.present / todayAttendanceResult.total) * 100)
      : 0;
    
    return addCorsHeaders(new Response(JSON.stringify({
      totalStudents,
      totalClasses,
      totalTeachers,
      todayAttendance: todayAttendanceRate
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to get dashboard stats' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
});

// Handle 404
router.all('*', () => addCorsHeaders(new Response('Not Found', { status: 404 })));

export default {
  fetch: (request, env, ctx) => router.handle(request, env, ctx)
}; 
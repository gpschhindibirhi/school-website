if (response.ok) {
  const data = await response.json();
  localStorage.setItem('role', data.role); // 'teacher' or 'student'
  alert('Login successful!');
  window.location.href = 'index.html';
}

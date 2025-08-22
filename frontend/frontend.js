// Check if user is logged in
function isLoggedIn() {
  return !!localStorage.getItem('token');
}

// Redirect to login if not logged in
function requireLogin() {
  if (!isLoggedIn()) {
    alert("Please login first");
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// --- Register ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: registerForm.name.value,
      email: registerForm.email.value,
      password: registerForm.password.value
    };
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Registration failed');
      alert('Registration successful! Please login.');
      window.location.href = 'login.html';
    } catch (err) {
      alert(err.message);
    }
  });
}

// --- Login ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      email: loginForm.email.value,
      password: loginForm.password.value
    };
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Login failed');
      localStorage.setItem('token', result.token);
      window.location.href = 'index.html';
    } catch (err) {
      alert(err.message);
    }
  });
}

// --- Fetch all travel options ---
async function fetchTravelOptions() {
  try {
    const res = await fetch('/travel');
    const data = await res.json();
    const container = document.getElementById('travelOptions');
    if (!container) return;
    container.innerHTML = '';
    data.forEach(t => {
      const div = document.createElement('div');
      div.innerHTML = `
        <p><b>${t.type}</b> | From: ${t.source} | To: ${t.destination} | Departure: ${t.departure_time} | Seats: ${t.available_seats} | Price: ${t.price}</p>
        <button class="book-btn" onclick="bookTravel(${t.id})">Book</button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}

// --- Book travel ---
async function bookTravel(travelId) {
  if (!isLoggedIn()) {
    alert("Please login or register first");
    window.location.href = 'login.html';
    return;
  }
  const seats = prompt("Enter number of seats:");
  if (!seats || isNaN(seats) || seats < 1) return;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/bookings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ travel_option_id: travelId, num_seats: parseInt(seats) })
    });
    if (!res.ok) throw new Error('Booking failed');
    alert("Booking confirmed!");
  } catch (err) {
    alert(err.message);
  }
}

// --- Fetch user bookings ---
async function fetchMyBookings() {
  if (!requireLogin()) return;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/bookings', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const bookings = await res.json();
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';
    bookings.forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${b.type}</td>
        <td>${b.source}</td>
        <td>${b.destination}</td>
        <td>${b.departure_time}</td>
        <td>${b.num_seats}</td>
        <td>${b.total_price}</td>
        <td>${b.status}</td>
        <td>${b.status === 'Confirmed' ? `<button onclick="cancelBooking(${b.booking_id})">Cancel</button>` : ''}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    alert(err.message);
  }
}

// --- Cancel booking ---
async function cancelBooking(id) {
  if (!requireLogin()) return;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/bookings/cancel/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Cancel failed');
    alert('Booking cancelled!');
    fetchMyBookings();
  } catch (err) {
    alert(err.message);
  }
}

// Auto fetch travel options on index.html
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('travelOptions')) fetchTravelOptions();
  if (document.getElementById('bookingsTableBody')) fetchMyBookings();
});
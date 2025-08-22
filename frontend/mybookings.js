document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first.');
      window.location.href = '/login.html';
      return;
    }
  
    try {
      const res = await fetch('/bookings', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
  
      if (!res.ok) throw new Error('Failed to fetch bookings');
  
      const bookings = await res.json();
      const tbody = document.querySelector('#bookingsTable tbody');
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
          <td>
            ${b.status === 'Confirmed' ? `<button onclick="cancelBooking(${b.booking_id})">Cancel</button>` : ''}
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      alert(err.message);
    }
  });
  
  async function cancelBooking(bookingId) {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/bookings/cancel/${bookingId}`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) throw new Error('Failed to cancel booking');
      alert('Booking cancelled successfully');
      location.reload();
    } catch (err) {
      alert(err.message);
    }
  }
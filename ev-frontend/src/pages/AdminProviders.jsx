import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    setError(null);
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/providers/pending', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      }).then(data => setProviders(data)).catch(err => setError('Load failed: ' + err.message));
  };

  useEffect(() => { load(); }, []);

  const approve = (id) => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/providers/' + id + '/approve', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } })
      .then(res => {
        if (!res.ok) throw new Error('Failed: ' + res.status);
        load();
      }).catch(err => setError('Approve failed: ' + err.message));
  };

  return (
    <div style={{maxWidth:900,margin:'24px auto'}}>
      <h2>Pending Providers</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th>Name</th><th>Email</th><th>Organization</th><th>Action</th></tr></thead>
        <tbody>
          {providers.map(p=> (
            <tr key={p.id} style={{borderTop:'1px solid #ddd'}}>
              <td>{p.name}</td>
              <td>{p.email}</td>
              <td>{p.organization}</td>
              <td><button onClick={()=>approve(p.id)}>Approve</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{marginTop:12}}><button onClick={()=>navigate('/admin')}>Back to Admin</button></div>
    </div>
  );
};

export default AdminProviders;


import Layout from '../components/Layout'
import { useUser } from '../context/userContext'
import cookie from 'js-cookie';

export default function Order() {
  const { user, setUser, googleLogin } = useUser()
  const token = cookie.get("firebaseToken")
  const fetchData = async () => {
      const req = await fetch('/api/orders/AddOrder', { 
        method: 'POST',
        body: JSON.stringify({
              "firstName": "jake",
              "lastName": "son",
              "address": "2310 blake",
              "emailAddress": "jakeson",
              "calID": "100",
              "deliveryDate":"08/10"
        }),
        headers: {'Content-Type': "application/json", 'Authorization': token}});
        const newData = await req.json();
        console.log(newData)
  };

  const handleClick = (event) => {
      event.preventDefault();
      fetchData();
  };

  return (
    <Layout>
      <button onClick={handleClick}>FETCH DATA</button>
    </Layout>
  );
}
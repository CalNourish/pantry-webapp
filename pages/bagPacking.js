import Layout from "../components/Layout";
import useSWR from "swr";
import React from "react";
import { useUser } from '../context/userContext'

const fetcher = async (url, token) => {
  const NOT_AUTHORIZED_MESSAGE = "Sorry, you are not authorized to view this page."
  if (!token) {
    throw new Error(NOT_AUTHORIZED_MESSAGE);
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: token
  };

  const response = await fetch(url, { headers });

  if (response.status === 401) {
    throw new Error(NOT_AUTHORIZED_MESSAGE);
  }

  return response.json();
};

class PackingOrders extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      orders: props.orders
    };
  }

  // Permanently deletes order
  deleteOrder(orderId) {
    if (window.confirm("Delete this order?")) {
      fetch("/api/orders/DeleteOrder", {
        method: "POST",
        body: JSON.stringify({
          orderId: orderId,
        }),
        headers: { "Content-Type": "application/json", Authorization: this.props.user.authToken },
      }).then(() => {
        this.setState({
          orders: this.props.orders.filter(function (order) {
            return order.id !== orderId;
          }),
        });
      });
    }
  }

  displayOrderRow(order, delivery) {
    if (delivery && !order.isPickup) {
      return (
        <tr className="h-10" key={order.id}>
          <td className="w-auto">
            <a href={order.url}>{order.name}</a>
          </td>
          <td className="w-auto">{order.numBags}</td>
          <td className="w-auto">{order.date}</td>
          <td className="w-auto">{order.deliveryWindow}</td>
          <td className="w-auto">{order.status}</td>
          <td className="w-auto">
            <button
              className="font-bold text-xl w-5 h-5"
              onClick={() => this.deleteOrder(order.id)}
            >
              <img src="/images/trash-can.svg"></img>
              {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> */}
            </button>
          </td>
        </tr>
      );
    } else if (!delivery && order.isPickup) {
        return (
          <tr className="h-10" key={order.id}>
            <td className="w-auto">
              <a href={order.url}>{order.name}</a>
            </td>
            <td className="w-auto">{order.numBags}</td>
            <td className="w-auto">{order.date}</td>
            <td className="w-auto">{order.status}</td>
            <td className="w-auto">
              <button
                className="font-bold text-xl w-5 h-5"
                onClick={() => this.deleteOrder(order.id)}
              >
                <img src="/images/trash-can.svg"></img>
                {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> */}
              </button>
            </td>
          </tr>
        );
    }
  }

  render() {
    return (
      <>
        <Layout pageName="Orders">
          <div className="flex justify-center items-center">
            <div className="w-4/5 p-5">
              <h1 className="text-3xl font-medium mb-2">Delivery</h1>
              <table className="w-full items-stretch" id="orders">
                <thead>
                  <tr className="border-b-2">
                    <th className="w-1/5 text-left">Name</th>
                    <th className="w-1/5 text-left">Number of Bags</th>
                    <th className="w-1/5 text-left">Delivery Date</th>
                    <th className="w-1/5 text-left">Delivery Window</th>
                    <th className="w-1/5 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {this.props.orders.map((order) =>
                    this.displayOrderRow(order, true)
                  )}
                </tbody>
              </table>
              <br></br>
              <h1 className="text-3xl font-medium mb-2">Pick-up</h1>
              <table className="w-full items-stretch" id="orders">
                <thead>
                  <tr className="border-b-2">
                    <th className="w-1/5 text-left">Name</th>
                    <th className="w-1/5 text-left">Number of Bags</th>
                    <th className="w-2/5 text-left">Pickup Date</th>
                    <th className="w-1/5 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {this.props.orders.map((order) =>
                    this.displayOrderRow(order, false)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Layout>
      </>
    );
  }
}

const createOrderObjects = (results) => {
  var orderObjects = [];

  if (results == null) {
    return orderObjects;
  }

  Object.entries(results).forEach((entry) => {
    const orderObj = new Object();
    const [key, value] = entry;

    orderObj.id = key;

    if (value.firstName && value.lastInitial) {
      orderObj.name = value.firstName + " " + value.lastInitial;
    } else if (value.firstName) {
      orderObj.name = value.firstName;
    } else {
      orderObj.name = "N/A";
    }

    orderObj.date = value.date ? value.date : "N/A";
    orderObj.isPickup = value.isPickup;
    orderObj.deliveryWindow = value.deliveryWindow
      ? value.deliveryWindow
      : "N/A";
    orderObj.numBags = value.numBags ? value.numBags : 1;
    orderObj.status = value.status ? value.status : "No status available";
    orderObj.url = "/packingDetailed?orderid=" + key;
    orderObjects.push(orderObj);
  });

  return orderObjects;
};

export default function PackingOverview() {
  const { user, loadingUser } = useUser();
  const { data, error } = useSWR(["/api/orders/GetAllOrders/", user?.authToken], fetcher);

  if (loadingUser) {
    return (
      <Layout pageName="Bag Packing">
          <h1 className='text-xl m-6'>Loading...</h1>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout pageName="Bag Packing">
          <h1 className='text-xl m-6'>{error}</h1>
      </Layout>
    )
  }
  
  if (!data) {
    return <PackingOrders user={user} orders={[]} key="emptyTable" />;
  } else {
    const orderObjects = createOrderObjects(data);
    return <PackingOrders user={user} orders={orderObjects} key="nonemptyTable" />;
  }
}
